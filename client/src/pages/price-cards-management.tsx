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

              {/* Split Layout - Cards List and Fixed Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Price Cards List */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          onClick={() => setPreviewVehicle(record.vehicle)}
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

                    {/* Empty State */}
                    {filteredPriceCards.length === 0 && (
                      <div className="md:col-span-2">
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed A4 Preview Panel */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <Card className="glass-container">
                      <CardHeader>
                        <CardTitle className="text-lg text-white drop-shadow-lg flex items-center gap-2">
                          <Eye size={18} />
                          معاينة بطاقة السعر - حجم A4
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        {previewVehicle ? (
                          <div 
                            className="bg-white rounded-lg shadow-2xl"
                            style={{
                              width: '210mm',
                              height: '297mm',
                              maxWidth: '100%',
                              aspectRatio: '210/297',
                              transform: 'scale(0.28)',
                              transformOrigin: 'top center',
                              margin: '0 auto'
                            }}
                          >
                            {/* A4 Price Card Content */}
                            <div className="w-full h-full p-8 text-black relative overflow-hidden" dir="rtl">
                              {/* Header with Logo */}
                              <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00627F' }}>
                                    <img src="/copmany logo.svg" alt="شعار الشركة" className="w-10 h-10 object-contain" />
                                  </div>
                                  <div>
                                    <h1 className="text-2xl font-bold text-gray-800">البريمي للسيارات</h1>
                                    <p className="text-gray-600">Al-Braimi Auto Trading</p>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <p className="text-sm text-gray-600">التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                                  <p className="text-sm text-gray-600">الوقت: {new Date().toLocaleTimeString('ar-SA', { hour12: false })}</p>
                                </div>
                              </div>

                              {/* Vehicle Image Area */}
                              <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg mb-8 flex items-center justify-center border-2 border-gray-200">
                                <div className="text-center">
                                  <ManufacturerLogo 
                                    manufacturerName={previewVehicle.manufacturer} 
                                    size="lg" 
                                    className="w-24 h-24 mx-auto mb-4"
                                  />
                                  <Car size={48} className="text-gray-400 mx-auto" />
                                  <p className="text-gray-500 mt-2">صورة السيارة</p>
                                </div>
                              </div>

                              {/* Vehicle Information */}
                              <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                    {previewVehicle.manufacturer}
                                  </h2>
                                  <h3 className="text-2xl text-gray-700 mb-2">
                                    {previewVehicle.category}
                                  </h3>
                                  <p className="text-xl text-gray-600 mb-4">
                                    موديل {previewVehicle.year}
                                  </p>
                                  <p className="text-lg text-gray-600">
                                    {previewVehicle.trimLevel}
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="font-semibold text-gray-700">الحالة:</span>
                                    <span className="text-gray-600">{previewVehicle.status}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-200 pb-2">
                                    <span className="font-semibold text-gray-700">نوع الاستيراد:</span>
                                    <span className="text-gray-600">{previewVehicle.importType}</span>
                                  </div>
                                  {previewVehicle.exteriorColor && (
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                      <span className="font-semibold text-gray-700">اللون الخارجي:</span>
                                      <span className="text-gray-600">{previewVehicle.exteriorColor}</span>
                                    </div>
                                  )}
                                  {previewVehicle.interiorColor && (
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                      <span className="font-semibold text-gray-700">اللون الداخلي:</span>
                                      <span className="text-gray-600">{previewVehicle.interiorColor}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Price Section */}
                              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8 border-2 border-green-200">
                                <div className="text-center">
                                  <p className="text-lg text-gray-700 mb-2">السعر</p>
                                  <p className="text-4xl font-bold text-green-600">
                                    {new Intl.NumberFormat('ar-SA', {
                                      style: 'currency',
                                      currency: 'SAR',
                                      minimumFractionDigits: 0
                                    }).format(parseFloat(previewVehicle.price?.toString() || '0'))}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-2">شامل ضريبة القيمة المضافة</p>
                                </div>
                              </div>

                              {/* Contact Information */}
                              <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                      <p className="font-semibold text-gray-700">الهاتف</p>
                                      <p className="text-gray-600">+966 XX XXX XXXX</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-700">البريد الإلكتروني</p>
                                      <p className="text-gray-600">info@albraimi.com</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-700">الموقع</p>
                                      <p className="text-gray-600">www.albraimi.com</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="bg-gray-100 rounded-lg flex items-center justify-center"
                            style={{
                              width: '210mm',
                              height: '297mm',
                              maxWidth: '100%',
                              aspectRatio: '210/297',
                              transform: 'scale(0.28)',
                              transformOrigin: 'top center',
                              margin: '0 auto'
                            }}
                          >
                            <div className="text-center">
                              <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                              <p className="text-gray-600 text-xl">
                                اختر بطاقة سعر لمعاينتها
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {previewVehicle && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => setPriceCardOpen(true)}
                              className="flex-1 bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-white/20 text-white"
                            >
                              <Printer size={14} className="ml-1" />
                              طباعة كاملة
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="glass-button p-2"
                            >
                              <Download size={14} />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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