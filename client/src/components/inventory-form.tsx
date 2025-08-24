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
import { insertInventoryItemSchema, type InsertInventoryItem, type InventoryItem } from "@shared/schema";
import { CloudUpload, Settings } from "lucide-react";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

// Database types for hierarchical data
interface Manufacturer {
  id: number;
  nameAr: string;
  nameEn?: string;
  logo?: string;
  isActive?: boolean;
}

interface Category {
  id: number;
  manufacturerId: number;
  nameAr: string;
  nameEn?: string;
  isActive?: boolean;
}

interface TrimLevel {
  id: number;
  categoryId: number;
  nameAr: string;
  nameEn?: string;
  isActive?: boolean;
}
const initialEngineCapacities = ["2.0L", "1.5L", "3.0L", "4.0L", "5.0L", "V6", "V8"];
const initialYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const initialStatuses = ["متوفر", "في الطريق", "قيد الصيانة"];
const initialImportTypes = ["شخصي", "شركة", "مستعمل"];
const initialOwnershipTypes = ["ملك الشركة", "عرض (وسيط)"];
const initialLocations = ["المستودع الرئيسي", "المعرض", "الورشة", "الميناء", "مستودع فرعي"];
const initialColors = ["أسود", "أبيض", "رمادي", "أزرق", "أحمر", "بني", "فضي", "ذهبي", "بيج"];

export default function InventoryForm({ open, onOpenChange, editItem }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditingOptions, setIsEditingOptions] = useState(false);
  
  // Fetch years from database
  const { data: vehicleYears = [], isLoading: isLoadingYears } = useQuery<number[]>({
    queryKey: ["/api/vehicle-years"],
    enabled: open,
  });

  // Fetch engine capacities from database
  const { data: engineCapacities = [], isLoading: isLoadingEngineCapacities } = useQuery<string[]>({
    queryKey: ["/api/engine-capacities"],
    enabled: open,
  });

  // Types for dropdown data
  interface DropdownItem {
    id: number;
    name: string;
    description?: string;
    isActive?: boolean;
  }

  interface ColorItem {
    id: number;
    name: string;
    colorType: 'exterior' | 'interior';
    colorCode?: string;
    isActive?: boolean;
  }

  // Fetch dropdown data from database (same APIs as basic-dropdown-management)
  const { data: importTypesData = [], isLoading: isLoadingImportTypes } = useQuery<DropdownItem[]>({
    queryKey: ['/api/import-types'],
    enabled: open,
  });

  const { data: vehicleStatusesData = [], isLoading: isLoadingVehicleStatuses } = useQuery<DropdownItem[]>({
    queryKey: ['/api/vehicle-statuses'],
    enabled: open,
  });

  const { data: ownershipTypesData = [], isLoading: isLoadingOwnershipTypes } = useQuery<DropdownItem[]>({
    queryKey: ['/api/ownership-types'],
    enabled: open,
  });

  const { data: vehicleLocationsData = [], isLoading: isLoadingVehicleLocations } = useQuery<DropdownItem[]>({
    queryKey: ['/api/vehicle-locations'],
    enabled: open,
  });

  const { data: vehicleColorsData = [], isLoading: isLoadingVehicleColors } = useQuery<ColorItem[]>({
    queryKey: ['/api/vehicle-colors'],
    enabled: open,
  });

  // Convert database data to arrays for compatibility
  const importTypes = importTypesData.map(item => item.name).filter(Boolean);
  const vehicleStatuses = vehicleStatusesData.map(item => item.name).filter(Boolean);
  const ownershipTypes = ownershipTypesData.map(item => item.name).filter(Boolean);
  const vehicleLocations = vehicleLocationsData.map(item => item.name).filter(Boolean);
  const exteriorColors = vehicleColorsData.filter(item => item.colorType === 'exterior').map(item => item.name);
  const interiorColors = vehicleColorsData.filter(item => item.colorType === 'interior').map(item => item.name);

  // Use API data directly or fallback to initial values
  const editableYears = vehicleYears.length > 0 ? vehicleYears : initialYears;
  const editableEngineCapacities = engineCapacities.length > 0 ? engineCapacities : initialEngineCapacities;
  const editableStatuses = vehicleStatuses.length > 0 ? vehicleStatuses : initialStatuses;
  const editableImportTypes = importTypes.length > 0 ? importTypes : initialImportTypes;
  const editableOwnershipTypes = ownershipTypes.length > 0 ? ownershipTypes : initialOwnershipTypes;
  const editableLocations = vehicleLocations.length > 0 ? vehicleLocations : initialLocations;
  const editableExteriorColors = exteriorColors.length > 0 ? exteriorColors : initialColors;
  const editableInteriorColors = interiorColors.length > 0 ? interiorColors : initialColors;
  


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
      status: "",
      importType: "",
      ownershipType: "ملك الشركة",
      location: "",
      chassisNumber: "",
      images: [],
      logo: "",
      notes: "",
      price: "",
      isSold: false,
      detailedSpecifications: "",
      soldDate: null,
      reservationDate: null,
      reservedBy: "",
      reservationNote: "",
      mileage: undefined,
    },
  });

  // Fetch manufacturers from database using the new endpoint
  const { data: manufacturers = [], isLoading: isLoadingManufacturers } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
    enabled: open, // Only fetch when dialog is open
  });
  
  // Get current manufacturer name for categories query
  const selectedManufacturerName = form.watch("manufacturer");
  
  // Get current category name for trim levels query  
  const selectedCategoryName = form.watch("category");
  
  // Get manufacturer ID for hierarchy queries
  const selectedManufacturer = manufacturers.find(m => m.nameAr === selectedManufacturerName);
  const selectedManufacturerId = selectedManufacturer?.id;

  // Fetch categories based on selected manufacturer
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories", selectedManufacturerId],
    queryFn: async () => {
      if (!selectedManufacturerId) return [];
      const response = await fetch(`/api/categories?manufacturerId=${selectedManufacturerId}`);
      return response.json();
    },
    enabled: open && !!selectedManufacturerId,
  });
  
  // Get category ID for trim levels query
  const selectedCategory = categories.find(c => c.nameAr === selectedCategoryName);
  const selectedCategoryId = selectedCategory?.id;

  // Fetch trim levels based on selected category
  const { data: trimLevels = [], isLoading: isLoadingTrimLevels } = useQuery<TrimLevel[]>({
    queryKey: ["/api/trim-levels", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const response = await fetch(`/api/trim-levels?categoryId=${selectedCategoryId}`);
      return response.json();
    },
    enabled: open && !!selectedCategoryId,
  });

  // Get current trim level for colors query
  const selectedTrimLevelName = form.watch("trimLevel");

  // For now, we'll use the editable colors as we don't have specific color APIs yet
  const availableExteriorColors = editableExteriorColors;
  const availableInteriorColors = editableInteriorColors;



  // Handle manufacturer change
  const handleManufacturerChange = (manufacturerName: string) => {
    // Update form values and reset dependent fields
    form.setValue("manufacturer", manufacturerName);
    form.setValue("category", "");
    form.setValue("trimLevel", "");
    form.setValue("exteriorColor", "");
    form.setValue("interiorColor", "");
  };

  // Handle category change
  const handleCategoryChange = (categoryName: string) => {
    // Update form values and reset dependent fields
    form.setValue("category", categoryName);
    form.setValue("trimLevel", "");
    form.setValue("exteriorColor", "");
    form.setValue("interiorColor", "");
  };

  // Handle trim level change
  const handleTrimLevelChange = (trimLevelName: string) => {
    // Update form values and reset color fields
    form.setValue("trimLevel", trimLevelName);
    form.setValue("exteriorColor", "");
    form.setValue("interiorColor", "");
  };

  // Update form when editItem changes
  useEffect(() => {
    if (editItem) {
      // Make sure all fields are properly populated
      const formData = {
        manufacturer: editItem.manufacturer || "",
        category: editItem.category || "",
        trimLevel: editItem.trimLevel || "",
        engineCapacity: editItem.engineCapacity || "",
        year: editItem.year || new Date().getFullYear(),
        exteriorColor: editItem.exteriorColor || "",
        interiorColor: editItem.interiorColor || "",
        status: editItem.status || "",
        importType: editItem.importType || "",
        ownershipType: (editItem as any).ownershipType || "ملك الشركة",
        location: editItem.location || "",
        chassisNumber: editItem.chassisNumber || "",
        images: editItem.images || [],
        logo: editItem.logo || "",
        notes: editItem.notes || "",
        price: editItem.price || "",
        isSold: editItem.isSold || false,
        detailedSpecifications: (editItem as any).detailedSpecifications || "",
        soldDate: (editItem as any).soldDate || null,
        reservationDate: (editItem as any).reservationDate || null,
        reservedBy: (editItem as any).reservedBy || "",
        reservationNote: (editItem as any).reservationNote || "",
        mileage: (editItem as any).mileage || undefined,
      };
      
      form.reset(formData);
    } else {
      // Reset to empty form when creating new item
      form.reset({
        manufacturer: "",
        category: "",
        trimLevel: "",
        engineCapacity: "",
        year: new Date().getFullYear(),
        exteriorColor: "",
        interiorColor: "",
        status: "",
        importType: "",
        ownershipType: "ملك الشركة",
        location: "",
        chassisNumber: "",
        images: [],
        logo: "",
        notes: "",
        price: "",
        isSold: false,
        mileage: undefined,
      });
    }
  }, [editItem]); // Remove form and manufacturers from dependencies to prevent infinite loop

  const createMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "تم بنجاح",
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
      apiRequest("PATCH", `/api/inventory/${editItem?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "تم بنجاح",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full glass-container border-0">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white flex-1 text-center">
              {editItem ? "تحرير المركبة" : "إضافة مركبة جديدة"}
            </DialogTitle>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* الصانع */}
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={(value) => {
                        handleManufacturerChange(value);
                        field.onChange(value);
                      }} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الصانع" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingManufacturers ? (
                            <SelectItem key="loading" disabled value="loading">
                              جاري التحميل...
                            </SelectItem>
                          ) : manufacturers.length > 0 ? (
                            manufacturers
                              .filter((manufacturer) => manufacturer.isActive !== false)
                              .map((manufacturer) => (
                              <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                                {manufacturer.nameAr}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-data" disabled value="no-data">
                              لا توجد بيانات
                            </SelectItem>
                          )}
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
                    <FormControl>
                      <Select onValueChange={(value) => {
                        handleCategoryChange(value);
                        field.onChange(value);
                      }} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <SelectItem key="loading" disabled value="loading">
                              جاري التحميل...
                            </SelectItem>
                          ) : !selectedManufacturerName ? (
                            <SelectItem key="no-manufacturer" disabled value="no-manufacturer">
                              اختر الصانع أولاً
                            </SelectItem>
                          ) : categories.length > 0 ? (
                            categories.filter(category => category.isActive !== false).map((category) => (
                              <SelectItem key={category.id} value={category.nameAr}>
                                {category.nameAr}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-categories" disabled value="no-categories">
                              لا توجد فئات لهذا الصانع
                            </SelectItem>
                          )}
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
                    <FormControl>
                      <Select onValueChange={(value) => {
                        handleTrimLevelChange(value);
                        field.onChange(value);
                      }} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="درجة التجهيز" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingTrimLevels ? (
                            <SelectItem key="loading" disabled value="loading">
                              جاري التحميل...
                            </SelectItem>
                          ) : !selectedCategoryName ? (
                            <SelectItem key="no-category" disabled value="no-category">
                              اختر الفئة أولاً
                            </SelectItem>
                          ) : trimLevels.length > 0 ? (
                            trimLevels.filter(trimLevel => trimLevel.isActive !== false).map((trimLevel) => (
                              <SelectItem key={trimLevel.id} value={trimLevel.nameAr}>
                                {trimLevel.nameAr}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-trim-levels" disabled value="no-trim-levels">
                              لا توجد درجات تجهيز لهذه الفئة
                            </SelectItem>
                          )}
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
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger className="glass-input border-white/20 text-white">
                            <SelectValue placeholder="سعة المحرك" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingEngineCapacities ? (
                              <SelectItem key="loading" disabled value="loading">
                                جاري التحميل...
                              </SelectItem>
                            ) : engineCapacities.length > 0 ? (
                              engineCapacities.filter(capacity => capacity && capacity.trim()).map((capacity) => (
                                <SelectItem key={capacity} value={capacity}>
                                  {capacity}
                                </SelectItem>
                              ))
                            ) : (
                              editableEngineCapacities.filter(capacity => capacity && capacity.trim()).map((capacity) => (
                                <SelectItem key={capacity} value={capacity}>
                                  {capacity}
                                </SelectItem>
                              ))
                            )}
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
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value?.toString()}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="السنة" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingYears ? (
                            <SelectItem key="loading" disabled value="loading">
                              جاري التحميل...
                            </SelectItem>
                          ) : vehicleYears.length > 0 ? (
                            vehicleYears.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))
                          ) : (
                            editableYears.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* اللون الخارجي */}
              <FormField
                control={form.control}
                name="exteriorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="اللون الخارجي" />
                        </SelectTrigger>
                        <SelectContent>
                          {!selectedTrimLevelName ? (
                            <SelectItem key="no-trim" disabled value="no-trim">
                              اختر درجة التجهيز أولاً
                            </SelectItem>
                          ) : availableExteriorColors.length > 0 ? (
                            availableExteriorColors.filter(color => color && color.trim()).map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-colors" disabled value="no-colors">
                              لا توجد ألوان خارجية لدرجة التجهيز هذه
                            </SelectItem>
                          )}
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
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="اللون الداخلي" />
                        </SelectTrigger>
                        <SelectContent>
                          {!selectedTrimLevelName ? (
                            <SelectItem key="no-trim" disabled value="no-trim">
                              اختر درجة التجهيز أولاً
                            </SelectItem>
                          ) : availableInteriorColors.length > 0 ? (
                            availableInteriorColors.filter(color => color && color.trim()).map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-colors" disabled value="no-colors">
                              لا توجد ألوان داخلية لدرجة التجهيز هذه
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* نوع الاستيراد */}
              <FormField
                control={form.control}
                name="importType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="نوع الاستيراد" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableImportTypes.filter(type => type && type.trim()).map((type) => (
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

              {/* المسافة المقطوعة - للمركبات المستعملة فقط */}
              {form.watch("importType") === "مستعمل" && (
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="المسافة المقطوعة (كم)" 
                          type="number"
                          min="0"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="glass-input border-white/20 text-white placeholder:text-white/60"
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* نوع الملكية */}
              <FormField
                control={form.control}
                name="ownershipType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="نوع الملكية" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableOwnershipTypes.filter(type => type && type.trim()).map((type) => (
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

              {/* الموقع */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الموقع" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableLocations.filter(location => location && location.trim()).map((location) => (
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

              {/* الحالة */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableStatuses.filter(status => status && status.trim()).map((status) => (
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

              {/* رقم الهيكل */}
              <FormField
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="رقم الهيكل" 
                        className="glass-input border-white/20 text-white placeholder:text-white/60 font-latin" 
                        {...field} 
                      />
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
                    <FormControl>
                      <Input 
                        placeholder="السعر (ريال سعودي)" 
                        type="number"
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="glass-input border-white/20 text-white placeholder:text-white/60"
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* تاريخ البيع - يظهر فقط عند البيع */}
              {form.watch("isSold") && (
                <FormField
                  control={form.control}
                  name="soldDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          className="glass-input border-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* تاريخ الحجز - مخفي في نافذة الإضافة */}
              {false && (
                <FormField
                  control={form.control}
                  name="reservationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          className="glass-input border-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* محجوز بواسطة - مخفي في نافذة الإضافة */}
              {false && (
                <FormField
                  control={form.control}
                  name="reservedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="محجوز بواسطة"
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="glass-input border-white/20 text-white placeholder:text-white/60"
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* الملاحظات والمواصفات */}
            <div className="grid grid-cols-1 gap-4">
              {/* ملاحظة الحجز - مخفي في نافذة الإضافة */}
              {false && (
                <FormField
                  control={form.control}
                  name="reservationNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="ملاحظة الحجز"
                          className="glass-input border-white/20 text-white placeholder:text-white/60 min-h-[80px]"
                          value={field.value || ""}
                          onChange={field.onChange}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}



              {/* الملاحظات العامة */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="الملاحظات العامة"
                        className="glass-input border-white/20 text-white placeholder:text-white/60 min-h-[80px]"
                        value={field.value || ""}
                        onChange={field.onChange}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* أزرار الحفظ */}
            <div className="flex justify-center gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="glass-button px-8"
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-custom-gold hover:bg-custom-gold-dark text-white px-8"
              >
                {isLoading ? "جاري الحفظ..." : editItem ? "تحديث" : "حفظ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

    </Dialog>
  );
}
