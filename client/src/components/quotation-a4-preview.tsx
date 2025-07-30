// Simplified version of QuotationA4Preview for migration purposes
import React from "react";
import type { Company, InventoryItem, Specification } from "@shared/schema";

interface QuotationA4PreviewProps {
  selectedCompany: Company | null;
  selectedVehicle: InventoryItem | null;
  vehicleSpecs?: Specification | null;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerTitle?: string;
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

export default function QuotationA4Preview(props: QuotationA4PreviewProps) {
  const grandTotal = props.isVATInclusive ? props.finalPrice : (props.finalPrice + (props.finalPrice * props.taxRate / 100));
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 min-h-[600px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {props.selectedCompany?.name || "شركة البريمي"}
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">
            {props.isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <div><strong>رقم:</strong> {props.isInvoiceMode ? props.invoiceNumber : props.quoteNumber}</div>
            <div><strong>التاريخ:</strong> {new Date().toLocaleDateString('ar-SA')}</div>
            <div><strong>صالح حتى:</strong> {props.validUntil.toLocaleDateString('ar-SA')}</div>
          </div>
          <div className="space-y-2">
            <div><strong>العميل:</strong> {props.customerName || "غير محدد"}</div>
            <div><strong>الهاتف:</strong> {props.customerPhone || "غير محدد"}</div>
            <div><strong>البريد:</strong> {props.customerEmail || "غير محدد"}</div>
          </div>
        </div>

        {props.selectedVehicle && (
          <div className="border border-gray-300 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">معلومات المركبة</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>الماركة:</strong> {props.selectedVehicle.manufacturer}</div>
              <div><strong>الطراز:</strong> {props.selectedVehicle.category}</div>
              <div><strong>السنة:</strong> {props.selectedVehicle.year}</div>
              <div><strong>اللون:</strong> {props.selectedVehicle.color}</div>
              <div><strong>رقم الهيكل:</strong> {props.selectedVehicle.chassisNumber}</div>
              <div><strong>الحالة:</strong> {props.selectedVehicle.status}</div>
            </div>
          </div>
        )}

        <div className="border border-gray-300 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">تفاصيل الأسعار</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>السعر الأساسي:</span>
              <span>{props.basePrice.toLocaleString()} ريال</span>
            </div>
            <div className="flex justify-between">
              <span>السعر النهائي:</span>
              <span>{props.finalPrice.toLocaleString()} ريال</span>
            </div>
            {props.includeLicensePlate && (
              <div className="flex justify-between">
                <span>رسوم اللوحة:</span>
                <span>{props.licensePlatePrice.toLocaleString()} ريال</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>المجموع الكلي:</span>
              <span>{(grandTotal + (props.includeLicensePlate ? props.licensePlatePrice : 0)).toLocaleString()} ريال</span>
            </div>
          </div>
        </div>

        {props.representativeName && (
          <div className="text-center border-t pt-4">
            <div className="text-sm text-gray-600">
              المندوب: {props.representativeName} - {props.representativePhone}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}