import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  FileDown,
  MessageCircle,
  FileUp,
  Settings2,
  X,
  Info
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import type { InventoryItem, Specification, InsertQuotation, Company, TermsAndConditions } from "@shared/schema";
import { numberToArabic } from "@/utils/number-to-arabic";
import { generateQuoteNumber, generateInvoiceNumber } from "@/utils/serial-number";
import QuotationA4Preview from "@/components/quotation-a4-preview";
import CompanyPDFTemplates from "@/components/company-pdf-templates";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface QuotationCreationPageProps {
  vehicleData?: InventoryItem;
}

// Component to display vehicle specifications with enhanced styling
function VehicleSpecificationsDisplayComponent({ manufacturer, category, trimLevel, year, engineCapacity }: {
  manufacturer: string;
  category: string;
  trimLevel: string;
  year: string;
  engineCapacity: string;
}) {
  const { data: specs, isLoading } = useQuery<Specification>({
    queryKey: ['/api/specifications', manufacturer, category, trimLevel, year, engineCapacity],
    enabled: !!(manufacturer && category && year && engineCapacity),
    queryFn: async () => {
      const response = await fetch(
        `/api/specifications/${manufacturer}/${category}/${trimLevel || 'null'}/${year}/${engineCapacity}`
      );
      if (response.ok) {
        return response.json();
      }
      return null;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 space-x-reverse p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-500 dark:text-gray-400">جاري تحميل المواصفات...</span>
      </div>
    );
  }

  if (!specs) {
    return (
      <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <Info className="mx-auto h-8 w-8 text-yellow-600 dark:text-yellow-500 mb-2" />
        <p className="text-yellow-800 dark:text-yellow-200">لا توجد مواصفات متاحة لهذه المعاملات</p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
          يمكنك إضافة المواصفات من خلال إدارة النظام
        </p>
      </div>
    );
  }

  const specsData = [
    // Engine & Performance
    { key: 'engineType', label: 'نوع المحرك', value: specs.engineType, icon: '🔧', category: 'engine' },
    { key: 'horsepower', label: 'القوة الحصانية', value: specs.horsepower, icon: '⚡', category: 'engine' },
    { key: 'torque', label: 'عزم الدوران', value: specs.torque, icon: '🔄', category: 'engine' },
    { key: 'transmission', label: 'ناقل الحركة', value: specs.transmission, icon: '⚙️', category: 'engine' },
    { key: 'fuelType', label: 'نوع الوقود', value: specs.fuelType, icon: '⛽', category: 'engine' },
    { key: 'fuelConsumption', label: 'استهلاك الوقود', value: specs.fuelConsumption, icon: '📊', category: 'engine' },
    { key: 'drivetrain', label: 'نوع الدفع', value: specs.drivetrain, icon: '🚗', category: 'engine' },
    { key: 'acceleration', label: 'التسارع 0-100', value: specs.acceleration, icon: '🚀', category: 'engine' },
    { key: 'topSpeed', label: 'السرعة القصوى', value: specs.topSpeed, icon: '🏎️', category: 'engine' },
    
    // Dimensions & Weight
    { key: 'length', label: 'الطول', value: specs.length, icon: '📏', category: 'dimensions' },
    { key: 'width', label: 'العرض', value: specs.width, icon: '📐', category: 'dimensions' },
    { key: 'height', label: 'الارتفاع', value: specs.height, icon: '📏', category: 'dimensions' },
    { key: 'wheelbase', label: 'قاعدة العجلات', value: specs.wheelbase, icon: '🛞', category: 'dimensions' },
    { key: 'curbWeight', label: 'الوزن الفارغ', value: specs.curbWeight, icon: '⚖️', category: 'dimensions' },
    { key: 'grossWeight', label: 'إجمالي الوزن', value: specs.grossWeight, icon: '⚖️', category: 'dimensions' },
    { key: 'loadCapacity', label: 'سعة التحميل', value: specs.loadCapacity, icon: '📦', category: 'dimensions' },
    { key: 'seatingCapacity', label: 'عدد المقاعد', value: specs.seatingCapacity, icon: '🪑', category: 'dimensions' },
    
    // Features & Equipment
    { key: 'safetyFeatures', label: 'مميزات الأمان', value: specs.safetyFeatures, icon: '🛡️', category: 'features' },
    { key: 'comfortFeatures', label: 'مميزات الراحة', value: specs.comfortFeatures, icon: '✨', category: 'features' },
    { key: 'infotainment', label: 'نظام المعلومات والترفيه', value: specs.infotainment, icon: '📱', category: 'features' },
    { key: 'driverAssistance', label: 'مساعدة السائق', value: specs.driverAssistance, icon: '🤖', category: 'features' },
    { key: 'exteriorFeatures', label: 'المميزات الخارجية', value: specs.exteriorFeatures, icon: '🌟', category: 'features' },
    { key: 'interiorFeatures', label: 'المميزات الداخلية', value: specs.interiorFeatures, icon: '🏠', category: 'features' },
    
    // Technical Specifications
    { key: 'tireSize', label: 'مقاس الإطارات', value: specs.tireSize, icon: '🛞', category: 'technical' },
    { key: 'suspension', label: 'نوع التعليق', value: specs.suspension, icon: '🔧', category: 'technical' },
    { key: 'brakes', label: 'نظام الكبح', value: specs.brakes, icon: '🛑', category: 'technical' },
    { key: 'steering', label: 'نظام التوجيه', value: specs.steering, icon: '🎯', category: 'technical' },
    { key: 'groundClearance', label: 'ارتفاع عن الأرض', value: specs.groundClearance, icon: '📏', category: 'technical' },
    
    // Additional Information
    { key: 'warranty', label: 'الضمان', value: specs.warranty, icon: '🔒', category: 'additional' },
    { key: 'detailedDescription', label: 'الوصف التفصيلي', value: specs.detailedDescription, icon: '📝', category: 'additional' },
    { key: 'notes', label: 'ملاحظات', value: specs.notes, icon: '📋', category: 'additional' },
  ];

  const availableSpecs = specsData.filter(spec => spec.value);

  // Group specifications by category
  const engineSpecs = availableSpecs.filter(spec => spec.category === 'engine');
  const dimensionSpecs = availableSpecs.filter(spec => spec.category === 'dimensions');
  const featureSpecs = availableSpecs.filter(spec => spec.category === 'features');
  const technicalSpecs = availableSpecs.filter(spec => spec.category === 'technical');
  const additionalSpecs = availableSpecs.filter(spec => spec.category === 'additional');

  const specCategories = [
    { name: 'المحرك والأداء', specs: engineSpecs, icon: '🔧' },
    { name: 'الأبعاد والوزن', specs: dimensionSpecs, icon: '📏' },
    { name: 'المميزات والتجهيزات', specs: featureSpecs, icon: '✨' },
    { name: 'المواصفات التقنية', specs: technicalSpecs, icon: '🔧' },
    { name: 'معلومات إضافية', specs: additionalSpecs, icon: '📋' }
  ].filter(category => category.specs.length > 0);

  return (
    <div className="space-y-6">
      {specCategories.length > 0 ? (
        specCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span role="img" aria-label={category.name}>{category.icon}</span>
              {category.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.specs.map((spec) => (
                <div 
                  key={spec.key} 
                  className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-lg" role="img" aria-label={spec.label}>
                      {spec.icon}
                    </span>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {spec.label}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <Info className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">لا توجد مواصفات تفصيلية متاحة</p>
        </div>
      )}
      
      {/* Vehicle Selection Summary */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">الاختيار الحالي</h6>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-blue-600 dark:text-blue-400">الصانع:</span>
            <span className="font-medium text-blue-800 dark:text-blue-200 ml-2">{manufacturer}</span>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400">الفئة:</span>
            <span className="font-medium text-blue-800 dark:text-blue-200 ml-2">{category}</span>
          </div>
          {trimLevel && (
            <div>
              <span className="text-blue-600 dark:text-blue-400">درجة التجهيز:</span>
              <span className="font-medium text-blue-800 dark:text-blue-200 ml-2">{trimLevel}</span>
            </div>
          )}
          <div>
            <span className="text-blue-600 dark:text-blue-400">السنة:</span>
            <span className="font-medium text-blue-800 dark:text-blue-200 ml-2">{year}</span>
          </div>
          <div className="col-span-2">
            <span className="text-blue-600 dark:text-blue-400">سعة المحرك:</span>
            <span className="font-medium text-blue-800 dark:text-blue-200 ml-2">{engineCapacity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function QuotationCreationPage({ vehicleData }: QuotationCreationPageProps) {
  const { companyName, companyLogo, darkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Check for editing quotation data first
  const [editingQuotation, setEditingQuotation] = useState<any | null>(() => {
    const storedQuotation = localStorage.getItem('editingQuotation');
    if (storedQuotation) {
      try {
        return JSON.parse(storedQuotation);
      } catch (error) {
        console.error('Error parsing editing quotation data:', error);
      }
    }
    return null;
  });

  // Parse vehicle data from localStorage if not provided as prop
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryItem | null>(() => {
    // If editing quotation, don't use any pre-selected vehicle
    if (editingQuotation) return null;
    
    if (vehicleData) return vehicleData;
    
    const storedVehicle = localStorage.getItem('selectedVehicleForQuote');
    if (storedVehicle) {
      try {
        const parsedVehicle = JSON.parse(storedVehicle);
        // Clear the stored vehicle data after reading it
        localStorage.removeItem('selectedVehicleForQuote');
        return parsedVehicle;
      } catch (error) {
        console.error('Error parsing stored vehicle data:', error);
      }
    }
    return null;
  });

  // Vehicle data selection states (for empty mode or editing)
  const [vehicleManufacturer, setVehicleManufacturer] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.manufacturer || "";
    if (selectedVehicle) return selectedVehicle.manufacturer || "";
    return "";
  });
  const [vehicleCategory, setVehicleCategory] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.category || "";
    if (selectedVehicle) return selectedVehicle.category || "";
    return "";
  });
  const [vehicleTrimLevel, setVehicleTrimLevel] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.trimLevel || "";
    if (selectedVehicle) return selectedVehicle.trimLevel || "";
    return "";
  });
  const [vehicleYear, setVehicleYear] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.year?.toString() || "";
    if (selectedVehicle) return selectedVehicle.year?.toString() || "";
    return "";
  });
  const [vehicleEngineCapacity, setVehicleEngineCapacity] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.engineCapacity || "";
    if (selectedVehicle) return selectedVehicle.engineCapacity || "";
    return "";
  });
  const [vehicleExteriorColor, setVehicleExteriorColor] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.exteriorColor || "";
    if (selectedVehicle) return selectedVehicle.exteriorColor || "";
    return "";
  });
  const [vehicleInteriorColor, setVehicleInteriorColor] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.interiorColor || "";
    if (selectedVehicle) return selectedVehicle.interiorColor || "";
    return "";
  });
  const [vehicleChassisNumber, setVehicleChassisNumber] = useState<string>(() => {
    if (editingQuotation) return editingQuotation.chassisNumber || "";
    if (selectedVehicle) return selectedVehicle.chassisNumber || "";
    return "";
  });
  const [vehiclePrice, setVehiclePrice] = useState<number>(() => {
    if (editingQuotation && editingQuotation.basePrice) return parseFloat(editingQuotation.basePrice);
    if (selectedVehicle && selectedVehicle.price) return selectedVehicle.price;
    return 0;
  });
  
  // Form states
  const [quoteNumber, setQuoteNumber] = useState<string>(() => {
    return editingQuotation?.quoteNumber || generateQuoteNumber();
  });
  const [customerName, setCustomerName] = useState<string>(editingQuotation?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState<string>(editingQuotation?.customerPhone || "");
  const [customerEmail, setCustomerEmail] = useState<string>(editingQuotation?.customerEmail || "");
  const [customerTitle, setCustomerTitle] = useState<string>(editingQuotation?.customerTitle || "السادة");
  const [validityDays, setValidityDays] = useState<number>(3);
  const [notes, setNotes] = useState<string>(editingQuotation?.notes || "");
  const [isInvoiceMode, setIsInvoiceMode] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [authorizationNumber, setAuthorizationNumber] = useState<string>("");
  
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
    queryKey: ["/api/companies"]
  });

  // Fetch manufacturers for dropdown selection
  const { data: manufacturers = [] } = useQuery<any[]>({
    queryKey: ["/api/manufacturers"]
  });

  // Fetch categories based on selected manufacturer (for both main form and edit dialog)
  const { data: categories = [] } = useQuery<{ category: string }[]>({
    queryKey: [`/api/categories/${vehicleManufacturer || editingQuotation?.manufacturer}`],
    enabled: !!(vehicleManufacturer || editingQuotation?.manufacturer)
  });

  // Fetch trim levels based on selected manufacturer and category (for both main form and edit dialog)
  const { data: trimLevels = [] } = useQuery<any[]>({
    queryKey: [`/api/trim-levels/category/${vehicleManufacturer || editingQuotation?.manufacturer}/${vehicleCategory || editingQuotation?.category}`],
    enabled: !!(vehicleManufacturer || editingQuotation?.manufacturer) && !!(vehicleCategory || editingQuotation?.category)
  });

  // Vehicle editing state for editable form
  const [editingVehicleData, setEditingVehicleData] = useState({
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

  // Fetch categories for editing dialog
  const { data: editingCategories = [] } = useQuery<{ category: string }[]>({
    queryKey: [`/api/categories/${editingVehicleData.manufacturer}`],
    enabled: !!editingVehicleData.manufacturer
  });

  // Fetch trim levels for editing dialog
  const { data: editingTrimLevels = [] } = useQuery<any[]>({
    queryKey: [`/api/trim-levels/category/${editingVehicleData.manufacturer}/${editingVehicleData.category}`],
    enabled: !!(editingVehicleData.manufacturer && editingVehicleData.category)
  });

  // Fetch engine capacities
  const { data: engineCapacities = [] } = useQuery<{ engineCapacity: string }[]>({
    queryKey: ["/api/engine-capacities"]
  });

  // Query for all available vehicles from cars database (not just inventory)
  const { data: availableVehicles = [] } = useQuery({
    queryKey: ["/api/cars/all-vehicles"]
  });
  


  // Management windows states
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  
  const [quotesViewOpen, setQuotesViewOpen] = useState(false);
  const [vehicleEditOpen, setVehicleEditOpen] = useState(false);
  const [editableVehicle, setEditableVehicle] = useState<InventoryItem>(() => {
    // If editing existing quotation, use its data
    if (editingQuotation) {
      return {
        id: Date.now(),
        manufacturer: editingQuotation.manufacturer || "",
        category: editingQuotation.category || "",
        trimLevel: editingQuotation.trimLevel || "",
        year: parseInt(editingQuotation.year) || new Date().getFullYear(),
        engineCapacity: editingQuotation.engineCapacity || "",
        exteriorColor: editingQuotation.exteriorColor || "",
        interiorColor: editingQuotation.interiorColor || "",
        chassisNumber: editingQuotation.chassisNumber || "",
        price: parseFloat(editingQuotation.basePrice) || 0,
        status: "",
        location: "",
        importType: "",
        ownershipType: "",
        entryDate: new Date(),
        isSold: false,
        notes: "",
        images: [],
        logo: null,
        detailedSpecifications: null,
        soldDate: null,
        soldPrice: null,
        profit: null,
        buyer: null,
        soldBySalesRep: null,
        reservedBy: null,
        reservationDate: null,
        reservationNotes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as InventoryItem;
    }
    
    // If coming from selected vehicle, use its data
    if (selectedVehicle) return selectedVehicle;
    
    // For new quotation (عرض جديد), always start with empty fields
    return {
      id: Date.now(),
      manufacturer: "",
      category: "",
      trimLevel: "",
      year: new Date().getFullYear(),
      engineCapacity: "",
      exteriorColor: "",
      interiorColor: "",
      chassisNumber: "",
      price: 0,
      status: "",
      location: "",
      importType: "",
      ownershipType: "",
      entryDate: new Date(),
      isSold: false,
      notes: "",
      images: [],
      logo: null,
      detailedSpecifications: null,
      soldDate: null,
      soldPrice: null,
      profit: null,
      buyer: null,
      soldBySalesRep: null,
      reservedBy: null,
      reservationDate: null,
      reservationNotes: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as InventoryItem;
  });
  const [vehicleDescriptionOpen, setVehicleDescriptionOpen] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [selectedVehicleFromDB, setSelectedVehicleFromDB] = useState<any>(null);
  
  // Filter states for vehicle selection dialog
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTrimLevel, setFilterTrimLevel] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterEngineCapacity, setFilterEngineCapacity] = useState("all");
  const [filterImportType, setFilterImportType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterExteriorColor, setFilterExteriorColor] = useState("all");
  const [filterInteriorColor, setFilterInteriorColor] = useState("all");
  
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
    taxNumber: "123456789",
    registrationNumber: "1234567890",
    licenseNumber: "L123456789"
  });

  // Update company data when selected company changes
  useEffect(() => {
    if (selectedCompanyData) {
      setCompanyData({
        name: selectedCompanyData.name,
        logo: selectedCompanyData.logo || "",
        address: selectedCompanyData.address,
        phone: selectedCompanyData.phone || "",
        email: selectedCompanyData.email,
        website: selectedCompanyData.website || "",
        taxNumber: selectedCompanyData.taxNumber,
        registrationNumber: selectedCompanyData.registrationNumber,
        licenseNumber: selectedCompanyData.licenseNumber
      });
      
      // Update appearance based on company colors
      setQuoteAppearance(prev => ({
        ...prev,
        primaryColor: selectedCompanyData.primaryColor || "#0F172A",
        secondaryColor: selectedCompanyData.secondaryColor || "#64748B"
      }));
    }
  }, [selectedCompanyData]);
  
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

  // Pricing details state
  const [pricingDetails, setPricingDetails] = useState<PricingDetails>(() => {
    // Initialize from editing quotation if available
    if (editingQuotation?.pricingDetails) {
      try {
        const parsed = JSON.parse(editingQuotation.pricingDetails);
        return {
          basePrice: parsed.basePrice || selectedVehicle?.price || 0,
          quantity: parsed.quantity || 1,
          licensePlatePrice: parsed.licensePlatePrice || 900,
          includeLicensePlate: parsed.includeLicensePlate ?? true,
          licensePlateSubjectToTax: parsed.licensePlateSubjectToTax ?? false,
          taxRate: parsed.taxRate || 15,
          isVATInclusive: parsed.isVATInclusive ?? false,
        };
      } catch (error) {
        console.error('Error parsing pricing details from editing quotation:', error);
      }
    }
    return {
      basePrice: selectedVehicle?.price || 0,
      quantity: 1,
      licensePlatePrice: 900,
      includeLicensePlate: true,
      licensePlateSubjectToTax: false,
      taxRate: 15,
      isVATInclusive: false,
    };
  });

  // New state variables for enhanced features
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  const [termsRefreshTrigger, setTermsRefreshTrigger] = useState(0);
  const [companyStamp, setCompanyStamp] = useState<string | null>("/company-stamp.png");
  const [showStamp, setShowStamp] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  


  // Load existing terms and conditions
  const { data: existingTerms = [] } = useQuery<Array<{ id: number; term_text: string; display_order: number }>>({
    queryKey: ['/api/terms-conditions']
  });

  // Update terms content when existing terms are loaded
  useEffect(() => {
    if (existingTerms.length > 0 && !termsContent) {
      const termsText = existingTerms.map(term => term.term_text).join('\n');
      setTermsContent(termsText);
    }
  }, [existingTerms, termsContent]);

  // Clear editing quotation from localStorage after loading
  useEffect(() => {
    if (editingQuotation) {
      localStorage.removeItem('editingQuotation');
    }
  }, [editingQuotation]);

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
  const convertToInvoice = async () => {
    try {
      // Generate invoice number with 6-digit serial format
      const newInvoiceNumber = generateInvoiceNumber();
      
      // Switch to invoice mode
      setIsInvoiceMode(true);
      setInvoiceNumber(newInvoiceNumber);
      
      // Calculate totals (with fallback for empty data)
      const totals = calculateTotals();
      
      // Get current vehicle data (from selected vehicle or form inputs)
      const currentVehicle = selectedVehicle || editableVehicle || {
        id: Date.now(),
        manufacturer: vehicleManufacturer || "غير محدد",
        category: vehicleCategory || "غير محدد",
        trimLevel: vehicleTrimLevel || "",
        year: parseInt(vehicleYear) || new Date().getFullYear(),
        exteriorColor: vehicleExteriorColor || "",
        interiorColor: vehicleInteriorColor || "",
        chassisNumber: vehicleChassisNumber || "",
        engineCapacity: vehicleEngineCapacity || "",
        price: vehiclePrice || 0
      };
      
      // Prepare invoice data with fallback values for missing fields
      const invoiceData = {
        invoiceNumber: newInvoiceNumber,
        quoteNumber: quoteNumber || generateQuoteNumber(),
        inventoryItemId: currentVehicle.id || null,
        manufacturer: currentVehicle.manufacturer || "غير محدد",
        category: currentVehicle.category || "غير محدد",
        trimLevel: currentVehicle.trimLevel || "",
        year: currentVehicle.year || new Date().getFullYear(),
        exteriorColor: currentVehicle.exteriorColor || "",
        interiorColor: currentVehicle.interiorColor || "",
        chassisNumber: currentVehicle.chassisNumber || "",
        engineCapacity: currentVehicle.engineCapacity || "",
        specifications: vehicleSpecs?.detailedDescription || "",
        basePrice: pricingDetails.basePrice.toString(),
        finalPrice: totals.finalTotal.toString(),
        customerName: customerName || "عميل غير محدد",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
        notes: notes || "",
        status: "مسودة",
        paymentStatus: "غير مدفوع",
        remainingAmount: totals.finalTotal.toString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        createdBy: "system", // Should be current user
        companyData: JSON.stringify(selectedCompanyData || {}),
        representativeData: JSON.stringify(representatives.find(r => r.id === selectedRepresentative) || {}),
        pricingDetails: JSON.stringify(pricingDetails),
        qrCodeData: JSON.stringify({ invoiceNumber: newInvoiceNumber, customerName: customerName || "عميل غير محدد", finalPrice: totals.finalTotal }),
        authorizationNumber: authorizationNumber || ""
      };

      // Create invoice via API
      const response = await apiRequest('POST', '/api/invoices', invoiceData);
      
      toast({
        title: "تم التحويل بنجاح",
        description: `تم تحويل العرض إلى فاتورة رقم ${newInvoiceNumber}`,
      });

      // Store invoice data for potential future use
      localStorage.setItem('lastInvoiceData', JSON.stringify(response));
      
    } catch (error) {
      console.error("Error converting to invoice:", error);
      toast({
        title: "خطأ في التحويل",
        description: "حدث خطأ أثناء تحويل العرض إلى فاتورة",
        variant: "destructive",
      });
    }
  };

  // Save quotation or invoice
  const saveQuotation = async () => {
    try {
      // Calculate totals
      const totals = calculateTotals();
      
      // Get current vehicle data (from selected vehicle or form inputs)
      const currentVehicle = selectedVehicle || editableVehicle || {
        id: Date.now(),
        manufacturer: vehicleManufacturer || "غير محدد",
        category: vehicleCategory || "غير محدد",
        trimLevel: vehicleTrimLevel || "",
        year: parseInt(vehicleYear) || new Date().getFullYear(),
        exteriorColor: vehicleExteriorColor || "",
        interiorColor: vehicleInteriorColor || "",
        chassisNumber: vehicleChassisNumber || "",
        engineCapacity: vehicleEngineCapacity || "",
        price: vehiclePrice || 0
      };
      
      // Prepare quotation data
      const quotationData = {
        quoteNumber: quoteNumber || generateQuoteNumber(),
        inventoryItemId: currentVehicle.id || null,
        manufacturer: currentVehicle.manufacturer || "غير محدد",
        category: currentVehicle.category || "غير محدد",
        trimLevel: currentVehicle.trimLevel || "",
        year: currentVehicle.year || new Date().getFullYear(),
        exteriorColor: currentVehicle.exteriorColor || "",
        interiorColor: currentVehicle.interiorColor || "",
        chassisNumber: currentVehicle.chassisNumber || "",
        engineCapacity: currentVehicle.engineCapacity || "",
        specifications: vehicleSpecs?.detailedDescription || "",
        basePrice: pricingDetails.basePrice.toString(),
        finalPrice: totals.finalTotal.toString(),
        customerName: customerName || "عميل غير محدد",
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || "",
        notes: notes || "",
        status: "مسودة",
        validityDays: validityDays || 30,
        createdBy: "system", // Should be current user
        companyData: JSON.stringify(selectedCompanyData || {}),
        representativeData: JSON.stringify(representatives.find(r => r.id === selectedRepresentative) || {}),
        pricingDetails: JSON.stringify(pricingDetails),
        qrCodeData: JSON.stringify({ quoteNumber: quoteNumber || generateQuoteNumber(), customerName: customerName || "عميل غير محدد", finalPrice: totals.finalTotal })
      };

      // Save as quotation or invoice based on mode
      let response;
      if (isInvoiceMode) {
        // Generate invoice number if not exists
        const newInvoiceNumber = invoiceNumber || generateInvoiceNumber();
        setInvoiceNumber(newInvoiceNumber);
        
        // Prepare invoice data
        const invoiceData = {
          ...quotationData,
          invoiceNumber: newInvoiceNumber,
          quoteNumber: quoteNumber,
          paymentStatus: "غير مدفوع",
          remainingAmount: totals.finalTotal.toString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          authorizationNumber: authorizationNumber || ""
        };
        
        // Save as invoice
        response = await apiRequest('POST', '/api/invoices', invoiceData);
        localStorage.setItem('lastInvoiceData', JSON.stringify(response));
      } else {
        // Check if we're editing existing quotation
        if (editingQuotation?.id) {
          // Update existing quotation
          response = await apiRequest('PUT', `/api/quotations/${editingQuotation.id}`, quotationData);
          localStorage.setItem('lastQuotationData', JSON.stringify(response));
        } else {
          // Create new quotation
          response = await apiRequest('POST', '/api/quotations', quotationData);
          localStorage.setItem('lastQuotationData', JSON.stringify(response));
        }
      }
      
      toast({
        title: "تم الحفظ بنجاح",
        description: `تم حفظ ${isInvoiceMode ? 'الفاتورة' : 'عرض السعر'} بنجاح`,
      });
      
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast({
        title: "خطأ في الحفظ",
        description: `حدث خطأ أثناء حفظ ${isInvoiceMode ? 'الفاتورة' : 'عرض السعر'}`,
        variant: "destructive",
      });
    }
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

  // Handle saving terms and conditions
  const handleSaveTerms = async () => {
    try {
      const response = await apiRequest('POST', '/api/terms-conditions', {
        content: termsContent
      });
      
      toast({
        title: "تم بنجاح",
        description: "تم حفظ الشروط والأحكام بنجاح",
        variant: "default",
      });
      
      setShowTermsDialog(false);
      
      // Refresh terms in the preview component
      queryClient.invalidateQueries({ queryKey: ['/api/terms-conditions'] });
      
      // Trigger refresh of terms in preview component
      setTermsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error saving terms:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الشروط والأحكام",
        variant: "destructive",
      });
    }
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
  const { data: manufacturersWithLogo = [] } = useQuery<Array<{
    id: number;
    name: string;
    logo: string | null;
  }>>({
    queryKey: ["/api/manufacturers"],
    enabled: !!selectedVehicle
  });

  // Find manufacturer logo
  const manufacturerData = manufacturersWithLogo.find(m => m.name === selectedVehicle?.manufacturer);

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

  // Query for vehicle specifications based on editingVehicleData (for editing dialog)
  const { data: editingVehicleSpecs, isLoading: editingSpecsLoading } = useQuery<Specification>({
    queryKey: ['/api/specifications', editingVehicleData.manufacturer, editingVehicleData.category, editingVehicleData.trimLevel, editingVehicleData.year, editingVehicleData.engineCapacity],
    enabled: !!(editingVehicleData.manufacturer && editingVehicleData.category && editingVehicleData.year && editingVehicleData.engineCapacity),
    queryFn: async () => {
      if (!editingVehicleData.manufacturer || !editingVehicleData.category || !editingVehicleData.year || !editingVehicleData.engineCapacity) return null;
      
      const response = await fetch(
        `/api/specifications/${editingVehicleData.manufacturer}/${editingVehicleData.category}/${editingVehicleData.trimLevel || 'null'}/${editingVehicleData.year}/${editingVehicleData.engineCapacity}`
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
  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      setDownloadLoading(true);
      
      // Get the quotation preview element
      const element = document.querySelector('[data-pdf-export="quotation"]');
      if (!element) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على معاينة العرض",
          variant: "destructive",
        });
        return;
      }
      
      // Convert to canvas with higher quality
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate scale to fit A4
      const scale = Math.min(pdfWidth / (canvasWidth * 0.264583), pdfHeight / (canvasHeight * 0.264583));
      const scaledWidth = canvasWidth * 0.264583 * scale;
      const scaledHeight = canvasHeight * 0.264583 * scale;
      
      // Center the image
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = (pdfHeight - scaledHeight) / 2;
      
      // Add canvas to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
      
      // Generate filename
      const vehicleInfo = selectedVehicle || editableVehicle;
      const filename = `عرض_سعر_${vehicleInfo?.manufacturer || 'البريمي'}_${vehicleInfo?.category || 'سيارة'}_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.pdf`;
      
      // Save PDF
      pdf.save(filename);
      
      toast({
        title: "تم التحميل بنجاح",
        description: "تم تحميل العرض بصيغة PDF بنجاح",
      });
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل العرض",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };
  
  // Handle print quotation
  const handlePrintQuotation = () => {
    try {
      // Get the quotation preview element
      const element = document.querySelector('[data-pdf-export="quotation"]');
      if (!element) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على معاينة العرض",
          variant: "destructive",
        });
        return;
      }
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "خطأ",
          description: "لم يتم السماح بفتح نافذة جديدة للطباعة",
          variant: "destructive",
        });
        return;
      }
      
      // Copy styles and content to print window
      printWindow.document.write(`
        <html>
          <head>
            <title>طباعة العرض</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
              }
              ${Array.from(document.styleSheets).map(sheet => {
                try {
                  return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
                } catch (e) {
                  return '';
                }
              }).join('\n')}
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      toast({
        title: "تم التحضير للطباعة",
        description: "تم تحضير العرض للطباعة بنجاح",
      });
      
    } catch (error) {
      console.error('Error printing quotation:', error);
      toast({
        title: "خطأ في الطباعة",
        description: "حدث خطأ أثناء تحضير العرض للطباعة",
        variant: "destructive",
      });
    }
  };

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

  // Initialize editing vehicle data when vehicle edit dialog opens
  React.useEffect(() => {
    if (vehicleEditOpen && editableVehicle) {
      setEditingVehicleData({
        manufacturer: editableVehicle.manufacturer || "",
        category: editableVehicle.category || "",
        trimLevel: editableVehicle.trimLevel || "",
        year: editableVehicle.year?.toString() || "",
        engineCapacity: editableVehicle.engineCapacity || "",
        exteriorColor: editableVehicle.exteriorColor || "",
        interiorColor: editableVehicle.interiorColor || "",
        chassisNumber: editableVehicle.chassisNumber || "",
        price: editableVehicle.price || 0
      });
    }
  }, [vehicleEditOpen, editableVehicle]);

  // Create quotation mutation
  const createQuotationMutation = useMutation({
    mutationFn: async (data: InsertQuotation) => {
      const response = await apiRequest('POST', '/api/quotations', data);
      return response;
    },
    onSuccess: (response) => {
      toast({
        title: "تم حفظ عرض السعر",
        description: "تم حفظ عرض السعر بنجاح ويمكنك الآن رؤيته في صفحة العروض",
      });
      // Invalidate quotations cache to refresh the quotations list
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      queryClient.refetchQueries({ queryKey: ['/api/quotations'] });
      
      // Set the saved quotation for preview
      if (response.id) {
        // Store the quotation ID for future reference
        localStorage.setItem('lastSavedQuotationId', response.id.toString());
      }
    },
    onError: (error) => {
      toast({
        title: "خطأ في حفظ عرض السعر",
        description: "حدث خطأ أثناء حفظ عرض السعر. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const handleSaveQuotation = () => {
    if (!editableVehicle) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى التأكد من اختيار السيارة",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    
    // Get selected representative and company data (use defaults if not selected)
    const selectedRepData = representatives.find(rep => rep.id === selectedRepresentative) || {
      id: "",
      name: "",
      phone: "",
      email: "",
      position: ""
    };
    const selectedCompanyData = companies.find(comp => comp.id === selectedCompany) || {
      id: 0,
      name: "",
      logo: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      taxNumber: "",
      primaryColor: "#1a73e8",
      secondaryColor: "#34a853",
      isActive: true
    };

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

    if (isInvoiceMode) {
      // Save as invoice
      const invoiceData = {
        quoteNumber,
        invoiceNumber: invoiceNumber || generateInvoiceNumber(),
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
        basePrice: pricingDetails.basePrice.toString() || "0",
        finalPrice: totals.finalTotal.toString() || "0",
        customerName: customerName.trim() || "غير محدد",
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerTitle: customerTitle.trim(),
        notes: notes.trim(),
        validUntil: validUntilDate.toISOString(),
        status: "مسودة",
        paymentStatus: "غير مدفوع",
        remainingAmount: totals.finalTotal.toString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: "admin",
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

      // Use a separate API call for invoices
      apiRequest('POST', '/api/invoices', invoiceData)
        .then(() => {
          toast({
            title: "تم حفظ الفاتورة",
            description: "تم حفظ الفاتورة بنجاح",
          });
          queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
          queryClient.refetchQueries({ queryKey: ['/api/invoices'] });
        })
        .catch((error) => {
          toast({
            title: "خطأ في حفظ الفاتورة",
            description: "حدث خطأ أثناء حفظ الفاتورة",
            variant: "destructive",
          });
        });
    } else {
      // Save as quotation
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
        basePrice: pricingDetails.basePrice.toString() || "0",
        finalPrice: totals.finalTotal.toString() || "0",
        customerName: customerName.trim() || "غير محدد",
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerTitle: customerTitle.trim(),
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
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">

      
      {/* Header */}
      <header className="dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 no-print mt-[8px] mb-[8px] pt-[37px] pb-[37px] pl-[-9px] pr-[-9px] bg-[#ffffff]">
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
              
              {/* Toggle Switch for Stamp Visibility */}
              <div className="flex items-center space-x-2 space-x-reverse border border-red-500 rounded-lg px-3 py-2 bg-white">
                <Label htmlFor="stamp-visibility" className="text-sm font-medium text-red-600">
                  {showStamp ? "إخفاء الختم" : "إظهار الختم"}
                </Label>
                <Switch
                  id="stamp-visibility"
                  checked={showStamp}
                  onCheckedChange={(checked) => {
                    setShowStamp(checked);
                    toast({
                      title: checked ? "تم إظهار الختم" : "تم إخفاء الختم",
                      description: checked ? "سيظهر ختم الشركة في العرض" : "لن يظهر ختم الشركة في العرض",
                    });
                  }}
                  className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-red-100"
                />
              </div>
              

              
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
                onClick={handleSaveQuotation}
                disabled={createQuotationMutation.isPending}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <Save size={16} className="ml-2" />
                {createQuotationMutation.isPending ? "جاري الحفظ..." : `حفظ ${isInvoiceMode ? "الفاتورة" : "العرض"}`}
              </Button>
              
              {/* Toggle Switch for Invoice/Quotation Mode */}
              <div className="flex items-center space-x-2 space-x-reverse border border-purple-500 rounded-lg px-3 py-2 bg-white">
                <Label htmlFor="invoice-mode" className="text-sm font-medium text-purple-600">
                  {isInvoiceMode ? "فاتورة" : "عرض سعر"}
                </Label>
                <Switch
                  id="invoice-mode"
                  checked={isInvoiceMode}
                  onCheckedChange={(checked) => {
                    setIsInvoiceMode(checked);
                    if (checked) {
                      // Generate invoice number when switching to invoice mode
                      const newInvoiceNumber = generateInvoiceNumber();
                      setInvoiceNumber(newInvoiceNumber);
                      toast({
                        title: "تم التبديل إلى وضع الفاتورة",
                        description: `رقم الفاتورة: ${newInvoiceNumber}`,
                      });
                    } else {
                      toast({
                        title: "تم التبديل إلى وضع عرض السعر",
                        description: "يمكنك الآن إنشاء عرض سعر",
                      });
                    }
                  }}
                  className="data-[state=checked]:bg-purple-600"
                />
                <FileUp size={16} className="text-purple-600" />
              </div>
              
              <Link href="/quotation-management">
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <FileText size={16} className="ml-2" />
                  العروض
                </Button>
              </Link>
              
              <Link href="/invoice-management">
                <Button
                  variant="outline"
                  className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                >
                  <FileText size={16} className="ml-2" />
                  الفواتير
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Vehicle Info & Basic Form */}
          <div className="space-y-6">
            
            {/* Vehicle Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="ml-2" size={20} />
                  {selectedVehicle ? "بيانات السيارة المختارة" : "اختيار بيانات السيارة"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVehicle ? (
                  // Existing Vehicle Display
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
                          onClick={() => {
                            // Pre-populate editing form with current vehicle data
                            setEditingVehicleData({
                              manufacturer: editableVehicle?.manufacturer || "",
                              category: editableVehicle?.category || "",
                              trimLevel: editableVehicle?.trimLevel || "",
                              year: editableVehicle?.year?.toString() || "",
                              engineCapacity: editableVehicle?.engineCapacity || "",
                              exteriorColor: editableVehicle?.exteriorColor || "",
                              interiorColor: editableVehicle?.interiorColor || "",
                              chassisNumber: editableVehicle?.chassisNumber || "",
                              price: editableVehicle?.price || 0
                            });
                            setVehicleEditOpen(true);
                          }}
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
                ) : (
                  // Vehicle Data Selection Form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Manufacturer Selection */}
                      <div>
                        <Label htmlFor="manufacturer">الصانع</Label>
                        <Select value={vehicleManufacturer} onValueChange={(value) => {
                          setVehicleManufacturer(value);
                          setVehicleCategory(""); // Clear category when manufacturer changes
                          setVehicleTrimLevel(""); // Clear trim level when manufacturer changes
                        }}>
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

                      {/* Category Selection */}
                      <div>
                        <Label htmlFor="category">الفئة</Label>
                        <Select value={vehicleCategory} onValueChange={(value) => {
                          setVehicleCategory(value);
                          setVehicleTrimLevel(""); // Clear trim level when category changes
                        }} disabled={!vehicleManufacturer}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.category} value={category.category}>
                                {category.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Trim Level Selection */}
                      <div>
                        <Label htmlFor="trimLevel">درجة التجهيز</Label>
                        <Select value={vehicleTrimLevel} onValueChange={setVehicleTrimLevel} disabled={!vehicleCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر درجة التجهيز" />
                          </SelectTrigger>
                          <SelectContent>
                            {trimLevels.map((trimLevel) => (
                              <SelectItem key={trimLevel.id} value={trimLevel.trimLevel}>
                                {trimLevel.trimLevel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Year Selection */}
                      <div>
                        <Label htmlFor="year">السنة</Label>
                        <Select value={vehicleYear} onValueChange={setVehicleYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر السنة" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Engine Capacity Selection */}
                      <div>
                        <Label htmlFor="engineCapacity">سعة المحرك</Label>
                        <Select value={vehicleEngineCapacity} onValueChange={setVehicleEngineCapacity}>
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
                          value={vehicleExteriorColor}
                          onChange={(e) => setVehicleExteriorColor(e.target.value)}
                          placeholder="أدخل اللون الخارجي"
                        />
                      </div>

                      {/* Interior Color */}
                      <div>
                        <Label htmlFor="interiorColor">اللون الداخلي</Label>
                        <Input
                          id="interiorColor"
                          value={vehicleInteriorColor}
                          onChange={(e) => setVehicleInteriorColor(e.target.value)}
                          placeholder="أدخل اللون الداخلي"
                        />
                      </div>

                      {/* Chassis Number */}
                      <div>
                        <Label htmlFor="chassisNumber">رقم الهيكل</Label>
                        <Input
                          id="chassisNumber"
                          value={vehicleChassisNumber}
                          onChange={(e) => setVehicleChassisNumber(e.target.value)}
                          placeholder="أدخل رقم الهيكل"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <Label htmlFor="price">السعر</Label>
                        <Input
                          id="price"
                          type="number"
                          value={vehiclePrice}
                          onChange={(e) => setVehiclePrice(Number(e.target.value))}
                          placeholder="أدخل السعر"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => setVehicleDescriptionOpen(true)}
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700"
                      >
                        <Search size={16} className="ml-2" />
                        اختيار سيارة موجودة
                      </Button>
                      
                      <Button
                        onClick={() => {
                          if (vehicleManufacturer && vehicleCategory && vehicleYear && vehicleEngineCapacity) {
                            const newVehicle = {
                              id: Date.now(),
                              manufacturer: vehicleManufacturer,
                              category: vehicleCategory,
                              trimLevel: vehicleTrimLevel,
                              year: parseInt(vehicleYear),
                              engineCapacity: vehicleEngineCapacity,
                              exteriorColor: vehicleExteriorColor,
                              interiorColor: vehicleInteriorColor,
                              chassisNumber: vehicleChassisNumber,
                              price: vehiclePrice,
                              entryDate: new Date(),
                              status: "متوفر",
                              importType: "مستعمل",
                              location: "الرياض",
                              notes: ""
                            };
                            setSelectedVehicle(newVehicle);
                            setEditableVehicle(newVehicle);
                            setPricingDetails(prev => ({
                              ...prev,
                              basePrice: vehiclePrice
                            }));
                          }
                        }}
                        disabled={!vehicleManufacturer || !vehicleCategory || !vehicleYear || !vehicleEngineCapacity}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus size={16} className="ml-2" />
                        إنشاء السيارة
                      </Button>
                    </div>

                    {/* Enhanced Vehicle Specifications Display */}
                    {vehicleManufacturer && vehicleCategory && vehicleYear && vehicleEngineCapacity && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                        <div className="flex items-center space-x-3 space-x-reverse mb-4">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-100">المواصفات التفصيلية</h4>
                        </div>
                        <VehicleSpecificationsDisplayComponent 
                          manufacturer={vehicleManufacturer}
                          category={vehicleCategory}
                          trimLevel={vehicleTrimLevel}
                          year={vehicleYear}
                          engineCapacity={vehicleEngineCapacity}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information Form or Authorization */}
            <Card>
              <CardHeader>
                <CardTitle>{isInvoiceMode ? "تخويل الفاتورة" : "بيانات العميل"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isInvoiceMode ? (
                  // Authorization number field for invoice mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
                        <Input
                          id="invoiceNumber"
                          value={invoiceNumber}
                          readOnly
                          className="bg-slate-50 dark:bg-slate-800"
                          placeholder="INV-123456"
                        />
                      </div>
                      <div>
                        <Label htmlFor="authorizationNumber">بناء على تخويدكم رقم:</Label>
                        <Input
                          id="authorizationNumber"
                          value={authorizationNumber}
                          onChange={(e) => setAuthorizationNumber(e.target.value)}
                          placeholder="أدخل رقم التخويل"
                          className="font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Original customer and representative data
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quoteNumber">رقم عرض السعر</Label>
                        <Input
                          id="quoteNumber"
                          value={quoteNumber}
                          readOnly
                          className="bg-slate-50 dark:bg-slate-800"
                          placeholder="Q-123456"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerTitle">كنية العميل *</Label>
                        <Select value={customerTitle} onValueChange={setCustomerTitle}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الكنية" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="السادة">السادة</SelectItem>
                            <SelectItem value="السيد">السيد</SelectItem>
                            <SelectItem value="السيدة">السيدة</SelectItem>
                            <SelectItem value="الشيخ">الشيخ</SelectItem>
                            <SelectItem value="سمو الأمير">سمو الأمير</SelectItem>
                          </SelectContent>
                        </Select>
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
                          onChange={(e) => setValidityDays(parseInt(e.target.value) || 3)}
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

                    </div>

                  </div>
                )}
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
                      className="rounded accent-[#C49632]"
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
                      className="rounded accent-[#C49632]"
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
                          className="rounded accent-[#C49632]"
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
                  onClick={handleDownloadPDF}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={downloadLoading}
                >
                  {downloadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="ml-2" />
                      تحميل العرض PDF
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handlePrintQuotation}
                  variant="outline"
                  className="w-full"
                >
                  <Printer size={16} className="ml-2" />
                  طباعة العرض
                </Button>
              </CardContent>
            </Card>


          </div>
        </div>
        
        {/* A4 Preview Section - Bottom */}
        <QuotationA4Preview
          selectedCompany={selectedCompanyData}
          selectedVehicle={editableVehicle}
          vehicleSpecs={vehicleSpecs}
          quoteNumber={quoteNumber}
          customerName={customerName}
          customerPhone={customerPhone}
          customerEmail={customerEmail}
          customerTitle={customerTitle}
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
          termsRefreshTrigger={termsRefreshTrigger}
          companyStamp={showStamp ? companyStamp : null}
          isInvoiceMode={isInvoiceMode}
          invoiceNumber={invoiceNumber}
        />
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



      

      {/* Vehicle Description and Selection Dialog */}
      <Dialog open={vehicleDescriptionOpen} onOpenChange={setVehicleDescriptionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>اختيار سيارة من قاعدة البيانات</DialogTitle>
            <DialogDescription>
              يمكنك البحث واختيار أي سيارة من قاعدة البيانات الكاملة لإنشاء عرض السعر
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث برقم الهيكل، الصانع، الفئة، أو اللون..."
                value={vehicleSearchQuery}
                onChange={(e) => setVehicleSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <Label className="text-sm font-medium">الفئة</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.category))).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">درجة التجهيز</Label>
                <Select value={filterTrimLevel} onValueChange={setFilterTrimLevel}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.trimLevel).filter(Boolean))).map((trimLevel) => (
                      <SelectItem key={trimLevel} value={trimLevel}>
                        {trimLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">السنة</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.year.toString()))).sort((a, b) => parseInt(b) - parseInt(a)).map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">سعة المحرك</Label>
                <Select value={filterEngineCapacity} onValueChange={setFilterEngineCapacity}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.engineCapacity).filter(Boolean))).map((capacity) => (
                      <SelectItem key={capacity} value={capacity}>
                        {capacity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">نوع الاستيراد</Label>
                <Select value={filterImportType} onValueChange={setFilterImportType}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.importType).filter(Boolean))).map((importType) => (
                      <SelectItem key={importType} value={importType}>
                        {importType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">الحالة</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.status).filter(Boolean))).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">اللون الخارجي</Label>
                <Select value={filterExteriorColor} onValueChange={setFilterExteriorColor}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.exteriorColor).filter(Boolean))).map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">اللون الداخلي</Label>
                <Select value={filterInteriorColor} onValueChange={setFilterInteriorColor}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {Array.from(new Set(availableVehicles.map((v: any) => v.interiorColor).filter(Boolean))).map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterCategory("all");
                    setFilterTrimLevel("all");
                    setFilterYear("all");
                    setFilterEngineCapacity("all");
                    setFilterImportType("all");
                    setFilterStatus("all");
                    setFilterExteriorColor("all");
                    setFilterInteriorColor("all");
                    setVehicleSearchQuery("");
                  }}
                  className="h-8 text-red-600 hover:text-red-700"
                >
                  <X size={14} className="ml-1" />
                  مسح الفلاتر
                </Button>
              </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableVehicles
                .filter((vehicle: any) => {
                  // Search filter
                  const searchMatch = !vehicleSearchQuery || 
                    vehicle.chassisNumber?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    vehicle.manufacturer?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    vehicle.category?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    vehicle.exteriorColor?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    vehicle.interiorColor?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
                    vehicle.engineCapacity?.toLowerCase().includes(vehicleSearchQuery.toLowerCase());
                  
                  // Filter conditions
                  const categoryMatch = filterCategory === "all" || vehicle.category === filterCategory;
                  const trimLevelMatch = filterTrimLevel === "all" || vehicle.trimLevel === filterTrimLevel;
                  const yearMatch = filterYear === "all" || vehicle.year.toString() === filterYear;
                  const engineCapacityMatch = filterEngineCapacity === "all" || vehicle.engineCapacity === filterEngineCapacity;
                  const importTypeMatch = filterImportType === "all" || vehicle.importType === filterImportType;
                  const statusMatch = filterStatus === "all" || vehicle.status === filterStatus;
                  const exteriorColorMatch = filterExteriorColor === "all" || vehicle.exteriorColor === filterExteriorColor;
                  const interiorColorMatch = filterInteriorColor === "all" || vehicle.interiorColor === filterInteriorColor;
                  
                  return searchMatch && categoryMatch && trimLevelMatch && yearMatch && 
                         engineCapacityMatch && importTypeMatch && statusMatch && 
                         exteriorColorMatch && interiorColorMatch;
                })
                .map((vehicle: any) => (
                  <Card 
                    key={vehicle.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedVehicleFromDB?.id === vehicle.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedVehicleFromDB(vehicle)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        {/* Manufacturer Logo */}
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {manufacturers.find(m => m.name === vehicle.manufacturer)?.logo ? (
                            <img 
                              src={manufacturers.find(m => m.name === vehicle.manufacturer)?.logo} 
                              alt={vehicle.manufacturer} 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                              {vehicle.manufacturer?.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        {/* Vehicle Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{vehicle.manufacturer} {vehicle.category}</h3>
                          {vehicle.trimLevel && (
                            <p className="text-sm text-blue-600 font-medium">{vehicle.trimLevel}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <span className="text-gray-500">السنة:</span>
                              <span className="font-medium mr-1">{vehicle.year}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">المحرك:</span>
                              <span className="font-medium mr-1">{vehicle.engineCapacity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">خارجي:</span>
                              <span className="font-medium mr-1">{vehicle.exteriorColor}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">داخلي:</span>
                              <span className="font-medium mr-1">{vehicle.interiorColor}</span>
                            </div>
                          </div>
                          {vehicle.chassisNumber && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              <span className="text-gray-500">رقم الهيكل:</span>
                              <span className="font-mono font-medium mr-1">{vehicle.chassisNumber}</span>
                            </div>
                          )}
                          {vehicle.price && (
                            <div className="mt-2 text-lg font-bold text-green-600">
                              {vehicle.price.toLocaleString()} ريال
                            </div>
                          )}
                          <div className="mt-2 flex gap-2">
                            <Badge variant={vehicle.status === "متوفر" ? "default" : "secondary"}>
                              {vehicle.status}
                            </Badge>
                            <Badge variant="outline">{vehicle.importType}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* No vehicles found */}
            {availableVehicles.length === 0 && (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">لا توجد سيارات متاحة في المخزون</p>
              </div>
            )}

            {/* Selected Vehicle Details */}
            {selectedVehicleFromDB && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4">تفاصيل السيارة المختارة</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-xl text-blue-800 dark:text-blue-200">
                        {selectedVehicleFromDB.manufacturer} {selectedVehicleFromDB.category}
                      </h4>
                      {selectedVehicleFromDB.trimLevel && (
                        <p className="text-blue-600 font-medium mt-1">{selectedVehicleFromDB.trimLevel}</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedVehicleFromDB.price?.toLocaleString()} ريال
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-600">السنة:</span>
                      <p className="font-medium">{selectedVehicleFromDB.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">سعة المحرك:</span>
                      <p className="font-medium">{selectedVehicleFromDB.engineCapacity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">اللون الخارجي:</span>
                      <p className="font-medium">{selectedVehicleFromDB.exteriorColor}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">اللون الداخلي:</span>
                      <p className="font-medium">{selectedVehicleFromDB.interiorColor}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">الحالة:</span>
                      <p className="font-medium">{selectedVehicleFromDB.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">نوع الاستيراد:</span>
                      <p className="font-medium">{selectedVehicleFromDB.importType}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">الموقع:</span>
                      <p className="font-medium">{selectedVehicleFromDB.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ الإدخال:</span>
                      <p className="font-medium">{new Date(selectedVehicleFromDB.entryDate).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                  
                  {selectedVehicleFromDB.chassisNumber && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
                      <span className="text-gray-600">رقم الهيكل:</span>
                      <p className="font-mono font-bold text-lg">{selectedVehicleFromDB.chassisNumber}</p>
                    </div>
                  )}
                  
                  {selectedVehicleFromDB.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border">
                      <span className="text-gray-600">ملاحظات:</span>
                      <p className="mt-1">{selectedVehicleFromDB.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center border-t pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setVehicleDescriptionOpen(false);
                  setSelectedVehicleFromDB(null);
                  setVehicleSearchQuery("");
                  // Clear filters
                  setFilterCategory("");
                  setFilterTrimLevel("");
                  setFilterYear("");
                  setFilterEngineCapacity("");
                  setFilterImportType("");
                  setFilterStatus("");
                  setFilterExteriorColor("");
                  setFilterInteriorColor("");
                }}
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  if (selectedVehicleFromDB) {
                    setSelectedVehicle(selectedVehicleFromDB);
                    setEditableVehicle(selectedVehicleFromDB);
                    setPricingDetails(prev => ({
                      ...prev,
                      basePrice: selectedVehicleFromDB.price || 0
                    }));
                    setVehicleDescriptionOpen(false);
                    setSelectedVehicleFromDB(null);
                    setVehicleSearchQuery("");
                    // Clear filters
                    setFilterCategory("");
                    setFilterTrimLevel("");
                    setFilterYear("");
                    setFilterEngineCapacity("");
                    setFilterImportType("");
                    setFilterStatus("");
                    setFilterExteriorColor("");
                    setFilterInteriorColor("");
                  }
                }}
                disabled={!selectedVehicleFromDB}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={16} className="ml-2" />
                اختيار هذه السيارة
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
              {isInvoiceMode ? 'تاريخ الفاتورة' : 'تاريخ العرض'}: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>
          <div className="print-header-qr">
            <div className="text-center">
              <div className="text-xs mb-1">QR Code</div>
              <div className="text-xs">{isInvoiceMode ? invoiceNumber : quoteNumber}</div>
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

        {/* Representative Information - Hidden if no representative selected */}
        {(() => {
          const rep = representatives.find(r => r.id === selectedRepresentative);
          return rep ? (
            <div className="print-section">
              <h3>بيانات المندوب</h3>
              <div className="print-row">
                <span className="print-label">الاسم:</span>
                <span className="print-value">{rep.name}</span>
              </div>
              <div className="print-row">
                <span className="print-label">رقم الهاتف:</span>
                <span className="print-value">{rep.phone}</span>
              </div>
            </div>
          ) : null;
        })()}

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
            <span className="print-label">
              {isInvoiceMode ? 'رقم الفاتورة:' : 'رقم عرض السعر:'}
            </span>
            <span className="print-value">{isInvoiceMode ? invoiceNumber : quoteNumber}</span>
          </div>
          {!isInvoiceMode && (
            <div className="print-row">
              <span className="print-label">صالح حتى:</span>
              <span className="print-value">
                {new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')}
              </span>
            </div>
          )}
        </div>
      </div>
      

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
              <Button onClick={handleSaveTerms} className="bg-orange-600 hover:bg-orange-700">
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

      {/* Vehicle Edit Dialog */}
      <Dialog open={vehicleEditOpen} onOpenChange={setVehicleEditOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              تعديل بيانات السيارة
            </DialogTitle>
            <DialogDescription>
              يمكنك تعديل جميع بيانات السيارة والمواصفات التفصيلية هنا
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manufacturer Selection */}
              <div>
                <Label htmlFor="editManufacturer">الصانع</Label>
                <Select 
                  value={editingVehicleData.manufacturer} 
                  onValueChange={(value) => {
                    setEditingVehicleData(prev => ({
                      ...prev,
                      manufacturer: value,
                      category: "", // Clear category when manufacturer changes
                      trimLevel: "" // Clear trim level when manufacturer changes
                    }));
                  }}
                >
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

              {/* Category Selection */}
              <div>
                <Label htmlFor="editCategory">الفئة</Label>
                <Select 
                  value={editingVehicleData.category} 
                  onValueChange={(value) => {
                    setEditingVehicleData(prev => ({
                      ...prev,
                      category: value,
                      trimLevel: "" // Clear trim level when category changes
                    }));
                  }}
                  disabled={!editingVehicleData.manufacturer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.category} value={category.category}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trim Level Selection */}
              <div>
                <Label htmlFor="editTrimLevel">درجة التجهيز</Label>
                <Select 
                  value={editingVehicleData.trimLevel} 
                  onValueChange={(value) => setEditingVehicleData(prev => ({ ...prev, trimLevel: value }))}
                  disabled={!editingVehicleData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر درجة التجهيز" />
                  </SelectTrigger>
                  <SelectContent>
                    {trimLevels.map((trimLevel) => (
                      <SelectItem key={trimLevel.id} value={trimLevel.trimLevel}>
                        {trimLevel.trimLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Selection */}
              <div>
                <Label htmlFor="editYear">السنة</Label>
                <Select 
                  value={editingVehicleData.year} 
                  onValueChange={(value) => setEditingVehicleData(prev => ({ ...prev, year: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Engine Capacity Selection */}
              <div>
                <Label htmlFor="editEngineCapacity">سعة المحرك</Label>
                <Select 
                  value={editingVehicleData.engineCapacity} 
                  onValueChange={(value) => setEditingVehicleData(prev => ({ ...prev, engineCapacity: value }))}
                >
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
                <Label htmlFor="editExteriorColor">اللون الخارجي</Label>
                <Input
                  id="editExteriorColor"
                  value={editingVehicleData.exteriorColor}
                  onChange={(e) => setEditingVehicleData(prev => ({ ...prev, exteriorColor: e.target.value }))}
                  placeholder="أدخل اللون الخارجي"
                />
              </div>

              {/* Interior Color */}
              <div>
                <Label htmlFor="editInteriorColor">اللون الداخلي</Label>
                <Input
                  id="editInteriorColor"
                  value={editingVehicleData.interiorColor}
                  onChange={(e) => setEditingVehicleData(prev => ({ ...prev, interiorColor: e.target.value }))}
                  placeholder="أدخل اللون الداخلي"
                />
              </div>

              {/* Chassis Number */}
              <div>
                <Label htmlFor="editChassisNumber">رقم الهيكل</Label>
                <Input
                  id="editChassisNumber"
                  value={editingVehicleData.chassisNumber}
                  onChange={(e) => setEditingVehicleData(prev => ({ ...prev, chassisNumber: e.target.value }))}
                  placeholder="أدخل رقم الهيكل"
                />
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="editPrice">السعر</Label>
                <Input
                  id="editPrice"
                  type="number"
                  value={editingVehicleData.price}
                  onChange={(e) => setEditingVehicleData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="أدخل السعر"
                />
              </div>
            </div>

            {/* Vehicle Specifications Preview from Database */}
            {(editingVehicleSpecs || editingSpecsLoading) && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">المواصفات التفصيلية من قاعدة البيانات</h4>
                
                {editingSpecsLoading && (
                  <div className="text-center text-gray-500 py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    جاري تحميل المواصفات...
                  </div>
                )}
                
                {editingVehicleSpecs && !editingSpecsLoading && (
                  <div className="space-y-6">
                    {/* Engine & Performance Specifications */}
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">المحرك والأداء</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {editingVehicleSpecs.engineType && (
                          <div><span className="font-medium">نوع المحرك:</span> {editingVehicleSpecs.engineType}</div>
                        )}
                        {editingVehicleSpecs.horsepower && (
                          <div><span className="font-medium">القوة الحصانية:</span> {editingVehicleSpecs.horsepower}</div>
                        )}
                        {editingVehicleSpecs.torque && (
                          <div><span className="font-medium">عزم الدوران:</span> {editingVehicleSpecs.torque}</div>
                        )}
                        {editingVehicleSpecs.transmission && (
                          <div><span className="font-medium">ناقل الحركة:</span> {editingVehicleSpecs.transmission}</div>
                        )}
                        {editingVehicleSpecs.fuelType && (
                          <div><span className="font-medium">نوع الوقود:</span> {editingVehicleSpecs.fuelType}</div>
                        )}
                        {editingVehicleSpecs.fuelConsumption && (
                          <div><span className="font-medium">استهلاك الوقود:</span> {editingVehicleSpecs.fuelConsumption}</div>
                        )}
                        {editingVehicleSpecs.drivetrain && (
                          <div><span className="font-medium">نوع الدفع:</span> {editingVehicleSpecs.drivetrain}</div>
                        )}
                        {editingVehicleSpecs.acceleration && (
                          <div><span className="font-medium">التسارع 0-100:</span> {editingVehicleSpecs.acceleration}</div>
                        )}
                        {editingVehicleSpecs.topSpeed && (
                          <div><span className="font-medium">السرعة القصوى:</span> {editingVehicleSpecs.topSpeed}</div>
                        )}
                      </div>
                    </div>

                    {/* Dimensions & Weight */}
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">الأبعاد والوزن</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {editingVehicleSpecs.length && (
                          <div><span className="font-medium">الطول:</span> {editingVehicleSpecs.length}</div>
                        )}
                        {editingVehicleSpecs.width && (
                          <div><span className="font-medium">العرض:</span> {editingVehicleSpecs.width}</div>
                        )}
                        {editingVehicleSpecs.height && (
                          <div><span className="font-medium">الارتفاع:</span> {editingVehicleSpecs.height}</div>
                        )}
                        {editingVehicleSpecs.wheelbase && (
                          <div><span className="font-medium">قاعدة العجلات:</span> {editingVehicleSpecs.wheelbase}</div>
                        )}
                        {editingVehicleSpecs.curbWeight && (
                          <div><span className="font-medium">الوزن الفارغ:</span> {editingVehicleSpecs.curbWeight}</div>
                        )}
                        {editingVehicleSpecs.grossWeight && (
                          <div><span className="font-medium">إجمالي الوزن:</span> {editingVehicleSpecs.grossWeight}</div>
                        )}
                        {editingVehicleSpecs.loadCapacity && (
                          <div><span className="font-medium">سعة التحميل:</span> {editingVehicleSpecs.loadCapacity}</div>
                        )}
                        {editingVehicleSpecs.seatingCapacity && (
                          <div><span className="font-medium">عدد المقاعد:</span> {editingVehicleSpecs.seatingCapacity}</div>
                        )}
                      </div>
                    </div>

                    {/* Features & Equipment */}
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">المميزات والتجهيزات</h5>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {editingVehicleSpecs.safetyFeatures && (
                          <div><span className="font-medium">مميزات الأمان:</span> {editingVehicleSpecs.safetyFeatures}</div>
                        )}
                        {editingVehicleSpecs.comfortFeatures && (
                          <div><span className="font-medium">مميزات الراحة:</span> {editingVehicleSpecs.comfortFeatures}</div>
                        )}
                        {editingVehicleSpecs.infotainment && (
                          <div><span className="font-medium">نظام المعلومات والترفيه:</span> {editingVehicleSpecs.infotainment}</div>
                        )}
                        {editingVehicleSpecs.driverAssistance && (
                          <div><span className="font-medium">مساعدة السائق:</span> {editingVehicleSpecs.driverAssistance}</div>
                        )}
                        {editingVehicleSpecs.exteriorFeatures && (
                          <div><span className="font-medium">المميزات الخارجية:</span> {editingVehicleSpecs.exteriorFeatures}</div>
                        )}
                        {editingVehicleSpecs.interiorFeatures && (
                          <div><span className="font-medium">المميزات الداخلية:</span> {editingVehicleSpecs.interiorFeatures}</div>
                        )}
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">المواصفات التقنية</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {editingVehicleSpecs.tireSize && (
                          <div><span className="font-medium">مقاس الإطارات:</span> {editingVehicleSpecs.tireSize}</div>
                        )}
                        {editingVehicleSpecs.suspension && (
                          <div><span className="font-medium">نوع التعليق:</span> {editingVehicleSpecs.suspension}</div>
                        )}
                        {editingVehicleSpecs.brakes && (
                          <div><span className="font-medium">نظام الكبح:</span> {editingVehicleSpecs.brakes}</div>
                        )}
                        {editingVehicleSpecs.steering && (
                          <div><span className="font-medium">نظام التوجيه:</span> {editingVehicleSpecs.steering}</div>
                        )}
                        {editingVehicleSpecs.groundClearance && (
                          <div><span className="font-medium">ارتفاع عن الأرض:</span> {editingVehicleSpecs.groundClearance}</div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-2">معلومات إضافية</h5>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {editingVehicleSpecs.warranty && (
                          <div><span className="font-medium">الضمان:</span> {editingVehicleSpecs.warranty}</div>
                        )}
                        {editingVehicleSpecs.detailedDescription && (
                          <div><span className="font-medium">الوصف التفصيلي:</span> {editingVehicleSpecs.detailedDescription}</div>
                        )}
                        {editingVehicleSpecs.notes && (
                          <div><span className="font-medium">ملاحظات:</span> {editingVehicleSpecs.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {!editingVehicleSpecs && !editingSpecsLoading && (
                  <div className="text-center text-gray-500 py-4">
                    لا توجد مواصفات تفصيلية متاحة لهذه المركبة
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => {
                  // Update the vehicle data
                  const updatedVehicle = {
                    ...editableVehicle,
                    manufacturer: editingVehicleData.manufacturer,
                    category: editingVehicleData.category,
                    trimLevel: editingVehicleData.trimLevel,
                    year: parseInt(editingVehicleData.year),
                    engineCapacity: editingVehicleData.engineCapacity,
                    exteriorColor: editingVehicleData.exteriorColor,
                    interiorColor: editingVehicleData.interiorColor,
                    chassisNumber: editingVehicleData.chassisNumber,
                    price: editingVehicleData.price
                  };
                  
                  setEditableVehicle(updatedVehicle);
                  setSelectedVehicle(updatedVehicle);
                  
                  // Update pricing details with new price
                  setPricingDetails(prev => ({
                    ...prev,
                    basePrice: editingVehicleData.price
                  }));
                  
                  // Update the individual state variables as well
                  setVehicleManufacturer(editingVehicleData.manufacturer);
                  setVehicleCategory(editingVehicleData.category);
                  setVehicleTrimLevel(editingVehicleData.trimLevel);
                  setVehicleYear(editingVehicleData.year);
                  setVehicleEngineCapacity(editingVehicleData.engineCapacity);
                  setVehicleExteriorColor(editingVehicleData.exteriorColor);
                  setVehicleInteriorColor(editingVehicleData.interiorColor);
                  setVehicleChassisNumber(editingVehicleData.chassisNumber);
                  setVehiclePrice(editingVehicleData.price);
                  
                  // Update vehicle specifications automatically from database
                  setVehicleSpecs(editingVehicleSpecs);
                  
                  setVehicleEditOpen(false);
                  
                  toast({
                    title: "تم التحديث",
                    description: "تم تحديث بيانات السيارة والمواصفات بنجاح",
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save size={16} className="ml-2" />
                حفظ التعديلات
              </Button>
              <Button variant="outline" onClick={() => setVehicleEditOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}