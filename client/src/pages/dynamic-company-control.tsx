import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, Upload, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

interface Company {
  id: number;
  name: string;
  registration_number: string | null;
  license_number: string | null;
  tax_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website?: string | null;
  logo?: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  is_active: boolean;
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function DynamicCompanyControl() {
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Fetch companies data
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"]
  });

  // The two specific companies
  const specificCompanies = companies.filter(company => 
    company.name === "معرض نخبة البريمي للسيارات" || 
    company.name === "شركة معرض البريمي للسيارات"
  );

  const currentCompany = specificCompanies[selectedCompanyIndex];

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    registration_number: "",
    license_number: "",
    tax_number: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    primary_color: "#00627F",
    secondary_color: "#BF9231",
    accent_color: "#0891b2"
  });

  // Update form when company changes
  useEffect(() => {
    if (currentCompany) {
      setFormData({
        name: currentCompany.name || "",
        registration_number: currentCompany.registration_number || "",
        license_number: currentCompany.license_number || "",
        tax_number: currentCompany.tax_number || "",
        address: currentCompany.address || "",
        phone: currentCompany.phone || "",
        email: currentCompany.email || "",
        website: currentCompany.website || "",
        primary_color: currentCompany.primary_color || "#00627F",
        secondary_color: currentCompany.secondary_color || "#BF9231",
        accent_color: currentCompany.accent_color || "#0891b2"
      });
      setLogoPreview(currentCompany.logo || "");
    }
  }, [currentCompany]);

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const response = await apiRequest("PUT", `/api/companies/${currentCompany.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ بيانات الشركة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: () => {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    },
  });

  // Set default company mutation
  const setDefaultCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiRequest("PUT", `/api/system-settings/default-company/${companyId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الشركة الافتراضية",
        description: "تم تعيين الشركة كافتراضية للعروض والفواتير",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تعيين الشركة الافتراضية",
        variant: "destructive",
      });
    },
  });

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let logoData = logoPreview;
    
    // Upload logo if new file selected
    if (logoFile) {
      try {
        logoData = await convertFileToBase64(logoFile);
      } catch (error) {
        toast({
          title: "خطأ في رفع الشعار",
          description: "حدث خطأ أثناء رفع ملف الشعار",
          variant: "destructive",
        });
        return;
      }
    }

    // Update company data
    updateCompanyMutation.mutate({
      ...formData,
      logo: logoData
    });
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle company switch
  const handleCompanySwitch = () => {
    const newIndex = selectedCompanyIndex === 0 ? 1 : 0;
    setSelectedCompanyIndex(newIndex);
  };

  // Handle set as default
  const handleSetAsDefault = () => {
    if (currentCompany) {
      setDefaultCompanyMutation.mutate(currentCompany.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات الشركات...</p>
        </div>
      </div>
    );
  }

  if (specificCompanies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">لم يتم العثور على الشركات المحددة</p>
          <Link href="/inventory">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للمخزون
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/inventory">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  العودة
                </Button>
              </Link>
              <div className="mr-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  التحكم الديناميكي في الشركة
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  تبديل وإدارة بيانات الشركات
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              اختيار الشركة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {specificCompanies[0]?.name || "الشركة الأولى"}
                </p>
                <p className="text-sm text-gray-500">الشركة الأولى</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Switch
                  checked={selectedCompanyIndex === 1}
                  onCheckedChange={handleCompanySwitch}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
              
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  {specificCompanies[1]?.name || "الشركة الثانية"}
                </p>
                <p className="text-sm text-gray-500">الشركة الثانية</p>
              </div>
            </div>
            
            {currentCompany && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">
                    الشركة النشطة حالياً: {currentCompany.name}
                  </span>
                </div>
                <Button 
                  onClick={handleSetAsDefault}
                  disabled={setDefaultCompanyMutation.isPending}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {setDefaultCompanyMutation.isPending ? "جاري التحديث..." : "تعيين كافتراضية"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Details Form */}
        {currentCompany && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الشركة - {currentCompany.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logo">شعار الشركة</Label>
                  <div className="flex items-center space-x-4">
                    {logoPreview && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={logoPreview} 
                          alt="Company Logo" 
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                    )}
                    <div>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        اختيار شعار
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الشركة</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="اسم الشركة"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_number">رقم التسجيل</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => handleInputChange('registration_number', e.target.value)}
                      placeholder="رقم التسجيل"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_number">رقم الرخصة</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      placeholder="رقم الرخصة"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_number">الرقم الضريبي</Label>
                    <Input
                      id="tax_number"
                      value={formData.tax_number}
                      onChange={(e) => handleInputChange('tax_number', e.target.value)}
                      placeholder="الرقم الضريبي"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="رقم الهاتف"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="البريد الإلكتروني"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="العنوان"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="الموقع الإلكتروني"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">ألوان الشركة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">اللون الأساسي</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange('primary_color', e.target.value)}
                          placeholder="#00627F"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">اللون الثانوي</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                          placeholder="#BF9231"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent_color">لون التمييز</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          className="w-12 h-10 p-1 rounded"
                        />
                        <Input
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange('accent_color', e.target.value)}
                          placeholder="#0891b2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateCompanyMutation.isPending}
                    className="bg-custom-gold hover:bg-custom-gold-dark text-white"
                  >
                    {updateCompanyMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}