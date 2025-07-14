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
  
  // Representative selection
  const [selectedRepresentative, setSelectedRepresentative] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  
  // Available representatives
  const representatives = [
    { id: "1", name: "أحمد محمد", phone: "01234567890", email: "ahmed@company.com", position: "مندوب مبيعات أول" },
    { id: "2", name: "محمد عبدالله", phone: "01234567891", email: "mohammed@company.com", position: "مندوب مبيعات" },
    { id: "3", name: "سارة أحمد", phone: "01234567892", email: "sarah@company.com", position: "مديرة مبيعات" },
    { id: "4", name: "عمر حسن", phone: "01234567893", email: "omar@company.com", position: "مستشار مبيعات" },
  ];
  
  // Fetch companies from API
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("/api/companies")
  });
  
  // Management windows states
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  const [companyDataOpen, setCompanyDataOpen] = useState(false);
  const [companyManagementOpen, setCompanyManagementOpen] = useState(false);
  const [representativeOpen, setRepresentativeOpen] = useState(false);
  
  const [quotesViewOpen, setQuotesViewOpen] = useState(false);
  const [vehicleEditOpen, setVehicleEditOpen] = useState(false);
  const [editableVehicle, setEditableVehicle] = useState<InventoryItem | null>(selectedVehicle);
  
  // Get selected company object
  const selectedCompanyData = companies.find(c => c.id.toString() === selectedCompany);
  
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

  // New state variables for enhanced features
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  const [showCompanyManagement, setShowCompanyManagement] = useState(false);

  // Generate QR code data
  const generateQRData = () => {
    return `Quote: ${quoteNumber}\nCustomer: ${customerName}\nVehicle: ${selectedVehicle?.manufacturer} ${selectedVehicle?.category}\nDate: ${new Date().toLocaleDateString('en-US')}`;
  };

  // Export quotation as PDF
  const exportToPDF = async () => {
    try {
      const element = document.querySelector('[data-pdf-export="quotation"]');
      if (!element) {
        toast({
          title: "خطأ",
          description: "لا يمكن العثور على العنصر المطلوب تصديره",
          variant: "destructive",
        });
        return;
      }

      // Create canvas from HTML element
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );

      // Save PDF
      const filename = `عرض_سعر_${quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير عرض السعر إلى ملف PDF",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير العرض إلى PDF",
        variant: "destructive",
      });
    }
  };

  // Convert quotation to invoice
  const convertToInvoice = () => {
    const invoiceData = {
      quoteNumber,
      customerName,
      customerPhone,
      customerEmail,
      selectedVehicle,
      pricingDetails,
      notes,
      type: "invoice"
    };
    
    // Store invoice data for future invoice generation
    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    
    toast({
      title: "تم التحويل بنجاح",
      description: "تم تحويل عرض السعر إلى فاتورة",
    });
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    if (!whatsappNumber) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الواتساب",
        variant: "destructive",
      });
      return;
    }

    const message = `
🏢 عرض سعر رقم: ${quoteNumber}

👤 العميل: ${customerName}
🚗 السيارة: ${selectedVehicle?.manufacturer} ${selectedVehicle?.category} ${selectedVehicle?.year}
💰 السعر النهائي: ${calculateTotals().finalTotal.toLocaleString()} ريال

📱 للاستفسار:
${representatives.find(r => r.id === selectedRepresentative)?.phone || "01234567890"}

🏢 ${selectedCompanyData?.name || "شركة السيارات"}
`;

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsappDialog(false);
  };

  // Get terms and conditions for selected company
  const { data: companyTerms } = useQuery<TermsAndConditions>({
    queryKey: ["/api/terms", selectedCompanyData?.id],
    enabled: !!selectedCompanyData?.id,
  });

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
  const { data: vehicleSpecs, isLoading: specsLoading } = useQuery<Specification>({
    queryKey: ['/api/specifications', editableVehicle?.manufacturer, editableVehicle?.category, editableVehicle?.trimLevel, editableVehicle?.year, editableVehicle?.engineCapacity],
    enabled: !!editableVehicle,
    queryFn: async () => {
      if (!editableVehicle) return null;
      
      const response = await fetch(
        `/api/specifications/${editableVehicle.manufacturer}/${editableVehicle.category}/${editableVehicle.trimLevel || 'null'}/${editableVehicle.year}/${editableVehicle.engineCapacity}`
      );
      
      if (response.ok) {
        return response.json();
      }
      return null;
    }
  });

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
    if (!editableVehicle || !customerName.trim() || !selectedRepresentative || !selectedCompany) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى التأكد من اختيار السيارة وإدخال اسم العميل واختيار المندوب والشركة",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    
    // Get selected representative and company data
    const selectedRepData = representatives.find(rep => rep.id === selectedRepresentative);
    const selectedCompanyData = companies.find(comp => comp.id === selectedCompany);

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validityDays);

    // Format detailed specifications for the quotation
    const formatSpecifications = () => {
      if (!vehicleSpecs) return "";
      
      const specs = [];
      if (vehicleSpecs.engine) specs.push(`المحرك: ${vehicleSpecs.engine}`);
      if (vehicleSpecs.transmission) specs.push(`ناقل الحركة: ${vehicleSpecs.transmission}`);
      if (vehicleSpecs.drivetrain) specs.push(`نظام الدفع: ${vehicleSpecs.drivetrain}`);
      if (vehicleSpecs.fuelType) specs.push(`نوع الوقود: ${vehicleSpecs.fuelType}`);
      if (vehicleSpecs.fuelCapacity) specs.push(`سعة خزان الوقود: ${vehicleSpecs.fuelCapacity}`);
      if (vehicleSpecs.seatingCapacity) specs.push(`عدد المقاعد: ${vehicleSpecs.seatingCapacity}`);
      if (vehicleSpecs.wheelbase) specs.push(`قاعدة العجلات: ${vehicleSpecs.wheelbase}`);
      if (vehicleSpecs.length) specs.push(`الطول: ${vehicleSpecs.length}`);
      if (vehicleSpecs.width) specs.push(`العرض: ${vehicleSpecs.width}`);
      if (vehicleSpecs.height) specs.push(`الارتفاع: ${vehicleSpecs.height}`);
      if (vehicleSpecs.groundClearance) specs.push(`المسافة من الأرض: ${vehicleSpecs.groundClearance}`);
      if (vehicleSpecs.curbWeight) specs.push(`الوزن الفارغ: ${vehicleSpecs.curbWeight}`);
      if (vehicleSpecs.maxSpeed) specs.push(`السرعة القصوى: ${vehicleSpecs.maxSpeed}`);
      if (vehicleSpecs.acceleration) specs.push(`التسارع 0-100: ${vehicleSpecs.acceleration}`);
      if (vehicleSpecs.safetyFeatures) specs.push(`مميزات الأمان: ${vehicleSpecs.safetyFeatures}`);
      if (vehicleSpecs.infotainment) specs.push(`نظام المعلومات والترفيه: ${vehicleSpecs.infotainment}`);
      if (vehicleSpecs.connectivity) specs.push(`الاتصال: ${vehicleSpecs.connectivity}`);
      if (vehicleSpecs.driverAssistance) specs.push(`مساعدة السائق: ${vehicleSpecs.driverAssistance}`);
      if (vehicleSpecs.comfortFeatures) specs.push(`مميزات الراحة: ${vehicleSpecs.comfortFeatures}`);
      if (vehicleSpecs.exteriorFeatures) specs.push(`مميزات خارجية: ${vehicleSpecs.exteriorFeatures}`);
      if (vehicleSpecs.interiorFeatures) specs.push(`مميزات داخلية: ${vehicleSpecs.interiorFeatures}`);
      if (vehicleSpecs.wheelsTires) specs.push(`العجلات والإطارات: ${vehicleSpecs.wheelsTires}`);
      if (vehicleSpecs.suspension) specs.push(`نظام التعليق: ${vehicleSpecs.suspension}`);
      if (vehicleSpecs.brakes) specs.push(`نظام الفرامل: ${vehicleSpecs.brakes}`);
      if (vehicleSpecs.warranty) specs.push(`الضمان: ${vehicleSpecs.warranty}`);
      if (vehicleSpecs.notes) specs.push(`ملاحظات: ${vehicleSpecs.notes}`);
      
      return specs.join(' • ');
    };

    const quotationData: InsertQuotation = {
      quoteNumber,
      inventoryItemId: editableVehicle.id || 0,
      manufacturer: editableVehicle.manufacturer,
      category: editableVehicle.category,
      trimLevel: editableVehicle.trimLevel || "",
      year: editableVehicle.year,
      exteriorColor: editableVehicle.exteriorColor,
      interiorColor: editableVehicle.interiorColor,
      chassisNumber: editableVehicle.chassisNumber,
      engineCapacity: editableVehicle.engineCapacity,
      specifications: formatSpecifications(),
      basePrice: pricingDetails.basePrice.toString(),
      finalPrice: totals.finalTotal.toString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      notes: notes.trim(),
      validUntil: validUntilDate.toISOString(),
      status: "مسودة",
      createdBy: "admin", // This should be the current user
      companyData: JSON.stringify(selectedCompanyData),
      representativeData: JSON.stringify(selectedRepData),
      quoteAppearance: JSON.stringify(quoteAppearance),
      pricingDetails: JSON.stringify({
        ...pricingDetails,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        finalTotal: totals.finalTotal,
        licensePlateTotal: totals.licensePlateTotal
      }),
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
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 no-print">
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
            
            <div className="flex items-center space-x-2 space-x-reverse flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTermsDialog(true)}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <Settings2 size={16} className="ml-2" />
                شروط
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCompanyManagement(true)}
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                <Building2 size={16} className="ml-2" />
                شركات
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowWhatsappDialog(true)}
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                <MessageCircle size={16} className="ml-2" />
                واتساب
              </Button>
              
              <Button
                variant="outline"
                onClick={convertToInvoice}
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <FileUp size={16} className="ml-2" />
                فاتورة
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Printer size={16} className="ml-2" />
                طباعة
              </Button>
              
              <Button
                variant="outline"
                onClick={exportToPDF}
                className="border-slate-500 text-slate-600 hover:bg-slate-50"
              >
                <Download size={16} className="ml-2" />
                PDF
              </Button>
              
              <Button
                onClick={handleSaveQuotation}
                disabled={createQuotationMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save size={16} className="ml-2" />
                {createQuotationMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Vehicle Info & Basic Form */}
          <div className="space-y-6">
            
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
                  <div>
                    <Label htmlFor="representativeSelect">المندوب *</Label>
                    <Select value={selectedRepresentative} onValueChange={setSelectedRepresentative}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المندوب" />
                      </SelectTrigger>
                      <SelectContent>
                        {representatives.map((rep) => (
                          <SelectItem key={rep.id} value={rep.id}>
                            {rep.name} - {rep.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="companySelect">الشركة *</Label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشركة" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  onClick={() => setCompanyDataOpen(true)}
                >
                  <Building2 size={16} className="ml-2" />
                  إدارة بيانات الشركة
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setCompanyManagementOpen(true)}
                >
                  <Settings size={16} className="ml-2" />
                  إدارة الشركات
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
                  onClick={() => setQuotesViewOpen(true)}
                >
                  <Search size={16} className="ml-2" />
                  عرض العروض المحفوظة
                </Button>
                
              </CardContent>
            </Card>


          </div>
        </div>
        
        {/* A4 Preview Section - Bottom */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">معاينة العرض (A4)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <QuotationA4Preview
                selectedCompany={selectedCompanyData}
                selectedVehicle={editableVehicle}
                vehicleSpecs={vehicleSpecs}
                quoteNumber={quoteNumber}
                customerName={customerName}
                customerPhone={customerPhone}
                customerEmail={customerEmail}
                validUntil={new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000)}
                basePrice={pricingDetails.basePrice * pricingDetails.quantity}
                finalPrice={calculateTotals().finalTotal}
                licensePlatePrice={pricingDetails.licensePlatePrice}
                includeLicensePlate={pricingDetails.includeLicensePlate}
                licensePlateSubjectToTax={pricingDetails.licensePlateSubjectToTax}
                taxRate={pricingDetails.taxRate}
                isVATInclusive={pricingDetails.isVATInclusive}
                representativeName={representatives.find(r => r.id === selectedRepresentative)?.name || "غير محدد"}
                representativePhone={representatives.find(r => r.id === selectedRepresentative)?.phone || "غير محدد"}
                representativeEmail={representatives.find(r => r.id === selectedRepresentative)?.email || "غير محدد"}
                representativePosition={representatives.find(r => r.id === selectedRepresentative)?.position || "غير محدد"}
                notes={notes}
              />
            </CardContent>
          </Card>
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
            {specsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500">جاري تحميل المواصفات...</p>
              </div>
            ) : vehicleSpecs ? (
              <div className="space-y-6">
                {/* Engine & Performance */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-blue-600 dark:text-blue-400">الأداء والمحرك</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicleSpecs.engine && (
                      <div>
                        <Label>المحرك</Label>
                        <Input value={vehicleSpecs.engine} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.horsepower && (
                      <div>
                        <Label>القوة الحصانية</Label>
                        <Input value={vehicleSpecs.horsepower} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.torque && (
                      <div>
                        <Label>عزم الدوران</Label>
                        <Input value={vehicleSpecs.torque} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.transmission && (
                      <div>
                        <Label>ناقل الحركة</Label>
                        <Input value={vehicleSpecs.transmission} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.fuelType && (
                      <div>
                        <Label>نوع الوقود</Label>
                        <Input value={vehicleSpecs.fuelType} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.acceleration && (
                      <div>
                        <Label>التسارع 0-100 كم/س</Label>
                        <Input value={vehicleSpecs.acceleration} readOnly />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-green-600 dark:text-green-400">الأبعاد والوزن</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicleSpecs.length && (
                      <div>
                        <Label>الطول</Label>
                        <Input value={vehicleSpecs.length} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.width && (
                      <div>
                        <Label>العرض</Label>
                        <Input value={vehicleSpecs.width} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.height && (
                      <div>
                        <Label>الارتفاع</Label>
                        <Input value={vehicleSpecs.height} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.wheelbase && (
                      <div>
                        <Label>قاعدة العجلات</Label>
                        <Input value={vehicleSpecs.wheelbase} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.curbWeight && (
                      <div>
                        <Label>الوزن الفارغ</Label>
                        <Input value={vehicleSpecs.curbWeight} readOnly />
                      </div>
                    )}
                    {vehicleSpecs.seatingCapacity && (
                      <div>
                        <Label>عدد المقاعد</Label>
                        <Input value={vehicleSpecs.seatingCapacity} readOnly />
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-purple-600 dark:text-purple-400">المميزات والتجهيزات</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {vehicleSpecs.safetyFeatures && (
                      <div>
                        <Label>مميزات الأمان</Label>
                        <Textarea value={vehicleSpecs.safetyFeatures} readOnly rows={2} />
                      </div>
                    )}
                    {vehicleSpecs.comfortFeatures && (
                      <div>
                        <Label>مميزات الراحة</Label>
                        <Textarea value={vehicleSpecs.comfortFeatures} readOnly rows={2} />
                      </div>
                    )}
                    {vehicleSpecs.infotainment && (
                      <div>
                        <Label>نظام المعلومات والترفيه</Label>
                        <Textarea value={vehicleSpecs.infotainment} readOnly rows={2} />
                      </div>
                    )}
                    {vehicleSpecs.driverAssistance && (
                      <div>
                        <Label>مساعدة السائق</Label>
                        <Textarea value={vehicleSpecs.driverAssistance} readOnly rows={2} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Warranty & Notes */}
                {(vehicleSpecs.warranty || vehicleSpecs.notes) && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-orange-600 dark:text-orange-400">الضمان والملاحظات</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {vehicleSpecs.warranty && (
                        <div>
                          <Label>الضمان</Label>
                          <Input value={vehicleSpecs.warranty} readOnly />
                        </div>
                      )}
                      {vehicleSpecs.notes && (
                        <div>
                          <Label>ملاحظات</Label>
                          <Textarea value={vehicleSpecs.notes} readOnly rows={3} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">لا توجد مواصفات مسجلة لهذه السيارة</p>
                <p className="text-sm text-slate-400 mt-2">
                  يتم جلب المواصفات من إدارة المواصفات بناءً على: {editableVehicle?.manufacturer} - {editableVehicle?.category} - {editableVehicle?.year}
                </p>
                <Button className="mt-4" onClick={() => setSpecificationsOpen(false)}>
                  <Plus size={16} className="ml-2" />
                  إضافة مواصفات جديدة
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
      
      {/* Print Layout (hidden on screen, visible when printing) */}
      <div className="hidden print:block print-page">
        {/* Print Header */}
        <div className="print-header">
          <div className="print-header-logo">
            {companyLogo ? (
              <img src={companyLogo} alt="Company Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold">
                ش
              </div>
            )}
          </div>
          <div className="print-header-info">
            <h1 className="text-2xl font-bold mb-2">
              {companies.find(c => c.id === selectedCompany)?.name || "شركة السيارات"}
            </h1>
            <p className="text-sm mb-1">
              {companies.find(c => c.id === selectedCompany)?.address || "العنوان"}
            </p>
            <p className="text-sm">
              تاريخ العرض: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>
          <div className="print-header-qr">
            <div className="text-center">
              <div className="text-xs mb-1">QR Code</div>
              <div className="text-xs">{quoteNumber}</div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="print-section">
          <h3>بيانات العميل</h3>
          <div className="print-row">
            <span className="print-label">اسم العميل:</span>
            <span className="print-value">{customerName}</span>
          </div>
          <div className="print-row">
            <span className="print-label">رقم الهاتف:</span>
            <span className="print-value">{customerPhone}</span>
          </div>
          <div className="print-row">
            <span className="print-label">البريد الإلكتروني:</span>
            <span className="print-value">{customerEmail}</span>
          </div>
        </div>

        {/* Representative Information */}
        <div className="print-section">
          <h3>بيانات المندوب</h3>
          {(() => {
            const rep = representatives.find(r => r.id === selectedRepresentative);
            return rep ? (
              <>
                <div className="print-row">
                  <span className="print-label">الاسم:</span>
                  <span className="print-value">{rep.name}</span>
                </div>
                <div className="print-row">
                  <span className="print-label">المنصب:</span>
                  <span className="print-value">{rep.position}</span>
                </div>
                <div className="print-row">
                  <span className="print-label">رقم الهاتف:</span>
                  <span className="print-value">{rep.phone}</span>
                </div>
                <div className="print-row">
                  <span className="print-label">البريد الإلكتروني:</span>
                  <span className="print-value">{rep.email}</span>
                </div>
              </>
            ) : null;
          })()}
        </div>

        {/* Vehicle Information */}
        <div className="print-section">
          <h3>بيانات المركبة</h3>
          <div className="flex items-center mb-3">
            <div className="manufacturer-logo mr-3">
              {manufacturerData?.logo ? (
                <img src={manufacturerData.logo} alt={editableVehicle.manufacturer} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
                  {editableVehicle.manufacturer?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-bold">{editableVehicle.manufacturer} {editableVehicle.category}</h4>
              <p className="text-sm text-gray-600">الموديل: {editableVehicle.year}</p>
            </div>
          </div>
          <div className="print-row">
            <span className="print-label">سعة المحرك:</span>
            <span className="print-value">{editableVehicle.engineCapacity}</span>
          </div>
          <div className="print-row">
            <span className="print-label">اللون الخارجي:</span>
            <span className="print-value">{editableVehicle.exteriorColor}</span>
          </div>
          <div className="print-row">
            <span className="print-label">اللون الداخلي:</span>
            <span className="print-value">{editableVehicle.interiorColor}</span>
          </div>
          <div className="print-row">
            <span className="print-label">رقم الهيكل:</span>
            <span className="print-value">{editableVehicle.chassisNumber}</span>
          </div>
        </div>

        {/* Price Details */}
        <div className="print-section">
          <h3>تفاصيل السعر</h3>
          <table className="print-table">
            <thead>
              <tr>
                <th>البيان</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>السعر الأساسي</td>
                <td>{pricingDetails.basePrice.toLocaleString()} ريال</td>
              </tr>
              {pricingDetails.includeLicensePlate && (
                <tr>
                  <td>اللوحات</td>
                  <td>{pricingDetails.licensePlatePrice.toLocaleString()} ريال</td>
                </tr>
              )}
              <tr>
                <td>
                  {pricingDetails.isVATInclusive ? 'السعر شامل الضريبة' : 'السعر + الضريبة'}
                  {pricingDetails.isVATInclusive && pricingDetails.taxRate > 0 && (
                    <span> (قيمة الضريبة: {calculateTotals().taxAmount.toLocaleString()} ريال)</span>
                  )}
                </td>
                <td>{calculateTotals().subtotal.toLocaleString()} ريال</td>
              </tr>
              <tr className="print-total-row">
                <td>الإجمالي</td>
                <td>{calculateTotals().finalTotal.toLocaleString()} ريال</td>
              </tr>
            </tbody>
          </table>
          
          {/* Arabic Total */}
          <div className="print-arabic-total">
            <strong>المبلغ بالأحرف العربية:</strong><br />
            {numberToArabic(calculateTotals().finalTotal)}
          </div>
        </div>

        {/* Additional Notes */}
        {notes && (
          <div className="print-section">
            <h3>ملاحظات إضافية</h3>
            <p>{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="print-section mt-8">
          <div className="print-row">
            <span className="print-label">رقم عرض السعر:</span>
            <span className="print-value">{quoteNumber}</span>
          </div>
          <div className="print-row">
            <span className="print-label">صالح حتى:</span>
            <span className="print-value">
              {new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      </div>
      
      {/* Company Management Dialog */}
      <Dialog open={companyManagementOpen} onOpenChange={setCompanyManagementOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>إدارة الشركات</DialogTitle>
          </DialogHeader>
          <CompanyManagement />
        </DialogContent>
      </Dialog>
      {/* WhatsApp Dialog */}
      <Dialog open={showWhatsappDialog} onOpenChange={setShowWhatsappDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              مشاركة عبر الواتساب
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-number">رقم الواتساب (مع رمز الدولة)</Label>
              <Input
                id="whatsapp-number"
                placeholder="+966501234567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="text-left"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={shareViaWhatsApp} className="bg-emerald-600 hover:bg-emerald-700">
                <MessageCircle size={16} className="ml-2" />
                إرسال
              </Button>
              <Button variant="outline" onClick={() => setShowWhatsappDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-orange-600" />
              الشروط والأحكام
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="terms-content">محتوى الشروط والأحكام</Label>
              <Textarea
                id="terms-content"
                placeholder="أدخل الشروط والأحكام الخاصة بالشركة..."
                value={companyTerms?.content || termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                className="min-h-[300px] text-right"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowTermsDialog(false)} className="bg-orange-600 hover:bg-orange-700">
                <Save size={16} className="ml-2" />
                حفظ
              </Button>
              <Button variant="outline" onClick={() => setShowTermsDialog(false)}>
                إغلاق
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Management Dialog */}
      <Dialog open={showCompanyManagement} onOpenChange={setShowCompanyManagement}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              إدارة الشركات
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CompanyManagement />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}