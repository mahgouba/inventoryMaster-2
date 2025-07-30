import React, { useState } from "react";
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
import { Plus, Edit, Trash2, Building, Percent, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface FinancingRate {
  id: number;
  bankName: string;
  bankNameEn: string;
  financingType: "personal" | "commercial";
  minRate: number;
  maxRate: number;
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

  const form = useForm({
    defaultValues: {
      bankName: "",
      bankNameEn: "",
      financingType: "personal",
      minRate: 0,
      maxRate: 0,
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

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      features: data.features.split('\n').filter((f: string) => f.trim()),
      requirements: data.requirements.split('\n').filter((r: string) => r.trim()),
      lastUpdated: new Date().toISOString()
    };
    createMutation.mutate(formattedData);
  };

  const handleEdit = (rate: FinancingRate) => {
    setEditingRate(rate);
    form.reset({
      bankName: rate.bankName,
      bankNameEn: rate.bankNameEn,
      financingType: rate.financingType,
      minRate: rate.minRate,
      maxRate: rate.maxRate,
      minPeriod: rate.minPeriod,
      maxPeriod: rate.maxPeriod,
      minAmount: rate.minAmount,
      maxAmount: rate.maxAmount,
      features: rate.features.join('\n'),
      requirements: rate.requirements.join('\n'),
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
                  form.reset();
                }}
                className="bg-[#C79C45] hover:bg-[#B8862F] text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة معدل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl glass-container border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white text-right">
                  {editingRate ? "تعديل معدل التمويل" : "إضافة معدل تمويل جديد"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">اسم البنك (عربي)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="glass-input text-white"
                              placeholder="مصرف الراجحي"
                            />
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
                          <FormLabel className="text-white">اسم البنك (إنجليزي)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="glass-input text-white"
                              placeholder="Al Rajhi Bank"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="financingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">نوع التمويل</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-input text-white">
                              <SelectValue placeholder="اختر نوع التمويل" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">أقل نسبة تمويل (%)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="glass-input text-white"
                              placeholder="5.5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">أعلى نسبة تمويل (%)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="glass-input text-white"
                              placeholder="12.5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">أقل فترة (شهر)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="glass-input text-white"
                              placeholder="12"
                            />
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
                          <FormLabel className="text-white">أعلى فترة (شهر)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="glass-input text-white"
                              placeholder="60"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">أقل مبلغ (ريال)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="glass-input text-white"
                              placeholder="50000"
                            />
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
                          <FormLabel className="text-white">أعلى مبلغ (ريال)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="glass-input text-white"
                              placeholder="1000000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      className="bg-[#C79C45] hover:bg-[#B8862F] text-white"
                    >
                      {createMutation.isPending ? "جاري الحفظ..." : editingRate ? "تحديث" : "إضافة"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      إلغاء
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
          <Label className="text-white">فلترة حسب النوع:</Label>
          <Select value={filterType} onValueChange={(value: "all" | "personal" | "commercial") => setFilterType(value)}>
            <SelectTrigger className="w-48 glass-input text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="personal">تمويل شخصي</SelectItem>
              <SelectItem value="commercial">تمويل تجاري</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rates.map((rate) => (
          <Card key={rate.id} className="glass-container border border-white/20 hover:border-[#C79C45]/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-5 w-5 text-[#C79C45]" />
                  {rate.bankName}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(rate)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(rate.id)}
                    className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-white/60 text-sm">{rate.bankNameEn}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-[#C79C45] text-lg font-bold">
                    {rate.minRate}% - {rate.maxRate}%
                  </div>
                  <div className="text-white/60 text-xs">نسبة التمويل</div>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-blue-400 text-lg font-bold">
                    {rate.minPeriod} - {rate.maxPeriod}
                  </div>
                  <div className="text-white/60 text-xs">فترة السداد (شهر)</div>
                </div>
              </div>
              
              <div>
                <div className="text-white/80 text-sm mb-1">حدود المبلغ:</div>
                <div className="text-green-400 text-sm">
                  {formatCurrency(rate.minAmount)} - {formatCurrency(rate.maxAmount)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  rate.financingType === "personal" 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "bg-purple-500/20 text-purple-400"
                )}>
                  {rate.financingType === "personal" ? "شخصي" : "تجاري"}
                </span>
                
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  rate.isActive 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                )}>
                  {rate.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
              
              <div className="text-white/60 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                آخر تحديث: {new Date(rate.lastUpdated).toLocaleDateString('ar-SA')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rates.length === 0 && (
        <div className="text-center py-12">
          <Percent className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-white/80 text-lg font-medium mb-2">لا توجد معدلات تمويل</h3>
          <p className="text-white/60 mb-4">ابدأ بإضافة معدلات التمويل للبنوك المختلفة</p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#C79C45] hover:bg-[#B8862F] text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة أول معدل
          </Button>
        </div>
      )}
    </div>
  );
}