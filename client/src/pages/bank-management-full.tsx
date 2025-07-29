import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Building2, User, Landmark, Eye, EyeOff, Percent, Calendar } from "lucide-react";
import type { Bank, InsertBank, BankInterestRate, InsertBankInterestRate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import SystemGlassWrapper from "@/components/system-glass-wrapper";

interface BankFormData extends Omit<InsertBank, 'isActive'> {
  isActive: boolean;
}

interface InterestRateFormData extends Omit<InsertBankInterestRate, 'bankId'> {
  categoryName: string;
  interestRate: string;
  years: string;
}

export default function BankManagementFullPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isRatesDialogOpen, setIsRatesDialogOpen] = useState(false);
  const [selectedBankForRates, setSelectedBankForRates] = useState<Bank | null>(null);
  const [editingRate, setEditingRate] = useState<BankInterestRate | null>(null);
  const [formData, setFormData] = useState<BankFormData>({
    bankName: "",
    nameEn: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    type: "شركة",
    logo: "",
    isActive: true,
  });

  const [rateFormData, setRateFormData] = useState<InterestRateFormData>({
    categoryName: "",
    interestRate: "",
    years: "1",
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch banks
  const { data: banks = [], isLoading } = useQuery({
    queryKey: ["/api/banks"],
  });

  // Fetch interest rates for selected bank
  const { data: interestRates = [] } = useQuery({
    queryKey: ["/api/bank-interest-rates", selectedBankForRates?.id],
    enabled: !!selectedBankForRates?.id,
  });

  // Bank mutations
  const createBankMutation = useMutation({
    mutationFn: (data: InsertBank) => apiRequest("POST", "/api/banks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة البنك بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة البنك",
        variant: "destructive",
      });
    },
  });

  const updateBankMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBank> }) => 
      apiRequest("PUT", `/api/banks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      setIsDialogOpen(false);
      setEditingBank(null);
      resetForm();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث البنك بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث البنك",
        variant: "destructive",
      });
    },
  });

  const deleteBankMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/banks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف البنك بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف البنك",
        variant: "destructive",
      });
    },
  });

  // Interest rate mutations
  const createRateMutation = useMutation({
    mutationFn: (data: InsertBankInterestRate) => 
      apiRequest("POST", "/api/bank-interest-rates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-interest-rates", selectedBankForRates?.id] });
      setIsRatesDialogOpen(false);
      resetRateForm();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة سعر الفائدة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة سعر الفائدة",
        variant: "destructive",
      });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBankInterestRate> }) => 
      apiRequest("PUT", `/api/bank-interest-rates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-interest-rates", selectedBankForRates?.id] });
      setIsRatesDialogOpen(false);
      setEditingRate(null);
      resetRateForm();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث سعر الفائدة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث سعر الفائدة",
        variant: "destructive",
      });
    },
  });

  const deleteRateMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/bank-interest-rates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-interest-rates", selectedBankForRates?.id] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف سعر الفائدة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف سعر الفائدة",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      bankName: "",
      nameEn: "",
      accountName: "",
      accountNumber: "",
      iban: "",
      type: "شركة",
      logo: "",
      isActive: true,
    });
  };

  const resetRateForm = () => {
    setRateFormData({
      categoryName: "",
      interestRate: "",
      years: "1",
      isActive: true,
    });
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({
      bankName: bank.bankName,
      nameEn: bank.nameEn || "",
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      iban: bank.iban,
      type: bank.type as "شخصي" | "شركة",
      logo: bank.logo || "",
      isActive: bank.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleEditRate = (rate: BankInterestRate) => {
    setEditingRate(rate);
    setRateFormData({
      categoryName: rate.categoryName,
      interestRate: rate.interestRate,
      years: rate.years.toString(),
      isActive: rate.isActive,
    });
    setIsRatesDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingBank) {
      updateBankMutation.mutate({ id: editingBank.id, data: formData });
    } else {
      createBankMutation.mutate(formData);
    }
  };

  const handleRateSubmit = () => {
    if (!selectedBankForRates) return;

    const rateData: InsertBankInterestRate = {
      bankId: selectedBankForRates.id,
      categoryName: rateFormData.categoryName,
      interestRate: rateFormData.interestRate,
      years: parseInt(rateFormData.years),
      isActive: rateFormData.isActive,
    };

    if (editingRate) {
      updateRateMutation.mutate({ id: editingRate.id, data: rateData });
    } else {
      createRateMutation.mutate(rateData);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoData = event.target?.result as string;
        setFormData(prev => ({ ...prev, logo: logoData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openRatesManagement = (bank: Bank) => {
    setSelectedBankForRates(bank);
    setIsRatesDialogOpen(true);
    resetRateForm();
  };

  if (isLoading) {
    return (
      <SystemGlassWrapper>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white text-lg">جارٍ التحميل...</div>
        </div>
      </SystemGlassWrapper>
    );
  }

  return (
    <SystemGlassWrapper>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-sm">إدارة البنوك</h1>
            <p className="text-white/80 mt-2">إضافة وتعديل بيانات البنوك وأسعار الفائدة</p>
          </div>
          <Button
            onClick={() => {
              setEditingBank(null);
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة بنك جديد
          </Button>
        </div>

        {banks.length === 0 ? (
          <Card className="glass-container border-white/20">
            <CardContent className="p-8 text-center">
              <Landmark className="w-16 h-16 mx-auto text-white/60 mb-4" />
              <p className="text-white/80 text-lg">لا توجد بنوك مضافة</p>
              <p className="text-white/60 mt-2">قم بإضافة البنك الأول لبدء إدارة أسعار الفائدة</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks.map((bank: Bank) => (
              <Card key={bank.id} className="glass-container border-white/20 hover:border-white/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {bank.logo && (
                        <img src={bank.logo} alt={bank.bankName} className="w-10 h-10 object-contain rounded" />
                      )}
                      <div>
                        <CardTitle className="text-white text-lg">{bank.bankName}</CardTitle>
                        {bank.nameEn && (
                          <p className="text-white/60 text-sm">{bank.nameEn}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={bank.type === "شركة" ? "default" : "secondary"} className="text-xs">
                      {bank.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-white/80">
                      <span className="font-medium">اسم الحساب:</span>
                      <span className="mr-2">{bank.accountName}</span>
                    </div>
                    <div className="text-sm text-white/80">
                      <span className="font-medium">رقم الحساب:</span>
                      <span className="mr-2 font-mono">{bank.accountNumber}</span>
                    </div>
                    <div className="text-sm text-white/80">
                      <span className="font-medium">الآيبان:</span>
                      <span className="mr-2 font-mono">{bank.iban}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/20">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRatesManagement(bank)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Percent className="w-4 h-4 ml-1" />
                      أسعار الفائدة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(bank)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteBankMutation.mutate(bank.id)}
                      className="border-white/20 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bank Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="glass-container border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingBank ? "تعديل بيانات البنك" : "إضافة بنك جديد"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-white">اسم البنك</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="glass-container border-white/20 text-white placeholder:text-white/50"
                  placeholder="مثال: مصرف الراجحي"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn" className="text-white">الاسم الإنجليزي</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                  className="glass-container border-white/20 text-white placeholder:text-white/50"
                  placeholder="Al Rajhi Bank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-white">اسم الحساب</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  className="glass-container border-white/20 text-white placeholder:text-white/50"
                  placeholder="شركة البريمي للسيارات"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-white">رقم الحساب</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="glass-container border-white/20 text-white placeholder:text-white/50"
                  placeholder="575608010000904"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="iban" className="text-white">رقم الآيبان</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                  className="glass-container border-white/20 text-white placeholder:text-white/50"
                  placeholder="SA8080000575608010000904"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">نوع الحساب</Label>
                <Select value={formData.type} onValueChange={(value: "شخصي" | "شركة") => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="glass-container border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="شركة">حساب شركة</SelectItem>
                    <SelectItem value="شخصي">حساب شخصي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-white">شعار البنك</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="glass-container border-white/20 text-white file:bg-white/10 file:border-0 file:text-white"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                إلغاء
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingBank ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Interest Rates Management Dialog */}
        <Dialog open={isRatesDialogOpen} onOpenChange={setIsRatesDialogOpen}>
          <DialogContent className="glass-container border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                إدارة أسعار الفائدة - {selectedBankForRates?.bankName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Add New Rate Form */}
              <Card className="glass-container border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {editingRate ? "تعديل سعر الفائدة" : "إضافة سعر فائدة جديد"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName" className="text-white">اسم الفئة</Label>
                      <Input
                        id="categoryName"
                        value={rateFormData.categoryName}
                        onChange={(e) => setRateFormData(prev => ({ ...prev, categoryName: e.target.value }))}
                        className="glass-container border-white/20 text-white placeholder:text-white/50"
                        placeholder="موظف حكومي"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interestRate" className="text-white">نسبة الفائدة (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        value={rateFormData.interestRate}
                        onChange={(e) => setRateFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                        className="glass-container border-white/20 text-white placeholder:text-white/50"
                        placeholder="3.50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years" className="text-white">عدد السنوات</Label>
                      <Select value={rateFormData.years} onValueChange={(value) => setRateFormData(prev => ({ ...prev, years: value }))}>
                        <SelectTrigger className="glass-container border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7].map(year => (
                            <SelectItem key={year} value={year.toString()}>{year} سنة</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleRateSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 ml-1" />
                      {editingRate ? "تحديث" : "إضافة"}
                    </Button>
                    {editingRate && (
                      <Button variant="outline" onClick={() => { setEditingRate(null); resetRateForm(); }} className="border-white/20 text-white hover:bg-white/10">
                        إلغاء التعديل
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Existing Rates */}
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold">أسعار الفائدة المضافة</h3>
                {interestRates.length === 0 ? (
                  <Card className="glass-container border-white/20">
                    <CardContent className="p-6 text-center">
                      <Percent className="w-12 h-12 mx-auto text-white/60 mb-2" />
                      <p className="text-white/80">لا توجد أسعار فائدة مضافة لهذا البنك</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interestRates.map((rate: BankInterestRate) => (
                      <Card key={rate.id} className="glass-container border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">{rate.categoryName}</h4>
                            <Badge variant="outline" className="border-white/20 text-white">
                              {rate.years} سنة
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-green-400 mb-3">
                            {parseFloat(rate.interestRate).toFixed(2)}%
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRate(rate)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRateMutation.mutate(rate.id)}
                              className="border-white/20 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRatesDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SystemGlassWrapper>
  );
}