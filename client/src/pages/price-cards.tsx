import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ManufacturerLogo } from "@/components/manufacturer-logo";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InventoryItem {
  id: number;
  manufacturer: string;
  category: string;
  model?: string;
  year?: string;
  price?: number;
  status?: string;
  importType?: string;
  notes?: string;
  engineCapacity?: string;
}

interface PriceCardData {
  manufacturer: string;
  category: string;
  model: string;
  year: string;
  price: number;
}

export default function PriceCardsPage() {
  const { toast } = useToast();
  const [priceCardData, setPriceCardData] = useState<PriceCardData>({
    manufacturer: "",
    category: "",
    model: "",
    year: new Date().getFullYear().toString(),
    price: 0
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch inventory data for dropdown options
  const { data: inventoryData = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Get unique manufacturers
  const manufacturers = Array.from(new Set(inventoryData.map(item => item.manufacturer)))
    .filter(manufacturer => manufacturer)
    .sort();

  // Get categories for selected manufacturer
  const categories = Array.from(new Set(
    inventoryData
      .filter(item => !priceCardData.manufacturer || item.manufacturer === priceCardData.manufacturer)
      .map(item => item.category)
  )).filter(category => category).sort();

  // Get models for selected manufacturer and category
  const models = Array.from(new Set(
    inventoryData
      .filter(item => 
        (!priceCardData.manufacturer || item.manufacturer === priceCardData.manufacturer) &&
        (!priceCardData.category || item.category === priceCardData.category)
      )
      .map(item => item.model)
  )).filter(model => model).sort();

  // Generate years (current year + 5 future years, and 20 past years)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear + 5; i >= currentYear - 20; i--) {
    years.push(i.toString());
  }

  // Format price
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ar-SA').format(numPrice || 0);
  };

  // Determine car status and mileage
  const getCarStatus = () => {
    return "جديد"; // Default to new for price cards
  };

  const getMileage = () => {
    return "0"; // Default to 0 for new cars
  };

  // Enhanced PDF generation
  const generatePDF = async () => {
    if (!priceCardData.manufacturer || !priceCardData.category || !priceCardData.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('price-card-preview');
      if (!element) {
        console.error('Price card element not found');
        return;
      }

      // Wait for fonts and images to load
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a temporary element for PDF with print-specific styling
      const printElement = element.cloneNode(true) as HTMLElement;
      printElement.style.transform = 'scale(1)';
      printElement.style.transformOrigin = 'top left';
      printElement.style.width = '297mm';
      printElement.style.height = '210mm';
      printElement.style.position = 'absolute';
      printElement.style.top = '-9999px';
      printElement.style.left = '-9999px';
      printElement.style.backgroundColor = '#ffffff';
      document.body.appendChild(printElement);

      // High-quality canvas generation
      const canvas = await html2canvas(printElement, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 794,
        logging: false
      });

      document.body.removeChild(printElement);

      // Convert to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, '', 'FAST');
      
      const fileName = `بطاقة_سعر_${priceCardData.manufacturer}_${priceCardData.category}_${priceCardData.year}.pdf`;
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

  // Generate JPG
  const generateJPG = async () => {
    if (!priceCardData.manufacturer || !priceCardData.category || !priceCardData.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('price-card-preview');
      if (!element) return;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1123,
        height: 794,
        logging: false
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `بطاقة_سعر_${priceCardData.manufacturer}_${priceCardData.category}_${priceCardData.year}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);

      toast({
        title: "تم بنجاح",
        description: "تم تحميل بطاقة السعر بصيغة JPG",
      });
    } catch (error) {
      console.error('Error generating JPG:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في توليد صورة JPG",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    if (!priceCardData.manufacturer || !priceCardData.category || !priceCardData.price) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    window.print();
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          بطاقات الأسعار
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          إنشاء وتخصيص بطاقات أسعار المركبات
        </p>
      </div>

      {/* Input Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>إعدادات بطاقة السعر</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Manufacturer Selection */}
          <div className="space-y-2">
            <Label htmlFor="manufacturer">الصانع</Label>
            <Select
              value={priceCardData.manufacturer}
              onValueChange={(value) => {
                setPriceCardData(prev => ({
                  ...prev,
                  manufacturer: value,
                  category: "", // Reset category when manufacturer changes
                  model: "" // Reset model when manufacturer changes
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الصانع" />
              </SelectTrigger>
              <SelectContent>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">الفئة</Label>
            <Select
              value={priceCardData.category}
              onValueChange={(value) => {
                setPriceCardData(prev => ({
                  ...prev,
                  category: value,
                  model: "" // Reset model when category changes
                }));
              }}
              disabled={!priceCardData.manufacturer}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">الموديل</Label>
            <Select
              value={priceCardData.model}
              onValueChange={(value) => {
                setPriceCardData(prev => ({
                  ...prev,
                  model: value
                }));
              }}
              disabled={!priceCardData.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الموديل" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Selection */}
          <div className="space-y-2">
            <Label htmlFor="year">السنة</Label>
            <Select
              value={priceCardData.year}
              onValueChange={(value) => {
                setPriceCardData(prev => ({
                  ...prev,
                  year: value
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر السنة" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">السعر (ريال)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0"
              value={priceCardData.price || ""}
              onChange={(e) => {
                setPriceCardData(prev => ({
                  ...prev,
                  price: parseFloat(e.target.value) || 0
                }));
              }}
              className="text-left"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center mb-6">
        <Button 
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          <Download className="w-5 h-5 ml-2" />
          {isGeneratingPDF ? 'جاري التوليد...' : 'تحميل PDF'}
        </Button>
        
        <Button 
          onClick={generateJPG}
          disabled={isGeneratingPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          <Download className="w-5 h-5 ml-2" />
          تحميل JPG
        </Button>
        
        <Button 
          onClick={handlePrint}
          disabled={isGeneratingPDF}
          variant="outline"
          className="px-6 py-3 rounded-lg font-semibold border-2"
        >
          <Printer className="w-5 h-5 ml-2" />
          طباعة مباشرة
        </Button>
      </div>

      {/* A4 Landscape Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>معاينة بطاقة السعر</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div 
            id="price-card-preview"
            className="relative shadow-2xl border-2 border-gray-200 bg-[#00607f]"
            style={{
              width: '1123px',
              height: '794px',
              fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
              direction: 'rtl',
              fontSize: '16px',
              overflow: 'hidden',
              transform: 'scale(0.6)',
              transformOrigin: 'center center',
              backgroundImage: 'url(/price-card.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >


            {/* Year - Large Center */}
            <div style={{ 
              position: 'absolute',
              top: '35mm',
              left: '50%',
              transform: 'translate(-50%, 0)',
              color: '#CF9B47', 
              fontSize: '200px', 
              fontWeight: '900', 
              letterSpacing: '10px',
              textShadow: '0 8px 16px rgba(0,0,0,0.4)'
            }}>
              {priceCardData.year || '2025'}
            </div>

            {/* Main Content Card - Bottom Center */}
            <div className="text-[#cf9b46]" style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '1080px',
              height: '240px',
              backgroundColor: 'transparent',
              padding: '30px',
              zIndex: 10,
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                {/* Right Section - Vehicle Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <div className="bg-[#ffffff00]" style={{ color: '#CF9B47', fontSize: '45px', fontWeight: 'bold', letterSpacing: '3px', textAlign: 'center' }}>
                    {priceCardData.category || 'الفئة'}
                  </div>
                  
                  <div style={{ color: '#CF9B47', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>
                    {priceCardData.model || 'الموديل'}
                  </div>

                  {/* Manufacturer Logo */}
                  {priceCardData.manufacturer && priceCardData.manufacturer.trim() !== "" && (
                    <div style={{ 
                      width: '288px', 
                      height: '288px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                      position: 'absolute',
                      bottom: '-150px',
                      right: '20px'
                    }}>
                      <div style={{ filter: 'sepia(1) hue-rotate(38deg) saturate(2) brightness(0.8)' }}>
                        <ManufacturerLogo 
                          manufacturerName={priceCardData.manufacturer} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ width: '5px', height: '180px', backgroundColor: 'white', borderRadius: '2px' }}></div>

                {/* Left Section - Price and Status */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#00627F', fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>السعر</div>
                    <div style={{ color: '#00627F', fontSize: '36px', fontWeight: 'bold' }}>﷼ {formatPrice(priceCardData.price || 0)}</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#00627F', fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>الحالة</div>
                    <div style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold',
                      color: '#16a34a'
                    }}>
                      {getCarStatus()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #price-card-preview, #price-card-preview * {
              visibility: visible;
            }
            #price-card-preview {
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