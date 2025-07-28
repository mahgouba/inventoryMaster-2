import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Image, FileText, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface EnhancedPDFExportProps {
  targetElementId: string;
  filename?: string;
  showJPGExport?: boolean;
  showPDFExport?: boolean;
  showPrintButton?: boolean;
}

export default function EnhancedPDFExport({
  targetElementId,
  filename = "quotation",
  showJPGExport = true,
  showPDFExport = true,
  showPrintButton = true
}: EnhancedPDFExportProps) {
  const { toast } = useToast();

  // Export as high-quality JPG image
  const exportAsJPG = async () => {
    try {
      const element = document.querySelector(`[data-pdf-export="${targetElementId}"]`) as HTMLElement;
      if (!element) {
        toast({
          title: "خطأ",
          description: "لا يمكن العثور على العنصر المطلوب",
          variant: "destructive",
        });
        return;
      }

      // Wait for images and fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create high-quality canvas
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        logging: false,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: false
      });

      // Convert to high-quality JPG
      const imageDataURL = canvas.toDataURL('image/jpeg', 0.95); // High quality JPG
      
      // Create download link
      const link = document.createElement('a');
      link.href = imageDataURL;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير الصورة بتنسيق JPG عالي الجودة",
      });
    } catch (error) {
      console.error('Error exporting JPG:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير الصورة",
        variant: "destructive",
      });
    }
  };

  // Export as optimized PDF
  const exportAsPDF = async () => {
    try {
      const element = document.querySelector(`[data-pdf-export="${targetElementId}"]`) as HTMLElement;
      if (!element) {
        toast({
          title: "خطأ",
          description: "لا يمكن العثور على العنصر المطلوب",
          variant: "destructive",
        });
        return;
      }

      // Wait for images and fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create high-quality canvas with proper dimensions
      const canvas = await html2canvas(element, {
        scale: 2, // Good balance of quality and file size
        logging: false,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: false
      });

      // Create PDF with proper A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Calculate dimensions to fit A4
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate scaling to fit A4 while maintaining aspect ratio
      const scale = 2; // We know the scale we used
      const widthRatio = pdfWidth / (canvasWidth / scale);
      const heightRatio = pdfHeight / (canvasHeight / scale);
      const ratio = Math.min(widthRatio, heightRatio);
      
      const imgWidth = (canvasWidth / scale) * ratio;
      const imgHeight = (canvasHeight / scale) * ratio;
      
      // Center the image on the page
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      // Add image to PDF with optimized quality
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        x,
        y,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );

      // Save PDF
      pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير العرض إلى ملف PDF محسن",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      toast({
        title: "خطأ في التصدير",
        description: `فشل تصدير PDF: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // Enhanced print function
  const handlePrint = () => {
    const element = document.querySelector(`[data-pdf-export="${targetElementId}"]`) as HTMLElement;
    if (!element) {
      toast({
        title: "خطأ",
        description: "لا يمكن العثور على العنصر المطلوب للطباعة",
        variant: "destructive",
      });
      return;
    }

    // Create enhanced print styles
    const printStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        
        @page {
          margin: 0 !important;
          size: A4 portrait !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Noto Sans Arabic', Arial, sans-serif !important;
          direction: rtl !important;
          background: white !important;
          width: 210mm !important;
          height: 297mm !important;
        }
        
        .print-content {
          width: 210mm !important;
          height: 297mm !important;
          background-size: cover !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          position: relative !important;
          overflow: hidden !important;
          font-family: 'Noto Sans Arabic', Arial, sans-serif !important;
          image-rendering: crisp-edges !important;
          page-break-inside: avoid !important;
        }
        
        /* Hide interactive elements */
        button, .cursor-pointer, .no-print { display: none !important; }
        
        /* Ensure proper image rendering */
        img {
          image-rendering: -webkit-optimize-contrast !important;
          image-rendering: crisp-edges !important;
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* Table styling for price breakdown */
        .grid {
          display: grid !important;
          gap: 0 !important;
        }
        
        .grid-cols-5 {
          grid-template-columns: repeat(5, 1fr) !important;
        }
        
        .grid > div {
          border: 1px solid white !important;
          padding: 8px 4px !important;
          text-align: center !important;
          background: transparent !important;
          font-size: 12px !important;
          line-height: 1.2 !important;
        }
        
        /* Text colors for better contrast */
        .text-black { color: black !important; }
        .text-white { color: white !important; }
        .bg-white { background-color: white !important; }
        
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Clean content from interactive elements
      let cleanContent = element.innerHTML;
      cleanContent = cleanContent.replace(/<button[^>]*>.*?<\/button>/gi, '');
      cleanContent = cleanContent.replace(/<[^>]*class="[^"]*no-print[^"]*"[^>]*>.*?<\/[^>]*>/gi, '');

      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة ${filename}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${printStyles}
          </head>
          <body>
            <div class="print-content">
              ${cleanContent}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1500);
      };
    }
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {showJPGExport && (
        <Button
          onClick={exportAsJPG}
          className="flex-1 glass-button bg-gradient-to-r from-blue-500/70 to-blue-600/70 hover:from-blue-600/80 hover:to-blue-700/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border-0"
          size="sm"
        >
          <Image size={16} className="ml-2" />
          صورة JPG
        </Button>
      )}
      
      {showPDFExport && (
        <Button
          onClick={exportAsPDF}
          className="flex-1 glass-button bg-gradient-to-r from-red-500/70 to-red-600/70 hover:from-red-600/80 hover:to-red-700/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border-0"
          size="sm"
        >
          <FileText size={16} className="ml-2" />
          ملف PDF
        </Button>
      )}
      
      {showPrintButton && (
        <Button
          onClick={handlePrint}
          className="flex-1 glass-button bg-gradient-to-r from-green-500/70 to-green-600/70 hover:from-green-600/80 hover:to-green-700/80 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border-0"
          size="sm"
        >
          <Printer size={16} className="ml-2" />
          طباعة
        </Button>
      )}
    </div>
  );
}