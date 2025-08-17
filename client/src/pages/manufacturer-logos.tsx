import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Search, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Manufacturer {
  id: number;
  nameAr: string;
  nameEn: string;
  logo: string | null;
  isActive: boolean;
}

export default function ManufacturerLogos() {
  const queryClient = useQueryClient();
  const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch manufacturers
  const { data: manufacturers = [], isLoading, refetch } = useQuery<Manufacturer[]>({
    queryKey: ['/api/hierarchical/manufacturers'],
  });

  // Filter manufacturers based on search
  const filteredManufacturers = manufacturers.filter(manufacturer =>
    manufacturer.nameAr.includes(searchTerm) || 
    manufacturer.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update logo mutation
  const updateLogoMutation = useMutation({
    mutationFn: async ({ id, logo }: { id: number; logo: string }) => {
      return apiRequest(`/api/manufacturers/${id}/logo`, {
        method: 'PUT',
        body: JSON.stringify({ logo }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hierarchical/manufacturers'] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم ربط الشعار بالشركة المصنعة",
      });
      setIsDialogOpen(false);
      setLogoUrl('');
      setSelectedManufacturer(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في ربط الشعار بالشركة المصنعة",
        variant: "destructive",
      });
      console.error('Error updating logo:', error);
    }
  });

  const handleUpdateLogo = () => {
    if (!selectedManufacturer || !logoUrl.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار الشركة المصنعة وإدخال رابط الشعار",
        variant: "destructive",
      });
      return;
    }

    updateLogoMutation.mutate({
      id: selectedManufacturer,
      logo: logoUrl.trim()
    });
  };

  const handleEditLogo = (manufacturer: Manufacturer) => {
    setSelectedManufacturer(manufacturer.id);
    setLogoUrl(manufacturer.logo || '');
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل الشركات المصنعة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">شعارات الشركات المصنعة</h1>
          <p className="text-muted-foreground">إدارة وربط شعارات الشركات المصنعة</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <LinkIcon className="w-4 h-4 ml-2" />
                ربط شعار جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>ربط شعار بشركة مصنعة</DialogTitle>
                <DialogDescription>
                  اختر الشركة المصنعة وأدخل رابط الشعار
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manufacturer">الشركة المصنعة</Label>
                  <Select 
                    value={selectedManufacturer?.toString() || ""} 
                    onValueChange={(value) => setSelectedManufacturer(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الشركة المصنعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                          {manufacturer.nameAr} - {manufacturer.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="logoUrl">رابط الشعار</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    أدخل رابط مباشر للشعار (PNG, JPG, SVG)
                  </p>
                </div>

                {logoUrl && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">معاينة الشعار:</p>
                    <div className="flex justify-center">
                      <img
                        src={logoUrl}
                        alt="معاينة الشعار"
                        className="max-h-16 max-w-32 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleUpdateLogo}
                    disabled={updateLogoMutation.isPending}
                    className="flex-1"
                  >
                    {updateLogoMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 ml-2" />
                        حفظ الشعار
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={updateLogoMutation.isPending}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="البحث عن شركة مصنعة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{manufacturers.length}</div>
            <p className="text-muted-foreground">إجمالي الشركات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {manufacturers.filter(m => m.logo).length}
            </div>
            <p className="text-muted-foreground">شركات مع شعارات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {manufacturers.filter(m => !m.logo).length}
            </div>
            <p className="text-muted-foreground">شركات بدون شعارات</p>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredManufacturers.map((manufacturer) => (
          <Card key={manufacturer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{manufacturer.nameAr}</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditLogo(manufacturer)}
                >
                  {manufacturer.logo ? 'تعديل' : 'إضافة'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{manufacturer.nameEn}</p>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center mb-3">
                {manufacturer.logo ? (
                  <img
                    src={manufacturer.logo}
                    alt={`شعار ${manufacturer.nameAr}`}
                    className="max-h-24 max-w-24 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">لا يوجد شعار</p>
                  </div>
                )}
                <div className="hidden text-center">
                  <ImageIcon className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-red-400">فشل في تحميل الشعار</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>المعرف: {manufacturer.id}</span>
                <span className={manufacturer.isActive ? 'text-green-600' : 'text-red-600'}>
                  {manufacturer.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredManufacturers.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
          <p className="text-muted-foreground">لم يتم العثور على شركات تطابق البحث "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}