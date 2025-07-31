import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, Plus, Check, X, Building2, Car, Settings2, Upload, Download, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

interface Manufacturer {
  name_ar: string;
  name_en: string;
}

interface Category {
  name_ar: string;
  name_en: string;
}

interface TrimLevel {
  trim_ar: string;
  trim_en: string;
}

interface Color {
  name_ar: string;
  name_en: string;
  type: 'interior' | 'exterior';
}

interface BulkImportData {
  manufacturer_ar: string;
  manufacturer_en: string;
  category_ar: string;
  category_en: string;
  trim_ar: string;
  trim_en: string;
  interior_color_ar?: string;
  interior_color_en?: string;
  exterior_color_ar?: string;
  exterior_color_en?: string;
}

export default function CarsJsonManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for new items
  const [newManufacturer, setNewManufacturer] = useState({ name_ar: "", name_en: "" });
  const [newCategory, setNewCategory] = useState({ manufacturer: "", name_ar: "", name_en: "" });
  const [newTrim, setNewTrim] = useState({ manufacturer: "", category: "", trim_ar: "", trim_en: "" });
  const [newColor, setNewColor] = useState({ name_ar: "", name_en: "", type: "interior" as 'interior' | 'exterior' });
  
  // State for bulk import
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // State for editing
  const [editingManufacturer, setEditingManufacturer] = useState<{ oldName: string; name_ar: string; name_en: string } | null>(null);
  const [selectedManufacturerForCategories, setSelectedManufacturerForCategories] = useState("");
  const [selectedManufacturerForTrims, setSelectedManufacturerForTrims] = useState("");
  const [selectedCategoryForTrims, setSelectedCategoryForTrims] = useState("");
  
  // State for delete dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ type: string; name: string; manufacturer?: string; category?: string } | null>(null);

  // Queries
  const { data: manufacturers = [], isLoading: manufacturersLoading } = useQuery<Manufacturer[]>({
    queryKey: ["/api/cars-json/manufacturers"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/cars-json/categories", selectedManufacturerForCategories],
    enabled: !!selectedManufacturerForCategories,
  });

  const { data: categoryOptionsForTrims = [] } = useQuery<Category[]>({
    queryKey: ["/api/cars-json/categories", selectedManufacturerForTrims],
    enabled: !!selectedManufacturerForTrims,
  });

  const { data: trims = [], isLoading: trimsLoading } = useQuery<TrimLevel[]>({
    queryKey: ["/api/cars-json/trims", selectedManufacturerForTrims, selectedCategoryForTrims],
    enabled: !!selectedManufacturerForTrims && !!selectedCategoryForTrims,
  });

  // Mutations
  const addManufacturerMutation = useMutation({
    mutationFn: (data: { name_ar: string; name_en: string }) =>
      apiRequest("POST", "/api/cars-json/manufacturers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars-json/manufacturers"] });
      setNewManufacturer({ name_ar: "", name_en: "" });
      toast({ title: "تم إضافة الشركة المصنعة بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في إضافة الشركة المصنعة", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    },
  });

  const updateManufacturerMutation = useMutation({
    mutationFn: ({ oldName, ...data }: { oldName: string; name_ar: string; name_en: string }) =>
      apiRequest("PUT", `/api/cars-json/manufacturers/${encodeURIComponent(oldName)}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars-json/manufacturers"] });
      setEditingManufacturer(null);
      toast({ title: "تم تحديث الشركة المصنعة بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في تحديث الشركة المصنعة", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    },
  });

  const deleteManufacturerMutation = useMutation({
    mutationFn: (name: string) =>
      apiRequest("DELETE", `/api/cars-json/manufacturers/${encodeURIComponent(name)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars-json/manufacturers"] });
      toast({ title: "تم حذف الشركة المصنعة بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في حذف الشركة المصنعة", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: (data: { manufacturer: string; name_ar: string; name_en: string }) =>
      apiRequest("POST", "/api/cars-json/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars-json/categories", selectedManufacturerForCategories] });
      setNewCategory({ manufacturer: "", name_ar: "", name_en: "" });
      toast({ title: "تم إضافة الفئة بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في إضافة الفئة", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: ({ manufacturer, category }: { manufacturer: string; category: string }) =>
      apiRequest("DELETE", `/api/cars-json/categories/${encodeURIComponent(manufacturer)}/${encodeURIComponent(category)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars-json/categories", selectedManufacturerForCategories] });
      toast({ title: "تم حذف الفئة بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في حذف الفئة", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    },
  });

  const addTrimMutation = useMutation({
    mutationFn: (data: { manufacturer: string; category: string; trim_ar: string; trim_en: string }) =>
      apiRequest("POST", "/api/cars-json/trims", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars-json/trims", selectedManufacturerForTrims, selectedCategoryForTrims] });
      setNewTrim({ manufacturer: "", category: "", trim_ar: "", trim_en: "" });
      toast({ title: "تم إضافة درجة التجهيز بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في إضافة درجة التجهيز", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    },
  });

  const deleteTrimMutation = useMutation({
    mutationFn: ({ manufacturer, category, trim }: { manufacturer: string; category: string; trim: string }) =>
      apiRequest("DELETE", `/api/cars-json/trims/${encodeURIComponent(manufacturer)}/${encodeURIComponent(category)}/${encodeURIComponent(trim)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars-json/trims", selectedManufacturerForTrims, selectedCategoryForTrims] });
      toast({ title: "تم حذف درجة التجهيز بنجاح" });
    },
    onError: (error: any) => {
      toast({ 
        title: "خطأ في حذف درجة التجهيز", 
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive" 
      });
    },
  });

  const handleDeleteConfirm = () => {
    if (!showDeleteDialog) return;

    if (showDeleteDialog.type === "manufacturer") {
      deleteManufacturerMutation.mutate(showDeleteDialog.name);
    } else if (showDeleteDialog.type === "category") {
      deleteCategoryMutation.mutate({
        manufacturer: showDeleteDialog.manufacturer!,
        category: showDeleteDialog.name,
      });
    } else if (showDeleteDialog.type === "trim") {
      deleteTrimMutation.mutate({
        manufacturer: showDeleteDialog.manufacturer!,
        category: showDeleteDialog.category!,
        trim: showDeleteDialog.name,
      });
    }

    setShowDeleteDialog(null);
  };

  // Bulk import handler
  const handleBulkImport = async () => {
    if (!bulkImportFile) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', bulkImportFile);

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/cars-json/bulk-import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        throw new Error('فشل في استيراد الملف');
      }

      const result = await response.json();
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/cars-json/manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cars-json/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cars-json/trims'] });

      toast({
        title: 'تم الاستيراد بنجاح',
        description: `تم استيراد ${result.imported || 0} عنصر بنجاح`,
      });

      setBulkImportFile(null);
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: 'خطأ في الاستيراد',
        description: 'حدث خطأ أثناء استيراد الملف',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Download template handler
  const downloadTemplate = () => {
    const templateData = [
      {
        manufacturer_ar: 'تويوتا',
        manufacturer_en: 'Toyota',
        category_ar: 'كامري',
        category_en: 'Camry',
        trim_ar: 'فل كامل',
        trim_en: 'Full Option',
        interior_color_ar: 'أسود',
        interior_color_en: 'Black',
        exterior_color_ar: 'أبيض',
        exterior_color_en: 'White'
      },
      {
        manufacturer_ar: 'هوندا',
        manufacturer_en: 'Honda',
        category_ar: 'أكورد',
        category_en: 'Accord',
        trim_ar: 'استاندر',
        trim_en: 'Standard',
        interior_color_ar: 'بيج',
        interior_color_en: 'Beige',
        exterior_color_ar: 'أزرق',
        exterior_color_en: 'Blue'
      }
    ];

    // Create CSV content
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'vehicle_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: 'تم تنزيل النموذج',
      description: 'يمكنك الآن تعبئة البيانات في الملف وإعادة رفعه',
    });
  };

  return (
    <div className="glass-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-header p-6 mb-6 border border-white/20 rounded-xl">
          <h1 className="text-2xl font-bold text-white text-center mb-2 drop-shadow-lg">
            إدارة بيانات المركبات من cars.json
          </h1>
          <p className="text-white/80 text-center drop-shadow">
            إضافة وتعديل وحذف الشركات المصنعة والفئات ودرجات التجهيز
          </p>
        </div>

        <Tabs defaultValue="manufacturers" className="space-y-6">
          <div className="glass-container border-white/20 p-2">
            <TabsList className="grid w-full grid-cols-5 bg-transparent">
              <TabsTrigger value="manufacturers" className="data-[state=active]:bg-white/20 text-white">
                <Building2 className="h-4 w-4 ml-2" />
                الشركات المصنعة
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-white/20 text-white">
                <Car className="h-4 w-4 ml-2" />
                الفئات
              </TabsTrigger>
              <TabsTrigger value="trims" className="data-[state=active]:bg-white/20 text-white">
                <Settings2 className="h-4 w-4 ml-2" />
                درجات التجهيز
              </TabsTrigger>
              <TabsTrigger value="colors" className="data-[state=active]:bg-white/20 text-white">
                <Palette className="h-4 w-4 ml-2" />
                الألوان
              </TabsTrigger>
              <TabsTrigger value="bulk-import" className="data-[state=active]:bg-white/20 text-white">
                <Upload className="h-4 w-4 ml-2" />
                استيراد مجمع
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Manufacturers Tab */}
          <TabsContent value="manufacturers" className="space-y-6">
            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  إضافة شركة مصنعة جديدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">الاسم العربي *</Label>
                    <Input
                      value={newManufacturer.name_ar}
                      onChange={(e) => setNewManufacturer(prev => ({ ...prev, name_ar: e.target.value }))}
                      placeholder="مثال: تويوتا"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium mb-2 block">الاسم الإنجليزي *</Label>
                    <Input
                      value={newManufacturer.name_en}
                      onChange={(e) => setNewManufacturer(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="Example: Toyota"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => addManufacturerMutation.mutate(newManufacturer)}
                  disabled={!newManufacturer.name_ar.trim() || !newManufacturer.name_en.trim() || addManufacturerMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {addManufacturerMutation.isPending ? "جاري الإضافة..." : "إضافة شركة مصنعة"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  الشركات المصنعة الحالية
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    {manufacturers.length} شركة
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {manufacturersLoading ? (
                  <div className="text-white text-center py-4">جاري التحميل...</div>
                ) : (
                  <div className="space-y-3">
                    {manufacturers.map((manufacturer: Manufacturer) => (
                      <div
                        key={manufacturer.name_ar}
                        className="flex items-center justify-between p-4 glass-container border-white/20 rounded-lg"
                      >
                        {editingManufacturer?.oldName === manufacturer.name_ar ? (
                          <div className="flex items-center gap-3 flex-1">
                            <Input
                              value={editingManufacturer.name_ar}
                              onChange={(e) => setEditingManufacturer(prev => ({ ...prev!, name_ar: e.target.value }))}
                              className="flex-1 h-8 text-xs glass-container border-white/20 text-white"
                            />
                            <Input
                              value={editingManufacturer.name_en}
                              onChange={(e) => setEditingManufacturer(prev => ({ ...prev!, name_en: e.target.value }))}
                              className="flex-1 h-8 text-xs glass-container border-white/20 text-white"
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                onClick={() => updateManufacturerMutation.mutate(editingManufacturer)}
                                className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingManufacturer(null)}
                                className="h-7 w-7 p-0 border-white/20 text-white hover:bg-white/10"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                                <Building2 className="h-3 w-3 ml-1" />
                                {manufacturer.name_ar}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-gray-400 text-gray-300">
                                {manufacturer.name_en}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingManufacturer({
                                  oldName: manufacturer.name_ar,
                                  name_ar: manufacturer.name_ar,
                                  name_en: manufacturer.name_en
                                })}
                                className="h-7 w-7 p-0 border-white/20 text-white hover:bg-white/10"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowDeleteDialog({
                                  type: "manufacturer",
                                  name: manufacturer.name_ar
                                })}
                                className="h-7 w-7 p-0 border-red-400 text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  إضافة فئة جديدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white font-medium mb-2 block">اختر الشركة المصنعة *</Label>
                  <Select
                    value={newCategory.manufacturer}
                    onValueChange={(value) => setNewCategory(prev => ({ ...prev, manufacturer: value }))}
                  >
                    <SelectTrigger className="glass-container border-white/20 text-white">
                      <SelectValue placeholder="اختر الشركة المصنعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.filter((m: any) => m && m.name_ar && m.name_ar.trim()).map((manufacturer: Manufacturer) => (
                        <SelectItem key={manufacturer.name_ar} value={manufacturer.name_ar}>
                          {manufacturer.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">اسم الفئة العربي *</Label>
                    <Input
                      value={newCategory.name_ar}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name_ar: e.target.value }))}
                      placeholder="مثال: كامري"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium mb-2 block">اسم الفئة الإنجليزي *</Label>
                    <Input
                      value={newCategory.name_en}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="Example: Camry"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => addCategoryMutation.mutate(newCategory)}
                  disabled={!newCategory.manufacturer || !newCategory.name_ar.trim() || !newCategory.name_en.trim() || addCategoryMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {addCategoryMutation.isPending ? "جاري الإضافة..." : "إضافة فئة"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  عرض الفئات حسب الشركة المصنعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white font-medium mb-2 block">اختر الشركة المصنعة</Label>
                  <Select
                    value={selectedManufacturerForCategories}
                    onValueChange={setSelectedManufacturerForCategories}
                  >
                    <SelectTrigger className="glass-container border-white/20 text-white">
                      <SelectValue placeholder="اختر الشركة المصنعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.filter((m: any) => m && m.name_ar && m.name_ar.trim()).map((manufacturer: Manufacturer) => (
                        <SelectItem key={manufacturer.name_ar} value={manufacturer.name_ar}>
                          {manufacturer.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedManufacturerForCategories && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        فئات {selectedManufacturerForCategories}
                      </h3>
                      <Badge variant="secondary" className="bg-white/10 text-white">
                        {categories.length} فئة
                      </Badge>
                    </div>
                    {categoriesLoading ? (
                      <div className="text-white text-center py-4">جاري التحميل...</div>
                    ) : (
                      <div className="space-y-3">
                        {categories.map((category: Category) => (
                          <div
                            key={category.name_ar}
                            className="flex items-center justify-between p-4 glass-container border-white/20 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs border-green-400 text-green-300">
                                <Car className="h-3 w-3 ml-1" />
                                {category.name_ar}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-gray-400 text-gray-300">
                                {category.name_en}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowDeleteDialog({
                                type: "category",
                                name: category.name_ar,
                                manufacturer: selectedManufacturerForCategories
                              })}
                              className="h-7 w-7 p-0 border-red-400 text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trims Tab */}
          <TabsContent value="trims" className="space-y-6">
            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  إضافة درجة تجهيز جديدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">اختر الشركة المصنعة *</Label>
                    <Select
                      value={newTrim.manufacturer}
                      onValueChange={(value) => {
                        setNewTrim(prev => ({ ...prev, manufacturer: value, category: "" }));
                        // Reset selected manufacturer for trims to trigger category reload
                        if (selectedManufacturerForTrims !== value) {
                          setSelectedManufacturerForTrims(value);
                          setSelectedCategoryForTrims("");
                        }
                      }}
                    >
                      <SelectTrigger className="glass-container border-white/20 text-white">
                        <SelectValue placeholder="اختر الشركة المصنعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers.filter((m: any) => m && m.name_ar && m.name_ar.trim()).map((manufacturer: Manufacturer) => (
                          <SelectItem key={manufacturer.name_ar} value={manufacturer.name_ar}>
                            {manufacturer.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white font-medium mb-2 block">اختر الفئة *</Label>
                    <Select
                      value={newTrim.category}
                      onValueChange={(value) => setNewTrim(prev => ({ ...prev, category: value }))}
                      disabled={!newTrim.manufacturer}
                    >
                      <SelectTrigger className="glass-container border-white/20 text-white">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {newTrim.manufacturer && categoryOptionsForTrims.filter((c: any) => c && c.name_ar && c.name_ar.trim()).map((category: Category) => (
                          <SelectItem key={category.name_ar} value={category.name_ar}>
                            {category.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">درجة التجهيز العربي *</Label>
                    <Input
                      value={newTrim.trim_ar}
                      onChange={(e) => setNewTrim(prev => ({ ...prev, trim_ar: e.target.value }))}
                      placeholder="مثال: LE"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium mb-2 block">درجة التجهيز الإنجليزي *</Label>
                    <Input
                      value={newTrim.trim_en}
                      onChange={(e) => setNewTrim(prev => ({ ...prev, trim_en: e.target.value }))}
                      placeholder="Example: LE"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => addTrimMutation.mutate(newTrim)}
                  disabled={!newTrim.manufacturer || !newTrim.category || !newTrim.trim_ar.trim() || !newTrim.trim_en.trim() || addTrimMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {addTrimMutation.isPending ? "جاري الإضافة..." : "إضافة درجة تجهيز"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  عرض درجات التجهيز
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">اختر الشركة المصنعة</Label>
                    <Select
                      value={selectedManufacturerForTrims}
                      onValueChange={(value) => {
                        setSelectedManufacturerForTrims(value);
                        setSelectedCategoryForTrims("");
                      }}
                    >
                      <SelectTrigger className="glass-container border-white/20 text-white">
                        <SelectValue placeholder="اختر الشركة المصنعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers.filter((m: any) => m && m.name_ar && m.name_ar.trim()).map((manufacturer: Manufacturer) => (
                          <SelectItem key={manufacturer.name_ar} value={manufacturer.name_ar}>
                            {manufacturer.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white font-medium mb-2 block">اختر الفئة</Label>
                    <Select
                      value={selectedCategoryForTrims}
                      onValueChange={setSelectedCategoryForTrims}
                      disabled={!selectedManufacturerForTrims}
                    >
                      <SelectTrigger className="glass-container border-white/20 text-white">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptionsForTrims.filter((c: any) => c && c.name_ar && c.name_ar.trim()).map((category: Category) => (
                          <SelectItem key={category.name_ar} value={category.name_ar}>
                            {category.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedManufacturerForTrims && selectedCategoryForTrims && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        درجات تجهيز {selectedManufacturerForTrims} - {selectedCategoryForTrims}
                      </h3>
                      <Badge variant="secondary" className="bg-white/10 text-white">
                        {trims.length} درجة
                      </Badge>
                    </div>
                    {trimsLoading ? (
                      <div className="text-white text-center py-4">جاري التحميل...</div>
                    ) : (
                      <div className="space-y-3">
                        {trims.map((trim: TrimLevel) => (
                          <div
                            key={trim.trim_ar}
                            className="flex items-center justify-between p-4 glass-container border-white/20 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                                <Settings2 className="h-3 w-3 ml-1" />
                                {trim.trim_ar}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-gray-400 text-gray-300">
                                {trim.trim_en}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowDeleteDialog({
                                type: "trim",
                                name: trim.trim_ar,
                                manufacturer: selectedManufacturerForTrims,
                                category: selectedCategoryForTrims
                              })}
                              className="h-7 w-7 p-0 border-red-400 text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  إضافة لون جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white font-medium mb-2 block">نوع اللون *</Label>
                  <Select
                    value={newColor.type}
                    onValueChange={(value: 'interior' | 'exterior') => setNewColor(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="glass-container border-white/20 text-white">
                      <SelectValue placeholder="اختر نوع اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interior">لون داخلي</SelectItem>
                      <SelectItem value="exterior">لون خارجي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">اسم اللون العربي *</Label>
                    <Input
                      value={newColor.name_ar}
                      onChange={(e) => setNewColor(prev => ({ ...prev, name_ar: e.target.value }))}
                      placeholder="مثال: أحمر"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium mb-2 block">اسم اللون الإنجليزي *</Label>
                    <Input
                      value={newColor.name_en}
                      onChange={(e) => setNewColor(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="Example: Red"
                      className="glass-container border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    // Add color logic here
                    toast({ title: "سيتم تطوير هذه الميزة قريباً" });
                  }}
                  disabled={!newColor.name_ar.trim() || !newColor.name_en.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة لون
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk-import" className="space-y-6">
            <Card className="glass-container border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  استيراد مجمع للبيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-white/80 space-y-2">
                  <p className="font-medium">تنسيق الملف المطلوب:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>ملف Excel (.xlsx) أو CSV (.csv)</li>
                    <li>يجب أن يحتوي على الأعمدة التالية: manufacturer_ar, manufacturer_en, category_ar, category_en, trim_ar, trim_en</li>
                    <li>أعمدة اختيارية للألوان: interior_color_ar, interior_color_en, exterior_color_ar, exterior_color_en</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">اختر ملف للاستيراد</Label>
                    <Input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
                      className="glass-container border-white/20 text-white file:bg-white/10 file:border-0 file:text-white"
                    />
                  </div>

                  {bulkImportFile && (
                    <div className="p-4 glass-container border-white/20 rounded-lg">
                      <p className="text-white text-sm">
                        <strong>الملف المحدد:</strong> {bulkImportFile.name}
                      </p>
                      <p className="text-white/70 text-xs">
                        الحجم: {(bulkImportFile.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  )}

                  {isImporting && (
                    <div className="space-y-2">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                      <p className="text-white text-sm text-center">جاري الاستيراد... {importProgress}%</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={handleBulkImport}
                      disabled={!bulkImportFile || isImporting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      {isImporting ? "جاري الاستيراد..." : "بدء الاستيراد"}
                    </Button>

                    <Button
                      onClick={downloadTemplate}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تنزيل نموذج
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
          <AlertDialogContent className="glass-container border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-white/80">
                هل أنت متأكد من حذف {showDeleteDialog?.type === "manufacturer" ? "الشركة المصنعة" : showDeleteDialog?.type === "category" ? "الفئة" : "درجة التجهيز"} "{showDeleteDialog?.name}"؟
                {showDeleteDialog?.type === "manufacturer" && " سيتم حذف جميع الفئات ودرجات التجهيز المرتبطة بها أيضاً."}
                {showDeleteDialog?.type === "category" && " سيتم حذف جميع درجات التجهيز المرتبطة بها أيضاً."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}