import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Download, Printer, Search, Filter, Plus, RefreshCw, Edit, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { ManufacturerLogo } from "@/components/manufacturer-logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

interface InventoryItem {
  id: number;
  manufacturer: string;
  category: string;
  trimLevel?: string;
  model?: string;
  year?: number;
  price?: number;
  status?: string;
  importType?: string;
  notes?: string;
  engineCapacity?: string;
  exteriorColor?: string;
  interiorColor?: string;
  chassisNumber?: string;
}

interface PriceCard {
  id: number;
  inventoryItemId: number;
  manufacturer: string;
  category: string;
  trimLevel?: string;
  model?: string;
  year: number;
  price?: number;
  features: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const priceCardSchema = z.object({
  inventoryItemId: z.number(),
  manufacturer: z.string().min(1, "الصانع مطلوب"),
  category: z.string().min(1, "الفئة مطلوبة"),
  trimLevel: z.string().optional(),
  model: z.string().optional(),
  year: z.number().min(2000).max(2030),
  price: z.string().optional(),
  features: z.array(z.string()).default([]),
  status: z.string().default("نشط"),
});

type PriceCardFormData = z.infer<typeof priceCardSchema>;

export default function EnhancedPriceCardsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [editingCard, setEditingCard] = useState<PriceCard | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filter states - enhanced with trimLevel and model
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTrimLevel, setSelectedTrimLevel] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");

  // Fetch inventory data
  const { data: inventoryData = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Fetch existing price cards
  const { data: priceCards = [] } = useQuery<PriceCard[]>({
    queryKey: ["/api/price-cards"],
  });

  // Form for editing price cards
  const form = useForm<PriceCardFormData>({
    resolver: zodResolver(priceCardSchema),
    defaultValues: {
      inventoryItemId: 0,
      manufacturer: "",
      category: "",
      trimLevel: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      features: [],
      status: "نشط",
    },
  });

  // Filter price cards based on all filters
  const filteredCards = priceCards.filter(card => {
    const matchesSearch = searchTerm === "" || 
      card.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.trimLevel?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesManufacturer = selectedManufacturer === "all" || card.manufacturer === selectedManufacturer;
    const matchesCategory = selectedCategory === "all" || card.category === selectedCategory;
    const matchesTrimLevel = selectedTrimLevel === "all" || card.trimLevel === selectedTrimLevel;
    const matchesModel = selectedModel === "all" || card.model === selectedModel;
    
    return matchesSearch && matchesManufacturer && matchesCategory && matchesTrimLevel && matchesModel;
  });

  // Get unique values for filters
  const manufacturers = ["all", ...new Set(priceCards.map(card => card.manufacturer).filter(Boolean))];
  const categories = ["all", ...new Set(priceCards.map(card => card.category).filter(Boolean))];
  const trimLevels = ["all", ...new Set(priceCards.map(card => card.trimLevel).filter(Boolean))];
  const models = ["all", ...new Set(priceCards.map(card => card.model).filter(Boolean))];

  // Toggle card expansion
  const toggleCardExpansion = (cardId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  // Create price card mutation
  const createPriceCardMutation = useMutation({
    mutationFn: async (data: PriceCardFormData) => {
      return await apiRequest("POST", "/api/price-cards", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-cards"] });
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء بطاقة السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ في إنشاء بطاقة السعر",
        variant: "destructive",
      });
    },
  });

  // Update price card mutation
  const updatePriceCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PriceCardFormData> }) => {
      return await apiRequest("PATCH", `/api/price-cards/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-cards"] });
      setIsEditDialogOpen(false);
      setEditingCard(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بطاقة السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث بطاقة السعر",
        variant: "destructive",
      });
    },
  });

  // Delete price card mutation
  const deletePriceCardMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/price-cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-cards"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف بطاقة السعر بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف بطاقة السعر",
        variant: "destructive",
      });
    },
  });

  // Handle edit card
  const handleEditCard = (card: PriceCard) => {
    setEditingCard(card);
    form.reset({
      inventoryItemId: card.inventoryItemId,
      manufacturer: card.manufacturer,
      category: card.category,
      trimLevel: card.trimLevel || "",
      model: card.model || "",
      year: card.year,
      price: card.price?.toString() || "",
      features: card.features || [],
      status: card.status,
    });
    setIsEditDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: PriceCardFormData) => {
    if (editingCard) {
      updatePriceCardMutation.mutate({ id: editingCard.id, data });
    } else {
      createPriceCardMutation.mutate(data);
    }
  };

  // Format price
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ar-SA').format(numPrice || 0);
  };

  // Generate vehicle URL for QR code
  const generateVehicleURL = (card: PriceCard) => {
    const baseURL = window.location.origin;
    return `${baseURL}/price-cards/${card.id}?manufacturer=${encodeURIComponent(card.manufacturer)}&category=${encodeURIComponent(card.category)}&year=${card.year}&price=${card.price}`;
  };

  // Enhanced PDF generation for A4 fixed layout
  const generatePDF = async (card: PriceCard, cardId: string) => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById(cardId);
      if (!element) {
        console.error('Price card element not found');
        return;
      }

      // Wait for fonts and images to load
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a temporary element for PDF with A4 landscape dimensions
      const printElement = element.cloneNode(true) as HTMLElement;
      printElement.style.transform = 'scale(1)';
      printElement.style.transformOrigin = 'top left';
      printElement.style.width = '297mm'; // A4 landscape width
      printElement.style.height = '210mm'; // A4 landscape height
      printElement.style.position = 'absolute';
      printElement.style.top = '-9999px';
      printElement.style.left = '-9999px';
      printElement.style.backgroundColor = '#ffffff';
      document.body.appendChild(printElement);

      // Generate high-quality canvas
      const canvas = await html2canvas(printElement, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1123, // A4 landscape width in pixels at 96 DPI
        height: 794,  // A4 landscape height in pixels at 96 DPI
        logging: false
      });

      document.body.removeChild(printElement);

      // Convert to PDF with exact A4 landscape dimensions
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, '', 'FAST');
      
      const fileName = `بطاقة_سعر_${card.manufacturer}_${card.category}_${card.year}.pdf`;
      pdf.save(fileName);

      toast({
        title: "تم بنجاح",
        description: "تم تحميل بطاقة السعر بصيغة PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في توليد ملف PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          بطاقات الأسعار المتقدمة
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          إدارة شاملة لبطاقات أسعار المركبات مع فلاتر متقدمة ({filteredCards.length} من {priceCards.length})
        </p>
      </div>

      {/* Enhanced Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر المتقدمة والبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في البطاقات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Manufacturer Filter */}
            <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الصانع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصناع</SelectItem>
                {manufacturers.slice(1).map((manufacturer) => (
                  <SelectItem key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Trim Level Filter */}
            <Select value={selectedTrimLevel} onValueChange={setSelectedTrimLevel}>
              <SelectTrigger>
                <SelectValue placeholder="درجة التجهيز" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع درجات التجهيز</SelectItem>
                {trimLevels.slice(1).map((trimLevel) => (
                  <SelectItem key={trimLevel} value={trimLevel || ""}>
                    {trimLevel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Model Filter */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="الموديل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموديلات</SelectItem>
                {models.slice(1).map((model) => (
                  <SelectItem key={model} value={model || ""}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Summary */}
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="outline">البحث: {searchTerm}</Badge>
            )}
            {selectedManufacturer !== "all" && (
              <Badge variant="outline">الصانع: {selectedManufacturer}</Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="outline">الفئة: {selectedCategory}</Badge>
            )}
            {selectedTrimLevel !== "all" && (
              <Badge variant="outline">درجة التجهيز: {selectedTrimLevel}</Badge>
            )}
            {selectedModel !== "all" && (
              <Badge variant="outline">الموديل: {selectedModel}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            لا توجد بطاقات تطابق الفلاتر المحددة
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            جرب تعديل الفلاتر أو إزالة بعض الخيارات
          </p>
        </div>
      ) : (
        <div className="text-center mb-4">
          <Badge variant="secondary" className="text-sm">
            عرض {filteredCards.length} بطاقة من {priceCards.length}
          </Badge>
        </div>
      )}

      {/* Price Cards Grid - Collapsible Cards */}
      {filteredCards.map((card) => {
        const isExpanded = expandedCards.has(card.id);
        
        return (
          <Card key={card.id} className="mb-6 border-2 hover:border-blue-300 transition-colors">
            {/* Card Header - Always Visible */}
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => toggleCardExpansion(card.id)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <EyeOff className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                    <span>بطاقة سعر {card.manufacturer} {card.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{card.year}</Badge>
                    {card.trimLevel && (
                      <Badge variant="secondary">{card.trimLevel}</Badge>
                    )}
                    {card.model && (
                      <Badge variant="default">{card.model}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCard(card);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تحرير
                  </Button>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('هل أنت متأكد من حذف هذه البطاقة؟')) {
                        deletePriceCardMutation.mutate(card.id);
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      generatePDF(card, `price-card-${card.id}`);
                    }}
                    disabled={isGeneratingPDF}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 ml-1" />
                    PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            {/* Card Content - Shown only when expanded */}
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="flex justify-center">
                  <div 
                    id={`price-card-${card.id}`}
                    className="relative shadow-2xl border-2 border-gray-200 bg-[#00607f]"
                    style={{
                      width: '1123px',   // Fixed A4 landscape width in pixels
                      height: '794px',   // Fixed A4 landscape height in pixels
                      fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
                      direction: 'rtl',
                      fontSize: '16px',
                      overflow: 'hidden',
                      transform: 'scale(0.6)', // Scale down for display
                      transformOrigin: 'center center',
                      backgroundImage: 'url(/price-card.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* QR Code - Top Right */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      width: '120px',
                      height: '120px',
                      backgroundColor: 'white',
                      borderRadius: '15px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 30
                    }}>
                      <QRCodeSVG
                        value={generateVehicleURL(card)}
                        size={95}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Year - Large Center */}
                    <div style={{ 
                      position: 'absolute',
                      top: '35mm',
                      left: '50%',
                      transform: 'translate(-50%, 0)',
                      color: '#CF9B47', 
                      fontSize: '250px', 
                      fontWeight: '900', 
                      letterSpacing: '10px'
                    }}>
                      {card.year}
                    </div>

                    {/* Main Content Card - Bottom Center */}
                    <div style={{
                      position: 'absolute',
                      bottom: '40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '1080px',
                      height: '280px',
                      backgroundColor: 'transparent',
                      padding: '20px',
                      zIndex: 10,
                      overflow: 'visible'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '60px', height: '100%' }}>
                        
                        {/* Right Section - Vehicle Details Box */}
                        <div style={{ 
                          flex: 1, 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '20px',
                          padding: '25px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          position: 'relative',
                          minHeight: '240px'
                        }}>
                          {/* Manufacturer Logo */}
                          {card.manufacturer && (
                            <div style={{ 
                              width: '120px', 
                              height: '80px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              margin: '0 auto 20px auto'
                            }}>
                              <div style={{ filter: 'sepia(1) hue-rotate(38deg) saturate(2) brightness(1.2)' }}>
                                <ManufacturerLogo 
                                  manufacturerName={card.manufacturer} 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Category */}
                          <div style={{ 
                            color: '#CF9B47', 
                            fontSize: '32px', 
                            fontWeight: 'bold', 
                            textAlign: 'center',
                            marginBottom: '10px'
                          }}>
                            {card.category}
                          </div>
                          
                          {/* Trim Level */}
                          {card.trimLevel && (
                            <div style={{ 
                              color: '#CF9B47', 
                              fontSize: '20px', 
                              fontWeight: '600', 
                              textAlign: 'center',
                              marginBottom: '5px'
                            }}>
                              {card.trimLevel}
                            </div>
                          )}

                          {/* Model */}
                          {card.model && (
                            <div style={{ 
                              color: '#CF9B47', 
                              fontSize: '18px', 
                              fontWeight: '500', 
                              textAlign: 'center'
                            }}>
                              {card.model}
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div style={{ 
                          width: '4px', 
                          height: '200px', 
                          backgroundColor: 'white', 
                          borderRadius: '2px', 
                          alignSelf: 'center' 
                        }}></div>

                        {/* Left Section - Price and Details Box */}
                        <div style={{ 
                          flex: 1, 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '20px',
                          padding: '25px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          position: 'relative',
                          minHeight: '240px'
                        }}>
                          {/* Price */}
                          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ 
                              color: '#00627F', 
                              fontSize: '16px', 
                              fontWeight: '600', 
                              marginBottom: '5px' 
                            }}>
                              السعر
                            </div>
                            <div style={{ 
                              color: '#00627F', 
                              fontSize: '28px', 
                              fontWeight: 'bold', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '8px' 
                            }}>
                              <img 
                                src="/Saudi_Riyal_Symbol.svg" 
                                alt="ريال سعودي" 
                                style={{ 
                                  width: '24px', 
                                  height: '24px', 
                                  filter: 'brightness(0) saturate(100%) invert(60%) sepia(73%) saturate(437%) hue-rotate(37deg) brightness(91%) contrast(86%)'
                                }} 
                              />
                              {formatPrice(card.price || 0)}
                            </div>
                          </div>

                          {/* Status */}
                          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <div style={{ 
                              color: '#00627F', 
                              fontSize: '16px', 
                              fontWeight: '600', 
                              marginBottom: '5px' 
                            }}>
                              الحالة
                            </div>
                            <div style={{ 
                              fontSize: '22px', 
                              fontWeight: 'bold',
                              color: card.status === 'متوفر' ? '#16a34a' : '#f59e0b'
                            }}>
                              {card.status}
                            </div>
                          </div>

                          {/* Features */}
                          {card.features && card.features.length > 0 && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ 
                                color: '#00627F', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                marginBottom: '8px' 
                              }}>
                                المميزات
                              </div>
                              <div style={{ 
                                fontSize: '16px', 
                                color: '#00627F',
                                lineHeight: '1.3'
                              }}>
                                {card.features.slice(0, 3).join(' • ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Edit Price Card Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'تحرير بطاقة السعر' : 'إنشاء بطاقة سعر جديدة'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصانع</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: تويوتا" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: كامري" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trimLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>درجة التجهيز</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: فل كامل" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموديل</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: GLE" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السنة</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="150000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="متوفر">متوفر</SelectItem>
                        <SelectItem value="محجوز">محجوز</SelectItem>
                        <SelectItem value="مباع">مباع</SelectItem>
                        <SelectItem value="غير متوفر">غير متوفر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createPriceCardMutation.isPending || updatePriceCardMutation.isPending}
                  className="flex-1"
                >
                  {createPriceCardMutation.isPending || updatePriceCardMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  {editingCard ? 'تحديث' : 'إنشاء'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Print Styles for Fixed A4 Layout */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            [id^="price-card-"], [id^="price-card-"] * {
              visibility: visible;
            }
            [id^="price-card-"] {
              position: absolute;
              left: 0;
              top: 0;
              transform: scale(1) !important;
              width: 297mm !important;
              height: 210mm !important;
            }
          }
        `
      }} />
    </div>
  );
}