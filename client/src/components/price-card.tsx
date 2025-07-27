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

interface PriceCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: InventoryItem | null;
}

export default function PriceCard({ open, onOpenChange, vehicle }: PriceCardProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!vehicle) return null;

  // تحديد حالة السيارة (جديدة/مستعملة)
  const isUsed = vehicle.importType === "شخصي مستعمل" || vehicle.notes?.includes("مستعمل");
  const mileage = isUsed ? "85,000 كم" : "0 كم"; // يمكن استخراج هذا من البيانات الفعلية

  // تنسيق السعر
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice || 0);
  };

  // توليد PDF
  const generatePDF = async () => {
    if (!vehicle) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('price-card-content');
      if (!element) {
        console.error('Price card element not found');
        return;
      }

      // Check if element has content
      if (element.children.length === 0) {
        console.error('Price card element is empty');
        return;
      }

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Ensure element is visible
      const originalDisplay = element.style.display;
      const originalVisibility = element.style.visibility;
      element.style.display = 'block';
      element.style.visibility = 'visible';

      // High-quality canvas with improved settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
        imageTimeout: 15000,
        logging: true,
        height: element.scrollHeight,
        width: element.scrollWidth,
        scrollX: 0,
        scrollY: 0
      });

      // Restore display properties
      element.style.display = originalDisplay;
      element.style.visibility = originalVisibility;

      // Check canvas validity
      if (canvas.width === 0 || canvas.height === 0) {
        console.error('Canvas creation failed - zero dimensions');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Calculate proper scaling for A4
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
      
      const timestamp = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
      pdf.save(`بطاقة-سعر-${vehicle.manufacturer}-${vehicle.category}-${vehicle.year}-${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Eye size={20} />
            بطاقة السعر
          </DialogTitle>
        </DialogHeader>

        {/* PDF Content */}
        <div 
          id="price-card-content"
          className="bg-white text-black p-8 rounded-lg shadow-lg"
          style={{ 
            width: '794px', 
            height: '1123px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}
        >
          {/* Header with Company Logo */}
          <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/copmany logo.svg" 
                alt="شعار الشركة" 
                className="w-16 h-16 object-contain"
              />
              <div className="text-right">
                <h1 className="text-3xl font-bold text-blue-800 mb-1">شركة البريمي للسيارات</h1>
                <p className="text-lg text-gray-600">Al-Barimi Cars Company</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">بطاقة السعر</h2>
          </div>

          {/* Vehicle Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            {/* Manufacturer Logo and Basic Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <ManufacturerLogo 
                  manufacturerName={vehicle.manufacturer} 
                  size="lg" 
                  className="w-20 h-20 drop-shadow-lg"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{vehicle.manufacturer}</h3>
                  <p className="text-xl text-gray-600">{vehicle.category}</p>
                  {vehicle.trimLevel && (
                    <p className="text-lg text-blue-600 font-semibold">{vehicle.trimLevel}</p>
                  )}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="text-left">
                <Badge 
                  className={`text-lg px-4 py-2 ${
                    isUsed 
                      ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                      : 'bg-green-100 text-green-800 border border-green-300'
                  }`}
                >
                  {isUsed ? 'مستعملة' : 'جديدة'}
                </Badge>
              </div>
            </div>

            {/* Vehicle Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">سنة الصنع:</span>
                  <span className="text-gray-900 font-bold">{vehicle.year}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">سعة المحرك:</span>
                  <span className="text-gray-900 font-bold">{vehicle.engineCapacity}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">اللون الخارجي:</span>
                  <span className="text-gray-900 font-bold">{vehicle.exteriorColor}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">الحالة:</span>
                  <span className="text-gray-900 font-bold">{vehicle.status}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">اللون الداخلي:</span>
                  <span className="text-gray-900 font-bold">{vehicle.interiorColor}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">المسافة المقطوعة:</span>
                  <span className="text-gray-900 font-bold">{mileage}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">نوع الاستيراد:</span>
                  <span className="text-gray-900 font-bold">{vehicle.importType}</span>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-gray-700">الموقع:</span>
                  <span className="text-gray-900 font-bold">{vehicle.location}</span>
                </div>
              </div>
            </div>

            {/* Chassis Number */}
            {vehicle.chassisNumber && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">رقم الهيكل (VIN):</span>
                  <span className="text-gray-900 font-mono text-lg font-bold">{vehicle.chassisNumber}</span>
                </div>
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">السعر المطلوب</h3>
              <div className="text-5xl font-bold mb-2">
                {formatPrice(vehicle.price || 0)}
              </div>
              <p className="text-blue-100 text-lg">شامل ضريبة القيمة المضافة</p>
            </div>
          </div>

          {/* Additional Notes */}
          {vehicle.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h4 className="font-bold text-yellow-800 mb-2">ملاحظات إضافية:</h4>
              <p className="text-yellow-700">{vehicle.notes}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-3">معلومات التواصل</h4>
                <div className="space-y-2 text-gray-700">
                  <p>📞 الهاتف: +966 50 123 4567</p>
                  <p>📧 البريد: info@albarimi-cars.com</p>
                  <p>🌐 الموقع: www.albarimi-cars.com</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-3">العنوان</h4>
                <div className="text-gray-700">
                  <p>المملكة العربية السعودية</p>
                  <p>الرياض - حي الملك فهد</p>
                  <p>طريق الملك عبدالعزيز</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-300">
            <p className="text-gray-600 text-sm">
              تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')} | 
              صالحة لمدة 30 يوماً من تاريخ الإصدار
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6 pt-4 border-t">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <Download size={16} className="ml-2" />
            {isGeneratingPDF ? "جاري التحميل..." : "تحميل PDF"}
          </Button>
          
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="px-6"
          >
            <Printer size={16} className="ml-2" />
            طباعة
          </Button>
          
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="px-6"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}