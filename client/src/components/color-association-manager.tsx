import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, Plus, Check, X, Palette, Building2, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ColorAssociation, InsertColorAssociation } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ColorAssociationManagerProps {
  manufacturers: string[];
  categories: string[];
  trimLevels: string[];
  exteriorColors: string[];
  interiorColors: string[];
}

export default function ColorAssociationManager({
  manufacturers,
  categories,
  trimLevels,
  exteriorColors,
  interiorColors
}: ColorAssociationManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch color associations
  const { data: associationsData, isLoading } = useQuery({
    queryKey: ["/api/color-associations"],
    queryFn: () => apiRequest("GET", "/api/color-associations")
  });

  // Ensure associations is always an array
  const associations = Array.isArray(associationsData) ? associationsData : [];

  const [newAssociation, setNewAssociation] = useState<Partial<InsertColorAssociation>>({
    manufacturer: "",
    category: "",
    trimLevel: "",
    colorType: "exterior",
    colorName: "",
    colorCode: ""
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<InsertColorAssociation>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState<ColorAssociation | null>(null);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: InsertColorAssociation) => apiRequest("POST", "/api/color-associations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/color-associations"] });
      setNewAssociation({
        manufacturer: "",
        category: "",
        trimLevel: "",
        colorType: "exterior",
        colorName: "",
        colorCode: ""
      });
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة ربط اللون بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة ربط اللون",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertColorAssociation> }) => 
      apiRequest("PUT", `/api/color-associations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/color-associations"] });
      setEditingId(null);
      setEditingValues({});
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث ربط اللون بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث ربط اللون",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/color-associations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/color-associations"] });
      setShowDeleteDialog(null);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف ربط اللون بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف ربط اللون",
        variant: "destructive",
      });
    }
  });

  const handleAddAssociation = () => {
    if (!newAssociation.manufacturer || !newAssociation.colorName) {
      toast({
        title: "خطأ",
        description: "الشركة المصنعة واسم اللون مطلوبان",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(newAssociation as InsertColorAssociation);
  };

  const handleEditAssociation = (id: number) => {
    updateMutation.mutate({ id, data: editingValues });
  };

  const handleDeleteAssociation = (association: ColorAssociation) => {
    deleteMutation.mutate(association.id);
  };

  const getColorOptions = (colorType: "exterior" | "interior") => {
    return colorType === "exterior" ? exteriorColors : interiorColors;
  };

  const renderDeleteDialog = () => (
    <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
      <AlertDialogContent className="glass-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            هل أنت متأكد من حذف ربط اللون "{showDeleteDialog?.colorName}" 
            للشركة "{showDeleteDialog?.manufacturer}"؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="glass-button">إلغاء</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => showDeleteDialog && handleDeleteAssociation(showDeleteDialog)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isLoading) {
    return (
      <div className="glass-container p-6">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>جاري تحميل بيانات ربط الألوان...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass-container">
          <CardContent className="p-4">
            <div className="text-center">
              <Palette className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <p className="text-lg font-bold text-white">{associations.length}</p>
              <p className="text-xs text-gray-300">إجمالي الربط</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-container">
          <CardContent className="p-4">
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="text-lg font-bold text-white">
                {new Set(associations.map(a => a.manufacturer)).size}
              </p>
              <p className="text-xs text-gray-300">الشركات المرتبطة</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-container">
          <CardContent className="p-4">
            <div className="text-center">
              <Car className="h-8 w-8 mx-auto mb-2 text-orange-400" />
              <p className="text-lg font-bold text-white">
                {associations.filter(a => a.colorType === "exterior").length}
              </p>
              <p className="text-xs text-gray-300">ألوان خارجية</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add new association */}
      <Card className="glass-container border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Palette className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">إضافة ربط لون جديد</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Manufacturer */}
            <div>
              <Label className="text-white font-medium mb-2 block">الشركة المصنعة *</Label>
              <Select 
                value={newAssociation.manufacturer} 
                onValueChange={(value) => setNewAssociation({...newAssociation, manufacturer: value})}
              >
                <SelectTrigger className="glass-container border-white/20 text-white">
                  <SelectValue placeholder="اختر الشركة" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.filter(m => m && m.trim()).map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label className="text-white font-medium mb-2 block">الفئة (اختياري)</Label>
              <Select 
                value={newAssociation.category || "all"} 
                onValueChange={(value) => setNewAssociation({...newAssociation, category: value === "all" ? "" : value})}
              >
                <SelectTrigger className="glass-container border-white/20 text-white">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.filter(c => c && c.trim()).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trim Level */}
            <div>
              <Label className="text-white font-medium mb-2 block">درجة التجهيز (اختياري)</Label>
              <Select 
                value={newAssociation.trimLevel || "all"} 
                onValueChange={(value) => setNewAssociation({...newAssociation, trimLevel: value === "all" ? "" : value})}
              >
                <SelectTrigger className="glass-container border-white/20 text-white">
                  <SelectValue placeholder="اختر درجة التجهيز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الدرجات</SelectItem>
                  {trimLevels.filter(t => t && t.trim()).map((trim) => (
                    <SelectItem key={trim} value={trim}>
                      {trim}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Type */}
            <div>
              <Label className="text-white font-medium mb-2 block">نوع اللون *</Label>
              <Select 
                value={newAssociation.colorType} 
                onValueChange={(value: "exterior" | "interior") => setNewAssociation({...newAssociation, colorType: value})}
              >
                <SelectTrigger className="glass-container border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exterior">خارجي</SelectItem>
                  <SelectItem value="interior">داخلي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Name */}
            <div>
              <Label className="text-white font-medium mb-2 block">اسم اللون *</Label>
              <Select 
                value={newAssociation.colorName} 
                onValueChange={(value) => setNewAssociation({...newAssociation, colorName: value})}
              >
                <SelectTrigger className="glass-container border-white/20 text-white">
                  <SelectValue placeholder="اختر اللون" />
                </SelectTrigger>
                <SelectContent>
                  {getColorOptions(newAssociation.colorType!).filter(c => c && c.trim()).map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Code */}
            <div>
              <Label className="text-white font-medium mb-2 block">كود اللون (اختياري)</Label>
              <Input
                value={newAssociation.colorCode || ""}
                onChange={(e) => setNewAssociation({...newAssociation, colorCode: e.target.value})}
                placeholder="#FFFFFF"
                className="glass-container border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAddAssociation}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!newAssociation.manufacturer || !newAssociation.colorName}
            >
              <Plus className="h-4 w-4 ml-1" />
              إضافة ربط اللون
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current associations */}
      <Card className="glass-container border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              ربط الألوان الحالي
            </h3>
            <Badge variant="secondary" className="bg-white/10 text-white">
              {associations.length} ربط
            </Badge>
          </div>

          <div className="space-y-3">
            {associations.map((association) => (
              <div
                key={association.id}
                className="flex items-center justify-between p-4 glass-container border-white/20 rounded-lg"
              >
                {editingId === association.id ? (
                  // Edit mode
                  <div className="flex items-center gap-3 flex-1">
                    <Select 
                      value={editingValues.manufacturer || association.manufacturer} 
                      onValueChange={(value) => setEditingValues({...editingValues, manufacturer: value})}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs glass-container border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers.filter(m => m && m.trim()).map((manufacturer) => (
                          <SelectItem key={manufacturer} value={manufacturer}>
                            {manufacturer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {(editingValues.category !== undefined ? editingValues.category : association.category) && (
                      <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                        <Car className="h-3 w-3 ml-1" />
                        {editingValues.category || association.category}
                      </Badge>
                    )}

                    <Input
                      value={editingValues.colorName || association.colorName}
                      onChange={(e) => setEditingValues({...editingValues, colorName: e.target.value})}
                      className="flex-1 h-8 text-xs glass-container border-white/20 text-white"
                    />

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleEditAssociation(association.id)}
                        className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {setEditingId(null); setEditingValues({});}}
                        className="h-7 w-7 p-0 border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className="text-xs border-indigo-400 text-indigo-300">
                      <Building2 className="h-3 w-3 ml-1" />
                      {association.manufacturer}
                    </Badge>

                    {association.category && (
                      <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                        <Car className="h-3 w-3 ml-1" />
                        {association.category}
                      </Badge>
                    )}

                    {association.trimLevel && (
                      <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                        {association.trimLevel}
                      </Badge>
                    )}

                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        association.colorType === 'exterior' 
                          ? 'border-red-400 text-red-300' 
                          : 'border-pink-400 text-pink-300'
                      }`}
                    >
                      <Palette className="h-3 w-3 ml-1" />
                      {association.colorType === 'exterior' ? 'خارجي' : 'داخلي'}
                    </Badge>

                    <span className="font-medium text-white flex items-center gap-2">
                      {association.colorCode && (
                        <div 
                          className="w-4 h-4 rounded border border-white/20"
                          style={{ backgroundColor: association.colorCode }}
                        />
                      )}
                      {association.colorName}
                    </span>

                    <div className="flex items-center gap-1 mr-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(association.id);
                          setEditingValues(association);
                        }}
                        className="h-7 w-7 p-0 border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeleteDialog(association)}
                        className="h-7 w-7 p-0 border-red-400 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {associations.length === 0 && (
              <div className="text-center py-8 text-white/60">
                <Palette className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد ربط ألوان مُضافة بعد</p>
                <p className="text-sm mt-1">ابدأ بإضافة ربط ألوان جديد أعلاه</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {renderDeleteDialog()}
    </div>
  );
}