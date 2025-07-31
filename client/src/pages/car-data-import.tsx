import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  manufacturersCreated: number;
  categoriesCreated: number;
  trimLevelsCreated: number;
  errors: string[];
}

export default function CarDataImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [importComplete, setImportComplete] = useState(false);
  const { toast } = useToast();

  const handleImportComprehensiveData = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportStats(null);
    setImportComplete(false);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      const response = await fetch('/api/cars/import-comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        throw new Error('فشل في استيراد البيانات');
      }

      const result = await response.json();
      setImportStats(result);
      setImportComplete(true);

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم إنشاء ${result.manufacturersCreated} صانع، ${result.categoriesCreated} فئة، ${result.trimLevelsCreated} درجة تجهيز`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: error.message || "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">استيراد بيانات السيارات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Action Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              استيراد البيانات الشاملة
            </CardTitle>
            <CardDescription>
              استيراد بيانات شاملة للشركات المصنعة والفئات ودرجات التجهيز لأشهر السيارات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>جاري الاستيراد...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            <Button 
              onClick={handleImportComprehensiveData}
              disabled={isImporting}
              className="w-full"
              size="lg"
            >
              {isImporting ? "جاري الاستيراد..." : "بدء الاستيراد"}
            </Button>

            {importComplete && importStats && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  تم الاستيراد بنجاح! تم إنشاء {importStats.manufacturersCreated} صانع، 
                  {importStats.categoriesCreated} فئة، و {importStats.trimLevelsCreated} درجة تجهيز.
                </AlertDescription>
              </Alert>
            )}

            {importStats?.errors && importStats.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تحذيرات: {importStats.errors.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Data Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>البيانات المراد استيرادها</CardTitle>
            <CardDescription>
              معاينة الشركات والفئات المتوفرة للاستيراد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline">مرسيدس - 4 فئات</Badge>
                <Badge variant="outline">بي ام دبليو - 5 فئات</Badge>
                <Badge variant="outline">تويوتا - 4 فئات</Badge>
                <Badge variant="outline">لكزس - 3 فئات</Badge>
                <Badge variant="outline">نيسان - 3 فئات</Badge>
                <Badge variant="outline">إنفينيتي - 2 فئة</Badge>
                <Badge variant="outline">لاند روفر - 3 فئات</Badge>
                <Badge variant="outline">جاكوار - 3 فئات</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• إجمالي 8 شركات مصنعة</p>
                <p>• أكثر من 27 فئة سيارات</p>
                <p>• أكثر من 80 درجة تجهيز مختلفة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {importStats && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج الاستيراد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {importStats.manufacturersCreated}
                </div>
                <div className="text-sm text-muted-foreground">شركة مصنعة</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {importStats.categoriesCreated}
                </div>
                <div className="text-sm text-muted-foreground">فئة سيارة</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">
                  {importStats.trimLevelsCreated}
                </div>
                <div className="text-sm text-muted-foreground">درجة تجهيز</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}