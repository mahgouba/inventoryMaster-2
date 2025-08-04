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
                background: 'linear-gradient(135deg, #2B7F94 0%, #1E5F73 100%)'
              }}
            >
            {/* Golden Pattern on Right Side */}
            <div style={{
              position: 'absolute',
              right: '0',
              top: '0',
              width: '80px',
              height: '100%',
              background: 'repeating-linear-gradient(45deg, #CF9B47 0px, #CF9B47 10px, transparent 10px, transparent 20px)',
              opacity: '0.6'
            }}></div>

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
                  filter: 'brightness(1.5) sepia(1) hue-rotate(38deg) saturate(2)',
                  dropShadow: '0 4px 8px rgba(0,0,0,0.3)'
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

            {/* Main Content Card - Bottom Center */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '900px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '25px',
              padding: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {/* Mercedes Logo */}
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'transparent'
                }}>
                  <ManufacturerLogo 
                    manufacturerName={vehicle.manufacturer} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'sepia(1) hue-rotate(38deg) saturate(2) brightness(0.8)' }}
                  />
                </div>

                {/* Vehicle Model */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ color: '#CF9B47', fontSize: '56px', fontWeight: 'bold', letterSpacing: '4px' }}>
                    {vehicle.category} {vehicle.trimLevel?.split(' ')[0] || '450'}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ width: '4px', height: '120px', backgroundColor: '#CF9B47', borderRadius: '2px' }}></div>

                {/* Right Section with Price and Status */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#2B7F94', fontSize: '16px', fontWeight: '600' }}>السعر :</div>
                      <div style={{ color: '#2B7F94', fontSize: '32px', fontWeight: 'bold' }}>﷼ {formatPrice(vehicle.price || 0)}</div>
                    </div>

                    {/* Status */}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#2B7F94', fontSize: '16px', fontWeight: '600' }}>الحالة :</div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        color: getCarStatus() === 'مستعمل' ? '#dc2626' : '#16a34a'
                      }}>
                        {getCarStatus() === 'مستعمل' ? 'مستعمل' : 'جديد'}
                      </div>
                    </div>
                  </div>

                  {/* Mileage if used */}
                  {getCarStatus() === 'مستعمل' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
                      <span style={{ color: '#2B7F94', fontSize: '18px', fontWeight: '600' }}>المماشي :</span>
                      <span style={{ color: '#2B7F94', fontSize: '24px', fontWeight: 'bold' }}>{getMileage()}</span>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#2B7F94', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '5px'
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>KM</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


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