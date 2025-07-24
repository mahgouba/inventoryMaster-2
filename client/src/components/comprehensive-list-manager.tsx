import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Eye, EyeOff, Building, Factory, MapPin, Truck, Users, Package } from "lucide-react";

interface ListItem {
  id: number;
  name: string;
  isActive?: boolean;
  [key: string]: any;
}

interface ListConfig {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  apiEndpoint: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'number';
    required?: boolean;
  }>;
}

const listConfigs: ListConfig[] = [
  {
    key: 'manufacturers',
    title: 'الشركات المصنعة',
    icon: Factory,
    apiEndpoint: '/api/manufacturers',
    fields: [
      { key: 'name', label: 'اسم الشركة', type: 'text', required: true },
      { key: 'logo', label: 'اللوجو (URL)', type: 'text' }
    ]
  },
  {
    key: 'companies',
    title: 'الشركات',
    icon: Building,
    apiEndpoint: '/api/companies',
    fields: [
      { key: 'name', label: 'اسم الشركة', type: 'text', required: true },
      { key: 'address', label: 'العنوان', type: 'textarea', required: true },
      { key: 'registrationNumber', label: 'رقم السجل التجاري', type: 'text', required: true },
      { key: 'licenseNumber', label: 'رقم الرخصة', type: 'text', required: true },
      { key: 'taxNumber', label: 'الرقم الضريبي', type: 'text', required: true },
      { key: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { key: 'phone', label: 'الهاتف', type: 'phone' },
      { key: 'website', label: 'الموقع الإلكتروني', type: 'text' }
    ]
  },
  {
    key: 'locations',
    title: 'المواقع',
    icon: MapPin,
    apiEndpoint: '/api/locations',
    fields: [
      { key: 'name', label: 'اسم الموقع', type: 'text', required: true },
      { key: 'description', label: 'الوصف', type: 'textarea' },
      { key: 'address', label: 'العنوان', type: 'textarea' },
      { key: 'manager', label: 'المسؤول', type: 'text' },
      { key: 'phone', label: 'الهاتف', type: 'phone' },
      { key: 'capacity', label: 'السعة القصوى', type: 'number' }
    ]
  },
  {
    key: 'import-types',
    title: 'أنواع الاستيراد',
    icon: Truck,
    apiEndpoint: '/api/import-types',
    fields: [
      { key: 'name', label: 'نوع الاستيراد', type: 'text', required: true },
      { key: 'description', label: 'الوصف', type: 'textarea' }
    ]
  },
  {
    key: 'statuses',
    title: 'حالات المركبات',
    icon: Package,
    apiEndpoint: '/api/statuses',
    fields: [
      { key: 'name', label: 'الحالة', type: 'text', required: true },
      { key: 'description', label: 'الوصف', type: 'textarea' },
      { key: 'color', label: 'اللون', type: 'text' }
    ]
  },
  {
    key: 'ownership-types',
    title: 'أنواع الملكية',
    icon: Users,
    apiEndpoint: '/api/ownership-types',
    fields: [
      { key: 'name', label: 'نوع الملكية', type: 'text', required: true },
      { key: 'description', label: 'الوصف', type: 'textarea' }
    ]
  }
];

export default function ComprehensiveListManager() {
  const [activeTab, setActiveTab] = useState('manufacturers');
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentConfig = listConfigs.find(config => config.key === activeTab)!;

  const { data: items = [], isLoading } = useQuery<ListItem[]>({
    queryKey: [currentConfig.apiEndpoint],
  });

  const addMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch(currentConfig.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, isActive: true }),
      });
      if (!response.ok) throw new Error('فشل في الإضافة');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentConfig.apiEndpoint] });
      setIsAddDialogOpen(false);
      setFormData({});
      toast({ title: "تم بنجاح", description: "تم إضافة العنصر بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ", 
        description: error.message || "حدث خطأ أثناء الإضافة",
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch(`${currentConfig.apiEndpoint}/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('فشل في التحديث');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentConfig.apiEndpoint] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      toast({ title: "تم بنجاح", description: "تم تحديث العنصر بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ", 
        description: error.message || "حدث خطأ أثناء التحديث",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${currentConfig.apiEndpoint}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في الحذف');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentConfig.apiEndpoint] });
      toast({ title: "تم بنجاح", description: "تم حذف العنصر بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ", 
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive" 
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`${currentConfig.apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('فشل في تغيير الحالة');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentConfig.apiEndpoint] });
      toast({ title: "تم بنجاح", description: "تم تغيير حالة العنصر بنجاح" });
    },
  });

  const handleEdit = (item: ListItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({});
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (isEdit: boolean) => {
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      addMutation.mutate(formData);
    }
  };

  const renderFormField = (field: any) => {
    const value = formData[field.key] || '';
    
    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <textarea
            id={field.key}
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            required={field.required}
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key}>{field.label}</Label>
        <Input
          id={field.key}
          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
          required={field.required}
        />
      </div>
    );
  };

  const FormDialog = ({ isEdit, isOpen, setIsOpen }: { isEdit: boolean; isOpen: boolean; setIsOpen: (open: boolean) => void }) => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'تعديل' : 'إضافة'} {currentConfig.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {currentConfig.fields.map(renderFormField)}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={() => handleSubmit(isEdit)}
            disabled={isEdit ? updateMutation.isPending : addMutation.isPending}
          >
            {isEdit ? (updateMutation.isPending ? 'جاري التحديث...' : 'تحديث') : (addMutation.isPending ? 'جاري الإضافة...' : 'إضافة')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة القوائم الشاملة</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
          {listConfigs.map((config) => {
            const IconComponent = config.icon;
            return (
              <TabsTrigger key={config.key} value={config.key} className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{config.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {listConfigs.map((config) => (
          <TabsContent key={config.key} value={config.key}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <config.icon className="w-5 h-5" />
                    {config.title}
                  </CardTitle>
                  <Button onClick={handleAdd} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة جديد
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">جاري التحميل...</div>
                ) : items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">لا توجد عناصر</div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                            )}
                          </div>
                          {item.hasOwnProperty('isActive') && (
                            <Badge variant={item.isActive ? "default" : "secondary"}>
                              {item.isActive ? 'نشط' : 'مخفي'}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {item.hasOwnProperty('isActive') && (
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div 
                                  className={`w-9 h-5 rounded-full cursor-pointer transition-all duration-300 ${
                                    item.isActive ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                  onClick={() => toggleActiveMutation.mutate({ id: item.id, isActive: !item.isActive })}
                                >
                                  <div 
                                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                                      item.isActive ? 'right-0.5' : 'right-4'
                                    }`}
                                  />
                                </div>
                              </div>
                              {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <FormDialog isEdit={false} isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} />
      <FormDialog isEdit={true} isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} />
    </div>
  );
}