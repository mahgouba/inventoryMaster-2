import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, Building, Percent, Clock, Image, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface BankRate {
  rateName: string;
  rateValue: number;
}

interface FinancingRate {
  id: number;
  bankName: string;
  bankNameEn: string;
  bankLogo?: string;
  financingType: "personal" | "commercial";
  rates: BankRate[];
  minPeriod: number;
  maxPeriod: number;
  minAmount: number;
  maxAmount: number;
  features: string[];
  requirements: string[];
  isActive: boolean;
  lastUpdated: string;
}

export default function FinancingRatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<FinancingRate | null>(null);
  const [filterType, setFilterType] = useState<"all" | "personal" | "commercial">("all");
  const [bankLogo, setBankLogo] = useState<string>("");
  const [ratesList, setRatesList] = useState<BankRate[]>([{ rateName: "", rateValue: 0 }]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      bankName: "",
      bankNameEn: "",
      financingType: "personal",
      minPeriod: 12,
      maxPeriod: 60,
      minAmount: 50000,
      maxAmount: 1000000,
      features: "",
      requirements: "",
      isActive: true
    }
  });

  // Fetch financing rates
  const { data: rates = [], isLoading } = useQuery({
    queryKey: ["/api/financing-rates"],
    select: (data: FinancingRate[]) => {
      if (filterType === "all") return data;
      return data.filter(rate => rate.financingType === filterType);
    }
  });

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBankLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new rate
  const addRate = () => {
    setRatesList([...ratesList, { rateName: "", rateValue: 0 }]);
  };

  // Remove rate
  const removeRate = (index: number) => {
    if (ratesList.length > 1) {
      setRatesList(ratesList.filter((_, i) => i !== index));
    }
  };

  // Update rate
  const updateRate = (index: number, field: keyof BankRate, value: string | number) => {
    const updatedRates = [...ratesList];
    updatedRates[index] = { ...updatedRates[index], [field]: value };
    setRatesList(updatedRates);
  };

  // Create/Update mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => 
      editingRate 
        ? apiRequest("PUT", `/api/financing-rates/${editingRate.id}`, data)
        : apiRequest("POST", "/api/financing-rates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financing-rates"] });
      setIsDialogOpen(false);
      setEditingRate(null);
      setBankLogo("");
      setRatesList([{ rateName: "", rateValue: 0 }]);
      form.reset();
      toast({
        title: editingRate ? "تم تحديث معدل التمويل" : "تم إضافة معدل التمويل",
        description: editingRate ? "تم تحديث البيانات بنجاح" : "تم إضافة المعدل الجديد بنجاح"
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/financing-rates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financing-rates"] });
      toast({
        title: "تم حذف معدل التمويل",
        description: "تم حذف المعدل بنجاح"
      });
    }
  });

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      bankLogo,
      rates: ratesList.filter(rate => rate.rateName && rate.rateValue > 0),
      features: values.features.split(',').map((f: string) => f.trim()).filter(Boolean),
      requirements: values.requirements.split(',').map((r: string) => r.trim()).filter(Boolean)
    };
    createMutation.mutate(data);
  };

  const handleEdit = (rate: FinancingRate) => {
    setEditingRate(rate);
    setBankLogo(rate.bankLogo || "");
    setRatesList(rate.rates || [{ rateName: "", rateValue: 0 }]);
    form.reset({
      bankName: rate.bankName,
      bankNameEn: rate.bankNameEn,
      financingType: rate.financingType,
      minPeriod: rate.minPeriod,
      maxPeriod: rate.maxPeriod,
      minAmount: rate.minAmount,
      maxAmount: rate.maxAmount,
      features: rate.features.join(', '),
      requirements: rate.requirements.join(', '),
      isActive: rate.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المعدل؟")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C79C45] mx-auto mb-4"></div>
          <p className="text-white/80">جاري تحميل نسب التمويل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="glass-container p-6 mb-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#C79C45]/20 flex items-center justify-center">
              <Percent className="h-6 w-6 text-[#C79C45]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">إدارة نسب بنوك التمويل</h1>
              <p className="text-white/70">إدارة معدلات ونسب التمويل للبنوك المختلفة</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingRate(null);
                  setBankLogo("");
                  setRatesList([{ rateName: "", rateValue: 0 }]);
                  form.reset();
                }}
                className="bg-[#C79C45] hover:bg-[#B8862F] text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة بنك جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl glass-container border-white/20 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">
                  {editingRate ? "تعديل بيانات البنك" : "إضافة بنك جديد"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Bank Logo Upload */}
                  <div className="glass-container p-4 border border-white/10">
                    <Label className="text-white font-medium mb-3 block">شعار البنك</Label>
                    <div className="flex items-center gap-4">
                      {bankLogo ? (
                        <div className="relative">
                          <img src={bankLogo} alt="Bank Logo" className="w-20 h-20 object-contain rounded-lg bg-white p-2" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setBankLogo("")}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 bg-red-500 hover:bg-red-600 border-white"
                          >
                            <X className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                          <Image className="h-8 w-8 text-white/50" />
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Upload className="h-4 w-4" />
                        {bankLogo ? "تغيير الشعار" : "رفع الشعار"}
                      </Button>
                    </div>
                  </div>

                  {/* Bank Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">اسم البنك (عربي)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="البنك الأهلي التجاري" className="bg-white/10 border-white/20 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankNameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">اسم البنك (انجليزي)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Saudi National Bank" className="bg-white/10 border-white/20 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Financing Type */}
                  <FormField
                    control={form.control}
                    name="financingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">نوع التمويل</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="personal">شخصي</SelectItem>
                            <SelectItem value="commercial">تجاري</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Rates Section */}
                  <div className="glass-container p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-white font-medium">نسب التمويل</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRate}
                        className="gap-2 bg-[#C79C45]/20 border-[#C79C45]/40 text-[#C79C45] hover:bg-[#C79C45]/30"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة نسبة
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {ratesList.map((rate, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="flex-1">
                            <Input
                              placeholder="اسم النسبة (مثال: تمويل السيارات)"
                              value={rate.rateName}
                              onChange={(e) => updateRate(index, "rateName", e.target.value)}
                              className="bg-white/10 border-white/20 text-white text-sm"
                            />
                          </div>
                          <div className="w-32">
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="النسبة"
                                value={rate.rateValue || ""}
                                onChange={(e) => updateRate(index, "rateValue", parseFloat(e.target.value) || 0)}
                                className="bg-white/10 border-white/20 text-white text-sm pr-8"
                                step="0.1"
                                min="0"
                                max="100"
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 text-sm">%</span>
                            </div>
                          </div>
                          {ratesList.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRate(index)}
                              className="w-8 h-8 p-0 bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Period and Amount */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="minPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">أقل فترة (شهر)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" className="bg-white/10 border-white/20 text-white" onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">أكبر فترة (شهر)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" className="bg-white/10 border-white/20 text-white" onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="minAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">أقل مبلغ</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" className="bg-white/10 border-white/20 text-white" onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">أكبر مبلغ</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" className="bg-white/10 border-white/20 text-white" onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-[#C79C45] hover:bg-[#B8862F] text-white"
                    >
                      {createMutation.isPending ? "جاري الحفظ..." : editingRate ? "تحديث البيانات" : "إضافة البنك"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-container p-4 mb-6 border border-white/20">
        <div className="flex items-center gap-4">
          <Label className="text-white font-medium">نوع التمويل:</Label>
          <div className="flex gap-2">
            {[
              { value: "all", label: "الكل", count: rates.length },
              { value: "personal", label: "شخصي", count: rates.filter(r => r.financingType === "personal").length },
              { value: "commercial", label: "تجاري", count: rates.filter(r => r.financingType === "commercial").length }
            ].map((filter) => (
              <Button
                key={filter.value}
                variant="outline"
                size="sm"
                onClick={() => setFilterType(filter.value as any)}
                className={cn(
                  "gap-2 transition-all",
                  filterType === filter.value
                    ? "bg-[#C79C45] border-[#C79C45] text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                )}
              >
                {filter.label}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {filter.count}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Banks Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {rates.map((rate) => (
          <Card key={rate.id} className="glass-container border-white/20 hover:border-white/30 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rate.bankLogo && (
                    <img src={rate.bankLogo} alt={rate.bankName} className="w-12 h-12 object-contain rounded-lg bg-white p-1" />
                  )}
                  <div>
                    <CardTitle className="text-white text-lg">{rate.bankName}</CardTitle>
                    <p className="text-white/70 text-sm">{rate.bankNameEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rate)}
                    className="bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(rate.id)}
                    className="bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    rate.financingType === "personal"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-blue-500/20 text-blue-400"
                  )}>
                    {rate.financingType === "personal" ? "تمويل شخصي" : "تمويل تجاري"}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    rate.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {rate.isActive ? "نشط" : "غير نشط"}
                  </span>
                </div>

                {/* Rates */}
                {rate.rates && rate.rates.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">النسب المتاحة:</h4>
                    <div className="space-y-2">
                      {rate.rates.map((r, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <span className="text-white/80 text-sm">{r.rateName}</span>
                          <span className="text-[#C79C45] font-medium">{r.rateValue}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">الفترة:</span>
                    <p className="text-white">{rate.minPeriod} - {rate.maxPeriod} شهر</p>
                  </div>
                  <div>
                    <span className="text-white/70">المبلغ:</span>
                    <p className="text-white">{formatCurrency(rate.minAmount)} - {formatCurrency(rate.maxAmount)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rates.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white/80 mb-2">لا توجد بنوك مسجلة</h3>
          <p className="text-white/60 mb-6">ابدأ بإضافة بنك جديد لإدارة نسب التمويل</p>
        </div>
      )}
    </div>
  );
}