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

export default function ExcelImport({ open, onOpenChange }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const results = [];
      for (const item of data) {
        try {
          const result = await apiRequest("POST", "/api/inventory", item);
          results.push({ success: true, item, result });
        } catch (error) {
          results.push({ success: false, item, error });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${successful} عنصر بنجاح${failed > 0 ? ` وفشل في ${failed} عنصر` : ''}`,
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
      // Use xlsx library to parse Excel files
      const { read, utils } = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error("الملف فارغ أو لا يحتوي على بيانات كافية");
          }
          
          // Get headers from first row
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
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
            "نوع الاستيراد": "importType",
            "الموقع": "location",
            "رقم الهيكل": "chassisNumber",
            "السعر": "price",
            "المهندس": "engineer",
            "تاريخ الوصول": "arrivalDate",
            "تاريخ البيع": "saleDate",
            "المشتري": "buyer",
            "سعر البيع": "salePrice",
            "الربح": "profit",
            "الملاحظات": "notes",
            "مباع": "isSold"
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
            description: error.message || "تأكد من صحة تنسيق الملف واتباع النموذج المحدد",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "خطأ في قراءة الملف",
          description: "تأكد من أن الملف غير تالف",
          variant: "destructive",
        });
        setIsProcessing(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "خطأ",
        description: "فشل في قراءة الملف. تأكد من أن المتصفح يدعم قراءة ملفات Excel",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    // Create a comprehensive CSV template for Excel with all inventory fields
    const headers = [
      "الصانع", "الفئة", "درجة التجهيز", "سعة المحرك", "السنة", "اللون الخارجي", 
      "اللون الداخلي", "الحالة", "نوع الاستيراد", "الموقع", "رقم الهيكل", 
      "السعر", "المهندس", "تاريخ الوصول", "تاريخ البيع", "المشتري", 
      "سعر البيع", "الربح", "الملاحظات", "مباع"
    ];
    
    const sampleRows = [
      [
        "مرسيدس", "E200", "Avantgarde", "2.0L", "2025", "أسود", 
        "بيج", "متوفر", "شخصي", "المعرض", "WDB2130461A123456", 
        "150000", "أحمد محمد", "2024-01-15", "", "", 
        "", "", "سيارة جديدة - حالة ممتازة", "لا"
      ],
      [
        "بي ام دبليو", "X5", "xDrive40i", "3.0L", "2024", "أبيض", 
        "أسود", "في الطريق", "شركة", "الميناء", "WBAFR9C50KC123457", 
        "200000", "سالم أحمد", "2024-02-20", "", "", 
        "", "", "موديل حديث - فل أوبشن", "لا"
      ],
      [
        "تويوتا", "كامري", "Grande", "2.5L", "2024", "فضي", 
        "رمادي", "مباع", "مستعمل شخصي", "المعرض", "4T1BF1FK0GU123458", 
        "80000", "محمد سالم", "2023-12-01", "2024-01-10", "خالد العلي", 
        "85000", "5000", "حالة جيدة - تم البيع", "نعم"
      ]
    ];
    
    // Create CSV content with header and sample rows
    const csvContent = [
      headers.join(","),
      ...sampleRows.map(row => row.join(","))
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            استيراد من Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">تحميل النموذج</CardTitle>
              <CardDescription>
                احصل على نموذج Excel شامل يحتوي على جميع حقول المخزون: الصانع، الفئة، درجة التجهيز، سعة المحرك، السنة، الألوان، الحالة، نوع الاستيراد، الموقع، رقم الهيكل، السعر، المهندس، التواريخ، بيانات البيع والملاحظات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 ml-2" />
                تحميل النموذج
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">رفع الملف</CardTitle>
              <CardDescription>
                اختر ملف Excel أو CSV يحتوي على بيانات المخزون الكاملة. تأكد من تطابق أسماء الأعمدة مع النموذج المحمل وتضمين جميع الحقول المطلوبة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
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

          {/* Instructions */}
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
            <p className="font-medium mb-2">تعليمات مهمة:</p>
            <ul className="space-y-1 text-xs">
              <li>• استخدم النموذج المحمل أعلاه لضمان تطابق الأعمدة</li>
              <li>• <strong>الحقول الإجبارية:</strong> الصانع، الفئة، سعة المحرك، السنة، الألوان الخارجية والداخلية، الحالة</li>
              <li>• <strong>الحقول الاختيارية:</strong> درجة التجهيز، المهندس، التواريخ، بيانات البيع (المشتري، سعر البيع، الربح)</li>
              <li>• <strong>أسماء الشركات المصنعة:</strong> مرسيدس، بي ام دبليو، اودي، تويوتا، لكزس، رنج روفر، بورش، نيسان، انفينيتي، هيونداي، كيا، تسلا، لوسيد وغيرها</li>
              <li>• <strong>قيم الحالة:</strong> متوفر، في الطريق، قيد الصيانة، محجوز، مباع</li>
              <li>• <strong>نوع الاستيراد:</strong> شخصي، شركة، مستعمل شخصي</li>
              <li>• <strong>حالة البيع:</strong> نعم/لا أو Yes/No أو 1/0</li>
              <li>• <strong>تنسيق التواريخ:</strong> YYYY-MM-DD (مثل: 2024-01-15)</li>
              <li>• يقبل ملفات CSV و Excel (.xlsx, .xls)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}