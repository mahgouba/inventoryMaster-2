import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Eye, 
  EyeOff, 
  Save, 
  ExternalLink, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Instagram, 
  Twitter,
  Palette,
  Type,
  Image,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface WebsiteSettings {
  id: number;
  companyName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl: string;
  heroBgColor: string;
  primaryColor: string;
  whatsappNumber: string;
  phone: string;
  address: string;
  socialInstagram: string;
  socialTwitter: string;
  isPublished: boolean;
  showPrices: boolean;
  showFinancing: boolean;
}

export default function WebsiteManagementPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<WebsiteSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, isLoading } = useQuery<WebsiteSettings>({
    queryKey: ["/api/website/settings"],
  });

  useEffect(() => {
    if (settings && !hasChanges) {
      setForm(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<WebsiteSettings>) =>
      apiRequest("PUT", "/api/website/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website/settings"] });
      setHasChanges(false);
      toast({ title: "تم الحفظ", description: "تم حفظ إعدادات الموقع بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حفظ الإعدادات", variant: "destructive" });
    },
  });

  const handleChange = (field: keyof WebsiteSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => saveMutation.mutate(form);

  const showroomUrl = `${window.location.origin}/showroom`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C79C45]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C79C45]/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#C79C45]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">إدارة الموقع الإلكتروني</h1>
            <p className="text-white/50 text-sm">تحكم في محتوى وإعدادات الموقع العام</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Published Status Badge */}
          <Badge
            className={form.isPublished
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"}
          >
            {form.isPublished ? (
              <><CheckCircle className="w-3 h-3 ml-1" /> منشور</>
            ) : (
              <><AlertCircle className="w-3 h-3 ml-1" /> غير منشور</>
            )}
          </Badge>

          {/* Open Showroom */}
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white/70 hover:text-white gap-2"
            onClick={() => window.open(showroomUrl, "_blank")}
            data-testid="button-open-showroom"
          >
            <ExternalLink className="w-4 h-4" />
            فتح الموقع
          </Button>

          {/* Save */}
          <Button
            size="sm"
            className="bg-[#C79C45] hover:bg-[#B8862F] text-black gap-2"
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasChanges}
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </div>

      {/* Showroom URL */}
      <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
        <Globe className="w-4 h-4 text-[#C79C45] flex-shrink-0" />
        <span className="text-white/50 text-sm">رابط الموقع:</span>
        <span className="text-[#C79C45] text-sm font-mono flex-1 truncate">{showroomUrl}</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/50 hover:text-white"
          onClick={() => { navigator.clipboard.writeText(showroomUrl); toast({ title: "تم النسخ" }); }}
          data-testid="button-copy-url"
        >
          نسخ
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6 bg-white/5 border border-white/10">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#C79C45] data-[state=active]:text-black text-white/70">
            <Type className="w-4 h-4 ml-2" /> عام
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-[#C79C45] data-[state=active]:text-black text-white/70">
            <Phone className="w-4 h-4 ml-2" /> التواصل
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-[#C79C45] data-[state=active]:text-black text-white/70">
            <Palette className="w-4 h-4 ml-2" /> المظهر
          </TabsTrigger>
          <TabsTrigger value="visibility" className="data-[state=active]:bg-[#C79C45] data-[state=active]:text-black text-white/70">
            <Eye className="w-4 h-4 ml-2" /> الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10 col-span-2">
              <CardHeader><CardTitle className="text-white text-base">معلومات الشركة</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">اسم الشركة / المعرض</Label>
                  <Input
                    value={form.companyName || ""}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    data-testid="input-company-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">الشعار الفرعي (Tagline)</Label>
                  <Input
                    value={form.tagline || ""}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    data-testid="input-tagline"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 col-span-2">
              <CardHeader><CardTitle className="text-white text-base">قسم الهيرو (الرئيسي)</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">العنوان الرئيسي</Label>
                  <Input
                    value={form.heroTitle || ""}
                    onChange={(e) => handleChange("heroTitle", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    data-testid="input-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">العنوان الفرعي</Label>
                  <Input
                    value={form.heroSubtitle || ""}
                    onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    data-testid="input-hero-subtitle"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-base">معلومات التواصل</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-400" /> رقم واتساب
                </Label>
                <Input
                  value={form.whatsappNumber || ""}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  placeholder="966500000000"
                  className="bg-white/5 border-white/20 text-white"
                  dir="ltr"
                  data-testid="input-whatsapp"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" /> رقم الهاتف
                </Label>
                <Input
                  value={form.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  dir="ltr"
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-white/70 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" /> العنوان
                </Label>
                <Input
                  value={form.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  data-testid="input-address"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400" /> إنستغرام
                </Label>
                <Input
                  value={form.socialInstagram || ""}
                  onChange={(e) => handleChange("socialInstagram", e.target.value)}
                  placeholder="@username"
                  className="bg-white/5 border-white/20 text-white"
                  dir="ltr"
                  data-testid="input-instagram"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-sky-400" /> تويتر / X
                </Label>
                <Input
                  value={form.socialTwitter || ""}
                  onChange={(e) => handleChange("socialTwitter", e.target.value)}
                  placeholder="@username"
                  className="bg-white/5 border-white/20 text-white"
                  dir="ltr"
                  data-testid="input-twitter"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-base">المظهر والألوان</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/70">اللون الرئيسي</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor || "#C79C45"}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-12 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                    data-testid="input-primary-color"
                  />
                  <Input
                    value={form.primaryColor || ""}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="bg-white/5 border-white/20 text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">لون خلفية الهيرو</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.heroBgColor || "#0f172a"}
                    onChange={(e) => handleChange("heroBgColor", e.target.value)}
                    className="w-12 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                    data-testid="input-hero-bg-color"
                  />
                  <Input
                    value={form.heroBgColor || ""}
                    onChange={(e) => handleChange("heroBgColor", e.target.value)}
                    className="bg-white/5 border-white/20 text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              {/* Preview */}
              <div className="md:col-span-2">
                <Label className="text-white/70 mb-3 block">معاينة الهيرو</Label>
                <div
                  className="rounded-xl p-8 text-center"
                  style={{ backgroundColor: form.heroBgColor || "#0f172a" }}
                >
                  <h2 className="text-2xl font-bold mb-2" style={{ color: form.primaryColor || "#C79C45" }}>
                    {form.heroTitle || "اكتشف سيارة أحلامك"}
                  </h2>
                  <p className="text-white/70">{form.heroSubtitle || "تشكيلة واسعة من السيارات"}</p>
                  <Button
                    className="mt-4"
                    style={{ backgroundColor: form.primaryColor || "#C79C45", color: "#000" }}
                  >
                    تصفح السيارات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Tab */}
        <TabsContent value="visibility">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-white text-base">إعدادات النشر والعرض</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">نشر الموقع</p>
                  <p className="text-white/50 text-sm">السماح للعملاء بالوصول إلى الموقع</p>
                </div>
                <Switch
                  checked={form.isPublished || false}
                  onCheckedChange={(v) => handleChange("isPublished", v)}
                  data-testid="switch-published"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">عرض الأسعار</p>
                  <p className="text-white/50 text-sm">إظهار أسعار السيارات للزوار</p>
                </div>
                <Switch
                  checked={form.showPrices !== false}
                  onCheckedChange={(v) => handleChange("showPrices", v)}
                  data-testid="switch-show-prices"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">عرض التمويل</p>
                  <p className="text-white/50 text-sm">إظهار خيارات التمويل البنكي</p>
                </div>
                <Switch
                  checked={form.showFinancing !== false}
                  onCheckedChange={(v) => handleChange("showFinancing", v)}
                  data-testid="switch-show-financing"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
