import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Building2, Car, Settings, Search, Filter } from "lucide-react";
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

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/hierarchical/manufacturers'],
  });

  // Fetch hierarchical data
  const { data: hierarchyData = [], isLoading } = useQuery({
    queryKey: ['/api/hierarchy/full', selectedManufacturer],
    queryFn: async () => {
      const response = await fetch(`/api/hierarchy/full${selectedManufacturer !== 'all' ? `?manufacturer=${encodeURIComponent(selectedManufacturer)}` : ''}`);
      return response.json();
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

  const filteredData = hierarchyData.filter((item: HierarchyData) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const manufacturerMatch = item.manufacturer.nameAr.toLowerCase().includes(searchLower);
    const categoryMatch = item.categories.some(cat => 
      cat.category.name_ar.toLowerCase().includes(searchLower)
    );
    const trimMatch = item.categories.some(cat =>
      cat.trimLevels.some(trim => trim.name_ar.toLowerCase().includes(searchLower))
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
                    {manufacturerData.categories.map((categoryData) => (
                      <Card key={categoryData.category.id} className="bg-white/5 border-white/10">
                        <Collapsible.Root>
                          <Collapsible.Trigger 
                            className="w-full"
                            onClick={() => toggleExpanded(`category-${categoryData.category.id}`)}
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
                                    {categoryData.category.name_ar}
                                  </span>
                                  {expandedItems.has(`category-${categoryData.category.id}`) ? (
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
                              {categoryData.trimLevels.map((trimLevel) => (
                                <div 
                                  key={trimLevel.id}
                                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                                >
                                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                                    درجة التجهيز
                                  </Badge>
                                  <span className="text-white font-medium flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-purple-400" />
                                    {trimLevel.name_ar}
                                  </span>
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
    </div>
  );
}