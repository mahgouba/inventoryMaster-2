import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QrCode, Phone, Mail, Globe, Building, Download } from "lucide-react";
import { numberToArabic } from "@/utils/number-to-arabic";
import type { Company, InventoryItem, Specification } from "@shared/schema";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Background images
const backgroundImages = {
  albarimi1: '/albarimi-1.jpg',
  albarimi2: '/albarimi-2.jpg'
};

interface QuotationA4PreviewProps {
  selectedCompany: Company | null;
  selectedVehicle: InventoryItem | null;
  vehicleSpecs?: Specification | null;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerTitle?: string; // التوجيه مثل السادة، السيد، السيدة، الشيخ، سمو الأمير
  validUntil: Date;
  basePrice: number;
  finalPrice: number;
  licensePlatePrice: number;
  includeLicensePlate: boolean;
  licensePlateSubjectToTax: boolean;
  taxRate: number;
  isVATInclusive: boolean;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  representativePosition: string;
  notes: string;
  termsRefreshTrigger?: number;
  companyStamp?: string | null;
  isInvoiceMode?: boolean;
  invoiceNumber?: string;
}

export default function QuotationA4Preview({
  selectedCompany,
  selectedVehicle,
  vehicleSpecs,
  quoteNumber,
  customerName,
  customerPhone,
  customerEmail,
  customerTitle = "السادة",
  validUntil,
  basePrice,
  finalPrice,
  licensePlatePrice,
  includeLicensePlate,
  licensePlateSubjectToTax,
  taxRate,
  isVATInclusive,
  representativeName,
  representativePhone,
  representativeEmail,
  representativePosition,
  notes,
  termsRefreshTrigger = 0,
  companyStamp = null,
  isInvoiceMode = false,
  invoiceNumber = ""
}: QuotationA4PreviewProps) {
  
  const [termsConditions, setTermsConditions] = useState<Array<{ id: number; term_text: string; display_order: number }>>([]);
  const [manufacturerLogo, setManufacturerLogo] = useState<string | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [editableSpecs, setEditableSpecs] = useState<string>("");
  const [useAlbarimi2Background, setUseAlbarimi2Background] = useState(true); // Default to albarimi-2
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch terms and conditions
  useEffect(() => {
    const fetchTermsConditions = async () => {
      try {
        const response = await fetch('/api/terms-conditions');
        if (response.ok) {
          const data = await response.json();
          setTermsConditions(data);
        }
      } catch (error) {
        console.error('Error fetching terms and conditions:', error);
      }
    };

    fetchTermsConditions();
  }, [termsRefreshTrigger]);

  // Fetch manufacturer logo
  useEffect(() => {
    const fetchManufacturerLogo = async () => {
      if (selectedVehicle?.manufacturer) {
        try {
          const response = await fetch(`/api/manufacturers/${encodeURIComponent(selectedVehicle.manufacturer)}`);
          if (response.ok) {
            const data = await response.json();
            setManufacturerLogo(data.logo);
          }
        } catch (error) {
          console.error('Error fetching manufacturer logo:', error);
        }
      }
    };

    fetchManufacturerLogo();
  }, [selectedVehicle?.manufacturer]);

  // Generate QR Code
  useEffect(() => {
    const generateQRCode = async () => {
      if (selectedVehicle && customerName && customerPhone) {
        try {
          const qrData = {
            quoteNumber: isInvoiceMode ? invoiceNumber : quoteNumber,
            customer: customerName,
            phone: customerPhone,
            vehicle: `${selectedVehicle.manufacturer} ${selectedVehicle.category}`,
            year: selectedVehicle.year,
            chassisNumber: selectedVehicle.chassisNumber,
            price: basePrice,
            date: new Date().toLocaleDateString('ar-SA')
          };
          
          const qrString = Object.entries(qrData)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          
          const qrCodeDataURL = await QRCode.toDataURL(qrString, {
            width: 64,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          setQrCodeDataURL(qrCodeDataURL);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };

    generateQRCode();
  }, [selectedVehicle, customerName, customerPhone, quoteNumber, invoiceNumber, isInvoiceMode, basePrice]);

  // Update editable specs when vehicle specs change
  useEffect(() => {
    setEditableSpecs(vehicleSpecs?.detailedDescription || "");
  }, [vehicleSpecs?.detailedDescription]);



  // Calculate pricing
  const grandTotal = isVATInclusive ? finalPrice : (finalPrice + (finalPrice * taxRate / 100));
  const taxAmount = isVATInclusive ? (finalPrice * taxRate / (100 + taxRate)) : (finalPrice * taxRate / 100);

  // PDF Download Function with ultra-high quality settings and fixed dimensions
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Fixed A4 dimensions in pixels (300 DPI)
      const A4_WIDTH_PX = 2480; // 210mm at 300 DPI
      const A4_HEIGHT_PX = 3508; // 297mm at 300 DPI
      
      // Create high-resolution canvas with fixed A4 dimensions
      const canvas = await html2canvas(previewRef.current, {
        scale: 4, // Ultra-high resolution scale (4x)
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: true,
        imageTimeout: 30000, // Increased timeout for high-res processing
        removeContainer: true,
        logging: false,
        width: A4_WIDTH_PX / 4, // Divide by scale to get proper dimensions
        height: A4_HEIGHT_PX / 4,
        x: 0,
        y: 0,
        windowWidth: A4_WIDTH_PX / 4,
        windowHeight: A4_HEIGHT_PX / 4,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Enhance font rendering and fix dimensions in cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              box-shadow: none !important;
              -webkit-box-shadow: none !important;
              -moz-box-shadow: none !important;
            }
            img {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
              image-rendering: pixelated;
            }
            [data-pdf-export="quotation"] {
              width: ${A4_WIDTH_PX / 4}px !important;
              height: ${A4_HEIGHT_PX / 4}px !important;
              min-width: ${A4_WIDTH_PX / 4}px !important;
              min-height: ${A4_HEIGHT_PX / 4}px !important;
              max-width: ${A4_WIDTH_PX / 4}px !important;
              max-height: ${A4_HEIGHT_PX / 4}px !important;
              transform: none !important;
              zoom: 1 !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
              -webkit-box-shadow: none !important;
              -moz-box-shadow: none !important;
            }
            @media print {
              [data-pdf-export="quotation"] {
                width: ${A4_WIDTH_PX / 4}px !important;
                height: ${A4_HEIGHT_PX / 4}px !important;
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
                -moz-box-shadow: none !important;
              }
              * {
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
                -moz-box-shadow: none !important;
              }
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      // Convert to PNG first for maximum quality, then to high-quality JPEG
      const imgData = canvas.toDataURL('image/png', 1.0); // Maximum PNG quality
      
      // Create PDF with high compression settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 16 // Higher precision for better quality
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add image with no margins (full page)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'NONE');
      
      const fileName = isInvoiceMode ? `فاتورة_${invoiceNumber}.pdf` : `عرض_سعر_${quoteNumber}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to lower quality with fixed dimensions if high-res fails
      try {
        const A4_WIDTH_PX = 2480; // 210mm at 300 DPI
        const A4_HEIGHT_PX = 3508; // 297mm at 300 DPI
        
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          allowTaint: true,
          width: A4_WIDTH_PX / 2,
          height: A4_HEIGHT_PX / 2,
          windowWidth: A4_WIDTH_PX / 2,
          windowHeight: A4_HEIGHT_PX / 2,
          onclone: (clonedDoc) => {
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * {
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
                -moz-box-shadow: none !important;
              }
              [data-pdf-export="quotation"] {
                width: ${A4_WIDTH_PX / 2}px !important;
                height: ${A4_HEIGHT_PX / 2}px !important;
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
                -moz-box-shadow: none !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Add image with no margins (fallback)
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        const fileName = isInvoiceMode ? `فاتورة_${invoiceNumber}.pdf` : `عرض_سعر_${quoteNumber}.pdf`;
        pdf.save(fileName);
        
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Background Toggle Switch */}
      <div className="mb-4 flex justify-center items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="bg-[#cf9b46] text-[#fcfcfc] text-[15px]">البريمي </span>
          <Switch 
            checked={useAlbarimi2Background} 
            onCheckedChange={setUseAlbarimi2Background}
            className="mx-2"
          />
          <span className="text-sm text-gray-600">خلفية 2</span>
        </div>
      </div>
      <div className="mb-4 flex justify-center">
        <Button onClick={downloadPDF} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'جاري التحميل...' : 'تحميل PDF'}
        </Button>
      </div>
      <div 
        ref={previewRef}
        data-pdf-export="quotation"
        className="mx-auto text-black shadow-2xl print:shadow-none border border-slate-200 overflow-hidden relative"
        style={{
          width: '210mm',
          height: '297mm',
          minWidth: '210mm',
          minHeight: '297mm',
          maxWidth: '210mm',
          maxHeight: '297mm',
          fontFamily: '"Noto Sans Arabic", Arial, sans-serif',
          direction: 'rtl',
          backgroundImage: `url(${useAlbarimi2Background ? backgroundImages.albarimi2 : backgroundImages.albarimi1})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          boxSizing: 'border-box',
          position: 'relative',
          transform: 'none',
          zoom: 1
        }}
      >
        {/* Content overlay on A4 background */}
        <div className="absolute inset-0 p-8">
          
          {/* Header section with company logo and QR code */}
          <div className="relative mb-8">
            {/* Company Logo */}
            {selectedCompany?.logo && (
              <div className="absolute top-4 left-8 w-20 h-20">
                <img 
                  src={selectedCompany.logo} 
                  alt={selectedCompany.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* QR Code */}
            {qrCodeDataURL && (
              <div className="absolute top-4 right-8">
                <img src={qrCodeDataURL} alt="QR Code" className="w-16 h-16" />
              </div>
            )}

            {/* Document Type with Number and Date in same row */}
            <div className="absolute top-20 right-8">
              <div className="flex items-center gap-6">
                <h2 className="text-base font-bold text-black" style={{fontFamily: 'Cairo, sans-serif'}}>
                  {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
                </h2>
                <div className="text-xs text-black">
                  <span className="font-semibold">رقم: </span>
                  <span>{isInvoiceMode ? invoiceNumber : quoteNumber}</span>
                </div>
                <div className="text-xs text-black">
                  <span className="font-semibold">الإصدار:      </span>
                  <span>{new Date().toLocaleDateString('en-GB')}</span>
                  <span className="font-semibold ml-4">صالح حتى: </span>
                  <span>{validUntil.toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              
              {/* Customer Information Details below header */}
              <div className="mt-4 bg-white/90 p-3 pt-[1px] pb-[1px] text-[13px] text-right">
                <div className="space-y-2 text-xs text-black">
                  <div className="text-right text-[16px] font-semibold">
                    <span>{customerTitle} / {customerName || "غير محدد"} &nbsp;&nbsp;&nbsp; الموقرين</span>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Vehicle Information Section */}
          <div className="mb-[11px] ml-[25px] mr-[25px]" style={{marginTop: '38px'}}>
            

            {/* Vehicle Information */}
            {selectedVehicle && (
              <div className="relative p-4 w-full mt-[166px] mb-[16px] overflow-hidden bg-[#fafafa12]">
                {/* Manufacturer Logo Watermark */}
                {manufacturerLogo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                      src={manufacturerLogo} 
                      alt={`${selectedVehicle.manufacturer} logo`}
                      className="w-48 h-48 object-contain opacity-5 grayscale"
                    />
                  </div>
                )}
                
                <div className="relative z-10 text-xs text-black">
                  {/* Vehicle Information Grid - Properly Aligned */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">الصانع:</span>
                      <span className="text-right">{selectedVehicle.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">الفئة:</span>
                      <span className="text-right">{selectedVehicle.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">درجة التجهيز:</span>
                      <span className="text-right">{selectedVehicle.trimLevel || "غير محدد"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">السنة:</span>
                      <span className="text-right">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">اللون الخارجي:</span>
                      <span className="text-right">{selectedVehicle.exteriorColor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">اللون الداخلي:</span>
                      <span className="text-right">{selectedVehicle.interiorColor}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="font-semibold text-gray-700">رقم الهيكل:</span>
                      <span className="text-right">{selectedVehicle.chassisNumber}</span>
                    </div>
                  </div>
                </div>
                
                {/* Detailed Specifications - Full Width Editable */}
<div className="mt-3 pt-3">
                  <div className="flex items-center justify-between mt-[-10px] mb-[-10px] pt-[0px] pb-[0px]">
                    <h4 className="text-xs font-bold text-[#cf9b46]">المواصفات التفصيلية:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                      className="text-xs px-2 py-1 print:hidden"
                    >
                      {isEditingSpecs ? "حفظ" : "تحرير"}
                    </Button>
                  </div>
                  {isEditingSpecs ? (
                    <textarea
                      value={editableSpecs}
                      onChange={(e) => setEditableSpecs(e.target.value)}
                      className="w-full h-20 p-2 text-xs text-black border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="اكتب المواصفات التفصيلية هنا..."
                      style={{ direction: 'rtl' }}
                    />
                  ) : (
                    <div className="text-xs text-black whitespace-pre-wrap max-h-20 overflow-y-auto bg-gray-50 p-2 rounded border">
                      {editableSpecs || "لا توجد مواصفات تفصيلية"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown Table */}
          <div className="bg-white/90 border border-gray-300 rounded mb-6 shadow-sm">
            <div className="p-4 rounded-t bg-[#03627f] text-[#c39631] pt-[2px] pb-[2px]">
              <h3 className="text-sm font-bold text-center" style={{fontFamily: 'Cairo, sans-serif'}}>تفاصيل السعر</h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gray-100 border-b border-gray-300 text-xs font-bold text-center">
              <div className="p-2 border-l border-gray-300">الكمية</div>
              <div className="p-2 border-l border-gray-300">السعر الفردي</div>
              <div className="p-2 border-l border-gray-300">الضريبة ({taxRate}%)</div>
              <div className="p-2 border-l border-gray-300">اللوحات</div>
              <div className="p-2">الإجمالي</div>
            </div>
            
            {/* Table Row */}
            <div className="grid grid-cols-5 border-b border-gray-200 text-xs text-center text-black bg-white">
              <div className="p-2 border-l border-gray-200">1</div>
              <div className="p-2 border-l border-gray-200 font-semibold">{basePrice.toLocaleString()}</div>
              <div className="p-2 border-l border-gray-200 font-semibold">{taxAmount.toLocaleString()}</div>
              <div className="p-2 border-l border-gray-200 font-semibold">
                {includeLicensePlate ? licensePlatePrice.toLocaleString() : "0"}
              </div>
              <div className="p-2 font-bold text-blue-800">
                {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()}
              </div>
            </div>
            
            {/* Total Row */}
            <div className="p-4 bg-gray-50 border-t-2 border-blue-800 rounded-b pt-[4px] pb-[4px]">
              <div className="flex justify-center mb-3">
                <div className="font-bold text-sm text-blue-800">
                  المجموع: {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()} ريال
                </div>
              </div>
              <div className="text-center text-xs font-bold text-white px-4 py-3 rounded bg-[#c49631] pt-[2px] pb-[2px]">
                {numberToArabic(grandTotal + (includeLicensePlate ? licensePlatePrice : 0))} ريال سعودي لا غير
              </div>
            </div>
          </div>

          {/* Representative Information and Terms & Conditions Section */}
          <div className="flex gap-6 mb-6">
            {/* Terms & Conditions Section - Hidden in invoice mode */}
            {!isInvoiceMode && (
              <div className="bg-white/90 border border-gray-300 p-4 rounded flex-1 shadow-sm">
                <div className="text-xs text-black space-y-2">
                  {termsConditions.length > 0 ? (
                    termsConditions.map((term, index) => (
                      <div key={term.id} className="flex items-start gap-2">
                        <span className="text-amber-600 font-semibold min-w-[1rem]">{index + 1}.</span>
                        <span className="leading-relaxed">{term.term_text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">لم يتم إضافة شروط وأحكام بعد</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Representative Information - Small box on the right - Hidden if no representative selected */}
            {representativeName && (
              <div className="bg-white/90 border border-gray-300 p-3 rounded shadow-sm w-64">
                <h3 className="text-xs font-bold mb-2 text-blue-800 border-b border-gray-200 pb-1" style={{fontFamily: 'Cairo, sans-serif'}}>
                  بيانات المندوب
                </h3>
                <div className="space-y-1 text-xs text-black">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">الاسم:</span>
                    <span>{representativeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">الجوال:</span>
                    <span>{representativePhone || "غير محدد"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stamp Section */}
          <div className="flex justify-end mb-6">
            <div className="bg-transparent border border-gray-300 p-4 rounded shadow-sm w-64 pl-[2px] pr-[2px] pt-[2px] pb-[2px]">
              <div className="border-2 border-dashed border-gray-300 h-32 flex items-center justify-center rounded bg-transparent">
                {companyStamp ? (
                  <img 
                    src={companyStamp} 
                    alt="ختم الشركة" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">منطقة الختم</span>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}