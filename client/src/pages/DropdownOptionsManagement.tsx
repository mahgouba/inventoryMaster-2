import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Settings, Save, X } from "lucide-react";

// Schema definitions for different option types
const manufacturerSchema = z.object({
  id: z.string().min(1, "معرف الصانع مطلوب"),
  nameAr: z.string().min(1, "الاسم العربي مطلوب"),
  nameEn: z.string().optional(),
  logo: z.string().optional(),
});

const categorySchema = z.object({
  manufacturer: z.string().min(1, "الصانع مطلوب"),
  category: z.string().min(1, "اسم الفئة مطلوب"),
  description: z.string().optional(),
});

const trimLevelSchema = z.object({
  manufacturer: z.string().min(1, "الصانع مطلوب"),
  category: z.string().min(1, "الفئة مطلوبة"),
  trimLevel: z.string().min(1, "درجة التجهيز مطلوبة"),
  description: z.string().optional(),
});

const exteriorColorSchema = z.object({
  name: z.string().min(1, "اسم اللون الخارجي مطلوب"),
  colorCode: z.string().optional(),
  manufacturer: z.string().optional(),
  category: z.string().optional(),
});

const interiorColorSchema = z.object({
  name: z.string().min(1, "اسم اللون الداخلي مطلوب"),
  colorCode: z.string().optional(),
  manufacturer: z.string().optional(),
  category: z.string().optional(),
});

const locationSchema = z.object({
  name: z.string().min(1, "اسم الموقع مطلوب"),
  description: z.string().optional(),
  address: z.string().optional(),
  manager: z.string().optional(),
  phone: z.string().optional(),
  capacity: z.number().optional(),
});

type OptionType = "manufacturers" | "categories" | "trimLevels" | "exteriorColors" | "interiorColors" | "locations" | "statuses" | "importTypes" | "engineCapacities";

interface DropdownOption {
  id?: string | number;
  name?: string;
  manufacturer?: string;
  category?: string;
  trimLevel?: string;
  type?: string;
  [key: string]: any;
}

export default function DropdownOptionsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOptionType, setSelectedOptionType] = useState<OptionType>("manufacturers");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DropdownOption | null>(null);
  const [newStaticOption, setNewStaticOption] = useState("");
  
  // States for hierarchical relationships
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Static options that don't come from database
  const [staticOptions, setStaticOptions] = useState({
    statuses: ["متوفر", "في الطريق", "قيد الصيانة", "محجوز", "مباع"],
    importTypes: ["شخصي", "شركة", "مستعمل شخصي"],
    engineCapacities: ["1.0L", "1.2L", "1.4L", "1.5L", "1.6L", "1.8L", "2.0L", "2.2L", "2.4L", "2.5L", "2.7L", "3.0L", "3.5L", "4.0L", "4.4L", "5.0L", "6.2L", "V6", "V8", "V12"]
  });

  // Save static options to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dropdownStaticOptions', JSON.stringify(staticOptions));
  }, [staticOptions]);

  // Load static options from localStorage on component mount
  useEffect(() => {
    const savedOptions = localStorage.getItem('dropdownStaticOptions');
    if (savedOptions) {
      try {
        setStaticOptions(JSON.parse(savedOptions));
      } catch (error) {
        console.error('Error loading saved static options:', error);
      }
    }
  }, []);

  // Fetch manufacturers for dropdowns
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/hierarchical/manufacturers'],
    enabled: true
  });

  // Fetch categories based on selected manufacturer
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/hierarchical/categories', selectedManufacturer],
    queryFn: () => fetch(`/api/hierarchical/categories?manufacturer=${encodeURIComponent(selectedManufacturer)}`).then(res => res.json()),
    enabled: !!selectedManufacturer && ["categories", "trimLevels", "exteriorColors", "interiorColors"].includes(selectedOptionType)
  });

  // Fetch trim levels based on selected category
  const { data: trimLevels = [] } = useQuery({
    queryKey: ['/api/hierarchical/trimLevels', selectedManufacturer, selectedCategory],
    queryFn: () => fetch(`/api/hierarchical/trimLevels?manufacturer=${encodeURIComponent(selectedManufacturer)}&category=${encodeURIComponent(selectedCategory)}`).then(res => res.json()),
    enabled: !!selectedCategory && ["trimLevels", "exteriorColors", "interiorColors"].includes(selectedOptionType)
  });

  // Fetch data based on selected option type
  const { data: options = [], isLoading } = useQuery({
    queryKey: [`/api/hierarchical/${selectedOptionType}`],
    enabled: !["statuses", "importTypes", "engineCapacities"].includes(selectedOptionType)
  });

  // Get form schema based on option type
  const getFormSchema = () => {
    switch (selectedOptionType) {
      case "manufacturers":
        return manufacturerSchema;
      case "categories":
        return categorySchema;
      case "trimLevels":
        return trimLevelSchema;
      case "exteriorColors":
        return exteriorColorSchema;
      case "interiorColors":
        return interiorColorSchema;
      case "locations":
        return locationSchema;
      default:
        return z.object({ name: z.string().min(1, "الاسم مطلوب") });
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {}
  });

  // Reset form when option type changes
  useEffect(() => {
    form.reset();
    setEditingItem(null);
    setSelectedManufacturer("");
    setSelectedCategory("");
  }, [selectedOptionType, form]);

  // Mutation for adding/updating options
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Map exteriorColors and interiorColors to colors endpoint
      let endpoint = `/api/hierarchical/${selectedOptionType}`;
      if (selectedOptionType === "exteriorColors" || selectedOptionType === "interiorColors") {
        endpoint = "/api/hierarchical/colors";
        data.type = selectedOptionType === "exteriorColors" ? "exterior" : "interior";
      }
      
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem && editingItem.id ? `${endpoint}/${editingItem.id}` : endpoint;
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hierarchical/${selectedOptionType}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/hierarchical/manufacturers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hierarchical/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hierarchical/trimLevels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hierarchical/colors"] });
      toast({
        title: "تم بنجاح",
        description: editingItem ? "تم تحديث العنصر بنجاح" : "تم إضافة العنصر بنجاح"
      });
      setIsDialogOpen(false);
      setEditingItem(null);
      setSelectedManufacturer("");
      setSelectedCategory("");
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ العنصر",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting options
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      // Map exteriorColors and interiorColors to colors endpoint
      let endpoint = `/api/hierarchical/${selectedOptionType}`;
      if (selectedOptionType === "exteriorColors" || selectedOptionType === "interiorColors") {
        endpoint = "/api/hierarchical/colors";
      }
      return apiRequest("DELETE", `${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hierarchical/${selectedOptionType}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/hierarchical/manufacturers"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف العنصر بنجاح"
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف العنصر",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (item: DropdownOption) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  const handleAddStaticOption = (optionType: keyof typeof staticOptions) => {
    if (newStaticOption.trim()) {
      // Check if option already exists
      if (staticOptions[optionType].includes(newStaticOption.trim())) {
        toast({
          title: "تحذير",
          description: "هذا الخيار موجود بالفعل",
          variant: "destructive"
        });
        return;
      }
      
      setStaticOptions(prev => ({
        ...prev,
        [optionType]: [...prev[optionType], newStaticOption.trim()]
      }));
      setNewStaticOption("");
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الخيار بنجاح"
      });
    }
  };

  const handleRemoveStaticOption = (optionType: keyof typeof staticOptions, index: number) => {
    setStaticOptions(prev => ({
      ...prev,
      [optionType]: prev[optionType].filter((_, i) => i !== index)
    }));
    toast({
      title: "تم بنجاح",
      description: "تم حذف الخيار بنجاح"
    });
  };

  const renderStaticOptions = (optionType: keyof typeof staticOptions, title: string) => (
    <Card className="glass-container">
      <CardHeader className="glass-header">
        <CardTitle className="text-white text-right">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newStaticOption}
            onChange={(e) => setNewStaticOption(e.target.value)}
            placeholder="إضافة خيار جديد..."
            className="flex-1"
            dir="rtl"
          />
          <Button
            onClick={() => handleAddStaticOption(optionType)}
            disabled={!newStaticOption.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {staticOptions[optionType].map((option, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-2">
              {option}
              <button
                onClick={() => handleRemoveStaticOption(optionType, index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDatabaseOptions = () => {
    if (isLoading) {
      return <div className="text-center text-white">جاري التحميل...</div>;
    }

    if (!options || options.length === 0) {
      return <div className="text-center text-white">لا توجد عناصر</div>;
    }

    return (
      <div className="grid gap-4">
        {options.map((item: DropdownOption, index: number) => (
          <Card key={item.id || index} className="glass-container">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1 text-right">
                  <div className="text-white font-medium">
                    {item.nameAr || item.name || item.category || item.trimLevel}
                  </div>
                  {item.manufacturer && (
                    <div className="text-sm text-gray-300">الصانع: {item.manufacturer}</div>
                  )}
                  {item.category && selectedOptionType === "trimLevels" && (
                    <div className="text-sm text-gray-300">الفئة: {item.category}</div>
                  )}
                  {item.description && (
                    <div className="text-sm text-gray-400">{item.description}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => item.id && deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFormFields = () => {
    switch (selectedOptionType) {
      case "manufacturers":
        return (
          <>
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">معرف الصانع</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: مرسيدس" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الاسم العربي</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: مرسيدس" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الاسم الإنجليزي (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Mercedes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "categories":
        return (
          <>
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الصانع</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الصانع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufacturers.map((manufacturer: any) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">اسم الفئة</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: E200" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الاسم الإنجليزي (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "trimLevels":
        return (
          <>
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الصانع</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedManufacturer(value);
                    setSelectedCategory("");
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الصانع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufacturers.map((manufacturer: any) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedManufacturer && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">الفئة</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.nameAr || category.name_ar}>
                            {category.nameAr || category.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">درجة التجهيز</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: فل كامل" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الاسم الإنجليزي (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full Option" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "exteriorColors":
        return (
          <>
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الصانع (اختياري)</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedManufacturer(value);
                    setSelectedCategory("");
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الصانع (أو اتركه فارغاً للجميع)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">جميع الصانعين</SelectItem>
                      {manufacturers.map((manufacturer: any) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedManufacturer && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">الفئة (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الفئة (أو اتركه فارغاً للجميع)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">جميع الفئات</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.nameAr || category.name_ar}>
                            {category.nameAr || category.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">اسم اللون الخارجي</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: أبيض لؤلؤي" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">كود اللون (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="#FFFFFF" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "interiorColors":
        return (
          <>
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الصانع (اختياري)</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedManufacturer(value);
                    setSelectedCategory("");
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الصانع (أو اتركه فارغاً للجميع)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">جميع الصانعين</SelectItem>
                      {manufacturers.map((manufacturer: any) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedManufacturer && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">الفئة (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الفئة (أو اتركه فارغاً للجميع)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">جميع الفئات</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.nameAr || category.name_ar}>
                            {category.nameAr || category.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">اسم اللون الداخلي</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: جلد بيج" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">كود اللون (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="#F5F5DC" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "locations":
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">اسم الموقع</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: المستودع الرئيسي" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="وصف الموقع..." dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">العنوان (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="العنوان..." dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">المسؤول (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="اسم المسؤول" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">الهاتف (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="رقم الهاتف" dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  const optionTypeNames = {
    manufacturers: "الصانعين",
    categories: "الفئات", 
    trimLevels: "درجات التجهيز",
    exteriorColors: "الألوان الخارجية",
    interiorColors: "الألوان الداخلية",
    locations: "المواقع",
    statuses: "الحالات",
    importTypes: "أنواع الاستيراد",
    engineCapacities: "سعات المحرك"
  };

  return (
    <div className="space-y-6 p-6">
      <div className="glass-header p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-white text-right flex items-center gap-2">
          <Settings className="h-6 w-6" />
          إدارة خيارات القوائم المنسدلة
        </h1>
        <p className="text-gray-300 text-right mt-2">
          يمكنك إدارة جميع الخيارات المتاحة في القوائم المنسدلة عند إضافة العناصر
        </p>
      </div>

      {/* Option Type Selector */}
      <Card className="glass-container">
        <CardHeader className="glass-header">
          <CardTitle className="text-white text-right">اختر نوع الخيارات</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedOptionType} onValueChange={(value) => setSelectedOptionType(value as OptionType)}>
            <SelectTrigger className="w-full" dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(optionTypeNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Content based on selected option type */}
      <div className="space-y-6">
        {["statuses", "importTypes", "engineCapacities"].includes(selectedOptionType) ? (
          // Static options
          <div>
            {selectedOptionType === "statuses" && renderStaticOptions("statuses", "حالات المركبات")}
            {selectedOptionType === "importTypes" && renderStaticOptions("importTypes", "أنواع الاستيراد")}
            {selectedOptionType === "engineCapacities" && renderStaticOptions("engineCapacities", "سعات المحرك")}
          </div>
        ) : (
          // Database options
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white text-right">
                {optionTypeNames[selectedOptionType]}
              </h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-container max-w-2xl">
                  <DialogHeader className="glass-header">
                    <DialogTitle className="text-white text-right">
                      {editingItem ? "تعديل" : "إضافة"} {optionTypeNames[selectedOptionType]}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {renderFormFields()}
                      <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          إلغاء
                        </Button>
                        <Button type="submit" disabled={saveMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          {saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            {renderDatabaseOptions()}
          </div>
        )}
      </div>
    </div>
  );
}