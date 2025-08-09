import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, Building2, Car, Settings, Search, Filter, Plus, Palette, Tag, Edit, Save, X, Eye, EyeOff, Edit2 } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
// import { FreshImportButton } from "@/components/FreshImportButton"; // Removed per user request

interface Manufacturer {
  id: number;
  nameAr: string;
  nameEn?: string;
  logo?: string;
}

interface Category {
  id: number;
  manufacturer_id?: number;
  name_ar?: string;
  nameAr?: string;
  name_en?: string;
  nameEn?: string;
  category?: string;
}

interface Color {
  id: number;
  name: string;
  code?: string;
  type: 'exterior' | 'interior';
  vehicleCount: number;
}

interface TrimLevel {
  id: number;
  category_id: number;
  name_ar: string;
  name_en?: string;
  colors?: Color[];
}

interface HierarchyData {
  manufacturer: Manufacturer;
  categories: Array<{
    category: Category;
    trimLevels: TrimLevel[];
    vehicleCount: number;
  }>;
  totalVehicles: number;
}

export default function HierarchicalView() {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [isAddManufacturerOpen, setIsAddManufacturerOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddTrimLevelOpen, setIsAddTrimLevelOpen] = useState(false);
  const [isAddColorOpen, setIsAddColorOpen] = useState(false);
  
  // Color form states
  const [colorType, setColorType] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorNameEn, setColorNameEn] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [colorManufacturer, setColorManufacturer] = useState("");
  const [colorCategory, setColorCategory] = useState("");
  const [colorTrimLevel, setColorTrimLevel] = useState("");
  const [isEditMode, setIsEditMode] = useState<{ type: string; id: number | string; data: any } | null>(null);
  
  // Form states
  const [manufacturerNameAr, setManufacturerNameAr] = useState("");
  const [manufacturerNameEn, setManufacturerNameEn] = useState("");
  const [manufacturerLogo, setManufacturerLogo] = useState("");
  
  const [newCategoryNameAr, setNewCategoryNameAr] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const [selectedManufacturerForCategory, setSelectedManufacturerForCategory] = useState<number | null>(null);
  
  const [newTrimLevelNameAr, setNewTrimLevelNameAr] = useState("");
  const [newTrimLevelNameEn, setNewTrimLevelNameEn] = useState("");
  const [selectedCategoryForTrimLevel, setSelectedCategoryForTrimLevel] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Comprehensive vehicle data to be added automatically
  const defaultVehicleData = [
    // Toyota
    {
      manufacturer: { nameAr: "تويوتا", nameEn: "Toyota" },
      categories: [
        { name_ar: "كامري", name_en: "Camry" },
        { name_ar: "كورولا", name_en: "Corolla" },
        { name_ar: "افالون", name_en: "Avalon" },
        { name_ar: "راف فور", name_en: "RAV4" },
        { name_ar: "هايلاندر", name_en: "Highlander" },
        { name_ar: "برادو", name_en: "Prado" },
        { name_ar: "لاند كروزر", name_en: "Land Cruiser" },
        { name_ar: "سيكويا", name_en: "Sequoia" },
        { name_ar: "تاكوما", name_en: "Tacoma" },
        { name_ar: "سيينا", name_en: "Sienna" }
      ]
    },
    // Mercedes-Benz
    {
      manufacturer: { nameAr: "مرسيدس", nameEn: "Mercedes-Benz" },
      categories: [
        { name_ar: "الفئة إي", name_en: "E-Class" },
        { name_ar: "الفئة سي", name_en: "C-Class" },
        { name_ar: "الفئة إس", name_en: "S-Class" },
        { name_ar: "الفئة إيه", name_en: "A-Class" },
        { name_ar: "سي إل إس", name_en: "CLS" },
        { name_ar: "جي إل إي", name_en: "GLE" },
        { name_ar: "جي إل إس", name_en: "GLS" },
        { name_ar: "جي إل سي", name_en: "GLC" },
        { name_ar: "جي إل إيه", name_en: "GLA" },
        { name_ar: "جي كلاس", name_en: "G-Class" }
      ]
    },
    // BMW
    {
      manufacturer: { nameAr: "بي ام دبليو", nameEn: "BMW" },
      categories: [
        { name_ar: "الفئة الثالثة", name_en: "3 Series" },
        { name_ar: "الفئة الخامسة", name_en: "5 Series" },
        { name_ar: "الفئة السابعة", name_en: "7 Series" },
        { name_ar: "إكس ون", name_en: "X1" },
        { name_ar: "إكس ثري", name_en: "X3" },
        { name_ar: "إكس فايف", name_en: "X5" },
        { name_ar: "إكس سفن", name_en: "X7" },
        { name_ar: "زي فور", name_en: "Z4" }
      ]
    },
    // Land Rover
    {
      manufacturer: { nameAr: "لاند روفر", nameEn: "Land Rover" },
      categories: [
        { name_ar: "رينج روفر", name_en: "Range Rover" },
        { name_ar: "رينج روفر سبورت", name_en: "Range Rover Sport" },
        { name_ar: "رينج روفر إيفوك", name_en: "Range Rover Evoque" },
        { name_ar: "ديسكفري", name_en: "Discovery" },
        { name_ar: "ديفندر", name_en: "Defender" }
      ]
    },
    // Rolls-Royce
    {
      manufacturer: { nameAr: "رولز رويس", nameEn: "Rolls-Royce" },
      categories: [
        { name_ar: "فانتوم", name_en: "Phantom" },
        { name_ar: "غوست", name_en: "Ghost" },
        { name_ar: "ريث", name_en: "Wraith" },
        { name_ar: "داون", name_en: "Dawn" },
        { name_ar: "كولينان", name_en: "Cullinan" }
      ]
    },
    // Bentley
    {
      manufacturer: { nameAr: "بنتلي", nameEn: "Bentley" },
      categories: [
        { name_ar: "كونتيننتال", name_en: "Continental" },
        { name_ar: "فلاينج سبير", name_en: "Flying Spur" },
        { name_ar: "بنتايجا", name_en: "Bentayga" }
      ]
    },
    // Lexus
    {
      manufacturer: { nameAr: "لكزس", nameEn: "Lexus" },
      categories: [
        { name_ar: "إي إس", name_en: "ES" },
        { name_ar: "آي إس", name_en: "IS" },
        { name_ar: "جي إس", name_en: "GS" },
        { name_ar: "إل إس", name_en: "LS" },
        { name_ar: "آر إكس", name_en: "RX" },
        { name_ar: "جي إكس", name_en: "GX" },
        { name_ar: "إل إكس", name_en: "LX" },
        { name_ar: "إن إكس", name_en: "NX" }
      ]
    },
    // Ferrari
    {
      manufacturer: { nameAr: "فيراري", nameEn: "Ferrari" },
      categories: [
        { name_ar: "488", name_en: "488" },
        { name_ar: "إف 8", name_en: "F8" },
        { name_ar: "إس إف 90", name_en: "SF90" },
        { name_ar: "روما", name_en: "Roma" },
        { name_ar: "بورتوفينو", name_en: "Portofino" },
        { name_ar: "812", name_en: "812" }
      ]
    },
    // Porsche
    {
      manufacturer: { nameAr: "بورش", nameEn: "Porsche" },
      categories: [
        { name_ar: "911", name_en: "911" },
        { name_ar: "كايين", name_en: "Cayenne" },
        { name_ar: "ماكان", name_en: "Macan" },
        { name_ar: "باناميرا", name_en: "Panamera" },
        { name_ar: "تايكان", name_en: "Taycan" },
        { name_ar: "718", name_en: "718" }
      ]
    },
    // Lamborghini
    {
      manufacturer: { nameAr: "لامبورجيني", nameEn: "Lamborghini" },
      categories: [
        { name_ar: "أفينتادور", name_en: "Aventador" },
        { name_ar: "هوراكان", name_en: "Huracan" },
        { name_ar: "أوروس", name_en: "Urus" }
      ]
    },
    // Tesla
    {
      manufacturer: { nameAr: "تسلا", nameEn: "Tesla" },
      categories: [
        { name_ar: "موديل إس", name_en: "Model S" },
        { name_ar: "موديل 3", name_en: "Model 3" },
        { name_ar: "موديل إكس", name_en: "Model X" },
        { name_ar: "موديل واي", name_en: "Model Y" }
      ]
    },
    // Ford
    {
      manufacturer: { nameAr: "فورد", nameEn: "Ford" },
      categories: [
        { name_ar: "فيوجن", name_en: "Fusion" },
        { name_ar: "إكسبلورر", name_en: "Explorer" },
        { name_ar: "إف 150", name_en: "F-150" },
        { name_ar: "موستانج", name_en: "Mustang" },
        { name_ar: "إسكيب", name_en: "Escape" }
      ]
    },
    // GMC
    {
      manufacturer: { nameAr: "جي إم سي", nameEn: "GMC" },
      categories: [
        { name_ar: "سييرا", name_en: "Sierra" },
        { name_ar: "أكاديا", name_en: "Acadia" },
        { name_ar: "تيرين", name_en: "Terrain" },
        { name_ar: "يوكون", name_en: "Yukon" }
      ]
    },
    // Chevrolet
    {
      manufacturer: { nameAr: "شيفروليه", nameEn: "Chevrolet" },
      categories: [
        { name_ar: "تاهو", name_en: "Tahoe" },
        { name_ar: "سوبربان", name_en: "Suburban" },
        { name_ar: "إكوينوكس", name_en: "Equinox" },
        { name_ar: "كامارو", name_en: "Camaro" }
      ]
    },
    // Dodge
    {
      manufacturer: { nameAr: "دودج", nameEn: "Dodge" },
      categories: [
        { name_ar: "تشالنجر", name_en: "Challenger" },
        { name_ar: "تشارجر", name_en: "Charger" },
        { name_ar: "دورانجو", name_en: "Durango" },
        { name_ar: "رام", name_en: "RAM" }
      ]
    },
    // Lincoln
    {
      manufacturer: { nameAr: "لينكولن", nameEn: "Lincoln" },
      categories: [
        { name_ar: "نافيجيتور", name_en: "Navigator" },
        { name_ar: "أفياتور", name_en: "Aviator" },
        { name_ar: "كورسير", name_en: "Corsair" },
        { name_ar: "إم كي زد", name_en: "MKZ" }
      ]
    },
    // Nissan
    {
      manufacturer: { nameAr: "نيسان", nameEn: "Nissan" },
      categories: [
        { name_ar: "ألتيما", name_en: "Altima" },
        { name_ar: "سنترا", name_en: "Sentra" },
        { name_ar: "باترول", name_en: "Patrol" },
        { name_ar: "أرمادا", name_en: "Armada" },
        { name_ar: "370 زد", name_en: "370Z" }
      ]
    },
    // Infiniti
    {
      manufacturer: { nameAr: "انفينيتي", nameEn: "Infiniti" },
      categories: [
        { name_ar: "كيو 50", name_en: "Q50" },
        { name_ar: "كيو 60", name_en: "Q60" },
        { name_ar: "كيو 70", name_en: "Q70" },
        { name_ar: "كيو إكس 50", name_en: "QX50" },
        { name_ar: "كيو إكس 60", name_en: "QX60" },
        { name_ar: "كيو إكس 80", name_en: "QX80" }
      ]
    }
  ];

  // Trim levels data
  const trimLevelsData = [
    { name_ar: "فل كامل", name_en: "Full Option" },
    { name_ar: "فل", name_en: "Full" },
    { name_ar: "ستاندرد", name_en: "Standard" },
    { name_ar: "بريميوم", name_en: "Premium" },
    { name_ar: "لوكس", name_en: "Luxury" },
    { name_ar: "سبورت", name_en: "Sport" },
    { name_ar: "إيه إم جي", name_en: "AMG" },
    { name_ar: "إم سبورت", name_en: "M Sport" },
    { name_ar: "إس لاين", name_en: "S-Line" },
    { name_ar: "إف سبورت", name_en: "F Sport" },
    { name_ar: "إتش إس إي", name_en: "HSE" },
    { name_ar: "أوتوبايوجرافي", name_en: "Autobiography" }
  ];

  // Colors data
  const colorsData = {
    exterior: [
      { name: "أبيض / White", code: "#FFFFFF" },
      { name: "أبيض لؤلؤي / Pearl White", code: "#F8F8FF" },
      { name: "أسود / Black", code: "#000000" },
      { name: "أسود معدني / Metallic Black", code: "#1C1C1C" },
      { name: "فضي / Silver", code: "#C0C0C0" },
      { name: "رمادي / Gray", code: "#808080" },
      { name: "رمادي معدني / Metallic Gray", code: "#696969" },
      { name: "أزرق / Blue", code: "#0066CC" },
      { name: "أزرق معدني / Metallic Blue", code: "#003366" },
      { name: "أحمر / Red", code: "#CC0000" },
      { name: "بني / Brown", code: "#8B4513" },
      { name: "بيج / Beige", code: "#F5F5DC" },
      { name: "ذهبي / Gold", code: "#FFD700" },
      { name: "برونزي / Bronze", code: "#CD7F32" },
      { name: "أخضر / Green", code: "#006600" }
    ],
    interior: [
      { name: "بيج / Beige", code: "#F5F5DC" },
      { name: "أسود / Black", code: "#000000" },
      { name: "بني / Brown", code: "#8B4513" },
      { name: "رمادي / Gray", code: "#808080" },
      { name: "كريمي / Cream", code: "#FFFDD0" },
      { name: "أبيض / White", code: "#FFFFFF" },
      { name: "أحمر / Red", code: "#8B0000" },
      { name: "أزرق / Blue", code: "#000080" }
    ]
  };

  // Auto-populate data mutation removed per user request

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['/api/hierarchical/manufacturers'],
  });

  // Fetch hierarchy data
  const { data: hierarchyData = [], isLoading, error } = useQuery({
    queryKey: ['/api/hierarchy/full'],
  });

  // Auto-populate functionality removed per user request

  // Add color mutation for trim levels
  const addColorMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; type: 'exterior' | 'interior'; trimLevelId: number }) => {
      return apiRequest('POST', '/api/hierarchical/colors', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تم إضافة اللون",
        description: "تم إضافة اللون بنجاح",
      });
    }
  });

  // Add manufacturer mutation
  const addManufacturerMutation = useMutation({
    mutationFn: async (data: { nameAr: string; nameEn?: string; logo?: string }) => {
      return apiRequest('POST', '/api/hierarchical/manufacturers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة الصانع",
        description: `تم إضافة صانع "${manufacturerNameAr}" بنجاح`,
      });
      setManufacturerNameAr("");
      setManufacturerNameEn("");
      setManufacturerLogo("");
      setIsAddManufacturerOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الصانع",
        variant: "destructive",
      });
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: { name_ar: string; name_en?: string; manufacturer_id: number }) => {
      return apiRequest('POST', '/api/hierarchical/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة الفئة",
        description: `تم إضافة فئة "${newCategoryNameAr}" بنجاح`,
      });
      setNewCategoryNameAr("");
      setNewCategoryNameEn("");
      setSelectedManufacturerForCategory(null);
      setIsAddCategoryOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الفئة",
        variant: "destructive",
      });
    }
  });

  // Add trim level mutation
  const addTrimLevelMutation = useMutation({
    mutationFn: async (data: { name_ar: string; name_en?: string; category_id: number }) => {
      return apiRequest('POST', '/api/hierarchical/trimLevels', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({
        title: "تمت إضافة درجة التجهيز",
        description: `تم إضافة درجة التجهيز "${newTrimLevelNameAr}" بنجاح`,
      });
      setNewTrimLevelNameAr("");
      setNewTrimLevelNameEn("");
      setSelectedCategoryForTrimLevel(null);
      setIsAddTrimLevelOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة درجة التجهيز",
        variant: "destructive",
      });
    }
  });

  // Delete mutations
  const deleteManufacturerMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/hierarchical/manufacturers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الصانع بنجاح" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف الفئة بنجاح" });
    }
  });

  const deleteTrimLevelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/hierarchical/trimLevels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
      toast({ title: "تم حذف درجة التجهيز بنجاح" });
    }
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredData = Array.isArray(hierarchyData) ? hierarchyData.filter((item: HierarchyData) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const manufacturerMatch = item.manufacturer?.nameAr?.toLowerCase().includes(searchLower) || false;
    const categoryMatch = item.categories?.some(cat => 
      cat.category?.name_ar?.toLowerCase().includes(searchLower)
    ) || false;
    const trimMatch = item.categories?.some(cat =>
      cat.trimLevels?.some(trim => trim.name_ar?.toLowerCase().includes(searchLower))
    ) || false;
    
    return manufacturerMatch || categoryMatch || trimMatch;
  }) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          جاري تحميل التسلسل الهرمي...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-4">خطأ في تحميل البيانات</div>
          <p className="text-gray-400">حدث خطأ أثناء تحميل التسلسل الهرمي. يرجى المحاولة مرة أخرى.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="glass-header p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white text-right flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            التسلسل الهرمي للمركبات
          </h1>
          
          <div className="flex gap-2">
            {/* Add Manufacturer Button */}
            <Dialog open={isAddManufacturerOpen} onOpenChange={setIsAddManufacturerOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة صانع
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة صانع جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">الاسم العربي *</Label>
                  <Input
                    value={manufacturerNameAr}
                    onChange={(e) => setManufacturerNameAr(e.target.value)}
                    placeholder="اسم الصانع بالعربية"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">الاسم الإنجليزي</Label>
                  <Input
                    value={manufacturerNameEn}
                    onChange={(e) => setManufacturerNameEn(e.target.value)}
                    placeholder="Manufacturer Name in English"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-2">رابط الشعار</Label>
                  <Input
                    value={manufacturerLogo}
                    onChange={(e) => setManufacturerLogo(e.target.value)}
                    placeholder="/logo.png"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => addManufacturerMutation.mutate({
                      nameAr: manufacturerNameAr,
                      nameEn: manufacturerNameEn || undefined,
                      logo: manufacturerLogo || undefined
                    })}
                    disabled={!manufacturerNameAr || addManufacturerMutation.isPending}
                    className="glass-button flex-1"
                  >
                    <Save className="h-4 w-4 ml-2" />
                    {addManufacturerMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                  <Button
                    onClick={() => setIsAddManufacturerOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
        <p className="text-gray-300 text-right mt-2">
          عرض العلاقة الهرمية بين الصانعين والفئات ودرجات التجهيز مع إمكانيات الإضافة والتعديل والحذف
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-container">
        <CardHeader className="glass-header">
          <CardTitle className="text-white text-right flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث في الصانعين، الفئات، أو درجات التجهيز..."
                className="pr-10"
                dir="rtl"
              />
            </div>

            {/* Manufacturer Filter */}
            <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر الصانع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصانعين</SelectItem>
                {Array.isArray(manufacturers) && manufacturers.map((manufacturer: Manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.nameAr}>
                    {manufacturer.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>



      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {/* Add Category Button */}
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة فئة
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة فئة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-right block mb-2">الصانع *</Label>
                <Select value={selectedManufacturerForCategory ? selectedManufacturerForCategory.toString() : ""} onValueChange={(value) => setSelectedManufacturerForCategory(Number(value))}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الصانع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(manufacturers) && manufacturers.filter(m => m.id && m.nameAr).map((manufacturer: Manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                        {manufacturer.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-right block mb-2">اسم الفئة بالعربية *</Label>
                <Input
                  value={newCategoryNameAr}
                  onChange={(e) => setNewCategoryNameAr(e.target.value)}
                  placeholder="اسم الفئة"
                  dir="rtl"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">اسم الفئة بالإنجليزية</Label>
                <Input
                  value={newCategoryNameEn}
                  onChange={(e) => setNewCategoryNameEn(e.target.value)}
                  placeholder="Category Name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => addCategoryMutation.mutate({
                    name_ar: newCategoryNameAr,
                    name_en: newCategoryNameEn || undefined,
                    manufacturer_id: selectedManufacturerForCategory!
                  })}
                  disabled={!newCategoryNameAr || !selectedManufacturerForCategory || addCategoryMutation.isPending}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {addCategoryMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button
                  onClick={() => setIsAddCategoryOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Trim Level Button */}
        <Dialog open={isAddTrimLevelOpen} onOpenChange={setIsAddTrimLevelOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة درجة تجهيز
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة درجة تجهيز جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-right block mb-2">الفئة *</Label>
                <Select value={selectedCategoryForTrimLevel ? selectedCategoryForTrimLevel.toString() : ""} onValueChange={(value) => setSelectedCategoryForTrimLevel(Number(value))}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                      item.categories?.filter(catData => 
                        catData.category?.id && 
                        catData.category.id.toString().trim() !== '' &&
                        (catData.category?.name_ar || catData.category?.nameAr)
                      ).map(catData => (
                        <SelectItem key={catData.category.id} value={catData.category.id.toString()}>
                          {item.manufacturer.nameAr} - {catData.category.name_ar || catData.category.nameAr}
                        </SelectItem>
                      )) || []
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-right block mb-2">اسم درجة التجهيز بالعربية *</Label>
                <Input
                  value={newTrimLevelNameAr}
                  onChange={(e) => setNewTrimLevelNameAr(e.target.value)}
                  placeholder="درجة التجهيز"
                  dir="rtl"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">اسم درجة التجهيز بالإنجليزية</Label>
                <Input
                  value={newTrimLevelNameEn}
                  onChange={(e) => setNewTrimLevelNameEn(e.target.value)}
                  placeholder="Trim Level Name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => addTrimLevelMutation.mutate({
                    name_ar: newTrimLevelNameAr,
                    name_en: newTrimLevelNameEn || undefined,
                    category_id: selectedCategoryForTrimLevel!
                  })}
                  disabled={!newTrimLevelNameAr || !selectedCategoryForTrimLevel || addTrimLevelMutation.isPending}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  {addTrimLevelMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button
                  onClick={() => setIsAddTrimLevelOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Color Button */}
        <Dialog open={isAddColorOpen} onOpenChange={setIsAddColorOpen}>
          <DialogTrigger asChild>
            <Button className="glass-button flex items-center gap-2">
              <Palette className="h-4 w-4" />
              إضافة لون
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة لون جديد</DialogTitle>
              <DialogDescription className="text-right">
                قم بإدخال تفاصيل اللون الجديد وحدد نطاق الربط (صانع، فئة، أو درجة تجهيز)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-right block mb-2">نوع اللون *</Label>
                  <Select value={colorType} onValueChange={setColorType}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر نوع اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exterior">لون خارجي</SelectItem>
                      <SelectItem value="interior">لون داخلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-right block mb-2">كود اللون</Label>
                  <div className="flex gap-2">
                    <Input
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                    {colorCode && (
                      <div 
                        className="w-8 h-8 rounded border border-gray-300" 
                        style={{ backgroundColor: colorCode }}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-right block mb-2">اسم اللون بالعربية *</Label>
                <Input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="اسم اللون بالعربية"
                  dir="rtl"
                />
              </div>

              <div>
                <Label className="text-right block mb-2">اسم اللون بالإنجليزية</Label>
                <Input
                  value={colorNameEn}
                  onChange={(e) => setColorNameEn(e.target.value)}
                  placeholder="Color Name in English"
                  dir="ltr"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-right block text-sm font-medium">ربط اللون (اختياري - يمكن اختيار مستوى واحد أو أكثر)</Label>
                
                <div>
                  <Label className="text-right block mb-2 text-sm">الصانع</Label>
                  <Select value={colorManufacturer} onValueChange={setColorManufacturer}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر الصانع (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تحديد صانع</SelectItem>
                      {Array.isArray(manufacturers) && manufacturers.filter(m => m.id && m.nameAr).map((manufacturer: Manufacturer) => (
                        <SelectItem key={`color-mfg-${manufacturer.id}`} value={manufacturer.id.toString()}>
                          {manufacturer.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-right block mb-2 text-sm">الفئة</Label>
                  <Select value={colorCategory} onValueChange={setColorCategory}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر الفئة (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تحديد فئة</SelectItem>
                      {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                        item.categories?.filter(catData => catData.category?.id && catData.category?.name_ar).map(catData => (
                          <SelectItem key={`color-cat-${catData.category.id}`} value={catData.category.id.toString()}>
                            {item.manufacturer.nameAr} - {catData.category.name_ar}
                          </SelectItem>
                        )) || []
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-right block mb-2 text-sm">درجة التجهيز</Label>
                  <Select value={colorTrimLevel} onValueChange={setColorTrimLevel}>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر درجة التجهيز (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تحديد درجة تجهيز</SelectItem>
                      {Array.isArray(hierarchyData) && hierarchyData.flatMap((item: HierarchyData) => 
                        item.categories?.flatMap(catData => 
                          catData.trimLevels?.filter(trim => trim.id && trim.name_ar).map(trim => (
                            <SelectItem key={`color-trim-${trim.id}`} value={trim.id.toString()}>
                              {item.manufacturer.nameAr} - {catData.category.name_ar} - {trim.name_ar}
                            </SelectItem>
                          )) || []
                        ) || []
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      // تحديد البيانات المطلوبة للألوان
                      const manufacturerData = Array.isArray(manufacturers) ? 
                        manufacturers.find((m: any) => m.id === Number(colorManufacturer)) : null;
                      const categoryData = Array.isArray(hierarchyData) ? 
                        hierarchyData.find((h: any) => h.manufacturer?.id === Number(colorManufacturer))
                        ?.categories?.find((c: any) => c.category?.id === Number(colorCategory)) : null;
                      const trimLevelData = categoryData?.trimLevels?.find((t: any) => t.id === Number(colorTrimLevel));

                      const colorData = {
                        manufacturer: manufacturerData?.nameAr || "",
                        category: categoryData?.category?.nameAr || categoryData?.category?.name_ar || "",
                        trimLevel: trimLevelData?.name_ar || "",
                        colorType: colorType,
                        colorName: colorName,
                        colorNameEn: colorNameEn || "",
                        colorCode: colorCode || "#FFFFFF"
                      };
                      
                      console.log('Color data to save:', colorData);
                      
                      // إرسال البيانات إلى API
                      await apiRequest('POST', '/api/color-associations', colorData);
                      
                      // تحديث البيانات
                      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
                      
                      toast({
                        title: "تمت إضافة اللون",
                        description: `تم إضافة لون "${colorName}" بنجاح`,
                      });
                      
                      // إعادة تعيين النموذج
                      setColorType("");
                      setColorName("");
                      setColorNameEn("");
                      setColorCode("");
                      setColorManufacturer("");
                      setColorCategory("");
                      setColorTrimLevel("");
                      setIsAddColorOpen(false);
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في إضافة اللون",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!colorName || !colorType}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ اللون
                </Button>
                <Button
                  onClick={() => {
                    setColorType("");
                    setColorName("");
                    setColorNameEn("");
                    setColorCode("");
                    setColorManufacturer("");
                    setColorCategory("");
                    setColorTrimLevel("");
                    setIsAddColorOpen(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hierarchy Display */}
      <div className="space-y-4">
        {filteredData.map((item: HierarchyData) => {
          // Safety check for item validity
          if (!item?.manufacturer?.id || !item?.manufacturer?.nameAr) {
            return null;
          }
          
          return (
          <Card key={`manufacturer-${item.manufacturer.id}`} className="glass-container">
            <CardHeader className="glass-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(`manufacturer-${item.manufacturer.id}`)}
                    className="text-white hover:bg-white/10"
                  >
                    {expandedItems.has(`manufacturer-${item.manufacturer.id}`) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <div className="text-right">
                    <h3 className="text-lg font-semibold text-white">{item.manufacturer.nameAr}</h3>
                    {item.manufacturer.nameEn && (
                      <p className="text-sm text-gray-400">{item.manufacturer.nameEn}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="glass-badge">
                    {item.totalVehicles} مركبة
                  </Badge>
                  <Badge variant="outline" className="glass-badge">
                    {item.categories.length} فئة
                  </Badge>
                  
                  {/* Manufacturer Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditMode({ type: 'manufacturer', id: item.manufacturer.id, data: item.manufacturer })}
                      className="text-yellow-400 hover:bg-yellow-400/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteManufacturerMutation.mutate(item.manufacturer?.id ? item.manufacturer.id.toString() : "")}
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {/* Categories */}
            <Collapsible.Root open={expandedItems.has(`manufacturer-${item.manufacturer.id}`)}>
              <Collapsible.Content>
                <CardContent className="pt-0">
                  <div className="space-y-3 mr-8">
                    {item.categories.map((catData) => (
                      <div key={catData.category.id} className="glass-section p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(`category-${catData.category.id}`)}
                              className="text-white hover:bg-white/10"
                            >
                              {expandedItems.has(`category-${catData.category.id}`) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            <Car className="h-4 w-4 text-green-400" />
                            <div className="text-right">
                              <h4 className="font-medium text-white">{catData.category.name_ar || catData.category.nameAr}</h4>
                              {(catData.category.name_en || catData.category.nameEn) && (
                                <p className="text-xs text-gray-400">{catData.category.name_en || catData.category.nameEn}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="glass-badge text-xs">
                              {catData.vehicleCount} مركبة
                            </Badge>
                            <Badge variant="outline" className="glass-badge text-xs">
                              {catData.trimLevels.length} درجة
                            </Badge>
                            
                            {/* Category Actions */}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditMode({ type: 'category', id: catData.category.id, data: catData.category })}
                                className="text-yellow-400 hover:bg-yellow-400/10"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCategoryMutation.mutate(catData.category.id)}
                                className="text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Trim Levels */}
                        <Collapsible.Root open={expandedItems.has(`category-${catData.category.id}`)}>
                          <Collapsible.Content>
                            <div className="space-y-2 mr-6">
                              {catData.trimLevels.map((trimLevel) => (
                                <div key={trimLevel.id} className="glass-item rounded">
                                  {/* Trim Level Header */}
                                  <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(`trim-${trimLevel.id}`)}
                                        className="text-white hover:bg-white/10 p-1"
                                      >
                                        {expandedItems.has(`trim-${trimLevel.id}`) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Settings className="h-3 w-3 text-purple-400" />
                                      <div className="text-right">
                                        <span className="text-sm text-white">{trimLevel.name_ar}</span>
                                        {trimLevel.name_en && (
                                          <span className="text-xs text-gray-400 block">{trimLevel.name_en}</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {trimLevel.colors && trimLevel.colors.length > 0 && (
                                        <Badge variant="outline" className="glass-badge text-xs">
                                          {trimLevel.colors.length} لون
                                        </Badge>
                                      )}
                                      
                                      {/* Trim Level Actions */}
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setIsEditMode({ type: 'trimLevel', id: trimLevel.id, data: trimLevel })}
                                          className="text-yellow-400 hover:bg-yellow-400/10"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteTrimLevelMutation.mutate(trimLevel.id)}
                                          className="text-red-400 hover:bg-red-400/10"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Colors under Trim Level */}
                                  <Collapsible.Root open={expandedItems.has(`trim-${trimLevel.id}`)}>
                                    <Collapsible.Content>
                                      <div className="space-y-2 mr-6 mt-2">
                                        <div className="p-2 bg-black/20 rounded">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <h6 className="text-xs font-medium text-gray-300 mb-2">الألوان الخارجية</h6>
                                              <div className="space-y-1">
                                                {colorsData.exterior.slice(0, 5).map((color, index) => (
                                                  <div key={`ext-${index}`} className="flex items-center gap-2">
                                                    <div 
                                                      className="w-3 h-3 rounded-full border border-gray-400"
                                                      style={{ backgroundColor: color.code }}
                                                    ></div>
                                                    <span className="text-xs text-white">{color.name.split(' / ')[0]}</span>
                                                  </div>
                                                ))}
                                                {colorsData.exterior.length > 5 && (
                                                  <span className="text-xs text-gray-400">+{colorsData.exterior.length - 5} لون آخر</span>
                                                )}
                                              </div>
                                            </div>
                                            <div>
                                              <h6 className="text-xs font-medium text-gray-300 mb-2">الألوان الداخلية</h6>
                                              <div className="space-y-1">
                                                {colorsData.interior.slice(0, 4).map((color, index) => (
                                                  <div key={`int-${index}`} className="flex items-center gap-2">
                                                    <div 
                                                      className="w-3 h-3 rounded-full border border-gray-400"
                                                      style={{ backgroundColor: color.code }}
                                                    ></div>
                                                    <span className="text-xs text-white">{color.name.split(' / ')[0]}</span>
                                                  </div>
                                                ))}
                                                {colorsData.interior.length > 4 && (
                                                  <span className="text-xs text-gray-400">+{colorsData.interior.length - 4} لون آخر</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Collapsible.Content>
                                  </Collapsible.Root>
                                  
                                  {/* Colors under Trim Level */}
                                  <Collapsible.Root open={expandedItems.has(`trim-${trimLevel.id}`)}>
                                    <Collapsible.Content>
                                      {trimLevel.colors && trimLevel.colors.length > 0 && (
                                        <div className="px-4 pb-2 mr-6">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                            {trimLevel.colors.map((color) => (
                                              <div key={color.id} className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/10">
                                                <div className="flex items-center gap-2">
                                                  <Palette className="h-3 w-3 text-yellow-400" />
                                                  <div className="flex items-center gap-2">
                                                    {color.code && (
                                                      <div 
                                                        className="w-4 h-4 rounded-full border border-white/30"
                                                        style={{ backgroundColor: color.code }}
                                                      />
                                                    )}
                                                    <div className="text-right">
                                                      <span className="text-xs text-white">{color.name}</span>
                                                      <div className="flex items-center gap-1">
                                                        <Badge 
                                                          variant="outline" 
                                                          className={`text-xs ${
                                                            color.type === 'exterior' 
                                                              ? 'border-blue-400 text-blue-400' 
                                                              : 'border-orange-400 text-orange-400'
                                                          }`}
                                                        >
                                                          {color.type === 'exterior' ? 'خارجي' : 'داخلي'}
                                                        </Badge>
                                                        {color.vehicleCount > 0 && (
                                                          <Badge variant="secondary" className="text-xs">
                                                            {color.vehicleCount} مركبة
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Color Actions */}
                                                <div className="flex gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditMode({ type: 'color', id: color.id, data: color })}
                                                    className="text-yellow-400 hover:bg-yellow-400/10 p-1"
                                                  >
                                                    <Edit className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={async () => {
                                                      if (confirm("هل أنت متأكد من حذف هذا اللون؟")) {
                                                        try {
                                                          await apiRequest('DELETE', `/api/color-associations/${color.id}`);
                                                          queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
                                                          toast({ title: "تم حذف اللون بنجاح" });
                                                        } catch (error) {
                                                          toast({
                                                            title: "خطأ",
                                                            description: "فشل في حذف اللون",
                                                            variant: "destructive",
                                                          });
                                                        }
                                                      }
                                                    }}
                                                    className="text-red-400 hover:bg-red-400/10 p-1"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </Collapsible.Content>
                                  </Collapsible.Root>
                                </div>
                              ))}
                            </div>
                          </Collapsible.Content>
                        </Collapsible.Root>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Collapsible.Content>
            </Collapsible.Root>
          </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <Card className="glass-container">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">لا توجد بيانات</h3>
            <p className="text-gray-400">لا توجد بيانات هرمية متطابقة مع البحث الحالي</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode Dialog */}
      {isEditMode && (
        <Dialog open={true} onOpenChange={() => setIsEditMode(null)}>
          <DialogContent className="glass-modal" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">
                تعديل {isEditMode.type === 'manufacturer' ? 'الصانع' : 
                       isEditMode.type === 'category' ? 'الفئة' : 'درجة التجهيز'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isEditMode.type === 'manufacturer' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم الصانع بالعربية *</Label>
                    <Input
                      value={manufacturerNameAr || isEditMode.data?.nameAr || ''}
                      onChange={(e) => setManufacturerNameAr(e.target.value)}
                      placeholder="اسم الصانع"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم الصانع بالإنجليزية</Label>
                    <Input
                      value={manufacturerNameEn || isEditMode.data?.nameEn || ''}
                      onChange={(e) => setManufacturerNameEn(e.target.value)}
                      placeholder="Manufacturer Name"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {isEditMode.type === 'category' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم الفئة بالعربية *</Label>
                    <Input
                      value={newCategoryNameAr || isEditMode.data?.name_ar || isEditMode.data?.nameAr || ''}
                      onChange={(e) => setNewCategoryNameAr(e.target.value)}
                      placeholder="اسم الفئة"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم الفئة بالإنجليزية</Label>
                    <Input
                      value={newCategoryNameEn || isEditMode.data?.name_en || isEditMode.data?.nameEn || ''}
                      onChange={(e) => setNewCategoryNameEn(e.target.value)}
                      placeholder="Category Name"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {isEditMode.type === 'trimLevel' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم درجة التجهيز بالعربية *</Label>
                    <Input
                      value={newTrimLevelNameAr || isEditMode.data?.name_ar || ''}
                      onChange={(e) => setNewTrimLevelNameAr(e.target.value)}
                      placeholder="اسم درجة التجهيز"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم درجة التجهيز بالإنجليزية</Label>
                    <Input
                      value={newTrimLevelNameEn || isEditMode.data?.name_en || ''}
                      onChange={(e) => setNewTrimLevelNameEn(e.target.value)}
                      placeholder="Trim Level Name"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              {isEditMode.type === 'color' && (
                <>
                  <div>
                    <Label className="text-right block mb-2">اسم اللون بالعربية *</Label>
                    <Input
                      value={colorName || isEditMode.data?.name || ''}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="اسم اللون بالعربية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">اسم اللون بالإنجليزية</Label>
                    <Input
                      value={colorNameEn || isEditMode.data?.nameEn || ''}
                      onChange={(e) => setColorNameEn(e.target.value)}
                      placeholder="Color Name in English"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2">كود اللون</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={colorCode || isEditMode.data?.code || '#ffffff'}
                        onChange={(e) => setColorCode(e.target.value)}
                        className="w-16 h-10 p-1 rounded border"
                      />
                      <Input
                        value={colorCode || isEditMode.data?.code || ''}
                        onChange={(e) => setColorCode(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-right block mb-2">نوع اللون</Label>
                    <Select value={colorType || isEditMode.data?.type || ''} onValueChange={setColorType}>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر نوع اللون" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exterior">خارجي</SelectItem>
                        <SelectItem value="interior">داخلي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    try {
                      if (isEditMode.type === 'manufacturer') {
                        await apiRequest('PUT', `/api/hierarchical/manufacturers/${isEditMode.id}`, {
                          nameAr: manufacturerNameAr || isEditMode.data?.nameAr,
                          nameEn: manufacturerNameEn || isEditMode.data?.nameEn
                        });
                      } else if (isEditMode.type === 'category') {
                        await apiRequest('PUT', `/api/hierarchical/categories/${isEditMode.id}`, {
                          name_ar: newCategoryNameAr || isEditMode.data?.name_ar || isEditMode.data?.nameAr,
                          name_en: newCategoryNameEn || isEditMode.data?.name_en || isEditMode.data?.nameEn
                        });
                      } else if (isEditMode.type === 'trimLevel') {
                        await apiRequest('PUT', `/api/hierarchical/trimLevels/${isEditMode.id}`, {
                          name_ar: newTrimLevelNameAr || isEditMode.data?.name_ar,
                          name_en: newTrimLevelNameEn || isEditMode.data?.name_en
                        });
                      } else if (isEditMode.type === 'color') {
                        await apiRequest('PUT', `/api/color-associations/${isEditMode.id}`, {
                          colorName: colorName || isEditMode.data?.name,
                          colorNameEn: colorNameEn || isEditMode.data?.nameEn,
                          colorCode: colorCode || isEditMode.data?.code,
                          colorType: colorType || isEditMode.data?.type
                        });
                      }
                      queryClient.invalidateQueries({ queryKey: ['/api/hierarchy/full'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
                      toast({ title: "تم التحديث بنجاح" });
                      
                      // Reset all form fields
                      setManufacturerNameAr('');
                      setManufacturerNameEn('');
                      setNewCategoryNameAr('');
                      setNewCategoryNameEn('');
                      setNewTrimLevelNameAr('');
                      setNewTrimLevelNameEn('');
                      setColorName('');
                      setColorNameEn('');
                      setColorCode('');
                      setColorType('');
                      setIsEditMode(null);
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في التحديث",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="glass-button flex-1"
                >
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
                <Button
                  onClick={() => setIsEditMode(null)}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}