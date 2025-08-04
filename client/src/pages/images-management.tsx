import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Image as ImageIcon, 
  Upload, 
  Eye, 
  Download, 
  Trash2,
  Plus,
  Car,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleImage {
  id: number;
  vehicleId: number;
  imageUrl: string;
  imageType: 'exterior' | 'interior' | 'engine' | 'documents';
  description?: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export default function ImagesManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedImageType, setSelectedImageType] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

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

  const imageTypes = [
    { value: "all", label: "جميع الأنواع" },
    { value: "exterior", label: "صور خارجية" },
    { value: "interior", label: "صور داخلية" },
    { value: "engine", label: "صور المحرك" },
    { value: "documents", label: "الوثائق" }
  ];

  // Mock image data - in a real app this would come from an API
  const mockImages = (vehicleId: number): VehicleImage[] => [
    {
      id: 1,
      vehicleId,
      imageUrl: "/api/placeholder/400/300",
      imageType: 'exterior',
      description: "المنظر الأمامي",
      isPrimary: true,
      uploadedAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      vehicleId,
      imageUrl: "/api/placeholder/400/300",
      imageType: 'exterior',
      description: "المنظر الخلفي",
      isPrimary: false,
      uploadedAt: "2024-01-15T10:31:00Z"
    },
    {
      id: 3,
      vehicleId,
      imageUrl: "/api/placeholder/400/300",
      imageType: 'interior',
      description: "المقصورة الداخلية",
      isPrimary: false,
      uploadedAt: "2024-01-15T10:32:00Z"
    }
  ];

  const VehicleImageCard = ({ vehicle }: { vehicle: any }) => {
    const images = mockImages(vehicle.id);
    const primaryImage = images.find(img => img.isPrimary) || images[0];
    
    return (
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
              className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
            >
              {images.length} صورة
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Primary Image */}
          <div className="relative group">
            <div className="aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10">
              {primaryImage ? (
                <img
                  src={primaryImage.imageUrl}
                  alt={primaryImage.description || "صورة المركبة"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-white/30" />
                </div>
              )}
            </div>
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    عرض
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-right">
                      صور {vehicle.manufacturer} {vehicle.category}
                    </DialogTitle>
                  </DialogHeader>
                  <ImageGallery vehicle={vehicle} images={images} />
                </DialogContent>
              </Dialog>
              
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <Upload className="h-4 w-4 mr-1" />
                إضافة
              </Button>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">رقم الشاسيه:</span>
            <span className="text-white font-mono">{vehicle.chassisNumber || "غير محدد"}</span>
          </div>

          {/* Image Type Breakdown */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-white font-semibold">
                {images.filter(img => img.imageType === 'exterior').length}
              </div>
              <div className="text-white/60">خارجية</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-white font-semibold">
                {images.filter(img => img.imageType === 'interior').length}
              </div>
              <div className="text-white/60">داخلية</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-white font-semibold">
                {images.filter(img => img.imageType === 'engine').length}
              </div>
              <div className="text-white/60">محرك</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-white font-semibold">
                {images.filter(img => img.imageType === 'documents').length}
              </div>
              <div className="text-white/60">وثائق</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ImageGallery = ({ vehicle, images }: { vehicle: any; images: VehicleImage[] }) => (
    <div className="space-y-6">
      {/* Filter by image type */}
      <div className="flex gap-2">
        {imageTypes.map((type) => (
          <Button
            key={type.value}
            variant={selectedImageType === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedImageType(type.value)}
            className="text-xs"
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images
          .filter(img => selectedImageType === "all" || img.imageType === selectedImageType)
          .map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.description || "صورة المركبة"}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                <Button size="sm" variant="secondary" className="p-2">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" className="p-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg">
                <div className="text-xs">{image.description}</div>
                <div className="text-xs text-white/70">
                  {new Date(image.uploadedAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
              
              {image.isPrimary && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                  أساسية
                </Badge>
              )}
            </div>
          ))}
      </div>

      {/* Add new image */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/70 mb-4">اسحب الصور هنا أو اضغط لاختيار الملفات</p>
        <Button variant="outline" className="border-white/20 text-white">
          <Plus className="h-4 w-4 mr-2" />
          إضافة صور جديدة
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white/70">جاري تحميل الصور...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">إدارة الصور</h1>
        </div>
        <p className="text-white/70 text-lg">
          إدارة وتنظيم صور المركبات في المخزون
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

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((vehicle: any) => (
          <VehicleImageCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">لا توجد مركبات مطابقة للبحث</p>
          <p className="text-white/50 text-sm mt-2">جرب تغيير معايير البحث</p>
        </div>
      )}
    </div>
  );
}