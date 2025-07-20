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
import { Plus, Share2, Copy, Edit2, Save, X, Image, Link } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [sharePrice, setSharePrice] = useState(vehicle.price || "");
  const [isEditingPrice, setIsEditingPrice] = useState(false);

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
    let baseText = `🚗 ${vehicle.manufacturer} ${vehicle.category}
${vehicle.trimLevel ? `🔧 درجة التجهيز: ${vehicle.trimLevel}` : ""}
📅 السنة: ${vehicle.year}
⚙️ سعة المحرك: ${vehicle.engineCapacity}`;

    // Add colors
    if (vehicle.exteriorColor) {
      baseText += `\n🎨 اللون الخارجي: ${vehicle.exteriorColor}`;
    }
    if (vehicle.interiorColor) {
      baseText += `\n🪑 اللون الداخلي: ${vehicle.interiorColor}`;
    }

    // Add chassis number if available
    if (vehicle.chassisNumber) {
      baseText += `\n🔢 رقم الهيكل: ${vehicle.chassisNumber}`;
    }

    // Add price if available
    if (sharePrice) {
      baseText += `\n💰 السعر: ${sharePrice}`;
    }

    // Add images if available
    if (vehicle.images && vehicle.images.length > 0) {
      baseText += `\n📸 الصور المرفقة: ${vehicle.images.length} صورة`;
    }

    const detailedDescription = specification?.detailedDescription || "";
    
    return detailedDescription 
      ? `${baseText}\n\n📋 المواصفات التفصيلية:\n${detailedDescription}`
      : baseText;
  };

  const handleCopyImageLinks = () => {
    if (!vehicle.images || vehicle.images.length === 0) {
      toast({
        title: "لا توجد صور",
        description: "لا توجد صور مرفقة بهذه السيارة",
        variant: "destructive",
      });
      return;
    }

    const imageLinks = vehicle.images.join('\n');
    navigator.clipboard.writeText(imageLinks).then(() => {
      toast({
        title: "تم نسخ روابط الصور",
        description: `تم نسخ ${vehicle.images.length} رابط صورة إلى الحافظة`,
      });
    });
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
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            مشاركة السيارة
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[75vh]">
          <div className="space-y-6 pr-4">
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
                <div>
                  <Label className="text-sm font-medium text-slate-600">اللون الخارجي</Label>
                  <p className="text-sm">{vehicle.exteriorColor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">اللون الداخلي</Label>
                  <p className="text-sm">{vehicle.interiorColor}</p>
                </div>
              </div>
              
              {/* Editable Price Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-600">السعر للمشاركة</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingPrice(!isEditingPrice)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                {isEditingPrice ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={sharePrice}
                      onChange={(e) => setSharePrice(e.target.value)}
                      placeholder="أدخل السعر..."
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => setIsEditingPrice(false)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm mt-1 text-blue-600 font-medium">
                    {sharePrice || "لم يتم تحديد السعر"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Images Section */}
          {vehicle.images && vehicle.images.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    صور السيارة ({vehicle.images.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyImageLinks}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Link className="h-4 w-4 ml-1" />
                    نسخ روابط الصور
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {vehicle.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`صورة السيارة ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      {index === 3 && vehicle.images.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium">+{vehicle.images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {vehicle.images.length > 4 && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    إجمالي {vehicle.images.length} صورة
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
          <div className="space-y-3">
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
            
            {/* Image sharing buttons */}
            {vehicle.images && vehicle.images.length > 0 && (
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCopyImageLinks}
                  className="flex-1"
                >
                  <Link className="h-4 w-4 ml-1" />
                  نسخ روابط الصور
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const shareText = `${generateShareText()}\n\nالصور:\n${vehicle.images.join('\n')}`;
                    if (navigator.share) {
                      navigator.share({
                        title: `${vehicle.manufacturer} ${vehicle.category}`,
                        text: shareText,
                      }).catch(() => {
                        navigator.clipboard.writeText(shareText).then(() => {
                          toast({
                            title: "تم النسخ",
                            description: "تم نسخ النص مع روابط الصور",
                          });
                        });
                      });
                    } else {
                      navigator.clipboard.writeText(shareText).then(() => {
                        toast({
                          title: "تم النسخ",
                          description: "تم نسخ النص مع روابط الصور",
                        });
                      });
                    }
                  }}
                  className="flex-1"
                >
                  <Image className="h-4 w-4 ml-1" />
                  مشاركة مع الصور
                </Button>
              </div>
            )}
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}