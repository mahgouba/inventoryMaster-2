import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Image } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Manufacturer {
  id: number;
  name: string;
  logo: string | null;
}

interface ManufacturerLogosProps {
  userRole: string;
  onLogout: () => void;
}

export default function ManufacturerLogos({ userRole, onLogout }: ManufacturerLogosProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Manufacturer logo management state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
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
              <Image size={24} />
              إدارة شعارات الشركات المصنعة
            </h1>
          </div>
        </div>

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
      </div>
    </div>
  );
}