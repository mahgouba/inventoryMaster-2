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
            className="relative w-[842px] h-[595px] bg-gradient-to-br from-[#00627F] to-[#004A5C] rounded-lg overflow-hidden"
            style={{
              fontFamily: "'Noto Sans Arabic', Arial, sans-serif",
              direction: 'rtl',
              backgroundImage: 'linear-gradient(135deg, #00627F 0%, #004A5C 100%)'
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#CF9B47] to-transparent">
                <div className="h-full flex flex-col justify-center items-center gap-2">
                  {/* Decorative Arabic pattern */}
                  {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-[#CF9B47] rotate-45 opacity-60"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 bg-[#CF9B47] rounded-full flex items-center justify-center">
                <div className="text-white text-2xl font-bold">البريمي</div>
              </div>
            </div>

            {/* Year */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
              <div className="text-white text-8xl font-black tracking-wider">
                {vehicle.year || '2025'}
              </div>
            </div>

            {/* Main Content Card */}
            <div className="absolute bottom-16 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Left Section - Logo and Model */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 mb-4 flex items-center justify-center">
                    <ManufacturerLogo 
                      manufacturerName={vehicle.manufacturer} 
                      className="w-full h-full object-contain filter brightness-110"
                    />
                  </div>
                  <div className="text-[#CF9B47] text-4xl font-bold text-center">
                    {vehicle.category}
                  </div>
                </div>

                {/* Middle Section - Details */}
                <div className="flex flex-col justify-center space-y-4 text-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">السعـــر :</span>
                    <span className="text-[#00627F] text-2xl font-bold">
                      ﷼ {formatPrice(vehicle.price || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">المماشي :</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00627F] text-xl font-bold">{getMileage()}</span>
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">KM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Status */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-right mb-2">
                    <div className="text-gray-700 text-lg font-semibold">الحالــة :</div>
                    <div className="text-red-600 text-2xl font-bold">{getCarStatus()}</div>
                  </div>
                  
                  {/* Separator Line */}
                  <div className="w-px h-16 bg-[#CF9B47] my-4"></div>
                  
                  <div className="text-center">
                    <div className="text-gray-600 text-sm">سعة المحرك</div>
                    <div className="text-[#00627F] text-xl font-bold">{getEngineSize()}L</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Gold Section */}
            <div className="absolute bottom-0 left-0 w-40 h-32 bg-[#CF9B47]"></div>

            {/* Red Circle (Top Left) */}
            <div className="absolute top-8 right-8 w-8 h-8 bg-red-500 rounded-full"></div>
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