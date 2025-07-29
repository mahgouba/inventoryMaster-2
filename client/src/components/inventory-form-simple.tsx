import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventoryItemSchema, type InsertInventoryItem, type InventoryItem, type TrimLevel } from "@shared/schema";
import { CloudUpload, Settings, Camera, Move } from "lucide-react";
import ListManagerSimple from "@/components/list-manager-simple";
import ManufacturerCategoriesButton from "@/components/manufacturer-categories-button";
import ChassisNumberScanner from "@/components/chassis-number-scanner";
import TrimLevelManager from "@/components/trim-level-manager";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

// Fetch manufacturers from cars.json
const useCarsManufacturers = () => {
  return useQuery({
    queryKey: ["/api/cars/manufacturers"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Fetch models for a specific manufacturer
const useCarsModels = (manufacturer: string) => {
  return useQuery({
    queryKey: [`/api/cars/models/${manufacturer}`],
    enabled: Boolean(manufacturer),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Fetch trims for a specific manufacturer and model
const useCarsTrims = (manufacturer: string, model: string) => {
  return useQuery({
    queryKey: [`/api/cars/trims/${manufacturer}/${model}`],
    enabled: Boolean(manufacturer && model),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
const initialEngineCapacities = ["2.0L", "1.5L", "3.0L", "4.0L", "5.0L", "V6", "V8", "Electric"];
const initialYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const initialStatuses = ["متوفر", "في الطريق", "قيد الصيانة", "محجوز", "مباع"];
const initialImportTypes = ["شخصي", "شركة", "مستعمل شخصي"];
const initialLocations = ["المستودع الرئيسي", "المعرض", "الورشة", "الميناء", "مستودع فرعي"];
const initialColors = ["أسود", "أبيض", "رمادي", "أزرق", "أحمر", "بني", "فضي", "ذهبي", "بيج"];

export default function InventoryFormSimple({ open, onOpenChange, editItem }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Fetch data from cars.json
  const { data: carsManufacturers = [] } = useCarsManufacturers();
  const { data: carsModels = [] } = useCarsModels(selectedManufacturer);
  const { data: carsTrims = [] } = useCarsTrims(selectedManufacturer, selectedCategory);
  
  // Local state for editable lists
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTrimLevels, setAvailableTrimLevels] = useState<string[]>([]);
  const [engineCapacities, setEngineCapacities] = useState<string[]>(initialEngineCapacities);
  const [statuses, setStatuses] = useState<string[]>(initialStatuses);
  const [importTypes, setImportTypes] = useState<string[]>(initialImportTypes);
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const [exteriorColors, setExteriorColors] = useState<string[]>(initialColors);
  const [interiorColors, setInteriorColors] = useState<string[]>(initialColors);
  
  // List manager state
  const [showListManager, setShowListManager] = useState(false);
  
  // Chassis number scanner state
  const [showChassisScanner, setShowChassisScanner] = useState(false);

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: {
      manufacturer: "",
      category: "",
      trimLevel: "",
      engineCapacity: "",
      year: new Date().getFullYear(),
      exteriorColor: "",
      interiorColor: "",
      status: "متوفر",
      importType: "شخصي",
      location: "المستودع الرئيسي",
      ownershipType: "ملك الشركة",
      chassisNumber: "",
      price: "",
      images: [],
      notes: "",
      isSold: false,
      mileage: undefined,
    },
  });

  // Fetch trim levels for the selected manufacturer and category
  const { data: trimLevels = [], refetch: refetchTrimLevels } = useQuery({
    queryKey: [`/api/trim-levels/category/${selectedManufacturer}/${selectedCategory}`],
    enabled: Boolean(selectedManufacturer && selectedCategory),
  });

  // Get manufacturers from API - no state needed, use data directly
  const carsManufacturerNames = (carsManufacturers as any[]).map((m: any) => m.name_ar);
  const allManufacturers = Array.from(new Set([...manufacturers, ...carsManufacturerNames]));
  
  // Get categories from API - use data directly 
  const carsModelNames = (carsModels as any[]).map((m: any) => m.model_ar);
  const dynamicCategories = selectedManufacturer ? carsModelNames : [];
  const allCategories = Array.from(new Set([...availableCategories, ...dynamicCategories]));
  
  // Get trim levels from API - use data directly
  const carsTrimsNames = (carsTrims as any[]).map((t: any) => t.trim_ar);
  const dynamicTrimLevels = selectedCategory ? carsTrimsNames : [];
  const allTrimLevels = Array.from(new Set([...availableTrimLevels, ...dynamicTrimLevels]));

  const handleManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
    setSelectedCategory("");
    form.setValue("category", "");
    form.setValue("trimLevel", "");
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    form.setValue("trimLevel", "");
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => apiRequest("POST", "/api/inventory", data),
    onSuccess: async () => {
      // Force immediate refetch by invalidating and removing cached data
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      
      // Force immediate refetch by removing all inventory-related cached data
      queryClient.removeQueries({ queryKey: ["/api/inventory"] });
      
      // Refetch the data immediately to ensure UI updates
      await queryClient.refetchQueries({ queryKey: ["/api/inventory"] });
      await queryClient.refetchQueries({ queryKey: ["/api/inventory/stats"] });
      
      toast({
        title: "تم الإنشاء",
        description: "تم إضافة العنصر بنجاح",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة العنصر",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => 
      apiRequest("PUT", `/api/inventory/${editItem?.id}`, data),
    onSuccess: async () => {
      // Force immediate refetch by invalidating and removing cached data
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      
      // Force immediate refetch by removing all inventory-related cached data
      queryClient.removeQueries({ queryKey: ["/api/inventory"] });
      
      // Refetch the data immediately to ensure UI updates
      await queryClient.refetchQueries({ queryKey: ["/api/inventory"] });
      await queryClient.refetchQueries({ queryKey: ["/api/inventory/stats"] });
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث العنصر بنجاح",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث العنصر",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventoryItem) => {
    if (editItem) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Handle chassis number extraction from image
  const handleChassisNumberExtracted = (chassisNumber: string) => {
    form.setValue("chassisNumber", chassisNumber);
    toast({
      title: "تم استخراج رقم الهيكل",
      description: `رقم الهيكل: ${chassisNumber}`,
    });
  };

  const getOptionsForType = (type: string) => {
    switch (type) {
      case "manufacturers": return Array.from(new Set(allManufacturers)); // Remove duplicates
      case "engineCapacities": return engineCapacities;
      case "statuses": return statuses;
      case "importTypes": return importTypes;
      case "locations": return locations;
      case "exteriorColors": return exteriorColors;
      case "interiorColors": return interiorColors;
      default: return [];
    }
  };

  const setOptionsForType = (type: string, newList: string[] | Record<string, string[]>) => {
    switch (type) {
      case "manufacturers": 
        setManufacturers(newList as string[]); 
        break;
      case "manufacturerCategories": 
        // Handle manufacturer categories if needed
        break;
      case "engineCapacities": 
        setEngineCapacities(newList as string[]); 
        break;
      case "statuses": 
        setStatuses(newList as string[]); 
        break;
      case "importTypes": 
        setImportTypes(newList as string[]); 
        break;
      case "locations": 
        setLocations(newList as string[]); 
        break;
      case "exteriorColors": 
        setExteriorColors(newList as string[]); 
        break;
      case "interiorColors": 
        setInteriorColors(newList as string[]); 
        break;
    }
  };

  const getOptionTitle = (type: string) => {
    const titles: Record<string, string> = {
      manufacturers: "الشركات المصنعة",
      engineCapacities: "سعات المحرك",
      statuses: "حالات المركبة",
      importTypes: "أنواع الاستيراد",
      locations: "المواقع",
      exteriorColors: "الألوان الخارجية",
      interiorColors: "الألوان الداخلية"
    };
    return titles[type] || "";
  };

  // Load edit item data when editItem changes or dialog opens
  useEffect(() => {
    if (!open) return;

    if (editItem) {
      console.log('Loading edit item:', editItem); // Debug log
      
      // Set form values from editItem - ensure all fields are populated
      const formData = {
        manufacturer: editItem.manufacturer || "",
        category: editItem.category || "",
        trimLevel: editItem.trimLevel || "",
        engineCapacity: editItem.engineCapacity || "",
        year: editItem.year || new Date().getFullYear(),
        exteriorColor: editItem.exteriorColor || "",
        interiorColor: editItem.interiorColor || "",
        status: editItem.status || "متوفر",
        importType: editItem.importType || "شخصي",
        location: editItem.location || "المستودع الرئيسي",
        chassisNumber: editItem.chassisNumber || "",
        price: editItem.price || "",
        images: editItem.images || [],
        notes: editItem.notes || "",
        isSold: editItem.isSold || false,
      };
      
      console.log('Form data being set:', formData); // Debug log
      form.reset(formData);

      // Set manufacturer and category states to ensure dropdowns work
      setSelectedManufacturer(editItem.manufacturer || "");
      setSelectedCategory(editItem.category || "");
      
      // Force form field values to be set individually to ensure they display
      setTimeout(() => {
        Object.entries(formData).forEach(([key, value]) => {
          form.setValue(key as keyof typeof formData, value);
        });
      }, 100);
      
    } else {
      // Reset form for new item
      const defaultData = {
        manufacturer: "",
        category: "",
        trimLevel: "",
        engineCapacity: "",
        year: new Date().getFullYear(),
        exteriorColor: "",
        interiorColor: "",
        status: "متوفر",
        importType: "شخصي",
        location: "المستودع الرئيسي",
        chassisNumber: "",
        price: "",
        images: [],
        notes: "",
        isSold: false,
      };
      form.reset(defaultData);
      setSelectedManufacturer("");
      setSelectedCategory("");
    }
  }, [editItem, open, form]); // Include form in dependencies

  

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[95vh] w-[95vw] sm:w-full glass-dialog-secondary overflow-hidden" draggable={true}>
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" data-dialog-drag-handle>
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-gray-400" />
                <DialogTitle className="text-lg font-bold text-white">
                  {editItem ? "تحرير المركبة" : "إضافة مركبة جديدة"}
                </DialogTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowListManager(true)}
                className="text-xs glass-button whitespace-nowrap"
              >
                <Settings className="h-3 w-3 ml-1" />
                إدارة القوائم
              </Button>
            </div>
            <DialogDescription className="text-sm text-white/80 mb-4">
              {editItem ? "تعديل بيانات المركبة المحددة" : "إدخال بيانات المركبة الجديدة في النظام"}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(95vh-120px)] px-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* قسم المعلومات الأساسية */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-white font-semibold">المعلومات الأساسية</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* الصانع */}
                    <FormField
                      control={form.control}
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">الصانع</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={(value) => {
                              handleManufacturerChange(value);
                              field.onChange(value);
                            }}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر الصانع" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(new Set(allManufacturers)).map((manufacturer) => (
                                  <SelectItem key={manufacturer} value={manufacturer}>
                                    {manufacturer}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* الفئة */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">الفئة</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={(value) => {
                              handleCategoryChange(value);
                              field.onChange(value);
                            }} disabled={!selectedManufacturer}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(new Set(allCategories)).map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* درجة التجهيز */}
                    <FormField
                      control={form.control}
                      name="trimLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">درجة التجهيز</FormLabel>
                          <FormControl>
                            <Select value={field.value || ""} onValueChange={field.onChange} disabled={!selectedManufacturer || !selectedCategory}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر درجة التجهيز" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(new Set(allTrimLevels)).map((trimLevel) => (
                                  <SelectItem key={trimLevel} value={trimLevel}>
                                    {trimLevel}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* سعة المحرك */}
                    <FormField
                      control={form.control}
                      name="engineCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">سعة المحرك</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر سعة المحرك" />
                              </SelectTrigger>
                              <SelectContent>
                                {engineCapacities.map((capacity) => (
                                  <SelectItem key={capacity} value={capacity}>
                                    {capacity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* السنة */}
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">السنة</FormLabel>
                          <FormControl>
                            <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر السنة" />
                              </SelectTrigger>
                              <SelectContent>
                                {initialYears.map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* السعر */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">السعر (ريال)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="أدخل السعر" 
                              className="h-11 text-right"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* أزرار إدارة البيانات */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedManufacturer && (
                      <ManufacturerCategoriesButton
                        manufacturer={selectedManufacturer}
                        categories={availableCategories}
                        onCategoriesChange={(newCategories) => {
                          setAvailableCategories(newCategories);
                        }}
                      />
                    )}
                    
                    {selectedManufacturer && selectedCategory && (
                      <TrimLevelManager
                        manufacturer={selectedManufacturer}
                        category={selectedCategory}
                        onTrimLevelAdded={(newTrimLevel) => {
                          setAvailableTrimLevels(prev => [...prev, newTrimLevel.trimLevel]);
                          refetchTrimLevels();
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* قسم الألوان والمظهر */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="text-white font-semibold">الألوان والمظهر</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* اللون الخارجي */}
                    <FormField
                      control={form.control}
                      name="exteriorColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">اللون الخارجي</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر اللون الخارجي" />
                              </SelectTrigger>
                              <SelectContent>
                                {exteriorColors.map((color) => (
                                  <SelectItem key={color} value={color}>
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* اللون الداخلي */}
                    <FormField
                      control={form.control}
                      name="interiorColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">اللون الداخلي</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر اللون الداخلي" />
                              </SelectTrigger>
                              <SelectContent>
                                {interiorColors.map((color) => (
                                  <SelectItem key={color} value={color}>
                                    {color}
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
                </div>

                {/* قسم معلومات الاستيراد والحالة */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <h3 className="text-white font-semibold">معلومات الاستيراد والحالة</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* نوع الاستيراد */}
                    <FormField
                      control={form.control}
                      name="importType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">نوع الاستيراد</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر نوع الاستيراد" />
                              </SelectTrigger>
                              <SelectContent>
                                {importTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* الحالة */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">حالة المركبة</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* الموقع */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">موقع المركبة</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر الموقع" />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem key={location} value={location}>
                                    {location}
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
                  
                  {/* ممشي السيارة - فقط للمركبات المستعملة */}
                  {(form.watch("importType") === "مستعمل" || form.watch("importType") === "مستعمل شخصي") && (
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="mileage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-medium">ممشي السيارة (كم)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="أدخل عدد الكيلومترات" 
                                type="number"
                                min="0"
                                className="h-11"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* قسم المعلومات الإضافية */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h3 className="text-white font-semibold">المعلومات الإضافية</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* رقم الهيكل */}
                    <FormField
                      control={form.control}
                      name="chassisNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">رقم الهيكل (VIN)</FormLabel>
                          <div className="flex gap-2">
                            <FormControl className="flex-1">
                              <Input 
                                placeholder="أدخل رقم الهيكل" 
                                className="h-11"
                                {...field} 
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setShowChassisScanner(true)}
                              title="تصوير رقم الهيكل"
                              className="h-11 w-11 shrink-0"
                            >
                              <Camera size={18} />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* نوع الملكية */}
                    <FormField
                      control={form.control}
                      name="ownershipType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">نوع الملكية</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر نوع الملكية" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ملك الشركة">ملك الشركة</SelectItem>
                                <SelectItem value="عرض (وسيط)">عرض (وسيط)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* قسم الملاحظات */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <h3 className="text-white font-semibold">ملاحظات إضافية</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">الملاحظات</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أدخل أي ملاحظات إضافية حول المركبة..."
                            className="min-h-[80px] resize-none"
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/20">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="glass-button sm:w-auto"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="bg-custom-gold hover:bg-custom-gold-dark text-white glass-button sm:w-auto"
                  >
                    <CloudUpload className="h-4 w-4 ml-2" />
                    {isLoading ? "جاري الحفظ..." : editItem ? "تحديث البيانات" : "حفظ المركبة"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* List Manager Dialog */}
      <ListManagerSimple
        open={showListManager}
        onOpenChange={setShowListManager}
        listsData={{
          manufacturers,
          engineCapacities,
          statuses,
          importTypes,
          locations,
          exteriorColors,
          interiorColors,
        }}
        onSave={(type, newList) => setOptionsForType(type, newList as string[])}
      />

      {/* Chassis Number Scanner Dialog */}
      <ChassisNumberScanner
        open={showChassisScanner}
        onOpenChange={setShowChassisScanner}
        onChassisNumberExtracted={handleChassisNumberExtracted}
      />
    </>
  );
}