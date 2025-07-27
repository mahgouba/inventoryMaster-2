import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QrCode, Phone, Mail, Globe, Building } from "lucide-react";
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



  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Background Toggle Switch - RTL Design */}
      <div className="mb-4 flex justify-center items-center gap-4">
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
                <h2 className="text-base font-bold text-[#2B4C8C] print:text-black" style={{fontFamily: 'Cairo, sans-serif'}}>
                  {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
                </h2>
                <div className="text-xs text-[#1A365D] print:text-black">
                  <span className="font-semibold">رقم: </span>
                  <span className="font-bold text-[#C49632]">{isInvoiceMode ? invoiceNumber : quoteNumber}</span>
                </div>
                <div className="text-xs text-[#1A365D] print:text-black">
                  <span className="font-semibold">الإصدار: </span>
                  <span className="font-bold text-[#C49632]">{new Date().toLocaleDateString('en-GB')}</span>
                  {!isInvoiceMode && (
                    <>
                      <span className="font-semibold ml-4">صالح حتى: </span>
                      <span className="font-bold text-[#C49632]">{validUntil.toLocaleDateString('en-GB')}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Customer Information Details below header */}
              <div className="mt-4 bg-white/95 print:bg-white p-3 pt-[1px] pb-[1px] text-[13px] text-right print:border-none">
                <div className="space-y-2 text-xs">
                  <div className="text-right text-[16px] font-semibold text-[#2B4C8C] print:text-black">
                    {isInvoiceMode ? (
                      <span>بناءً على طلبكم رقم: <span className="text-[#C49632]">{invoiceNumber || quoteNumber}</span></span>
                    ) : (
                      <span>{customerTitle} / <span className="text-[#C49632]">{customerName || "غير محدد"}</span> &nbsp;&nbsp;&nbsp; الموقرين</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Vehicle Information Section */}
          <div className="mb-[11px] ml-[25px] mr-[25px]" style={{marginTop: '38px'}}>
            

            {/* Vehicle Information */}
            {selectedVehicle && (
              <div className="relative p-4 w-full mt-[166px] mb-[16px] overflow-hidden print:bg-transparent print:border-none">
                {/* Systematic Manufacturer Logo Watermark Pattern */}
                {selectedVehicle && (() => {
                  const manufacturerLogo = getManufacturerLogo(selectedVehicle.manufacturer);
                  return manufacturerLogo && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Organized grid pattern with systematic layout */}
                      <div className="grid grid-cols-4 grid-rows-3 gap-6 h-full w-full p-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                          <div key={index} className="flex items-center justify-center">
                            <img 
                              src={manufacturerLogo} 
                              alt={`${selectedVehicle.manufacturer} logo`}
                              className="w-16 h-16 object-contain opacity-20"
                              style={{
                                filter: 'sepia(1) saturate(2) hue-rotate(25deg) brightness(1.2)',
                                color: '#C79C45'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Central focal logo with golden color */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div 
                          className="w-24 h-24 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(199, 156, 69, 0.1)' }}
                        >
                          <img 
                            src={manufacturerLogo} 
                            alt={`${selectedVehicle.manufacturer} logo`}
                            className="w-20 h-20 object-contain opacity-30"
                            style={{
                              filter: 'sepia(1) saturate(2) hue-rotate(25deg) brightness(1.2)',
                              color: '#C79C45'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="relative z-10 text-xs">
                  {/* Vehicle Information Grid - Properly Aligned */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#2B4C8C] print:text-black">الصانع:</span>
                      <span className="text-right text-[#1A365D] font-medium print:text-black">{selectedVehicle.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#2B4C8C] print:text-black">الفئة:</span>
                      <span className="text-right text-[#1A365D] font-medium print:text-black">{selectedVehicle.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#2B4C8C] print:text-black">درجة التجهيز:</span>
                      <span className="text-right text-[#1A365D] font-medium print:text-black">{selectedVehicle.trimLevel || "غير محدد"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#2B4C8C] print:text-black">السنة:</span>
                      <span className="text-right text-[#C49632] font-bold print:text-black">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#2B4C8C] print:text-black">اللون الخارجي:</span>
                      <span className="text-right text-[#1A365D] font-medium print:text-black">{selectedVehicle.exteriorColor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#2B4C8C] print:text-black">اللون الداخلي:</span>
                      <span className="text-right text-[#1A365D] font-medium print:text-black">{selectedVehicle.interiorColor}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="font-semibold text-[#2B4C8C] print:text-black">رقم الهيكل:</span>
                      <span className="text-right text-[#C49632] font-bold print:text-black">{selectedVehicle.chassisNumber}</span>
                    </div>
                  </div>
                </div>
                
                {/* Detailed Specifications - Full Width Editable */}
<div className="mt-3 pt-3">
                  <div className="flex items-center justify-between mt-[-10px] mb-[-10px] pt-[0px] pb-[0px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                      className="text-xs px-2 py-1 print:hidden border-[#C49632] text-[#C49632] hover:bg-[#C49632] hover:text-white"
                    >
                      {isEditingSpecs ? "حفظ" : "تحرير"}
                    </Button>
                  </div>
                  {isEditingSpecs ? (
                    <textarea
                      value={editableSpecs}
                      onChange={(e) => setEditableSpecs(e.target.value)}
                      className="w-full h-20 p-2 text-xs text-[#1A365D] border border-[#E2E8F0] rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#C49632] focus:border-[#C49632]"
                      placeholder="اكتب المواصفات التفصيلية هنا..."
                      style={{ direction: 'rtl' }}
                    />
                  ) : (
                    <div className="text-xs text-[#1A365D] whitespace-pre-wrap max-h-20 overflow-y-auto bg-[#F8FAFC] print:bg-white print:text-black p-2 print:border-none">
                      {editableSpecs || "لا توجد مواصفات تفصيلية"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown Table */}
          <div className="print:bg-transparent border border-[#E2E8F0] rounded-lg mb-6 shadow-lg overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-5 print:bg-transparent border-b border-white print:border-white text-xs font-bold text-center">
              <div className="p-2 border-l border-white print:border-white text-[#2B4C8C] print:text-black">الكمية</div>
              <div className="p-2 border-l border-white print:border-white text-[#2B4C8C] print:text-black">السعر الفردي</div>
              <div className="p-2 border-l border-white print:border-white text-[#2B4C8C] print:text-black">الضريبة ({taxRate}%)</div>
              <div className="p-2 border-l border-white print:border-white text-[#2B4C8C] print:text-black">اللوحات</div>
              <div className="p-2 text-[#2B4C8C] print:text-black">الإجمالي</div>
            </div>
            
            {/* Table Data Row */}
            <div className="grid grid-cols-5 border-b border-white print:border-white text-xs text-center print:bg-transparent">
              <div className="p-2 border-l border-white print:border-white text-[#1A365D] print:text-black">1</div>
              <div className="p-2 border-l border-white print:border-white font-semibold text-[#1A365D] print:text-black">{basePrice.toLocaleString()}</div>
              <div className="p-2 border-l border-white print:border-white font-semibold text-[#1A365D] print:text-black">{taxAmount.toLocaleString()}</div>
              <div className="p-2 border-l border-white print:border-white font-semibold text-[#1A365D] print:text-black">
                {includeLicensePlate ? licensePlatePrice.toLocaleString() : "0"}
              </div>
              <div className="p-2 font-bold text-[#2B4C8C] print:text-black">
                {(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()}
              </div>
            </div>
            
            {/* Total Row - Third Row */}
            <div className="grid grid-cols-10 print:bg-transparent text-xs">
              <div className="p-4 text-center col-span-3">
                <div className="font-bold text-[#2B4C8C] print:text-black text-[13px]">
                  المجموع: <span className="text-[#2B4C8C] print:text-black">{(grandTotal + (includeLicensePlate ? licensePlatePrice : 0)).toLocaleString()}</span> ريال
                </div>
              </div>
              <div className="p-4 text-center col-span-7">
                <div className="text-center text-xs font-bold text-[#2B4C8C] print:text-black">
                  {numberToArabic(grandTotal + (includeLicensePlate ? licensePlatePrice : 0))} ريال سعودي لا غير
                </div>
              </div>
            </div>
          </div>

          {/* Representative Information and Terms & Conditions Section */}
          <div className="flex gap-6 mb-6">
            {/* Terms & Conditions Section - Hidden in invoice mode */}
            {!isInvoiceMode && (
              <div className="bg-white/95 print:bg-white border border-[#E2E8F0] print:border-none p-4 rounded-lg flex-1 shadow-sm">
                
                <div className="text-xs space-y-2">
                  {termsConditions.length > 0 ? (
                    termsConditions.map((term, index) => (
                      <div key={term.id} className="flex items-start gap-2">
                        <span className="text-[#C49632] print:text-black font-bold min-w-[1rem]">{index + 1}.</span>
                        <span className="leading-relaxed text-[#1A365D] print:text-black">{term.term_text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#64748B] print:text-black italic">لم يتم إضافة شروط وأحكام بعد</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Representative Information - Small box on the right - Hidden if no representative selected */}
            {representativeName && (
              <div className="bg-white/95 print:bg-white border border-[#E2E8F0] print:border-none p-3 rounded-lg shadow-sm w-64">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#2B4C8C] print:text-black">الاسم:</span>
                    <span className="text-[#1A365D] font-medium print:text-black">{representativeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#2B4C8C] print:text-black">الجوال:</span>
                    <span className="text-[#C49632] font-bold print:text-black">{representativePhone || "غير محدد"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stamp Section - Only show if companyStamp is provided */}
          {companyStamp && (
            <div className="flex justify-end mb-6">
              <img 
                src={companyStamp} 
                alt="ختم الشركة" 
                className="w-80 h-40 object-contain"
              />
            </div>
          )}


        </div>
      </div>
    </div>
  );
}