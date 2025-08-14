import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, Car, Image, Settings, FileText, Link, Palette } from "lucide-react";
import type { VehicleSpecification, InsertVehicleSpecification, VehicleImageLink, InsertVehicleImageLink } from "@shared/schema";

// Schemas for form validation
const specificationFormSchema = z.object({
  manufacturer: z.string().optional(),
  category: z.string().optional(),
  trimLevel: z.string().optional(),
  year: z.number().optional(),
  engineCapacity: z.string().optional(),
  chassisNumber: z.string().optional(),
  specifications: z.string().min(1, "المواصفات مطلوبة"),
  specificationsEn: z.string().optional(),
});

const imageLinkFormSchema = z.object({
  manufacturer: z.string().optional(),
  category: z.string().optional(),
  trimLevel: z.string().optional(),
  year: z.number().optional(),
  engineCapacity: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  chassisNumber: z.string().optional(),
  imageUrl: z.string().url("رابط الصورة غير صحيح"),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
});

type SpecificationFormData = z.infer<typeof specificationFormSchema>;
type ImageLinkFormData = z.infer<typeof imageLinkFormSchema>;

// Sample data for dropdowns
const manufacturerOptions = [
  "تويوتا", "نيسان", "هيونداي", "كيا", "مازدا", "هوندا", "فولكسفاغن", "شيفروليه", "فورد", "بي إم دبليو", "مرسيدس", "أودي", "جيب", "لكزس", "انفينيتي", "أكورا"
];

const categoryOptions = [
  "سيدان", "SUV", "هاتشباك", "كوبيه", "كروس أوفر", "بيك آب", "فان", "كابريو"
];

const trimLevelOptions = [
  "Base", "GL", "GLS", "GLX", "SE", "SEL", "Limited", "Premium", "Sport", "Luxury"
];

const yearOptions = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

const engineCapacityOptions = [
  "1.0L", "1.2L", "1.4L", "1.5L", "1.6L", "1.8L", "2.0L", "2.2L", "2.4L", "2.5L", "2.7L", "3.0L", "3.5L", "4.0L", "4.5L", "5.0L"
];

const colorOptions = [
  "أبيض", "أسود", "فضي", "رمادي", "أحمر", "أزرق", "أخضر", "بني", "ذهبي", "برتقالي", "أصفر", "بنفسجي", "وردي", "بيج"
];

export default function SpecificationsManagement() {
  const [activeTab, setActiveTab] = useState("specifications");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<VehicleSpecification | null>(null);
  const [editingImage, setEditingImage] = useState<VehicleImageLink | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch specifications
  const { data: specifications = [], isLoading: specsLoading } = useQuery({
    queryKey: ['/api/vehicle-specifications'],
  });

  // Fetch image links
  const { data: imageLinks = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/vehicle-image-links'],
  });

  // Fetch inventory items for chassis numbers
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['/api/inventory'],
  });

  // Forms
  const specForm = useForm<SpecificationFormData>({
    resolver: zodResolver(specificationFormSchema),
    defaultValues: {
      manufacturer: "",
      category: "",
      trimLevel: "",
      year: undefined,
      engineCapacity: "",
      chassisNumber: "",
      specifications: "",
      specificationsEn: "",
    },
  });

  const imageForm = useForm<ImageLinkFormData>({
    resolver: zodResolver(imageLinkFormSchema),
    defaultValues: {
      manufacturer: "",
      category: "",
      trimLevel: "",
      year: undefined,
      engineCapacity: "",
      exteriorColor: "",
      interiorColor: "",
      chassisNumber: "",
      imageUrl: "",
      description: "",
      descriptionEn: "",
    },
  });

  // Create/Update specification mutation
  const specMutation = useMutation({
    mutationFn: async (data: SpecificationFormData) => {
      const url = editingSpec ? `/api/vehicle-specifications/${editingSpec.id}` : '/api/vehicle-specifications';
      const method = editingSpec ? 'PUT' : 'POST';
      return apiRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-specifications'] });
      setIsSpecDialogOpen(false);
      setEditingSpec(null);
      specForm.reset();
      toast({
        title: "تم بنجاح",
        description: editingSpec ? "تم تحديث المواصفات" : "تم إضافة المواصفات",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ المواصفات",
        variant: "destructive",
      });
    },
  });

  // Create/Update image link mutation
  const imageMutation = useMutation({
    mutationFn: async (data: ImageLinkFormData) => {
      const url = editingImage ? `/api/vehicle-image-links/${editingImage.id}` : '/api/vehicle-image-links';
      const method = editingImage ? 'PUT' : 'POST';
      return apiRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-image-links'] });
      setIsImageDialogOpen(false);
      setEditingImage(null);
      imageForm.reset();
      toast({
        title: "تم بنجاح",
        description: editingImage ? "تم تحديث رابط الصورة" : "تم إضافة رابط الصورة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ رابط الصورة",
        variant: "destructive",
      });
    },
  });

  // Delete specification mutation
  const deleteSpecMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/vehicle-specifications/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-specifications'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المواصفات بنجاح",
      });
    },
  });

  // Delete image link mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/vehicle-image-links/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-image-links'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف رابط الصورة بنجاح",
      });
    },
  });

  const onSubmitSpec = (data: SpecificationFormData) => {
    specMutation.mutate(data);
  };

  const onSubmitImage = (data: ImageLinkFormData) => {
    imageMutation.mutate(data);
  };

  const handleEditSpec = (spec: VehicleSpecification) => {
    setEditingSpec(spec);
    specForm.reset({
      manufacturer: spec.manufacturer || "",
      category: spec.category || "",
      trimLevel: spec.trimLevel || "",
      year: spec.year || undefined,
      engineCapacity: spec.engineCapacity || "",
      chassisNumber: spec.chassisNumber || "",
      specifications: spec.specifications || "",
      specificationsEn: spec.specificationsEn || "",
    });
    setIsSpecDialogOpen(true);
  };

  const handleEditImage = (image: VehicleImageLink) => {
    setEditingImage(image);
    imageForm.reset({
      manufacturer: image.manufacturer || "",
      category: image.category || "",
      trimLevel: image.trimLevel || "",
      year: image.year || undefined,
      engineCapacity: "",
      exteriorColor: image.exteriorColor || "",
      interiorColor: image.interiorColor || "",
      chassisNumber: image.chassisNumber || "",
      imageUrl: image.imageUrl || "",
      description: image.description || "",
      descriptionEn: image.descriptionEn || "",
    });
    setIsImageDialogOpen(true);
  };

  const filteredSpecs = (specifications as VehicleSpecification[]).filter((spec: VehicleSpecification) =>
    !searchTerm ||
    spec.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.trimLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredImages = (imageLinks as VehicleImageLink[]).filter((image: VehicleImageLink) =>
    !searchTerm ||
    image.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.trimLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/20 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-700/30 p-6 shadow-lg shadow-amber-100/50 dark:shadow-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 dark:bg-gradient-to-br dark:from-amber-900/50 dark:to-yellow-900/50 rounded-xl border border-amber-200 dark:border-amber-700/50">
                <Settings className="w-7 h-7 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 dark:from-amber-300 dark:to-yellow-200 bg-clip-text text-transparent">إدارة المواصفات والصور</h1>
                <p className="text-amber-600/80 dark:text-amber-300/80 text-lg">إدارة مواصفات المركبات وروابط الصور التفصيلية</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-400 w-5 h-5" />
            <Input
              placeholder="البحث في المواصفات والصور..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 border-amber-200 dark:border-amber-700/50 focus:border-amber-400 dark:focus:border-amber-500 bg-white/50 dark:bg-slate-700/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-800/80 border border-amber-200/50 dark:border-amber-700/30 rounded-xl p-1">
            <TabsTrigger 
              value="specifications" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <FileText className="w-4 h-4 ml-2" />
              مواصفات المركبات
            </TabsTrigger>
            <TabsTrigger 
              value="images" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Image className="w-4 h-4 ml-2" />
              روابط الصور
            </TabsTrigger>
          </TabsList>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200">مواصفات المركبات</h2>
              <Dialog open={isSpecDialogOpen} onOpenChange={setIsSpecDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
                    onClick={() => {
                      setEditingSpec(null);
                      specForm.reset();
                    }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مواصفات جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-amber-200 dark:border-amber-700/50">
                  <DialogHeader>
                    <DialogTitle className="text-amber-800 dark:text-amber-200">
                      {editingSpec ? "تعديل المواصفات" : "إضافة مواصفات جديدة"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...specForm}>
                    <form onSubmit={specForm.handleSubmit(onSubmitSpec)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={specForm.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">الشركة المصنعة</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر الشركة المصنعة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {manufacturerOptions.map((manufacturer) => (
                                    <SelectItem key={manufacturer} value={manufacturer}>
                                      {manufacturer}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={specForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">الفئة</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر الفئة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categoryOptions.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={specForm.control}
                          name="trimLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">درجة التجهيز</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر درجة التجهيز" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {trimLevelOptions.map((trim) => (
                                    <SelectItem key={trim} value={trim}>
                                      {trim}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={specForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">السنة</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر السنة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yearOptions.map((year) => (
                                    <SelectItem key={year} value={year}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={specForm.control}
                          name="engineCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">سعة المحرك</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر سعة المحرك" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {engineCapacityOptions.map((capacity) => (
                                    <SelectItem key={capacity} value={capacity}>
                                      {capacity}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={specForm.control}
                          name="chassisNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">رقم الهيكل (اختياري)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="رقم الهيكل"
                                  {...field}
                                  className="border-amber-200 dark:border-amber-700/50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={specForm.control}
                        name="specifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-700 dark:text-amber-300">المواصفات (عربي)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="اكتب المواصفات التفصيلية..."
                                className="h-32 border-amber-200 dark:border-amber-700/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={specForm.control}
                        name="specificationsEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-700 dark:text-amber-300">المواصفات (إنجليزي)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Write detailed specifications..."
                                className="h-32 border-amber-200 dark:border-amber-700/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsSpecDialogOpen(false)}
                          className="border-amber-200 dark:border-amber-700/50"
                        >
                          إلغاء
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={specMutation.isPending}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                        >
                          {specMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Specifications List */}
            <div className="grid gap-4">
              {specsLoading ? (
                <div className="text-center py-8 text-amber-600 dark:text-amber-400">جاري التحميل...</div>
              ) : filteredSpecs.length === 0 ? (
                <div className="text-center py-8 text-amber-600 dark:text-amber-400">لا توجد مواصفات</div>
              ) : (
                filteredSpecs.map((spec: VehicleSpecification) => (
                  <Card key={spec.id} className="bg-white/80 dark:bg-slate-800/80 border-amber-200/50 dark:border-amber-700/30 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            {spec.manufacturer} {spec.category} {spec.trimLevel}
                          </CardTitle>
                          <div className="flex gap-2 text-sm text-amber-600/80 dark:text-amber-300/80">
                            {spec.year && <span>السنة: {spec.year}</span>}
                            {spec.engineCapacity && <span>المحرك: {spec.engineCapacity}</span>}
                            {spec.chassisNumber && <span>رقم الهيكل: {spec.chassisNumber}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSpec(spec)}
                            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSpecMutation.mutate(spec.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {spec.specifications && (
                          <div>
                            <h4 className="font-medium text-amber-700 dark:text-amber-300">المواصفات:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded">
                              {spec.specifications}
                            </p>
                          </div>
                        )}
                        {spec.specificationsEn && (
                          <div>
                            <h4 className="font-medium text-amber-700 dark:text-amber-300">Specifications:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded">
                              {spec.specificationsEn}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200">روابط الصور</h2>
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
                    onClick={() => {
                      setEditingImage(null);
                      imageForm.reset();
                    }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة رابط صورة جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-amber-200 dark:border-amber-700/50">
                  <DialogHeader>
                    <DialogTitle className="text-amber-800 dark:text-amber-200">
                      {editingImage ? "تعديل رابط الصورة" : "إضافة رابط صورة جديد"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...imageForm}>
                    <form onSubmit={imageForm.handleSubmit(onSubmitImage)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={imageForm.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">الشركة المصنعة</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر الشركة المصنعة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {manufacturerOptions.map((manufacturer) => (
                                    <SelectItem key={manufacturer} value={manufacturer}>
                                      {manufacturer}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={imageForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">الفئة</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر الفئة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categoryOptions.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={imageForm.control}
                          name="trimLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">درجة التجهيز</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر درجة التجهيز" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {trimLevelOptions.map((trim) => (
                                    <SelectItem key={trim} value={trim}>
                                      {trim}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={imageForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">السنة</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر السنة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {yearOptions.map((year) => (
                                    <SelectItem key={year} value={year}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={imageForm.control}
                          name="exteriorColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">اللون الخارجي</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر اللون الخارجي" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colorOptions.map((color) => (
                                    <SelectItem key={color} value={color}>
                                      <div className="flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        {color}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={imageForm.control}
                          name="interiorColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-700 dark:text-amber-300">اللون الداخلي</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-amber-200 dark:border-amber-700/50">
                                    <SelectValue placeholder="اختر اللون الداخلي" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colorOptions.map((color) => (
                                    <SelectItem key={color} value={color}>
                                      <div className="flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        {color}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={imageForm.control}
                        name="chassisNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-700 dark:text-amber-300">رقم الهيكل (اختياري)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="رقم الهيكل"
                                {...field}
                                className="border-amber-200 dark:border-amber-700/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={imageForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-700 dark:text-amber-300">رابط الصورة *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                {...field}
                                className="border-amber-200 dark:border-amber-700/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={imageForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-700 dark:text-amber-300">وصف الصورة (عربي)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="وصف الصورة..."
                                className="h-20 border-amber-200 dark:border-amber-700/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={imageForm.control}
                        name="descriptionEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-700 dark:text-amber-300">وصف الصورة (إنجليزي)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Image description..."
                                className="h-20 border-amber-200 dark:border-amber-700/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsImageDialogOpen(false)}
                          className="border-amber-200 dark:border-amber-700/50"
                        >
                          إلغاء
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={imageMutation.isPending}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                        >
                          {imageMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Images List */}
            <div className="grid gap-4">
              {imagesLoading ? (
                <div className="text-center py-8 text-amber-600 dark:text-amber-400">جاري التحميل...</div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-8 text-amber-600 dark:text-amber-400">لا توجد روابط صور</div>
              ) : (
                filteredImages.map((image: VehicleImageLink) => (
                  <Card key={image.id} className="bg-white/80 dark:bg-slate-800/80 border-amber-200/50 dark:border-amber-700/30 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <Image className="w-5 h-5" />
                            {image.manufacturer} {image.category} {image.trimLevel}
                          </CardTitle>
                          <div className="flex gap-2 text-sm text-amber-600/80 dark:text-amber-300/80">
                            {image.year && <span>السنة: {image.year}</span>}
                            {image.exteriorColor && <span>خارجي: {image.exteriorColor}</span>}
                            {image.interiorColor && <span>داخلي: {image.interiorColor}</span>}
                            {image.chassisNumber && <span>رقم الهيكل: {image.chassisNumber}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditImage(image)}
                            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteImageMutation.mutate(image.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                          <Link className="w-4 h-4" />
                          <a href={image.imageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                            {image.imageUrl}
                          </a>
                        </div>
                        {image.description && (
                          <div>
                            <h4 className="font-medium text-amber-700 dark:text-amber-300">الوصف:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded">
                              {image.description}
                            </p>
                          </div>
                        )}
                        {image.descriptionEn && (
                          <div>
                            <h4 className="font-medium text-amber-700 dark:text-amber-300">Description:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded">
                              {image.descriptionEn}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}