import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Building2, User, Landmark, Eye, EyeOff } from "lucide-react";
import type { Bank, InsertBank } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const BANK_TYPES = ["شخصي", "شركة"] as const;

export default function BankManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hiddenBanks, setHiddenBanks] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('hiddenBanks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<InsertBank>({
    logo: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    type: "شركة",
    isActive: true
  });

  const { data: banks = [], isLoading } = useQuery({
    queryKey: ["/api/banks"],
    queryFn: async () => {
      const response = await fetch("/api/banks");
      if (!response.ok) throw new Error("Failed to fetch banks");
      return response.json() as Promise<Bank[]>;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBank) => 
      apiRequest("POST", "/api/banks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء البنك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء البنك",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
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
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث البنك",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/banks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف البنك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف البنك",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      logo: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      iban: "",
      type: "شركة",
      isActive: true
    });
    setLogoPreview(null);
    setEditingBank(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, logo: result }));
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({
      logo: bank.logo || "",
      bankName: bank.bankName,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      iban: bank.iban,
      type: bank.type as "شخصي" | "شركة",
      isActive: bank.isActive
    });
    setLogoPreview(bank.logo || null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBank) {
      updateMutation.mutate({ id: editingBank.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا البنك؟")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleBankVisibility = (bankId: number) => {
    setHiddenBanks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bankId)) {
        newSet.delete(bankId);
        toast({
          title: "تم إظهار البنك",
          description: "أصبح البنك مرئياً في صفحة العرض",
        });
      } else {
        newSet.add(bankId);
        toast({
          title: "تم إخفاء البنك",
          description: "تم إخفاء البنك من صفحة العرض",
        });
      }
      // Save to localStorage
      localStorage.setItem('hiddenBanks', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const activeBanks = banks.filter(bank => bank.isActive);
  const visibleBanks = activeBanks.filter(bank => !hiddenBanks.has(bank.id));
  const personalBanks = visibleBanks.filter(bank => bank.type === "شخصي");
  const companyBanks = visibleBanks.filter(bank => bank.type === "شركة");
  
  // For management view - show all banks including hidden ones
  const allPersonalBanks = activeBanks.filter(bank => bank.type === "شخصي");
  const allCompanyBanks = activeBanks.filter(bank => bank.type === "شركة");

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Landmark className="w-8 h-8 text-[#00627F]" />
            إدارة البنوك
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة بيانات البنوك والحسابات المصرفية
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#00627F] hover:bg-[#004f66] text-white"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة بنك جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBank ? "تعديل البنك" : "إضافة بنك جديد"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">شعار البنك</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img 
                      src={logoPreview} 
                      alt="معاينة الشعار" 
                      className="w-20 h-20 object-contain border rounded"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">اسم البنك *</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="مثال: مصرف الراجحي"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">اسم الحساب *</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="مثال: شركة البريمي للسيارات"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">رقم الحساب *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="575608010000904"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">رقم الآيبان *</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                  placeholder="SA8080000575608010000904"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">النوع *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: "شخصي" | "شركة") => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {type === "شخصي" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Building2 className="w-4 h-4" />
                          )}
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#00627F] hover:bg-[#004f66]"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingBank ? "تحديث" : "إنشاء"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي البنوك</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00627F]">{activeBanks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">البنوك الشخصية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{personalBanks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">بنوك الشركات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{companyBanks.length}</div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="space-y-6">
          {/* Company Banks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                بنوك الشركات ({allCompanyBanks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCompanyBanks.map((bank) => (
                  <Card key={bank.id} className={`border border-blue-200 ${hiddenBanks.has(bank.id) ? 'opacity-50 border-dashed' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {bank.logo && (
                              <img 
                                src={bank.logo} 
                                alt={bank.bankName} 
                                className="w-12 h-12 object-contain"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{bank.bankName}</h3>
                              <p className="text-sm text-gray-600">{bank.accountName}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleBankVisibility(bank.id)}
                              title={hiddenBanks.has(bank.id) ? "إظهار البنك" : "إخفاء البنك"}
                            >
                              {hiddenBanks.has(bank.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(bank)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(bank.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div><strong>رقم الحساب:</strong> {bank.accountNumber}</div>
                          <div><strong>الآيبان:</strong> {bank.iban}</div>
                        </div>
                        
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {bank.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {allCompanyBanks.length === 0 && (
                <Alert>
                  <AlertDescription>
                    لا توجد بنوك شركات مضافة حالياً
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Personal Banks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                البنوك الشخصية ({allPersonalBanks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPersonalBanks.map((bank) => (
                  <Card key={bank.id} className={`border border-green-200 ${hiddenBanks.has(bank.id) ? 'opacity-50 border-dashed' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {bank.logo && (
                              <img 
                                src={bank.logo} 
                                alt={bank.bankName} 
                                className="w-12 h-12 object-contain"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{bank.bankName}</h3>
                              <p className="text-sm text-gray-600">{bank.accountName}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleBankVisibility(bank.id)}
                              title={hiddenBanks.has(bank.id) ? "إظهار البنك" : "إخفاء البنك"}
                            >
                              {hiddenBanks.has(bank.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(bank)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(bank.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div><strong>رقم الحساب:</strong> {bank.accountNumber}</div>
                          <div><strong>الآيبان:</strong> {bank.iban}</div>
                        </div>
                        
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {bank.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {allPersonalBanks.length === 0 && (
                <Alert>
                  <AlertDescription>
                    لا توجد بنوك شخصية مضافة حالياً
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}