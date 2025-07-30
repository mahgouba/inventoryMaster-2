import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, Printer, Save, ArrowRight, Home, TrendingUp, Plus, Upload, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import SystemGlassWrapper from "@/components/system-glass-wrapper";

// Bank rate type from financing rates management
interface BankRateItem {
  rateName: string;
  rateValue: number;
}

interface FinancingRate {
  id: number;
  bankName: string;
  bankNameEn: string;
  bankLogo?: string;
  financingType: "personal" | "commercial";
  rates: BankRateItem[];
  minPeriod: number;
  maxPeriod: number;
  minAmount: number;
  maxAmount: number;
  features: string[];
  requirements: string[];
  isActive: boolean;
  lastUpdated: string;
}

interface BankRate {
  id?: string;
  name: string;
  logo?: string;
  rates: {
    [years: string]: number; // APR percentage
  };
}

interface NewBankForm {
  name: string;
  logo: string;
  rates: { [years: string]: number };
}

// Convert financing rates from management system to calculator format
const convertFinancingRatesToBankRates = (financingRates: FinancingRate[]): BankRate[] => {
  return financingRates
    .filter(rate => rate.isActive) // Only active rates
    .map(rate => ({
      id: rate.id.toString(),
      name: rate.bankName,
      logo: rate.bankLogo || "",
      rates: rate.rates.reduce((acc, rateItem) => {
        // Extract year from rate name if it contains numbers
        const yearMatch = rateItem.rateName.match(/\d+/);
        if (yearMatch) {
          acc[yearMatch[0]] = rateItem.rateValue;
        } else {
          // If no year found, use the rate name as key
          acc[rateItem.rateName] = rateItem.rateValue;
        }
        return acc;
      }, {} as { [years: string]: number })
    }));
};

interface CalculationResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  totalInsurance: number;
  financedAmount: number;
  effectiveRate: number;
}

interface FormData {
  customerName: string;
  vehiclePrice: string;
  downPayment: string;
  finalPayment: string;
  bankName: string;
  financingYears: string;
  administrativeFees: string;
  insuranceRate: string;
  chassisNumber: string;
  vehicleManufacturer: string;
  vehicleCategory: string;
  notes: string;
}

export default function FinancingCalculatorPage() {
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    vehiclePrice: "",
    downPayment: "",
    finalPayment: "",
    bankName: "",
    financingYears: "",
    administrativeFees: "",
    insuranceRate: "5.0", // Default comprehensive insurance rate
    chassisNumber: "",
    vehicleManufacturer: "",
    vehicleCategory: "",
    notes: ""
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankRate | null>(null);
  const [customBanks, setCustomBanks] = useState<BankRate[]>([]);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [newBank, setNewBank] = useState<NewBankForm>({
    name: "",
    logo: "",
    rates: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0
    }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch financing rates from management system
  const { data: financingRatesData = [], isLoading: isLoadingRates } = useQuery<FinancingRate[]>({
    queryKey: ["/api/financing-rates"],
  });

  // Convert financing rates to bank rates format
  const managedBanks = convertFinancingRatesToBankRates(financingRatesData);
  
  // Get all available banks (managed + custom)
  const allBanks = [...managedBanks, ...customBanks];

  // Update bank rates when bank selection changes
  useEffect(() => {
    if (formData.bankName) {
      const bank = allBanks.find(b => b.name === formData.bankName);
      setSelectedBank(bank || null);
    }
  }, [formData.bankName, customBanks, managedBanks]);

  // Auto-update interest rate when bank and years change
  useEffect(() => {
    if (selectedBank && formData.financingYears) {
      const rate = selectedBank.rates[formData.financingYears];
      if (rate) {
        // Rate is automatically used in calculation
      }
    }
  }, [selectedBank, formData.financingYears]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Bank management functions
  const handleAddBank = () => {
    if (!newBank.name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم البنك",
        variant: "destructive"
      });
      return;
    }

    const bankWithId: BankRate = {
      ...newBank,
      id: Date.now().toString()
    };

    setCustomBanks(prev => [...prev, bankWithId]);
    setNewBank({
      name: "",
      logo: "",
      rates: {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0
      }
    });
    setShowAddBankDialog(false);
    
    toast({
      title: "تم بنجاح",
      description: "تم إضافة البنك بنجاح",
    });
  };

  const handleDeleteBank = (bankId: string) => {
    setCustomBanks(prev => prev.filter(bank => bank.id !== bankId));
    toast({
      title: "تم بنجاح",
      description: "تم حذف البنك بنجاح",
    });
  };

  const handleBankRateChange = (year: string, rate: string) => {
    const rateValue = parseFloat(rate) || 0;
    setNewBank(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        [year]: rateValue
      }
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        setNewBank(prev => ({ ...prev, logo: logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateFinancing = () => {
    const vehiclePrice = parseFloat(formData.vehiclePrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const finalPayment = parseFloat(formData.finalPayment) || 0;
    const adminFees = parseFloat(formData.administrativeFees) || 0;
    const insuranceRate = parseFloat(formData.insuranceRate) || 5.0;
    const years = parseInt(formData.financingYears) || 1;

    if (!selectedBank || !formData.financingYears) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار البنك وعدد سنوات التمويل",
        variant: "destructive"
      });
      return;
    }

    const interestRate = selectedBank.rates[formData.financingYears] || 0;
    
    // Calculate financed amount
    const financedAmount = vehiclePrice - downPayment - finalPayment + adminFees;
    
    // Calculate annual insurance cost
    const annualInsurance = (vehiclePrice * insuranceRate) / 100;
    const totalInsurance = annualInsurance * years;
    
    // Calculate monthly interest rate
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    // Calculate monthly payment using standard loan formula
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = financedAmount / numberOfPayments;
    }
    
    // Add monthly insurance
    const monthlyInsurance = annualInsurance / 12;
    monthlyPayment += monthlyInsurance;
    
    // Calculate totals
    const totalMonthlyPayments = (monthlyPayment - monthlyInsurance) * numberOfPayments;
    const totalAmount = downPayment + totalMonthlyPayments + finalPayment + totalInsurance + adminFees;
    const totalInterest = totalMonthlyPayments - financedAmount + adminFees;
    
    const calculationResult: CalculationResult = {
      monthlyPayment,
      totalAmount,
      totalInterest,
      totalInsurance,
      financedAmount,
      effectiveRate: interestRate
    };

    setResult(calculationResult);
  };

  const saveCalculationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/financing-calculations", data);
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ حسابات التمويل في النظام"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/financing-calculations"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!result) {
      toast({
        title: "لا توجد نتائج للحفظ",
        description: "يرجى إجراء الحساب أولاً",
        variant: "destructive"
      });
      return;
    }

    const saveData = {
      customerName: formData.customerName,
      vehiclePrice: formData.vehiclePrice,
      downPayment: formData.downPayment,
      finalPayment: formData.finalPayment,
      bankName: formData.bankName,
      interestRate: result.effectiveRate.toString(),
      financingYears: parseInt(formData.financingYears),
      administrativeFees: formData.administrativeFees,
      insuranceRate: formData.insuranceRate,
      monthlyPayment: result.monthlyPayment.toString(),
      totalAmount: result.totalAmount.toString(),
      totalInterest: result.totalInterest.toString(),
      totalInsurance: result.totalInsurance.toString(),
      chassisNumber: formData.chassisNumber,
      vehicleManufacturer: formData.vehicleManufacturer,
      vehicleCategory: formData.vehicleCategory,
      notes: formData.notes
    };

    saveCalculationMutation.mutate(saveData);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('calculation-result');
    if (!printContent || !result) {
      toast({
        title: "لا توجد نتائج للطباعة",
        description: "يرجى إجراء الحساب أولاً",
        variant: "destructive"
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>حاسبة التمويل - ${formData.customerName}</title>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 20px; 
                line-height: 1.6;
                color: #333;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #BF9231;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 { 
                color: #00627F; 
                margin: 0;
                font-size: 28px;
              }
              .section {
                margin: 20px 0;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
              .section h3 {
                color: #00627F;
                border-bottom: 1px solid #BF9231;
                padding-bottom: 5px;
                margin-top: 0;
              }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 15px 0;
              }
              .field {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px dotted #ccc;
              }
              .field:last-child {
                border-bottom: none;
              }
              .label { font-weight: bold; color: #555; }
              .value { color: #00627F; font-weight: 600; }
              .highlight {
                background: linear-gradient(135deg, #00627F, #BF9231);
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>حاسبة التمويل</h1>
              <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <SystemGlassWrapper>
      <div className="container mx-auto p-4" dir="rtl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Calculator className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">حاسبة التمويل</h1>
            </div>
            <Link href="/">
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Home className="h-4 w-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="glass-container h-fit">
            <CardHeader className="pb-3 border-b border-white/10">
              <CardTitle className="text-lg font-semibold text-white drop-shadow-lg flex items-center">
                <TrendingUp className="h-5 w-5 ml-2 text-blue-400" />
                بيانات التمويل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              {/* Customer Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    placeholder="أدخل اسم العميل"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleManufacturer">الصانع</Label>
                    <Input
                      id="vehicleManufacturer"
                      value={formData.vehicleManufacturer}
                      onChange={(e) => handleInputChange("vehicleManufacturer", e.target.value)}
                      placeholder="مرسيدس، بي ام دبليو..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleCategory">الفئة</Label>
                    <Input
                      id="vehicleCategory"
                      value={formData.vehicleCategory}
                      onChange={(e) => handleInputChange("vehicleCategory", e.target.value)}
                      placeholder="C200، X5..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="chassisNumber">رقم الهيكل (اختياري)</Label>
                  <Input
                    id="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
                    placeholder="رقم الهيكل"
                  />
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vehiclePrice">سعر السيارة (ريال)</Label>
                  <Input
                    id="vehiclePrice"
                    type="number"
                    value={formData.vehiclePrice}
                    onChange={(e) => handleInputChange("vehiclePrice", e.target.value)}
                    placeholder="150000"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="downPayment">الدفعة الأولى (ريال)</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => handleInputChange("downPayment", e.target.value)}
                      placeholder="30000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalPayment">الدفعة الأخيرة (ريال)</Label>
                    <Input
                      id="finalPayment"
                      type="number"
                      value={formData.finalPayment}
                      onChange={(e) => handleInputChange("finalPayment", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="bankName">البنك</Label>
                    <div className="flex gap-2">
                      <Link href="/financing-rates">
                        <Button 
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          <TrendingUp className="h-4 w-4 ml-1" />
                          إدارة النسب
                        </Button>
                      </Link>
                      <Button 
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddBankDialog(true)}
                        className="text-[#C79C45] border-[#C79C45] hover:bg-[#C79C45] hover:text-white"
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة بنك
                      </Button>
                    </div>
                  </div>
                  <Select 
                    value={formData.bankName} 
                    onValueChange={(value) => handleInputChange("bankName", value)}
                    disabled={isLoadingRates}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingRates ? "جاري تحميل البنوك..." : "اختر البنك"} />
                    </SelectTrigger>
                    <SelectContent>
                      {managedBanks.length > 0 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                          البنوك من إدارة النسب ({managedBanks.length})
                        </div>
                      )}
                      {managedBanks.map((bank) => (
                        <SelectItem key={`managed-${bank.name}`} value={bank.name}>
                          <div className="flex items-center gap-2">
                            {bank.logo && (
                              <img src={bank.logo} alt={bank.name} className="w-4 h-4 object-contain" />
                            )}
                            {bank.name}
                            <span className="text-xs text-blue-600">(مُدار)</span>
                          </div>
                        </SelectItem>
                      ))}
                      {customBanks.length > 0 && managedBanks.length > 0 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground border-b border-t">
                          البنوك المخصصة ({customBanks.length})
                        </div>
                      )}
                      {customBanks.map((bank) => (
                        <SelectItem key={`custom-${bank.id}`} value={bank.name}>
                          <div className="flex items-center gap-2">
                            {bank.logo && (
                              <img src={bank.logo} alt={bank.name} className="w-4 h-4 object-contain" />
                            )}
                            {bank.name}
                            <span className="text-xs text-gray-500">(مخصص)</span>
                          </div>
                        </SelectItem>
                      ))}
                      {managedBanks.length === 0 && customBanks.length === 0 && !isLoadingRates && (
                        <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                          لا توجد بنوك متاحة. يرجى إضافة بنوك من صفحة إدارة النسب أو إضافة بنك مخصص.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="financingYears">عدد سنوات التمويل</Label>
                  <Select value={formData.financingYears} onValueChange={(value) => handleInputChange("financingYears", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر عدد السنوات" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year} {year === 1 ? "سنة" : "سنوات"}
                          {selectedBank && selectedBank.rates[year.toString()] && 
                            ` (${selectedBank.rates[year.toString()]}%)`
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="administrativeFees">الرسوم الإدارية (ريال)</Label>
                    <Input
                      id="administrativeFees"
                      type="number"
                      value={formData.administrativeFees}
                      onChange={(e) => handleInputChange("administrativeFees", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceRate">نسبة التأمين الشامل (%)</Label>
                    <Input
                      id="insuranceRate"
                      type="number"
                      step="0.1"
                      value={formData.insuranceRate}
                      onChange={(e) => handleInputChange("insuranceRate", e.target.value)}
                      placeholder="5.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="ملاحظات إضافية..."
                  />
                </div>
              </div>

              <Button onClick={calculateFinancing} className="w-full" size="lg">
                <Calculator className="h-4 w-4 ml-2" />
                احسب التمويل
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>نتائج التمويل</span>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} variant="outline" size="sm" disabled={saveCalculationMutation.isPending}>
                      <Save className="h-4 w-4 ml-1" />
                      حفظ
                    </Button>
                    <Button onClick={handlePrint} variant="outline" size="sm">
                      <Printer className="h-4 w-4 ml-1" />
                      طباعة
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent id="calculation-result">
                <div className="space-y-6">
                  {/* Customer Info Section */}
                  <div className="section">
                    <h3>بيانات العميل</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="field">
                        <span className="label">اسم العميل:</span>
                        <span className="value">{formData.customerName || "غير محدد"}</span>
                      </div>
                      <div className="field">
                        <span className="label">رقم الهيكل:</span>
                        <span className="value">{formData.chassisNumber || "غير محدد"}</span>
                      </div>
                      <div className="field">
                        <span className="label">الصانع:</span>
                        <span className="value">{formData.vehicleManufacturer || "غير محدد"}</span>
                      </div>
                      <div className="field">
                        <span className="label">الفئة:</span>
                        <span className="value">{formData.vehicleCategory || "غير محدد"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financing Details */}
                  <div className="section">
                    <h3>تفاصيل التمويل</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="field">
                        <span className="label">سعر السيارة:</span>
                        <span className="value">{formatCurrency(parseFloat(formData.vehiclePrice) || 0)}</span>
                      </div>
                      <div className="field">
                        <span className="label">الدفعة الأولى:</span>
                        <span className="value">{formatCurrency(parseFloat(formData.downPayment) || 0)}</span>
                      </div>
                      <div className="field">
                        <span className="label">الدفعة الأخيرة:</span>
                        <span className="value">{formatCurrency(parseFloat(formData.finalPayment) || 0)}</span>
                      </div>
                      <div className="field">
                        <span className="label">المبلغ الممول:</span>
                        <span className="value">{formatCurrency(result.financedAmount)}</span>
                      </div>
                      <div className="field">
                        <span className="label">البنك:</span>
                        <span className="value">{formData.bankName}</span>
                      </div>
                      <div className="field">
                        <span className="label">معدل الفائدة:</span>
                        <span className="value">{result.effectiveRate}%</span>
                      </div>
                      <div className="field">
                        <span className="label">مدة التمويل:</span>
                        <span className="value">{formData.financingYears} سنوات</span>
                      </div>
                      <div className="field">
                        <span className="label">الرسوم الإدارية:</span>
                        <span className="value">{formatCurrency(parseFloat(formData.administrativeFees) || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Payment Highlight */}
                  <div className="highlight">
                    القسط الشهري: {formatCurrency(result.monthlyPayment)}
                  </div>

                  {/* Summary */}
                  <div className="section">
                    <h3>ملخص التكاليف</h3>
                    <div className="space-y-3">
                      <div className="field">
                        <span className="label">إجمالي الفوائد:</span>
                        <span className="value">{formatCurrency(result.totalInterest)}</span>
                      </div>
                      <div className="field">
                        <span className="label">إجمالي التأمين:</span>
                        <span className="value">{formatCurrency(result.totalInsurance)}</span>
                      </div>
                      <div className="field">
                        <span className="label">المبلغ الإجمالي:</span>
                        <span className="value font-bold text-lg">{formatCurrency(result.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="section">
                      <h3>ملاحظات</h3>
                      <p className="text-gray-700 dark:text-gray-300">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Bank Dialog */}
        <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
          <DialogContent className="glass-container max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white drop-shadow-lg text-xl">إضافة بنك جديد</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 p-4">
              {/* Bank Name */}
              <div>
                <Label htmlFor="bankName" className="text-white">اسم البنك</Label>
                <Input
                  id="bankName"
                  value={newBank.name}
                  onChange={(e) => setNewBank(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="اسم البنك"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>

              {/* Bank Logo */}
              <div>
                <Label htmlFor="bankLogo" className="text-white">شعار البنك</Label>
                <div className="space-y-3">
                  <Input
                    id="bankLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="bg-white/10 border-white/20 text-white file:bg-[#C79C45] file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-sm"
                  />
                  {newBank.logo && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/10">
                      <img src={newBank.logo} alt="معاينة الشعار" className="w-12 h-12 object-contain" />
                      <span className="text-white text-sm">تم رفع الشعار بنجاح</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interest Rates */}
              <div>
                <Label className="text-white text-lg font-semibold">معدلات الفائدة (سنوياً)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  {Object.entries(newBank.rates).map(([year, rate]) => (
                    <div key={year}>
                      <Label htmlFor={`rate-${year}`} className="text-white text-sm">
                        {year} {year === "1" ? "سنة" : "سنوات"}
                      </Label>
                      <Input
                        id={`rate-${year}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        value={rate}
                        onChange={(e) => handleBankRateChange(year, e.target.value)}
                        placeholder="0.0"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Banks List */}
              {customBanks.length > 0 && (
                <div>
                  <Label className="text-white text-lg font-semibold">البنوك المخصصة</Label>
                  <div className="space-y-2 mt-3 max-h-40 overflow-y-auto">
                    {customBanks.map((bank) => (
                      <div key={bank.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex items-center gap-3">
                          {bank.logo && (
                            <img src={bank.logo} alt={bank.name} className="w-8 h-8 object-contain" />
                          )}
                          <span className="text-white font-medium">{bank.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteBank(bank.id!)}
                          className="bg-red-500/80 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setShowAddBankDialog(false)}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddBank}
                  className="bg-[#C79C45] hover:bg-[#B8882A] text-white"
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة البنك
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SystemGlassWrapper>
  );
}