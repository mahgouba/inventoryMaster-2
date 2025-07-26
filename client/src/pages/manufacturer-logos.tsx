import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  ArrowLeft,
  Image as ImageIcon,
  Edit2,
  Plus,
  Trash2,
  Save,
  X
} from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Manufacturer } from "@/../../shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ManufacturerLogosProps {
  userRole: string;
  onLogout: () => void;
}

export default function ManufacturerLogosPage({ userRole, onLogout }: ManufacturerLogosProps) {
  const queryClient = useQueryClient();
  
  // State for new manufacturer dialog
  const [showNewManufacturerDialog, setShowNewManufacturerDialog] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [newManufacturerLogo, setNewManufacturerLogo] = useState<string | null>(null);
  
  // State for editing manufacturer names
  const [editingManufacturerId, setEditingManufacturerId] = useState<number | null>(null);
  const [editingManufacturerName, setEditingManufacturerName] = useState("");

  // Fetch manufacturers
  const { data: manufacturers = [] } = useQuery<Manufacturer[]>({
    queryKey: ["/api/manufacturers"],
  });

  // Fetch inventory manufacturers
  const { data: inventoryStats = [] } = useQuery<Array<{ manufacturer: string; count: number }>>({
    queryKey: ["/api/inventory/manufacturer-stats"],
  });
  
  const inventoryManufacturers = inventoryStats.map((stat) => stat.manufacturer);

  // Create manufacturer mutation
  const createManufacturerMutation = useMutation({
    mutationFn: (data: { name: string; logo?: string }) => 
      apiRequest("POST", "/api/manufacturers", data),
    onSuccess: () => {
      toast({
        title: "تم إنشاء الشركة المصنعة",
        description: "تم إضافة الشركة المصنعة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setShowNewManufacturerDialog(false);
      setNewManufacturerName("");
      setNewManufacturerLogo(null);
    },
    onError: (error: any) => {
      if (error.message?.includes('already exists') || error.message?.includes('UNIQUE constraint')) {
        toast({
          title: "خطأ - اسم مكرر",
          description: "الاسم موجود بالفعل! يرجى اختيار اسم آخر",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في إنشاء الشركة",
          description: error.message || "حدث خطأ أثناء إنشاء الشركة المصنعة",
          variant: "destructive",
        });
      }
    },
  });

  // Update manufacturer name mutation
  const updateManufacturerNameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => 
      apiRequest("PUT", `/api/manufacturers/${id}`, { name }),
    onSuccess: () => {
      toast({
        title: "تم تحديث الاسم",
        description: "تم تحديث اسم الشركة المصنعة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
      setEditingManufacturerId(null);
      setEditingManufacturerName("");
    },
    onError: (error: any) => {
      if (error.message?.includes('already exists') || error.message?.includes('UNIQUE constraint')) {
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

  // Update manufacturer logo mutation
  const updateManufacturerLogoMutation = useMutation({
    mutationFn: ({ id, logo }: { id: number; logo: string }) => 
      apiRequest("PUT", `/api/manufacturers/${id}`, { logo }),
    onSuccess: () => {
      toast({
        title: "تم رفع الشعار",
        description: "تم حفظ شعار الشركة المصنعة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في رفع الشعار",
        description: error.message || "حدث خطأ أثناء رفع الشعار",
        variant: "destructive",
      });
    },
  });

  // Delete manufacturer mutation
  const deleteManufacturerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/manufacturers/${id}`),
    onSuccess: () => {
      toast({
        title: "تم حذف الشركة",
        description: "تم حذف الشركة المصنعة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manufacturers"] });
    },
  });

  const handleEditManufacturer = (manufacturer: Manufacturer) => {
    setEditingManufacturerId(manufacturer.id);
    setEditingManufacturerName(manufacturer.name);
  };

  const handleCancelEdit = () => {
    setEditingManufacturerId(null);
    setEditingManufacturerName("");
  };

  const handleFileUpload = (file: File, manufacturerId: number) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار صورة بصيغة PNG, JPG, JPEG, GIF, WebP, أو SVG",
        variant: "destructive",
      });
      return;
    }

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
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateManufacturerLogoMutation.mutate({
          id: manufacturerId,
          logo: result,
        });
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        title: "خطأ في قراءة الملف",
        description: "حدث خطأ أثناء قراءة ملف الصورة",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleNewManufacturerLogoUpload = (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار صورة بصيغة PNG, JPG, JPEG, GIF, WebP, أو SVG",
        variant: "destructive",
      });
      return;
    }

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
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewManufacturerLogo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen backdrop-blur-xl bg-white/5 dark:bg-black/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/inventory">
              <Button variant="outline" size="sm" className="flex items-center gap-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <ArrowLeft size={16} />
                العودة للرئيسية
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">إدارة شعارات الشركات المصنعة</h1>
              <p className="text-white/70 mt-1 drop-shadow-sm">إدارة وتحديث شعارات الشركات المصنعة في النظام</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white drop-shadow-sm">
              <ImageIcon size={20} />
              إدارة شعارات الصناع
            </CardTitle>
            <div className="space-y-2 mt-3">
              <p className="text-sm text-white/70 drop-shadow-sm">
                يمكنك هنا إضافة وتعديل شعارات الشركات المصنعة. اختر صوراً بصيغة PNG أو JPG بحجم لا يزيد عن 5 ميجابايت للحصول على أفضل جودة عرض.
              </p>
              <div className="backdrop-blur-sm bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                <p className="text-blue-200 text-sm font-medium drop-shadow-sm">📝 تعليمات مهمة:</p>
                <ul className="text-blue-100 text-sm mt-1 space-y-1 drop-shadow-sm">
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
              <p className="text-white/90 font-medium drop-shadow-sm">جميع الصناع في النظام ({manufacturers.length + inventoryManufacturers.filter(name => !manufacturers.find(m => m.name === name)).length} صانع)</p>
              <Button 
                onClick={() => setShowNewManufacturerDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm"
              >
                <Plus size={16} />
                إضافة شركة مصنعة
              </Button>
            </div>

            {/* Manufacturers from Inventory (Auto-detected) */}
            {inventoryManufacturers && inventoryManufacturers.length > 0 && (
              <div className="space-y-4">
                <div className="backdrop-blur-sm bg-green-500/20 p-4 rounded-lg border border-green-400/30">
                  <h3 className="text-green-200 font-semibold mb-2 drop-shadow-sm">🚗 الصناع من المخزون</h3>
                  <p className="text-green-100 text-sm drop-shadow-sm">هذه الشركات المصنعة موجودة في مخزونك ويمكنك رفع شعاراتها</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventoryManufacturers.map((manufacturerName, index) => {
                    // Check if this manufacturer already exists in the manufacturers table
                    const existingManufacturer = manufacturers.find(m => m.name === manufacturerName);
                    
                    if (existingManufacturer) {
                      return null; // Skip if already exists in manufacturers table
                    }
                    
                    return (
                      <div key={`inventory-${manufacturerName}-${index}`} className="backdrop-blur-sm bg-green-500/20 border-2 border-green-400/30 rounded-xl p-6 space-y-4 hover:border-green-400/50 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-green-200 drop-shadow-sm">{manufacturerName}</h3>
                          <Badge variant="outline" className="bg-green-500/20 text-green-200 border-green-400/30">من المخزون</Badge>
                        </div>
                        
                        <div className="space-y-3 backdrop-blur-sm bg-white/10 p-4 rounded-lg border-2 border-dashed border-orange-400/30">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-orange-500/20 border-2 border-orange-400/30 rounded-lg flex items-center justify-center mx-auto">
                              <ImageIcon size={32} className="text-orange-300" />
                            </div>
                            <p className="text-xs text-orange-200 mt-2 font-medium drop-shadow-sm">لا يوجد شعار</p>
                          </div>
                          <div className="text-center">
                            <Button 
                              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg backdrop-blur-sm"
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
              <div className="backdrop-blur-sm bg-blue-500/20 p-4 rounded-lg border border-blue-400/30">
                <h3 className="text-blue-200 font-semibold mb-2 drop-shadow-sm">🏭 الصناع المسجلين</h3>
                <p className="text-blue-100 text-sm drop-shadow-sm">الشركات المصنعة المسجلة في النظام مع إمكانية إدارة شعاراتها</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {manufacturers.map((manufacturer) => (
                <div key={manufacturer.id} className="backdrop-blur-sm bg-blue-500/20 border-2 border-blue-400/30 rounded-xl p-6 space-y-4 hover:border-blue-400/50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    {editingManufacturerId === manufacturer.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingManufacturerName}
                          onChange={(e) => setEditingManufacturerName(e.target.value)}
                          className="flex-1 backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {updateManufacturerNameMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Save size={16} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg text-blue-200 drop-shadow-sm">{manufacturer.name}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditManufacturer(manufacturer)}
                            className="h-8 w-8 p-0 text-blue-200 hover:text-white hover:bg-white/10"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteManufacturerMutation.mutate(manufacturer.id)}
                            className="h-8 w-8 p-0 text-red-300 hover:text-red-200 hover:bg-red-500/20"
                            disabled={deleteManufacturerMutation.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </>
                    )}
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400/30">مسجل</Badge>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    {manufacturer.logo ? (
                      <div className="w-20 h-20 border-2 border-white/20 rounded-lg overflow-hidden">
                        <img
                          src={manufacturer.logo}
                          alt={manufacturer.name}
                          className="w-full h-full object-contain bg-white/90"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-500/20 border-2 border-gray-400/30 rounded-lg flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-300" />
                      </div>
                    )}
                    
                    <div className="w-full">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, manufacturer.id);
                          }
                        }}
                        className="hidden"
                        id={`logo-upload-${manufacturer.id}`}
                      />
                      <label htmlFor={`logo-upload-${manufacturer.id}`}>
                        <Button
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg backdrop-blur-sm"
                          size="sm"
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload size={16} className="ml-2" />
                            {manufacturer.logo ? "تحديث الشعار" : "رفع شعار"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Manufacturer Dialog */}
        <Dialog open={showNewManufacturerDialog} onOpenChange={setShowNewManufacturerDialog}>
          <DialogContent className="backdrop-blur-xl bg-white/10 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white drop-shadow-sm">إضافة شركة مصنعة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white drop-shadow-sm">اسم الشركة المصنعة</Label>
                <Input
                  value={newManufacturerName}
                  onChange={(e) => setNewManufacturerName(e.target.value)}
                  placeholder="مثال: مرسيدس"
                  className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white drop-shadow-sm">شعار الشركة (اختياري)</Label>
                {newManufacturerLogo && (
                  <div className="w-20 h-20 border-2 border-white/20 rounded-lg overflow-hidden mx-auto mb-2">
                    <img
                      src={newManufacturerLogo}
                      alt="معاينة الشعار"
                      className="w-full h-full object-contain bg-white/90"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleNewManufacturerLogoUpload(file);
                    }
                  }}
                  className="hidden"
                  id="new-logo-upload"
                />
                <label htmlFor="new-logo-upload">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm"
                    size="sm"
                    asChild
                  >
                    <span className="cursor-pointer">
                      <Upload size={16} className="ml-2" />
                      اختيار شعار
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewManufacturerDialog(false);
                  setNewManufacturerName("");
                  setNewManufacturerLogo(null);
                }}
                className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  if (newManufacturerName.trim()) {
                    createManufacturerMutation.mutate({
                      name: newManufacturerName.trim(),
                      logo: newManufacturerLogo || undefined,
                    });
                  }
                }}
                disabled={!newManufacturerName.trim() || createManufacturerMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm"
              >
                {createManufacturerMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}