import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit2, Plus, Check, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ColorAssociationManager from "@/components/color-association-manager";
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

interface ListsData {
  manufacturers: string[];
  engineCapacities: string[];
  statuses: string[];
  importTypes: string[];
  locations: string[];
  exteriorColors: string[];
  interiorColors: string[];
}

export default function ListManagement() {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<{type: string, index: number, value: string} | null>(null);
  const [newItem, setNewItem] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<{type: string, index: number, value: string} | null>(null);

  // Sample data - in real app this would come from API
  const [listsData, setListsData] = useState<ListsData>({
    manufacturers: ["تويوتا", "مرسيدس", "بي إم دبليو", "لكزس", "نيسان"],
    engineCapacities: ["1.6L", "2.0L", "2.4L", "3.0L", "3.5L", "4.0L", "5.7L"],
    statuses: ["متوفر", "في الطريق", "محجوز", "صيانة", "مباع"],
    importTypes: ["شخصي", "شركة", "مستعمل شخصي"],
    locations: ["المستودع الرئيسي", "معرض الرياض", "معرض جدة", "معرض الدمام"],
    exteriorColors: ["أبيض", "أسود", "فضي", "رمادي", "أحمر", "أزرق", "ذهبي"],
    interiorColors: ["أسود", "بيج", "بني", "رمادي", "أحمر"]
  });

  const listTypes = [
    { key: "manufacturers", label: "الشركات المصنعة", color: "bg-blue-500" },
    { key: "engineCapacities", label: "سعات المحرك", color: "bg-green-500" },
    { key: "statuses", label: "حالات المركبة", color: "bg-orange-500" },
    { key: "importTypes", label: "أنواع الاستيراد", color: "bg-purple-500" },
    { key: "locations", label: "المواقع", color: "bg-teal-500" },
    { key: "exteriorColors", label: "الألوان الخارجية", color: "bg-red-500" },
    { key: "interiorColors", label: "الألوان الداخلية", color: "bg-pink-500" },
    { key: "colorAssociations", label: "ربط الألوان", color: "bg-indigo-500" }
  ];

  const handleSave = (type: string, newList: string[]) => {
    setListsData(prev => ({
      ...prev,
      [type]: newList
    }));
    
    toast({
      title: "تم الحفظ بنجاح",
      description: `تم تحديث قائمة ${listTypes.find(t => t.key === type)?.label}`,
    });
  };

  const handleAddItem = (type: string) => {
    if (!newItem.trim()) return;
    
    const currentList = listsData[type as keyof ListsData];
    if (currentList.includes(newItem.trim())) {
      toast({
        title: "خطأ",
        description: "هذا العنصر موجود بالفعل في القائمة",
        variant: "destructive",
      });
      return;
    }
    
    const updatedList = [...currentList, newItem.trim()];
    handleSave(type, updatedList);
    setNewItem("");
  };

  const handleEditItem = (type: string, index: number, newValue: string) => {
    if (!newValue.trim()) return;
    
    const currentList = [...listsData[type as keyof ListsData]];
    currentList[index] = newValue.trim();
    handleSave(type, currentList);
    setEditingItem(null);
  };

  const handleDeleteItem = (type: string, index: number) => {
    const currentList = [...listsData[type as keyof ListsData]];
    currentList.splice(index, 1);
    handleSave(type, currentList);
    setShowDeleteDialog(null);
  };

  const renderDeleteDialog = () => (
    <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
      <AlertDialogContent className="glass-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            هل أنت متأكد من حذف "{showDeleteDialog?.value}"؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="glass-button">إلغاء</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => showDeleteDialog && handleDeleteItem(showDeleteDialog.type, showDeleteDialog.index)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="glass-container border-white/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Settings className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  إدارة قوائم الخيارات
                </CardTitle>
                <p className="text-white/70 mt-1">
                  إدارة وتحرير قوائم الخيارات المختلفة في النظام
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="manufacturers" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 glass-container border-white/20 mb-6">
                {listTypes.map((listType) => (
                  <TabsTrigger
                    key={listType.key}
                    value={listType.key}
                    className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                  >
                    <div className={`w-2 h-2 rounded-full ${listType.color} mr-2`}></div>
                    <span className="hidden sm:inline">{listType.label}</span>
                    <span className="sm:hidden">{listType.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {listTypes.map((listType) => (
                <TabsContent key={listType.key} value={listType.key} className="space-y-4">
                  {listType.key === "colorAssociations" ? (
                    <ColorAssociationManager 
                      manufacturers={listsData.manufacturers}
                      categories={["C-Class", "E-Class", "S-Class", "X3", "X5", "X7", "A4", "A6", "Q5"]}
                      trimLevels={["ستاندرد", "فل كامل", "AMG", "M Sport", "S-Line"]}
                      exteriorColors={listsData.exteriorColors}
                      interiorColors={listsData.interiorColors}
                    />
                  ) : (
                  <div className="space-y-4">
                    {/* Add new item section */}
                    <Card className="glass-container border-white/20">
                      <CardContent className="p-4">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`new-${listType.key}`} className="text-white font-medium mb-2 block">
                              إضافة عنصر جديد إلى {listType.label}
                            </Label>
                            <Input
                              id={`new-${listType.key}`}
                              value={newItem}
                              onChange={(e) => setNewItem(e.target.value)}
                              placeholder={`أدخل عنصر جديد...`}
                              className="glass-container border-white/20 text-white placeholder:text-white/50"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddItem(listType.key);
                                }
                              }}
                            />
                          </div>
                          <Button
                            onClick={() => handleAddItem(listType.key)}
                            className="mt-7 bg-green-600 hover:bg-green-700 text-white"
                            disabled={!newItem.trim()}
                          >
                            <Plus className="h-4 w-4 ml-1" />
                            إضافة
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Current items */}
                    <Card className="glass-container border-white/20">
                      <CardContent className="p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${listType.color}`}></div>
                          {listType.label} الحالية
                          <Badge variant="secondary" className="mr-auto bg-white/10 text-white">
                            {listsData[listType.key as keyof ListsData].length} عنصر
                          </Badge>
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {listsData[listType.key as keyof ListsData].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 glass-container border-white/20 rounded-lg"
                            >
                              {editingItem?.type === listType.key && editingItem?.index === index ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    value={editingItem.value}
                                    onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                                    className="flex-1 h-8 text-xs glass-container border-white/20 text-white"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleEditItem(listType.key, index, editingItem.value);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditItem(listType.key, index, editingItem.value)}
                                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingItem(null)}
                                    className="h-8 w-8 p-0 border-white/30 text-white hover:bg-white/10"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-white text-sm flex-1">{item}</span>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingItem({type: listType.key, index, value: item})}
                                      className="h-8 w-8 p-0 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setShowDeleteDialog({type: listType.key, index, value: item})}
                                      className="h-8 w-8 p-0 border-red-500/50 text-red-400 hover:bg-red-500/20"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {listsData[listType.key as keyof ListsData].length === 0 && (
                          <div className="text-center py-8 text-white/50">
                            لا توجد عناصر في هذه القائمة
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {renderDeleteDialog()}
    </div>
  );
}