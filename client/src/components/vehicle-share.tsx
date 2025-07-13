import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Share2, Copy, Edit2, Save, X } from "lucide-react";
import type { InventoryItem, Specification, InsertSpecification } from "@shared/schema";

interface VehicleShareProps {
  vehicle: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VehicleShare({ vehicle, open, onOpenChange }: VehicleShareProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSpecificationForm, setShowSpecificationForm] = useState(false);
  const [specificationDescription, setSpecificationDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Query for existing specification
  const { data: specification, isLoading } = useQuery<Specification>({
    queryKey: [`/api/specifications/${vehicle.manufacturer}/${vehicle.category}/${vehicle.trimLevel}/${vehicle.year}/${vehicle.engineCapacity}`],
    enabled: open,
  });

  const createSpecificationMutation = useMutation({
    mutationFn: (data: InsertSpecification) => apiRequest("POST", "/api/specifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/specifications/${vehicle.manufacturer}/${vehicle.category}/${vehicle.trimLevel}/${vehicle.year}/${vehicle.engineCapacity}`] 
      });
      setShowSpecificationForm(false);
      setSpecificationDescription("");
      toast({
        title: "تم إضافة المواصفات بنجاح",
        description: "تم إضافة الوصف التفصيلي للسيارة",
      });
    },
    onError: (error) => {
      console.error("Error creating specification:", error);
      toast({
        title: "خطأ في إضافة المواصفات",
        description: "حدث خطأ أثناء إضافة الوصف التفصيلي",
        variant: "destructive",
      });
    },
  });

  const handleCreateSpecification = () => {
    if (!specificationDescription.trim()) {
      toast({
        title: "يرجى إدخال الوصف التفصيلي",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    createSpecificationMutation.mutate({
      manufacturer: vehicle.manufacturer,
      category: vehicle.category,
      trimLevel: vehicle.trimLevel || "",
      year: vehicle.year,
      engineCapacity: vehicle.engineCapacity,
      detailedDescription: specificationDescription,
    });
  };

  const generateShareText = () => {
    const baseText = `🚗 ${vehicle.manufacturer} ${vehicle.category}
${vehicle.trimLevel ? `🔧 درجة التجهيز: ${vehicle.trimLevel}` : ""}
📅 السنة: ${vehicle.year}
⚙️ سعة المحرك: ${vehicle.engineCapacity}`;

    const detailedDescription = specification?.detailedDescription || "";
    
    return detailedDescription 
      ? `${baseText}\n\n📋 المواصفات التفصيلية:\n${detailedDescription}`
      : baseText;
  };

  const handleCopyText = () => {
    const shareText = generateShareText();
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "تم النسخ بنجاح",
        description: "تم نسخ بيانات السيارة إلى الحافظة",
      });
    });
  };

  const handleShare = () => {
    const shareText = generateShareText();
    
    if (navigator.share) {
      navigator.share({
        title: `${vehicle.manufacturer} ${vehicle.category}`,
        text: shareText,
      }).catch((error) => {
        console.error("Error sharing:", error);
        handleCopyText();
      });
    } else {
      handleCopyText();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            مشاركة السيارة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{vehicle.manufacturer} {vehicle.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">درجة التجهيز</Label>
                  <p className="text-sm">{vehicle.trimLevel || "غير محدد"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">السنة</Label>
                  <p className="text-sm font-latin">{vehicle.year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">سعة المحرك</Label>
                  <p className="text-sm font-latin">{vehicle.engineCapacity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">الحالة</Label>
                  <Badge variant="secondary">{vehicle.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">المواصفات التفصيلية</CardTitle>
                {!specification && !showSpecificationForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSpecificationForm(true)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة الوصف
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-600 mt-2">جاري التحميل...</p>
                </div>
              ) : specification ? (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{specification.detailedDescription}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>تم الإنشاء: {new Date(specification.createdAt).toLocaleDateString('ar-SA')}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSpecificationForm(true)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : showSpecificationForm ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specification">الوصف التفصيلي</Label>
                    <Textarea
                      id="specification"
                      placeholder="اكتب الوصف التفصيلي للسيارة..."
                      value={specificationDescription}
                      onChange={(e) => setSpecificationDescription(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSpecificationForm(false);
                        setSpecificationDescription("");
                      }}
                    >
                      <X className="h-4 w-4 ml-1" />
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleCreateSpecification}
                      disabled={isCreating || !specificationDescription.trim()}
                    >
                      <Save className="h-4 w-4 ml-1" />
                      {isCreating ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-slate-400 text-4xl mb-2">📋</div>
                  <p className="text-sm text-slate-600">لا توجد مواصفات مضافة لهذه السيارة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معاينة المشاركة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-lg border-r-4 border-blue-500">
                <pre className="text-sm whitespace-pre-wrap font-sans">{generateShareText()}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 ml-1" />
              مشاركة
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyText}
              className="flex-1"
            >
              <Copy className="h-4 w-4 ml-1" />
              نسخ النص
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}