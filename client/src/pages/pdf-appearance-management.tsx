import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Palette, Upload, Eye, FileText, Save, Image } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface PdfAppearanceSettings {
  id?: number;
  // Header Colors
  headerBackgroundColor: string;
  headerTextColor: string;
  logoBackgroundColor: string;
  
  // Table Colors
  tableHeaderBackgroundColor: string;
  tableHeaderTextColor: string;
  tableRowBackgroundColor: string;
  tableRowTextColor: string;
  tableAlternateRowBackgroundColor: string;
  tableBorderColor: string;
  
  // Text Colors
  primaryTextColor: string;
  secondaryTextColor: string;
  priceTextColor: string;
  totalTextColor: string;
  
  // Border and Background Colors
  borderColor: string;
  backgroundColor: string;
  sectionBackgroundColor: string;
  
  // Company Logo and Stamp
  companyStamp: string | null;
  watermarkOpacity: number;
  
  // Footer Colors
  footerBackgroundColor: string;
  footerTextColor: string;
  
  // QR Code Settings
  qrCodeBackgroundColor: string;
  qrCodeForegroundColor: string;
}

interface PdfAppearanceManagementProps {
  userRole: string;
  onLogout: () => void;
}

export default function PdfAppearanceManagement({ userRole, onLogout }: PdfAppearanceManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // PDF Appearance Settings State
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState("#0f766e");
  const [headerTextColor, setHeaderTextColor] = useState("#ffffff");
  const [logoBackgroundColor, setLogoBackgroundColor] = useState("#ffffff");
  
  const [tableHeaderBackgroundColor, setTableHeaderBackgroundColor] = useState("#f8fafc");
  const [tableHeaderTextColor, setTableHeaderTextColor] = useState("#1e293b");
  const [tableRowBackgroundColor, setTableRowBackgroundColor] = useState("#ffffff");
  const [tableRowTextColor, setTableRowTextColor] = useState("#1e293b");
  const [tableAlternateRowBackgroundColor, setTableAlternateRowBackgroundColor] = useState("#f8fafc");
  const [tableBorderColor, setTableBorderColor] = useState("#e2e8f0");
  
  const [primaryTextColor, setPrimaryTextColor] = useState("#1e293b");
  const [secondaryTextColor, setSecondaryTextColor] = useState("#64748b");
  const [priceTextColor, setPriceTextColor] = useState("#059669");
  const [totalTextColor, setTotalTextColor] = useState("#dc2626");
  
  const [borderColor, setBorderColor] = useState("#e2e8f0");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [sectionBackgroundColor, setSectionBackgroundColor] = useState("#f8fafc");
  
  const [companyStamp, setCompanyStamp] = useState<string | null>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.1);
  
  const [footerBackgroundColor, setFooterBackgroundColor] = useState("#f8fafc");
  const [footerTextColor, setFooterTextColor] = useState("#64748b");
  
  const [qrCodeBackgroundColor, setQrCodeBackgroundColor] = useState("#ffffff");
  const [qrCodeForegroundColor, setQrCodeForegroundColor] = useState("#000000");

  // Fetch current PDF appearance settings
  const { data: pdfSettings } = useQuery<PdfAppearanceSettings>({
    queryKey: ["/api/pdf-appearance"],
  });

  // Update state when settings are loaded
  useEffect(() => {
    if (pdfSettings) {
      setHeaderBackgroundColor(pdfSettings.headerBackgroundColor || "#0f766e");
      setHeaderTextColor(pdfSettings.headerTextColor || "#ffffff");
      setLogoBackgroundColor(pdfSettings.logoBackgroundColor || "#ffffff");
      
      setTableHeaderBackgroundColor(pdfSettings.tableHeaderBackgroundColor || "#f8fafc");
      setTableHeaderTextColor(pdfSettings.tableHeaderTextColor || "#1e293b");
      setTableRowBackgroundColor(pdfSettings.tableRowBackgroundColor || "#ffffff");
      setTableRowTextColor(pdfSettings.tableRowTextColor || "#1e293b");
      setTableAlternateRowBackgroundColor(pdfSettings.tableAlternateRowBackgroundColor || "#f8fafc");
      setTableBorderColor(pdfSettings.tableBorderColor || "#e2e8f0");
      
      setPrimaryTextColor(pdfSettings.primaryTextColor || "#1e293b");
      setSecondaryTextColor(pdfSettings.secondaryTextColor || "#64748b");
      setPriceTextColor(pdfSettings.priceTextColor || "#059669");
      setTotalTextColor(pdfSettings.totalTextColor || "#dc2626");
      
      setBorderColor(pdfSettings.borderColor || "#e2e8f0");
      setBackgroundColor(pdfSettings.backgroundColor || "#ffffff");
      setSectionBackgroundColor(pdfSettings.sectionBackgroundColor || "#f8fafc");
      
      setCompanyStamp(pdfSettings.companyStamp || null);
      setWatermarkOpacity(pdfSettings.watermarkOpacity || 0.1);
      
      setFooterBackgroundColor(pdfSettings.footerBackgroundColor || "#f8fafc");
      setFooterTextColor(pdfSettings.footerTextColor || "#64748b");
      
      setQrCodeBackgroundColor(pdfSettings.qrCodeBackgroundColor || "#ffffff");
      setQrCodeForegroundColor(pdfSettings.qrCodeForegroundColor || "#000000");
    }
  }, [pdfSettings]);

  // Save PDF appearance settings mutation
  const savePdfAppearanceMutation = useMutation({
    mutationFn: async (settings: Partial<PdfAppearanceSettings>) => {
      const response = await fetch("/api/pdf-appearance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error("Failed to save PDF appearance settings");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ إعدادات PDF بنجاح",
        description: "تم تطبيق إعدادات مظهر عرض السعر الجديدة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pdf-appearance"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حفظ إعدادات PDF",
        description: "حدث خطأ أثناء حفظ إعدادات مظهر عرض السعر",
        variant: "destructive",
      });
    },
  });

  // Handle saving PDF settings
  const handleSavePdfSettings = () => {
    const settings = {
      headerBackgroundColor,
      headerTextColor,
      logoBackgroundColor,
      tableHeaderBackgroundColor,
      tableHeaderTextColor,
      tableRowBackgroundColor,
      tableRowTextColor,
      tableAlternateRowBackgroundColor,
      tableBorderColor,
      primaryTextColor,
      secondaryTextColor,
      priceTextColor,
      totalTextColor,
      borderColor,
      backgroundColor,
      sectionBackgroundColor,
      companyStamp,
      watermarkOpacity,
      footerBackgroundColor,
      footerTextColor,
      qrCodeBackgroundColor,
      qrCodeForegroundColor,
    };
    savePdfAppearanceMutation.mutate(settings);
  };

  // Handle stamp upload
  const handleStampUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCompanyStamp(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/inventory">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} />
                العودة للرئيسية
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText size={24} />
              إدارة مظهر عرض السعر PDF
            </h1>
          </div>
          <Button 
            onClick={handleSavePdfSettings}
            disabled={savePdfAppearanceMutation.isPending}
            size="sm"
          >
            <Save size={16} />
            حفظ الإعدادات
          </Button>
        </div>

        <Tabs defaultValue="header-colors" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="header-colors">
              <Palette size={16} className="mr-2" />
              ألوان الرأس
            </TabsTrigger>
            <TabsTrigger value="table-colors">
              <FileText size={16} className="mr-2" />
              ألوان الجدول
            </TabsTrigger>
            <TabsTrigger value="text-colors">
              <Eye size={16} className="mr-2" />
              ألوان النص
            </TabsTrigger>
            <TabsTrigger value="background-colors">
              <Palette size={16} className="mr-2" />
              ألوان الخلفية
            </TabsTrigger>
            <TabsTrigger value="logo-stamp">
              <Image size={16} className="mr-2" />
              اللوجو والختم
            </TabsTrigger>
          </TabsList>

          {/* Header Colors */}
          <TabsContent value="header-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} />
                  ألوان رأس عرض السعر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>لون خلفية الرأس</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={headerBackgroundColor}
                        onChange={(e) => setHeaderBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={headerBackgroundColor}
                        onChange={(e) => setHeaderBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>لون نص الرأس</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={headerTextColor}
                        onChange={(e) => setHeaderTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={headerTextColor}
                        onChange={(e) => setHeaderTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>لون خلفية اللوجو</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={logoBackgroundColor}
                        onChange={(e) => setLogoBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={logoBackgroundColor}
                        onChange={(e) => setLogoBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Table Colors */}
          <TabsContent value="table-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  ألوان جدول الأسعار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>خلفية رأس الجدول</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={tableHeaderBackgroundColor}
                        onChange={(e) => setTableHeaderBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={tableHeaderBackgroundColor}
                        onChange={(e) => setTableHeaderBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>نص رأس الجدول</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={tableHeaderTextColor}
                        onChange={(e) => setTableHeaderTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={tableHeaderTextColor}
                        onChange={(e) => setTableHeaderTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>خلفية صفوف الجدول</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={tableRowBackgroundColor}
                        onChange={(e) => setTableRowBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={tableRowBackgroundColor}
                        onChange={(e) => setTableRowBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>نص صفوف الجدول</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={tableRowTextColor}
                        onChange={(e) => setTableRowTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={tableRowTextColor}
                        onChange={(e) => setTableRowTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الصفوف المتناوبة</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={tableAlternateRowBackgroundColor}
                        onChange={(e) => setTableAlternateRowBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={tableAlternateRowBackgroundColor}
                        onChange={(e) => setTableAlternateRowBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>حدود الجدول</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={tableBorderColor}
                        onChange={(e) => setTableBorderColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={tableBorderColor}
                        onChange={(e) => setTableBorderColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Colors */}
          <TabsContent value="text-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={20} />
                  ألوان النصوص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>النص الأساسي</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={primaryTextColor}
                        onChange={(e) => setPrimaryTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={primaryTextColor}
                        onChange={(e) => setPrimaryTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>النص الثانوي</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={secondaryTextColor}
                        onChange={(e) => setSecondaryTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={secondaryTextColor}
                        onChange={(e) => setSecondaryTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>لون الأسعار</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={priceTextColor}
                        onChange={(e) => setPriceTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={priceTextColor}
                        onChange={(e) => setPriceTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>لون الإجمالي</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={totalTextColor}
                        onChange={(e) => setTotalTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={totalTextColor}
                        onChange={(e) => setTotalTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Background Colors */}
          <TabsContent value="background-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} />
                  ألوان الخلفية والحدود
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>خلفية الصفحة</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>خلفية الأقسام</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={sectionBackgroundColor}
                        onChange={(e) => setSectionBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={sectionBackgroundColor}
                        onChange={(e) => setSectionBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>لون الحدود</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>خلفية التذييل</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={footerBackgroundColor}
                        onChange={(e) => setFooterBackgroundColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={footerBackgroundColor}
                        onChange={(e) => setFooterBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>نص التذييل</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="color"
                        value={footerTextColor}
                        onChange={(e) => setFooterTextColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={footerTextColor}
                        onChange={(e) => setFooterTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>شفافية العلامة المائية</Label>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-20"
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logo and Stamp */}
          <TabsContent value="logo-stamp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image size={20} />
                  اللوجو والختم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ختم الشركة</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {companyStamp ? (
                        <div className="space-y-4">
                          <img 
                            src={companyStamp} 
                            alt="Company Stamp" 
                            className="max-w-full h-32 object-contain mx-auto"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCompanyStamp(null)}
                          >
                            إزالة الختم
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload size={48} className="mx-auto text-gray-400" />
                          <p className="text-gray-500">اسحب الختم هنا أو اختر ملف</p>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleStampUpload(file);
                                }
                              }}
                            />
                            <Button variant="outline">
                              <Upload size={16} />
                              اختر ملف الختم
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">إعدادات QR Code</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>خلفية QR Code</Label>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <input
                            type="color"
                            value={qrCodeBackgroundColor}
                            onChange={(e) => setQrCodeBackgroundColor(e.target.value)}
                            className="w-12 h-10 rounded border"
                          />
                          <Input
                            value={qrCodeBackgroundColor}
                            onChange={(e) => setQrCodeBackgroundColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>لون QR Code</Label>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <input
                            type="color"
                            value={qrCodeForegroundColor}
                            onChange={(e) => setQrCodeForegroundColor(e.target.value)}
                            className="w-12 h-10 rounded border"
                          />
                          <Input
                            value={qrCodeForegroundColor}
                            onChange={(e) => setQrCodeForegroundColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}