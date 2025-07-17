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

  // تصميم PDF مخصص حسب الشركة
  const getCompanyTheme = () => {
    if (!selectedCompany) return "default";
    
    // استخدام نظام التصميم المخصص للشركة
    return "company-custom";
  };

  const companyTheme = getCompanyTheme();

  useEffect(() => {
    const fetchTermsConditions = async () => {
      try {
        const response = await fetch('/api/terms-conditions');
        if (response.ok) {
          const terms = await response.json();
          setTermsConditions(terms);
        }
      } catch (error) {
        console.error('Error fetching terms and conditions:', error);
      }
    };
    
    fetchTermsConditions();
  }, [termsRefreshTrigger]);

  useEffect(() => {
    const fetchManufacturerLogo = async () => {
      if (selectedVehicle?.manufacturer) {
        try {
          const response = await fetch('/api/manufacturers');
          if (response.ok) {
            const manufacturers = await response.json();
            const manufacturer = manufacturers.find((m: any) => m.name === selectedVehicle.manufacturer);
            if (manufacturer?.logo) {
              setManufacturerLogo(manufacturer.logo);
            }
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
      try {
        const qrData = {
          quoteNumber: isInvoiceMode ? invoiceNumber : quoteNumber,
          customerName,
          vehicleInfo: `${selectedVehicle?.manufacturer} ${selectedVehicle?.category} ${selectedVehicle?.year}`,
          chassisNumber: selectedVehicle?.chassisNumber,
          finalPrice: finalPrice,
          company: selectedCompany?.name,
          date: new Date().toISOString().split('T')[0]
        };
        
        const qrString = JSON.stringify(qrData);
        const qrCodeURL = await QRCode.toDataURL(qrString, {
          width: 80,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeDataURL(qrCodeURL);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    
    if (quoteNumber && customerName && selectedVehicle) {
      generateQRCode();
    }
  }, [quoteNumber, invoiceNumber, customerName, selectedVehicle, finalPrice, selectedCompany, isInvoiceMode]);
  
  // Calculate tax amounts
  const vehicleSubtotal = basePrice;
  const licenseTotal = includeLicensePlate ? licensePlatePrice : 0;
  const taxableAmount = vehicleSubtotal + (licensePlateSubjectToTax ? licenseTotal : 0);
  const taxAmount = isVATInclusive ? (taxableAmount * taxRate) / (100 + taxRate) : (taxableAmount * taxRate) / 100;
  const totalBeforeTax = isVATInclusive ? taxableAmount - taxAmount : taxableAmount;
  const grandTotal = isVATInclusive ? taxableAmount : totalBeforeTax + taxAmount;

  // PDF Download function
  const downloadPDF = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Hide the download button during capture
      const downloadButton = document.querySelector('[data-download-button]') as HTMLElement;
      if (downloadButton) downloadButton.style.display = 'none';
      
      // Create canvas from the preview element
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: previewRef.current.offsetWidth,
        height: previewRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0
      });
      
      // Show the download button again
      if (downloadButton) downloadButton.style.display = '';
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename
      const filename = `${isInvoiceMode ? 'فاتورة' : 'عرض_سعر'}_${isInvoiceMode ? invoiceNumber : quoteNumber}_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800 p-4">
      {/* Download Button */}
      <div className="flex justify-center mb-4" data-download-button>
        <Button 
          onClick={downloadPDF}
          disabled={isDownloading}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Download size={20} />
          {isDownloading ? 'جاري التحميل...' : `تحميل ${isInvoiceMode ? 'الفاتورة' : 'العرض'} بصيغة PDF`}
        </Button>
      </div>
      {/* Fixed A4 Container */}
      <div 
        ref={previewRef}
        data-pdf-export="quotation"
        className="mx-auto bg-white text-black shadow-2xl border border-slate-200 overflow-hidden pl-[21.2362px] pr-[21.2362px] pt-[16.2362px] pb-[16.2362px]"
        style={{
          width: '210mm',
          height: '297mm',
          fontSize: '11pt',
          fontFamily: '"Noto Sans Arabic", Arial, sans-serif',
          padding: '8mm',
          boxSizing: 'border-box',
          direction: 'rtl',
          transform: 'scale(0.7)',
          transformOrigin: 'top center',
          marginBottom: '-30%',
        }}
      >
        {/* Mobile responsive scaling */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              div[style*="transform: scale(0.4)"] {
                transform: scale(0.28) !important;
                margin-bottom: -70% !important;
              }
            }
            @media (max-width: 480px) {
              div[style*="transform: scale(0.4)"] {
                transform: scale(0.22) !important;
                margin-bottom: -75% !important;
              }
            }
          `
        }} />
        
        {/* Large Watermark Background */}
        {selectedCompany?.logo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
            <img 
              src={selectedCompany.logo} 
              alt="Watermark" 
              className="w-80 h-80 object-contain transform rotate-12"
            />
          </div>
        )}
        
        <div className="h-full relative z-10">
          {/* Al-Barimi Design Header */}
          <div className="relative">
            {/* Main Header Section */}
            <div className="mb-6">
              {/* Company Logo */}
              {selectedCompany?.logo && (
                <div className="absolute top-2 left-6 w-20 h-20">
                  <img 
                    src={selectedCompany.logo} 
                    alt={selectedCompany.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* QR Code */}
              {qrCodeDataURL && (
                <div className="absolute top-2 right-4">
                  <img src={qrCodeDataURL} alt="QR Code" className="w-16 h-16" />
                </div>
              )}

              {/* Company Name */}
              <div className="text-center pt-6">
                <h1 className="text-xl font-bold text-black mb-4" style={{fontFamily: 'Cairo, sans-serif'}}>
                  {selectedCompany?.name || "شركة البريمي للسيارات"}
                </h1>
              </div>

              {/* Document Type */}
              <div className="absolute top-16 right-4">
                <h2 className="text-sm font-normal text-black" style={{fontFamily: 'Cairo, sans-serif'}}>
                  {isInvoiceMode ? 'فاتورة' : 'عرض سعـــر'}
                </h2>
              </div>

              {/* Company Details Row */}
              <div className="flex justify-between items-center mt-12 text-xs text-black" style={{fontFamily: 'Cairo, sans-serif'}}>
                <div className="flex gap-8">
                  {selectedCompany?.registrationNumber && (
                    <div>
                      <span>سجل تجاري رقم {selectedCompany.registrationNumber}</span>
                    </div>
                  )}
                  {selectedCompany?.taxNumber && (
                    <div>
                      <span>الرقم الضريبي {selectedCompany.taxNumber}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-8">
                  <div>
                    <span>رقم: {isInvoiceMode ? invoiceNumber : quoteNumber}</span>
                  </div>
                  <div>
                    <span>التاريخ: {new Date().toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="flex justify-between items-center mt-2 text-xs text-black" style={{fontFamily: 'Cairo, sans-serif'}}>
                <div className="flex gap-8">
                  {selectedCompany?.licenseNumber && (
                    <div>
                      <span>رخصة رقم: {selectedCompany.licenseNumber}</span>
                    </div>
                  )}
                </div>
                <div>
                  {selectedCompany?.address && (
                    <span>العنوان: {selectedCompany.address}</span>
                  )}
                </div>
              </div>

              {/* Golden Line Separator */}
              <div className="mt-4 mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              </div>
            </div>

            {/* Right Side Element */}
            <div className="absolute top-0 right-0 w-6 h-full bg-teal-700"></div>

            {/* Left Side Watermark Pattern */}
            <div className="absolute top-8 left-6 w-24 h-full opacity-10">
              <svg className="w-full h-full" viewBox="0 0 95 810" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M64.3165 1.74407C63.623 0.593049 62.1418 0.177188 60.9093 0.764579L60.4669 0.975516L60.3517 0.746024C57.945 2.22761 47.5013 8.92769 35.8624 20.2997C23.1272 32.743 8.986 50.7526 2.3497 73.6103L2.3487 73.6161L2.2726 73.9169C1.97978 75.3268 2.5883 76.7675 3.8146 77.5839L4.086 77.749L4.088 77.7499C4.6413 78.0575 5.2162 78.2069 5.7843 78.207C6.783 78.207 7.7518 77.7839 8.4523 76.9609L8.4571 76.956C11.9124 73.0113 21.8979 62.0267 34.3429 52.4755C40.5655 47.6998 47.4167 43.2712 54.3859 40.2626C61.3521 37.2553 68.4693 35.6522 75.2081 36.5702L76.8234 36.79L75.3624 37.5136C72.0751 39.1413 68.3509 41.0526 65.0489 42.9101C61.9897 44.6311 59.3262 46.2888 57.7023 47.621L61.6105 52.0077C62.5386 51.2615 63.9052 50.3682 65.5255 49.4013C67.3927 48.2872 69.6248 47.0594 71.9718 45.8242C76.6649 43.3541 81.833 40.846 85.4933 39.1445C86.5689 38.6361 87.251 37.5622 87.2511 36.4072V36.3945C87.2806 35.2421 86.5975 34.1372 85.5577 33.6318C73.2452 27.6495 59.5108 30.7077 46.6671 37.4433C33.832 44.1745 21.9908 54.5272 13.5519 62.9384L12.7433 62.3779C20.8532 44.5247 33.524 30.3683 44.2013 20.6513C49.5418 15.7911 54.3881 12.0365 57.9249 9.48138C59.6934 8.20372 61.1354 7.22646 62.1476 6.5595C62.6536 6.22604 63.0524 5.97028 63.3312 5.79388C63.3431 5.78631 63.3548 5.77869 63.3663 5.77142L63.2081 5.51849L63.5919 5.24505C64.6931 4.46194 65.0194 2.94636 64.3165 1.74407Z" fill="#00627F" />
              </svg>
            </div>
          </div>



          {/* Customer & Representative Info Cards - Al-Barimi styled */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Customer Information */}
            <div className="border border-gray-300 p-3">
              <h3 className="text-sm font-semibold mb-2 text-teal-700" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات العميل
              </h3>
              <div className="space-y-1 text-xs text-black">
                <div>
                  <span className="font-medium">الاسم: </span>
                  <span>{customerName || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-medium">الهاتف: </span>
                  <span>{customerPhone || "غير محدد"}</span>
                </div>
              </div>
            </div>

            {/* Representative Information */}
            <div className="border border-gray-300 p-3">
              <h3 className="text-sm font-semibold mb-2 text-teal-700" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات المندوب
              </h3>
              <div className="space-y-1 text-xs text-black">
                <div>
                  <span className="font-medium">الاسم: </span>
                  <span>{representativeName || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-medium">الهاتف: </span>
                  <span>{representativePhone || "غير محدد"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information - Al-Barimi styled */}
          {selectedVehicle && (
            <div className="border border-gray-300 p-3 mb-4">
              <h3 className="text-sm font-semibold mb-2 text-teal-700" style={{fontFamily: 'Cairo, sans-serif'}}>
                بيانات المركبة
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-black">
                <div className="flex items-center gap-2">
                  <span className="font-medium">الصانع: </span>
                  <div className="flex items-center gap-1">
                    {manufacturerLogo && (
                      <img 
                        src={manufacturerLogo} 
                        alt={selectedVehicle.manufacturer} 
                        className="w-5 h-5 object-contain"
                      />
                    )}
                    <span>{selectedVehicle.manufacturer}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">الفئة: </span>
                  <span>{selectedVehicle.category}</span>
                </div>
                <div>
                  <span className="font-medium">السنة: </span>
                  <span>{selectedVehicle.year}</span>
                </div>
                <div>
                  <span className="font-medium">سعة المحرك: </span>
                  <span>{selectedVehicle.engineCapacity}</span>
                </div>
                <div>
                  <span className="font-medium">اللون الخارجي: </span>
                  <span>{selectedVehicle.exteriorColor}</span>
                </div>
                <div>
                  <span className="font-medium">اللون الداخلي: </span>
                  <span>{selectedVehicle.interiorColor}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">رقم الهيكل: </span>
                  <span>{selectedVehicle.chassisNumber}</span>
                </div>
                {selectedVehicle.trimLevel && (
                  <div>
                    <span className="font-medium">الفئة التفصيلية: </span>
                    <span>{selectedVehicle.trimLevel}</span>
                  </div>
                )}
              </div>
              
              {/* Detailed Specifications */}
              {vehicleSpecs && vehicleSpecs.detailedDescription && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <h4 className="text-xs font-semibold mb-2 text-amber-600">المواصفات التفصيلية:</h4>
                  <div className="text-xs text-black whitespace-pre-wrap">
                    {vehicleSpecs.detailedDescription}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown Table - Al-Barimi styled */}
          <div className="border border-gray-300 mb-4">
            <div className="bg-teal-700 text-white p-2">
              <h3 className="text-sm font-semibold text-center" style={{fontFamily: 'Cairo, sans-serif'}}>تفاصيل السعر</h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gray-100 border-b border-gray-300 text-xs font-semibold text-center">
              <div className="p-2 border-l border-gray-300">الكمية</div>
              <div className="p-2 border-l border-gray-300">السعر الفردي</div>
              <div className="p-2 border-l border-gray-300">الضريبة ({taxRate}%)</div>
              <div className="p-2 border-l border-gray-300">اللوحات</div>
              <div className="p-2">الإجمالي</div>
            </div>
            
            {/* Table Row */}
            <div className="grid grid-cols-5 border-b border-gray-200 text-xs text-center text-black">
              <div className="p-2 border-l border-gray-200">1</div>
              <div className="p-2 border-l border-gray-200 font-medium">{basePrice.toLocaleString()}</div>
              <div className="p-2 border-l border-gray-200 font-medium">{taxAmount.toLocaleString()}</div>
              <div className="p-2 border-l border-gray-200 font-medium">
                {includeLicensePlate ? licensePlatePrice.toLocaleString() : "0"}
              </div>
              <div className="p-2 font-bold text-teal-700">
                {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()}
              </div>
            </div>
            
            {/* Total Row */}
            <div className="p-3 bg-gray-50 border-t-2 border-teal-700">
              <div className="flex justify-center">
                <div className="font-bold text-sm text-teal-700">
                  المجموع: {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()} ريال
                </div>
              </div>
              <div className="text-center text-xs mt-2 font-bold text-white px-2 py-1 bg-amber-600">
                {numberToArabic(grandTotal + (includeLicensePlate ? licensePlatePrice : 0))} ريال سعودي لا غير
              </div>
            </div>
          </div>

          {/* Terms & Conditions and Stamp Section - Al-Barimi styled */}
          <div className="flex gap-4 mb-20">
            {/* Terms & Conditions Section - Hidden in invoice mode */}
            {!isInvoiceMode && (
              <div className="border border-gray-300 p-3 flex-1">
                <h3 className="text-sm font-semibold mb-2 text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>الشروط والأحكام</h3>
                <div className="text-xs text-black space-y-1">
                  {termsConditions.length > 0 ? (
                    termsConditions.map((term, index) => (
                      <div key={term.id} className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium">{index + 1}.</span>
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
            <div className={`border border-gray-300 p-3 ${isInvoiceMode ? 'w-full' : 'w-48'}`}>
              <h3 className="text-sm font-semibold mb-2 text-center text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>
                {isInvoiceMode ? 'ختم الفاتورة' : 'لختم العرض'}
              </h3>
              <div className="border-2 border-dashed border-gray-300 h-24 flex items-center justify-center">
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

          {/* Notes Section */}
          {notes && (
            <div className="border border-gray-300 p-3 w-48 mb-4">
              <h3 className="text-sm font-semibold mb-2 text-amber-600" style={{fontFamily: 'Cairo, sans-serif'}}>ملاحظات</h3>
              <p className="text-xs text-black leading-relaxed">{notes}</p>
            </div>
          )}

          {/* Footer - Al-Barimi style */}
          <div className="absolute bottom-0 left-0 right-0">
            {/* Left side golden element */}
            <div className="absolute bottom-8 left-6 w-20 h-16 bg-amber-600"></div>
            
            {/* Main footer background */}
            <div className="w-full h-10 bg-teal-700 flex items-center justify-between px-4 text-white text-xs">
              <div className="flex items-center gap-4">
                <span>@albarimi_cars | 920033340</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">Albarimi</span>
                <span className="text-amber-400">.com</span>
              </div>
            </div>

            {/* Thanks message */}
            <div className="absolute bottom-16 left-4 text-right text-sm text-black" style={{fontFamily: 'Dubai, sans-serif'}}>
              <p>وتفضلوا بقبول فائق الاحترام،،،</p>
              <p className="font-semibold">{selectedCompany?.name || "شركة البريمي للسيارات"}</p>
            </div>

            {/* Golden shape element */}
            <div className="absolute bottom-2 left-8 w-20 h-3">
              <svg width="80" height="11" viewBox="0 0 80 11" fill="none">
                <path d="M0 0H80V11L40 5.5L0 11V0Z" fill="#C49632"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}