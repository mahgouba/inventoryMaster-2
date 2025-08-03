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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto bg-white/90 backdrop-blur-sm border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            بطاقة سعر - {vehicle.manufacturer} {vehicle.category} {vehicle.year}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Price Card Design */}
          <div 
            id="new-price-card-content"
            className="relative w-[842px] h-[595px] rounded-lg overflow-hidden bg-gradient-to-b from-[#00627F] to-[#004A61]"
            style={{
              fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
              direction: 'rtl'
            }}
          >
            {/* Company Logo */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
              <div className="w-48 h-48 flex items-center justify-center">
                <img 
                  src="/company-logo.svg" 
                  alt="شعار الشركة" 
                  className="w-full h-full object-contain filter brightness-110 drop-shadow-lg"
                />
              </div>
            </div>

            {/* Year */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
              <div className="text-white text-8xl font-black tracking-wider">
                {vehicle.year || '2025'}
              </div>
            </div>

            {/* Main Content Card - Above Gold Section */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl" style={{ zIndex: 10 }}>
              <div className="flex flex-col h-full space-y-4">
                {/* First Row - Category, Trim Level, Manufacturer Logo */}
                <div className="flex items-center justify-between">
                  <div className="text-[#CF9B47] text-2xl font-bold">
                    {vehicle.category}
                  </div>
                  <div className="text-[#CF9B47] text-xl font-semibold">
                    {vehicle.trimLevel || 'الفئة الأساسية'}
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full">
                    <ManufacturerLogo 
                      manufacturerName={vehicle.manufacturer} 
                      className="w-full h-full object-contain filter brightness-110"
                    />
                  </div>
                </div>

                {/* Second Row - Status, Mileage and Price */}
                <div className="flex items-center justify-between gap-4">
                  {/* Status and Mileage Box */}
                  <div className="flex-1 p-4 text-center">
                    <div className="text-gray-700 text-sm font-semibold mb-1">الحالة</div>
                    <div className={`text-xl font-bold mb-2 ${
                      getCarStatus() === 'مستعمل' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {getCarStatus() === 'مستعمل' ? 'مستعمل' : 'جديد'}
                    </div>
                    
                    {getCarStatus() === 'مستعمل' && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-700 text-sm font-semibold">المماشي:</span>
                        <span className="text-[#00627F] text-lg font-bold">{getMileage()}</span>
                        <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">KM</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Box */}
                  <div className="flex-1 p-4 text-center">
                    <div className="text-gray-700 text-sm font-semibold mb-1">السعر</div>
                    <div className="text-[#00627F] text-xl font-bold">﷼ {formatPrice(vehicle.price || 0)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import Type Circle */}
            <div className={`absolute top-8 right-8 w-8 h-8 rounded-full ${getImportTypeColor()}`}></div>
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