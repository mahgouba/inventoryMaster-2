import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QrCode, Phone, Mail, Globe, Building, FileText, User, Building2, Settings, Calculator } from "lucide-react";
import { numberToArabic } from "@/utils/number-to-arabic";
import type { Company, InventoryItem, Specification } from "@shared/schema";
import { getManufacturerLogo } from "@shared/manufacturer-logos";
import QRCode from "qrcode";


// Background images
const backgroundImages = {
  albarimi1: '/albarimi-1.svg',
  albarimi2: '/albarimi-2.svg'
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
  authorizationNumber?: string;
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
  invoiceNumber = "",
  authorizationNumber = ""
}: QuotationA4PreviewProps) {
  
  const [termsConditions, setTermsConditions] = useState<Array<{ id: number; term_text: string; display_order: number }>>([]);
  const [manufacturerLogo, setManufacturerLogo] = useState<string | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);

  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [editableSpecs, setEditableSpecs] = useState<string>("");
  const [useAlbarimi2Background, setUseAlbarimi2Background] = useState(true); // Default to albarimi-2
  const previewRef = useRef<HTMLDivElement>(null);

  // Print function for the quotation preview
  const handlePrint = () => {
    const printContent = previewRef.current;
    if (!printContent) {
      console.error('لا يوجد محتوى للطباعة');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('فشل في فتح نافذة الطباعة');
      return;
    }

    // Create comprehensive styles for print that match the preview exactly
    const printStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        
        @page {
          margin: 0 !important;
          size: A4 portrait !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          width: 210mm !important;
          height: 297mm !important;
        }
        
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          print-color-adjust: exact;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Noto Sans Arabic', Arial, sans-serif !important;
          direction: rtl !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          width: 210mm !important;
          height: 297mm !important;
          overflow: hidden !important;
          transform: none !important;
          zoom: 1 !important;
          scale: 1 !important;
        }
        
        .print-content {
          width: 210mm !important;
          height: 297mm !important;
          min-width: 210mm !important;
          min-height: 297mm !important;
          max-width: 210mm !important;
          max-height: 297mm !important;
          background-size: cover !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          position: relative !important;
          transform: none !important;
          zoom: 1 !important;
          scale: 1 !important;
          box-sizing: border-box !important;
        }
      </style>
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>كوتيشن رقم ${quoteNumber}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-content">${printContent.innerHTML}</div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  // Calculate pricing
  const grandTotal = isVATInclusive ? finalPrice : (finalPrice + (finalPrice * taxRate / 100));
  const taxAmount = isVATInclusive ? (finalPrice * taxRate / (100 + taxRate)) : (finalPrice * taxRate / 100);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Controls - Background Toggle and Print Button */}
      <div className="mb-4 flex justify-center items-center gap-4 print:hidden no-print" data-html2canvas-ignore="true">
        <div className="flex items-center gap-3 border border-yellow-600 rounded-lg px-4 py-3 bg-white">
          <span className="bg-[#cf9b46] text-[#fcfcfc] text-[15px] px-2 py-1 rounded">البريمي</span>
          <div className="relative">
            <div 
              className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${
                useAlbarimi2Background ? 'bg-yellow-600' : 'bg-yellow-200'
              }`}
              onClick={() => setUseAlbarimi2Background(!useAlbarimi2Background)}
            >
              <div 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                  useAlbarimi2Background ? 'right-1' : 'right-6'
                }`}
              />
            </div>
          </div>
          <span className="text-sm text-yellow-700 font-medium">خلفية 2</span>
        </div>
        
        <Button 
          onClick={handlePrint}
          className="bg-[#2B4C8C] hover:bg-[#1e3a6f] text-white px-6 py-2 text-sm font-medium shadow-lg"
        >
          🖨️ طباعة الكوتيشن
        </Button>
      </div>

      <div 
        ref={previewRef}
        data-pdf-export="quotation"
        className="mx-auto text-black shadow-2xl print:shadow-none border border-slate-200 overflow-hidden relative print:border-none"
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
          zoom: 1,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          colorAdjust: 'exact'
        }}
      >
        {/* Content overlay on A4 background - Start at 2.5cm from top */}
        <div className="absolute inset-0" style={{ paddingTop: '2.5cm', padding: '1cm' }}>
          
          {/* First Row: Quote Header Information */}
          <div className="flex justify-between items-center bg-white/95 p-4 rounded-lg shadow-sm mt-[55px] mb-[55px]">
            <div className="flex items-center gap-4">
              <FileText className="text-[#2B4C8C] w-6 h-6" />
              <span className="text-lg font-bold text-[#2B4C8C]">
                {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2B4C8C]">رقم العرض:</span>
                <span className="font-bold text-[#C49632]">
                  {isInvoiceMode ? invoiceNumber : quoteNumber}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2B4C8C]">تاريخ الإصدار:</span>
                <span className="text-gray-700">
                  {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2B4C8C]">تاريخ الانتهاء:</span>
                <span className="text-red-600 font-medium">
                  {validUntil.toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </div>

          {/* Second Row: Customer Information */}
          <div className="mb-6 bg-white/95 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <User className="text-[#2B4C8C] w-5 h-5" />
              <span className="text-lg font-bold text-[#2B4C8C]">
                {customerTitle} / {customerName || "غير محدد"}
              </span>
            </div>
          </div>

          {/* Third Row: Vehicle Information Box */}
          <div className="mb-6 bg-white/95 p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="text-[#2B4C8C] w-5 h-5" />
              <span className="text-lg font-bold text-[#2B4C8C]">بيانات المركبة</span>
            </div>
            
            {selectedVehicle && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                {/* First Row: Manufacturer, Category, Trim Level */}
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2B4C8C]">الصانع:</span>
                  <span className="text-gray-700">{selectedVehicle.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2B4C8C]">الفئة:</span>
                  <span className="text-gray-700">{selectedVehicle.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2B4C8C]">درجة التجهيز:</span>
                  <span className="text-gray-700">{selectedVehicle.trimLevel || "غير محدد"}</span>
                </div>
                
                {/* Second Row: Model Year, Interior Color, Exterior Color */}
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2B4C8C]">الموديل:</span>
                  <span className="text-gray-700">{selectedVehicle.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2B4C8C]">اللون الداخلي:</span>
                  <span className="text-gray-700">{selectedVehicle.interiorColor || "غير محدد"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2B4C8C]">اللون الخارجي:</span>
                  <span className="text-gray-700">{selectedVehicle.exteriorColor}</span>
                </div>
                
                {/* Third Row: Chassis Number */}
                <div className="flex justify-between col-span-3">
                  <span className="font-semibold text-[#2B4C8C]">رقم الهيكل:</span>
                  <span className="text-gray-700">{selectedVehicle.chassisNumber || "غير محدد"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Specifications Box */}
          <div className="mb-6 bg-white/95 p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="text-[#2B4C8C] w-5 h-5" />
              <span className="text-lg font-bold text-[#2B4C8C]">المواصفات التفصيلية</span>
            </div>
            
            {vehicleSpecs ? (
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#2B4C8C]">سعة المحرك:</span>
                    <span className="text-gray-700">{vehicleSpecs.engineCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#2B4C8C]">نوع الوقود:</span>
                    <span className="text-gray-700">{vehicleSpecs.fuelType || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#2B4C8C]">ناقل الحركة:</span>
                    <span className="text-gray-700">{vehicleSpecs.transmission || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#2B4C8C]">نوع الدفع:</span>
                    <span className="text-gray-700">{vehicleSpecs.drivetrain || "غير محدد"}</span>
                  </div>
                </div>
                
                {vehicleSpecs.detailedDescription && (
                  <div className="mt-4">
                    <span className="font-semibold text-[#2B4C8C] block mb-2">مواصفات إضافية:</span>
                    <div className="text-gray-700 text-xs leading-relaxed">
                      {vehicleSpecs.detailedDescription}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                لم يتم تحديد مواصفات للمركبة
              </div>
            )}
          </div>

          {/* Price Details Box */}
          <div className="mb-6 bg-white/95 p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="text-[#2B4C8C] w-5 h-5" />
              <span className="text-lg font-bold text-[#2B4C8C]">تفاصيل السعر</span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-[#2B4C8C]">السعر الأساسي:</span>
                <span className="text-gray-700">{basePrice.toLocaleString()} ريال</span>
              </div>
              
              {includeLicensePlate && (
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2B4C8C]">رسوم اللوحة:</span>
                  <span className="text-gray-700">{licensePlatePrice.toLocaleString()} ريال</span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold text-[#2B4C8C]">المجموع قبل الضريبة:</span>
                <span className="text-gray-700">{finalPrice.toLocaleString()} ريال</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-semibold text-[#2B4C8C]">ضريبة القيمة المضافة ({taxRate}%):</span>
                <span className="text-gray-700">{taxAmount.toFixed(2)} ريال</span>
              </div>
              
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span className="text-[#2B4C8C]">المجموع النهائي:</span>
                <span className="text-[#C49632]">{grandTotal.toFixed(2)} ريال</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}