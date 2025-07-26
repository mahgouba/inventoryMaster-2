import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, 
  Upload, 
  Save, 
  ArrowLeft,
  Settings,
  Sun,
  Moon,
  Building,
  Image as ImageIcon,
  Edit2,
  Plus,
  Trash2,
  FileText,
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { AppearanceSettings, Manufacturer } from "@/../../shared/schema";
import { apiRequest } from "@/lib/queryClient";

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

interface AppearancePageProps {
  userRole: string;
  onLogout: () => void;
}

export default function AppearancePage({ userRole, onLogout }: AppearancePageProps) {
  // State variables for all color customization
  const [companyName, setCompanyName] = useState("إدارة المخزون");
  const [companyNameEn, setCompanyNameEn] = useState("Inventory System");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState("");
  const [companyLicenseNumber, setCompanyLicenseNumber] = useState("");
  const [companyTaxNumber, setCompanyTaxNumber] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  // Light mode colors
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [primaryHoverColor, setPrimaryHoverColor] = useState("#134e4a");
  const [secondaryColor, setSecondaryColor] = useState("#0891b2");
  const [secondaryHoverColor, setSecondaryHoverColor] = useState("#0c4a6e");
  const [accentColor, setAccentColor] = useState("#BF9231");
  const [accentHoverColor, setAccentHoverColor] = useState("#a67c27");
  const [gradientStart, setGradientStart] = useState("#0f766e");
  const [gradientEnd, setGradientEnd] = useState("#0891b2");
  const [cardBackgroundColor, setCardBackgroundColor] = useState("#ffffff");
  const [cardHoverColor, setCardHoverColor] = useState("#f8fafc");
  const [borderColor, setBorderColor] = useState("#e2e8f0");
  const [borderHoverColor, setBorderHoverColor] = useState("#0f766e");
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [textPrimaryColor, setTextPrimaryColor] = useState("#1e293b");
  const [textSecondaryColor, setTextSecondaryColor] = useState("#64748b");
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState("#ffffff");
  
  // Dark mode colors
  const [darkBackgroundColor, setDarkBackgroundColor] = useState("#000000");
  const [darkPrimaryColor, setDarkPrimaryColor] = useState("#14b8a6");
  const [darkPrimaryHoverColor, setDarkPrimaryHoverColor] = useState("#0d9488");
  const [darkSecondaryColor, setDarkSecondaryColor] = useState("#0ea5e9");
  const [darkSecondaryHoverColor, setDarkSecondaryHoverColor] = useState("#0284c7");
  const [darkAccentColor, setDarkAccentColor] = useState("#f59e0b");
  const [darkAccentHoverColor, setDarkAccentHoverColor] = useState("#d97706");
  const [darkCardBackgroundColor, setDarkCardBackgroundColor] = useState("#141414");
  const [darkCardHoverColor, setDarkCardHoverColor] = useState("#282828");
  const [darkBorderColor, setDarkBorderColor] = useState("#374151");
  const [darkBorderHoverColor, setDarkBorderHoverColor] = useState("#14b8a6");
  const [darkTextPrimaryColor, setDarkTextPrimaryColor] = useState("#f1f5f9");
  const [darkTextSecondaryColor, setDarkTextSecondaryColor] = useState("#94a3b8");
  const [darkHeaderBackgroundColor, setDarkHeaderBackgroundColor] = useState("#141414");
  
  const [darkMode, setDarkMode] = useState(false);
  const [rtlLayout, setRtlLayout] = useState(true);
  const [themeStyle, setThemeStyle] = useState("glass");
  
  // State for new manufacturer dialog
  const [showNewManufacturerDialog, setShowNewManufacturerDialog] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [newManufacturerLogo, setNewManufacturerLogo] = useState<string | null>(null);
  
  // State for editing manufacturer names
  const [editingManufacturerId, setEditingManufacturerId] = useState<number | null>(null);
  const [editingManufacturerName, setEditingManufacturerName] = useState("");

  const queryClient = useQueryClient();

  // Fetch current appearance settings
  const { data: appearanceSettings } = useQuery<AppearanceSettings>({
    queryKey: ["/api/appearance"],
  });

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });

  // Fetch inventory data to get all manufacturers
  const { data: inventoryData = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory"],
  });

  // Extract unique manufacturers from inventory
  const inventoryManufacturers = inventoryData.length > 0 
    ? [...new Set(inventoryData.map(item => item.manufacturer).filter(Boolean))]
    : [];

  // Save appearance settings mutation
  const saveAppearanceMutation = useMutation({
    mutationFn: async (settings: Partial<AppearanceSettings>) => {
      const response = await fetch("/api/appearance", {
        method: "PUT",
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
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم تطبيق إعدادات المظهر الجديدة",
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

  // Create new manufacturer mutation
  const createManufacturerMutation = useMutation({
    mutationFn: async (manufacturer: { name: string; logo?: string }) => {
      console.log('Creating manufacturer:', manufacturer);
      
      const response = await fetch("/api/manufacturers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(manufacturer),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create manufacturer:', response.status, errorData);
        throw new Error(`Failed to create manufacturer: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      console.log('Manufacturer created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Create manufacturer mutation success:', data);
      toast({
        title: "تم إضافة الشركة المصنعة بنجاح",
        description: `تم إضافة ${data.name} إلى القائمة`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setShowNewManufacturerDialog(false);
      setNewManufacturerName("");
      setNewManufacturerLogo(null);
    },
    onError: (error) => {
      console.error('Create manufacturer mutation error:', error);
      
      // Check if it's a duplicate name error
      if (error.message.includes("409")) {
        toast({
          title: "خطأ - اسم مكرر",
          description: "الشركة المصنعة موجودة بالفعل! يرجى اختيار اسم آخر",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في إضافة الشركة المصنعة",
          description: error.message || "حدث خطأ أثناء إضافة الشركة المصنعة",
          variant: "destructive",
        });
      }
    },
  });

  // Update manufacturer logo mutation
  const updateManufacturerLogoMutation = useMutation({
    mutationFn: async ({ id, logo }: { id: number; logo: string }) => {
      console.log('Updating manufacturer logo for ID:', id, 'Logo length:', logo.length);
      
      const response = await fetch(`/api/manufacturers/${id}/logo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logo }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Logo update failed:', response.status, errorData);
        throw new Error(`Failed to update manufacturer logo: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Logo update successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Mutation onSuccess called:', data);
      toast({
        title: "تم تحديث الشعار بنجاح",
        description: "تم تحديث شعار الشركة المصنعة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
    },
    onError: (error) => {
      console.error('Mutation onError called:', error);
      toast({
        title: "خطأ في تحديث الشعار",
        description: error.message || "حدث خطأ أثناء تحديث الشعار",
        variant: "destructive",
      });
    },
  });

  // Update manufacturer name mutation
  const updateManufacturerNameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      console.log('Updating manufacturer name for ID:', id, 'New name:', name);
      
      const response = await fetch(`/api/manufacturers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Name update failed:', response.status, errorData);
        throw new Error(`Failed to update manufacturer name: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      console.log('Name update successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Name update mutation success:', data);
      toast({
        title: "تم تحديث اسم الشركة بنجاح",
        description: `تم تحديث اسم الشركة إلى ${data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
      setEditingManufacturerId(null);
      setEditingManufacturerName("");
    },
    onError: (error) => {
      console.error('Name update mutation error:', error);
      
      // Check if it's a duplicate name error
      if (error.message.includes("409")) {
        toast({
          title: "خطأ - اسم مكرر",
          description: "الاسم موجود بالفعل! يرجى اختيار اسم آخر",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في تحديث الاسم",
          description: error.message || "حدث خطأ أثناء تحديث اسم الشركة",
          variant: "destructive",
        });
      }
    },
  });

  // Update state when data is fetched
  useEffect(() => {
    if (appearanceSettings) {
      setCompanyName(appearanceSettings.companyName || "إدارة المخزون");
      setCompanyNameEn(appearanceSettings.companyNameEn || "Inventory System");
      setCompanyAddress(appearanceSettings.companyAddress || "");
      setCompanyRegistrationNumber(appearanceSettings.companyRegistrationNumber || "");
      setCompanyLicenseNumber(appearanceSettings.companyLicenseNumber || "");
      setCompanyTaxNumber(appearanceSettings.companyTaxNumber || "");
      setCompanyWebsite(appearanceSettings.companyWebsite || "");
      setCompanyLogo(appearanceSettings.companyLogo);
      
      // Light mode colors
      setPrimaryColor(appearanceSettings.primaryColor || "#0f766e");
      setPrimaryHoverColor(appearanceSettings.primaryHoverColor || "#134e4a");
      setSecondaryColor(appearanceSettings.secondaryColor || "#0891b2");
      setSecondaryHoverColor(appearanceSettings.secondaryHoverColor || "#0c4a6e");
      setAccentColor(appearanceSettings.accentColor || "#BF9231");
      setAccentHoverColor(appearanceSettings.accentHoverColor || "#a67c27");
      setGradientStart(appearanceSettings.gradientStart || "#0f766e");
      setGradientEnd(appearanceSettings.gradientEnd || "#0891b2");
      setCardBackgroundColor(appearanceSettings.cardBackgroundColor || "#ffffff");
      setCardHoverColor(appearanceSettings.cardHoverColor || "#f8fafc");
      setBorderColor(appearanceSettings.borderColor || "#e2e8f0");
      setBorderHoverColor(appearanceSettings.borderHoverColor || "#0f766e");
      setBackgroundColor(appearanceSettings.backgroundColor || "#f8fafc");
      setTextPrimaryColor(appearanceSettings.textPrimaryColor || "#1e293b");
      setTextSecondaryColor(appearanceSettings.textSecondaryColor || "#64748b");
      setHeaderBackgroundColor(appearanceSettings.headerBackgroundColor || "#ffffff");
      
      // Dark mode colors
      setDarkBackgroundColor(appearanceSettings.darkBackgroundColor || "#000000");
      setDarkPrimaryColor(appearanceSettings.darkPrimaryColor || "#14b8a6");
      setDarkPrimaryHoverColor(appearanceSettings.darkPrimaryHoverColor || "#0d9488");
      setDarkSecondaryColor(appearanceSettings.darkSecondaryColor || "#0ea5e9");
      setDarkSecondaryHoverColor(appearanceSettings.darkSecondaryHoverColor || "#0284c7");
      setDarkAccentColor(appearanceSettings.darkAccentColor || "#f59e0b");
      setDarkAccentHoverColor(appearanceSettings.darkAccentHoverColor || "#d97706");
      setDarkCardBackgroundColor(appearanceSettings.darkCardBackgroundColor || "#141414");
      setDarkCardHoverColor(appearanceSettings.darkCardHoverColor || "#282828");
      setDarkBorderColor(appearanceSettings.darkBorderColor || "#374151");
      setDarkBorderHoverColor(appearanceSettings.darkBorderHoverColor || "#14b8a6");
      setDarkTextPrimaryColor(appearanceSettings.darkTextPrimaryColor || "#f1f5f9");
      setDarkTextSecondaryColor(appearanceSettings.darkTextSecondaryColor || "#94a3b8");
      setDarkHeaderBackgroundColor(appearanceSettings.darkHeaderBackgroundColor || "#141414");
      
      setDarkMode(appearanceSettings.darkMode || false);
      setRtlLayout(appearanceSettings.rtlLayout !== false);
      setThemeStyle(appearanceSettings.themeStyle || "glass");
    }
  }, [appearanceSettings]);

  // Function to save all appearance settings
  const handleSaveSettings = () => {
    const settings = {
      companyName,
      companyNameEn,
      companyAddress,
      companyRegistrationNumber,
      companyLicenseNumber,
      companyTaxNumber,
      companyWebsite,
      companyLogo,
      primaryColor,
      primaryHoverColor,
      secondaryColor,
      secondaryHoverColor,
      accentColor,
      accentHoverColor,
      gradientStart,
      gradientEnd,
      cardBackgroundColor,
      cardHoverColor,
      borderColor,
      borderHoverColor,
      backgroundColor,
      textPrimaryColor,
      textSecondaryColor,
      headerBackgroundColor,
      darkBackgroundColor,
      darkPrimaryColor,
      darkPrimaryHoverColor,
      darkSecondaryColor,
      darkSecondaryHoverColor,
      darkAccentColor,
      darkAccentHoverColor,
      darkCardBackgroundColor,
      darkCardHoverColor,
      darkBorderColor,
      darkBorderHoverColor,
      darkTextPrimaryColor,
      darkTextSecondaryColor,
      darkHeaderBackgroundColor,
      darkMode,
      rtlLayout,
      themeStyle,
    };
    saveAppearanceMutation.mutate(settings);
  };

  // Function to add new manufacturer
  const handleAddManufacturer = () => {
    if (newManufacturerName.trim()) {
      createManufacturerMutation.mutate({
        name: newManufacturerName.trim(),
        logo: newManufacturerLogo || undefined,
      });
    }
  };

  // Function to apply colors immediately for preview
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply CSS variables for real-time preview
    if (darkMode) {
      root.style.setProperty('--primary', hexToHsl(darkPrimaryColor));
      root.style.setProperty('--primary-hover', hexToHsl(darkPrimaryHoverColor));
      root.style.setProperty('--secondary', hexToHsl(darkSecondaryColor));
      root.style.setProperty('--background', hexToHsl(darkBackgroundColor));
      root.style.setProperty('--card', hexToHsl(darkCardBackgroundColor));
      root.classList.add('dark');
    } else {
      root.style.setProperty('--primary', hexToHsl(primaryColor));
      root.style.setProperty('--primary-hover', hexToHsl(primaryHoverColor));
      root.style.setProperty('--secondary', hexToHsl(secondaryColor));
      root.style.setProperty('--background', hexToHsl(backgroundColor));
      root.style.setProperty('--card', hexToHsl(cardBackgroundColor));
      root.classList.remove('dark');
    }
  }, [darkMode, primaryColor, primaryHoverColor, secondaryColor, backgroundColor, cardBackgroundColor, darkPrimaryColor, darkPrimaryHoverColor, darkSecondaryColor, darkBackgroundColor, darkCardBackgroundColor]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300" dir="rtl">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/inventory">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowLeft size={20} />
                  العودة
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة المظهر</h1>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="branding">العلامة التجارية</TabsTrigger>
            <TabsTrigger value="themes">نمط المظهر</TabsTrigger>
            <TabsTrigger value="light-colors">الألوان العادية</TabsTrigger>
            <TabsTrigger value="dark-colors">الألوان الليلية</TabsTrigger>
            <TabsTrigger value="logos">🏭 إدارة شعارات الصناع</TabsTrigger>
            <TabsTrigger value="layout">التخطيط</TabsTrigger>
          </TabsList>

          {/* Branding */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">اسم الشركة (بالعربية)</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyNameEn">اسم الشركة (بالإنجليزية)</Label>
                    <Input
                      id="companyNameEn"
                      value={companyNameEn}
                      onChange={(e) => setCompanyNameEn(e.target.value)}
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">عنوان الشركة</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="عنوان الشركة الكامل"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyRegistrationNumber">رقم السجل التجاري</Label>
                    <Input
                      id="companyRegistrationNumber"
                      value={companyRegistrationNumber}
                      onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
                      placeholder="رقم السجل التجاري"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyLicenseNumber">رقم الرخصة</Label>
                    <Input
                      id="companyLicenseNumber"
                      value={companyLicenseNumber}
                      onChange={(e) => setCompanyLicenseNumber(e.target.value)}
                      placeholder="رقم الرخصة"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyTaxNumber">الرقم الضريبي</Label>
                    <Input
                      id="companyTaxNumber"
                      value={companyTaxNumber}
                      onChange={(e) => setCompanyTaxNumber(e.target.value)}
                      placeholder="الرقم الضريبي"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">موقع الشركة الإلكتروني</Label>
                    <Input
                      id="companyWebsite"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>شعار الشركة</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    {companyLogo ? (
                      <div className="space-y-4">
                        <img
                          src={companyLogo}
                          alt="Company Logo"
                          className="max-h-32 mx-auto"
                        />
                        <div className="flex items-center justify-center space-x-2 space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCompanyLogo(null)}
                          >
                            حذف
                          </Button>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Check file size (limit to 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast({
                                      title: "خطأ في حجم الملف",
                                      description: "حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setCompanyLogo(reader.result as string);
                                  };
                                  reader.onerror = () => {
                                    toast({
                                      title: "خطأ في قراءة الملف",
                                      description: "حدث خطأ أثناء قراءة الصورة",
                                      variant: "destructive",
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button variant="outline" size="sm">
                              <Upload size={16} />
                              تغيير
                            </Button>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-lg mx-auto flex items-center justify-center">
                          <ImageIcon size={24} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-600 mb-2">اسحب صورة الشعار هنا أو</p>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Check file size (limit to 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast({
                                      title: "خطأ في حجم الملف",
                                      description: "حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setCompanyLogo(reader.result as string);
                                  };
                                  reader.onerror = () => {
                                    toast({
                                      title: "خطأ في قراءة الملف",
                                      description: "حدث خطأ أثناء قراءة الصورة",
                                      variant: "destructive",
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button variant="outline">
                              <Upload size={16} />
                              اختر ملف
                            </Button>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Styles */}
          <TabsContent value="themes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} />
                  اختيار نمط المظهر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>نمط المظهر العام للتطبيق</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Glass Theme */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        themeStyle === 'glass' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setThemeStyle('glass')}
                    >
                      <div className="space-y-3">
                        <div className="w-full h-16 rounded bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                          <span className="text-sm font-medium">Glass Morphism</span>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900">زجاجي (Glass)</h3>
                          <p className="text-sm text-gray-600 mt-1">تصميم زجاجي شفاف مع تأثيرات الضبابية</p>
                        </div>
                      </div>
                    </div>

                    {/* Neumorphism Theme */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        themeStyle === 'neumorphism' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setThemeStyle('neumorphism')}
                    >
                      <div className="space-y-3">
                        <div className="w-full h-16 rounded-lg bg-gray-200 flex items-center justify-center shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]">
                          <span className="text-sm font-medium text-gray-700">Neumorphism</span>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900">عصري (Neumorphism)</h3>
                          <p className="text-sm text-gray-600 mt-1">تصميم عصري مع ظلال طبيعية ناعمة</p>
                        </div>
                      </div>
                    </div>

                    {/* Classic Theme */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        themeStyle === 'classic' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setThemeStyle('classic')}
                    >
                      <div className="space-y-3">
                        <div className="w-full h-16 rounded bg-white border border-gray-300 flex items-center justify-center shadow-sm">
                          <span className="text-sm font-medium text-gray-700">Classic</span>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900">كلاسيكي (Classic)</h3>
                          <p className="text-sm text-gray-600 mt-1">تصميم كلاسيكي بسيط وواضح</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>ملاحظة:</strong> سيتم تطبيق النمط المختار على كامل التطبيق بعد الحفظ. 
                      يمكنك معاينة النمط قبل الحفظ من خلال النقر عليه.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Light Colors */}
          <TabsContent value="light-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun size={20} />
                  ألوان النظام العادي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">الألوان الأساسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>اللون الأساسي</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>اللون الثانوي</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">ألوان الخلفية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Label>خلفية البطاقات</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={cardBackgroundColor}
                          onChange={(e) => setCardBackgroundColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={cardBackgroundColor}
                          onChange={(e) => setCardBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dark Colors */}
          <TabsContent value="dark-colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon size={20} />
                  ألوان النظام الليلي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">تفعيل النظام الليلي</Label>
                    <p className="text-sm text-muted-foreground">تشغيل النظام الليلي للصفحة الحالية</p>
                  </div>
                  <div className="relative">
                    <div 
                      className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${
                        darkMode ? 'bg-slate-800' : 'bg-slate-300'
                      }`}
                      onClick={() => setDarkMode(!darkMode)}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                          darkMode ? 'right-1' : 'right-6'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Dark Primary Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">الألوان الأساسية الليلية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>اللون الأساسي الليلي</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={darkPrimaryColor}
                          onChange={(e) => setDarkPrimaryColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={darkPrimaryColor}
                          onChange={(e) => setDarkPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>خلفية الصفحة الليلية</Label>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="color"
                          value={darkBackgroundColor}
                          onChange={(e) => setDarkBackgroundColor(e.target.value)}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={darkBackgroundColor}
                          onChange={(e) => setDarkBackgroundColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logos */}
          <TabsContent value="logos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  إدارة شعارات الصناع
                </CardTitle>
                <div className="space-y-2 mt-3">
                  <p className="text-sm text-muted-foreground">
                    يمكنك هنا إضافة وتعديل شعارات الشركات المصنعة. اختر صوراً بصيغة PNG أو JPG بحجم لا يزيد عن 5 ميجابايت للحصول على أفضل جودة عرض.
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="text-blue-800 text-sm font-medium">📝 تعليمات مهمة:</p>
                    <ul className="text-blue-700 text-sm mt-1 space-y-1">
                      <li>• الصيغ المدعومة: PNG, JPG, JPEG, GIF, WebP, SVG</li>
                      <li>• الحد الأقصى لحجم الملف: 5 ميجابايت</li>
                      <li>• أبعاد مُوصى بها: 200x200 بكسل لأفضل عرض</li>
                      <li>• الشعارات ستظهر في جميع صفحات النظام</li>
                    </ul>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-slate-600 font-medium">جميع الصناع في النظام ({manufacturers.length + inventoryManufacturers.filter(name => !manufacturers.find(m => m.name === name)).length} صانع)</p>
                  <Button 
                    onClick={() => setShowNewManufacturerDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus size={16} />
                    إضافة شركة مصنعة
                  </Button>
                </div>

                {/* Manufacturers from Inventory (Auto-detected) */}
                {inventoryManufacturers && inventoryManufacturers.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <h3 className="text-green-800 font-semibold mb-2">🚗 الصناع من المخزون</h3>
                      <p className="text-green-700 text-sm">هذه الشركات المصنعة موجودة في مخزونك ويمكنك رفع شعاراتها</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inventoryManufacturers.map((manufacturerName, index) => {
                        // Check if this manufacturer already exists in the manufacturers table
                        const existingManufacturer = manufacturers.find(m => m.name === manufacturerName);
                        
                        if (existingManufacturer) {
                          return null; // Skip if already exists in manufacturers table
                        }
                        
                        return (
                          <div key={`inventory-${manufacturerName}-${index}`} className="border-2 border-green-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-green-50 to-slate-50 hover:border-green-300 transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg text-green-800">{manufacturerName}</h3>
                              <Badge variant="outline" className="bg-green-100 text-green-800">من المخزون</Badge>
                            </div>
                            
                            <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-dashed border-orange-300">
                              <div className="text-center">
                                <div className="w-20 h-20 bg-orange-50 border-2 border-orange-200 rounded-lg flex items-center justify-center mx-auto">
                                  <ImageIcon size={32} className="text-orange-400" />
                                </div>
                                <p className="text-xs text-orange-600 mt-2 font-medium">لا يوجد شعار</p>
                              </div>
                              <div className="text-center">
                                <Button 
                                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
                                  size="lg"
                                  onClick={async () => {
                                    // First create the manufacturer in the database
                                    try {
                                      await createManufacturerMutation.mutateAsync({
                                        name: manufacturerName,
                                      });
                                      toast({
                                        title: "تم إنشاء الصانع بنجاح",
                                        description: `تم إضافة ${manufacturerName} إلى قاعدة البيانات. يمكنك الآن رفع الشعار`,
                                      });
                                    } catch (error) {
                                      console.error('Error creating manufacturer:', error);
                                      toast({
                                        title: "خطأ في إنشاء الصانع",
                                        description: "حدث خطأ أثناء إضافة الصانع",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  disabled={createManufacturerMutation.isPending}
                                >
                                  <Plus size={18} className="ml-2" />
                                  {createManufacturerMutation.isPending ? "جاري الإضافة..." : "إضافة للنظام"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Registered Manufacturers */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <h3 className="text-blue-800 font-semibold mb-2">🏭 الصناع المسجلين</h3>
                    <p className="text-blue-700 text-sm">الشركات المصنعة المسجلة في النظام مع إمكانية إدارة شعاراتها</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {manufacturers.map((manufacturer) => (
                    <div key={manufacturer.id} className="border-2 border-blue-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-blue-50 to-slate-50 hover:border-blue-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        {editingManufacturerId === manufacturer.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingManufacturerName}
                              onChange={(e) => setEditingManufacturerName(e.target.value)}
                              className="flex-1"
                              placeholder="اسم الشركة"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (editingManufacturerName.trim()) {
                                  updateManufacturerNameMutation.mutate({
                                    id: manufacturer.id,
                                    name: editingManufacturerName.trim(),
                                  });
                                }
                              }}
                              disabled={!editingManufacturerName.trim() || updateManufacturerNameMutation.isPending}
                            >
                              {updateManufacturerNameMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingManufacturerId(null);
                                setEditingManufacturerName("");
                              }}
                            >
                              إلغاء
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <h3 className="font-semibold text-lg">{manufacturer.name}</h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingManufacturerId(manufacturer.id);
                                setEditingManufacturerName(manufacturer.name);
                              }}
                            >
                              <Edit2 size={14} />
                            </Button>
                          </div>
                        )}
                        <Badge variant="outline">#{manufacturer.id}</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {manufacturer.logo ? (
                          <div className="space-y-3 bg-white p-4 rounded-lg border">
                            <div className="text-center">
                              <div className="w-20 h-20 mx-auto border-2 border-green-200 rounded-lg p-2 bg-green-50">
                                <img
                                  src={manufacturer.logo}
                                  alt={`${manufacturer.name} logo`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <p className="text-xs text-green-600 mt-2 font-medium">✓ الشعار محمّل</p>
                            </div>
                            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                                className="hidden"
                                id={`file-change-${manufacturer.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
                                    
                                    // Check file type
                                    if (!file.type.startsWith('image/')) {
                                      toast({
                                        title: "نوع ملف غير صحيح",
                                        description: "يرجى اختيار ملف صورة صحيح (PNG, JPG, JPEG, GIF, WebP, SVG)",
                                        variant: "destructive",
                                      });
                                      e.target.value = '';
                                      return;
                                    }
                                    
                                    // Check file size (limit to 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast({
                                        title: "خطأ في حجم الملف",
                                        description: "حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت",
                                        variant: "destructive",
                                      });
                                      e.target.value = '';
                                      return;
                                    }

                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const result = event.target?.result as string;
                                      if (result) {
                                        console.log('File read successfully, base64 length:', result.length);
                                        updateManufacturerLogoMutation.mutate({
                                          id: manufacturer.id,
                                          logo: result,
                                        });
                                      }
                                    };
                                    reader.onerror = (error) => {
                                      console.error('Error reading file:', error);
                                      toast({
                                        title: "خطأ في قراءة الملف",
                                        description: "حدث خطأ أثناء قراءة الصورة. يرجى المحاولة مرة أخرى",
                                        variant: "destructive",
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                  // Reset the input value to allow selecting the same file again
                                  e.target.value = '';
                                }}
                              />
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                                disabled={updateManufacturerLogoMutation.isPending}
                                onClick={() => {
                                  console.log('Change logo button clicked');
                                  const fileInput = document.getElementById(`file-change-${manufacturer.id}`) as HTMLInputElement;
                                  fileInput?.click();
                                }}
                              >
                                <Edit2 size={14} />
                                {updateManufacturerLogoMutation.isPending ? "جاري التحديث..." : "تغيير الشعار"}
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف شعار ${manufacturer.name}؟`)) {
                                    updateManufacturerLogoMutation.mutate({
                                      id: manufacturer.id,
                                      logo: "",
                                    });
                                  }
                                }}
                              >
                                <Trash2 size={14} />
                                حذف الشعار
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 bg-white p-4 rounded-lg border-2 border-dashed border-orange-300">
                            <div className="text-center">
                              <div className="w-20 h-20 bg-orange-50 border-2 border-orange-200 rounded-lg flex items-center justify-center mx-auto">
                                <ImageIcon size={32} className="text-orange-400" />
                              </div>
                              <p className="text-xs text-orange-600 mt-2 font-medium">لا يوجد شعار</p>
                            </div>
                            <div className="text-center">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                                className="hidden"
                                id={`file-upload-${manufacturer.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
                                    
                                    // Check file type
                                    if (!file.type.startsWith('image/')) {
                                      toast({
                                        title: "نوع ملف غير صحيح",
                                        description: "يرجى اختيار ملف صورة صحيح (PNG, JPG, JPEG, GIF, WebP, SVG)",
                                        variant: "destructive",
                                      });
                                      e.target.value = '';
                                      return;
                                    }
                                    
                                    // Check file size (limit to 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast({
                                        title: "خطأ في حجم الملف",
                                        description: "حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت",
                                        variant: "destructive",
                                      });
                                      e.target.value = '';
                                      return;
                                    }

                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const result = event.target?.result as string;
                                      if (result) {
                                        console.log('File read successfully, base64 length:', result.length);
                                        updateManufacturerLogoMutation.mutate({
                                          id: manufacturer.id,
                                          logo: result,
                                        });
                                      }
                                    };
                                    reader.onerror = (error) => {
                                      console.error('Error reading file:', error);
                                      toast({
                                        title: "خطأ في قراءة الملف",
                                        description: "حدث خطأ أثناء قراءة الصورة. يرجى المحاولة مرة أخرى",
                                        variant: "destructive",
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                  // Reset the input value to allow selecting the same file again
                                  e.target.value = '';
                                }}
                              />
                              <Button 
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                                size="lg"
                                disabled={updateManufacturerLogoMutation.isPending}
                                onClick={() => {
                                  console.log('Upload logo button clicked');
                                  const fileInput = document.getElementById(`file-upload-${manufacturer.id}`) as HTMLInputElement;
                                  fileInput?.click();
                                }}
                              >
                                <Upload size={18} className="ml-2" />
                                {updateManufacturerLogoMutation.isPending ? "جاري الرفع..." : "رفع شعار"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  إعدادات التخطيط
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">الاتجاه من اليمين إلى اليسار</Label>
                    <p className="text-sm text-muted-foreground">تخطيط النص والواجهة بالاتجاه العربي</p>
                  </div>
                  <div className="relative">
                    <div 
                      className={`w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${
                        rtlLayout ? 'bg-blue-600' : 'bg-blue-200'
                      }`}
                      onClick={() => setRtlLayout(!rtlLayout)}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                          rtlLayout ? 'right-1' : 'right-6'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Manufacturer Dialog */}
        <Dialog open={showNewManufacturerDialog} onOpenChange={setShowNewManufacturerDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة شركة مصنعة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturerName">اسم الشركة المصنعة</Label>
                <Input
                  id="manufacturerName"
                  value={newManufacturerName}
                  onChange={(e) => setNewManufacturerName(e.target.value)}
                  placeholder="مرسيدس"
                />
              </div>

              <div className="space-y-2">
                <Label>شعار الشركة (اختياري)</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                  {newManufacturerLogo ? (
                    <div className="space-y-2">
                      <img
                        src={newManufacturerLogo}
                        alt="Logo Preview"
                        className="max-h-16 mx-auto"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewManufacturerLogo(null)}
                      >
                        حذف الشعار
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-slate-200 rounded mx-auto flex items-center justify-center">
                        <ImageIcon size={20} className="text-slate-400" />
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('New manufacturer file selected:', file.name, 'Size:', file.size, 'Type:', file.type);
                              
                              // Check file type
                              if (!file.type.startsWith('image/')) {
                                toast({
                                  title: "نوع ملف غير صحيح",
                                  description: "يرجى اختيار ملف صورة صحيح (PNG, JPG, JPEG, GIF, WebP, SVG)",
                                  variant: "destructive",
                                });
                                e.target.value = '';
                                return;
                              }
                              
                              // Check file size (limit to 5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                toast({
                                  title: "خطأ في حجم الملف",
                                  description: "حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت",
                                  variant: "destructive",
                                });
                                e.target.value = '';
                                return;
                              }

                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const result = event.target?.result as string;
                                if (result) {
                                  console.log('New manufacturer logo read successfully');
                                  setNewManufacturerLogo(result);
                                }
                              };
                              reader.onerror = (error) => {
                                console.error('Error reading file:', error);
                                toast({
                                  title: "خطأ في قراءة الملف",
                                  description: "حدث خطأ أثناء قراءة الصورة. يرجى المحاولة مرة أخرى",
                                  variant: "destructive",
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                            // Reset the input value to allow selecting the same file again
                            e.target.value = '';
                          }}
                        />
                        <Button variant="outline" size="sm">
                          <Upload size={14} />
                          اختر شعار
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewManufacturerDialog(false);
                    setNewManufacturerName("");
                    setNewManufacturerLogo(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleAddManufacturer}
                  disabled={!newManufacturerName.trim() || createManufacturerMutation.isPending}
                >
                  {createManufacturerMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}