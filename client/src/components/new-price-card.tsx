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

  // توليد PDF
  const generatePDF = async () => {
    if (!vehicle) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('new-price-card-content');
      if (!element) {
        console.error('Price card element not found');
        return;
      }

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // High-quality canvas
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
        imageTimeout: 15000,
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth,
        scrollX: 0,
        scrollY: 0
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Calculate proper scaling for A4 landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;
      
      let finalWidth = pdfWidth;
      let finalHeight = pdfWidth * canvasAspectRatio;
      
      // If height exceeds page, scale down
      if (finalHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight / canvasAspectRatio;
      }
      
      // Center the content
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      
      const timestamp = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      pdf.save(`بطاقة-سعر-${vehicle.manufacturer}-${vehicle.category}-${vehicle.year}-${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
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
              className="relative shadow-2xl border-2 border-gray-200 bg-gradient-to-b from-[#00627F] to-[#004A61]"
              style={{
                width: '794px',
                height: '1123px',
                fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
                direction: 'rtl',
                fontSize: '16px',
                overflow: 'hidden',
                transform: 'scale(0.6)',
                transformOrigin: 'center center'
              }}
            >
            {/* Logo and Year Container - Centered */}
            <div className="absolute flex flex-col items-center" style={{ top: '40px', left: '50%', transform: 'translateX(-50%)' }}>
              {/* Company Logo - Fixed size */}
              <div style={{ width: '180px', height: '180px', marginBottom: '20px' }}>
                <img 
                  src="/copmany logo.svg" 
                  alt="شعار الشركة" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                />
              </div>

              {/* Year - Fixed large size */}
              <div style={{ 
                color: 'white', 
                fontSize: '180px', 
                fontWeight: '900', 
                letterSpacing: '8px',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}>
                {vehicle.year || '2025'}
              </div>
            </div>

            {/* Main Content Card - Fixed positioning and sizes */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              right: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* First Row - Category, Trim Level, Manufacturer Logo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ color: '#CF9B47', fontSize: '32px', fontWeight: 'bold' }}>
                    {vehicle.category}
                  </div>
                  <div style={{ color: '#CF9B47', fontSize: '24px', fontWeight: '600' }}>
                    {vehicle.trimLevel || 'الفئة الأساسية'}
                  </div>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%'
                  }}>
                    <ManufacturerLogo 
                      manufacturerName={vehicle.manufacturer} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>

                {/* Second Row - Status, Mileage and Price */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  {/* Status and Mileage Box */}
                  <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                    <div style={{ color: '#374151', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>الحالة</div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      marginBottom: '12px',
                      color: getCarStatus() === 'مستعمل' ? '#dc2626' : '#16a34a'
                    }}>
                      {getCarStatus() === 'مستعمل' ? 'مستعمل' : 'جديد'}
                    </div>
                    
                    {getCarStatus() === 'مستعمل' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ color: '#374151', fontSize: '18px', fontWeight: '600' }}>المماشي:</span>
                        <span style={{ color: '#00627F', fontSize: '22px', fontWeight: 'bold' }}>{getMileage()}</span>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          backgroundColor: '#9ca3af', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>KM</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Box */}
                  <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                    <div style={{ color: '#374151', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>السعر</div>
                    <div style={{ color: '#00627F', fontSize: '28px', fontWeight: 'bold' }}>﷼ {formatPrice(vehicle.price || 0)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import Type Circle - Fixed positioning */}
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: vehicle.status === 'مستعمل' ? '#ef4444' : 
                              vehicle.importType === 'شخصي' || vehicle.importType === 'personal' ? '#22c55e' : '#ffffff',
              border: vehicle.importType === 'شركة' ? '3px solid #d1d5db' : 'none'
            }}></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              <Download className="w-4 h-4 ml-2" />
              {isGeneratingPDF ? 'جاري التوليد...' : 'تحميل PDF'}
            </Button>
            
            <Button 
              onClick={() => window.print()}
              variant="outline"
              className="px-6 py-2 rounded-lg"
            >
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}