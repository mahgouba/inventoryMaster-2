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
  });

  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
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

  // Filter data based on search and type
  const filteredData = Array.isArray(hierarchyData) ? hierarchyData.filter(item => {
    const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.nameEn && item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "manufacturers") return matchesSearch;
    // Add more filter types as needed
    
    return matchesSearch;
  }) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-300">جاري تحميل بيانات القوائم...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700" dir="rtl">
      <div className="container mx-auto p-6 space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/30 p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              إدارة الشركات المصنعة والفئات ودرجات التجهيز
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              إدارة شاملة لجميع خيارات القوائم المنسدلة في النظام
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الشركات المصنعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-12 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                data-testid="search-manufacturers"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl">
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
                <Button className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
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
                <Button className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
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
                <Button className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
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
                <Button className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg rounded-2xl transition-all duration-300 hover:scale-105">
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
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الشركات</p>
                  <p className="text-3xl font-bold text-blue-600">{filteredData.length}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الفئات</p>
                  <p className="text-3xl font-bold text-green-600">
                    {filteredData.reduce((total, item) => total + item.categories.length, 0)}
                  </p>
                </div>
                <Car className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">درجات التجهيز</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {filteredData.reduce((total, item) => 
                      total + item.categories.reduce((catTotal, cat) => 
                        catTotal + cat.trimLevels.length, 0), 0)}
                  </p>
                </div>
                <Settings className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الألوان</p>
                  <p className="text-3xl font-bold text-orange-600">0</p>
                </div>
                <Palette className="w-12 h-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/30 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              الهيكل الهرمي للشركات والفئات
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              عرض تفصيلي للشركات المصنعة والفئات ودرجات التجهيز
            </p>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredData && filteredData.length > 0 ? filteredData.map((item: HierarchyData) => (
                <Card key={item.id} className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 border-2 border-gray-200 dark:border-slate-600 shadow-lg rounded-2xl overflow-hidden">
                  <Collapsible 
                    open={expandedItems.has(`manufacturer-${item.id}`)}
                    onOpenChange={() => toggleExpanded(`manufacturer-${item.id}`)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 p-6">
                        <CardTitle className="flex items-center justify-between text-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                              <Building2 className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{item.nameAr}</h3>
                              {item.nameEn && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">({item.nameEn})</p>
                              )}
                            </div>
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-4 py-2 text-lg">
                              {item.categories.length} فئة
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="hover:bg-blue-100 dark:hover:bg-blue-900/30">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900/30">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                            {expandedItems.has(`manufacturer-${item.id}`) ? (
                              <ChevronDown className="w-6 h-6 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="px-8 pb-6">
                        {item.categories.length > 0 ? (
                          <div className="space-y-4">
                            {item.categories.map((category) => (
                              <div key={category.id} className="border border-gray-200 dark:border-slate-600 rounded-2xl overflow-hidden">
                                <Collapsible 
                                  open={expandedItems.has(`category-${category.id}`)}
                                  onOpenChange={() => toggleExpanded(`category-${category.id}`)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-6 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300">
                                      <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                          <Car className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                          <h4 className="font-bold text-lg text-gray-800 dark:text-white">{category.name_ar}</h4>
                                          {category.name_en && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">({category.name_en})</p>
                                          )}
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                                          {category.trimLevels.length} درجة تجهيز
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="hover:bg-green-100 dark:hover:bg-green-900/30">
                                          <Edit className="w-4 h-4 text-green-600" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900/30">
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                        {expandedItems.has(`category-${category.id}`) ? (
                                          <ChevronDown className="w-5 h-5 text-gray-600" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-gray-600" />
                                        )}
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent>
                                    <div className="p-6 bg-white dark:bg-slate-800">
                                      {category.trimLevels.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {category.trimLevels.map((trimLevel) => (
                                            <div key={trimLevel.id} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                                              <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                  <Settings className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                  <p className="font-semibold text-gray-800 dark:text-white">{trimLevel.name_ar}</p>
                                                  {trimLevel.name_en && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">({trimLevel.name_en})</p>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" className="hover:bg-purple-100 dark:hover:bg-purple-900/30">
                                                  <Edit className="w-4 h-4 text-purple-600" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900/30">
                                                  <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                          <p className="text-gray-500 dark:text-gray-400">لا توجد درجات تجهيز لهذه الفئة</p>
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
                            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد فئات لهذه الشركة المصنعة</p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )) : (
                <Card className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl">
                  <CardContent>
                    <Building2 className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">
                      لا توجد بيانات للعرض
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      ابدأ بإضافة شركة مصنعة جديدة لتظهر هنا
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}