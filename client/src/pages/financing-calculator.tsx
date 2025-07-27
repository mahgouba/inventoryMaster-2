import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Printer, Save, ArrowRight, Home, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import SystemGlassWrapper from "@/components/system-glass-wrapper";

interface BankRate {
  name: string;
  rates: {
    [years: string]: number; // APR percentage
  };
}

const BANKS: BankRate[] = [
  {
    name: "مصرف الراجحي",
    rates: {
      "1": 4.5,
      "2": 5.2,
      "3": 5.8,
      "4": 6.3,
      "5": 6.8,
      "6": 7.2,
      "7": 7.5
    }
  },
  {
    name: "بنك البلاد",
    rates: {
      "1": 4.8,
      "2": 5.5,
      "3": 6.1,
      "4": 6.6,
      "5": 7.1,
      "6": 7.5,
      "7": 7.8
    }
  },
  {
    name: "بنك الرياض",
    rates: {
      "1": 4.7,
      "2": 5.4,
      "3": 6.0,
      "4": 6.5,
      "5": 7.0,
      "6": 7.4,
      "7": 7.7
    }
  },
  {
    name: "البنك العربي",
    rates: {
      "1": 4.9,
      "2": 5.6,
      "3": 6.2,
      "4": 6.7,
      "5": 7.2,
      "6": 7.6,
      "7": 7.9
    }
  },
  {
    name: "بنك الإنماء",
    rates: {
      "1": 4.6,
      "2": 5.3,
      "3": 5.9,
      "4": 6.4,
      "5": 6.9,
      "6": 7.3,
      "7": 7.6
    }
  },
  {
    name: "بنك الإمارات دبي",
    rates: {
      "1": 5.0,
      "2": 5.7,
      "3": 6.3,
      "4": 6.8,
      "5": 7.3,
      "6": 7.7,
      "7": 8.0
    }
  },
  {
    name: "البنك السعودي الفرنسي",
    rates: {
      "1": 4.8,
      "2": 5.5,
      "3": 6.1,
      "4": 6.6,
      "5": 7.1,
      "6": 7.5,
      "7": 7.8
    }
  },
  {
    name: "بنك الجزيرة",
    rates: {
      "1": 4.7,
      "2": 5.4,
      "3": 6.0,
      "4": 6.5,
      "5": 7.0,
      "6": 7.4,
      "7": 7.7
    }
  }
];

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update bank rates when bank selection changes
  useEffect(() => {
    if (formData.bankName) {
      const bank = BANKS.find(b => b.name === formData.bankName);
      setSelectedBank(bank || null);
    }
  }, [formData.bankName]);

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
                  <Label htmlFor="bankName">البنك</Label>
                  <Select value={formData.bankName} onValueChange={(value) => handleInputChange("bankName", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر البنك" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map((bank) => (
                        <SelectItem key={bank.name} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
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
      </div>
    </SystemGlassWrapper>
  );
}