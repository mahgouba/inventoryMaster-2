import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SystemGlassWrapper from "@/components/system-glass-wrapper";
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
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react";

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

interface CategoryWithTrimLevels {
  id: number;
  name_ar: string;
  name_en?: string;
  manufacturerId: number;
  isActive?: boolean;
  trimLevels: TrimLevel[];
}

interface HierarchyData {
  id: number;
  nameAr: string;
  nameEn?: string;
  logo?: string;
  isActive?: boolean;
  categories: CategoryWithTrimLevels[];
}

export default function DropdownOptionsManagement() {
  const queryClient = useQueryClient();
  
  // State for expanded items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // State for modals
  const [isAddManufacturerOpen, setIsAddManufacturerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTrimLevelOpen, setIsAddTrimLevelOpen] = useState(false);
  const [isAddColorOpen, setIsAddColorOpen] = useState(false);
  
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

  // Fetch data
  const { data: hierarchyData = [], isLoading } = useQuery<HierarchyData[]>({
    queryKey: ['/api/hierarchy/full'],
    onSuccess: (data) => {
      console.log('📊 Hierarchy data received:', data);
      console.log('📊 First manufacturer:', data?.[0]);
      console.log('📊 First category of first manufacturer:', data?.[0]?.categories?.[0]);
      console.log('📊 First trim level:', data?.[0]?.categories?.[0]?.trimLevels?.[0]);
    }
  });

  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
    queryKey: ['/api/manufacturers'],
  });

  const { data: categories = [] } = useQuery<CategoryWithTrimLevels[]>({
    queryKey: ['/api/categories'],
  });

  const { data: trimLevels = [] } = useQuery<TrimLevel[]>({
    queryKey: ['/api/trim-levels'],
  });

  // Toggle manufacturer active status
  const toggleManufacturerMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PUT', `/api/manufacturers/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الشركة المصنعة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الشركة المصنعة",
        variant: "destructive",
      });
    }
  });

  // Toggle category active status
  const toggleCategoryMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PUT', `/api/categories/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الفئة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الفئة",
        variant: "destructive",
      });
    }
  });

  // Toggle trim level active status
  const toggleTrimLevelMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PUT', `/api/trim-levels/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trim-levels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة درجة التجهيز بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة درجة التجهيز",
        variant: "destructive",
      });
    }
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

  // Filter data based on search and type
  const filteredData = hierarchyData.filter(item => {
    if (!item || !item.nameAr) {
      console.log('❌ Filtering out invalid item:', item);
      return false;
    }
    
    const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.nameEn && item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "manufacturers") return matchesSearch;
    // Add more filter types as needed
    
    return matchesSearch;
  });

  console.log('🔍 Filtered data:', filteredData.length, 'items');
  console.log('🔍 First filtered item:', filteredData[0]);

  if (isLoading) {
    return (
      <SystemGlassWrapper>
        <div className="relative z-10" dir="rtl">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pr-24">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white/60 mx-auto mb-4"></div>
                <p className="text-lg text-white/80">جاري تحميل بيانات القوائم...</p>
              </div>
            </div>
          </main>
        </div>
      </SystemGlassWrapper>
    );
  }

  return (
    <SystemGlassWrapper>
      <div className="relative z-10" dir="rtl">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pr-24 space-y-6">
        
        {/* Header Section */}
        <Card className="glass-container p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">
              إدارة الشركات المصنعة والفئات ودرجات التجهيز
            </h1>
            <p className="text-lg text-white/80">
              إدارة شاملة لجميع خيارات القوائم المنسدلة في النظام
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-white/60" />
              <Input
                placeholder="البحث في الشركات المصنعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-search pr-10 h-12 text-lg"
                data-testid="search-manufacturers"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="glass-button w-full lg:w-48 h-12">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="نوع البيانات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع البيانات</SelectItem>
                <SelectItem value="manufacturers">الشركات المصنعة</SelectItem>
                <SelectItem value="categories">الفئات</SelectItem>
                <SelectItem value="trimlevels">درجات التجهيز</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Dialog open={isAddManufacturerOpen} onOpenChange={setIsAddManufacturerOpen}>
              <DialogTrigger asChild>
                <Button className="glass-button-primary h-16 shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    <span className="font-semibold">شركة مصنعة</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center text-blue-600">إضافة شركة مصنعة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-2">
                  <div>
                    <Label htmlFor="manufacturer-name-ar" className="text-lg">الاسم بالعربية</Label>
                    <Input
                      id="manufacturer-name-ar"
                      value={manufacturerNameAr}
                      onChange={(e) => setManufacturerNameAr(e.target.value)}
                      placeholder="أدخل اسم الشركة المصنعة بالعربية"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-manufacturer-name-ar"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer-name-en" className="text-lg">الاسم بالإنجليزية (اختياري)</Label>
                    <Input
                      id="manufacturer-name-en"
                      value={manufacturerNameEn}
                      onChange={(e) => setManufacturerNameEn(e.target.value)}
                      placeholder="أدخل اسم الشركة المصنعة بالإنجليزية"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-manufacturer-name-en"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer-logo" className="text-lg">رابط الشعار (اختياري)</Label>
                    <Input
                      id="manufacturer-logo"
                      value={manufacturerLogo}
                      onChange={(e) => setManufacturerLogo(e.target.value)}
                      placeholder="أدخل رابط شعار الشركة"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-manufacturer-logo"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        toast({
                          title: "قريباً",
                          description: "ستتم إضافة هذه الميزة قريباً",
                        });
                      }}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl"
                      data-testid="button-save-manufacturer"
                    >
                      <Save className="w-5 h-5 ml-2" />
                      حفظ
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddManufacturerOpen(false)}
                      className="h-12 rounded-xl"
                      data-testid="button-cancel-manufacturer"
                    >
                      <X className="w-5 h-5 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button className="glass-button-primary h-16 shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-2">
                    <Car className="w-6 h-6" />
                    <span className="font-semibold">فئة جديدة</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center text-green-600">إضافة فئة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-2">
                  <div>
                    <Label className="text-lg">الشركة المصنعة</Label>
                    <Select value={selectedManufacturerId?.toString()} onValueChange={(value) => setSelectedManufacturerId(Number(value))}>
                      <SelectTrigger className="h-12 rounded-xl" data-testid="select-category-manufacturer">
                        <SelectValue placeholder="اختر الشركة المصنعة" />
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
                    <Label className="text-lg">الاسم بالعربية</Label>
                    <Input
                      value={categoryNameAr}
                      onChange={(e) => setCategoryNameAr(e.target.value)}
                      placeholder="أدخل اسم الفئة بالعربية"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-category-name-ar"
                    />
                  </div>
                  <div>
                    <Label className="text-lg">الاسم بالإنجليزية (اختياري)</Label>
                    <Input
                      value={categoryNameEn}
                      onChange={(e) => setCategoryNameEn(e.target.value)}
                      placeholder="أدخل اسم الفئة بالإنجليزية"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-category-name-en"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        toast({
                          title: "قريباً",
                          description: "ستتم إضافة هذه الميزة قريباً",
                        });
                      }}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl"
                      data-testid="button-save-category"
                    >
                      <Save className="w-5 h-5 ml-2" />
                      حفظ
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddCategoryOpen(false)}
                      className="h-12 rounded-xl"
                      data-testid="button-cancel-category"
                    >
                      <X className="w-5 h-5 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddTrimLevelOpen} onOpenChange={setIsAddTrimLevelOpen}>
              <DialogTrigger asChild>
                <Button className="glass-button-primary h-16 shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-2">
                    <Settings className="w-6 h-6" />
                    <span className="font-semibold">درجة تجهيز</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center text-purple-600">إضافة درجة تجهيز جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-2">
                  <div>
                    <Label className="text-lg">الفئة</Label>
                    <Select value={selectedCategoryId?.toString()} onValueChange={(value) => setSelectedCategoryId(Number(value))}>
                      <SelectTrigger className="h-12 rounded-xl" data-testid="select-trimlevel-category">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                          item.categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {item.nameAr} - {cat.name_ar}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-lg">الاسم بالعربية</Label>
                    <Input
                      value={trimLevelNameAr}
                      onChange={(e) => setTrimLevelNameAr(e.target.value)}
                      placeholder="أدخل اسم درجة التجهيز بالعربية"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-trimlevel-name-ar"
                    />
                  </div>
                  <div>
                    <Label className="text-lg">الاسم بالإنجليزية (اختياري)</Label>
                    <Input
                      value={trimLevelNameEn}
                      onChange={(e) => setTrimLevelNameEn(e.target.value)}
                      placeholder="أدخل اسم درجة التجهيز بالإنجليزية"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-trimlevel-name-en"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        toast({
                          title: "قريباً",
                          description: "ستتم إضافة هذه الميزة قريباً",
                        });
                      }}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl"
                      data-testid="button-save-trimlevel"
                    >
                      <Save className="w-5 h-5 ml-2" />
                      حفظ
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddTrimLevelOpen(false)}
                      className="h-12 rounded-xl"
                      data-testid="button-cancel-trimlevel"
                    >
                      <X className="w-5 h-5 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddColorOpen} onOpenChange={setIsAddColorOpen}>
              <DialogTrigger asChild>
                <Button className="glass-button-primary h-16 shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-2">
                    <Palette className="w-6 h-6" />
                    <span className="font-semibold">لون جديد</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center text-orange-600">إضافة لون جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-2">
                  <div>
                    <Label className="text-lg">نوع اللون</Label>
                    <Select value={colorType} onValueChange={(value: 'exterior' | 'interior') => setColorType(value)}>
                      <SelectTrigger className="h-12 rounded-xl" data-testid="select-color-type">
                        <SelectValue placeholder="اختر نوع اللون" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exterior">خارجي</SelectItem>
                        <SelectItem value="interior">داخلي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-lg">الاسم بالعربية</Label>
                    <Input
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="أدخل اسم اللون بالعربية"
                      className="h-12 text-lg rounded-xl"
                      data-testid="input-color-name"
                    />
                  </div>
                  <div>
                    <Label className="text-lg">كود اللون</Label>
                    <div className="flex gap-3">
                      <Input
                        value={colorCode}
                        onChange={(e) => setColorCode(e.target.value)}
                        placeholder="#FFFFFF"
                        className="h-12 text-lg rounded-xl"
                        data-testid="input-color-code"
                      />
                      <div 
                        className="w-16 h-12 rounded-xl border-2 border-gray-300"
                        style={{ backgroundColor: colorCode }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        toast({
                          title: "قريباً",
                          description: "ستتم إضافة هذه الميزة قريباً",
                        });
                      }}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl"
                      data-testid="button-save-color"
                    >
                      <Save className="w-5 h-5 ml-2" />
                      حفظ
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddColorOpen(false)}
                      className="h-12 rounded-xl"
                      data-testid="button-cancel-color"
                    >
                      <X className="w-5 h-5 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-container shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">إجمالي الشركات</p>
                  <p className="text-3xl font-bold text-white">{filteredData.length}</p>
                </div>
                <Building2 className="w-12 h-12 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-container shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">إجمالي الفئات</p>
                  <p className="text-3xl font-bold text-white">
                    {filteredData.reduce((total, item) => total + item.categories.length, 0)}
                  </p>
                </div>
                <Car className="w-12 h-12 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-container shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">درجات التجهيز</p>
                  <p className="text-3xl font-bold text-white">
                    {filteredData.reduce((total, item) => 
                      total + item.categories.reduce((catTotal, cat) => 
                        catTotal + cat.trimLevels.length, 0), 0)}
                  </p>
                </div>
                <Settings className="w-12 h-12 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-container shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">الألوان</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <Palette className="w-12 h-12 text-white/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="glass-container p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              الهيكل الهرمي للشركات والفئات
            </h2>
            <p className="text-white/80">
              عرض تفصيلي للشركات المصنعة والفئات ودرجات التجهيز
            </p>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredData.length > 0 ? filteredData.map((item: HierarchyData) => (
                <Card key={item.id} className="glass-container border-2 border-white/20 shadow-lg rounded-2xl overflow-hidden">
                  <Collapsible 
                    open={expandedItems.has(`manufacturer-${item.id}`)}
                    onOpenChange={() => toggleExpanded(`manufacturer-${item.id}`)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-white/10 transition-all duration-300 p-6">
                        <CardTitle className="flex items-center justify-between text-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl">
                              <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">{item.nameAr}</h3>
                              {item.nameEn && (
                                <p className="text-sm text-white/60">({item.nameEn})</p>
                              )}
                            </div>
                            <Badge variant="outline" className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                              {item.categories.length} فئة
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`glass-button ${item.isActive !== false ? 'bg-green-600/20' : 'bg-red-600/20'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleManufacturerMutation.mutate({ 
                                  id: item.id, 
                                  isActive: item.isActive === false 
                                });
                              }}
                              data-testid={`toggle-manufacturer-${item.id}`}
                            >
                              {item.isActive !== false ? (
                                <Eye className="w-4 h-4 text-green-300" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-red-300" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" className="glass-button">
                              <Edit className="w-4 h-4 text-white" />
                            </Button>
                            <Button variant="ghost" size="sm" className="glass-button">
                              <Trash2 className="w-4 h-4 text-white" />
                            </Button>
                            {expandedItems.has(`manufacturer-${item.id}`) ? (
                              <ChevronDown className="w-6 h-6 text-white" />
                            ) : (
                              <ChevronRight className="w-6 h-6 text-white" />
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="px-8 pb-6">
                        {item.categories && item.categories.length > 0 ? (
                          <div className="space-y-4">
                            {item.categories.map((category) => (
                              <div key={category.id} className="border border-white/20 rounded-2xl overflow-hidden">
                                <Collapsible 
                                  open={expandedItems.has(`category-${category.id}`)}
                                  onOpenChange={() => toggleExpanded(`category-${category.id}`)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-6 bg-white/10 cursor-pointer hover:bg-white/20 transition-all duration-300">
                                      <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                          <Car className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                          <h4 className="font-bold text-lg text-white">{category.name_ar}</h4>
                                          {category.name_en && (
                                            <p className="text-sm text-white/60">({category.name_en})</p>
                                          )}
                                        </div>
                                        <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                                          {category.trimLevels.length} درجة تجهيز
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className={`glass-button ${category.isActive !== false ? 'bg-green-600/20' : 'bg-red-600/20'}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCategoryMutation.mutate({ 
                                              id: category.id, 
                                              isActive: category.isActive === false 
                                            });
                                          }}
                                          data-testid={`toggle-category-${category.id}`}
                                        >
                                          {category.isActive !== false ? (
                                            <Eye className="w-4 h-4 text-green-300" />
                                          ) : (
                                            <EyeOff className="w-4 h-4 text-red-300" />
                                          )}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="glass-button">
                                          <Edit className="w-4 h-4 text-white" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="glass-button">
                                          <Trash2 className="w-4 h-4 text-white" />
                                        </Button>
                                        {expandedItems.has(`category-${category.id}`) ? (
                                          <ChevronDown className="w-5 h-5 text-white" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-white" />
                                        )}
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent>
                                    <div className="p-6 bg-white/5">
                                      {category.trimLevels && category.trimLevels.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                          {category.trimLevels.map((trimLevel) => (
                                            <div key={trimLevel.id} className="bg-white/10 rounded-xl border border-white/20 p-4 hover:bg-white/15 transition-all duration-300 group">
                                              <div className="flex flex-col items-center text-center space-y-3">
                                                <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                                                  <Settings className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-h-[3rem] flex flex-col justify-center">
                                                  <p className="font-bold text-white text-sm leading-tight">{trimLevel.name_ar}</p>
                                                  {trimLevel.name_en && (
                                                    <p className="text-xs text-white/60 mt-1">({trimLevel.name_en})</p>
                                                  )}
                                                </div>
                                                <div className="flex items-center justify-center gap-1 w-full pt-2 border-t border-white/20">
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className={`glass-button h-8 w-8 p-0 ${trimLevel.isActive !== false ? 'bg-green-600/30 hover:bg-green-600/40' : 'bg-red-600/30 hover:bg-red-600/40'}`}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleTrimLevelMutation.mutate({ 
                                                        id: trimLevel.id, 
                                                        isActive: trimLevel.isActive === false 
                                                      });
                                                    }}
                                                    data-testid={`toggle-trim-${trimLevel.id}`}
                                                    title={trimLevel.isActive !== false ? 'إخفاء' : 'إظهار'}
                                                  >
                                                    {trimLevel.isActive !== false ? (
                                                      <Eye className="w-3 h-3 text-green-300" />
                                                    ) : (
                                                      <EyeOff className="w-3 h-3 text-red-300" />
                                                    )}
                                                  </Button>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="glass-button h-8 w-8 p-0 hover:bg-blue-600/30"
                                                    title="تعديل"
                                                  >
                                                    <Edit className="w-3 h-3 text-white" />
                                                  </Button>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="glass-button h-8 w-8 p-0 hover:bg-red-600/30"
                                                    title="حذف"
                                                  >
                                                    <Trash2 className="w-3 h-3 text-white" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <Settings className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                          <p className="text-white/60">لا توجد درجات تجهيز لهذه الفئة</p>
                                        </div>
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Car className="w-16 h-16 text-white/40 mx-auto mb-4" />
                            <p className="text-white/60 text-lg">لا توجد فئات لهذه الشركة المصنعة</p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )) : (
                <Card className="glass-container text-center py-16 rounded-2xl">
                  <CardContent>
                    <Building2 className="w-24 h-24 text-white/40 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {hierarchyData && hierarchyData.length > 0 
                        ? "لا توجد بيانات تطابق البحث" 
                        : "لا توجد بيانات للعرض"
                      }
                    </h3>
                    <p className="text-white/60 text-lg">
                      {hierarchyData && hierarchyData.length > 0 
                        ? "جرب تغيير معايير البحث أو الفلتر" 
                        : "ابدأ بإضافة شركة مصنعة جديدة لتظهر هنا"
                      }
                    </p>
                    <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-200">
                        البيانات المتاحة: {hierarchyData?.length || 0} شركة
                      </p>
                      <p className="text-sm text-yellow-200">
                        البيانات المفلترة: {filteredData?.length || 0} شركة
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </Card>
        </main>
      </div>
    </SystemGlassWrapper>
  );
}