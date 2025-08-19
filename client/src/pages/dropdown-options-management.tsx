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

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">جاري تحميل بيانات القوائم...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            إدارة خيارات القوائم المنسدلة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            إدارة الشركات المصنعة والفئات ودرجات التجهيز والألوان
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Dialog open={isAddManufacturerOpen} onOpenChange={setIsAddManufacturerOpen}>
            <DialogTrigger asChild>
              <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                <Building2 className="w-8 h-8" />
                <span className="font-semibold">إضافة شركة مصنعة</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة شركة مصنعة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manufacturer-name-ar">الاسم بالعربية</Label>
                  <Input
                    id="manufacturer-name-ar"
                    value={manufacturerNameAr}
                    onChange={(e) => setManufacturerNameAr(e.target.value)}
                    placeholder="أدخل اسم الشركة المصنعة بالعربية"
                    data-testid="input-manufacturer-name-ar"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer-name-en">الاسم بالإنجليزية (اختياري)</Label>
                  <Input
                    id="manufacturer-name-en"
                    value={manufacturerNameEn}
                    onChange={(e) => setManufacturerNameEn(e.target.value)}
                    placeholder="أدخل اسم الشركة المصنعة بالإنجليزية"
                    data-testid="input-manufacturer-name-en"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer-logo">رابط الشعار (اختياري)</Label>
                  <Input
                    id="manufacturer-logo"
                    value={manufacturerLogo}
                    onChange={(e) => setManufacturerLogo(e.target.value)}
                    placeholder="أدخل رابط شعار الشركة"
                    data-testid="input-manufacturer-logo"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "قريباً",
                        description: "ستتم إضافة هذه الميزة قريباً",
                      });
                    }}
                    className="flex-1"
                    data-testid="button-save-manufacturer"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddManufacturerOpen(false)}
                    data-testid="button-cancel-manufacturer"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                <Car className="w-8 h-8" />
                <span className="font-semibold">إضافة فئة</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة فئة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-manufacturer">الشركة المصنعة</Label>
                  <Select value={selectedManufacturerId?.toString()} onValueChange={(value) => setSelectedManufacturerId(Number(value))}>
                    <SelectTrigger data-testid="select-category-manufacturer">
                      <SelectValue placeholder="اختر الشركة المصنعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((manufacturer: Manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category-name-ar">الاسم بالعربية</Label>
                  <Input
                    id="category-name-ar"
                    value={categoryNameAr}
                    onChange={(e) => setCategoryNameAr(e.target.value)}
                    placeholder="أدخل اسم الفئة بالعربية"
                    data-testid="input-category-name-ar"
                  />
                </div>
                <div>
                  <Label htmlFor="category-name-en">الاسم بالإنجليزية (اختياري)</Label>
                  <Input
                    id="category-name-en"
                    value={categoryNameEn}
                    onChange={(e) => setCategoryNameEn(e.target.value)}
                    placeholder="أدخل اسم الفئة بالإنجليزية"
                    data-testid="input-category-name-en"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "قريباً",
                        description: "ستتم إضافة هذه الميزة قريباً",
                      });
                    }}
                    className="flex-1"
                    data-testid="button-save-category"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddCategoryOpen(false)}
                    data-testid="button-cancel-category"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddTrimLevelOpen} onOpenChange={setIsAddTrimLevelOpen}>
            <DialogTrigger asChild>
              <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                <Settings className="w-8 h-8" />
                <span className="font-semibold">إضافة درجة تجهيز</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة درجة تجهيز جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trimlevel-category">الفئة</Label>
                  <Select value={selectedCategoryId?.toString()} onValueChange={(value) => setSelectedCategoryId(Number(value))}>
                    <SelectTrigger data-testid="select-trimlevel-category">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {hierarchyData.flatMap((item: HierarchyData) => 
                        item.categories.map(cat => (
                          <SelectItem key={cat.category.id} value={cat.category.id.toString()}>
                            {item.manufacturer.nameAr} - {cat.category.name_ar}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trimlevel-name-ar">الاسم بالعربية</Label>
                  <Input
                    id="trimlevel-name-ar"
                    value={trimLevelNameAr}
                    onChange={(e) => setTrimLevelNameAr(e.target.value)}
                    placeholder="أدخل اسم درجة التجهيز بالعربية"
                    data-testid="input-trimlevel-name-ar"
                  />
                </div>
                <div>
                  <Label htmlFor="trimlevel-name-en">الاسم بالإنجليزية (اختياري)</Label>
                  <Input
                    id="trimlevel-name-en"
                    value={trimLevelNameEn}
                    onChange={(e) => setTrimLevelNameEn(e.target.value)}
                    placeholder="أدخل اسم درجة التجهيز بالإنجليزية"
                    data-testid="input-trimlevel-name-en"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "قريباً",
                        description: "ستتم إضافة هذه الميزة قريباً",
                      });
                    }}
                    className="flex-1"
                    data-testid="button-save-trimlevel"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddTrimLevelOpen(false)}
                    data-testid="button-cancel-trimlevel"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddColorOpen} onOpenChange={setIsAddColorOpen}>
            <DialogTrigger asChild>
              <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg">
                <Palette className="w-8 h-8" />
                <span className="font-semibold">إضافة لون</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة لون جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="color-type">نوع اللون</Label>
                  <Select value={colorType} onValueChange={(value: 'exterior' | 'interior') => setColorType(value)}>
                    <SelectTrigger data-testid="select-color-type">
                      <SelectValue placeholder="اختر نوع اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exterior">خارجي</SelectItem>
                      <SelectItem value="interior">داخلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color-name">الاسم بالعربية</Label>
                  <Input
                    id="color-name"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    placeholder="أدخل اسم اللون بالعربية"
                    data-testid="input-color-name"
                  />
                </div>
                <div>
                  <Label htmlFor="color-name-en">الاسم بالإنجليزية (اختياري)</Label>
                  <Input
                    id="color-name-en"
                    value={colorNameEn}
                    onChange={(e) => setColorNameEn(e.target.value)}
                    placeholder="أدخل اسم اللون بالإنجليزية"
                    data-testid="input-color-name-en"
                  />
                </div>
                <div>
                  <Label htmlFor="color-code">كود اللون</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-code"
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      placeholder="#FFFFFF"
                      data-testid="input-color-code"
                    />
                    <div 
                      className="w-12 h-10 rounded border-2 border-gray-300"
                      style={{ backgroundColor: colorCode }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "قريباً",
                        description: "ستتم إضافة هذه الميزة قريباً",
                      });
                    }}
                    className="flex-1"
                    data-testid="button-save-color"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddColorOpen(false)}
                    data-testid="button-cancel-color"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hierarchy Display */}
        <div className="space-y-4">
          {hierarchyData.map((item: HierarchyData) => (
            <Card key={item.manufacturer.id} className="overflow-hidden shadow-lg">
              <Collapsible.Root 
                open={expandedItems.has(`manufacturer-${item.manufacturer.id}`)}
                onOpenChange={() => toggleExpanded(`manufacturer-${item.manufacturer.id}`)}
              >
                <Collapsible.Trigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <span className="text-xl">{item.manufacturer.nameAr}</span>
                        {item.manufacturer.nameEn && (
                          <span className="text-sm text-gray-500">({item.manufacturer.nameEn})</span>
                        )}
                        <Badge variant="outline" className="mr-2">
                          {item.categories.length} فئة
                        </Badge>
                      </div>
                      {expandedItems.has(`manufacturer-${item.manufacturer.id}`) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </Collapsible.Trigger>
                
                <Collapsible.Content>
                  <CardContent className="pt-0">
                    {item.categories.map((categoryGroup) => (
                      <div key={categoryGroup.category.id} className="mb-6 last:mb-0">
                        <Collapsible.Root 
                          open={expandedItems.has(`category-${categoryGroup.category.id}`)}
                          onOpenChange={() => toggleExpanded(`category-${categoryGroup.category.id}`)}
                        >
                          <Collapsible.Trigger asChild>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <div className="flex items-center gap-3">
                                <Car className="w-5 h-5 text-green-600" />
                                <span className="font-semibold">{categoryGroup.category.name_ar}</span>
                                {categoryGroup.category.name_en && (
                                  <span className="text-sm text-gray-500">({categoryGroup.category.name_en})</span>
                                )}
                                <Badge variant="outline" className="mr-2">
                                  {categoryGroup.trimLevels.length} درجة تجهيز
                                </Badge>
                              </div>
                              {expandedItems.has(`category-${categoryGroup.category.id}`) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </Collapsible.Trigger>
                          
                          <Collapsible.Content>
                            <div className="mr-8 mt-3 space-y-2">
                              {categoryGroup.trimLevels.map((trimLevel) => (
                                <div key={trimLevel.id} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-900 rounded border">
                                  <Settings className="w-4 h-4 text-purple-600" />
                                  <span>{trimLevel.name_ar}</span>
                                  {trimLevel.name_en && (
                                    <span className="text-sm text-gray-500">({trimLevel.name_en})</span>
                                  )}
                                </div>
                              ))}
                              {categoryGroup.trimLevels.length === 0 && (
                                <p className="text-gray-500 text-sm mr-7">لا توجد درجات تجهيز</p>
                              )}
                            </div>
                          </Collapsible.Content>
                        </Collapsible.Root>
                      </div>
                    ))}
                    {item.categories.length === 0 && (
                      <p className="text-gray-500 text-center py-4">لا توجد فئات لهذه الشركة المصنعة</p>
                    )}
                  </CardContent>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card>
          ))}
          
          {hierarchyData.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  لا توجد بيانات
                </h3>
                <p className="text-gray-500">
                  ابدأ بإضافة شركة مصنعة جديدة من الأزرار أعلاه
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}