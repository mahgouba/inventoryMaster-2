import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExcelImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to parse CSV line properly handling quotes and Arabic text
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export default function ExcelImport({ open, onOpenChange }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      // Use hierarchical import endpoint
      return await apiRequest("POST", "/api/inventory/hierarchical-import", { data });
    },
    onSuccess: (response) => {
      const { summary, results } = response;
      
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hierarchical/manufacturers"] });
      
      toast({
        title: "تم الاستيراد الهرمي",
        description: `تم استيراد ${summary.successful} عنصر بنجاح${summary.failed > 0 ? ` وفشل في ${summary.failed} عنصر` : ''}\nتم تحديث البيانات الهرمية (الصناع والفئات ودرجات التجهيز)`,
      });
      
      onOpenChange(false);
      setFile(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في استيراد البيانات",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv" // .csv
      ];
      
      const isValidType = validTypes.includes(selectedFile.type) || 
                         selectedFile.name.endsWith('.xlsx') || 
                         selectedFile.name.endsWith('.xls') ||
                         selectedFile.name.endsWith('.csv');
      
      if (isValidType) {
        setFile(selectedFile);
      } else {
        toast({
          title: "خطأ في الملف",
          description: "يرجى اختيار ملف Excel (.xlsx, .xls) أو CSV (.csv)",
          variant: "destructive",
        });
      }
    }
  };

  const processExcelFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      let headers: string[] = [];
      let rows: any[][] = [];
      
      // Check if it's CSV file
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error("الملف فارغ أو لا يحتوي على بيانات كافية");
        }
        
        // Parse CSV manually to handle Arabic text properly
        headers = parseCSVLine(lines[0]);
        rows = lines.slice(1).map(line => parseCSVLine(line));
      } else {
        // Handle Excel files
        const { read, utils } = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error("الملف فارغ أو لا يحتوي على بيانات كافية");
        }
        
        // Get headers from first row
        headers = jsonData[0] as string[];
        rows = jsonData.slice(1) as any[][];
      }

      // Map headers to expected field names
      const headerMap: Record<string, string> = {
        "الصانع": "manufacturer",
        "الفئة": "category", 
        "درجة التجهيز": "trimLevel",
        "سعة المحرك": "engineCapacity",
        "السنة": "year",
        "اللون الخارجي": "exteriorColor",
        "اللون الداخلي": "interiorColor",
        "الحالة": "status",
        "الموقع": "location",
        "المكان": "location", // Alternative Arabic name
        "الإستيراد": "importType",
        "نوع الاستيراد": "importType", // Alternative Arabic name
        "رقم الهيكل": "chassisNumber",
        "نوع الملكية": "ownershipType",
        "تاريخ الدخول": "entryDate",
        "السعر": "price",
        "الملاحظات": "notes"
      };
      
      // Convert rows to inventory items
      const inventoryData = rows
        .filter(row => row.some(cell => cell != null && cell !== "")) // Skip empty rows
        .map((row, index) => {
          const item: any = {
            images: [],
            isSold: false
          };
          
          headers.forEach((header, headerIndex) => {
            const fieldName = headerMap[header] || header;
            const value = row[headerIndex];
            
            if (value != null && value !== "") {
              if (fieldName === "year") {
                item[fieldName] = parseInt(value) || new Date().getFullYear();
              } else if (fieldName === "price") {
                item[fieldName] = String(value).replace(/[^\d]/g, ""); // Remove non-digits
              } else {
                item[fieldName] = String(value);
              }
            }
          });
          
          // Validate required fields
          const requiredFields = ["manufacturer", "category", "engineCapacity", "year", "exteriorColor", "interiorColor", "status"];
          const missingFields = requiredFields.filter(field => !item[field]);
          
          if (missingFields.length > 0) {
            throw new Error(`الصف ${index + 2}: حقول مطلوبة مفقودة - ${missingFields.join(", ")}`);
          }
          
          return item;
        });
      
      if (inventoryData.length === 0) {
        throw new Error("لم يتم العثور على بيانات صالحة في الملف");
      }
      
      importMutation.mutate(inventoryData);
    } catch (error) {
      toast({
        title: "خطأ في معالجة الملف",
        description: error instanceof Error ? error.message : "تأكد من صحة تنسيق الملف",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template with only the specified columns
    const headers = [
      "الصانع", "الفئة", "درجة التجهيز", "سعة المحرك", "السنة", "اللون الخارجي", 
      "اللون الداخلي", "الحالة", "المكان", "نوع الاستيراد", "رقم الهيكل", 
      "نوع الملكية", "تاريخ الدخول", "السعر", "الملاحظات"
    ];
    
    const sampleRows = [
      [
        "مرسيدس", "E200", "Avantgarde", "2.0L", "2025", "أسود", 
        "بيج", "متوفر", "المعرض", "شخصي", "WDB2130461A123456", 
        "ملك الشركة", "2024-01-15", "150000", "سيارة جديدة - حالة ممتازة"
      ],
      [
        "بي ام دبليو", "X5", "xDrive40i", "3.0L", "2024", "أبيض", 
        "أسود", "في الطريق", "الميناء", "شركة", "WBAFR9C50KC123457", 
        "معرض (وسيط)", "2024-02-20", "200000", "موديل حديث - فل أوبشن"
      ],
      [
        "تويوتا", "كامري", "Grande", "2.5L", "2024", "فضي", 
        "رمادي", "متوفر", "المعرض", "مستعمل شخصي", "4T1BF1FK0GU123458", 
        "ملك الشركة", "2023-12-01", "80000", "حالة جيدة"
      ]
    ];
    
    // Create CSV content with header and sample rows
    const csvContent = [
      headers.join(","),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "نموذج_استيراد_المخزون.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            استيراد من Excel/CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">تحميل النموذج</CardTitle>
              <CardDescription>
                <div className="space-y-2">
                  <div>احصل على نموذج CSV يحتوي على الأعمدة المطلوبة للاستيراد الهرمي</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
                    <strong className="text-blue-800 dark:text-blue-200">ميزة الاستيراد الهرمي:</strong>
                    <ul className="text-blue-700 dark:text-blue-300 mt-1 space-y-1 text-xs">
                      <li>• تكرار الصانع → يضيف فئة جديدة لذلك الصانع</li>
                      <li>• تكرار الفئة → يضيف درجة تجهيز جديدة لتلك الفئة</li>
                      <li>• تكرار درجة التجهيز → يضيف لون جديد لتلك الدرجة</li>
                    </ul>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 ml-2" />
                تحميل النموذج CSV
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">رفع الملف</CardTitle>
              <CardDescription>
                اختر ملف Excel (.xlsx, .xls) أو CSV (.csv) يحتوي على بيانات المخزون. النظام سيقوم بإنشاء البيانات الهرمية تلقائياً عند تكرار الصناع والفئات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              
              {file && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  تم اختيار الملف: {file.name}
                </div>
              )}
              
              <Button
                onClick={processExcelFile}
                disabled={!file || isProcessing || importMutation.isPending}
                className="w-full"
              >
                <Upload className="h-4 w-4 ml-2" />
                {isProcessing || importMutation.isPending ? "جاري المعالجة..." : "استيراد البيانات"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}