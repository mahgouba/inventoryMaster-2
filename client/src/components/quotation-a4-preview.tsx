import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Phone, Mail, Globe, Building } from "lucide-react";
import { numberToArabic } from "@/utils/number-to-arabic";
import type { Company, InventoryItem, Specification } from "@shared/schema";
import QRCode from "qrcode";

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

  // تصميم PDF مخصص حسب الشركة
  const getCompanyTheme = () => {
    if (!selectedCompany) return "default";
    
    // تصميم مختلف كليا للشركتين
    if (selectedCompany.name === "معرض نخبة البريمي للسيارات") {
      return "elite-modern";
    } else if (selectedCompany.name === "شركة معرض البريمي للسيارات") {
      return "classic-corporate";
    }
    return "default";
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

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800 p-4">
      {/* Fixed A4 Container */}
      <div 
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
          {/* Company-Specific Header Design */}
          {companyTheme === "elite-modern" ? (
            /* تصميم عصري لمعرض نخبة البريمي - تدرج بنفسجي/ذهبي */
            <div className="relative text-white p-4 rounded-lg pl-[38px] pr-[38px] ml-[-41px] mr-[-41px] mt-[-23px] mb-[-23px]" 
                 style={{background: 'linear-gradient(45deg, #6B46C1, #8B5CF6, #D97706)'}}>
              <div className="flex items-center justify-between pt-[6px] pb-[6px]">
                <div className="flex items-center gap-4">
                  {selectedCompany?.logo && (
                    <div className="w-16 h-16 bg-white/90 rounded-xl p-2 shadow-lg">
                      <img 
                        src={selectedCompany.logo} 
                        alt={selectedCompany.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold mb-1 text-yellow-100">
                      {selectedCompany?.name || "اسم الشركة"}
                    </h1>
                    <p className="text-purple-100 text-sm mb-2">
                      {selectedCompany?.address || "العنوان"}
                    </p>
                    <div className="space-y-1 text-xs text-purple-100">
                      {selectedCompany?.registrationNumber && (
                        <p>🏢 رقم السجل التجاري: {selectedCompany.registrationNumber}</p>
                      )}
                      {selectedCompany?.taxNumber && (
                        <p>💰 الرقم الضريبي: {selectedCompany.taxNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {qrCodeDataURL && (
                    <div className="bg-white rounded-xl p-3 shadow-lg">
                      <img src={qrCodeDataURL} alt="QR Code" className="w-20 h-20" />
                    </div>
                  )}
                  <div className="text-right bg-white/20 backdrop-blur rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-1 text-yellow-200">
                      {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
                    </h2>
                    <p className="text-purple-100 text-sm">
                      رقم: {isInvoiceMode ? invoiceNumber : quoteNumber}
                    </p>
                    <p className="text-purple-100 text-sm">
                      التاريخ: {new Date().toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-600 to-orange-600 p-2 rounded-b-lg">
                <div className="flex justify-between items-center text-xs text-white">
                  <div className="flex items-center gap-4">
                    {selectedCompany?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>{selectedCompany.phone}</span>
                      </div>
                    )}
                    {selectedCompany?.email && (
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span>{selectedCompany.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : companyTheme === "classic-corporate" ? (
            /* تصميم كلاسيكي للشركة الثانية - أزرق/رمادي محافظ */
            <div className="relative text-gray-800 border-2 border-gray-300 rounded-lg p-4 bg-white pl-[38px] pr-[38px] ml-[-41px] mr-[-41px] mt-[-23px] mb-[-23px]">
              <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
                <div className="flex items-center gap-6">
                  {selectedCompany?.logo && (
                    <div className="w-20 h-20 border-2 border-gray-300 rounded p-2">
                      <img 
                        src={selectedCompany.logo} 
                        alt={selectedCompany.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-800" style={{fontFamily: 'serif'}}>
                      {selectedCompany?.name || "اسم الشركة"}
                    </h1>
                    <p className="text-gray-600 text-base mb-2">
                      {selectedCompany?.address || "العنوان"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      {selectedCompany?.registrationNumber && (
                        <p>رقم السجل: {selectedCompany.registrationNumber}</p>
                      )}
                      {selectedCompany?.taxNumber && (
                        <p>الرقم الضريبي: {selectedCompany.taxNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {qrCodeDataURL && (
                    <div className="border-2 border-gray-300 rounded p-2">
                      <img src={qrCodeDataURL} alt="QR Code" className="w-16 h-16" />
                    </div>
                  )}
                  <div className="text-right border-2 border-blue-200 bg-blue-50 rounded p-4">
                    <h2 className="text-2xl font-bold mb-2 text-blue-800">
                      {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
                    </h2>
                    <p className="text-gray-700 text-sm">
                      رقم: {isInvoiceMode ? invoiceNumber : quoteNumber}
                    </p>
                    <p className="text-gray-700 text-sm">
                      التاريخ: {new Date().toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    {selectedCompany?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        <span>{selectedCompany.phone}</span>
                      </div>
                    )}
                    {selectedCompany?.email && (
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{selectedCompany.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* التصميم الافتراضي */
            <div className="relative text-white p-4 rounded-lg pl-[38px] pr-[38px] ml-[-41px] mr-[-41px] mt-[-23px] mb-[-23px]" 
                 style={{background: 'linear-gradient(to right, #00627F, #004B5C)'}}>
              <div className="flex items-center justify-between pt-[6px] pb-[6px]">
                <div className="flex items-center gap-4">
                  {selectedCompany?.logo && (
                    <div className="w-14 h-14 bg-white rounded-full p-2">
                      <img 
                        src={selectedCompany.logo} 
                        alt={selectedCompany.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold mb-1">
                      {selectedCompany?.name || "اسم الشركة"}
                    </h1>
                    <p className="text-blue-100 text-xs mb-1">
                      {selectedCompany?.address || "العنوان"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {qrCodeDataURL && (
                    <div className="bg-white rounded-lg p-2">
                      <img src={qrCodeDataURL} alt="QR Code" className="w-16 h-16" />
                    </div>
                  )}
                  <div className="text-right">
                    <h2 className="text-lg font-bold mb-1">
                      {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
                    </h2>
                    <p className="text-blue-100 text-xs">
                      رقم: {isInvoiceMode ? invoiceNumber : quoteNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Customer & Representative Info Cards - Company themed */}
          <div className="grid grid-cols-2 gap-3 pt-[-13px] pb-[-13px] mt-[-21px] mb-[-21px]">
            {/* Customer Information */}
            <div className={`rounded-lg p-3 mt-[27px] mb-[27px] ${
              companyTheme === "elite-modern" 
                ? "border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-orange-50"
                : companyTheme === "classic-corporate"
                ? "border-2 border-gray-300 bg-gray-50"
                : "border border-slate-200"
            }`}>
              <h3 className={`text-sm font-semibold mb-2 ${
                companyTheme === "elite-modern" 
                  ? "text-purple-700"
                  : companyTheme === "classic-corporate"
                  ? "text-gray-800"
                  : ""
              }`} style={{color: companyTheme === "default" ? '#00627F' : ''}}>
                👤 بيانات العميل
              </h3>
              <div className="space-y-1 text-xs">
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
            <div className={`rounded-lg p-3 mt-[27px] mb-[27px] ${
              companyTheme === "elite-modern" 
                ? "border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-orange-50"
                : companyTheme === "classic-corporate"
                ? "border-2 border-gray-300 bg-gray-50"
                : "border border-slate-200"
            }`}>
              <h3 className={`text-sm font-semibold mb-2 ${
                companyTheme === "elite-modern" 
                  ? "text-purple-700"
                  : companyTheme === "classic-corporate"
                  ? "text-gray-800"
                  : ""
              }`} style={{color: companyTheme === "default" ? '#00627F' : ''}}>
                👨‍💼 بيانات المندوب
              </h3>
              <div className="space-y-1 text-xs">
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

          {/* Vehicle Information - Company themed */}
          {selectedVehicle && (
            <div className={`rounded-lg p-3 mb-3 pt-[2px] pb-[2px] pl-[2px] pr-[2px] ${
              companyTheme === "elite-modern" 
                ? "border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50"
                : companyTheme === "classic-corporate"
                ? "border-2 border-blue-300 bg-blue-50"
                : "border border-slate-200"
            }`}>
              <h3 className={`text-sm font-semibold mb-2 ${
                companyTheme === "elite-modern" 
                  ? "text-orange-700"
                  : companyTheme === "classic-corporate"
                  ? "text-blue-800"
                  : ""
              }`} style={{color: companyTheme === "default" ? '#BF9231' : ''}}>
                🚗 بيانات المركبة
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
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
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <h4 className="text-xs font-semibold mb-2" style={{color: '#BF9231'}}>📋 المواصفات التفصيلية:</h4>
                  <div className="text-xs text-gray-700 whitespace-pre-wrap">
                    {vehicleSpecs.detailedDescription}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown Table - Company themed */}
          <div className={`rounded-lg mb-3 ${
            companyTheme === "elite-modern" 
              ? "border-2 border-purple-200"
              : companyTheme === "classic-corporate"
              ? "border-2 border-gray-400"
              : "border border-slate-200"
          }`}>
            <div className={`text-white p-2 rounded-t-lg ${
              companyTheme === "elite-modern" 
                ? "bg-gradient-to-r from-purple-600 to-orange-600"
                : companyTheme === "classic-corporate"
                ? "bg-gray-700"
                : ""
            }`} style={{backgroundColor: companyTheme === "default" ? '#00627F' : ''}}>
              <h3 className="text-sm font-semibold text-center">💰 تفاصيل السعر</h3>
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
            <div className="grid grid-cols-5 border-b border-gray-200 text-xs text-center">
              <div className="p-2 border-l border-gray-200">1</div>
              <div className="p-2 border-l border-gray-200 font-medium">{basePrice.toLocaleString()}</div>
              <div className="p-2 border-l border-gray-200 font-medium">{taxAmount.toLocaleString()}</div>
              <div className="p-2 border-l border-gray-200 font-medium">
                {includeLicensePlate ? licensePlatePrice.toLocaleString() : "0"}
              </div>
              <div className="p-2 font-bold" style={{color: '#00627F'}}>
                {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()}
              </div>
            </div>
            

            

            
            {/* Total Row */}
            <div className="p-3 rounded-b-lg bg-[#bf9231] pl-[0px] pr-[0px] pt-[7px] pb-[7px]" style={{backgroundColor: '#f8fafc', borderTop: '2px solid #00627F'}}>
              <div className="flex justify-center">
                <div className="font-bold text-[14px]" style={{color: '#00627F'}}>
                  المجموع: {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()} ريال
                </div>
              </div>
              <div className="text-center text-xs mt-2 font-bold text-[#ffffff]">
                {numberToArabic(grandTotal + (includeLicensePlate ? licensePlatePrice : 0))} ريال سعودي لا غير
              </div>
            </div>
          </div>

          {/* Terms & Conditions and Stamp Section */}
          <div className="flex gap-4 mb-3">
            {/* Terms & Conditions Section - Hidden in invoice mode */}
            {!isInvoiceMode && (
              <div className="border border-slate-200 rounded-lg p-3 flex-1">
                <h3 className="text-sm font-semibold mb-2" style={{color: '#BF9231'}}>الشروط والأحكام</h3>
                <div className="text-xs text-gray-700 space-y-1">
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
            <div className={`border border-slate-200 rounded-lg p-3 ${isInvoiceMode ? 'w-full' : 'w-48'}`}>
              <h3 className="text-sm font-semibold mb-2 text-center" style={{color: '#BF9231'}}>
                {isInvoiceMode ? 'ختم الفاتورة' : 'لختم العرض'}
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center mt-[20px] mb-[20px]">
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
            <div className="border border-slate-200 rounded-lg p-3 w-48 pt-[2px] pb-[2px] pl-[2px] pr-[2px]">
              <h3 className="text-sm font-semibold mb-2" style={{color: '#BF9231'}}>ملاحظات</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{notes}</p>
            </div>
          )}

          {/* Footer - Albarimi style */}
          <div className="text-center pt-4">
            <div className="pt-3" style={{borderTop: '2px solid #BF9231'}}>
              <p className="text-sm text-gray-600 mb-2">وتفضلوا بقبول فائق الاحترام،،،</p>
              <p className="text-lg font-bold" style={{color: '#00627F'}}>{selectedCompany?.name || "اسم الشركة"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}