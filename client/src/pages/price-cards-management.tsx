import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  Eye,
  Home,
  FileText,
  Calendar,
  Building2,
  Car,
  Palette,
  BarChart3,
  LogOut
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest } from "@/lib/queryClient";
import { ManufacturerLogo } from "@/components/manufacturer-logo";
import PriceCard from "@/components/price-card";
import NewPriceCard from "@/components/new-price-card";
import SystemGlassWrapper from "@/components/system-glass-wrapper";
import type { InventoryItem } from "@shared/schema";

interface PriceCardRecord {
  id: number;
  vehicleId: number;
  vehicle: InventoryItem;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "archived";
  downloadCount: number;
}

interface PriceCardsManagementPageProps {
  userRole: string;
  username: string;
  onLogout: () => void;
}

export default function PriceCardsManagementPage({ userRole, username, onLogout }: PriceCardsManagementPageProps) {
  const { companyName, companyLogo, darkMode, toggleDarkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryItem | null>(null);
  const [priceCardOpen, setPriceCardOpen] = useState(false);
  const [previewVehicle, setPreviewVehicle] = useState<InventoryItem | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<PriceCardRecord | null>(null);

  // Fetch inventory data
  const { data: inventoryData = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Mock price cards data (في التطبيق الحقيقي، ستكون من قاعدة البيانات)
  const [priceCardsData, setPriceCardsData] = useState<PriceCardRecord[]>([
    {
      id: 1,
      vehicleId: 1,
      vehicle: inventoryData[0] || {} as InventoryItem,
      title: "بطاقة سعر - مرسيدس E200",
      createdAt: "2025-01-27T10:30:00Z",
      updatedAt: "2025-01-27T10:30:00Z",
      status: "active",
      downloadCount: 15
    }
  ]);

  // Filter available vehicles (not sold)
  const availableVehicles = inventoryData.filter(vehicle => 
    vehicle.status !== "مباع" && !vehicle.isSold
  );

  // Get unique manufacturers for filter
  const manufacturers = Array.from(new Set(inventoryData.map(item => item.manufacturer)))
    .filter(manufacturer => manufacturer);

  // Filter price cards based on search and filters
  const filteredPriceCards = priceCardsData.filter(record => {
    const matchesSearch = searchQuery === "" || 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicle.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicle.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesManufacturer = selectedManufacturer === "all" || 
      record.vehicle.manufacturer === selectedManufacturer;
    
    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus;
    
    return matchesSearch && matchesManufacturer && matchesStatus;
  });

  // Statistics
  const stats = {
    total: priceCardsData.length,
    active: priceCardsData.filter(r => r.status === "active").length,
    archived: priceCardsData.filter(r => r.status === "archived").length,
    totalDownloads: priceCardsData.reduce((sum, r) => sum + r.downloadCount, 0)
  };

  // Handle create price card
  const handleCreatePriceCard = (vehicle: InventoryItem) => {
    setSelectedVehicle(vehicle);
    setPriceCardOpen(true);
    setShowCreateDialog(false);
    
    // Add to records (في التطبيق الحقيقي، سيتم الحفظ في قاعدة البيانات)
    const newRecord: PriceCardRecord = {
      id: Date.now(),
      vehicleId: vehicle.id,
      vehicle: vehicle,
      title: `بطاقة سعر - ${vehicle.manufacturer} ${vehicle.category}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      downloadCount: 0
    };
    
    setPriceCardsData(prev => [newRecord, ...prev]);
    
    toast({
      title: "تم إنشاء بطاقة السعر",
      description: `تم إنشاء بطاقة سعر لـ ${vehicle.manufacturer} ${vehicle.category}`
    });
  };

  // Handle preview price card
  const handlePreview = (record: PriceCardRecord) => {
    setPreviewVehicle(record.vehicle);
    setPriceCardOpen(true);
  };

  // Handle delete price card
  const handleDelete = (record: PriceCardRecord) => {
    setPriceCardsData(prev => prev.filter(r => r.id !== record.id));
    setRecordToDelete(null);
    
    toast({
      title: "تم حذف بطاقة السعر",
      description: "تم حذف بطاقة السعر بنجاح"
    });
  };

  // Handle archive/unarchive
  const handleToggleStatus = (record: PriceCardRecord) => {
    const newStatus = record.status === "active" ? "archived" : "active";
    setPriceCardsData(prev => prev.map(r => 
      r.id === record.id 
        ? { ...r, status: newStatus, updatedAt: new Date().toISOString() }
        : r
    ));
    
    toast({
      title: newStatus === "archived" ? "تم أرشفة البطاقة" : "تم استعادة البطاقة",
      description: `تم ${newStatus === "archived" ? "أرشفة" : "استعادة"} بطاقة السعر`
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SystemGlassWrapper>
      <div className="min-h-screen" dir="rtl">
        {/* Header */}
        <header className="glass-container sticky top-0 z-50 border-b border-white/20 dark:border-slate-700/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg overflow-hidden" style={{ backgroundColor: '#00627F' }}>
                  {companyLogo ? (
                    <img src={companyLogo} alt="شعار الشركة" className="w-full h-full object-contain" />
                  ) : (
                    <img src="/copmany logo.svg" alt="شعار البريمي للسيارات" className="w-8 h-8 object-contain" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white drop-shadow-lg">إدارة بطاقات الأسعار</h1>
                  <p className="text-sm text-white/80 drop-shadow-sm">إنشاء وإدارة بطاقات أسعار السيارات</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link href="/">
                  <Button variant="outline" size="sm" className="glass-button glass-text-primary">
                    <Home size={16} className="ml-1" />
                    الرئيسية
                  </Button>
                </Link>
                
                <Link href="/card-view">
                  <Button variant="outline" size="sm" className="glass-button glass-text-primary">
                    <Car size={16} className="ml-1" />
                    عرض البطاقات
                  </Button>
                </Link>

                <Button onClick={onLogout} variant="outline" size="sm" className="glass-button glass-text-primary">
                  <LogOut size={16} className="ml-1" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="glass-container mb-6">
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <BarChart3 size={16} />
                إدارة البطاقات
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus size={16} />
                إنشاء بطاقة جديدة
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2">
                <BarChart3 size={16} />
                الإحصائيات
              </TabsTrigger>
            </TabsList>

            {/* Statistics Tab */}
            <TabsContent value="statistics">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="glass-container">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70 drop-shadow-md">إجمالي البطاقات</p>
                        <p className="text-3xl font-bold text-white drop-shadow-lg">{stats.total}</p>
                      </div>
                      <Receipt className="h-8 w-8 text-blue-400 drop-shadow-lg" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-container">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70 drop-shadow-md">البطاقات النشطة</p>
                        <p className="text-3xl font-bold text-green-400 drop-shadow-lg">{stats.active}</p>
                      </div>
                      <Eye className="h-8 w-8 text-green-400 drop-shadow-lg" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-container">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70 drop-shadow-md">البطاقات المؤرشفة</p>
                        <p className="text-3xl font-bold text-orange-400 drop-shadow-lg">{stats.archived}</p>
                      </div>
                      <FileText className="h-8 w-8 text-orange-400 drop-shadow-lg" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-container">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70 drop-shadow-md">إجمالي التحميلات</p>
                        <p className="text-3xl font-bold text-purple-400 drop-shadow-lg">{stats.totalDownloads}</p>
                      </div>
                      <Download className="h-8 w-8 text-purple-400 drop-shadow-lg" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create">
              <Card className="glass-container">
                <CardHeader>
                  <CardTitle className="text-xl text-white drop-shadow-lg flex items-center gap-2">
                    <Plus size={20} />
                    إنشاء بطاقة سعر جديدة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableVehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="glass-card hover:scale-105 transition-transform duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <ManufacturerLogo 
                              manufacturerName={vehicle.manufacturer} 
                              size="sm" 
                              className="w-8 h-8"
                            />
                            <div>
                              <h3 className="font-semibold text-white drop-shadow-md">{vehicle.manufacturer}</h3>
                              <p className="text-sm text-white/80 drop-shadow-sm">{vehicle.category}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70 drop-shadow-sm">السنة:</span>
                              <span className="text-white drop-shadow-md">{vehicle.year}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70 drop-shadow-sm">السعر:</span>
                              <span className="text-white font-bold drop-shadow-md">
                                {new Intl.NumberFormat('ar-SA', {
                                  style: 'currency',
                                  currency: 'SAR',
                                  minimumFractionDigits: 0
                                }).format(parseFloat(vehicle.price?.toString() || '0'))}
                              </span>
                            </div>
                          </div>

                          <Button 
                            onClick={() => handleCreatePriceCard(vehicle)}
                            className="w-full bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-white/20 text-white"
                          >
                            <Receipt size={16} className="ml-2" />
                            إنشاء بطاقة سعر
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Management Tab */}
            <TabsContent value="manage">
              {/* Filters */}
              <Card className="glass-container mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                        <Input
                          placeholder="البحث في بطاقات الأسعار..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="glass-search pr-10 text-right text-white placeholder:text-white/60"
                        />
                      </div>
                    </div>
                    
                    <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                      <SelectTrigger className="glass-select w-48">
                        <SelectValue placeholder="اختر الصانع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الصناع</SelectItem>
                        {manufacturers.map((manufacturer) => (
                          <SelectItem key={manufacturer} value={manufacturer}>
                            {manufacturer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="glass-select w-48">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value="active">نشطة</SelectItem>
                        <SelectItem value="archived">مؤرشفة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Price Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPriceCards.map((record) => (
                  <Card key={record.id} className="glass-card hover:scale-105 transition-transform duration-200">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <ManufacturerLogo 
                            manufacturerName={record.vehicle.manufacturer} 
                            size="sm" 
                            className="w-10 h-10"
                          />
                          <div>
                            <h3 className="font-semibold text-white drop-shadow-md">
                              {record.vehicle.manufacturer} {record.vehicle.category}
                            </h3>
                            <p className="text-sm text-white/70 drop-shadow-sm">
                              {record.vehicle.year} - {record.vehicle.trimLevel}
                            </p>
                          </div>
                        </div>
                        
                        <Badge 
                          className={`${
                            record.status === "active" 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          } backdrop-blur-sm`}
                        >
                          {record.status === "active" ? "نشطة" : "مؤرشفة"}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70 drop-shadow-sm">السعر:</span>
                          <span className="text-white font-bold drop-shadow-md">
                            {new Intl.NumberFormat('ar-SA', {
                              style: 'currency',
                              currency: 'SAR',
                              minimumFractionDigits: 0
                            }).format(parseFloat(record.vehicle.price?.toString() || '0'))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70 drop-shadow-sm">التحميلات:</span>
                          <span className="text-white drop-shadow-md">{record.downloadCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70 drop-shadow-sm">تاريخ الإنشاء:</span>
                          <span className="text-white drop-shadow-md">{formatDate(record.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePreview(record)}
                          className="flex-1 bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-white/20 text-white"
                        >
                          <Eye size={16} className="ml-1" />
                          معاينة
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(record)}
                          className="glass-button"
                        >
                          {record.status === "active" ? "أرشفة" : "استعادة"}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="glass-button-danger p-2">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف بطاقة السعر هذه؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(record)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredPriceCards.length === 0 && (
                <Card className="glass-container">
                  <CardContent className="p-12 text-center">
                    <Receipt className="mx-auto h-16 w-16 text-white/40 mb-4 drop-shadow-lg" />
                    <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">لا توجد بطاقات أسعار</h3>
                    <p className="text-white/70 mb-4 drop-shadow-sm">
                      {searchQuery || selectedManufacturer !== "all" || selectedStatus !== "all"
                        ? "لا توجد بطاقات أسعار تطابق معايير البحث"
                        : "لم يتم إنشاء أي بطاقات أسعار بعد"
                      }
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-white/20 text-white">
                      <Plus size={16} className="ml-2" />
                      إنشاء بطاقة سعر جديدة
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Static Price Card Preview Section */}
        <div className="mt-8">
          <Card className="glass-container">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white drop-shadow-lg text-center">
                معاينة بطاقة السعر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-center overflow-x-auto bg-[#00627F]">
                <div 
                  className="preview-price-card relative rounded-lg overflow-hidden"
                  style={{
                    width: '297mm', // A4 landscape width
                    height: '210mm', // A4 landscape height
                    fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
                    direction: 'rtl',
                    backgroundImage: 'url(/price-card.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minWidth: '297mm',
                    minHeight: '210mm',
                    maxWidth: '297mm',
                    maxHeight: '210mm'
                  }}
                >
                  {/* Company Logo */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                    <img 
                      src="/company-logo.svg" 
                      alt="شعار الشركة" 
                      className="w-64 h-64 object-contain filter brightness-110"
                    />
                  </div>

                  {/* Year */}
                  <div className="absolute top-60 left-1/2 transform -translate-x-1/2">
                    <div className="text-white text-[17.83rem] font-black tracking-wider leading-none mt-[-51px] mb-[-51px]">
                      2025
                    </div>
                  </div>

                  {/* Main Content Card - Above Gold Section */}
                  <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl" style={{ zIndex: 10 }}>
                    <div className="flex flex-col h-full space-y-4">
                      {/* First Row - Category, Trim Level, Manufacturer Logo */}
                      <div className="flex items-center justify-between">
                        <div className="text-[#CF9B47] font-bold text-[66px]">
                          S 450
                        </div>
                        <div className="text-[#CF9B47] font-semibold text-[66px]">
                          الفئة الفاخرة
                        </div>
                        <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full">
                          <Car className="w-16 h-16 text-[#CF9B47]" />
                        </div>
                      </div>

                      {/* Second Row - Status, Mileage and Price */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Status and Mileage Box */}
                        <div className="flex-1 p-4 text-center">
                          <div className="font-semibold mb-1 text-[#03627f] text-[22px]">الحالة</div>
                          <div className="text-red-600 text-xl font-bold mb-2">مستعمل</div>
                          
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-semibold text-[#23252f] text-[15px]">المماشي:</span>
                            <span className="text-[#00627F] text-lg font-bold">6000</span>
                            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-black">KM</span>
                            </div>
                          </div>
                        </div>

                        {/* Price Box */}
                        <div className="flex-1 p-4 text-center">
                          <div className="font-semibold mb-2 text-[#03627f] bg-[#2a2c3700] text-[22px]">تفاصيل السعر</div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[#23252f]">
                              <span className="text-black font-medium">السعر الأساسي:</span>
                              <span className="text-black font-semibold">﷼ 234,783</span>
                            </div>
                            <div className="flex justify-between text-xs text-[#23252f]">
                              <span className="text-black font-medium">قيمة الضريبة (15%):</span>
                              <span className="text-black font-semibold">﷼ 35,217</span>
                            </div>
                            <div className="border-t border-gray-300 pt-1">
                              <div className="flex justify-between">
                                <span className="text-black text-sm font-bold">السعر الإجمالي:</span>
                                <span className="text-black text-lg font-bold">﷼ 270,000</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Import Type Circle - Red for Used */}
                  <div className="absolute top-8 right-8 w-8 h-8 bg-red-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="text-center mt-4 space-y-4">
                <p className="text-white/80 text-sm drop-shadow-sm">
                  هذا مثال على شكل بطاقة السعر التي سيتم إنتاجها عند اختيار سيارة من المخزون
                </p>
                
                {/* Preview Action Buttons */}
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => {
                      const element = document.querySelector('.preview-price-card');
                      if (element) {
                        window.print();
                      }
                    }}
                    className="bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-white/20 text-white px-6 py-2 rounded-lg"
                  >
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة المعاينة
                  </Button>
                  
                  <Button 
                    onClick={async () => {
                      try {
                        const element = document.querySelector('.preview-price-card') as HTMLElement;
                        if (!element) return;

                        const html2canvas = (await import('html2canvas')).default;
                        const jsPDF = (await import('jspdf')).default;

                        const canvas = await html2canvas(element, {
                          scale: 2,
                          useCORS: true,
                          allowTaint: true,
                          backgroundColor: '#ffffff'
                        });

                        const pdf = new jsPDF({
                          orientation: 'landscape',
                          unit: 'mm',
                          format: 'a4'
                        });
                        
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = pdf.internal.pageSize.getHeight();
                        const canvasAspectRatio = canvas.height / canvas.width;
                        
                        let finalWidth = pdfWidth;
                        let finalHeight = pdfWidth * canvasAspectRatio;
                        
                        if (finalHeight > pdfHeight) {
                          finalHeight = pdfHeight;
                          finalWidth = pdfHeight / canvasAspectRatio;
                        }
                        
                        const xOffset = (pdfWidth - finalWidth) / 2;
                        const yOffset = (pdfHeight - finalHeight) / 2;

                        const imgData = canvas.toDataURL('image/png', 1.0);
                        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
                        
                        const timestamp = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                        pdf.save(`معاينة-بطاقة-السعر-${timestamp}.pdf`);
                      } catch (error) {
                        console.error('Error generating PDF:', error);
                      }
                    }}
                    variant="outline"
                    className="glass-button px-6 py-2 rounded-lg"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Price Card Preview Dialog */}
        <NewPriceCard
          open={priceCardOpen}
          onOpenChange={setPriceCardOpen}
          vehicle={previewVehicle || selectedVehicle}
        />
      </div>
    </SystemGlassWrapper>
  );
}