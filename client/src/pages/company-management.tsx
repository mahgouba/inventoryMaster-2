import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2, 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload,
  FileImage,
  Palette
} from "lucide-react";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Company {
  id: number;
  name: string;
  logo: string | null;
  registrationNumber: string;
  licenseNumber: string;
  taxNumber: string;
  address: string;
  email: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
}

interface CompanyFormData {
  name: string;
  logo: string;
  registrationNumber: string;
  licenseNumber: string;
  taxNumber: string;
  address: string;
  email: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export default function CompanyManagementPage() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    logo: "",
    registrationNumber: "",
    licenseNumber: "",
    taxNumber: "",
    address: "",
    email: "",
    website: "",
    primaryColor: "#00627F",
    secondaryColor: "#BF9231",
    accentColor: "#0891b2"
  });

  // Get all companies
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: CompanyFormData) => apiRequest("/api/companies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة الشركة الجديدة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الشركة",
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyFormData }) => 
      apiRequest(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الشركة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الشركة",
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/companies/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الشركة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الشركة",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      registrationNumber: "",
      licenseNumber: "",
      taxNumber: "",
      address: "",
      email: "",
      website: "",
      primaryColor: "#00627F",
      secondaryColor: "#BF9231",
      accentColor: "#0891b2"
    });
    setEditingCompany(null);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      logo: company.logo || "",
      registrationNumber: company.registrationNumber,
      licenseNumber: company.licenseNumber,
      taxNumber: company.taxNumber,
      address: company.address,
      email: company.email,
      website: company.website,
      primaryColor: company.primaryColor,
      secondaryColor: company.secondaryColor,
      accentColor: company.accentColor
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      updateCompanyMutation.mutate({ id: editingCompany.id, data: formData });
    } else {
      createCompanyMutation.mutate(formData);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/inventory">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="ml-2" />
                العودة للمخزون
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                إدارة الشركات
              </h1>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus size={16} className="ml-2" />
                إضافة شركة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "تعديل بيانات الشركة" : "إضافة شركة جديدة"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">المعلومات الأساسية</h3>
                  
                  <div>
                    <Label htmlFor="name">اسم الشركة *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="logo">شعار الشركة</Label>
                    <div className="space-y-2">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      {formData.logo && (
                        <div className="flex items-center gap-2">
                          <img 
                            src={formData.logo} 
                            alt="Logo preview" 
                            className="w-12 h-12 object-contain border rounded"
                          />
                          <span className="text-sm text-green-600">تم تحميل الشعار</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registrationNumber">رقم السجل التجاري *</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="licenseNumber">رقم الرخصة *</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="taxNumber">الرقم الضريبي *</Label>
                    <Input
                      id="taxNumber"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">الموقع الإلكتروني</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Color Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Palette size={20} />
                    ألوان العرض
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">اللون الأساسي</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="accentColor">لون التمييز</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={formData.accentColor}
                          onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                  >
                    {editingCompany ? "تحديث" : "حفظ"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Building2 size={24} className="text-gray-400" />
                    )}
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCompanyMutation.mutate(company.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">السجل التجاري: </span>
                    <span>{company.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium">الرقم الضريبي: </span>
                    <span>{company.taxNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium">البريد الإلكتروني: </span>
                    <span className="text-blue-600">{company.email}</span>
                  </div>
                  {company.website && (
                    <div>
                      <span className="font-medium">الموقع: </span>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: company.primaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: company.secondaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: company.accentColor }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد شركات مسجلة</h3>
            <p className="text-gray-500 mb-4">ابدأ بإضافة أول شركة لك</p>
          </div>
        )}
      </div>
    </div>
  );
}