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
import { Plus, Edit, Trash2, Search, Car, Image, Settings } from "lucide-react";
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

  // Fetch manufacturers for dropdowns
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/manufacturers'],
  });

  // Fetch inventory items for chassis numbers
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['/api/inventory'],
  });

  // Create/Update specification mutation
  const specMutation = useMutation({
    mutationFn: async (data: SpecificationFormData) => {
      const url = editingSpec ? `/api/vehicle-specifications/${editingSpec.id}` : '/api/vehicle-specifications';
      const method = editingSpec ? 'PUT' : 'POST';
      return apiRequest(url, { method, body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-specifications'] });
      setIsSpecDialogOpen(false);
      setEditingSpec(null);
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
      return apiRequest(url, { method, body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-image-links'] });
      setIsImageDialogOpen(false);
      setEditingImage(null);
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

  // Delete mutations
  const deleteSpecMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/vehicle-specifications/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-specifications'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف المواصفات",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/vehicle-image-links/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-image-links'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف رابط الصورة",
      });
    },
  });

  // Form configurations
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

  // Filter functions
  const filteredSpecs = specifications.filter((spec: VehicleSpecification) =>
    spec.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.specifications?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredImages = imageLinks.filter((image: VehicleImageLink) =>
    image.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset forms when editing changes
  useEffect(() => {
    if (editingSpec) {
      specForm.reset({
        manufacturer: editingSpec.manufacturer || "",
        category: editingSpec.category || "",
        trimLevel: editingSpec.trimLevel || "",
        year: editingSpec.year || undefined,
        engineCapacity: editingSpec.engineCapacity || "",
        chassisNumber: editingSpec.chassisNumber || "",
        specifications: editingSpec.specifications || "",
        specificationsEn: editingSpec.specificationsEn || "",
      });
    } else {
      specForm.reset();
    }
  }, [editingSpec, specForm]);

  useEffect(() => {
    if (editingImage) {
      imageForm.reset({
        manufacturer: editingImage.manufacturer || "",
        category: editingImage.category || "",
        trimLevel: editingImage.trimLevel || "",
        year: editingImage.year || undefined,
        engineCapacity: editingImage.engineCapacity || "",
        exteriorColor: editingImage.exteriorColor || "",
        interiorColor: editingImage.interiorColor || "",
        chassisNumber: editingImage.chassisNumber || "",
        imageUrl: editingImage.imageUrl,
        description: editingImage.description || "",
        descriptionEn: editingImage.descriptionEn || "",
      });
    } else {
      imageForm.reset();
    }
  }, [editingImage, imageForm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            إدارة المواصفات والصور
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            إدارة المواصفات التفصيلية وروابط الصور للمركبات
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="البحث في المواصفات والصور..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="specifications" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              المواصفات التفصيلية
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              روابط الصور
            </TabsTrigger>
          </TabsList>

          {/* Specifications Tab */}
          <TabsContent value="specifications">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                المواصفات التفصيلية ({filteredSpecs.length})
              </h2>
              <Dialog open={isSpecDialogOpen} onOpenChange={setIsSpecDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setEditingSpec(null)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة مواصفات
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSpec ? "تعديل المواصفات" : "إضافة مواصفات جديدة"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...specForm}>
                    <form onSubmit={specForm.handleSubmit((data) => specMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Manufacturer */}
                        <FormField
                          control={specForm.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الصانع</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الصانع" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {manufacturers.map((manufacturer: any) => (
                                      <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                                        {manufacturer.nameAr}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Category */}
                        <FormField
                          control={specForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الفئة</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: C300, X5, A4" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Trim Level */}
                        <FormField
                          control={specForm.control}
                          name="trimLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>درجة التجهيز</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: فل كامل، ستاندرد" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Year */}
                        <FormField
                          control={specForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>السنة</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  placeholder="مثال: 2023" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Engine Capacity */}
                        <FormField
                          control={specForm.control}
                          name="engineCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سعة المحرك</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: 2.0L Turbo" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Chassis Number */}
                        <FormField
                          control={specForm.control}
                          name="chassisNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الهيكل (اختياري)</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر رقم الهيكل" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {inventoryItems.map((item: any) => (
                                      <SelectItem key={item.id} value={item.chassisNumber}>
                                        {item.chassisNumber} - {item.manufacturer} {item.category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Specifications (Arabic) */}
                      <FormField
                        control={specForm.control}
                        name="specifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المواصفات التفصيلية (عربي) *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="اكتب المواصفات التفصيلية باللغة العربية..."
                                rows={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Specifications (English) */}
                      <FormField
                        control={specForm.control}
                        name="specificationsEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المواصفات التفصيلية (إنجليزي)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Enter detailed specifications in English..."
                                rows={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsSpecDialogOpen(false);
                            setEditingSpec(null);
                          }}
                        >
                          إلغاء
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={specMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {specMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specsLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredSpecs.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    {searchTerm ? "لا توجد مواصفات تطابق البحث" : "لا توجد مواصفات مضافة"}
                  </p>
                </div>
              ) : (
                filteredSpecs.map((spec: VehicleSpecification) => (
                  <Card key={spec.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{spec.manufacturer} {spec.category}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingSpec(spec);
                              setIsSpecDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSpecMutation.mutate(spec.id)}
                            disabled={deleteSpecMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {spec.trimLevel && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <strong>درجة التجهيز:</strong> {spec.trimLevel}
                        </p>
                      )}
                      {spec.year && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <strong>السنة:</strong> {spec.year}
                        </p>
                      )}
                      {spec.engineCapacity && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <strong>سعة المحرك:</strong> {spec.engineCapacity}
                        </p>
                      )}
                      {spec.chassisNumber && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <strong>رقم الهيكل:</strong> {spec.chassisNumber}
                        </p>
                      )}
                      <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-3">
                        {spec.specifications}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                روابط الصور ({filteredImages.length})
              </h2>
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setEditingImage(null)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة رابط صورة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingImage ? "تعديل رابط الصورة" : "إضافة رابط صورة جديد"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...imageForm}>
                    <form onSubmit={imageForm.handleSubmit((data) => imageMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Manufacturer */}
                        <FormField
                          control={imageForm.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الصانع</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الصانع" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {manufacturers.map((manufacturer: any) => (
                                      <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                                        {manufacturer.nameAr}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Category */}
                        <FormField
                          control={imageForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الفئة</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: C300, X5, A4" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Trim Level */}
                        <FormField
                          control={imageForm.control}
                          name="trimLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>درجة التجهيز</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: فل كامل، ستاندرد" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Year */}
                        <FormField
                          control={imageForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>السنة</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  placeholder="مثال: 2023" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Engine Capacity */}
                        <FormField
                          control={imageForm.control}
                          name="engineCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سعة المحرك</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: 2.0L Turbo" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Exterior Color */}
                        <FormField
                          control={imageForm.control}
                          name="exteriorColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اللون الخارجي</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: أبيض، أسود، أزرق" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Interior Color */}
                        <FormField
                          control={imageForm.control}
                          name="interiorColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اللون الداخلي</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: بيج، أسود، بني" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Chassis Number */}
                        <FormField
                          control={imageForm.control}
                          name="chassisNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الهيكل (اختياري)</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر رقم الهيكل" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {inventoryItems.map((item: any) => (
                                      <SelectItem key={item.id} value={item.chassisNumber}>
                                        {item.chassisNumber} - {item.manufacturer} {item.category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Image URL */}
                      <FormField
                        control={imageForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط الصورة *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/image.jpg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Description (Arabic) */}
                      <FormField
                        control={imageForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف الصورة (عربي)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="وصف الصورة باللغة العربية..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Description (English) */}
                      <FormField
                        control={imageForm.control}
                        name="descriptionEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف الصورة (إنجليزي)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Image description in English..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsImageDialogOpen(false);
                            setEditingImage(null);
                          }}
                        >
                          إلغاء
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={imageMutation.isPending}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          {imageMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imagesLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredImages.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Image className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    {searchTerm ? "لا توجد صور تطابق البحث" : "لا توجد صور مضافة"}
                  </p>
                </div>
              ) : (
                filteredImages.map((image: VehicleImageLink) => (
                  <Card key={image.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{image.manufacturer} {image.category}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingImage(image);
                              setIsImageDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteImageMutation.mutate(image.id)}
                            disabled={deleteImageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Image Preview */}
                      <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img 
                          src={image.imageUrl} 
                          alt={image.description || "صورة المركبة"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="space-y-1 text-sm">
                        {image.trimLevel && (
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong>درجة التجهيز:</strong> {image.trimLevel}
                          </p>
                        )}
                        {image.year && (
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong>السنة:</strong> {image.year}
                          </p>
                        )}
                        {image.exteriorColor && (
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong>اللون الخارجي:</strong> {image.exteriorColor}
                          </p>
                        )}
                        {image.interiorColor && (
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong>اللون الداخلي:</strong> {image.interiorColor}
                          </p>
                        )}
                        {image.chassisNumber && (
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong>رقم الهيكل:</strong> {image.chassisNumber}
                          </p>
                        )}
                        {image.description && (
                          <p className="text-slate-700 dark:text-slate-200 line-clamp-2">
                            {image.description}
                          </p>
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