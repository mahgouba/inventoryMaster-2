import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { QrCode, Phone, Mail, Globe, Building, Download } from "lucide-react";
import { numberToArabic } from "@/utils/number-to-arabic";
import type { Company, InventoryItem, Specification } from "@shared/schema";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Use A4 - 1.jpg as background image
const A4Background = '/A4 - 1.jpg';

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
            }
            @media print {
              [data-pdf-export="quotation"] {
                width: ${A4_WIDTH_PX / 4}px !important;
                height: ${A4_HEIGHT_PX / 4}px !important;
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
      
      // Add image with optimal quality settings
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
              [data-pdf-export="quotation"] {
                width: ${A4_WIDTH_PX / 2}px !important;
                height: ${A4_HEIGHT_PX / 2}px !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
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
      <div className="mb-4 flex justify-center">
        <Button onClick={downloadPDF} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'جاري التحميل...' : 'تحميل PDF'}
        </Button>
      </div>
      
      <div 
        ref={previewRef}
        data-pdf-export="quotation"
        className="mx-auto text-black shadow-2xl border border-slate-200 overflow-hidden relative"
        style={{
          width: '210mm',
          height: '297mm',
          minWidth: '210mm',
          minHeight: '297mm',
          maxWidth: '210mm',
          maxHeight: '297mm',
          fontFamily: '"Noto Sans Arabic", Arial, sans-serif',
          direction: 'rtl',
          backgroundImage: `url(/A4%20-%201.jpg)`,
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
                  <span className="font-semibold">التاريخ: </span>
                  <span>{new Date().toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Representative Info */}
          <div className="grid grid-cols-2 gap-6 mb-8" style={{marginTop: '180px'}}>
            {/* Customer Information */}
            <div className="bg-white/80 border border-gray-300 p-4 rounded">
              <h3 className="text-sm font-bold mb-3 text-blue-800" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات العميل
              </h3>
              <div className="space-y-2 text-xs text-black">
                <div>
                  <span className="font-semibold">
                    {customerTitle || "السادة"} / {customerName || "غير محدد"} الموقرين
                  </span>
                </div>
                <div>
                  <span className="font-semibold">الهاتف: </span>
                  <span>{customerPhone || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-semibold">البريد الإلكتروني: </span>
                  <span>{customerEmail || "غير محدد"}</span>
                </div>
              </div>
            </div>

            {/* Representative Information */}
            <div className="bg-white/80 border border-gray-300 p-4 rounded">
              <h3 className="text-sm font-bold mb-3 text-blue-800" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات المندوب
              </h3>
              <div className="space-y-2 text-xs text-black">
                <div>
                  <span className="font-semibold">الاسم: </span>
                  <span>{representativeName || "غير محدد"}</span>
                </div>
                
                <div>
                  <span className="font-semibold">المنصب: </span>
                  <span>{representativePosition || "غير محدد"}</span>
                </div>
              </div>
            </div>
          </div>



          {/* Price Breakdown Table */}
          <div className="bg-white/80 border border-gray-300 rounded mb-6">
            <div className="p-3 rounded-t pt-[1px] pb-[1px] bg-[#03627f] text-[#c39631] text-[15px]">
              <h3 className="text-sm font-bold text-center" style={{fontFamily: 'Cairo, sans-serif'}}>تفاصيل السعر</h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gray-100 border-b border-gray-300 text-xs font-bold text-center">
              <div className="p-3 border-l border-gray-300">الكمية</div>
              <div className="p-3 border-l border-gray-300">السعر الفردي</div>
              <div className="p-3 border-l border-gray-300">الضريبة ({taxRate}%)</div>
              <div className="p-3 border-l border-gray-300">اللوحات</div>
              <div className="p-3">الإجمالي</div>
            </div>
            
            {/* Table Row */}
            <div className="grid grid-cols-5 border-b border-gray-200 text-xs text-center text-black">
              <div className="p-3 border-l border-gray-200">1</div>
              <div className="p-3 border-l border-gray-200 font-semibold">{basePrice.toLocaleString()}</div>
              <div className="p-3 border-l border-gray-200 font-semibold">{taxAmount.toLocaleString()}</div>
              <div className="p-3 border-l border-gray-200 font-semibold">
                {includeLicensePlate ? licensePlatePrice.toLocaleString() : "0"}
              </div>
              <div className="p-3 font-bold text-blue-800">
                {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()}
              </div>
            </div>
            
            {/* Total Row */}
            <div className="p-4 bg-gray-50 border-t-2 border-blue-800 rounded-b pt-[0px] pb-[0px]">
              <div className="flex justify-center">
                <div className="font-bold text-sm text-blue-800">
                  المجموع: {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()} ريال
                </div>
              </div>
              <div className="text-center text-xs mt-3 font-bold text-white px-3 py-2 rounded bg-[#c49631] pt-[3px] pb-[3px]">
                {numberToArabic(grandTotal + (includeLicensePlate ? licensePlatePrice : 0))} ريال سعودي لا غير
              </div>
            </div>
          </div>

          {/* Terms & Conditions and Stamp Section */}
          <div className="flex gap-6 mb-8">
            {/* Terms & Conditions Section - Hidden in invoice mode */}
            {!isInvoiceMode && (
              <div className="bg-white/80 border border-gray-300 p-4 rounded flex-1">
                <h3 className="text-sm font-bold mb-3 text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>الشروط والأحكام</h3>
                <div className="text-xs text-black space-y-2">
                  {termsConditions.length > 0 ? (
                    termsConditions.map((term, index) => (
                      <div key={term.id} className="flex items-start gap-2">
                        <span className="text-gray-600 font-semibold">{index + 1}.</span>
                        <span className="leading-relaxed">{term.term_text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">لم يتم إضافة شروط وأحكام بعد</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Stamp Section */}
            <div className={`bg-white/80 border border-gray-300 p-4 rounded ${isInvoiceMode ? 'w-full' : 'w-64'}`}>
              <h3 className="text-sm font-bold mb-3 text-center text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>
                {isInvoiceMode ? 'ختم الفاتورة' : 'ختم العرض'}
              </h3>
              <div className="border-2 border-dashed border-gray-300 h-32 flex items-center justify-center rounded">
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

          {/* Vehicle Information - Moved below Terms & Conditions */}
          {selectedVehicle && (
            <div className="bg-white/80 border border-gray-300 p-4 rounded mb-6">
              <h3 className="text-sm font-bold mb-3 text-blue-800" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات المركبة
              </h3>
              <div className="space-y-3 text-xs text-black">
                {/* الصف الأول: الصانع، الفئة، درجة التجهيز */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">الصانع: </span>
                    <div className="flex items-center gap-1">
                      {manufacturerLogo && (
                        <img 
                          src={manufacturerLogo} 
                          alt={selectedVehicle.manufacturer} 
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span>{selectedVehicle.manufacturer}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">الفئة: </span>
                    <span>{selectedVehicle.category}</span>
                  </div>
                  {selectedVehicle.trimLevel ? (
                    <div>
                      <span className="font-semibold">درجة التجهيز: </span>
                      <span>{selectedVehicle.trimLevel}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold">درجة التجهيز: </span>
                      <span>غير محدد</span>
                    </div>
                  )}
                </div>

                {/* الصف الثاني: السنة، سعة المحرك، اللون الخارجي */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-semibold">السنة: </span>
                    <span>{selectedVehicle.year}</span>
                  </div>
                  <div>
                    <span className="font-semibold">سعة المحرك: </span>
                    <span>{selectedVehicle.engineCapacity}</span>
                  </div>
                  <div>
                    <span className="font-semibold">اللون الخارجي: </span>
                    <span>{selectedVehicle.exteriorColor}</span>
                  </div>
                </div>

                {/* الصف الثالث: اللون الداخلي، رقم الهيكل */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold">اللون الداخلي: </span>
                    <span>{selectedVehicle.interiorColor}</span>
                  </div>
                  <div>
                    <span className="font-semibold">رقم الهيكل: </span>
                    <span>{selectedVehicle.chassisNumber}</span>
                  </div>
                </div>
              </div>
              
              {/* Detailed Specifications */}
              {vehicleSpecs && vehicleSpecs.detailedDescription && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h4 className="text-xs font-bold mb-2 text-amber-600">المواصفات التفصيلية:</h4>
                  <div className="text-xs text-black whitespace-pre-wrap">
                    {vehicleSpecs.detailedDescription}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Section */}
          {notes && (
            <div className="bg-white/80 border border-gray-300 p-4 rounded w-64 mb-6">
              <h3 className="text-sm font-bold mb-3 text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>ملاحظات</h3>
              <p className="text-xs text-black leading-relaxed">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}