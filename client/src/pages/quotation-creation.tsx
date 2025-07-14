import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  FileText, 
  Settings, 
  Building2, 
  User, 
  Palette,
  Save,
  Eye,
  Upload,
  Plus,
  Edit3,
  Trash2,
  QrCode,
  Search,
  Calculator,
  Printer
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import type { InventoryItem, Specification, InsertQuotation } from "@shared/schema";

interface QuotationCreationPageProps {
  vehicleData?: InventoryItem;
}

interface CompanyData {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
}

interface RepresentativeData {
  name: string;
  phone: string;
  email: string;
  position: string;
}

interface QuoteAppearance {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoPosition: 'left' | 'center' | 'right';
  showCompanyInfo: boolean;
  showRepresentativeInfo: boolean;
}

interface PricingDetails {
  basePrice: number;
  quantity: number;
  licensePlatePrice: number;
  includeLicensePlate: boolean;
  licensePlateSubjectToTax: boolean;
  taxRate: number;
  isVATInclusive: boolean;
}

export default function QuotationCreationPage({ vehicleData }: QuotationCreationPageProps) {
  const { companyName, companyLogo, darkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Parse vehicle data from localStorage if not provided as prop
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryItem | null>(() => {
    if (vehicleData) return vehicleData;
    
    const storedVehicle = localStorage.getItem('selectedVehicleForQuote');
    if (storedVehicle) {
      try {
        return JSON.parse(storedVehicle);
      } catch (error) {
        console.error('Error parsing stored vehicle data:', error);
      }
    }
    return null;
  });
  
  // Form states
  const [quoteNumber, setQuoteNumber] = useState<string>(`Q-${Date.now()}`);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [validityDays, setValidityDays] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");
  
  // Management windows states
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  const [companyDataOpen, setCompanyDataOpen] = useState(false);
  const [representativeOpen, setRepresentativeOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [quotesViewOpen, setQuotesViewOpen] = useState(false);
  const [vehicleEditOpen, setVehicleEditOpen] = useState(false);
  const [editableVehicle, setEditableVehicle] = useState<InventoryItem | null>(selectedVehicle);
  
  // Data states
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: companyName || "شركة السيارات المتقدمة",
    logo: companyLogo || "",
    address: "الرياض، المملكة العربية السعودية",
    phone: "+966 11 123 4567",
    email: "info@company.com",
    website: "www.company.com",
    taxNumber: "123456789"
  });
  
  const [representativeData, setRepresentativeData] = useState<RepresentativeData>({
    name: "أحمد محمد",
    phone: "+966 50 123 4567",
    email: "ahmed@company.com",
    position: "مدير المبيعات"
  });
  
  const [quoteAppearance, setQuoteAppearance] = useState<QuoteAppearance>({
    primaryColor: "#0F172A",
    secondaryColor: "#64748B",
    fontFamily: "Noto Sans Arabic",
    logoPosition: "right",
    showCompanyInfo: true,
    showRepresentativeInfo: true
  });

  const [pricingDetails, setPricingDetails] = useState<PricingDetails>({
    basePrice: selectedVehicle?.price || 0,
    quantity: 1,
    licensePlatePrice: 500,
    includeLicensePlate: true,
    licensePlateSubjectToTax: false,
    taxRate: 15,
    isVATInclusive: false
  });

  // Generate QR code data
  const generateQRData = () => {
    return `Quote: ${quoteNumber}\nCustomer: ${customerName}\nVehicle: ${selectedVehicle?.manufacturer} ${selectedVehicle?.category}\nDate: ${new Date().toLocaleDateString('en-US')}`;
  };

  // Get vehicle specifications
  const { data: specifications = [] } = useQuery<Specification[]>({
    queryKey: ["/api/specifications"],
    enabled: !!selectedVehicle
  });

  // Get manufacturer data with logo
  const { data: manufacturers = [] } = useQuery<Array<{
    id: number;
    name: string;
    logo: string | null;
  }>>({
    queryKey: ["/api/manufacturers"],
    enabled: !!selectedVehicle
  });

  // Find manufacturer logo
  const manufacturerData = manufacturers.find(m => m.name === selectedVehicle?.manufacturer);

  // Get vehicle specifications for selected vehicle
  const vehicleSpecs = specifications.find(spec => 
    spec.manufacturer === editableVehicle?.manufacturer &&
    spec.category === editableVehicle?.category &&
    spec.trimLevel === editableVehicle?.trimLevel &&
    spec.year === editableVehicle?.year &&
    spec.engineCapacity === editableVehicle?.engineCapacity
  );

  // Get all quotations for viewing
  const { data: quotations = [] } = useQuery({
    queryKey: ["/api/quotations"],
  });

  // Calculate pricing
  const calculateTotals = () => {
    const baseTotal = pricingDetails.basePrice * pricingDetails.quantity;
    const licensePlateTotal = pricingDetails.includeLicensePlate ? pricingDetails.licensePlatePrice : 0;
    
    let subtotal = baseTotal;
    let taxableAmount = baseTotal;
    
    if (pricingDetails.includeLicensePlate) {
      subtotal += licensePlateTotal;
      if (pricingDetails.licensePlateSubjectToTax) {
        taxableAmount += licensePlateTotal;
      }
    }
    
    let taxAmount = 0;
    let finalTotal = 0;
    
    if (pricingDetails.isVATInclusive) {
      // VAT is included in the price
      taxAmount = (taxableAmount * pricingDetails.taxRate) / (100 + pricingDetails.taxRate);
      finalTotal = subtotal;
    } else {
      // VAT is added to the price
      taxAmount = (taxableAmount * pricingDetails.taxRate) / 100;
      finalTotal = subtotal + taxAmount;
    }
    
    return {
      subtotal,
      taxAmount,
      finalTotal,
      licensePlateTotal
    };
  };

  // Update editable vehicle when selected vehicle changes
  React.useEffect(() => {
    if (selectedVehicle) {
      setEditableVehicle(selectedVehicle);
      setPricingDetails(prev => ({ ...prev, basePrice: selectedVehicle.price || 0 }));
    }
  }, [selectedVehicle]);

  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: async (data: InsertQuotation) => {
      const response = await apiRequest('/api/quotations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء عرض السعر",
        description: "تم إنشاء عرض السعر بنجاح ويمكنك الآن طباعته أو إرساله للعميل",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      // Navigate back to previous page
      navigate('/card-view');
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء عرض السعر",
        description: "حدث خطأ أثناء إنشاء عرض السعر. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const handleSaveQuotation = () => {
    if (!editableVehicle || !customerName.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى التأكد من اختيار السيارة وإدخال اسم العميل",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();

    const quotationData: InsertQuotation = {
      quoteNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      vehicleManufacturer: editableVehicle.manufacturer,
      vehicleCategory: editableVehicle.category,
      vehicleTrimLevel: editableVehicle.trimLevel,
      vehicleYear: editableVehicle.year,
      vehicleEngineCapacity: editableVehicle.engineCapacity,
      vehicleExteriorColor: editableVehicle.exteriorColor,
      vehicleInteriorColor: editableVehicle.interiorColor,
      vehicleChassisNumber: editableVehicle.chassisNumber,
      basePrice: pricingDetails.basePrice,
      finalPrice: totals.finalTotal,
      validityDays,
      status: "مسودة",
      notes: notes.trim(),
      companyData: JSON.stringify(companyData),
      representativeData: JSON.stringify(representativeData),
      quoteAppearance: JSON.stringify(quoteAppearance),
      pricingDetails: JSON.stringify(pricingDetails),
      qrCodeData: generateQRData()
    };

    createQuotationMutation.mutate(quotationData);
  };

  if (!editableVehicle) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText size={48} className="mx-auto text-slate-400 mb-4" />
              <h2 className="text-xl font-semibold text-slate-600 mb-2">لا توجد بيانات سيارة</h2>
              <p className="text-slate-500 mb-4">يرجى اختيار سيارة لإنشاء عرض سعر لها</p>
              <Link href="/card-view">
                <Button>
                  <ArrowLeft size={16} className="ml-2" />
                  العودة لعرض البطاقات
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/card-view">
                <Button variant="outline" size="sm">
                  <ArrowLeft size={16} className="ml-2" />
                  العودة
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">إنشاء عرض سعر</h1>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Printer size={16} className="ml-2" />
                طباعة العرض
              </Button>
              
              <Button
                onClick={handleSaveQuotation}
                disabled={createQuotationMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save size={16} className="ml-2" />
                {createQuotationMutation.isPending ? "جاري الحفظ..." : "حفظ عرض السعر"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Vehicle Info & Basic Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selected Vehicle Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="ml-2" size={20} />
                  بيانات السيارة المختارة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 space-x-reverse">
                  {/* Manufacturer Logo */}
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {manufacturerData?.logo ? (
                      <img 
                        src={manufacturerData.logo} 
                        alt={editableVehicle.manufacturer} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                        {editableVehicle.manufacturer?.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  {/* Vehicle Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {editableVehicle.manufacturer} {editableVehicle.category}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setVehicleEditOpen(true)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 size={14} className="ml-1" />
                        تعديل
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-slate-500">السنة:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">{editableVehicle.year}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">سعة المحرك:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">{editableVehicle.engineCapacity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">اللون الخارجي:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">{editableVehicle.exteriorColor}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">اللون الداخلي:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">{editableVehicle.interiorColor}</span>
                      </div>
                      {editableVehicle.chassisNumber && (
                        <div className="col-span-2">
                          <span className="text-slate-500">رقم الهيكل:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">{editableVehicle.chassisNumber}</span>
                        </div>
                      )}
                      {editableVehicle.price && (
                        <div className="col-span-2">
                          <span className="text-slate-500">السعر الأساسي:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">
                            {editableVehicle.price.toLocaleString()} ريال
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information Form */}
            <Card>
              <CardHeader>
                <CardTitle>بيانات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quoteNumber">رقم عرض السعر</Label>
                    <div className="flex gap-2">
                      <Input
                        id="quoteNumber"
                        value={quoteNumber}
                        readOnly
                        className="bg-slate-50 dark:bg-slate-800"
                        placeholder="Q-123456"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="px-3"
                        title="رمز QR للعرض"
                      >
                        <QrCode size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customerName">اسم العميل *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="أدخل اسم العميل"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">رقم الهاتف</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="validityDays">مدة صلاحية العرض (أيام)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      value={validityDays}
                      onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                      min={1}
                      max={365}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي ملاحظات أو شروط خاصة بالعرض..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="ml-2" size={20} />
                  تفاصيل التسعير
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice">السعر الأساسي</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={pricingDetails.basePrice}
                      onChange={(e) => setPricingDetails(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={pricingDetails.quantity}
                      onChange={(e) => setPricingDetails(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">معدل الضريبة (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      value={pricingDetails.taxRate}
                      onChange={(e) => setPricingDetails(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse pt-6">
                    <input
                      type="checkbox"
                      id="isVATInclusive"
                      checked={pricingDetails.isVATInclusive}
                      onChange={(e) => setPricingDetails(prev => ({ ...prev, isVATInclusive: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isVATInclusive">السعر شامل الضريبة</Label>
                  </div>
                </div>

                {/* License Plate Section */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <input
                      type="checkbox"
                      id="includeLicensePlate"
                      checked={pricingDetails.includeLicensePlate}
                      onChange={(e) => setPricingDetails(prev => ({ ...prev, includeLicensePlate: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="includeLicensePlate">تشمل اللوحات</Label>
                  </div>
                  
                  {pricingDetails.includeLicensePlate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <Label htmlFor="licensePlatePrice">سعر اللوحات</Label>
                        <Input
                          id="licensePlatePrice"
                          type="number"
                          value={pricingDetails.licensePlatePrice}
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, licensePlatePrice: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse pt-6">
                        <input
                          type="checkbox"
                          id="licensePlateSubjectToTax"
                          checked={pricingDetails.licensePlateSubjectToTax}
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, licensePlateSubjectToTax: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="licensePlateSubjectToTax">اللوحات خاضعة للضريبة</Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h4 className="font-semibold mb-3">ملخص التسعير</h4>
                  {(() => {
                    const totals = calculateTotals();
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>إجمالي السيارات ({pricingDetails.quantity}):</span>
                          <span className="font-medium">{(pricingDetails.basePrice * pricingDetails.quantity).toLocaleString()} ريال</span>
                        </div>
                        {pricingDetails.includeLicensePlate && (
                          <div className="flex justify-between">
                            <span>اللوحات:</span>
                            <span className="font-medium">{totals.licensePlateTotal.toLocaleString()} ريال</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>المبلغ الفرعي:</span>
                          <span className="font-medium">{totals.subtotal.toLocaleString()} ريال</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الضريبة ({pricingDetails.taxRate}%):</span>
                          <span className="font-medium text-red-600">{totals.taxAmount.toLocaleString()} ريال</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-semibold text-lg">
                          <span>المجموع النهائي:</span>
                          <span className="text-green-600">{totals.finalTotal.toLocaleString()} ريال</span>
                        </div>
                        {pricingDetails.isVATInclusive && (
                          <p className="text-xs text-slate-500 mt-2">* السعر شامل ضريبة القيمة المضافة</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Management Windows */}
          <div className="space-y-6">
            
            {/* Management Options */}
            <Card>
              <CardHeader>
                <CardTitle>إدارة بيانات العرض</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setSpecificationsOpen(true)}
                >
                  <FileText size={16} className="ml-2" />
                  إدارة المواصفات
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCompanyDataOpen(true)}
                >
                  <Building2 size={16} className="ml-2" />
                  إدارة بيانات الشركة
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setRepresentativeOpen(true)}
                >
                  <User size={16} className="ml-2" />
                  إدارة بيانات المندوب
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setAppearanceOpen(true)}
                >
                  <Palette size={16} className="ml-2" />
                  التحكم في مظهر العرض
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setQuotesViewOpen(true)}
                >
                  <Search size={16} className="ml-2" />
                  عرض العروض المحفوظة
                </Button>
                
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>معاينة العرض</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{companyData.name}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">{companyData.address}</p>
                    </div>
                    {companyData.logo && (
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded"></div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <h5 className="font-semibold mb-2">عرض سعر رقم: {quoteNumber}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">العميل: {customerName || "اسم العميل"}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {editableVehicle.manufacturer} {editableVehicle.category} - {editableVehicle.year}
                    </p>
                    {(() => {
                      const totals = calculateTotals();
                      return (
                        <p className="text-sm font-medium mt-2">
                          السعر النهائي: {totals.finalTotal.toLocaleString()} ريال
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Management Dialogs */}
      
      {/* Specifications Management Dialog */}
      <Dialog open={specificationsOpen} onOpenChange={setSpecificationsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>إدارة مواصفات السيارة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {vehicleSpecs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <Label>القوة الحصانية</Label>
                  <Input value={vehicleSpecs.horsepower || ""} readOnly />
                </div>
                <div>
                  <Label>عزم الدوران</Label>
                  <Input value={vehicleSpecs.torque || ""} readOnly />
                </div>
                <div>
                  <Label>نوع الوقود</Label>
                  <Input value={vehicleSpecs.fuelType || ""} readOnly />
                </div>
                <div>
                  <Label>نوع ناقل الحركة</Label>
                  <Input value={vehicleSpecs.transmissionType || ""} readOnly />
                </div>
                <div className="md:col-span-2">
                  <Label>المميزات</Label>
                  <Textarea value={vehicleSpecs.features || ""} readOnly rows={3} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">لا توجد مواصفات مسجلة لهذه السيارة</p>
                <Button className="mt-4" onClick={() => setSpecificationsOpen(false)}>
                  <Plus size={16} className="ml-2" />
                  إضافة مواصفات
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Data Management Dialog */}
      <Dialog open={companyDataOpen} onOpenChange={setCompanyDataOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إدارة بيانات الشركة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">اسم الشركة</Label>
                <Input
                  id="companyName"
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                <Input
                  id="taxNumber"
                  value={companyData.taxNumber}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, taxNumber: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <Input
                  id="website"
                  value={companyData.website}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button variant="outline" onClick={() => setCompanyDataOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setCompanyDataOpen(false)}>
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Representative Data Management Dialog */}
      <Dialog open={representativeOpen} onOpenChange={setRepresentativeOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إدارة بيانات المندوب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repName">اسم المندوب</Label>
                <Input
                  id="repName"
                  value={representativeData.name}
                  onChange={(e) => setRepresentativeData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="repPosition">المنصب</Label>
                <Input
                  id="repPosition"
                  value={representativeData.position}
                  onChange={(e) => setRepresentativeData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="repPhone">رقم الهاتف</Label>
                <Input
                  id="repPhone"
                  value={representativeData.phone}
                  onChange={(e) => setRepresentativeData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="repEmail">البريد الإلكتروني</Label>
                <Input
                  id="repEmail"
                  value={representativeData.email}
                  onChange={(e) => setRepresentativeData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button variant="outline" onClick={() => setRepresentativeOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setRepresentativeOpen(false)}>
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote Appearance Management Dialog */}
      <Dialog open={appearanceOpen} onOpenChange={setAppearanceOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>التحكم في مظهر عرض السعر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">اللون الأساسي</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={quoteAppearance.primaryColor}
                  onChange={(e) => setQuoteAppearance(prev => ({ ...prev, primaryColor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                <Input
                  id="secondaryColor"
                  type="color"
                  value={quoteAppearance.secondaryColor}
                  onChange={(e) => setQuoteAppearance(prev => ({ ...prev, secondaryColor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="logoPosition">موضع الشعار</Label>
                <Select
                  value={quoteAppearance.logoPosition}
                  onValueChange={(value: 'left' | 'center' | 'right') => 
                    setQuoteAppearance(prev => ({ ...prev, logoPosition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">يمين</SelectItem>
                    <SelectItem value="center">وسط</SelectItem>
                    <SelectItem value="left">يسار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fontFamily">نوع الخط</Label>
                <Select
                  value={quoteAppearance.fontFamily}
                  onValueChange={(value) => setQuoteAppearance(prev => ({ ...prev, fontFamily: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Noto Sans Arabic">Noto Sans Arabic</SelectItem>
                    <SelectItem value="Cairo">Cairo</SelectItem>
                    <SelectItem value="Tajawal">Tajawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button variant="outline" onClick={() => setAppearanceOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setAppearanceOpen(false)}>
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicle Edit Dialog */}
      <Dialog open={vehicleEditOpen} onOpenChange={setVehicleEditOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات السيارة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editManufacturer">الصانع</Label>
                <Input
                  id="editManufacturer"
                  value={editableVehicle?.manufacturer || ""}
                  onChange={(e) => setEditableVehicle(prev => prev ? { ...prev, manufacturer: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editCategory">الفئة</Label>
                <Input
                  id="editCategory"
                  value={editableVehicle?.category || ""}
                  onChange={(e) => setEditableVehicle(prev => prev ? { ...prev, category: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editYear">السنة</Label>
                <Input
                  id="editYear"
                  type="number"
                  value={editableVehicle?.year || ""}
                  onChange={(e) => setEditableVehicle(prev => prev ? { ...prev, year: parseInt(e.target.value) || 2024 } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editEngineCapacity">سعة المحرك</Label>
                <Input
                  id="editEngineCapacity"
                  value={editableVehicle?.engineCapacity || ""}
                  onChange={(e) => setEditableVehicle(prev => prev ? { ...prev, engineCapacity: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editExteriorColor">اللون الخارجي</Label>
                <Input
                  id="editExteriorColor"
                  value={editableVehicle?.exteriorColor || ""}
                  onChange={(e) => setEditableVehicle(prev => prev ? { ...prev, exteriorColor: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="editInteriorColor">اللون الداخلي</Label>
                <Input
                  id="editInteriorColor"
                  value={editableVehicle?.interiorColor || ""}
                  onChange={(e) => setEditableVehicle(prev => prev ? { ...prev, interiorColor: e.target.value } : null)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editChassisNumber">رقم الهيكل</Label>
                <Input
                  id="editChassisNumber"
                  value={editableVehicle?.chassisNumber || ""}
                  onChange={(e) => setEditableVehicle(prev => prev ? { ...prev, chassisNumber: e.target.value } : null)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button variant="outline" onClick={() => setVehicleEditOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setVehicleEditOpen(false)}>
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quotes View Dialog */}
      <Dialog open={quotesViewOpen} onOpenChange={setQuotesViewOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>العروض المحفوظة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {quotations.length > 0 ? (
              <div className="grid gap-4">
                {quotations.map((quote: any) => (
                  <Card key={quote.id} className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{quote.quoteNumber}</h4>
                          <p className="text-slate-600 dark:text-slate-400">العميل: {quote.customerName}</p>
                          <p className="text-sm text-slate-500">
                            {quote.vehicleManufacturer} {quote.vehicleCategory} - {quote.vehicleYear}
                          </p>
                          <p className="text-sm font-medium text-green-600 mt-1">
                            {quote.finalPrice?.toLocaleString()} ريال
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Badge variant={quote.status === "مسودة" ? "secondary" : "default"}>
                            {quote.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit3 size={14} className="ml-1" />
                            تعديل
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">لا توجد عروض محفوظة</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}