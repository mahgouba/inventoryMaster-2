import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Specification {
  id: number;
  manufacturer: string;
  category: string;
  trimLevel: string;
  engineCapacity: string;
  modelYear: number;
  detailedSpecs: string;
  createdAt: string;
  updatedAt: string;
}

interface SpecificationsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SpecificationsManager({ open, onOpenChange }: SpecificationsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSpec, setEditingSpec] = useState<Specification | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    manufacturer: "",
    category: "",
    trimLevel: "",
    engineCapacity: "",
    modelYear: new Date().getFullYear(),
    detailedSpecs: ""
  });

  const queryClient = useQueryClient();

  // Get unique values from inventory for dropdowns
  const { data: inventoryData = [] } = useQuery({
    queryKey: ['/api/inventory'],
    enabled: open
  });

  // Get specifications
  const { data: specifications = [], isLoading } = useQuery({
    queryKey: ['/api/specifications'],
    enabled: open
  });

  // Create/Update specification
  const saveSpecMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingSpec) {
        return apiRequest(`/api/specifications/${editingSpec.id}`, {
          method: 'PUT',
          body: data
        });
      } else {
        return apiRequest('/api/specifications', {
          method: 'POST',
          body: data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/specifications'] });
      toast({
        title: editingSpec ? "تم تحديث المواصفات" : "تم إنشاء المواصفات",
        description: editingSpec ? "تم تحديث المواصفات بنجاح" : "تم إنشاء المواصفات بنجاح"
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ المواصفات",
        variant: "destructive"
      });
    }
  });

  // Delete specification
  const deleteSpecMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/specifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/specifications'] });
      toast({
        title: "تم حذف المواصفات",
        description: "تم حذف المواصفات بنجاح"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف المواصفات",
        variant: "destructive"
      });
    }
  });

  // Extract unique values from inventory
  const uniqueManufacturers = [...new Set(inventoryData.map((item: any) => item.manufacturer))];
  const uniqueCategories = [...new Set(inventoryData.map((item: any) => item.category))];
  const uniqueEngineCapacities = [...new Set(inventoryData.map((item: any) => item.engineCapacity))];

  // Filter specifications based on search
  const filteredSpecs = specifications.filter((spec: Specification) =>
    spec.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.trimLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      manufacturer: "",
      category: "",
      trimLevel: "",
      engineCapacity: "",
      modelYear: new Date().getFullYear(),
      detailedSpecs: ""
    });
    setEditingSpec(null);
    setShowForm(false);
  };

  const handleEdit = (spec: Specification) => {
    setEditingSpec(spec);
    setFormData({
      manufacturer: spec.manufacturer,
      category: spec.category,
      trimLevel: spec.trimLevel,
      engineCapacity: spec.engineCapacity,
      modelYear: spec.modelYear,
      detailedSpecs: spec.detailedSpecs
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.manufacturer || !formData.category || !formData.trimLevel) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    saveSpecMutation.mutate(formData);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      setSearchTerm("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">إدارة المواصفات</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Add Button */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث في المواصفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-right"
              />
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة مواصفات جديدة
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-right">
                  {editingSpec ? "تعديل المواصفات" : "إضافة مواصفات جديدة"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="manufacturer" className="text-right block mb-2">
                        الصانع *
                      </Label>
                      <Select
                        value={formData.manufacturer}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, manufacturer: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصانع" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueManufacturers.map(manufacturer => (
                            <SelectItem key={manufacturer} value={manufacturer}>
                              {manufacturer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-right block mb-2">
                        الفئة *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="trimLevel" className="text-right block mb-2">
                        درجة التجهيز *
                      </Label>
                      <Input
                        id="trimLevel"
                        value={formData.trimLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, trimLevel: e.target.value }))}
                        placeholder="مثال: فل كامل، استاندرد"
                        className="text-right"
                      />
                    </div>

                    <div>
                      <Label htmlFor="engineCapacity" className="text-right block mb-2">
                        سعة المحرك
                      </Label>
                      <Select
                        value={formData.engineCapacity}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, engineCapacity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر سعة المحرك" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueEngineCapacities.map(capacity => (
                            <SelectItem key={capacity} value={capacity}>
                              {capacity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="modelYear" className="text-right block mb-2">
                        الموديل
                      </Label>
                      <Input
                        id="modelYear"
                        type="number"
                        value={formData.modelYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, modelYear: parseInt(e.target.value) }))}
                        className="text-right"
                        min="1900"
                        max="2030"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="detailedSpecs" className="text-right block mb-2">
                      المواصفات التفصيلية
                    </Label>
                    <Textarea
                      id="detailedSpecs"
                      value={formData.detailedSpecs}
                      onChange={(e) => setFormData(prev => ({ ...prev, detailedSpecs: e.target.value }))}
                      placeholder="اكتب المواصفات التفصيلية هنا..."
                      className="text-right min-h-32"
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveSpecMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saveSpecMutation.isPending ? "جاري الحفظ..." : (editingSpec ? "تحديث" : "حفظ")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Specifications List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : filteredSpecs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "لم يتم العثور على مواصفات مطابقة" : "لا توجد مواصفات محفوظة"}
              </div>
            ) : (
              filteredSpecs.map((spec: Specification) => (
                <Card key={spec.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {spec.manufacturer} {spec.category}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {spec.trimLevel}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                          <div>سعة المحرك: {spec.engineCapacity}</div>
                          <div>الموديل: {spec.modelYear}</div>
                          <div>تاريخ الإنشاء: {new Date(spec.createdAt).toLocaleDateString('ar-SA')}</div>
                        </div>
                        {spec.detailedSpecs && (
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <div className="font-medium mb-1">المواصفات التفصيلية:</div>
                            <div className="whitespace-pre-wrap">{spec.detailedSpecs}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(spec)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSpecMutation.mutate(spec.id)}
                          disabled={deleteSpecMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}