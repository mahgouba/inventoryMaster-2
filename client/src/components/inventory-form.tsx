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
import { CloudUpload } from "lucide-react";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

// Database types for hierarchical data
interface Manufacturer {
  id: number;
  nameAr: string;
  nameEn: string;
  logo?: string;
}

interface Category {
  id: number;
  manufacturer_id: number;
  nameAr: string;
  nameEn: string;
}

interface TrimLevel {
  id: number;
  category_id: number;
  nameAr: string;
  nameEn: string;
}
const initialEngineCapacities = ["2.0L", "1.5L", "3.0L", "4.0L", "5.0L", "V6", "V8"];
const initialYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const initialStatuses = ["متوفر", "في الطريق", "قيد الصيانة"];
const initialImportTypes = ["شخصي", "شركة", "مستعمل شخصي"];
const initialOwnershipTypes = ["ملك الشركة", "عرض (وسيط)"];
const initialLocations = ["المستودع الرئيسي", "المعرض", "الورشة", "الميناء", "مستودع فرعي"];
const initialColors = ["أسود", "أبيض", "رمادي", "أزرق", "أحمر", "بني", "فضي", "ذهبي", "بيج"];

export default function InventoryForm({ open, onOpenChange, editItem }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditingOptions, setIsEditingOptions] = useState(false);
  
  // Local state for editable lists (keeping the same structure for other dropdowns)
  const [editableEngineCapacities, setEditableEngineCapacities] = useState<string[]>(initialEngineCapacities);
  const [editableStatuses, setEditableStatuses] = useState<string[]>(initialStatuses);
  const [editableImportTypes, setEditableImportTypes] = useState<string[]>(initialImportTypes);
  const [editableOwnershipTypes, setEditableOwnershipTypes] = useState<string[]>(initialOwnershipTypes);
  const [editableLocations, setEditableLocations] = useState<string[]>(initialLocations);
  const [editableExteriorColors, setEditableExteriorColors] = useState<string[]>(initialColors);
  const [editableInteriorColors, setEditableInteriorColors] = useState<string[]>(initialColors);
  
  // Options editor state
  const [editingOptionType, setEditingOptionType] = useState<string | null>(null);

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

  // Fetch manufacturers from database
  const { data: manufacturers = [], isLoading: isLoadingManufacturers } = useQuery<Manufacturer[]>({
    queryKey: ["/api/hierarchical/manufacturers"],
    enabled: open, // Only fetch when dialog is open
  });
  
  // Get current manufacturer name for categories query
  const selectedManufacturerName = form.watch("manufacturer");
  
  // Get current category name for trim levels query  
  const selectedCategoryName = form.watch("category");
  
  // Fetch categories based on selected manufacturer
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/hierarchical/categories", selectedManufacturerName],
    queryFn: () => 
      selectedManufacturerName 
        ? fetch(`/api/hierarchical/categories?manufacturer=${encodeURIComponent(selectedManufacturerName)}`).then(res => res.json())
        : Promise.resolve([]),
    enabled: open && !!selectedManufacturerName,
  });
  
  // Fetch trim levels based on selected category
  const { data: trimLevels = [], isLoading: isLoadingTrimLevels } = useQuery<TrimLevel[]>({
    queryKey: ["/api/hierarchical/trimLevels", selectedManufacturerName, selectedCategoryName],
    queryFn: () => 
      selectedManufacturerName && selectedCategoryName
        ? fetch(`/api/hierarchical/trimLevels?manufacturer=${encodeURIComponent(selectedManufacturerName)}&category=${encodeURIComponent(selectedCategoryName)}`).then(res => res.json())
        : Promise.resolve([]),
    enabled: open && !!selectedManufacturerName && !!selectedCategoryName,
  });

  // Handle manufacturer change
  const handleManufacturerChange = (manufacturerName: string) => {
    // Update form values and reset dependent fields
    form.setValue("manufacturer", manufacturerName);
    form.setValue("category", "");
    form.setValue("trimLevel", "");
  };

  // Handle category change
  const handleCategoryChange = (categoryName: string) => {
    // Update form values and reset dependent fields
    form.setValue("category", categoryName);
    form.setValue("trimLevel", "");
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
          <DialogTitle className="text-xl font-bold text-white text-center">
            {editItem ? "تحرير المركبة" : "إضافة مركبة جديدة"}
          </DialogTitle>
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
                      }} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الصانع" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingManufacturers ? (
                            <SelectItem disabled value="loading">
                              جاري التحميل...
                            </SelectItem>
                          ) : manufacturers.length > 0 ? (
                            manufacturers.map((manufacturer) => (
                              <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                                {manufacturer.nameAr}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="no-data">
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
                      }} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <SelectItem disabled value="loading">
                              جاري التحميل...
                            </SelectItem>
                          ) : !selectedManufacturerName ? (
                            <SelectItem disabled value="no-manufacturer">
                              اختر الصانع أولاً
                            </SelectItem>
                          ) : categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.nameAr}>
                                {category.nameAr}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="no-categories">
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="درجة التجهيز" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingTrimLevels ? (
                            <SelectItem disabled value="loading">
                              جاري التحميل...
                            </SelectItem>
                          ) : !selectedCategoryName ? (
                            <SelectItem disabled value="no-category">
                              اختر الفئة أولاً
                            </SelectItem>
                          ) : trimLevels.length > 0 ? (
                            trimLevels.map((trimLevel) => (
                              <SelectItem key={trimLevel.id} value={trimLevel.nameAr}>
                                {trimLevel.nameAr}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="no-trim-levels">
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="سعة المحرك" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableEngineCapacities.map((capacity) => (
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
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value?.toString()}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="السنة" />
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

              {/* اللون الخارجي */}
              <FormField
                control={form.control}
                name="exteriorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="اللون الخارجي" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableExteriorColors.map((color) => (
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
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="اللون الداخلي" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableInteriorColors.map((color) => (
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

              {/* نوع الاستيراد */}
              <FormField
                control={form.control}
                name="importType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="نوع الاستيراد" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableImportTypes.map((type) => (
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
              {(form.watch("importType") === "مستعمل" || form.watch("importType") === "مستعمل شخصي") && (
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="نوع الملكية" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableOwnershipTypes.map((type) => (
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الموقع" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableLocations.map((location) => (
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {editableStatuses.map((status) => (
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

              {/* حالة البيع */}
              <FormField
                control={form.control}
                name="isSold"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value === "true")} 
                              value={field.value ? "true" : "false"}>
                        <SelectTrigger className="glass-input border-white/20 text-white">
                          <SelectValue placeholder="حالة البيع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">متوفر</SelectItem>
                          <SelectItem value="true">مباع</SelectItem>
                        </SelectContent>
                      </Select>
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

              {/* المواصفات التفصيلية */}
              <FormField
                control={form.control}
                name="detailedSpecifications"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="المواصفات التفصيلية"
                        className="glass-input border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                        value={field.value || ""}
                        onChange={field.onChange}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
