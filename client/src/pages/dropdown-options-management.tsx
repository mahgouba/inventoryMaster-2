import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Building2,
  Car,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Palette,
  Save,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";

interface Manufacturer {
  id: number;
  nameAr: string;
  nameEn?: string;
  logo?: string;
  isActive?: boolean;
}

interface Category {
  id: number;
  name_ar: string;
  name_en?: string;
  manufacturer_id: number;
  isActive?: boolean;
}

interface TrimLevel {
  id: number;
  name_ar: string;
  name_en?: string;
  category_id: number;
  isActive?: boolean;
}

interface Color {
  id: number;
  name: string;
  name_en?: string;
  code: string;
  type: 'exterior' | 'interior';
  manufacturer_id?: number;
  category_id?: number;
  trim_level_id?: number;
  isActive?: boolean;
}

interface HierarchyData {
  manufacturer: Manufacturer;
  categories: {
    category: Category;
    trimLevels: TrimLevel[];
    colors: Color[];
  }[];
  colors: Color[];
}

export default function DropdownOptionsManagement() {
  const queryClient = useQueryClient();
  
  // State for expanded items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // State for modals
  const [isAddManufacturerOpen, setIsAddManufacturerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTrimLevelOpen, setIsAddTrimLevelOpen] = useState(false);
  const [isAddColorOpen, setIsAddColorOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<{ type: string; id: number; data: any } | null>(null);
  
  // Form states for adding new items
  const [manufacturerNameAr, setManufacturerNameAr] = useState("");
  const [manufacturerNameEn, setManufacturerNameEn] = useState("");
  const [manufacturerLogo, setManufacturerLogo] = useState("");
  
  const [categoryNameAr, setCategoryNameAr] = useState("");
  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<number | null>(null);
  
  const [trimLevelNameAr, setTrimLevelNameAr] = useState("");
  const [trimLevelNameEn, setTrimLevelNameEn] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  const [colorName, setColorName] = useState("");
  const [colorNameEn, setColorNameEn] = useState("");
  const [colorCode, setColorCode] = useState("#FFFFFF");
  const [colorType, setColorType] = useState<'exterior' | 'interior'>('exterior');
  const [colorManufacturerId, setColorManufacturerId] = useState<number | null>(null);
  const [colorCategoryId, setColorCategoryId] = useState<number | null>(null);
  const [colorTrimLevelId, setColorTrimLevelId] = useState<number | null>(null);

  // Fetch data
  const { data: hierarchyData = [], isLoading } = useQuery({
    queryKey: ['/api/hierarchy/full'],
  });

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/hierarchical/manufacturers'],
  });

  // Toggle expanded state
  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  // Add manufacturer mutation
  const addManufacturerMutation = useMutation({
    mutationFn: async (data: { nameAr: string; nameEn?: string; logo?: string }) => {
      return apiRequest('POST', '/api/hierarchical/manufacturers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة الصانع",
        description: `تم إضافة صانع "${manufacturerNameAr}" بنجاح`,
      });
      setManufacturerNameAr("");
      setManufacturerNameEn("");
      setManufacturerLogo("");
      setIsAddManufacturerOpen(false);
      queryClient.refetchQueries({ queryKey: ['/api/hierarchy/full'] });
    },
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: { name_ar: string; name_en?: string; manufacturer_id: number }) => {
      return apiRequest('POST', '/api/hierarchical/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة الفئة",
        description: `تم إضافة فئة "${categoryNameAr}" بنجاح`,
      });
      setCategoryNameAr("");
      setCategoryNameEn("");
      setSelectedManufacturerId(null);
      setIsAddCategoryOpen(false);
      queryClient.refetchQueries({ queryKey: ['/api/hierarchy/full'] });
    },
  });

  // Add trim level mutation
  const addTrimLevelMutation = useMutation({
    mutationFn: async (data: { name_ar: string; name_en?: string; category_id: number }) => {
      return apiRequest('POST', '/api/hierarchical/trimLevels', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة درجة التجهيز",
        description: `تم إضافة درجة التجهيز "${trimLevelNameAr}" بنجاح`,
      });
      setTrimLevelNameAr("");
      setTrimLevelNameEn("");
      setSelectedCategoryId(null);
      setIsAddTrimLevelOpen(false);
      queryClient.refetchQueries({ queryKey: ['/api/hierarchy/full'] });
    },
  });

  // Add color mutation
  const addColorMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      name_en?: string; 
      code: string; 
      type: 'exterior' | 'interior';
      manufacturer_id?: number;
      category_id?: number;
      trim_level_id?: number;
    }) => {
      return apiRequest('POST', '/api/hierarchical/colors', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة اللون",
        description: `تم إضافة لون "${colorName}" بنجاح`,
      });
      setColorName("");
      setColorNameEn("");
      setColorCode("#FFFFFF");
      setColorType('exterior');
      setColorManufacturerId(null);
      setColorCategoryId(null);
      setColorTrimLevelId(null);
      setIsAddColorOpen(false);
      queryClient.refetchQueries({ queryKey: ['/api/hierarchy/full'] });
    },
  });

  // Delete mutations
  const deleteManufacturerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/manufacturers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الصانع بنجاح" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الفئة بنجاح" });
    },
  });

  const deleteTrimLevelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/trimLevels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف درجة التجهيز بنجاح" });
    },
  });

  // Toggle visibility mutations
  const toggleManufacturerVisibilityMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/hierarchical/manufacturers/${id}/visibility`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم تحديث حالة الصانع" });
    },
  });

  const toggleCategoryVisibilityMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/hierarchical/categories/${id}/visibility`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم تحديث حالة الفئة" });
    },
  });

  const toggleTrimLevelVisibilityMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/hierarchical/trimLevels/${id}/visibility`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم تحديث حالة درجة التجهيز" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">جاري تحميل البيانات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-container p-6">
          <h1 className="text-3xl font-bold text-white text-center mb-4">
            إدارة خيارات القوائم
          </h1>
          <p className="text-gray-300 text-center">
            إدارة الصناع والفئات ودرجات التجهيز والألوان
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Dialog open={isAddManufacturerOpen} onOpenChange={setIsAddManufacturerOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button h-16 text-lg">
                <Building2 className="h-6 w-6 ml-2" />
                إضافة صانع
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة صانع جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">الاسم بالعربية *</Label>
                  <Input
                    value={manufacturerNameAr}
                    onChange={(e) => setManufacturerNameAr(e.target.value)}
                    placeholder="أدخل اسم الصانع بالعربية"
                    className="glass-input text-right"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">الاسم بالإنجليزية</Label>
                  <Input
                    value={manufacturerNameEn}
                    onChange={(e) => setManufacturerNameEn(e.target.value)}
                    placeholder="أدخل اسم الصانع بالإنجليزية"
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">رابط الشعار</Label>
                  <Input
                    value={manufacturerLogo}
                    onChange={(e) => setManufacturerLogo(e.target.value)}
                    placeholder="أدخل رابط شعار الصانع"
                    className="glass-input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!manufacturerNameAr.trim()) {
                        toast({
                          title: "خطأ",
                          description: "يرجى إدخال اسم الصانع بالعربية",
                          variant: "destructive",
                        });
                        return;
                      }
                      addManufacturerMutation.mutate({
                        nameAr: manufacturerNameAr,
                        nameEn: manufacturerNameEn || undefined,
                        logo: manufacturerLogo || undefined,
                      });
                    }}
                    disabled={addManufacturerMutation.isPending}
                    className="glass-button flex-1"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </Button>
                  <Button
                    onClick={() => {
                      setManufacturerNameAr("");
                      setManufacturerNameEn("");
                      setManufacturerLogo("");
                      setIsAddManufacturerOpen(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button h-16 text-lg">
                <Car className="h-6 w-6 ml-2" />
                إضافة فئة
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة فئة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">الصانع *</Label>
                  <Select value={selectedManufacturerId?.toString()} onValueChange={(value) => setSelectedManufacturerId(Number(value))}>
                    <SelectTrigger className="glass-input text-right">
                      <SelectValue placeholder="اختر الصانع" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(manufacturers) && manufacturers.map((manufacturer: Manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-right block mb-2">اسم الفئة بالعربية *</Label>
                  <Input
                    value={categoryNameAr}
                    onChange={(e) => setCategoryNameAr(e.target.value)}
                    placeholder="أدخل اسم الفئة بالعربية"
                    className="glass-input text-right"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">اسم الفئة بالإنجليزية</Label>
                  <Input
                    value={categoryNameEn}
                    onChange={(e) => setCategoryNameEn(e.target.value)}
                    placeholder="أدخل اسم الفئة بالإنجليزية"
                    className="glass-input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!categoryNameAr.trim() || !selectedManufacturerId) {
                        toast({
                          title: "خطأ",
                          description: "يرجى إدخال اسم الفئة واختيار الصانع",
                          variant: "destructive",
                        });
                        return;
                      }
                      addCategoryMutation.mutate({
                        name_ar: categoryNameAr,
                        name_en: categoryNameEn || undefined,
                        manufacturer_id: selectedManufacturerId,
                      });
                    }}
                    disabled={addCategoryMutation.isPending}
                    className="glass-button flex-1"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </Button>
                  <Button
                    onClick={() => {
                      setCategoryNameAr("");
                      setCategoryNameEn("");
                      setSelectedManufacturerId(null);
                      setIsAddCategoryOpen(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddTrimLevelOpen} onOpenChange={setIsAddTrimLevelOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button h-16 text-lg">
                <Settings className="h-6 w-6 ml-2" />
                إضافة درجة تجهيز
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة درجة تجهيز جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">الفئة *</Label>
                  <Select value={selectedCategoryId?.toString()} onValueChange={(value) => setSelectedCategoryId(Number(value))}>
                    <SelectTrigger className="glass-input text-right">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(hierarchyData) && hierarchyData.map((item: HierarchyData) =>
                        item.categories.map(({ category }) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {item.manufacturer.nameAr} - {category.name_ar}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-right block mb-2">اسم درجة التجهيز بالعربية *</Label>
                  <Input
                    value={trimLevelNameAr}
                    onChange={(e) => setTrimLevelNameAr(e.target.value)}
                    placeholder="أدخل اسم درجة التجهيز بالعربية"
                    className="glass-input text-right"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">اسم درجة التجهيز بالإنجليزية</Label>
                  <Input
                    value={trimLevelNameEn}
                    onChange={(e) => setTrimLevelNameEn(e.target.value)}
                    placeholder="أدخل اسم درجة التجهيز بالإنجليزية"
                    className="glass-input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!trimLevelNameAr.trim() || !selectedCategoryId) {
                        toast({
                          title: "خطأ",
                          description: "يرجى إدخال اسم درجة التجهيز واختيار الفئة",
                          variant: "destructive",
                        });
                        return;
                      }
                      addTrimLevelMutation.mutate({
                        name_ar: trimLevelNameAr,
                        name_en: trimLevelNameEn || undefined,
                        category_id: selectedCategoryId,
                      });
                    }}
                    disabled={addTrimLevelMutation.isPending}
                    className="glass-button flex-1"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </Button>
                  <Button
                    onClick={() => {
                      setTrimLevelNameAr("");
                      setTrimLevelNameEn("");
                      setSelectedCategoryId(null);
                      setIsAddTrimLevelOpen(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddColorOpen} onOpenChange={setIsAddColorOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button h-16 text-lg">
                <Palette className="h-6 w-6 ml-2" />
                إضافة لون
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة لون جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">نوع اللون *</Label>
                  <Select value={colorType} onValueChange={(value) => setColorType(value as 'exterior' | 'interior')}>
                    <SelectTrigger className="glass-input text-right">
                      <SelectValue placeholder="اختر نوع اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exterior">لون خارجي</SelectItem>
                      <SelectItem value="interior">لون داخلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-right block mb-2">اسم اللون بالعربية *</Label>
                  <Input
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    placeholder="أدخل اسم اللون بالعربية"
                    className="glass-input text-right"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">اسم اللون بالإنجليزية</Label>
                  <Input
                    value={colorNameEn}
                    onChange={(e) => setColorNameEn(e.target.value)}
                    placeholder="أدخل اسم اللون بالإنجليزية"
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">كود اللون</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      className="w-16 h-10 border-0 p-0 glass-input"
                    />
                    <Input
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      placeholder="#FFFFFF"
                      className="glass-input flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-right block mb-2">ربط باختياري</Label>
                  <Select value={colorManufacturerId?.toString()} onValueChange={(value) => {
                    setColorManufacturerId(value ? Number(value) : null);
                    setColorCategoryId(null);
                    setColorTrimLevelId(null);
                  }}>
                    <SelectTrigger className="glass-input text-right">
                      <SelectValue placeholder="اختر الصانع (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون ربط</SelectItem>
                      {Array.isArray(manufacturers) && manufacturers.map((manufacturer: Manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!colorName.trim() || !colorType) {
                        toast({
                          title: "خطأ",
                          description: "يرجى إدخال اسم اللون ونوعه",
                          variant: "destructive",
                        });
                        return;
                      }
                      addColorMutation.mutate({
                        name: colorName,
                        name_en: colorNameEn || undefined,
                        code: colorCode,
                        type: colorType,
                        manufacturer_id: colorManufacturerId || undefined,
                        category_id: colorCategoryId || undefined,
                        trim_level_id: colorTrimLevelId || undefined,
                      });
                    }}
                    disabled={addColorMutation.isPending}
                    className="glass-button flex-1"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </Button>
                  <Button
                    onClick={() => {
                      setColorName("");
                      setColorNameEn("");
                      setColorCode("#FFFFFF");
                      setColorType('exterior');
                      setColorManufacturerId(null);
                      setColorCategoryId(null);
                      setColorTrimLevelId(null);
                      setIsAddColorOpen(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hierarchy Display */}
        <div className="space-y-4">
          {Array.isArray(hierarchyData) && hierarchyData.map((item: HierarchyData) => {
            if (!item?.manufacturer?.id || !item?.manufacturer?.nameAr) {
              return null;
            }
            
            return (
              <Card 
                key={`manufacturer-${item.manufacturer.id}`} 
                className="glass-container"
              >
                <CardHeader className="glass-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(`manufacturer-${item.manufacturer.id}`)}
                        className="text-white hover:bg-white/10"
                      >
                        {expandedItems.has(`manufacturer-${item.manufacturer.id}`) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Building2 className="h-5 w-5 text-blue-400" />
                      <div className="text-right">
                        <h3 className="text-lg font-semibold text-white">{item.manufacturer.nameAr}</h3>
                        {item.manufacturer.nameEn && (
                          <p className="text-sm text-gray-400">{item.manufacturer.nameEn}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="glass-badge">
                        {item.categories.length} فئة
                      </Badge>
                      
                      {/* Manufacturer Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleManufacturerVisibilityMutation.mutate({
                            id: item.manufacturer.id,
                            isActive: !(item.manufacturer as any).isActive !== false
                          })}
                          className={`hover:bg-gray-700/50 ${((item.manufacturer as any).isActive === false) ? 'text-red-400' : 'text-green-400'}`}
                          title={((item.manufacturer as any).isActive === false) ? "إظهار في القوائم" : "إخفاء من القوائم"}
                          disabled={toggleManufacturerVisibilityMutation.isPending}
                        >
                          {((item.manufacturer as any).isActive === false) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditMode({ type: 'manufacturer', id: item.manufacturer.id, data: item.manufacturer })}
                          className="text-yellow-400 hover:bg-yellow-400/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteManufacturerMutation.mutate(item.manufacturer.id)}
                          className="text-red-400 hover:bg-red-400/10"
                          disabled={deleteManufacturerMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Categories */}
                <Collapsible.Root open={expandedItems.has(`manufacturer-${item.manufacturer.id}`)}>
                  <Collapsible.Content>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mr-8">
                        {item.categories.map((catData) => (
                          <div key={catData.category.id} className="glass-section p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpanded(`category-${catData.category.id}`)}
                                  className="text-white hover:bg-white/10"
                                >
                                  {expandedItems.has(`category-${catData.category.id}`) ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                                <Car className="h-4 w-4 text-green-400" />
                                <div className="text-right">
                                  <h4 className="font-medium text-white">{catData.category.name_ar}</h4>
                                  {catData.category.name_en && (
                                    <p className="text-xs text-gray-400">{catData.category.name_en}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="glass-badge text-xs">
                                  {catData.trimLevels.length} درجة
                                </Badge>
                                
                                {/* Category Actions */}
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleCategoryVisibilityMutation.mutate({
                                      id: catData.category.id,
                                      isActive: !(catData.category as any).isActive !== false
                                    })}
                                    className={`hover:bg-gray-700/50 ${((catData.category as any).isActive === false) ? 'text-red-400' : 'text-green-400'}`}
                                    disabled={toggleCategoryVisibilityMutation.isPending}
                                  >
                                    {((catData.category as any).isActive === false) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditMode({ type: 'category', id: catData.category.id, data: catData.category })}
                                    className="text-yellow-400 hover:bg-yellow-400/10"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteCategoryMutation.mutate(catData.category.id)}
                                    className="text-red-400 hover:bg-red-400/10"
                                    disabled={deleteCategoryMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Trim Levels */}
                            <Collapsible.Root open={expandedItems.has(`category-${catData.category.id}`)}>
                              <Collapsible.Content>
                                <div className="space-y-2 mr-6">
                                  {catData.trimLevels.map((trimLevel) => (
                                    <div key={trimLevel.id} className="glass-item rounded p-2 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Settings className="h-3 w-3 text-purple-400" />
                                        <div className="text-right">
                                          <span className="text-sm text-white">{trimLevel.name_ar}</span>
                                          {trimLevel.name_en && (
                                            <span className="text-xs text-gray-400 mr-2">({trimLevel.name_en})</span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Trim Level Actions */}
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleTrimLevelVisibilityMutation.mutate({
                                            id: trimLevel.id,
                                            isActive: !(trimLevel as any).isActive !== false
                                          })}
                                          className={`hover:bg-gray-700/50 ${((trimLevel as any).isActive === false) ? 'text-red-400' : 'text-green-400'}`}
                                          disabled={toggleTrimLevelVisibilityMutation.isPending}
                                        >
                                          {((trimLevel as any).isActive === false) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setIsEditMode({ type: 'trimLevel', id: trimLevel.id, data: trimLevel })}
                                          className="text-yellow-400 hover:bg-yellow-400/10"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteTrimLevelMutation.mutate(trimLevel.id)}
                                          className="text-red-400 hover:bg-red-400/10"
                                          disabled={deleteTrimLevelMutation.isPending}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Collapsible.Content>
                            </Collapsible.Root>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}