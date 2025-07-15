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
  Save,
  Eye,
  Upload,
  Plus,
  Edit3,
  Trash2,
  QrCode,
  Search,
  Calculator,
  Printer,
  Download,
  MessageCircle,
  FileUp,
  Settings2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import type { InventoryItem, Specification, InsertQuotation, Company, TermsAndConditions } from "@shared/schema";
import { numberToArabic } from "@/utils/number-to-arabic";
import QuotationA4Preview from "@/components/quotation-a4-preview";
import CompanyManagement from "@/components/company-management";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CompanyData {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  registrationNumber: string;
  licenseNumber: string;
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

interface VehicleData {
  manufacturer: string;
  category: string;
  trimLevel: string;
  year: string;
  engineCapacity: string;
  exteriorColor: string;
  interiorColor: string;
  chassisNumber: string;
  price: number;
}

export default function QuotationCreationEmptyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { darkMode } = useTheme();

  // Main state variables
  const [activeTab, setActiveTab] = useState("vehicle");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedRepresentative, setSelectedRepresentative] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [showQuotesView, setShowQuotesView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState<any>(null);

  // Vehicle data state
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    manufacturer: "",
    category: "",
    trimLevel: "",
    year: "",
    engineCapacity: "",
    exteriorColor: "",
    interiorColor: "",
    chassisNumber: "",
    price: 0
  });

  // Appearance settings
  const [appearance, setAppearance] = useState<QuoteAppearance>({
    primaryColor: "#0F172A",
    secondaryColor: "#64748B",
    fontFamily: "Noto Sans Arabic",
    logoPosition: "right",
    showCompanyInfo: true,
    showRepresentativeInfo: true
  });

  const [pricingDetails, setPricingDetails] = useState<PricingDetails>({
    basePrice: 0,
    quantity: 1,
    licensePlatePrice: 900,
    includeLicensePlate: true,
    licensePlateSubjectToTax: false,
    taxRate: 15,
    isVATInclusive: false
  });

  // New state variables for enhanced features
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  const [termsRefreshTrigger, setTermsRefreshTrigger] = useState(0);
  const [companyStamp, setCompanyStamp] = useState<string | null>(null);

  // Load existing terms and conditions
  const { data: existingTerms = [] } = useQuery<Array<{ id: number; term_text: string; display_order: number }>>({
    queryKey: ['/api/terms-conditions']
  });

  // Load manufacturers
  const { data: manufacturers = [] } = useQuery<Array<{ id: number; name: string; logo: string | null }>>({
    queryKey: ['/api/manufacturers']
  });

  // Load categories based on selected manufacturer
  const { data: categories = [] } = useQuery<Array<{ category: string }>>({
    queryKey: ['/api/categories', vehicleData.manufacturer],
    enabled: !!vehicleData.manufacturer
  });

  // Load trim levels based on selected manufacturer and category
  const { data: trimLevels = [] } = useQuery<Array<{ trimLevel: string }>>({
    queryKey: ['/api/trim-levels', vehicleData.manufacturer, vehicleData.category],
    enabled: !!vehicleData.manufacturer && !!vehicleData.category
  });

  // Load engine capacities
  const { data: engineCapacities = [] } = useQuery<Array<{ engineCapacity: string }>>({
    queryKey: ['/api/engine-capacities']
  });

  // Load companies
  const { data: companies = [] } = useQuery<Array<Company>>({
    queryKey: ['/api/companies']
  });

  // Load representatives
  const representatives = [
    { id: 1, name: "أحمد محمد", phone: "0501234567", email: "ahmed@company.com", position: "مدير المبيعات" },
    { id: 2, name: "فاطمة علي", phone: "0507654321", email: "fatima@company.com", position: "مستشارة مبيعات" },
    { id: 3, name: "خالد السعد", phone: "0509876543", email: "khalid@company.com", position: "مسؤول خدمة العملاء" }
  ];

  // Generate quote number on component mount
  useEffect(() => {
    const generateQuoteNumber = () => {
      const timestamp = Date.now();
      return `Q-${timestamp}`;
    };
    setQuoteNumber(generateQuoteNumber());
  }, []);

  // Update terms content when existing terms are loaded
  useEffect(() => {
    if (existingTerms.length > 0 && !termsContent) {
      const termsText = existingTerms.map(term => term.term_text).join('\n');
      setTermsContent(termsText);
    }
  }, [existingTerms, termsContent]);

  // Update pricing details when vehicle data changes
  useEffect(() => {
    setPricingDetails(prev => ({
      ...prev,
      basePrice: vehicleData.price
    }));
  }, [vehicleData.price]);

  // Get selected company data
  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  // Generate QR code data
  const generateQRData = () => {
    return `Quote: ${quoteNumber}\nCustomer: ${selectedCompanyData?.name || 'N/A'}\nVehicle: ${vehicleData.manufacturer} ${vehicleData.category} ${vehicleData.year}\nPrice: ${calculateTotals().finalTotal} SAR`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const { basePrice, quantity, licensePlatePrice, includeLicensePlate, licensePlateSubjectToTax, taxRate, isVATInclusive } = pricingDetails;
    
    let subtotal = basePrice * quantity;
    let licensePlateTotal = includeLicensePlate ? licensePlatePrice : 0;
    let taxableAmount = subtotal;
    
    if (includeLicensePlate && licensePlateSubjectToTax) {
      taxableAmount += licensePlateTotal;
    }
    
    let taxAmount = 0;
    let finalTotal = 0;
    
    if (isVATInclusive) {
      // VAT is included in the price
      taxAmount = (taxableAmount * taxRate) / (100 + taxRate);
      finalTotal = subtotal + (includeLicensePlate ? licensePlateTotal : 0);
    } else {
      // VAT is added to the price
      taxAmount = (taxableAmount * taxRate) / 100;
      finalTotal = subtotal + taxAmount + (includeLicensePlate ? licensePlateTotal : 0);
    }
    
    return {
      subtotal,
      licensePlateTotal,
      taxAmount,
      finalTotal
    };
  };

  // Handle vehicle data change
  const handleVehicleDataChange = (field: keyof VehicleData, value: string | number) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle manufacturer change
  const handleManufacturerChange = (manufacturer: string) => {
    setVehicleData(prev => ({
      ...prev,
      manufacturer,
      category: "",
      trimLevel: ""
    }));
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setVehicleData(prev => ({
      ...prev,
      category,
      trimLevel: ""
    }));
  };

  // Handle save quotation
  const handleSaveQuotation = async () => {
    if (!selectedCompany || !selectedRepresentative) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الشركة والمندوب قبل الحفظ",
        variant: "destructive",
      });
      return;
    }

    try {
      const quotationData: InsertQuotation = {
        quoteNumber,
        itemId: null, // No specific item for empty creation
        companyId: selectedCompany,
        representativeId: selectedRepresentative,
        vehicleData: JSON.stringify(vehicleData),
        pricingDetails: JSON.stringify(pricingDetails),
        qrCodeData: generateQRData(),
        appearance: JSON.stringify(appearance),
        terms: termsContent,
        stamp: companyStamp
      };

      await apiRequest('POST', '/api/quotations', quotationData);
      
      toast({
        title: "تم بنجاح",
        description: "تم حفظ عرض السعر بنجاح",
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      
      // Reset form or navigate
      navigate('/quotation-creation');
      
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ عرض السعر",
        variant: "destructive",
      });
    }
  };

  // Handle print quotation
  const handlePrintQuotation = async () => {
    try {
      const element = document.getElementById('quotation-preview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`quotation-${quoteNumber}.pdf`);
      
      toast({
        title: "تم بنجاح",
        description: "تم طباعة عرض السعر بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error printing quotation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء طباعة عرض السعر",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/inventory">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للمخزون
                </Button>
              </Link>
              <div className="flex items-center space-x-2 space-x-reverse">
                <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">إنشاء عرض سعر جديد</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button onClick={() => setShowPreview(true)} variant="outline" size="sm">
                <Eye className="w-4 h-4 ml-2" />
                معاينة
              </Button>
              <Button onClick={handleSaveQuotation} className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="w-4 h-4 ml-2" />
                حفظ عرض السعر
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="xl:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vehicle">بيانات السيارة</TabsTrigger>
                <TabsTrigger value="pricing">التسعير</TabsTrigger>
                <TabsTrigger value="company">الشركة</TabsTrigger>
                <TabsTrigger value="representative">المندوب</TabsTrigger>
              </TabsList>

              {/* Vehicle Data Tab */}
              <TabsContent value="vehicle" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse">
                      <FileText className="w-5 h-5" />
                      <span>بيانات السيارة</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Manufacturer */}
                      <div>
                        <Label htmlFor="manufacturer">الصانع</Label>
                        <Select value={vehicleData.manufacturer} onValueChange={handleManufacturerChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الصانع" />
                          </SelectTrigger>
                          <SelectContent>
                            {manufacturers.map((manufacturer) => (
                              <SelectItem key={manufacturer.id} value={manufacturer.name}>
                                {manufacturer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Category */}
                      <div>
                        <Label htmlFor="category">الفئة</Label>
                        <Select value={vehicleData.category} onValueChange={handleCategoryChange} disabled={!vehicleData.manufacturer}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.category} value={cat.category}>
                                {cat.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Trim Level */}
                      <div>
                        <Label htmlFor="trimLevel">درجة التجهيز</Label>
                        <Select value={vehicleData.trimLevel} onValueChange={(value) => handleVehicleDataChange('trimLevel', value)} disabled={!vehicleData.category}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر درجة التجهيز" />
                          </SelectTrigger>
                          <SelectContent>
                            {trimLevels.map((trim) => (
                              <SelectItem key={trim.trimLevel} value={trim.trimLevel}>
                                {trim.trimLevel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Year */}
                      <div>
                        <Label htmlFor="year">السنة</Label>
                        <Select value={vehicleData.year} onValueChange={(value) => handleVehicleDataChange('year', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر السنة" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = (new Date().getFullYear() - i).toString();
                              return (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Engine Capacity */}
                      <div>
                        <Label htmlFor="engineCapacity">سعة المحرك</Label>
                        <Select value={vehicleData.engineCapacity} onValueChange={(value) => handleVehicleDataChange('engineCapacity', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر سعة المحرك" />
                          </SelectTrigger>
                          <SelectContent>
                            {engineCapacities.map((capacity) => (
                              <SelectItem key={capacity.engineCapacity} value={capacity.engineCapacity}>
                                {capacity.engineCapacity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Exterior Color */}
                      <div>
                        <Label htmlFor="exteriorColor">اللون الخارجي</Label>
                        <Input
                          id="exteriorColor"
                          value={vehicleData.exteriorColor}
                          onChange={(e) => handleVehicleDataChange('exteriorColor', e.target.value)}
                          placeholder="أدخل اللون الخارجي"
                        />
                      </div>

                      {/* Interior Color */}
                      <div>
                        <Label htmlFor="interiorColor">اللون الداخلي</Label>
                        <Input
                          id="interiorColor"
                          value={vehicleData.interiorColor}
                          onChange={(e) => handleVehicleDataChange('interiorColor', e.target.value)}
                          placeholder="أدخل اللون الداخلي"
                        />
                      </div>

                      {/* Chassis Number */}
                      <div>
                        <Label htmlFor="chassisNumber">رقم الهيكل</Label>
                        <Input
                          id="chassisNumber"
                          value={vehicleData.chassisNumber}
                          onChange={(e) => handleVehicleDataChange('chassisNumber', e.target.value)}
                          placeholder="أدخل رقم الهيكل"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <Label htmlFor="price">السعر</Label>
                        <Input
                          id="price"
                          type="number"
                          value={vehicleData.price}
                          onChange={(e) => handleVehicleDataChange('price', parseInt(e.target.value) || 0)}
                          placeholder="أدخل السعر"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse">
                      <Calculator className="w-5 h-5" />
                      <span>تفاصيل التسعير</span>
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
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">الكمية</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={pricingDetails.quantity}
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={pricingDetails.taxRate}
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, taxRate: parseInt(e.target.value) || 15 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="licensePlatePrice">سعر اللوحة</Label>
                        <Input
                          id="licensePlatePrice"
                          type="number"
                          value={pricingDetails.licensePlatePrice}
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, licensePlatePrice: parseInt(e.target.value) || 900 }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="includeLicensePlate"
                          checked={pricingDetails.includeLicensePlate}
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, includeLicensePlate: e.target.checked }))}
                        />
                        <Label htmlFor="includeLicensePlate">تضمين اللوحة</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="isVATInclusive"
                          checked={pricingDetails.isVATInclusive}
                          onChange={(e) => setPricingDetails(prev => ({ ...prev, isVATInclusive: e.target.checked }))}
                        />
                        <Label htmlFor="isVATInclusive">الضريبة شاملة</Label>
                      </div>
                      
                      {pricingDetails.includeLicensePlate && (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            id="licensePlateSubjectToTax"
                            checked={pricingDetails.licensePlateSubjectToTax}
                            onChange={(e) => setPricingDetails(prev => ({ ...prev, licensePlateSubjectToTax: e.target.checked }))}
                          />
                          <Label htmlFor="licensePlateSubjectToTax">اللوحة خاضعة للضريبة</Label>
                        </div>
                      )}
                    </div>
                    
                    {/* Price Summary */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">ملخص الأسعار</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>السعر الأساسي:</span>
                          <span>{calculateTotals().subtotal.toLocaleString()} ريال</span>
                        </div>
                        {pricingDetails.includeLicensePlate && (
                          <div className="flex justify-between">
                            <span>اللوحة:</span>
                            <span>{calculateTotals().licensePlateTotal.toLocaleString()} ريال</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>الضريبة:</span>
                          <span>{calculateTotals().taxAmount.toLocaleString()} ريال</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>الإجمالي:</span>
                          <span>{calculateTotals().finalTotal.toLocaleString()} ريال</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Company Tab */}
              <TabsContent value="company" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse">
                      <Building2 className="w-5 h-5" />
                      <span>بيانات الشركة</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="company">اختر الشركة</Label>
                      <Select value={selectedCompany?.toString() || ""} onValueChange={(value) => setSelectedCompany(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الشركة" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCompanyData && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">معلومات الشركة المختارة</h4>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">الاسم:</span> {selectedCompanyData.name}</div>
                          <div><span className="font-medium">العنوان:</span> {selectedCompanyData.address}</div>
                          <div><span className="font-medium">الهاتف:</span> {selectedCompanyData.phone}</div>
                          <div><span className="font-medium">البريد الإلكتروني:</span> {selectedCompanyData.email}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Representative Tab */}
              <TabsContent value="representative" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse">
                      <User className="w-5 h-5" />
                      <span>بيانات المندوب</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="representative">اختر المندوب</Label>
                      <Select value={selectedRepresentative?.toString() || ""} onValueChange={(value) => setSelectedRepresentative(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المندوب" />
                        </SelectTrigger>
                        <SelectContent>
                          {representatives.map((rep) => (
                            <SelectItem key={rep.id} value={rep.id.toString()}>
                              {rep.name} - {rep.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedRepresentative && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">معلومات المندوب المختار</h4>
                        {(() => {
                          const rep = representatives.find(r => r.id === selectedRepresentative);
                          return rep ? (
                            <div className="space-y-1 text-sm">
                              <div><span className="font-medium">الاسم:</span> {rep.name}</div>
                              <div><span className="font-medium">المنصب:</span> {rep.position}</div>
                              <div><span className="font-medium">الهاتف:</span> {rep.phone}</div>
                              <div><span className="font-medium">البريد الإلكتروني:</span> {rep.email}</div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quote Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <QrCode className="w-5 h-5" />
                  <span>معلومات العرض</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>رقم العرض</Label>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-sm font-mono">
                    {quoteNumber}
                  </div>
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-sm">
                    {new Date().toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Badge variant="outline" className="w-full justify-center">
                    مسودة
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => setShowPreview(true)} variant="outline" className="w-full">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة العرض
                </Button>
                <Button onClick={handlePrintQuotation} variant="outline" className="w-full">
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة العرض
                </Button>
                <Button onClick={handleSaveQuotation} className="w-full bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ العرض
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>معاينة عرض السعر</DialogTitle>
          </DialogHeader>
          <div id="quotation-preview">
            <QuotationA4Preview
              quoteNumber={quoteNumber}
              vehicleData={vehicleData}
              pricingDetails={pricingDetails}
              selectedCompanyData={selectedCompanyData}
              selectedRepresentative={representatives.find(r => r.id === selectedRepresentative)}
              appearance={appearance}
              qrCodeData={generateQRData()}
              terms={termsContent}
              stamp={companyStamp}
              termsRefreshTrigger={termsRefreshTrigger}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}