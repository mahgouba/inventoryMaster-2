import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Palette, Upload, Eye, Image, Sparkles, Layers } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BackgroundTheme {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'neumorphism' | 'aurora';
  css: string;
  preview: string;
}

interface AppearanceSettings {
  id?: number;
  backgroundTheme: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyLogo: string | null;
}

interface Manufacturer {
  id: number;
  name: string;
  logo: string | null;
}

interface AppearanceManagementProps {
  userRole: string;
  onLogout: () => void;
}

export default function AppearanceManagement({ userRole, onLogout }: AppearanceManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Background theme state
  const [selectedTheme, setSelectedTheme] = useState("glass-morphism");
  const [primaryColor, setPrimaryColor] = useState("#00627F");
  const [secondaryColor, setSecondaryColor] = useState("#0A0A0A");
  const [accentColor, setAccentColor] = useState("#C49632");

  // Manufacturer logo management state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [newManufacturerName, setNewManufacturerName] = useState("");

  // Background themes
  const backgroundThemes: BackgroundTheme[] = [
    {
      id: "glass-morphism",
      name: "Glass Morphism",
      type: "gradient",
      css: "background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);",
      preview: "bg-gradient-to-br from-gray-900 to-black"
    },
    {
      id: "neumorphism",
      name: "Neumorphism",
      type: "neumorphism",
      css: "background: #e0e5ec; box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;",
      preview: "bg-gray-200 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]"
    },
    {
      id: "aurora",
      name: "Aurora",
      type: "aurora",
      css: "background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab); background-size: 400% 400%; animation: aurora 15s ease infinite;",
      preview: "bg-gradient-to-br from-orange-400 via-pink-500 to-cyan-500 animate-pulse"
    },
    {
      id: "solid-dark",
      name: "Solid Dark",
      type: "solid",
      css: "background: #1a1a1a;",
      preview: "bg-gray-800"
    },
    {
      id: "solid-light",
      name: "Solid Light", 
      type: "solid",
      css: "background: #ffffff;",
      preview: "bg-white border border-gray-200"
    }
  ];

  // Fetch current appearance settings
  const { data: appearanceSettings } = useQuery<AppearanceSettings>({
    queryKey: ["/api/appearance"],
  });

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });

  // Update state when settings are loaded
  useEffect(() => {
    if (appearanceSettings) {
      setSelectedTheme(appearanceSettings.backgroundTheme || "glass-morphism");
      setPrimaryColor(appearanceSettings.primaryColor || "#00627F");
      setSecondaryColor(appearanceSettings.secondaryColor || "#0A0A0A");
      setAccentColor(appearanceSettings.accentColor || "#C49632");
    }
  }, [appearanceSettings]);

  // Save appearance settings mutation
  const saveAppearanceMutation = useMutation({
    mutationFn: async (settings: Partial<AppearanceSettings>) => {
      const response = await fetch("/api/appearance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error("Failed to save appearance settings");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ إعدادات المظهر بنجاح",
        description: "تم تطبيق الإعدادات الجديدة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appearance"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: "حدث خطأ أثناء حفظ إعدادات المظهر",
        variant: "destructive",
      });
    },
  });

  // Upload manufacturer logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async ({ manufacturerId, logoData }: { manufacturerId: string; logoData: string }) => {
      const response = await fetch(`/api/manufacturers/${manufacturerId}/logo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logo: logoData }),
      });
      if (!response.ok) {
        throw new Error("Failed to upload logo");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم رفع الشعار بنجاح",
        description: "تم حفظ شعار الشركة المصنعة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setLogoFile(null);
      setSelectedManufacturer("");
    },
    onError: (error) => {
      toast({
        title: "خطأ في رفع الشعار",
        description: "حدث خطأ أثناء رفع شعار الشركة",
        variant: "destructive",
      });
    },
  });

  // Handle theme change
  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    saveAppearanceMutation.mutate({
      backgroundTheme: themeId,
      primaryColor,
      secondaryColor,
      accentColor,
    });
  };

  // Handle color change
  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    const updates = { backgroundTheme: selectedTheme, primaryColor, secondaryColor, accentColor };
    
    if (colorType === 'primary') {
      setPrimaryColor(color);
      updates.primaryColor = color;
    } else if (colorType === 'secondary') {
      setSecondaryColor(color);
      updates.secondaryColor = color;
    } else {
      setAccentColor(color);
      updates.accentColor = color;
    }
    
    saveAppearanceMutation.mutate(updates);
  };

  // Handle logo upload
  const handleLogoUpload = () => {
    if (!logoFile || !selectedManufacturer) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار الشركة المصنعة وملف الشعار",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      uploadLogoMutation.mutate({
        manufacturerId: selectedManufacturer,
        logoData: reader.result as string,
      });
    };
    reader.readAsDataURL(logoFile);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4" dir="rtl">
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
              <Palette size={24} />
              إدارة المظهر
            </h1>
          </div>
        </div>

        <Tabs defaultValue="background-themes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="background-themes" className="flex items-center gap-2">
              <Sparkles size={16} />
              ألوان الخلفية والسمات
            </TabsTrigger>
            <TabsTrigger value="manufacturer-logos" className="flex items-center gap-2">
              <Image size={16} />
              شعارات الشركات المصنعة
            </TabsTrigger>
          </TabsList>

          {/* Background Themes Tab */}
          <TabsContent value="background-themes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers size={20} />
                  سمات الخلفية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">اختيار السمة</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {backgroundThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                          selectedTheme === theme.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                        onClick={() => handleThemeChange(theme.id)}
                      >
                        <div className={`h-24 w-full rounded-md ${theme.preview} mb-3`} />
                        <h3 className="font-semibold text-center">{theme.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                          {theme.type === 'neumorphism' && 'مظهر ثلاثي الأبعاد'}
                          {theme.type === 'aurora' && 'مظهر الشفق القطبي'}
                          {theme.type === 'gradient' && 'تدرج لوني'}
                          {theme.type === 'solid' && 'لون صلب'}
                        </p>
                        {selectedTheme === theme.id && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Eye size={12} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Customization */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">تخصيص الألوان</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>اللون الأساسي</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-16 h-10 rounded border-0 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="flex-1"
                          placeholder="#00627F"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>اللون الثانوي</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="w-16 h-10 rounded border-0 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="flex-1"
                          placeholder="#0A0A0A"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>لون الإبراز</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={accentColor}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-16 h-10 rounded border-0 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={accentColor}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="flex-1"
                          placeholder="#C49632"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">معاينة السمة</Label>
                  <div 
                    className="h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                    style={{
                      background: backgroundThemes.find(t => t.id === selectedTheme)?.css.replace('background: ', '') || '#ffffff',
                      color: primaryColor
                    }}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
                        معاينة السمة المختارة
                      </h3>
                      <p style={{ color: accentColor }}>
                        هذا نص تجريبي بلون الإبراز
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manufacturer Logos Tab */}
          <TabsContent value="manufacturer-logos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image size={20} />
                  إدارة شعارات الشركات المصنعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Section */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">رفع شعار جديد</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اختيار الشركة المصنعة</Label>
                      <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الشركة المصنعة" />
                        </SelectTrigger>
                        <SelectContent>
                          {manufacturers.map((manufacturer) => (
                            <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                              {manufacturer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>اختيار ملف الشعار</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleLogoUpload}
                    disabled={uploadLogoMutation.isPending || !logoFile || !selectedManufacturer}
                    className="w-full md:w-auto"
                  >
                    <Upload size={16} />
                    رفع الشعار
                  </Button>
                </div>

                {/* Existing Logos */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">الشعارات الحالية</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {manufacturers.map((manufacturer) => (
                      <div
                        key={manufacturer.id}
                        className="border rounded-lg p-4 text-center space-y-2"
                      >
                        {manufacturer.logo ? (
                          <img
                            src={manufacturer.logo}
                            alt={manufacturer.name}
                            className="w-16 h-16 object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mx-auto">
                            <Image size={24} className="text-gray-400" />
                          </div>
                        )}
                        <p className="text-sm font-medium">{manufacturer.name}</p>
                        {!manufacturer.logo && (
                          <p className="text-xs text-gray-500">لا يوجد شعار</p>
                        )}
                      </div>
                    ))}
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