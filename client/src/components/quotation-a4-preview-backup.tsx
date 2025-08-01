// Backup of the original quotation-a4-preview.tsx
// This component had parsing issues during migration
// TODO: Fix and restore original functionality
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
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {props.isInvoiceMode ? 'فاتورة' : 'عرض سعر'}
        </h2>
        <div className="text-center text-gray-600 mb-4">
          مكون عرض السعر تحت الصيانة - سيتم استعادة الوظائف الكاملة قريباً
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>رقم:</strong> {props.isInvoiceMode ? props.invoiceNumber : props.quoteNumber}
          </div>
          <div>
            <strong>العميل:</strong> {props.customerName || "غير محدد"}
          </div>
          <div>
            <strong>السعر النهائي:</strong> {props.finalPrice.toLocaleString()} ريال
          </div>
          <div>
            <strong>صالح حتى:</strong> {props.validUntil.toLocaleDateString('en-GB')}
          </div>
        </div>
      </div>
    </div>
  );
}