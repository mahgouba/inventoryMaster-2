import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Phone, Mail, Globe, Building } from "lucide-react";
import { numberToArabic } from "@/utils/number-to-arabic";
import type { Company, InventoryItem } from "@shared/schema";

interface QuotationA4PreviewProps {
  selectedCompany: Company | null;
  selectedVehicle: InventoryItem | null;
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
        className="mx-auto bg-white text-black shadow-2xl border border-slate-200 overflow-hidden"
        style={{
          width: '210mm',
          height: '297mm',
          fontSize: '12pt',
          fontFamily: '"Noto Sans Arabic", Arial, sans-serif',
          padding: '20mm',
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
        
        <div className="p-8 h-full">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              {selectedCompany?.logo && (
                <div className="w-20 h-20 flex items-center justify-center">
                  <img 
                    src={selectedCompany.logo} 
                    alt={selectedCompany.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedCompany?.name || "اسم الشركة"}
                </h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>س.ت: {selectedCompany?.registrationNumber || "غير محدد"}</p>
                  <p>رخصة رقم: {selectedCompany?.licenseNumber || "غير محدد"}</p>
                  <p>الرقم الضريبي: {selectedCompany?.taxNumber || "غير محدد"}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-6 h-6" />
                <span className="text-lg font-semibold">عرض سعر رقم: {quoteNumber}</span>
              </div>
              <p className="text-sm text-gray-600">
                التاريخ: {new Date().toLocaleDateString('ar-SA')}
              </p>
              <p className="text-sm text-gray-600">
                صالح حتى: {validUntil.toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Company Contact Information */}
          {selectedCompany && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{selectedCompany.address || "العنوان غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{selectedCompany.phone || "الهاتف غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{selectedCompany.email || "البريد الإلكتروني غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{selectedCompany.website || "الموقع الإلكتروني غير محدد"}</span>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Customer Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">بيانات العميل</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">الاسم: </span>
                <span>{customerName || "غير محدد"}</span>
              </div>
              <div>
                <span className="font-medium">الهاتف: </span>
                <span>{customerPhone || "غير محدد"}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium">البريد الإلكتروني: </span>
                <span>{customerEmail || "غير محدد"}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Representative Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">بيانات المندوب</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
                <span className="font-medium">البريد الإلكتروني: </span>
                <span>{representativeEmail || "غير محدد"}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Vehicle Information */}
          {selectedVehicle && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">بيانات المركبة</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Price Breakdown */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">تفاصيل السعر</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span>سعر المركبة الأساسي</span>
                <span className="font-medium">{basePrice.toLocaleString()} ريال</span>
              </div>
              
              {includeLicensePlate && (
                <div className="flex justify-between py-2">
                  <span>
                    لوحة الأرقام 
                    {licensePlateSubjectToTax && <span className="text-sm text-gray-500"> (خاضعة للضريبة)</span>}
                  </span>
                  <span className="font-medium">{licensePlatePrice.toLocaleString()} ريال</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between py-2">
                <span>المجموع الفرعي</span>
                <span className="font-medium">{totalBeforeTax.toLocaleString()} ريال</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span>ضريبة القيمة المضافة ({taxRate}%)</span>
                <span className="font-medium">{taxAmount.toLocaleString()} ريال</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between py-3 text-lg font-bold">
                <span>المجموع الكلي</span>
                <span>{grandTotal.toLocaleString()} ريال</span>
              </div>
              
              <div className="text-center text-sm text-gray-600 mt-2">
                {numberToArabic(grandTotal)} ريال سعودي لا غير
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {notes && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">ملاحظات</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{notes}</p>
            </div>
          )}

          <Separator className="my-6" />

          {/* Terms and Conditions */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">الشروط والأحكام</h2>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• هذا العرض صالح لمدة {Math.ceil((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} يوم من تاريخ الإصدار</li>
              <li>• الأسعار المذكورة شاملة لضريبة القيمة المضافة</li>
              <li>• يجب تأكيد الطلب خلال فترة صلاحية العرض</li>
              <li>• الشركة غير مسؤولة عن أي تأخير في التسليم خارج عن إرادتها</li>
              <li>• جميع المواصفات والألوان متوفرة حسب المخزون</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>نشكركم لثقتكم بنا ونتطلع لخدمتكم</p>
            <p className="mt-2">
              {selectedCompany?.name || "اسم الشركة"} - {selectedCompany?.phone || "الهاتف"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}