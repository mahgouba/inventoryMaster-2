import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Phone, Mail, Globe, Building, FileText, User, Building2, Settings, Calculator, Stamp, Car, Edit, Save, X } from "lucide-react";
import { numberToArabic } from "@/utils/number-to-arabic";
import type { Company, InventoryItem, Specification } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Extended Specification interface that includes additional properties
interface ExtendedSpecification extends Specification {
  year?: number;
  engineCapacity?: string;
  detailedDescription?: string;
}
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
  vehicleSpecs?: ExtendedSpecification | null;
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
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [editableTerms, setEditableTerms] = useState<string>("");
  
  // Initialize editableSpecs when vehicleSpecs changes
  useEffect(() => {
    if (vehicleSpecs?.detailedDescription) {
      setEditableSpecs(vehicleSpecs.detailedDescription);
    }
  }, [vehicleSpecs?.detailedDescription]);

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

  // Handle double click to start editing terms
  const handleDoubleClickTerms = () => {
    const termsText = termsConditions.map((term, index) => `${index + 1}. ${term.term_text}`).join('\n');
    setEditableTerms(termsText);
    setIsEditingTerms(true);
  };

  // Handle save terms
  const handleSaveTerms = async () => {
    try {
      // For now, we'll just show a message since terms editing would need backend support
      // In a full implementation, this would save to the database
      console.log('Saving terms:', editableTerms);
      setIsEditingTerms(false);
    } catch (error) {
      console.error('Error saving terms:', error);
    }
  };

  // Handle cancel terms editing
  const handleCancelTerms = () => {
    setIsEditingTerms(false);
    setEditableTerms('');
  };

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

  // Calculate pricing - License plates are not subject to tax
  const taxableAmount = includeLicensePlate ? (finalPrice - licensePlatePrice) : finalPrice;
  const grandTotal = isVATInclusive ? finalPrice : (taxableAmount + (taxableAmount * taxRate / 100) + (includeLicensePlate ? licensePlatePrice : 0));
  const taxAmount = isVATInclusive ? (taxableAmount * taxRate / (100 + taxRate)) : (taxableAmount * taxRate / 100);

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
          <div className="flex items-center gap-6 text-sm mt-[4.5px] mb-[2px] pt-[63px] pb-[8px]">
            <span className="font-bold text-[20px] text-[#03627f]">
              {isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
            </span>
            
            <div className="flex items-center gap-1">
              <span className="font-semibold text-black/80">
                {isInvoiceMode ? 'رقم الفاتورة:' : 'رقم العرض:'}
              </span>
              <span className="font-bold text-[#C79C45]">
                {isInvoiceMode ? invoiceNumber : quoteNumber}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="font-semibold text-black/80">الإصدار:</span>
              <span className="text-black/80">
                {new Date().toLocaleDateString('en-GB')}
              </span>
            </div>
            
            {/* Hide expiry date in invoice mode */}
            {!isInvoiceMode && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-black/80">الإنتهاء:</span>
                <span className="text-red-600 font-medium">
                  {validUntil.toLocaleDateString('en-GB')}
                </span>
              </div>
            )}
          </div>

          {/* Second Row: Customer Information */}
          <div className="mb-3 mt-[2px]">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-black/80">
                {isInvoiceMode && authorizationNumber ? 
                  `بناءً علي تعميدكم رقم : ${authorizationNumber}` : 
                  `${customerTitle} / ${customerName || "غير محدد"}`
                }
              </span>
            </div>
          </div>

          {/* Third Row: Vehicle Information */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              {selectedVehicle && getManufacturerLogo(selectedVehicle.manufacturer) ? (
                <img 
                  src={getManufacturerLogo(selectedVehicle.manufacturer)!} 
                  alt={selectedVehicle.manufacturer}
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <Building2 className="text-[#C79C45] w-5 h-5" />
              )}
              <span className="text-lg font-bold text-black/80">بيانات المركبة</span>
            </div>
            
            {selectedVehicle && (
              <div className="grid grid-cols-3 gap-2 text-sm">
                {/* First Row: Manufacturer, Category, Trim Level */}
                <div className="flex justify-between border-b border-[#C79C45] pb-1">
                  <span className="font-semibold text-black/80">الصانع:</span>
                  <span className="text-black/80">{selectedVehicle.manufacturer}</span>
                </div>
                <div className="flex justify-between border-b border-[#C79C45] pb-1">
                  <span className="font-semibold text-black/80">الفئة:</span>
                  <span className="text-black/80">{selectedVehicle.category}</span>
                </div>
                <div className="flex justify-between border-b border-[#C79C45] pb-1">
                  <span className="font-semibold text-black/80">درجة التجهيز:</span>
                  <span className="text-black/80">{selectedVehicle.trimLevel || "غير محدد"}</span>
                </div>
                
                {/* Second Row: Model Year, Interior Color, Exterior Color */}
                <div className="flex justify-between border-b border-[#C79C45] pb-1 pt-1">
                  <span className="font-semibold text-black/80">الموديل:</span>
                  <span className="text-black/80">{selectedVehicle.year}</span>
                </div>
                <div className="flex justify-between border-b border-[#C79C45] pb-1 pt-1">
                  <span className="font-semibold text-black/80">اللون الداخلي:</span>
                  <span className="text-black/80">{selectedVehicle.interiorColor || "غير محدد"}</span>
                </div>
                <div className="flex justify-between border-b border-[#C79C45] pb-1 pt-1">
                  <span className="font-semibold text-black/80">اللون الخارجي:</span>
                  <span className="text-black/80">{selectedVehicle.exteriorColor}</span>
                </div>
                
                {/* Third Row: Chassis Number */}
                <div className="flex justify-between col-span-3 pt-1">
                  <span className="font-semibold text-black/80">رقم الهيكل:</span>
                  <span className="text-black/80">{selectedVehicle.chassisNumber || "غير محدد"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Detailed Specifications Section */}
          {selectedVehicle && (
            <VehicleDetailedSpecificationsSection 
              selectedVehicle={selectedVehicle}
            />
          )}

          {/* Top Row: Terms & Conditions and Price Details (switched positions) */}
          <div className="flex gap-3 mb-3">
            {/* Terms & Conditions - 35% width */}
            <div className="w-[35%] border border-[#C79C45]/30 rounded-lg p-3 bg-white/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-[#C79C45] w-5 h-5" />
                <span className="text-lg font-bold text-black/80">الشروط والأحكام</span>
                {isEditingTerms && (
                  <div className="flex items-center gap-1 mr-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveTerms}
                      className="h-6 px-2 text-xs"
                    >
                      <Save className="w-3 h-3 ml-1" />
                      حفظ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelTerms}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="w-3 h-3 ml-1" />
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
              
              <div 
                className="space-y-1 text-xs text-black/80 max-h-32 overflow-y-auto relative group" 
                style={{ scrollbarWidth: 'thin' }}
                onDoubleClick={handleDoubleClickTerms}
              >
                {!isEditingTerms && termsConditions.length === 0 && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-4 h-4 text-[#C79C45]" />
                  </div>
                )}
                
                {isEditingTerms ? (
                  <Textarea
                    value={editableTerms}
                    onChange={(e) => setEditableTerms(e.target.value)}
                    className="min-h-[80px] text-xs resize-none border-none p-0 focus:ring-0 text-black placeholder:text-gray-500"
                    placeholder="أدخل الشروط والأحكام..."
                    autoFocus
                  />
                ) : termsConditions.length > 0 ? (
                  <div 
                    className="cursor-pointer hover:bg-gray-50 rounded p-1 -m-1"
                    title="اضغط مرتين للتحرير"
                  >
                    {termsConditions.map((term, index) => (
                      <div key={term.id} className="leading-relaxed">
                        <span className="font-semibold">{index + 1}.</span> {term.term_text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="text-center text-black/60 py-2 cursor-pointer hover:bg-gray-50 rounded"
                    title="اضغط مرتين لإضافة شروط وأحكام"
                  >
                    لم يتم إضافة شروط وأحكام
                    <div className="text-xs text-black/40 mt-1">اضغط مرتين للإضافة</div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Details - 65% width */}
            <div className="w-[65%] border border-[#C79C45]/30 rounded-lg p-3 bg-white/50">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="text-[#C79C45] w-5 h-5" />
                <span className="text-lg font-bold text-black/80">تفاصيل السعر</span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-black/80">السعر الأساسي:</span>
                  <span className="text-black/80">
                    {isVATInclusive 
                      ? (basePrice - (basePrice * taxRate / (100 + taxRate))).toLocaleString()
                      : basePrice.toLocaleString()
                    } ريال
                  </span>
                </div>
                
                {includeLicensePlate && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-black/80">رسوم اللوحة:</span>
                    <span className="text-black/80">{licensePlatePrice.toLocaleString()} ريال</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-1">
                  <span className="font-semibold text-black/80">المجموع قبل الضريبة:</span>
                  <span className="text-black/80">{finalPrice.toLocaleString()} ريال</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-semibold text-black/80">ضريبة القيمة المضافة ({taxRate}%):</span>
                  <span className="text-black/80">{taxAmount.toFixed(2)} ريال</span>
                </div>
                
                <div className="pt-1 text-lg font-bold">
                  <div className="flex justify-between">
                    <span className="text-black/80">المجموع النهائي:</span>
                    <span className="text-[#C79C45]">{grandTotal.toFixed(2)} ريال</span>
                  </div>
                  <div className="text-sm text-black/80 mt-1 text-left">
                    ({numberToArabic(Math.floor(grandTotal))})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Sales Representative and Company Stamp - Show only if data exists */}
          {(representativeName || companyStamp) && (
            <div className={`${
              representativeName && companyStamp ? 'grid grid-cols-2' : 'flex justify-center'
            } gap-3 mb-3`}>
              {/* Sales Representative - Only show if representative name exists */}
              {representativeName && (
                <div className="rounded-lg p-3 bg-white/50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="text-[#C79C45] w-5 h-5" />
                    <span className="text-lg font-bold text-black/80">مندوب المبيعات</span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-black/80">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">الاسم:</span>
                      <span>{representativeName}</span>
                    </div>
                    {representativePhone && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">الجوال:</span>
                        <span>{representativePhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Company Stamp - Only show if stamp exists */}
              {companyStamp && (
                <div className="rounded-lg p-3 bg-white/50">
                  <div className="flex items-center justify-center h-20">
                    <img 
                      src={companyStamp} 
                      alt="ختم الشركة" 
                      className="object-contain"
                      style={{ height: '4cm', width: '6cm' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Vehicle Detailed Specifications Section Component
interface VehicleDetailedSpecificationsSectionProps {
  selectedVehicle: InventoryItem;
}

function VehicleDetailedSpecificationsSection({ selectedVehicle }: VehicleDetailedSpecificationsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSpecs, setEditedSpecs] = useState('');

  // Fetch specifications from the specifications management system
  const { data: specificationsData, isLoading } = useQuery({
    queryKey: ['/api/specifications-by-chassis', selectedVehicle.chassisNumber],
    queryFn: () => 
      selectedVehicle.chassisNumber 
        ? fetch(`/api/specifications-by-chassis/${selectedVehicle.chassisNumber}`).then(res => res.ok ? res.json() : null)
        : fetch(`/api/specifications/${selectedVehicle.manufacturer}/${selectedVehicle.category || ''}/${selectedVehicle.trimLevel || 'null'}/${selectedVehicle.year}/${selectedVehicle.engineCapacity || ''}`).then(res => res.ok ? res.json() : null)
  });

  // Mutation for updating specifications
  const updateSpecsMutation = useMutation({
    mutationFn: async (newSpecs: string) => {
      if (!specificationsData?.id) {
        throw new Error('لا يمكن العثور على معرف المواصفات');
      }
      
      const response = await fetch(`/api/vehicle-specifications/${specificationsData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specifications: newSpecs
        }),
      });
      
      if (!response.ok) {
        throw new Error('فشل في حفظ المواصفات');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/specifications-by-chassis', selectedVehicle.chassisNumber] });
      setIsEditing(false);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث المواصفات التفصيلية",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Format specifications for display - show only raw specifications data
  const formatSpecifications = (specs: any) => {
    if (!specs || typeof specs !== 'object') return null;
    
    const formatted: string[] = [];
    
    // Look for raw specifications text in different possible formats
    if (specs.specifications) {
      // If there's a specifications field, display it as is
      if (typeof specs.specifications === 'string') {
        return specs.specifications;
      }
      if (typeof specs.specifications === 'object') {
        return JSON.stringify(specs.specifications, null, 2);
      }
    }
    
    // If specs is directly the content, display it
    if (typeof specs === 'string') {
      return specs;
    }
    
    // Look for any meaningful content in the object
    Object.entries(specs).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value !== 'غير محدد' && value !== 'غير متوفر') {
        formatted.push(`• ${key}: ${value}`);
      }
    });
    
    return formatted.length > 0 ? formatted.join('\n') : null;
  };

  if (isLoading) {
    return (
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Car className="text-[#C79C45] w-5 h-5" />
          <span className="text-lg font-bold text-black/80">المواصفات التفصيلية</span>
        </div>
        <div className="border border-[#C79C45]/30 rounded-lg p-3 bg-white/50">
          <div className="text-center text-sm text-black/60 py-2">
            جاري تحميل المواصفات التفصيلية...
          </div>
        </div>
      </div>
    );
  }

  // Get raw specifications data and handle different formats
  const getSpecsText = () => {
    const specs = specificationsData?.specifications;
    if (!specs) return null;
    
    // If it's a string, return it directly
    if (typeof specs === 'string') {
      return specs;
    }
    
    // If it's an object, look for the original text content
    if (typeof specs === 'object') {
      // Look for "المواصفات العامة" field first
      if (specs['المواصفات العامة']) {
        return specs['المواصفات العامة'];
      }
      
      // Otherwise, return the first non-empty string value found
      for (const [key, value] of Object.entries(specs)) {
        if (typeof value === 'string' && value.trim() && value !== 'غير محدد' && value !== 'غير متوفر') {
          return value;
        }
      }
    }
    
    return null;
  };

  const rawSpecsText = getSpecsText();

  // Handle double click to start editing
  const handleDoubleClick = () => {
    if (specificationsData?.id) {
      setEditedSpecs(rawSpecsText || '');
      setIsEditing(true);
    }
  };

  // Handle save
  const handleSave = () => {
    updateSpecsMutation.mutate(editedSpecs);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setEditedSpecs('');
  };
  
  return (
    <div className="mb-3">
      {isEditing && (
        <div className="flex items-center gap-1 mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={updateSpecsMutation.isPending}
            className="h-6 px-2 text-xs"
          >
            <Save className="w-3 h-3 ml-1" />
            حفظ
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 ml-1" />
            إلغاء
          </Button>
        </div>
      )}
      
      <div 
        className="border border-[#C79C45]/30 rounded-lg p-3 bg-white/50 relative group"
        onDoubleClick={handleDoubleClick}
      >
        {!isEditing && !rawSpecsText && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="w-4 h-4 text-[#C79C45]" />
          </div>
        )}
        
        {isEditing ? (
          <Textarea
            value={editedSpecs}
            onChange={(e) => setEditedSpecs(e.target.value)}
            className="min-h-[80px] text-xs resize-none border-none p-0 focus:ring-0 text-black placeholder:text-gray-500"
            placeholder="أدخل المواصفات التفصيلية..."
            autoFocus
          />
        ) : rawSpecsText ? (
          <div 
            className="text-xs text-black/80 leading-relaxed max-h-32 overflow-y-auto cursor-pointer hover:bg-gray-50 rounded p-1 -m-1" 
            style={{ scrollbarWidth: 'thin' }}
            title="اضغط مرتين للتحرير"
          >
            {rawSpecsText}
          </div>
        ) : (
          <div 
            className="text-center text-sm text-black/60 py-2 cursor-pointer hover:bg-gray-50 rounded"
            title="اضغط مرتين لإضافة مواصفات"
          >
            لم يتم إدراج مواصفات تفصيلية لهذه المركبة بعد
            <div className="text-xs text-black/40 mt-1">اضغط مرتين لإضافة مواصفات</div>
          </div>
        )}
      </div>
    </div>
  );
}