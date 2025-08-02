import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportResponse {
  success: boolean;
  count?: number;
  manufacturers?: string[];
  categories?: string[];
  trimLevels?: string[];
  data?: {
    manufacturers: string[];
    categories: string[];
    trimLevels: string[];
  };
  counts?: {
    manufacturers: number;
    categories: number;
    trimLevels: number;
  };
  message: string;
}

export default function DatabaseImportManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{
    manufacturers?: ImportResponse;
    categories?: ImportResponse;
    trimLevels?: ImportResponse;
    all?: ImportResponse;
  }>({});

  const handleImport = async (type: 'manufacturers' | 'categories' | 'trim-levels' | 'all') => {
    setIsLoading(type);
    try {
      const endpoint = type === 'all' 
        ? '/api/import/all-from-db' 
        : `/api/import/${type}-from-db`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ImportResponse = await response.json();
      
      setImportResults(prev => ({
        ...prev,
        [type === 'trim-levels' ? 'trimLevels' : type]: result
      }));

      toast({
        title: result.success ? "نجح الاستيراد" : "فشل الاستيراد",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

    } catch (error) {
      console.error(`Error importing ${type}:`, error);
      toast({
        title: "خطأ في الاستيراد",
        description: `فشل في استيراد ${type === 'manufacturers' ? 'الصانعين' : type === 'categories' ? 'الفئات' : type === 'trim-levels' ? 'درجات التجهيز' : 'جميع البيانات'} من قاعدة البيانات`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const ImportCard = ({ 
    title, 
    description, 
    type, 
    result,
    icon: Icon 
  }: {
    title: string;
    description: string;
    type: 'manufacturers' | 'categories' | 'trim-levels' | 'all';
    result?: ImportResponse;
    icon: any;
  }) => (
    <Card className="glass-container border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-400" />
          {title}
        </CardTitle>
        <p className="text-white/70 text-sm">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => handleImport(type)}
          disabled={isLoading === type}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading === type ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              جارِ الاستيراد...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 ml-2" />
              استيراد من قاعدة البيانات
            </>
          )}
        </Button>

        {result && (
          <div className={`p-3 rounded-lg ${result.success ? 'bg-green-600/20 border border-green-500/30' : 'bg-red-600/20 border border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${result.success ? 'text-green-100' : 'text-red-100'}`}>
                {result.success ? 'تم الاستيراد بنجاح' : 'فشل الاستيراد'}
              </span>
            </div>
            <p className="text-white/70 text-sm">{result.message}</p>
            
            {result.success && result.count && (
              <Badge variant="secondary" className="mt-2 bg-white/10 text-white">
                {result.count} عنصر
              </Badge>
            )}

            {result.success && result.counts && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="bg-white/10 text-white">
                  صانعين: {result.counts.manufacturers}
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  فئات: {result.counts.categories}
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  درجات تجهيز: {result.counts.trimLevels}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="glass-container border-white/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-400" />
            استيراد البيانات من قاعدة البيانات
          </CardTitle>
          <p className="text-white/70">
            استيراد قوائم الصانعين والفئات ودرجات التجهيز مباشرة من قاعدة البيانات
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ImportCard
          title="الصانعين"
          description="استيراد قائمة جميع الصانعين من قاعدة البيانات"
          type="manufacturers"
          result={importResults.manufacturers}
          icon={Database}
        />
        
        <ImportCard
          title="الفئات"
          description="استيراد قائمة جميع فئات المركبات من قاعدة البيانات"
          type="categories"
          result={importResults.categories}
          icon={Database}
        />
        
        <ImportCard
          title="درجات التجهيز"
          description="استيراد قائمة جميع درجات التجهيز من قاعدة البيانات"
          type="trim-levels"
          result={importResults.trimLevels}
          icon={Database}
        />
        
        <ImportCard
          title="جميع البيانات"
          description="استيراد جميع البيانات (الصانعين والفئات ودرجات التجهيز) معاً"
          type="all"
          result={importResults.all}
          icon={Download}
        />
      </div>

      {importResults.all?.success && importResults.all.data && (
        <Card className="glass-container border-white/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">
              نتائج الاستيراد المفصلة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">الصانعين ({importResults.all.data.manufacturers.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {importResults.all.data.manufacturers.slice(0, 10).map((manufacturer, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/10 text-white block text-right">
                      {manufacturer}
                    </Badge>
                  ))}
                  {importResults.all.data.manufacturers.length > 10 && (
                    <p className="text-white/50 text-sm">و {importResults.all.data.manufacturers.length - 10} صانع آخر...</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">الفئات ({importResults.all.data.categories.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {importResults.all.data.categories.slice(0, 10).map((category, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/10 text-white block text-right">
                      {category}
                    </Badge>
                  ))}
                  {importResults.all.data.categories.length > 10 && (
                    <p className="text-white/50 text-sm">و {importResults.all.data.categories.length - 10} فئة أخرى...</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">درجات التجهيز ({importResults.all.data.trimLevels.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {importResults.all.data.trimLevels.slice(0, 10).map((trimLevel, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/10 text-white block text-right">
                      {trimLevel}
                    </Badge>
                  ))}
                  {importResults.all.data.trimLevels.length > 10 && (
                    <p className="text-white/50 text-sm">و {importResults.all.data.trimLevels.length - 10} درجة تجهيز أخرى...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}