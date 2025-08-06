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
import { ChevronDown, ChevronRight, Building2, Car, Settings, Search, Filter, Plus, Palette, Tag } from "lucide-react";
// Import Collapsible from Radix UI directly since it's not in the shadcn/ui components
import * as Collapsible from "@radix-ui/react-collapsible";

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

interface Color {
  id: number;
  name_ar: string;
  name_en?: string;
  hex_code?: string;
  image_url?: string;
}

interface ColorAssociation {
  id: number;
  manufacturer?: string;
  category?: string;
  trim_level?: string;
  color_type: 'interior' | 'exterior';
  color_name: string;
  color_code?: string;
  is_active: boolean;
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
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTrimLevelOpen, setIsAddTrimLevelOpen] = useState(false);
  const [isAddColorOpen, setIsAddColorOpen] = useState(false);
  
  // Form states
  const [selectedManufacturerForAction, setSelectedManufacturerForAction] = useState<number | null>(null);
  const [selectedCategoryForAction, setSelectedCategoryForAction] = useState<number | null>(null);
  const [selectedTrimLevelForAction, setSelectedTrimLevelForAction] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTrimLevelName, setNewTrimLevelName] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");
  const [colorType, setColorType] = useState<'interior' | 'exterior'>('exterior');
  const [colorScope, setColorScope] = useState<'global' | 'manufacturer' | 'category' | 'trim'>('global');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/hierarchical/manufacturers'],
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: { name_ar: string; manufacturer_id: number }) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة الفئة",
        description: `تم إضافة فئة "${newCategoryName}" بنجاح`,
      });
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
    }
  });

  // Add trim level mutation
  const addTrimLevelMutation = useMutation({
    mutationFn: async (data: { name_ar: string; category_id: number }) => {
      const response = await fetch('/api/trim-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add trim level');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة درجة التجهيز",
        description: `تم إضافة درجة التجهيز "${newTrimLevelName}" بنجاح`,
      });
      setNewTrimLevelName("");
      setIsAddTrimLevelOpen(false);
    }
  });

  // Add color mutation
  const addColorMutation = useMutation({
    mutationFn: async (data: { 
      name_ar: string; 
      hex_code: string; 
      colorType: 'interior' | 'exterior';
      scope: string;
      manufacturer_id?: number;
      category_id?: number;
      trim_level_id?: number;
    }) => {
      // First add the color to the appropriate color table
      const colorEndpoint = data.colorType === 'exterior' ? '/api/colors/exterior' : '/api/colors/interior';
      const colorResponse = await fetch(colorEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ar: data.name_ar,
          hex_code: data.hex_code
        }),
      });
      
      if (!colorResponse.ok) throw new Error('Failed to add color');
      
      // If not global, create association
      if (data.scope !== 'global') {
        let associationData: any = {
          colorType: data.colorType,
          colorName: data.name_ar,
          colorCode: data.hex_code,
          isActive: true
        };

        // Set association based on scope
        if (data.scope === 'manufacturer' && selectedManufacturerForAction) {
          const manufacturer = (manufacturers as Manufacturer[]).find(m => m.id === selectedManufacturerForAction);
          associationData.manufacturer = manufacturer?.nameAr;
        } else if (data.scope === 'category' && selectedCategoryForAction) {
          // Get category info from hierarchy data
          const categoryInfo = hierarchyData.find((mData: HierarchyData) => 
            mData.categories.some(cat => cat.category.id === selectedCategoryForAction)
          );
          if (categoryInfo) {
            const category = categoryInfo.categories.find(cat => cat.category.id === selectedCategoryForAction);
            associationData.manufacturer = categoryInfo.manufacturer.nameAr;
            associationData.category = category?.category.name_ar;
          }
        } else if (data.scope === 'trim' && selectedTrimLevelForAction) {
          // Get trim level info from hierarchy data
          let trimInfo: any = null;
          hierarchyData.forEach((mData: HierarchyData) => {
            mData.categories.forEach(catData => {
              const trimLevel = catData.trimLevels.find(trim => trim.id === selectedTrimLevelForAction);
              if (trimLevel) {
                trimInfo = {
                  manufacturer: mData.manufacturer.nameAr,
                  category: catData.category.name_ar,
                  trimLevel: trimLevel.name_ar
                };
              }
            });
          });
          
          if (trimInfo) {
            associationData.manufacturer = trimInfo.manufacturer;
            associationData.category = trimInfo.category;
            associationData.trimLevel = trimInfo.trimLevel;
          }
        }

        const associationResponse = await fetch('/api/color-associations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(associationData),
        });
        
        if (!associationResponse.ok) throw new Error('Failed to create color association');
      }
      
      return colorResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "تمت إضافة اللون",
        description: `تم إضافة اللون "${newColorName}" بنجاح`,
      });
      setNewColorName("");
      setNewColorCode("#000000");
      setIsAddColorOpen(false);
      resetForms();
    }
  });

  // Fetch hierarchical data
  const { data: hierarchyData = [], isLoading } = useQuery({
    queryKey: ['/api/hierarchy/full', selectedManufacturer],
    queryFn: async () => {
      const response = await fetch(`/api/hierarchy/full${selectedManufacturer !== 'all' ? `?manufacturer=${encodeURIComponent(selectedManufacturer)}` : ''}`);
      return response.json();
    }
  });

  // Reset form states when dialog closes
  const resetForms = () => {
    setNewCategoryName("");
    setNewTrimLevelName("");
    setNewColorName("");
    setNewColorCode("#000000");
    setSelectedManufacturerForAction(null);
    setSelectedCategoryForAction(null);
    setSelectedTrimLevelForAction(null);
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredData = hierarchyData.filter((item: HierarchyData) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const manufacturerMatch = item.manufacturer.nameAr.toLowerCase().includes(searchLower);
    const categoryMatch = item.categories.some(cat => 
      cat.category.category.toLowerCase().includes(searchLower)
    );
    const trimMatch = item.categories.some(cat =>
      cat.trimLevels.some(trim => trim.trimLevel.toLowerCase().includes(searchLower))
    );
    
    return manufacturerMatch || categoryMatch || trimMatch;
  });

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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="glass-header p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-white text-right flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          التسلسل الهرمي للمركبات
        </h1>
        <p className="text-gray-300 text-right mt-2">
          عرض العلاقة الهرمية بين الصانعين والفئات ودرجات التجهيز
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-container">
        <CardHeader className="glass-header">
          <CardTitle className="text-white text-right flex items-center gap-2">
            <Filter className="h-5 w-5" />
            الفلاتر والبحث
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
                {(manufacturers as Manufacturer[]).map((manufacturer: Manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                    {manufacturer.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchy Display */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <Card className="glass-container">
            <CardContent className="p-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-lg">لا توجد بيانات متاحة</p>
              <p className="text-gray-400">جرب تغيير المرشحات أو البحث</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((manufacturerData: HierarchyData) => (
            <Card key={manufacturerData.manufacturer.id} className="glass-container">
              <Collapsible.Root>
                <Collapsible.Trigger 
                  className="w-full"
                  onClick={() => toggleExpanded(`manufacturer-${manufacturerData.manufacturer.id}`)}
                >
                  <CardHeader className="glass-header hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {manufacturerData.totalVehicles} مركبة
                        </Badge>
                        <Badge variant="secondary">
                          {manufacturerData.categories.length} فئة
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-white text-right flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-400" />
                          {manufacturerData.manufacturer.nameAr}
                        </CardTitle>
                        {expandedItems.has(`manufacturer-${manufacturerData.manufacturer.id}`) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Collapsible.Trigger>
                
                <Collapsible.Content>
                  <CardContent className="space-y-3">
                    {/* Action Buttons for Manufacturer */}
                    <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedManufacturerForAction(manufacturerData.manufacturer.id);
                          setIsAddCategoryOpen(true);
                        }}
                        className="bg-green-600/80 hover:bg-green-700/90 text-white"
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة فئة
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedManufacturerForAction(manufacturerData.manufacturer.id);
                          setColorScope('manufacturer');
                          setIsAddColorOpen(true);
                        }}
                        className="bg-purple-600/80 hover:bg-purple-700/90 text-white"
                      >
                        <Palette className="h-4 w-4 ml-1" />
                        لون خارجي
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedManufacturerForAction(manufacturerData.manufacturer.id);
                          setColorType('interior');
                          setColorScope('manufacturer');
                          setIsAddColorOpen(true);
                        }}
                        className="bg-indigo-600/80 hover:bg-indigo-700/90 text-white"
                      >
                        <Palette className="h-4 w-4 ml-1" />
                        لون داخلي
                      </Button>
                    </div>
                    {manufacturerData.categories.map((categoryData, categoryIndex) => (
                      <Card key={`${manufacturerData.manufacturer.id}-${categoryData.category.category}`} className="bg-white/5 border-white/10">
                        <Collapsible.Root>
                          <Collapsible.Trigger 
                            className="w-full"
                            onClick={() => toggleExpanded(`category-${manufacturerData.manufacturer.id}-${categoryData.category.category}`)}
                          >
                            <CardHeader className="py-3 hover:bg-white/5 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-green-400 border-green-400">
                                    {categoryData.vehicleCount} مركبة
                                  </Badge>
                                  <Badge variant="secondary">
                                    {categoryData.trimLevels.length} درجة تجهيز
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-white font-medium flex items-center gap-2">
                                    <Car className="h-4 w-4 text-green-400" />
                                    {categoryData.category.category}
                                  </span>
                                  {expandedItems.has(`category-${manufacturerData.manufacturer.id}-${categoryData.category.category}`) ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </Collapsible.Trigger>
                          
                          <Collapsible.Content>
                            <CardContent className="pt-0 space-y-2">
                              {/* Action Buttons for Category */}
                              <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10 mb-3">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCategoryForAction(categoryIndex);
                                    setIsAddTrimLevelOpen(true);
                                  }}
                                  className="bg-orange-600/80 hover:bg-orange-700/90 text-white"
                                >
                                  <Plus className="h-4 w-4 ml-1" />
                                  إضافة درجة تجهيز
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCategoryForAction(categoryIndex);
                                    setColorScope('category');
                                    setColorType('exterior');
                                    setIsAddColorOpen(true);
                                  }}
                                  className="bg-purple-600/80 hover:bg-purple-700/90 text-white"
                                >
                                  <Palette className="h-4 w-4 ml-1" />
                                  لون خارجي
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCategoryForAction(categoryIndex);
                                    setColorScope('category');
                                    setColorType('interior');
                                    setIsAddColorOpen(true);
                                  }}
                                  className="bg-indigo-600/80 hover:bg-indigo-700/90 text-white"
                                >
                                  <Palette className="h-4 w-4 ml-1" />
                                  لون داخلي
                                </Button>
                              </div>
                              {categoryData.trimLevels.map((trimLevel, trimIndex) => (
                                <div 
                                  key={`${manufacturerData.manufacturer.id}-${categoryData.category.category}-${trimLevel.trimLevel}`}
                                  className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                                      درجة التجهيز
                                    </Badge>
                                    <span className="text-white font-medium flex items-center gap-2">
                                      <Settings className="h-4 w-4 text-purple-400" />
                                      {trimLevel.trimLevel}
                                    </span>
                                  </div>
                                  
                                  {/* Action Buttons for Trim Level */}
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTrimLevelForAction(trimIndex);
                                        setColorScope('trim');
                                        setColorType('exterior');
                                        setIsAddColorOpen(true);
                                      }}
                                      className="bg-purple-600/80 hover:bg-purple-700/90 text-white text-xs"
                                    >
                                      <Palette className="h-3 w-3 ml-1" />
                                      لون خارجي
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTrimLevelForAction(trimIndex);
                                        setColorScope('trim');
                                        setColorType('interior');
                                        setIsAddColorOpen(true);
                                      }}
                                      className="bg-indigo-600/80 hover:bg-indigo-700/90 text-white text-xs"
                                    >
                                      <Palette className="h-3 w-3 ml-1" />
                                      لون داخلي
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              {categoryData.trimLevels.length === 0 && (
                                <div className="text-center py-6 text-gray-400">
                                  لا توجد درجات تجهيز محددة لهذه الفئة
                                </div>
                              )}
                            </CardContent>
                          </Collapsible.Content>
                        </Collapsible.Root>
                      </Card>
                    ))}
                    
                    {manufacturerData.categories.length === 0 && (
                      <div className="text-center py-6 text-gray-400">
                        لا توجد فئات مسجلة لهذا الصانع
                      </div>
                    )}
                  </CardContent>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card>
          ))
        )}
      </div>

      {/* Global Color Management Button */}
      <div className="fixed bottom-6 left-6">
        <Button
          onClick={() => {
            setColorScope('global');
            setIsAddColorOpen(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
          size="lg"
        >
          <Palette className="h-5 w-5 ml-2" />
          إدارة الألوان العامة
        </Button>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="glass-container max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-right">إضافة فئة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/90">اسم الفئة</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="أدخل اسم الفئة الجديدة"
                className="bg-white/10 border-white/20 text-white"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddCategoryOpen(false)}
                className="bg-white/10 border-white/20 text-white"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  if (newCategoryName.trim() && selectedManufacturerForAction) {
                    addCategoryMutation.mutate({
                      name_ar: newCategoryName.trim(),
                      manufacturer_id: selectedManufacturerForAction
                    });
                  }
                }}
                disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addCategoryMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Trim Level Dialog */}
      <Dialog open={isAddTrimLevelOpen} onOpenChange={setIsAddTrimLevelOpen}>
        <DialogContent className="glass-container max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-right">إضافة درجة تجهيز جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/90">اسم درجة التجهيز</Label>
              <Input
                value={newTrimLevelName}
                onChange={(e) => setNewTrimLevelName(e.target.value)}
                placeholder="أدخل اسم درجة التجهيز الجديدة"
                className="bg-white/10 border-white/20 text-white"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddTrimLevelOpen(false)}
                className="bg-white/10 border-white/20 text-white"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  if (newTrimLevelName.trim() && selectedCategoryForAction) {
                    addTrimLevelMutation.mutate({
                      name_ar: newTrimLevelName.trim(),
                      category_id: selectedCategoryForAction
                    });
                  }
                }}
                disabled={!newTrimLevelName.trim() || addTrimLevelMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {addTrimLevelMutation.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Color Dialog */}
      <Dialog open={isAddColorOpen} onOpenChange={setIsAddColorOpen}>
        <DialogContent className="glass-container max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-right">
              إضافة لون {colorType === 'exterior' ? 'خارجي' : 'داخلي'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/90">نطاق اللون</Label>
              <Select value={colorScope} onValueChange={(value: any) => setColorScope(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">عام (لجميع المركبات)</SelectItem>
                  <SelectItem value="manufacturer">خاص بالصانع</SelectItem>
                  <SelectItem value="category">خاص بالفئة</SelectItem>
                  <SelectItem value="trim">خاص بدرجة التجهيز</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/90">نوع اللون</Label>
              <Select value={colorType} onValueChange={(value: any) => setColorType(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exterior">لون خارجي</SelectItem>
                  <SelectItem value="interior">لون داخلي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/90">اسم اللون</Label>
              <Input
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="أدخل اسم اللون"
                className="bg-white/10 border-white/20 text-white"
                dir="rtl"
              />
            </div>

            <div>
              <Label className="text-white/90">كود اللون</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  className="w-16 h-10 bg-white/10 border-white/20"
                />
                <Input
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  placeholder="#000000"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddColorOpen(false)}
                className="bg-white/10 border-white/20 text-white"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  if (newColorName.trim()) {
                    addColorMutation.mutate({
                      name_ar: newColorName.trim(),
                      hex_code: newColorCode,
                      colorType,
                      scope: colorScope,
                      manufacturer_id: selectedManufacturerForAction || undefined,
                      category_id: selectedCategoryForAction || undefined,
                      trim_level_id: selectedTrimLevelForAction || undefined
                    });
                  }
                }}
                disabled={!newColorName.trim() || addColorMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {addColorMutation.isPending ? "جاري الإضافة..." : "إضافة اللون"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}