import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ManufacturerLogo } from "@/components/manufacturer-logo";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

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

export default function PriceCardsPage() {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch inventory data
  const { data: inventoryData = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  // Filter available vehicles for price cards
  const availableVehicles = inventoryData.filter(item => 
    item.manufacturer && item.category && item.price
  );

  // Format price
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ar-SA').format(numPrice || 0);
  };

  // Generate vehicle URL for QR code that links to vehicle view page
  const generateVehicleURL = (vehicle: InventoryItem) => {
    const baseURL = window.location.origin;
    return `${baseURL}/vehicles/${vehicle.id}?view=card&manufacturer=${encodeURIComponent(vehicle.manufacturer)}&category=${encodeURIComponent(vehicle.category)}&year=${vehicle.year}&price=${vehicle.price}`;
  };

  // Determine car status and mileage
  const getCarStatus = (vehicle: InventoryItem) => {
    return vehicle.importType === "شخصي مستعمل" || vehicle.notes?.includes("مستعمل") ? "مستعمل" : "جديد";
  };

  const getMileage = (vehicle: InventoryItem) => {
    return getCarStatus(vehicle) === "مستعمل" ? "85,000" : "0";
  };

  // Enhanced PDF generation for a specific vehicle
  const generatePDF = async (vehicle: InventoryItem, cardId: string) => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById(cardId);
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
      
      const fileName = `بطاقة_سعر_${vehicle.manufacturer}_${vehicle.category}_${vehicle.year}.pdf`;
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

  // Generate JPG for a specific vehicle
  const generateJPG = async (vehicle: InventoryItem, cardId: string) => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById(cardId);
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
          a.download = `بطاقة_سعر_${vehicle.manufacturer}_${vehicle.category}_${vehicle.year}.jpg`;
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

  // Handle print for a specific vehicle
  const handlePrint = (cardId: string) => {
    const element = document.getElementById(cardId);
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>بطاقة السعر</title>
              <style>
                body { margin: 0; padding: 0; }
                .price-card { transform: scale(1) !important; width: 297mm !important; height: 210mm !important; }
              </style>
            </head>
            <body>
              ${element.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (availableVehicles.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            بطاقات الأسعار
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            لا توجد سيارات متوفرة لإنشاء بطاقات الأسعار
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          بطاقات الأسعار
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          بطاقات أسعار تلقائية لجميع المركبات المتوفرة ({availableVehicles.length} بطاقة)
        </p>
      </div>

      {/* Price Cards Grid */}
      {availableVehicles.map((vehicle, index) => (
        <Card key={vehicle.id} className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>بطاقة سعر {vehicle.manufacturer} {vehicle.category}</span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => generatePDF(vehicle, `price-card-${vehicle.id}`)}
                  disabled={isGeneratingPDF}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 ml-1" />
                  PDF
                </Button>
                
                <Button 
                  onClick={() => generateJPG(vehicle, `price-card-${vehicle.id}`)}
                  disabled={isGeneratingPDF}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 ml-1" />
                  JPG
                </Button>
                
                <Button 
                  onClick={() => handlePrint(`price-card-${vehicle.id}`)}
                  disabled={isGeneratingPDF}
                  size="sm"
                  variant="outline"
                >
                  <Printer className="w-4 h-4 ml-1" />
                  طباعة
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div 
              id={`price-card-${vehicle.id}`}
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

            {/* QR Code - Top of Page */}
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
                value={generateVehicleURL(vehicle)}
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
              {vehicle.year || '2025'}
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
                  {/* Manufacturer Logo - Top */}
                  {vehicle.manufacturer && vehicle.manufacturer.trim() !== "" && (
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
                          manufacturerName={vehicle.manufacturer} 
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
                    {vehicle.category || 'الفئة'}
                  </div>
                  
                  {/* Trim Level */}
                  <div style={{ 
                    color: '#CF9B47', 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    textAlign: 'center'
                  }}>
                    {vehicle.model || 'درجة التجهيز'}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: '4px', height: '200px', backgroundColor: 'white', borderRadius: '2px', alignSelf: 'center' }}></div>

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
                    <div style={{ color: '#00627F', fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>السعر</div>
                    <div style={{ color: '#00627F', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <img 
                        src="/Saudi_Riyal_Symbol.svg" 
                        alt="ريال سعودي" 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          filter: 'brightness(0) saturate(100%) invert(60%) sepia(73%) saturate(437%) hue-rotate(37deg) brightness(91%) contrast(86%)'
                        }} 
                      />
                      {formatPrice(vehicle.price || 0)}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <div style={{ color: '#00627F', fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>الحالة</div>
                    <div className="bg-[#ffffff5e]" style={{ 
                      fontSize: '22px', 
                      fontWeight: 'bold',
                      color: getCarStatus(vehicle) === 'مستعمل' ? '#f59e0b' : '#16a34a'
                    }}>
                      {getCarStatus(vehicle)}
                    </div>
                  </div>

                  {/* Mileage (if used) */}
                  {getCarStatus(vehicle) === 'مستعمل' && (
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                      <div style={{ color: '#00627F', fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>الممشي</div>
                      <div style={{ color: '#00627F', fontSize: '20px', fontWeight: 'bold' }}>
                        {getMileage(vehicle) ? `${formatPrice(getMileage(vehicle))} كم` : 'غير محدد'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
      ))}

      {/* Print Styles */}
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