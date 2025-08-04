import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Settings, Car, Wrench, Fuel, Gauge, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleSpecification {
  id: number;
  chassisNumber: string;
  manufacturer: string;
  category: string;
  trimLevel: string;
  year: number;
  engineCapacity: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: number;
  status: string;
  location: string;
  specifications: {
    engine: string;
    power: string;
    torque: string;
    acceleration: string;
    topSpeed: string;
    fuelConsumption: string;
    emissions: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      wheelbase: string;
      weight: string;
    };
    features: string[];
    safety: string[];
    technology: string[];
  };
}

export default function DetailedSpecificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch inventory data
  const { data: inventory = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/inventory"],
  });

  // Filter inventory based on search term and category
  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch = searchTerm === "" || 
      item.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trimLevel?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ["all", ...new Set(inventory.map((item: any) => item.category).filter(Boolean))];

  const SpecificationCard = ({ vehicle }: { vehicle: any }) => (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-lg font-semibold">
              {vehicle.manufacturer} {vehicle.category}
            </CardTitle>
            <CardDescription className="text-white/70 mt-1">
              {vehicle.trimLevel} - {vehicle.year}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              vehicle.status === "متوفر" && "bg-green-500/20 text-green-300 border-green-500/30",
              vehicle.status === "محجوز" && "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
              vehicle.status === "مباع" && "bg-red-500/20 text-red-300 border-red-500/30"
            )}
          >
            {vehicle.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <Car className="h-4 w-4" />
              <span className="text-sm">رقم الشاسيه</span>
            </div>
            <p className="text-white font-mono text-sm bg-white/5 rounded p-2">
              {vehicle.chassisNumber || "غير محدد"}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <Fuel className="h-4 w-4" />
              <span className="text-sm">نوع الوقود</span>
            </div>
            <p className="text-white text-sm bg-white/5 rounded p-2">
              {vehicle.fuelType || "غير محدد"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <Gauge className="h-4 w-4" />
              <span className="text-sm">سعة المحرك</span>
            </div>
            <p className="text-white text-sm bg-white/5 rounded p-2">
              {vehicle.engineCapacity || "غير محدد"}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <Wrench className="h-4 w-4" />
              <span className="text-sm">ناقل الحركة</span>
            </div>
            <p className="text-white text-sm bg-white/5 rounded p-2">
              {vehicle.transmission || "غير محدد"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">سنة الصنع</span>
            </div>
            <p className="text-white text-sm bg-white/5 rounded p-2">
              {vehicle.year || "غير محدد"}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">الموقع</span>
            </div>
            <p className="text-white text-sm bg-white/5 rounded p-2">
              {vehicle.location || "غير محدد"}
            </p>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-white/80 text-sm">اللون الخارجي</span>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: vehicle.exteriorColor || "#666" }}
              />
              <span className="text-white text-sm">{vehicle.exteriorColor || "غير محدد"}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-white/80 text-sm">اللون الداخلي</span>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: vehicle.interiorColor || "#666" }}
              />
              <span className="text-white text-sm">{vehicle.interiorColor || "غير محدد"}</span>
            </div>
          </div>
        </div>

        {/* Additional specifications if available */}
        {vehicle.specifications && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-white font-semibold mb-3">المواصفات الإضافية</h4>
            <div className="space-y-2">
              {vehicle.specifications.features && vehicle.specifications.features.length > 0 && (
                <div>
                  <span className="text-white/80 text-sm">الميزات:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vehicle.specifications.features.slice(0, 3).map((feature: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/80">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white/70">جاري تحميل المواصفات...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">المواصفات التفصيلية</h1>
        </div>
        <p className="text-white/70 text-lg">
          عرض تفصيلي لجميع مواصفات المركبات في المخزون
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
            <Input
              placeholder="البحث برقم الشاسيه، الصانع، الفئة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white"
          >
            <option value="all">جميع الفئات</option>
            {categories.slice(1).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-white/70">
          عرض {filteredInventory.length} من أصل {inventory.length} مركبة
        </p>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInventory.map((vehicle: any) => (
          <SpecificationCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">لا توجد مواصفات مطابقة للبحث</p>
          <p className="text-white/50 text-sm mt-2">جرب تغيير معايير البحث</p>
        </div>
      )}
    </div>
  );
}