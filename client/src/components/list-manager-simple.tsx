import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Check, X, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface ListManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listsData: {
    manufacturers: string[];
    engineCapacities: string[];
    statuses: string[];
    importTypes: string[];
    locations: string[];
    exteriorColors: string[];
    interiorColors: string[];
  };
  onSave: (type: string, newList: string[]) => void;
}

export default function ListManagerSimple({ open, onOpenChange, listsData, onSave }: ListManagerProps) {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<{type: string, index: number, value: string} | null>(null);
  const [newItem, setNewItem] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<{type: string, index: number, value: string} | null>(null);
  
  // Drag functionality
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;
    
    setIsDragging(true);
    const rect = dialogRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dialogRef.current) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setDialogPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const listConfigs = [
    { key: "manufacturers", label: "الشركات المصنعة", color: "bg-blue-500/20 text-blue-200 border-blue-400/30" },
    { key: "engineCapacities", label: "سعات المحرك", color: "bg-green-500/20 text-green-200 border-green-400/30" },
    { key: "statuses", label: "حالات المركبة", color: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30" },
    { key: "importTypes", label: "أنواع الاستيراد", color: "bg-purple-500/20 text-purple-200 border-purple-400/30" },
    { key: "locations", label: "المواقع", color: "bg-orange-500/20 text-orange-200 border-orange-400/30" },
    { key: "exteriorColors", label: "الألوان الخارجية", color: "bg-red-500/20 text-red-200 border-red-400/30" },
    { key: "interiorColors", label: "الألوان الداخلية", color: "bg-pink-500/20 text-pink-200 border-pink-400/30" }
  ];

  const handleAddItem = (type: string) => {
    if (!newItem.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال قيمة صحيحة",
        variant: "destructive",
      });
      return;
    }

    const currentList = (listsData[type as keyof typeof listsData] || []) as string[];
    if (currentList.includes(newItem.trim())) {
      toast({
        title: "خطأ",
        description: "هذا العنصر موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    const newList = [...currentList, newItem.trim()];
    onSave(type, newList);
    setNewItem("");
    toast({
      title: "تم بنجاح",
      description: "تم إضافة العنصر الجديد",
    });
  };

  const handleEditItem = (type: string, index: number, newValue: string) => {
    if (!newValue.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال قيمة صحيحة",
        variant: "destructive",
      });
      return;
    }

    const currentList = (listsData[type as keyof typeof listsData] || []) as string[];
    if (currentList.includes(newValue.trim()) && currentList[index] !== newValue.trim()) {
      toast({
        title: "خطأ",
        description: "هذا العنصر موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    const newList = [...currentList];
    newList[index] = newValue.trim();
    onSave(type, newList);
    setEditingItem(null);
    toast({
      title: "تم بنجاح",
      description: "تم تحديث العنصر",
    });
  };

  const handleDeleteItem = () => {
    if (!showDeleteDialog) return;
    
    const { type, index } = showDeleteDialog;
    const currentList = (listsData[type as keyof typeof listsData] || []) as string[];
    const newList = currentList.filter((_, i) => i !== index);
    onSave(type, newList);
    setShowDeleteDialog(null);
    toast({
      title: "تم بنجاح",
      description: "تم حذف العنصر",
    });
  };

  const renderListItems = (type: string, items: string[], color: string) => (
    <div className="space-y-3">
      {/* إضافة عنصر جديد */}
      <div className="glass-container p-4 rounded-xl border border-white/20">
        <div className="flex gap-2">
          <Input
            placeholder="إضافة عنصر جديد..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem(type)}
            className="flex-1 bg-white/10 text-white placeholder-white/60 border-white/20 focus:border-white/40"
          />
          <Button 
            onClick={() => handleAddItem(type)} 
            size="sm"
            className="glass-button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* قائمة العناصر */}
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none">
        {items.map((item, index) => (
          <div key={index} className="glass-container p-3 rounded-lg border border-white/20 backdrop-blur-sm">
            {editingItem?.type === type && editingItem?.index === index ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editingItem.value}
                  onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditItem(type, index, editingItem.value);
                    }
                  }}
                  className="flex-1 bg-white/10 text-white border-white/20 focus:border-white/40"
                  autoFocus
                />
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleEditItem(type, index, editingItem.value)}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setEditingItem(null)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`${color} border backdrop-blur-sm`}>
                  {item}
                </Badge>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setEditingItem({type, index, value: item})}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowDeleteDialog({type, index, value: item})}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="glass-container p-4 rounded-lg border border-white/20 text-center">
            <p className="text-white/60">لا توجد عناصر</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          ref={dialogRef}
          className="max-w-5xl max-h-[90vh] overflow-hidden glass-dialog mx-auto"
          style={{
            transform: `translate(${dialogPosition.x}px, ${dialogPosition.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          <DialogHeader>
            <div 
              className="flex items-center justify-center gap-2 cursor-grab active:cursor-grabbing py-2 px-4 -mx-4 -mt-2 mb-2 hover:bg-white/5 rounded-t-lg"
              onMouseDown={handleMouseDown}
            >
              <Move className="h-4 w-4 text-white/60" />
              <DialogTitle className="text-xl font-bold text-white text-center">
                إدارة قوائم الخيارات
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/70 text-center">
              إدارة وتحرير قوائم الخيارات المختلفة في النظام
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="manufacturers" className="w-full">
            <TabsList className="glass-container grid w-full grid-cols-7 p-1 border border-white/20">
              {listConfigs.map((config) => (
                <TabsTrigger 
                  key={config.key} 
                  value={config.key}
                  className="text-xs text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20 data-[state=active]:shadow-none"
                >
                  {config.label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {listConfigs.map((config) => (
              <TabsContent key={config.key} value={config.key} className="mt-4">
                <div className="space-y-4">
                  <div className="glass-container p-4 rounded-xl border border-white/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-white">{config.label}</Label>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                        {((listsData[config.key as keyof typeof listsData] || []) as string[]).length} عنصر
                      </Badge>
                    </div>
                  </div>
                  {renderListItems(
                    config.key, 
                    (listsData[config.key as keyof typeof listsData] || []) as string[], 
                    config.color
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent className="glass-dialog-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              هل أنت متأكد من حذف "{showDeleteDialog?.value}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem}
              className="glass-button bg-red-500/20 text-red-200 border-red-400/30 hover:bg-red-500/30"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}