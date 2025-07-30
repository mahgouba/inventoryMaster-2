import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Upload, 
  Download, 
  FileUp, 
  FileDown, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Archive,
  RotateCcw
} from "lucide-react";
import SystemGlassWrapper from "@/components/system-glass-wrapper";

export default function DatabaseManagement() {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportOptions, setExportOptions] = useState({
    includeInventory: true,
    includeBanks: true,
    includeQuotations: true,
    includeUsers: false,
    includeAppearance: true
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setImportFile(file);
      } else {
        toast({
          title: "نوع ملف غير صحيح",
          description: "يرجى اختيار ملف JSON فقط",
          variant: "destructive"
        });
      }
    }
  };

  const handleImportDatabase = async () => {
    if (!importFile) {
      toast({
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار ملف قاعدة البيانات أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await importFile.text();
      const data = JSON.parse(fileContent);

      // Validate data structure
      if (!data.inventory && !data.banks && !data.quotations) {
        throw new Error("ملف قاعدة البيانات غير صحيح");
      }

      // Import inventory data
      if (data.inventory && data.inventory.length > 0) {
        for (const item of data.inventory) {
          const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          if (!response.ok) {
            console.warn(`فشل في استيراد عنصر المخزن: ${item.manufacturer}`);
          }
        }
      }

      // Import banks data
      if (data.banks && data.banks.length > 0) {
        for (const bank of data.banks) {
          const response = await fetch('/api/banks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bank)
          });
          if (!response.ok) {
            console.warn(`فشل في استيراد بنك: ${bank.bankName}`);
          }
        }
      }

      // Import quotations data
      if (data.quotations && data.quotations.length > 0) {
        for (const quotation of data.quotations) {
          const response = await fetch('/api/quotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quotation)
          });
          if (!response.ok) {
            console.warn(`فشل في استيراد عرض سعر: ${quotation.quoteNumber}`);
          }
        }
      }

      toast({
        title: "تم استيراد قاعدة البيانات بنجاح",
        description: "تم استيراد جميع البيانات المحددة بنجاح",
      });

      setShowImportDialog(false);
      setImportFile(null);
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "فشل في استيراد قاعدة البيانات",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportDatabase = async () => {
    setIsExporting(true);
    try {
      const exportData: any = {
        exportDate: new Date().toISOString(),
        version: "1.0"
      };

      // Export inventory data
      if (exportOptions.includeInventory) {
        const inventoryResponse = await fetch('/api/inventory');
        if (inventoryResponse.ok) {
          exportData.inventory = await inventoryResponse.json();
        }
      }

      // Export banks data
      if (exportOptions.includeBanks) {
        const banksResponse = await fetch('/api/banks');
        if (banksResponse.ok) {
          exportData.banks = await banksResponse.json();
        }
      }

      // Export quotations data
      if (exportOptions.includeQuotations) {
        const quotationsResponse = await fetch('/api/quotations');
        if (quotationsResponse.ok) {
          exportData.quotations = await quotationsResponse.json();
        }
      }

      // Export appearance settings
      if (exportOptions.includeAppearance) {
        const appearanceResponse = await fetch('/api/appearance');
        if (appearanceResponse.ok) {
          exportData.appearance = await appearanceResponse.json();
        }
      }

      // Export users data (if selected)
      if (exportOptions.includeUsers) {
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          exportData.users = await usersResponse.json();
        }
      }

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "تم تصدير قاعدة البيانات بنجاح",
        description: "تم تحميل ملف النسخة الاحتياطية",
      });

      setShowExportDialog(false);
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "فشل في تصدير قاعدة البيانات",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SystemGlassWrapper>
      <div className="min-h-screen p-6" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="glass-container p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white drop-shadow-md">إدارة قاعدة البيانات</h1>
            </div>
            <p className="text-white/80 drop-shadow-sm">
              استيراد وتصدير بيانات النظام، إنشاء نسخ احتياطية واستعادة البيانات المحفوظة.
            </p>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Import Database Card */}
            <Card className="glass-container border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white drop-shadow-md">
                  <FileUp className="h-5 w-5 text-green-400" />
                  استيراد قاعدة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 text-sm drop-shadow-sm">
                  استيراد البيانات من ملف نسخة احتياطية سابقة أو من نظام آخر.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>يدعم ملفات JSON</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-yellow-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>سيتم دمج البيانات مع البيانات الحالية</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowImportDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      استيراد البيانات
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Export Database Card */}
            <Card className="glass-container border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white drop-shadow-md">
                  <FileDown className="h-5 w-5 text-blue-400" />
                  تصدير قاعدة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 text-sm drop-shadow-sm">
                  إنشاء نسخة احتياطية من البيانات وتحميلها كملف JSON.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <Archive className="h-4 w-4" />
                    <span>نسخة احتياطية شاملة</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <Download className="h-4 w-4" />
                    <span>تحميل فوري للملف</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowExportDialog(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التصدير...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      تصدير البيانات
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          <Card className="glass-container border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white drop-shadow-md">
                <RotateCcw className="h-5 w-5 text-purple-400" />
                تعليمات الاستخدام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">استيراد البيانات:</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• اختر ملف JSON صحيح</li>
                    <li>• تحقق من صحة البيانات قبل الاستيراد</li>
                    <li>• سيتم دمج البيانات مع البيانات الحالية</li>
                    <li>• قم بإنشاء نسخة احتياطية قبل الاستيراد</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">تصدير البيانات:</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• اختر البيانات المطلوب تصديرها</li>
                    <li>• يتم إنشاء ملف JSON شامل</li>
                    <li>• احفظ الملف في مكان آمن</li>
                    <li>• يمكن استخدام الملف لاستعادة البيانات</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="glass-container max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white drop-shadow-md">استيراد قاعدة البيانات</DialogTitle>
              <DialogDescription className="text-white/80">
                اختر ملف النسخة الاحتياطية لاستيراد البيانات
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="importFile" className="text-white/90">ملف قاعدة البيانات (JSON)</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="glass-input bg-white/10 border-white/20 text-white"
                />
              </div>
              {importFile && (
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-md">
                  <p className="text-sm text-green-300">
                    الملف المحدد: {importFile.name}
                  </p>
                  <p className="text-xs text-green-300/80 mt-1">
                    الحجم: {(importFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleImportDatabase}
                  disabled={!importFile || isImporting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      استيراد
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(false)}
                  className="glass-button"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="glass-container max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white drop-shadow-md">تصدير قاعدة البيانات</DialogTitle>
              <DialogDescription className="text-white/80">
                اختر البيانات المطلوب تصديرها
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="includeInventory"
                    checked={exportOptions.includeInventory}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeInventory: e.target.checked }))}
                    className="rounded accent-blue-500"
                  />
                  <Label htmlFor="includeInventory" className="text-white/90">بيانات المخزن</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="includeBanks"
                    checked={exportOptions.includeBanks}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeBanks: e.target.checked }))}
                    className="rounded accent-blue-500"
                  />
                  <Label htmlFor="includeBanks" className="text-white/90">بيانات البنوك</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="includeQuotations"
                    checked={exportOptions.includeQuotations}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeQuotations: e.target.checked }))}
                    className="rounded accent-blue-500"
                  />
                  <Label htmlFor="includeQuotations" className="text-white/90">عروض الأسعار</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="includeAppearance"
                    checked={exportOptions.includeAppearance}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeAppearance: e.target.checked }))}
                    className="rounded accent-blue-500"
                  />
                  <Label htmlFor="includeAppearance" className="text-white/90">إعدادات المظهر</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="includeUsers"
                    checked={exportOptions.includeUsers}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeUsers: e.target.checked }))}
                    className="rounded accent-blue-500"
                  />
                  <Label htmlFor="includeUsers" className="text-white/90">بيانات المستخدمين</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExportDatabase}
                  disabled={isExporting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التصدير...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      تصدير
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                  className="glass-button"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SystemGlassWrapper>
  );
}