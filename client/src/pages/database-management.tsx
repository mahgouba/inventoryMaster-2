import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Download, Upload, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DatabaseManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/database/export');
      if (!response.ok) throw new Error('فشل في تصدير البيانات');
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير قاعدة البيانات بنجاح",
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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const response = await apiRequest('POST', '/api/database/import', data);
      
      toast({
        title: "تم الاستيراد بنجاح",
        description: "تم استيراد قاعدة البيانات بنجاح",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Download className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <CardTitle className="text-white text-xl">تصدير قاعدة البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-center">
                قم بتصدير جميع بيانات النظام في ملف JSON للنسخ الاحتياطي
              </p>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">سيتم تصدير:</p>
                    <ul className="space-y-1 text-blue-300">
                      <li>• جميع عناصر المخزون</li>
                      <li>• بيانات البنوك</li>
                      <li>• عروض الأسعار المحفوظة</li>
                      <li>• بيانات المستخدمين</li>
                      <li>• إعدادات المظهر</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleExport}
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
                    تصدير قاعدة البيانات
                  </div>
                )}
              </Button>
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
              <CardTitle className="text-white text-xl">استيراد قاعدة البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-center">
                استيراد بيانات من ملف نسخة احتياطية سابق
              </p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-200">
                    <p className="font-medium mb-1">تحذير مهم:</p>
                    <ul className="space-y-1 text-red-300">
                      <li>• سيتم استبدال جميع البيانات الحالية</li>
                      <li>• تأكد من عمل نسخة احتياطية أولاً</li>
                      <li>• استخدم ملفات JSON صحيحة فقط</li>
                      <li>• العملية غير قابلة للتراجع</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
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
                      اختيار ملف للاستيراد
                    </div>
                  )}
                </Button>
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