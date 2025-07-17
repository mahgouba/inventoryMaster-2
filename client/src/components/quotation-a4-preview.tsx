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

  // PDF Download Function
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = isInvoiceMode ? `فاتورة_${invoiceNumber}.pdf` : `عرض_سعر_${quoteNumber}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
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
        className="mx-auto bg-white text-black shadow-2xl border border-slate-200 overflow-hidden relative"
        style={{
          width: '210mm',
          height: '297mm',
          fontFamily: '"Noto Sans Arabic", Arial, sans-serif',
          direction: 'rtl',
          backgroundImage: `url(${A4Background})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
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

            {/* Document Type */}
            <div className="absolute top-20 right-8">
              <h2 className="text-lg font-bold text-black" style={{fontFamily: 'Cairo, sans-serif'}}>
                {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
              </h2>
            </div>

            {/* Document info */}
            <div className="absolute top-32 right-8 text-sm text-black">
              <div className="mb-2">
                <span className="font-semibold">رقم: </span>
                <span>{isInvoiceMode ? invoiceNumber : quoteNumber}</span>
              </div>
              <div>
                <span className="font-semibold">التاريخ: </span>
                <span>{new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>

          {/* Customer & Representative Info */}
          <div className="grid grid-cols-2 gap-6 mb-8" style={{marginTop: '180px'}}>
            {/* Customer Information */}
            <div className="bg-white/90 border border-gray-300 p-4 rounded">
              <h3 className="text-base font-bold mb-3 text-blue-800" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات العميل
              </h3>
              <div className="space-y-2 text-sm text-black">
                <div>
                  <span className="font-semibold">الاسم: </span>
                  <span>{customerName || "غير محدد"}</span>
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
            <div className="bg-white/90 border border-gray-300 p-4 rounded">
              <h3 className="text-base font-bold mb-3 text-blue-800" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات المندوب
              </h3>
              <div className="space-y-2 text-sm text-black">
                <div>
                  <span className="font-semibold">الاسم: </span>
                  <span>{representativeName || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-semibold">الهاتف: </span>
                  <span>{representativePhone || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-semibold">المنصب: </span>
                  <span>{representativePosition || "غير محدد"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          {selectedVehicle && (
            <div className="bg-white/90 border border-gray-300 p-4 rounded mb-6">
              <h3 className="text-base font-bold mb-3 text-blue-800" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات المركبة
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-black">
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
                <div>
                  <span className="font-semibold">اللون الداخلي: </span>
                  <span>{selectedVehicle.interiorColor}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">رقم الهيكل: </span>
                  <span>{selectedVehicle.chassisNumber}</span>
                </div>
                {selectedVehicle.trimLevel && (
                  <div>
                    <span className="font-semibold">الفئة التفصيلية: </span>
                    <span>{selectedVehicle.trimLevel}</span>
                  </div>
                )}
              </div>
              
              {/* Detailed Specifications */}
              {vehicleSpecs && vehicleSpecs.detailedDescription && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h4 className="text-sm font-bold mb-2 text-amber-600">المواصفات التفصيلية:</h4>
                  <div className="text-sm text-black whitespace-pre-wrap">
                    {vehicleSpecs.detailedDescription}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown Table */}
          <div className="bg-white/90 border border-gray-300 rounded mb-6">
            <div className="bg-blue-800 text-white p-3 rounded-t">
              <h3 className="text-base font-bold text-center" style={{fontFamily: 'Cairo, sans-serif'}}>تفاصيل السعر</h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gray-100 border-b border-gray-300 text-sm font-bold text-center">
              <div className="p-3 border-l border-gray-300">الكمية</div>
              <div className="p-3 border-l border-gray-300">السعر الفردي</div>
              <div className="p-3 border-l border-gray-300">الضريبة ({taxRate}%)</div>
              <div className="p-3 border-l border-gray-300">اللوحات</div>
              <div className="p-3">الإجمالي</div>
            </div>
            
            {/* Table Row */}
            <div className="grid grid-cols-5 border-b border-gray-200 text-sm text-center text-black">
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
            <div className="p-4 bg-gray-50 border-t-2 border-blue-800 rounded-b">
              <div className="flex justify-center">
                <div className="font-bold text-lg text-blue-800">
                  المجموع: {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()} ريال
                </div>
              </div>
              <div className="text-center text-sm mt-3 font-bold text-white px-3 py-2 bg-amber-600 rounded">
                {numberToArabic(grandTotal + (includeLicensePlate ? licensePlatePrice : 0))} ريال سعودي لا غير
              </div>
            </div>
          </div>

          {/* Terms & Conditions and Stamp Section */}
          <div className="flex gap-6 mb-8">
            {/* Terms & Conditions Section - Hidden in invoice mode */}
            {!isInvoiceMode && (
              <div className="bg-white/90 border border-gray-300 p-4 rounded flex-1">
                <h3 className="text-base font-bold mb-3 text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>الشروط والأحكام</h3>
                <div className="text-sm text-black space-y-2">
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
            <div className={`bg-white/90 border border-gray-300 p-4 rounded ${isInvoiceMode ? 'w-full' : 'w-64'}`}>
              <h3 className="text-base font-bold mb-3 text-center text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>
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
                  <span className="text-sm text-gray-400">منطقة الختم</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {notes && (
            <div className="bg-white/90 border border-gray-300 p-4 rounded w-64 mb-6">
              <h3 className="text-base font-bold mb-3 text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>ملاحظات</h3>
              <p className="text-sm text-black leading-relaxed">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}