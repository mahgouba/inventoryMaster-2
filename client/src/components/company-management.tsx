import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  Globe,
  Hash,
  Receipt,
  Upload,
  Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Company, InsertCompany } from "@shared/schema";

interface CompanyFormData extends Omit<InsertCompany, 'id'> {
  id?: number;
}

export default function CompanyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    registrationNumber: "",
    licenseNumber: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxNumber: "",
    primaryColor: "#1a73e8",
    secondaryColor: "#34a853",
    isActive: true
  });

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/companies");
      return response.json();
    }
  });

  // Create company mutation
  const createCompany = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "تم إنشاء الشركة بنجاح",
        description: "تم إضافة الشركة الجديدة إلى النظام"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الشركة",
        description: error.message || "حدث خطأ أثناء إنشاء الشركة",
        variant: "destructive"
      });
    }
  });

  // Update company mutation
  const updateCompany = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CompanyFormData }) => {
      const response = await apiRequest("PUT", `/api/companies/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "تم تحديث الشركة بنجاح",
        description: "تم حفظ التعديلات بنجاح"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الشركة",
        description: error.message || "حدث خطأ أثناء تحديث الشركة",
        variant: "destructive"
      });
    }
  });

  // Delete company mutation
  const deleteCompany = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/companies/${id}`, {
        method: "DELETE"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "تم حذف الشركة بنجاح",
        description: "تم حذف الشركة من النظام"
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف الشركة",
        description: error.message || "حدث خطأ أثناء حذف الشركة",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      registrationNumber: "",
      licenseNumber: "",
      logo: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      taxNumber: "",
      primaryColor: "#1a73e8",
      secondaryColor: "#34a853",
      isActive: true
    });
    setEditingCompany(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      updateCompany.mutate({ id: editingCompany.id, data: formData });
    } else {
      createCompany.mutate(formData);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      registrationNumber: company.registrationNumber,
      licenseNumber: company.licenseNumber,
      logo: company.logo || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
      taxNumber: company.taxNumber || "",
      primaryColor: company.primaryColor || "#1a73e8",
      secondaryColor: company.secondaryColor || "#34a853",
      isActive: company.isActive
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشركة؟")) {
      deleteCompany.mutate(id);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة الشركات</h2>
          <p className="text-sm text-gray-600">إدارة بيانات الشركات المستخدمة في عروض الأسعار</p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة شركة
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "تعديل الشركة" : "إضافة شركة جديدة"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الشركة *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="registrationNumber">رقم السجل التجاري *</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">رقم الرخصة *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo">شعار الشركة</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  {formData.logo && (
                    <div className="w-20 h-20 border rounded-lg overflow-hidden">
                      <img 
                        src={formData.logo} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">اللون الأساسي</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCompany.isPending || updateCompany.isPending}
                >
                  {editingCompany ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Companies List */}
      <div className="grid gap-4">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {company.logo && (
                    <div className="w-12 h-12 border rounded-lg overflow-hidden">
                      <img 
                        src={company.logo} 
                        alt={company.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{company.name}</h3>
                      <Badge variant={company.isActive ? "default" : "secondary"}>
                        {company.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          س.ت: {company.registrationNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          رخصة: {company.licenseNumber}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {company.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {company.phone}
                          </span>
                        )}
                        {company.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {company.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: company.primaryColor }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: company.secondaryColor }}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(company)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {companies.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد شركات مضافة بعد</p>
              <p className="text-sm text-gray-500">اضغط على "إضافة شركة" لإضافة أول شركة</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}