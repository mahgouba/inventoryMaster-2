import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, Building2, Car, Settings, Search, Filter, Plus, Palette, Tag, Edit, Trash2, Save, X } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { FreshImportButton } from "@/components/FreshImportButton";

interface Manufacturer {
  id: number;
  nameAr: string;
  nameEn?: string;
  logo?: string;
}

interface Category {
  id: number;
  manufacturer_id: number;
  name_ar: string;
  name_en?: string;
}

interface TrimLevel {
  id: number;
  category_id: number;
  name_ar: string;
  name_en?: string;
}

interface HierarchyData {
  manufacturer: Manufacturer;
  categories: Array<{
    category: Category;
    trimLevels: TrimLevel[];
    vehicleCount: number;
  }>;
  totalVehicles: number;
}

export default function HierarchicalView() {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isAddManufacturerOpen, setIsAddManufacturerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTrimLevelOpen, setIsAddTrimLevelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<{ type: string; id: number | string; data: any } | null>(null);
  
  // Form states
  const [manufacturerNameAr, setManufacturerNameAr] = useState("");
  const [manufacturerNameEn, setManufacturerNameEn] = useState("");
  const [manufacturerLogo, setManufacturerLogo] = useState("");
  
  const [newCategoryNameAr, setNewCategoryNameAr] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const [selectedManufacturerForCategory, setSelectedManufacturerForCategory] = useState<number | null>(null);
  
  const [newTrimLevelNameAr, setNewTrimLevelNameAr] = useState("");
  const [newTrimLevelNameEn, setNewTrimLevelNameEn] = useState("");
  const [selectedCategoryForTrimLevel, setSelectedCategoryForTrimLevel] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/hierarchical/manufacturers'],
  });

  // Fetch hierarchy data
  const { data: hierarchyData = [], isLoading, error } = useQuery({
    queryKey: ['/api/hierarchy/full'],
  });

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
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الصانع",
        variant: "destructive",
      });
    }
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
        description: `تم إضافة فئة "${newCategoryNameAr}" بنجاح`,
      });
      setNewCategoryNameAr("");
      setNewCategoryNameEn("");
      setSelectedManufacturerForCategory(null);
      setIsAddCategoryOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الفئة",
        variant: "destructive",
      });
    }
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
        description: `تم إضافة درجة التجهيز "${newTrimLevelNameAr}" بنجاح`,
      });
      setNewTrimLevelNameAr("");
      setNewTrimLevelNameEn("");
      setSelectedCategoryForTrimLevel(null);
      setIsAddTrimLevelOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة درجة التجهيز",
        variant: "destructive",
      });
    }
  });

  // Delete mutations
  const deleteManufacturerMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/hierarchical/manufacturers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الصانع بنجاح" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الفئة بنجاح" });
    }
  });

  const deleteTrimLevelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/trimLevels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف درجة التجهيز بنجاح" });
    }
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredData = Array.isArray(hierarchyData) ? hierarchyData.filter((item: HierarchyData) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const manufacturerMatch = item.manufacturer?.nameAr?.toLowerCase().includes(searchLower) || false;
    const categoryMatch = item.categories?.some(cat => 
      cat.category?.name_ar?.toLowerCase().includes(searchLower)
    ) || false;
    const trimMatch = item.categories?.some(cat =>
      cat.trimLevels?.some(trim => trim.name_ar?.toLowerCase().includes(searchLower))
    ) || false;
    
    return manufacturerMatch || categoryMatch || trimMatch;
  }) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          جاري تحميل التسلسل الهرمي...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-4">خطأ في تحميل البيانات</div>
          <p className="text-gray-400">حدث خطأ أثناء تحميل التسلسل الهرمي. يرجى المحاولة مرة أخرى.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="glass-header p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white text-right flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            التسلسل الهرمي للمركبات
          </h1>
          
          <div className="flex gap-2">
            {/* Fresh Import Button */}
            <FreshImportButton />
            
            {/* Add Manufacturer Button */}
            <Dialog open={isAddManufacturerOpen} onOpenChange={setIsAddManufacturerOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة صانع
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة صانع جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">الاسم العربي *</Label>
                  <Input
                    value={manufacturerNameAr}
                    onChange={(e) => setManufacturerNameAr(e.target.value)}
                    placeholder="اسم الصانع بالعربية"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">الاسم الإنجليزي</Label>
                  <Input
                    value={manufacturerNameEn}
                    onChange={(e) => setManufacturerNameEn(e.target.value)}
                    placeholder="Manufacturer Name in English"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">رابط الشعار</Label>
                  <Input
                    value={manufacturerLogo}
                    onChange={(e) => setManufacturerLogo(e.target.value)}
                    placeholder="/logo.png"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => addManufacturerMutation.mutate({
                      nameAr: manufacturerNameAr,
                      nameEn: manufacturerNameEn || undefined,
                      logo: manufacturerLogo || undefined
                    })}
                    disabled={!manufacturerNameAr || addManufacturerMutation.isPending}
                    className="glass-button flex-1"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {addManufacturerMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                  <Button
                    onClick={() => setIsAddManufacturerOpen(false)}
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
        </div>
        <p className="text-gray-300 text-right mt-2">
          عرض العلاقة الهرمية بين الصانعين والفئات ودرجات التجهيز مع إمكانيات الإضافة والتعديل والحذف
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-container">
        <CardHeader className="glass-header">
          <CardTitle className="text-white text-right flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث في الصانعين، الفئات، أو درجات التجهيز..."
                className="pr-10"
                dir="rtl"
              />
            </div>

            {/* Manufacturer Filter */}
            <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر الصانع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصانعين</SelectItem>
                {Array.isArray(manufacturers) && manufacturers.map((manufacturer: Manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                    {manufacturer.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {/* Add Category Button */}
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة فئة
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة فئة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-right block mb-2">الصانع *</Label>
                <Select value={selectedManufacturerForCategory ? selectedManufacturerForCategory.toString() : ""} onValueChange={(value) => setSelectedManufacturerForCategory(Number(value))}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الصانع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(manufacturers) && manufacturers.filter(m => m.id && m.nameAr).map((manufacturer: Manufacturer) => (
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
                  value={newCategoryNameAr}
                  onChange={(e) => setNewCategoryNameAr(e.target.value)}
                  placeholder="اسم الفئة"
                  dir="rtl"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">اسم الفئة بالإنجليزية</Label>
                <Input
                  value={newCategoryNameEn}
                  onChange={(e) => setNewCategoryNameEn(e.target.value)}
                  placeholder="Category Name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => addCategoryMutation.mutate({
                    name_ar: newCategoryNameAr,
                    name_en: newCategoryNameEn || undefined,
                    manufacturer_id: selectedManufacturerForCategory!
                  })}
                  disabled={!newCategoryNameAr || !selectedManufacturerForCategory || addCategoryMutation.isPending}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {addCategoryMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button
                  onClick={() => setIsAddCategoryOpen(false)}
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

        {/* Add Trim Level Button */}
        <Dialog open={isAddTrimLevelOpen} onOpenChange={setIsAddTrimLevelOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة درجة تجهيز
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة درجة تجهيز جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-right block mb-2">الفئة *</Label>
                <Select value={selectedCategoryForTrimLevel ? selectedCategoryForTrimLevel.toString() : ""} onValueChange={(value) => setSelectedCategoryForTrimLevel(Number(value))}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                      item.categories?.filter(catData => catData.category?.id && catData.category?.name_ar).map(catData => (
                        <SelectItem key={catData.category.id} value={catData.category.id.toString()}>
                          {item.manufacturer.nameAr} - {catData.category.name_ar}
                        </SelectItem>
                      )) || []
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-right block mb-2">اسم درجة التجهيز بالعربية *</Label>
                <Input
                  value={newTrimLevelNameAr}
                  onChange={(e) => setNewTrimLevelNameAr(e.target.value)}
                  placeholder="درجة التجهيز"
                  dir="rtl"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">اسم درجة التجهيز بالإنجليزية</Label>
                <Input
                  value={newTrimLevelNameEn}
                  onChange={(e) => setNewTrimLevelNameEn(e.target.value)}
                  placeholder="Trim Level Name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => addTrimLevelMutation.mutate({
                    name_ar: newTrimLevelNameAr,
                    name_en: newTrimLevelNameEn || undefined,
                    category_id: selectedCategoryForTrimLevel!
                  })}
                  disabled={!newTrimLevelNameAr || !selectedCategoryForTrimLevel || addTrimLevelMutation.isPending}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {addTrimLevelMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button
                  onClick={() => setIsAddTrimLevelOpen(false)}
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

        {/* Add Color Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Palette className="h-4 w-4" />
              إضافة لون
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة لون جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-right block mb-2">نوع اللون</Label>
                <Select>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر نوع اللون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exterior">لون خارجي</SelectItem>
                    <SelectItem value="interior">لون داخلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-right block mb-2">اسم اللون</Label>
                <Input placeholder="اسم اللون" dir="rtl" />
              </div>
              <div>
                <Label className="text-right block mb-2">كود اللون</Label>
                <Input placeholder="#ffffff" />
              </div>
              <div>
                <Label className="text-right block mb-2">ربط اللون بـ</Label>
                <Select>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر نطاق اللون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">عام (جميع المركبات)</SelectItem>
                    <SelectItem value="manufacturer">صانع محدد</SelectItem>
                    <SelectItem value="category">فئة محددة</SelectItem>
                    <SelectItem value="trimlevel">درجة تجهيز محددة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="glass-button flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  حفظ اللون
                </Button>
                <Button variant="outline" className="flex-1">
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
        {filteredData.map((item: HierarchyData) => {
          // Safety check for item validity
          if (!item?.manufacturer?.id || !item?.manufacturer?.nameAr) {
            return null;
          }
          
          return (
          <Card key={`manufacturer-${item.manufacturer.id}`} className="glass-container">
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
                    {item.totalVehicles} مركبة
                  </Badge>
                  <Badge variant="outline" className="glass-badge">
                    {item.categories.length} فئة
                  </Badge>
                  
                  {/* Manufacturer Actions */}
                  <div className="flex gap-1">
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
                      onClick={() => deleteManufacturerMutation.mutate(item.manufacturer?.id ? item.manufacturer.id.toString() : "")}
                      className="text-red-400 hover:bg-red-400/10"
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
                            <Badge variant="secondary" className="glass-badge text-xs">
                              {catData.vehicleCount} مركبة
                            </Badge>
                            <Badge variant="outline" className="glass-badge text-xs">
                              {catData.trimLevels.length} درجة
                            </Badge>
                            
                            {/* Category Actions */}
                            <div className="flex gap-1">
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
                                <div key={trimLevel.id} className="flex items-center justify-between p-2 glass-item rounded">
                                  <div className="flex items-center gap-2">
                                    <Settings className="h-3 w-3 text-purple-400" />
                                    <div className="text-right">
                                      <span className="text-sm text-white">{trimLevel.name_ar}</span>
                                      {trimLevel.name_en && (
                                        <span className="text-xs text-gray-400 block">{trimLevel.name_en}</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Trim Level Actions */}
                                  <div className="flex gap-1">
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

      {filteredData.length === 0 && (
        <Card className="glass-container">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">لا توجد بيانات</h3>
            <p className="text-gray-400">لا توجد بيانات هرمية متطابقة مع البحث الحالي</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}