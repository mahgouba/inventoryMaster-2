import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ManufacturerLogo } from "@/components/manufacturer-logo";
import { Download, Printer, Eye } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { InventoryItem } from "@shared/schema";

interface NewPriceCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: InventoryItem | null;
}

export default function NewPriceCard({ open, onOpenChange, vehicle }: NewPriceCardProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!vehicle) return null;

  // تنسيق السعر بدون العملة
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ar-SA').format(numPrice || 0);
  };

  // استخراج سعة المحرك كرقم
  const getEngineSize = () => {
    if (vehicle.engineCapacity) {
      const match = vehicle.engineCapacity.match(/(\d+(?:\.\d+)?)/);
      return match ? match[1] : '2.5';
    }
    return '2.5';
  };

  // استخراج الكيلومترات (إذا كانت مستعملة)
  const getMileage = () => {
    const isUsed = vehicle.importType === "شخصي مستعمل" || vehicle.notes?.includes("مستعمل");
    return isUsed ? "6000" : "0";
  };

  // تحديد حالة السيارة
  const getCarStatus = () => {
    const isUsed = vehicle.importType === "شخصي مستعمل" || vehicle.notes?.includes("مستعمل");
    return isUsed ? "مستعمل" : "جديد";
  };

  // تحديد لون الدائرة حسب نوع الاستيراد
  const getImportTypeColor = (): string => {
    if (vehicle.status === 'مستعمل') {
      return 'bg-red-500'; // أحمر للمستعمل
    } else if (vehicle.importType === 'شخصي' || vehicle.importType === 'personal') {
      return 'bg-green-500'; // أخضر للشخصي
    } else {
      return 'bg-white border-2 border-gray-300'; // أبيض للشركة
    }
  };

  // Enhanced PDF generation with better quality and print optimization
  const generatePDF = async () => {
    if (!vehicle) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('new-price-card-content');
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
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
        imageTimeout: 20000,
        logging: false,
        width: 1123,
        height: 794,
        scrollX: 0,
        scrollY: 0,
        removeContainer: true
      });

      // Remove temporary element
      document.body.removeChild(printElement);

      // Create PDF with optimal settings for printing
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: false // Better quality for printing
      });
      
      // A4 landscape dimensions
      const pdfWidth = 297;
      const pdfHeight = 210;

      // Convert canvas to high-quality image
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Add image to PDF with exact A4 dimensions
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Generate filename with Arabic support
      const timestamp = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
      const filename = `Price-Card-${vehicle.manufacturer}-${vehicle.category}-${vehicle.year}-${timestamp}.pdf`;
      
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('خطأ في توليد ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Generate high-quality JPG for printing
  const generateJPG = async () => {
    if (!vehicle) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('new-price-card-content');
      if (!element) {
        console.error('Price card element not found');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create temporary element for JPG export
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

      const canvas = await html2canvas(printElement, {
        scale: 5, // Even higher quality for JPG
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
        imageTimeout: 20000,
        logging: false,
        width: 1123,
        height: 794,
        scrollX: 0,
        scrollY: 0,
        removeContainer: true
      });

      document.body.removeChild(printElement);

      // Convert to JPG and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `Price-Card-${vehicle.manufacturer}-${vehicle.category}-${vehicle.year}.jpg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Error generating JPG:', error);
      alert('خطأ في توليد ملف الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print directly from browser
  const handlePrint = () => {
    const element = document.getElementById('new-price-card-content');
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Price Card - ${vehicle.manufacturer} ${vehicle.category}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Noto Sans Arabic', Arial, sans-serif;
              direction: rtl;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-container {
              width: 297mm;
              height: 210mm;
              background: linear-gradient(135deg, #00627F 0%, #004A61 100%);
              position: relative;
              overflow: hidden;
            }
            @media print {
              body { margin: 0; }
              .print-container { 
                width: 100vw; 
                height: 100vh; 
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto bg-white/90 backdrop-blur-sm border border-white/20 p-2">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 text-center mb-4">
            بطاقة سعر - {vehicle.manufacturer} {vehicle.category} {vehicle.year}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Fixed A4 Size Preview */}
          <div className="flex justify-center items-center w-full">
            <div 
              id="new-price-card-content"
              className="relative shadow-2xl border-2 border-gray-200"
              style={{
                width: '1123px',
                height: '794px',
                fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
                direction: 'rtl',
                fontSize: '16px',
                overflow: 'hidden',
                transform: 'scale(0.7)',
                transformOrigin: 'center center',
                backgroundImage: 'url(/background-price-card.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >


            {/* Red Circle - Top Left */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '60px',
              height: '60px',
              backgroundColor: '#FF0000',
              borderRadius: '50%'
            }}></div>

            {/* Company Logo - Top Center */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '120px'
            }}>
              <img 
                src="/copmany logo.svg" 
                alt="شعار الشركة" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', 
                  filter: 'brightness(1.5) sepia(1) hue-rotate(38deg) saturate(2) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}
              />
            </div>

            {/* Year - Large Center */}
            <div style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white', 
              fontSize: '200px', 
              fontWeight: '900', 
              letterSpacing: '10px',
              textShadow: '0 8px 16px rgba(0,0,0,0.4)'
            }}>
              {vehicle.year || '2025'}
            </div>

            {/* Main Content Card - Bottom Center - reduced height by 20% */}
            <div style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '1080px',
              height: '240px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '25px',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 10,
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                {/* Right Section - Vehicle Info - adjusted for reduced height */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  {/* Vehicle Category - smaller to fit */}
                  <div style={{ color: '#CF9B47', fontSize: '45px', fontWeight: 'bold', letterSpacing: '3px', textAlign: 'center' }}>
                    {vehicle.category}
                  </div>
                  
                  {/* Trim Level - smaller to fit */}
                  <div style={{ color: '#CF9B47', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>
                    {vehicle.trimLevel || 'الفئة الأساسية'}
                  </div>

                  {/* Manufacturer Logo - 2x larger, positioned to extend beyond box */}
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
                    <ManufacturerLogo 
                      manufacturerName={vehicle.manufacturer} 
                      className="w-full h-full object-contain"
                      style={{ filter: 'sepia(1) hue-rotate(38deg) saturate(2) brightness(0.8)' }}
                    />
                  </div>
                </div>

                {/* Divider - adjusted for reduced height */}
                <div style={{ width: '5px', height: '180px', backgroundColor: '#CF9B47', borderRadius: '2px' }}></div>

                {/* Left Section - Price and Status - adjusted for reduced height */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>
                  {/* Price - smaller to fit */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#00627F', fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>السعر</div>
                    <div style={{ color: '#00627F', fontSize: '36px', fontWeight: 'bold' }}>﷼ {formatPrice(vehicle.price || 0)}</div>
                  </div>

                  {/* Status - smaller to fit */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#00627F', fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>الحالة</div>
                    <div style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold',
                      color: getCarStatus() === 'مستعمل' ? '#dc2626' : '#16a34a'
                    }}>
                      {getCarStatus() === 'مستعمل' ? 'مستعمل' : 'جديد'}
                    </div>
                  </div>

                  {/* Mileage if used - smaller to fit */}
                  {getCarStatus() === 'مستعمل' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#00627F', fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>المماشي</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ color: '#00627F', fontSize: '28px', fontWeight: 'bold' }}>{getMileage()}</span>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          backgroundColor: '#00627F', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>KM</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3 mt-6 justify-center">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}