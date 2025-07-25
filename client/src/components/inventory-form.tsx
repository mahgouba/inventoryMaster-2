import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventoryItemSchema, type InsertInventoryItem, type InventoryItem } from "@shared/schema";
import { CloudUpload, Settings, Move } from "lucide-react";
import OptionsEditor from "@/components/options-editor";
import EditableSelect from "@/components/editable-select";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: InventoryItem;
}

const manufacturerCategories: Record<string, string[]> = {
  "مرسيدس": ["E200", "C200", "C300", "S500", "GLE", "CLA", "A200"],
  "بي ام دبليو": ["X5", "X3", "X6", "320i", "520i", "730i", "M3"],
  "اودي": ["A4", "A6", "Q5", "Q7", "A3", "TT", "RS6"],
  "تويوتا": ["كامري", "كورولا", "لاند كروزر", "هايلاندر", "يارس", "أفالون"],
  "نيسان": ["التيما", "ماكسيما", "باترول", "اكس تريل", "سنترا", "مورانو"],
  "هوندا": ["أكورد", "سيفيك", "بايلوت", "CR-V", "HR-V"],
  "فورد": ["فوكس", "فيوجن", "اكسبلورر", "F-150", "موستانغ"],
  "هيونداي": ["النترا", "سوناتا", "توسان", "سانتا في", "أكسنت"]
};

const initialManufacturers = Object.keys(manufacturerCategories);
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
  
  const [selectedManufacturer, setSelectedManufacturer] = useState(editItem?.manufacturer || "");
  const [availableCategories, setAvailableCategories] = useState<string[]>(
    editItem?.manufacturer ? manufacturerCategories[editItem.manufacturer] || [] : []
  );
  const [isEditingOptions, setIsEditingOptions] = useState(false);
  
  // Local state for editable lists
  const [editableManufacturers, setEditableManufacturers] = useState<string[]>(initialManufacturers);
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

  // Handle manufacturer change
  const handleManufacturerChange = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
    setAvailableCategories(manufacturerCategories[manufacturer] || []);
    
    // Reset category when manufacturer changes
    form.setValue("manufacturer", manufacturer);
    form.setValue("category", "");
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
      setSelectedManufacturer(editItem.manufacturer || "");
      setAvailableCategories(manufacturerCategories[editItem.manufacturer] || []);
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
      setSelectedManufacturer("");
      setAvailableCategories([]);
    }
  }, [editItem, form]);

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full" draggable={true}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-gray-400" />
              <DialogTitle className="text-lg font-semibold text-slate-800">
                {editItem ? "تحرير العنصر" : "إضافة عنصر جديد"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-slate-600">
            {editItem ? "قم بتحرير بيانات المركبة وحفظ التغييرات" : "أدخل بيانات المركبة الجديدة لإضافتها للمخزون"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingOptions(!isEditingOptions)}
                  className="text-xs"
                >
                  <Settings className="h-4 w-4 ml-1" />
                  {isEditingOptions ? "حفظ التعديلات" : "تحرير القوائم"}
                </Button>
              </div>
              {/* Manufacturer Field - First */}
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصانع</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableManufacturers}
                        value={field.value}
                        onValueChange={(value) => {
                          handleManufacturerChange(value);
                          field.onChange(value);
                        }}
                        onAddOption={(newManufacturer) => {
                          setEditableManufacturers([...editableManufacturers, newManufacturer]);
                        }}
                        onDeleteOption={(deletedManufacturer) => {
                          setEditableManufacturers(editableManufacturers.filter(m => m !== deletedManufacturer));
                        }}
                        onEditOption={(oldManufacturer, newManufacturer) => {
                          setEditableManufacturers(editableManufacturers.map(m => m === oldManufacturer ? newManufacturer : m));
                        }}
                        placeholder="اختر الصانع"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.length > 0 ? (
                            availableCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="no-manufacturer">
                              يرجى اختيار الصانع أولاً
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trimLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>درجة التجهيز</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="فل كامل، ستاندرد، خاص"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سعة المحرك</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableEngineCapacities}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newCapacity) => {
                          setEditableEngineCapacities([...editableEngineCapacities, newCapacity]);
                        }}
                        placeholder="اختر سعة المحرك"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السنة</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value?.toString()}>
                        <SelectTrigger>
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

              <FormField
                control={form.control}
                name="exteriorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون الخارجي</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableExteriorColors}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newColor) => {
                          setEditableExteriorColors([...editableExteriorColors, newColor]);
                        }}
                        placeholder="اختر اللون الخارجي"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interiorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون الداخلي</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableInteriorColors}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newColor) => {
                          setEditableInteriorColors([...editableInteriorColors, newColor]);
                        }}
                        placeholder="اختر اللون الداخلي"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاستيراد</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableImportTypes}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newType) => {
                          setEditableImportTypes([...editableImportTypes, newType]);
                        }}
                        placeholder="اختر نوع الاستيراد"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mileage - Only show for used vehicles */}
              {(form.watch("importType") === "مستعمل" || form.watch("importType") === "مستعمل شخصي") && (
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ممشي السيارة (كم)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل عدد الكيلومترات" 
                          type="number"
                          min="0"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="ownershipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الملكية</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableOwnershipTypes}
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        onAddOption={(newType) => {
                          setEditableOwnershipTypes([...editableOwnershipTypes, newType]);
                        }}
                        placeholder="اختر نوع الملكية"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموقع</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableLocations}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newLocation) => {
                          setEditableLocations([...editableLocations, newLocation]);
                        }}
                        placeholder="اختر الموقع"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <FormControl>
                      <EditableSelect
                        options={editableStatuses}
                        value={field.value}
                        onValueChange={field.onChange}
                        onAddOption={(newStatus) => {
                          setEditableStatuses([...editableStatuses, newStatus]);
                        }}
                        placeholder="اختر الحالة"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهيكل</FormLabel>
                    <FormControl>
                      <Input placeholder="WASSBER0000000" className="font-latin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر (ريال سعودي)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="150000" 
                        type="number"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Sold Status */}
              <FormField
                control={form.control}
                name="isSold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة البيع</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value === "true")} 
                              value={field.value ? "true" : "false"}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة البيع" />
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

              {/* Sold Date - Only show if sold */}
              {form.watch("isSold") && (
                <FormField
                  control={form.control}
                  name="soldDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ البيع</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Reservation Date */}
              <FormField
                control={form.control}
                name="reservationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الحجز</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reserved By */}
              <FormField
                control={form.control}
                name="reservedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محجوز بواسطة</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="اسم العميل الذي حجز السيارة"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reservation Note */}
              <FormField
                control={form.control}
                name="reservationNote"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>ملاحظة الحجز</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="تفاصيل الحجز والملاحظات الخاصة بالعميل..."
                        className="min-h-[80px]"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Detailed Specifications */}
              <FormField
                control={form.control}
                name="detailedSpecifications"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>المواصفات التفصيلية</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="المواصفات التفصيلية الخاصة بهذه السيارة (المحرك، الأداء، المميزات، إلخ)..."
                        className="min-h-[120px]"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* General Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>الملاحظات العامة</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أدخل الملاحظات العامة هنا..."
                        className="min-h-[100px]"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-custom-gold hover:bg-custom-gold-dark text-white">
                {isLoading ? "جاري الحفظ..." : editItem ? "تحديث العنصر" : "حفظ العنصر"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
