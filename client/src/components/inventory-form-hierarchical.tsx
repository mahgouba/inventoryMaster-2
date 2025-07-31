import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInventoryItemSchema, type InsertInventoryItem, type InventoryItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";

interface InventoryFormHierarchicalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

interface HierarchicalOption {
  id: string;
  nameAr: string;
  nameEn: string;
  [key: string]: any;
}

interface ColorOption {
  id: string;
  name: string;
  code: string;
}

const initialYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const initialStatuses = ["متوفر", "في الطريق", "قيد الصيانة", "محجوز", "مباع"];
const initialImportTypes = ["شخصي", "شركة", "مستعمل شخصي"];
const initialOwnershipTypes = ["ملك الشركة", "عرض (وسيط)"];
const initialLocations = ["المستودع الرئيسي", "المعرض", "الورشة", "الميناء", "مستودع فرعي"];
const initialEngineCapacities = ["2.0L", "1.5L", "3.0L", "4.0L", "5.0L", "V6", "V8", "Electric"];

export default function InventoryFormHierarchical({ open, onOpenChange, editItem }: InventoryFormHierarchicalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hierarchical state
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTrimLevel, setSelectedTrimLevel] = useState<string>("");

  // Queries for hierarchical data
  const { data: manufacturers = [], isLoading: loadingManufacturers } = useQuery<HierarchicalOption[]>({
    queryKey: ["/api/hierarchical/manufacturers"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery<HierarchicalOption[]>({
    queryKey: [`/api/hierarchical/categories/${selectedManufacturer}`],
    enabled: Boolean(selectedManufacturer),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trimLevels = [], isLoading: loadingTrimLevels } = useQuery<HierarchicalOption[]>({
    queryKey: [`/api/hierarchical/trim-levels/${selectedManufacturer}/${selectedCategory}`],
    enabled: Boolean(selectedManufacturer && selectedCategory),
    staleTime: 5 * 60 * 1000,
  });

  const { data: exteriorColors = [], isLoading: loadingExteriorColors } = useQuery<ColorOption[]>({
    queryKey: [`/api/hierarchical/colors/${selectedManufacturer}/${selectedCategory}/${selectedTrimLevel}?type=exterior`],
    enabled: Boolean(selectedManufacturer && selectedCategory && selectedTrimLevel),
    staleTime: 5 * 60 * 1000,
  });

  const { data: interiorColors = [], isLoading: loadingInteriorColors } = useQuery<ColorOption[]>({
    queryKey: [`/api/hierarchical/colors/${selectedManufacturer}/${selectedCategory}/${selectedTrimLevel}?type=interior`],
    enabled: Boolean(selectedManufacturer && selectedCategory && selectedTrimLevel),
    staleTime: 5 * 60 * 1000,
  });

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
      ownershipType: "ملك الشركة",
      location: "المستودع الرئيسي",
      chassisNumber: "",
      images: [],
      notes: "",
      isSold: false,
      price: undefined,
      mileage: undefined,
    },
  });

  // Reset form when editing item
  useEffect(() => {
    if (editItem) {
      form.reset({
        manufacturer: editItem.manufacturer,
        category: editItem.category,
        trimLevel: editItem.trimLevel || "",
        engineCapacity: editItem.engineCapacity,
        year: editItem.year,
        exteriorColor: editItem.exteriorColor,
        interiorColor: editItem.interiorColor,
        status: editItem.status,
        importType: editItem.importType,
        ownershipType: editItem.ownershipType,
        location: editItem.location,
        chassisNumber: editItem.chassisNumber,
        images: editItem.images || [],
        notes: editItem.notes || "",
        isSold: editItem.isSold,
        price: editItem.price ? editItem.price.toString() : undefined,
        mileage: editItem.mileage || undefined,
      });
      setSelectedManufacturer(editItem.manufacturer);
      setSelectedCategory(editItem.category);
      setSelectedTrimLevel(editItem.trimLevel || "");
    } else {
      form.reset({
        manufacturer: "",
        category: "",
        trimLevel: "",
        engineCapacity: "",
        year: new Date().getFullYear(),
        exteriorColor: "",
        interiorColor: "",
        status: "متوفر",
        importType: "شخصي",
        ownershipType: "ملك الشركة",
        location: "المستودع الرئيسي",
        chassisNumber: "",
        images: [],
        notes: "",
        isSold: false,
        price: undefined,
        mileage: undefined,
      });
      setSelectedManufacturer("");
      setSelectedCategory("");
      setSelectedTrimLevel("");
    }
  }, [editItem, form]);

  // Handle cascading dropdowns
  const handleManufacturerChange = (value: string) => {
    setSelectedManufacturer(value);
    setSelectedCategory("");
    setSelectedTrimLevel("");
    form.setValue("manufacturer", value);
    form.setValue("category", "");
    form.setValue("trimLevel", "");
    form.setValue("exteriorColor", "");
    form.setValue("interiorColor", "");
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedTrimLevel("");
    form.setValue("category", value);
    form.setValue("trimLevel", "");
    form.setValue("exteriorColor", "");
    form.setValue("interiorColor", "");
  };

  const handleTrimLevelChange = (value: string) => {
    setSelectedTrimLevel(value);
    form.setValue("trimLevel", value);
    form.setValue("exteriorColor", "");
    form.setValue("interiorColor", "");
  };

  const createMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المركبة بنجاح",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المركبة",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => apiRequest("PUT", `/api/inventory/${editItem?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المركبة بنجاح",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المركبة",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-container max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="glass-header">
          <DialogTitle className="text-white text-xl font-bold text-center drop-shadow-md">
            {editItem ? "تعديل مركبة" : "إضافة مركبة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* الهيكل الهرمي - Hierarchical Structure */}
            <div className="glass-container p-6 space-y-4">
              <h3 className="text-white text-lg font-semibold drop-shadow-md">
                الهيكل الهرمي للمركبة
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Manufacturer */}
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">الصانع *</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={handleManufacturerChange}
                        disabled={loadingManufacturers}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder={loadingManufacturers ? "جاري التحميل..." : "اختر الصانع"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {manufacturers.map((manufacturer) => (
                            <SelectItem key={manufacturer.id} value={manufacturer.id}>
                              {manufacturer.nameAr} ({manufacturer.categoriesCount || 0} فئة)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">الفئة *</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={handleCategoryChange}
                        disabled={!selectedManufacturer || loadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder={
                              !selectedManufacturer ? "اختر الصانع أولاً" :
                              loadingCategories ? "جاري التحميل..." : "اختر الفئة"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.nameAr} ({category.trimLevelsCount || 0} درجة تجهيز)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trim Level */}
                <FormField
                  control={form.control}
                  name="trimLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">درجة التجهيز</FormLabel>
                      <Select 
                        value={field.value || ""} 
                        onValueChange={handleTrimLevelChange}
                        disabled={!selectedCategory || loadingTrimLevels}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder={
                              !selectedCategory ? "اختر الفئة أولاً" :
                              loadingTrimLevels ? "جاري التحميل..." : "اختر درجة التجهيز"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trimLevels.map((trimLevel) => (
                            <SelectItem key={trimLevel.id} value={trimLevel.id}>
                              {trimLevel.nameAr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-white/20" />

            {/* الألوان - Colors */}
            <div className="glass-container p-6 space-y-4">
              <h3 className="text-white text-lg font-semibold drop-shadow-md">
                ألوان المركبة
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exterior Color */}
                <FormField
                  control={form.control}
                  name="exteriorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">اللون الخارجي *</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={!selectedTrimLevel || loadingExteriorColors}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder={
                              !selectedTrimLevel ? "اختر درجة التجهيز أولاً" :
                              loadingExteriorColors ? "جاري التحميل..." : "اختر اللون الخارجي"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {exteriorColors.map((color) => (
                            <SelectItem key={color.id} value={color.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color.code }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interior Color */}
                <FormField
                  control={form.control}
                  name="interiorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">اللون الداخلي *</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={!selectedTrimLevel || loadingInteriorColors}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder={
                              !selectedTrimLevel ? "اختر درجة التجهيز أولاً" :
                              loadingInteriorColors ? "جاري التحميل..." : "اختر اللون الداخلي"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {interiorColors.map((color) => (
                            <SelectItem key={color.id} value={color.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color.code }}
                                />
                                {color.name}
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
            </div>

            <Separator className="bg-white/20" />

            {/* باقي المعلومات - Additional Information */}
            <div className="glass-container p-6 space-y-4">
              <h3 className="text-white text-lg font-semibold drop-shadow-md">
                معلومات إضافية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Engine Capacity */}
                <FormField
                  control={form.control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">سعة المحرك *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder="اختر سعة المحرك" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {initialEngineCapacities.map((capacity) => (
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

                {/* Year */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">السنة *</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder="اختر السنة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {initialYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">الحالة *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {initialStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Import Type */}
                <FormField
                  control={form.control}
                  name="importType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">نوع الاستيراد *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder="اختر نوع الاستيراد" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {initialImportTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ownership Type */}
                <FormField
                  control={form.control}
                  name="ownershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">نوع الملكية *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder="اختر نوع الملكية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {initialOwnershipTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">الموقع *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glass-container border-white/20">
                            <SelectValue placeholder="اختر الموقع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {initialLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Chassis Number */}
                <FormField
                  control={form.control}
                  name="chassisNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">رقم الهيكل *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="glass-container border-white/20 text-white placeholder:text-white/70" 
                          placeholder="أدخل رقم الهيكل"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">السعر (ريال)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          className="glass-container border-white/20 text-white placeholder:text-white/70" 
                          placeholder="أدخل السعر"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mileage */}
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium drop-shadow-sm">الممشي (كم)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="glass-container border-white/20 text-white placeholder:text-white/70" 
                          placeholder="أدخل الممشي"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-white/20" />

            {/* Notes */}
            <div className="glass-container p-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium drop-shadow-sm">ملاحظات إضافية</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="glass-container border-white/20 text-white placeholder:text-white/70 min-h-[100px]" 
                        placeholder="أدخل أي ملاحظات إضافية..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-black/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex flex-col xs:flex-row gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="glass-container border-white/30 text-white hover:bg-white/10"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "جاري الحفظ..."
                    : editItem
                    ? "تحديث المركبة"
                    : "إضافة المركبة"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}