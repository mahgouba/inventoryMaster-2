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