import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Phone, Mail, Globe, Building } from "lucide-react";
import { numberToArabic } from "@/utils/number-to-arabic";
import type { Company, InventoryItem, Specification } from "@shared/schema";

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
  notes
}: QuotationA4PreviewProps) {
  
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
        className="mx-auto bg-white text-black shadow-2xl border border-slate-200 overflow-hidden"
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
        
        <div className="h-full">
          {/* Modern Header Section - Custom brand colors */}
          <div className="relative text-white p-4 mb-3 rounded-lg" style={{background: 'linear-gradient(to right, #00627F, #004B5C)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedCompany?.logo && (
                  <div className="w-14 h-14 bg-white rounded-full p-2 flex items-center justify-center">
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
                  <p className="text-blue-100 text-xs">
                    {selectedCompany?.address || "العنوان"}
                  </p>
                </div>
              </div>
              
              <div className="text-right text-sm">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <h2 className="text-lg font-bold mb-1">عرض سعر</h2>
                  <p className="text-blue-100 text-xs">رقم: {quoteNumber}</p>
                  <p className="text-blue-100 text-xs">التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                  <p className="text-blue-100 text-xs">صالح حتى: {validUntil.toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </div>
            
            {/* Contact Info Strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm p-2 rounded-b-lg">
              <div className="flex justify-between items-center text-xs text-blue-100">
                <div className="flex items-center gap-3">
                  {selectedCompany?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={10} />
                      <span>{selectedCompany.phone}</span>
                    </div>
                  )}
                  {selectedCompany?.email && (
                    <div className="flex items-center gap-1">
                      <Mail size={10} />
                      <span>{selectedCompany.email}</span>
                    </div>
                  )}
                  {selectedCompany?.website && (
                    <div className="flex items-center gap-1">
                      <Globe size={10} />
                      <span>{selectedCompany.website}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {selectedCompany?.registrationNumber && (
                    <span>س.ت: {selectedCompany.registrationNumber}</span>
                  )}
                  {selectedCompany?.taxNumber && (
                    <span>الرقم الضريبي: {selectedCompany.taxNumber}</span>
                  )}
                </div>
              </div>
            </div>
          </div>



          {/* Customer & Representative Info Cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Customer Information */}
            <div className="border border-slate-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2" style={{color: '#00627F'}}>بيانات العميل</h3>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-medium">الاسم: </span>
                  <span>{customerName || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-medium">الهاتف: </span>
                  <span>{customerPhone || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-medium">البريد: </span>
                  <span>{customerEmail || "غير محدد"}</span>
                </div>
              </div>
            </div>

            {/* Representative Information */}
            <div className="border border-slate-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2" style={{color: '#00627F'}}>بيانات المندوب</h3>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-medium">الاسم: </span>
                  <span>{representativeName || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-medium">المنصب: </span>
                  <span>{representativePosition || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-medium">الهاتف: </span>
                  <span>{representativePhone || "غير محدد"}</span>
                </div>
                <div>
                  <span className="font-medium">البريد: </span>
                  <span>{representativeEmail || "غير محدد"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          {selectedVehicle && (
            <div className="border border-slate-200 rounded-lg p-3 mb-3">
              <h3 className="text-sm font-semibold mb-2" style={{color: '#BF9231'}}>بيانات المركبة</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">الصانع: </span>
                  <span>{selectedVehicle.manufacturer}</span>
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
              {vehicleSpecs && (
                <div className="mt-3 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-semibold mb-2" style={{color: '#BF9231'}}>المواصفات التفصيلية</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="font-medium">نوع المحرك: </span>
                      <span>{vehicleSpecs.engineType || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">القوة الحصانية: </span>
                      <span>{vehicleSpecs.horsepower || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">ناقل الحركة: </span>
                      <span>{vehicleSpecs.transmission || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">نوع الوقود: </span>
                      <span>{vehicleSpecs.fuelType || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">استهلاك الوقود: </span>
                      <span>{vehicleSpecs.fuelConsumption || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">نوع الدفع: </span>
                      <span>{vehicleSpecs.drivetrain || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">نوع الإطارات: </span>
                      <span>{vehicleSpecs.tireSize || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">الأبعاد: </span>
                      <span>{vehicleSpecs.dimensions || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">الوزن: </span>
                      <span>{vehicleSpecs.weight || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">سعة التحميل: </span>
                      <span>{vehicleSpecs.loadCapacity || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">عدد المقاعد: </span>
                      <span>{vehicleSpecs.seatingCapacity || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">نوع التعليق: </span>
                      <span>{vehicleSpecs.suspension || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">التسارع: </span>
                      <span>{vehicleSpecs.acceleration || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">السرعة القصوى: </span>
                      <span>{vehicleSpecs.topSpeed || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">أنظمة الأمان: </span>
                      <span>{vehicleSpecs.safetyFeatures || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">أنظمة الترفيه: </span>
                      <span>{vehicleSpecs.infotainment || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">معدات إضافية: </span>
                      <span>{vehicleSpecs.additionalEquipment || "غير محدد"}</span>
                    </div>
                    <div>
                      <span className="font-medium">الضمان: </span>
                      <span>{vehicleSpecs.warranty || "غير محدد"}</span>
                    </div>
                    {vehicleSpecs.notes && (
                      <div className="col-span-2">
                        <span className="font-medium">ملاحظات: </span>
                        <span>{vehicleSpecs.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown Table - Following Albarimi style */}
          <div className="border border-slate-200 rounded-lg mb-3">
            <div className="text-white p-2 rounded-t-lg" style={{backgroundColor: '#00627F'}}>
              <h3 className="text-sm font-semibold text-center">تفاصيل السعر</h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gray-100 border-b border-gray-300 text-xs font-semibold text-center">
              <div className="p-2 border-l border-gray-300">الموديل</div>
              <div className="p-2 border-l border-gray-300">الكمية</div>
              <div className="p-2 border-l border-gray-300">السعر الفردي</div>
              <div className="p-2 border-l border-gray-300">الضريبة ({taxRate}%)</div>
              <div className="p-2">الإجمالي</div>
            </div>
            
            {/* Table Row */}
            <div className="grid grid-cols-5 border-b border-gray-200 text-xs text-center">
              <div className="p-2 border-l border-gray-200 font-medium">
                {selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.manufacturer} ${selectedVehicle.category}` : "المركبة المحددة"}
              </div>
              <div className="p-2 border-l border-gray-200">1</div>
              <div className="p-2 border-l border-gray-200 font-medium">{basePrice.toLocaleString()}</div>
              <div className="p-2 border-l border-gray-200 font-medium">{taxAmount.toLocaleString()}</div>
              <div className="p-2 font-bold" style={{color: '#00627F'}}>{grandTotal.toLocaleString()}</div>
            </div>
            
            {/* License Plate Row if included */}
            {includeLicensePlate && (
              <div className="grid grid-cols-5 border-b border-gray-200 text-xs text-center">
                <div className="p-2 border-l border-gray-200 font-medium">لوحة الأرقام</div>
                <div className="p-2 border-l border-gray-200">1</div>
                <div className="p-2 border-l border-gray-200 font-medium">{licensePlatePrice.toLocaleString()}</div>
                <div className="p-2 border-l border-gray-200 font-medium">
                  {licensePlateSubjectToTax ? Math.round(licensePlatePrice * taxRate / 100).toLocaleString() : "0"}
                </div>
                <div className="p-2 font-medium">{(licensePlatePrice + (licensePlateSubjectToTax ? Math.round(licensePlatePrice * taxRate / 100) : 0)).toLocaleString()}</div>
              </div>
            )}
            
            {/* Total Row */}
            <div className="p-3 rounded-b-lg" style={{backgroundColor: '#f8fafc', borderTop: '2px solid #00627F'}}>
              <div className="flex justify-center">
                <div className="text-lg font-bold" style={{color: '#00627F'}}>
                  المجموع: {grandTotal.toLocaleString()} ريال
                </div>
              </div>
              <div className="text-center text-xs text-gray-600 mt-2">
                {numberToArabic(grandTotal)} ريال سعودي لا غير
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {notes && (
            <div className="border border-slate-200 rounded-lg p-3 mb-3">
              <h3 className="text-sm font-semibold mb-2" style={{color: '#BF9231'}}>ملاحظات</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{notes}</p>
            </div>
          )}

          {/* Terms and Conditions - Following Albarimi style */}
          <div className="border border-slate-200 rounded-lg p-3 mb-3">
            <h3 className="text-sm font-semibold mb-2" style={{color: '#00627F'}}>الشروط والأحكام</h3>
            <div className="space-y-1 text-xs text-gray-700">
              <p>• التسليم بمستودعاتنا</p>
              <p>• السيارة مضمونة لدى الوكيل العام بالمملكة العربية السعودية</p>
              <p>• السعر يشمل ضريبة القيمة المضافة واللوحات والاستمارة</p>
              <p>• هذا العرض صالح حتى {validUntil.toLocaleDateString('ar-SA')}</p>
            </div>
          </div>

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