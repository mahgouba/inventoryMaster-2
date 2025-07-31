import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Download, Upload, AlertTriangle, CheckCircle, XCircle, Users, Building, CreditCard, Percent, Car, Settings, Tags, Palette, UserCheck, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";

export default function DatabaseManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedExportTypes, setSelectedExportTypes] = useState<string[]>([]);
  const [selectedImportTypes, setSelectedImportTypes] = useState<string[]>([]);
  const { toast } = useToast();

  const dataTypes = [
    { id: 'banks', label: 'البنوك', icon: Building, description: 'بيانات البنوك الشخصية والشركة' },
    { id: 'financingRates', label: 'نسب التمويل', icon: Percent, description: 'نسب التمويل البنكية' },
    { id: 'manufacturers', label: 'الصناع', icon: Car, description: 'شركات تصنيع السيارات' },
    { id: 'categories', label: 'الفئات', icon: Tags, description: 'فئات ونماذج السيارات' },
    { id: 'trimLevels', label: 'درجة التجهيز', icon: Wrench, description: 'درجات التجهيز والمواصفات' },
    { id: 'interiorColors', label: 'اللون الداخلي', icon: Palette, description: 'ألوان التصميم الداخلي للسيارات' },
    { id: 'exteriorColors', label: 'اللون الخارجي', icon: Palette, description: 'ألوان الطلاء الخارجي للسيارات' },
    { id: 'leaveRequests', label: 'الإجازات', icon: UserCheck, description: 'طلبات الإجازة والاستئذان' },
    { id: 'users', label: 'المستخدمين', icon: Users, description: 'بيانات المستخدمين والصلاحيات' },
    { id: 'inventory', label: 'المخزون', icon: Database, description: 'عناصر المخزون والسيارات' },
    { id: 'quotations', label: 'العروض', icon: CreditCard, description: 'عروض الأسعار المحفوظة' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, description: 'إعدادات النظام والمظهر' }
  ];

  const handleExport = async (selective = false) => {
    setIsExporting(true);
    try {
      const exportTypes = selective ? selectedExportTypes : [];
      const queryParams = exportTypes.length > 0 ? `?types=${exportTypes.join(',')}` : '';
      const response = await fetch(`/api/database/export${queryParams}`);
      if (!response.ok) throw new Error('فشل في تصدير البيانات');
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const prefix = selective ? 'selective-' : 'full-';
      a.download = `${prefix}database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "تم التصدير بنجاح",
        description: selective ? "تم تصدير البيانات المحددة بنجاح" : "تم تصدير قاعدة البيانات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير قاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, selective = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف JSON فقط",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const importData = selective ? { ...data, selectedTypes: selectedImportTypes } : data;
      const response = await apiRequest('POST', '/api/database/import', importData);
      
      toast({
        title: "تم الاستيراد بنجاح",
        description: selective ? "تم استيراد البيانات المحددة بنجاح" : "تم استيراد قاعدة البيانات بنجاح",
      });
      
      // Refresh the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد قاعدة البيانات. تأكد من صحة ملف JSON",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const toggleExportType = (typeId: string) => {
    setSelectedExportTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleImportType = (typeId: string) => {
    setSelectedImportTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-8 h-8 text-[#C79C45]" />
            <h1 className="text-3xl font-bold text-white">إدارة قاعدة البيانات</h1>
          </div>
          <p className="text-white/70 text-lg">
            استيراد وتصدير بيانات النظام بطريقة آمنة ومتقدمة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Download className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <CardTitle className="text-white text-xl">تصدير البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selection for Export */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-center">اختر نوع البيانات للتصدير</h3>
                <div className="grid grid-cols-1 gap-3">
                  {dataTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.id}
                        className="flex items-center space-x-3 space-x-reverse p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => toggleExportType(type.id)}
                      >
                        <Checkbox
                          checked={selectedExportTypes.includes(type.id)}
                          onCheckedChange={() => toggleExportType(type.id)}
                          className="border-white/30 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <IconComponent className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{type.label}</p>
                            <p className="text-white/60 text-sm">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Export Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => handleExport(false)}
                  disabled={isExporting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isExporting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري التصدير...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      تصدير جميع البيانات
                    </div>
                  )}
                </Button>

                <Button 
                  onClick={() => handleExport(true)}
                  disabled={isExporting || selectedExportTypes.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تصدير البيانات المحددة ({selectedExportTypes.length})
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Upload className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <CardTitle className="text-white text-xl">استيراد البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Type Selection for Import */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-center">اختر نوع البيانات للاستيراد</h3>
                <div className="grid grid-cols-1 gap-3">
                  {dataTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.id}
                        className="flex items-center space-x-3 space-x-reverse p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => toggleImportType(type.id)}
                      >
                        <Checkbox
                          checked={selectedImportTypes.includes(type.id)}
                          onCheckedChange={() => toggleImportType(type.id)}
                          className="border-white/30 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <IconComponent className="w-5 h-5 text-orange-400" />
                          <div>
                            <p className="text-white font-medium">{type.label}</p>
                            <p className="text-white/60 text-sm">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-200">
                    <p className="font-medium mb-1">تحذير مهم:</p>
                    <ul className="space-y-1 text-red-300">
                      <li>• سيتم استبدال البيانات المحددة</li>
                      <li>• تأكد من عمل نسخة احتياطية أولاً</li>
                      <li>• استخدم ملفات JSON صحيحة فقط</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Import Buttons */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleImport(e, false)}
                    disabled={isImporting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button 
                    disabled={isImporting}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white pointer-events-none"
                  >
                    {isImporting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الاستيراد...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        استيراد جميع البيانات
                      </div>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleImport(e, true)}
                    disabled={isImporting || selectedImportTypes.length === 0}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button 
                    disabled={isImporting || selectedImportTypes.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white pointer-events-none disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      استيراد البيانات المحددة ({selectedImportTypes.length})
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">تعليمات الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/70">
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-400" />
                  خطوات التصدير
                </h3>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>انقر على زر "تصدير قاعدة البيانات"</li>
                  <li>انتظر حتى اكتمال عملية التصدير</li>
                  <li>سيتم تحميل ملف JSON تلقائياً</li>
                  <li>احفظ الملف في مكان آمن</li>
                </ol>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-orange-400" />
                  خطوات الاستيراد
                </h3>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>تأكد من عمل نسخة احتياطية أولاً</li>
                  <li>انقر على زر "اختيار ملف للاستيراد"</li>
                  <li>اختر ملف JSON صحيح</li>
                  <li>انتظر حتى اكتمال العملية</li>
                  <li>ستتم إعادة تحميل الصفحة تلقائياً</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}