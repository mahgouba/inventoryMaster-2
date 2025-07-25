import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, Save, X, FileText } from "lucide-react";
import type { Specification, InsertSpecification, TrimLevel } from "@shared/schema";

interface SpecificationsManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SpecificationsManagement({ open, onOpenChange }: SpecificationsManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specification | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTrimLevel, setSelectedTrimLevel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedEngineCapacity, setSelectedEngineCapacity] = useState("");
  const [selectedChassisNumber, setSelectedChassisNumber] = useState("");
  const [description, setDescription] = useState("");

  // Fetch all specifications
  const { data: specifications = [], isLoading } = useQuery<Specification[]>({
    queryKey: ["/api/specifications"],
    enabled: open,
  });

  // Fetch data for dropdowns
  const { data: trimLevels = [] } = useQuery<TrimLevel[]>({
    queryKey: ["/api/trim-levels"],
    enabled: open,
  });

  // Fetch manufacturers from database
  const { data: manufacturersData = [] } = useQuery<any[]>({
    queryKey: ["/api/manufacturers"],
    enabled: open,
  });

  // Fetch manufacturers from cars.json
  const { data: carsManufacturers = [] } = useQuery<any[]>({
    queryKey: ["/api/cars/manufacturers"],
    enabled: open,
  });

  // Fetch categories/models from cars.json for selected manufacturer
  const { data: carsModels = [] } = useQuery<any[]>({
    queryKey: [`/api/cars/models/${selectedManufacturer}`],
    enabled: open && !!selectedManufacturer,
  });

  // Fetch trim levels from cars.json for selected manufacturer and category
  const { data: carsTrims = [] } = useQuery<any[]>({
    queryKey: [`/api/cars/trims/${selectedManufacturer}/${selectedCategory}`],
    enabled: open && !!selectedManufacturer && !!selectedCategory,
  });

  // Fetch engines from cars.json
  const { data: carsEngines = [] } = useQuery<any[]>({
    queryKey: ["/api/cars/engines"],
    enabled: open,
  });

  // Get all manufacturers (combine database and cars.json)
  const allManufacturers = [
    ...carsManufacturers.map(m => m.name_ar),
    ...manufacturersData.map(m => m.name)
  ].filter((value, index, self) => self.indexOf(value) === index);

  // Get categories for selected manufacturer from cars.json
  const categories = carsModels.map(model => model.model_ar) || [];

  // Get trim levels from cars.json
  const allTrimLevelNames = carsTrims.map(trim => trim.trim_ar) || [];

  // Generate available years (recent years)
  const availableYears = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

  // Get engine capacities from cars.json
  const engineCapacities = carsEngines.map(engine => engine.engine) || [];

  const createMutation = useMutation({
    mutationFn: (data: InsertSpecification) => apiRequest("POST", "/api/specifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/specifications"] });
      resetForm();
      toast({
        title: "تم إضافة المواصفات بنجاح",
        description: "تم إضافة الوصف التفصيلي للسيارة",
      });
    },
    onError: (error) => {
      console.error("Error creating specification:", error);
      toast({
        title: "خطأ في إضافة المواصفات",
        description: "حدث خطأ أثناء إضافة الوصف التفصيلي",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertSpecification> }) =>
      apiRequest("PUT", `/api/specifications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/specifications"] });
      resetForm();
      toast({
        title: "تم تحديث المواصفات بنجاح",
        description: "تم تحديث الوصف التفصيلي للسيارة",
      });
    },
    onError: (error) => {
      console.error("Error updating specification:", error);
      toast({
        title: "خطأ في تحديث المواصفات",
        description: "حدث خطأ أثناء تحديث الوصف التفصيلي",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/specifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/specifications"] });
      toast({
        title: "تم حذف المواصفات بنجاح",
        description: "تم حذف الوصف التفصيلي للسيارة",
      });
    },
    onError: (error) => {
      console.error("Error deleting specification:", error);
      toast({
        title: "خطأ في حذف المواصفات",
        description: "حدث خطأ أثناء حذف الوصف التفصيلي",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingSpec(null);
    setSelectedManufacturer("");
    setSelectedCategory("");
    setSelectedTrimLevel("");
    setSelectedYear("");
    setSelectedEngineCapacity("");
    setSelectedChassisNumber("");
    setDescription("");
  };

  const handleSubmit = () => {
    if (!selectedManufacturer || !selectedCategory || !selectedTrimLevel || !selectedYear || !selectedEngineCapacity || !description.trim()) {
      toast({
        title: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const data = {
      manufacturer: selectedManufacturer,
      category: selectedCategory,
      trimLevel: selectedTrimLevel,
      year: parseInt(selectedYear),
      engineCapacity: selectedEngineCapacity,
      chassisNumber: selectedChassisNumber || undefined,
      detailedDescription: description,
    };

    if (editingSpec) {
      updateMutation.mutate({ id: editingSpec.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (spec: Specification) => {
    setEditingSpec(spec);
    setSelectedManufacturer(spec.manufacturer);
    setSelectedCategory(spec.category);
    setSelectedTrimLevel(spec.trimLevel);
    setSelectedYear(spec.year.toString());
    setSelectedEngineCapacity(String(spec.engineCapacity || ''));
    setSelectedChassisNumber(spec.chassisNumber || '');
    setDescription(spec.detailedDescription);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المواصفات؟")) {
      deleteMutation.mutate(id);
    }
  };

  // Use years from filtered data instead of hardcoded range

  const handleManufacturerChange = (value: string) => {
    setSelectedManufacturer(value);
    // Reset dependent fields when manufacturer changes
    setSelectedCategory("");
    setSelectedTrimLevel("");
    setSelectedYear("");
    setSelectedEngineCapacity("");
    setSelectedChassisNumber("");
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Reset dependent fields when category changes
    setSelectedTrimLevel("");
    setSelectedYear("");
    setSelectedEngineCapacity("");
    setSelectedChassisNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            إدارة المواصفات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 ml-1" />
              إضافة مواصفات جديدة
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingSpec ? "تعديل المواصفات" : "إضافة مواصفات جديدة"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufacturer">الصانع</Label>
                    <Select value={selectedManufacturer} onValueChange={handleManufacturerChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصانع" />
                      </SelectTrigger>
                      <SelectContent>
                        {allManufacturers.map((manufacturer, index) => {
                          const manufacturerValue = typeof manufacturer === 'string' ? manufacturer : (manufacturer.name || String(manufacturer));
                          return (
                            <SelectItem key={`${manufacturerValue}-${index}`} value={manufacturerValue}>
                              {manufacturerValue}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">الفئة</Label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={!selectedManufacturer}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category, index) => {
                          const categoryValue = typeof category === 'string' ? category : (category.category || String(category));
                          return (
                            <SelectItem key={`${categoryValue}-${index}`} value={categoryValue}>
                              {categoryValue}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="trimLevel">درجة التجهيز</Label>
                    <Select value={selectedTrimLevel} onValueChange={setSelectedTrimLevel} disabled={!selectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر درجة التجهيز" />
                      </SelectTrigger>
                      <SelectContent>
                        {allTrimLevelNames.map((trimLevel, index) => {
                          const trimLevelValue = typeof trimLevel === 'string' ? trimLevel : (trimLevel.trimLevel || String(trimLevel));
                          return (
                            <SelectItem key={`${trimLevelValue}-${index}`} value={trimLevelValue}>
                              {trimLevelValue}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="year">السنة</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر السنة" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year, index) => (
                          <SelectItem key={`${year}-${index}`} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="engineCapacity">سعة المحرك</Label>
                    <Select value={selectedEngineCapacity} onValueChange={setSelectedEngineCapacity}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سعة المحرك" />
                      </SelectTrigger>
                      <SelectContent>
                        {engineCapacities.map((capacity, index) => {
                          const capacityValue = typeof capacity === 'string' ? capacity : (capacity.engineCapacity || String(capacity));
                          return (
                            <SelectItem key={`${capacityValue}-${index}`} value={capacityValue}>
                              {capacityValue}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="chassisNumber">رقم الهيكل (اختياري)</Label>
                  <Input
                    id="chassisNumber"
                    value={selectedChassisNumber}
                    onChange={(e) => setSelectedChassisNumber(e.target.value)}
                    placeholder="رقم الهيكل للربط بسيارة معينة"
                    dir="ltr"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    إذا كنت تريد ربط المواصفات بسيارة معينة، أدخل رقم الهيكل
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">الوصف التفصيلي</Label>
                  <Textarea
                    id="description"
                    placeholder="اكتب الوصف التفصيلي للسيارة..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 ml-1" />
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-custom-gold hover:bg-custom-gold-dark text-white"
                  >
                    <Save className="h-4 w-4 ml-1" />
                    {editingSpec ? "تحديث" : "حفظ"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specifications List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المواصفات المحفوظة</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-slate-600 mt-2">جاري التحميل...</p>
              </div>
            ) : specifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-400 text-4xl mb-2">📋</div>
                <p className="text-sm text-slate-600">لا توجد مواصفات مضافة</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {specifications.map((spec) => (
                  <Card key={spec.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {spec.manufacturer} {spec.category}
                          </CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{spec.trimLevel}</Badge>
                            <Badge variant="outline">{spec.year}</Badge>
                            <Badge variant="outline">{String(spec.engineCapacity || '')}</Badge>
                            {spec.chassisNumber && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                هيكل: {spec.chassisNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(spec)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(spec.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{spec.detailedDescription}</p>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>تم الإنشاء: {new Date(spec.createdAt).toLocaleDateString('ar-SA')}</span>
                        <span>آخر تحديث: {new Date(spec.updatedAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}