import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Share2, Copy, Edit2, Save, X, Image, Link, Calculator } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InventoryItem } from "@shared/schema";

interface VehicleShareProps {
  vehicle: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Utility function to copy text to clipboard with fallback
const copyToClipboard = async (text: string): Promise<void> => {
  try {
    // First try the modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    
    // Fallback method using deprecated execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
    throw error;
  }
};

export default function VehicleShare({ vehicle, open, onOpenChange }: VehicleShareProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSpecificationForm, setShowSpecificationForm] = useState(false);
  const [specificationDescription, setSpecificationDescription] = useState(vehicle.detailedSpecifications || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [sharePrice, setSharePrice] = useState(vehicle.price || "");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [taxRate, setTaxRate] = useState("15"); // Default VAT rate 15%
  const [linkedImageUrl, setLinkedImageUrl] = useState<string>("");
  
  // Checkbox states for what to include in sharing
  const [includeFields, setIncludeFields] = useState({
    manufacturer: true,
    category: true,
    trimLevel: true,
    year: true,
    engineCapacity: true,
    exteriorColor: true,
    interiorColor: true,
    status: false, // Hide status by default
    price: true,
    specifications: true,
    images: true,
    linkedImage: true, // Include linked image from image management system
    imageLink: true, // Include image link if available
    mileage: true // Include mileage for used cars
  });

  // Fetch linked image for this vehicle
  const fetchLinkedImage = async () => {
    try {
      const response = await fetch('/api/image-links');
      if (response.ok) {
        const imageLinks = await response.json();
        
        // Find matching image link based on vehicle specifications
        const matchingImage = imageLinks.find((link: any) => 
          link.manufacturer === vehicle.manufacturer &&
          link.category === vehicle.category &&
          (link.trimLevel === vehicle.trimLevel || !link.trimLevel) &&
          link.year === vehicle.year &&
          (link.exteriorColor === vehicle.exteriorColor || !link.exteriorColor) &&
          (link.interiorColor === vehicle.interiorColor || !link.interiorColor) &&
          (link.engineCapacity === vehicle.engineCapacity || !link.engineCapacity)
        );
        
        if (matchingImage) {
          setLinkedImageUrl(matchingImage.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching linked image:', error);
    }
  };

  // Fetch linked image when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchLinkedImage();
    }
  }, [open, vehicle]);

  // Calculate tax breakdown
  const calculatePriceBreakdown = () => {
    if (!sharePrice) return null;
    
    const totalPriceWithTax = parseFloat(sharePrice.replace(/,/g, ''));
    const taxRateDecimal = parseFloat(taxRate) / 100;
    const basePriceBeforeTax = totalPriceWithTax / (1 + taxRateDecimal);
    const taxAmount = totalPriceWithTax - basePriceBeforeTax;
    
    return {
      basePrice: basePriceBeforeTax.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalPrice: totalPriceWithTax.toFixed(2)
    };
  };

  const updateSpecificationMutation = useMutation({
    mutationFn: (data: { detailedSpecifications: string }) => 
      apiRequest("PATCH", `/api/inventory/${vehicle.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowSpecificationForm(false);
      setIsUpdating(false);
      toast({
        title: "تم حفظ المواصفات بنجاح",
        description: "تم حفظ الوصف التفصيلي لهذه السيارة",
      });
    },
    onError: (error) => {
      console.error("Error updating specification:", error);
      setIsUpdating(false);
      toast({
        title: "خطأ في حفظ المواصفات",
        description: "حدث خطأ أثناء حفظ الوصف التفصيلي",
        variant: "destructive",
      });
    },
  });

  const handleSaveSpecification = () => {
    setIsUpdating(true);
    updateSpecificationMutation.mutate({
      detailedSpecifications: specificationDescription.trim(),
    });
  };

  const generateShareText = () => {
    let shareText = "";
    
    // Build text based on selected fields
    if (includeFields.manufacturer && includeFields.category) {
      shareText += `🚗 ${vehicle.manufacturer} ${vehicle.category}`;
    }
    
    if (includeFields.trimLevel && vehicle.trimLevel) {
      shareText += `\n🔧 درجة التجهيز: ${vehicle.trimLevel}`;
    }
    
    if (includeFields.year) {
      shareText += `\n📅 السنة: ${vehicle.year}`;
    }
    
    if (includeFields.engineCapacity) {
      shareText += `\n⚙️ سعة المحرك: ${vehicle.engineCapacity}`;
    }

    if (includeFields.exteriorColor && vehicle.exteriorColor) {
      shareText += `\n🎨 اللون الخارجي: ${vehicle.exteriorColor}`;
    }
    
    if (includeFields.interiorColor && vehicle.interiorColor) {
      shareText += `\n🪑 اللون الداخلي: ${vehicle.interiorColor}`;
    }

    if (includeFields.status) {
      shareText += `\n📊 الحالة: ${vehicle.status}`;
    }

    // Add detailed price breakdown if price is included
    if (includeFields.price && sharePrice) {
      const priceBreakdown = calculatePriceBreakdown();
      if (priceBreakdown) {
        shareText += `\n💰 تفاصيل السعر:`;
        shareText += `\n   📊 السعر الأساسي: ${Number(priceBreakdown.basePrice).toLocaleString()} ريال`;
        shareText += `\n   📈 الضريبة (${taxRate}%): ${Number(priceBreakdown.taxAmount).toLocaleString()} ريال`;
        shareText += `\n   💳 السعر الإجمالي: ${Number(priceBreakdown.totalPrice).toLocaleString()} ريال`;
      } else {
        shareText += `\n💰 السعر: ${sharePrice}`;
      }
    }

    // Add mileage for used cars if available and selected
    if (includeFields.mileage && (vehicle.importType === "شخصي مستعمل" || vehicle.importType === "مستعمل") && vehicle.mileage) {
      shareText += `\n🛣️ الممشي: ${vehicle.mileage.toLocaleString()} كيلومتر`;
    }

    // Add linked image URL if available and selected
    if (includeFields.linkedImage && linkedImageUrl) {
      shareText += `\n🖼️ رابط الصورة المرتبط: ${linkedImageUrl}`;
    }

    // Add image link for any vehicle with images if selected
    if (includeFields.imageLink && vehicle.images && vehicle.images.length > 0) {
      shareText += `\n📷 رابط الصورة: ${vehicle.images[0]}`;
    }

    // Add images info if available and selected
    if (includeFields.images && vehicle.images && vehicle.images.length > 0) {
      shareText += `\n📸 الصور المرفقة: ${vehicle.images.length} صورة`;
      // Include image URLs
      vehicle.images.forEach((imageUrl, index) => {
        shareText += `\n   📷 صورة ${index + 1}: ${imageUrl}`;
      });
    }

    // Add specifications if available and selected
    if (includeFields.specifications && vehicle.detailedSpecifications) {
      shareText += `\n\n📋 المواصفات التفصيلية:\n${vehicle.detailedSpecifications}`;
    }
    
    return shareText;
  };

  const handleCopyImageLinks = async () => {
    if (!vehicle.images || vehicle.images.length === 0) {
      toast({
        title: "لا توجد صور",
        description: "لا توجد صور مرفقة بهذه السيارة",
        variant: "destructive",
      });
      return;
    }

    const imageLinks = vehicle.images.join('\n');
    await copyToClipboard(imageLinks);
    toast({
      title: "تم نسخ روابط الصور",
      description: `تم نسخ ${vehicle.images.length} رابط صورة إلى الحافظة`,
    });
  };

  const handleCopyText = async () => {
    const shareText = generateShareText();
    try {
      await copyToClipboard(shareText);
      toast({
        title: "تم النسخ بنجاح",
        description: "تم نسخ بيانات السيارة إلى الحافظة",
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "لم تتمكن من نسخ النص إلى الحافظة",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vehicle.manufacturer} ${vehicle.category}`,
          text: shareText,
        });
      } catch (error) {
        // If share is cancelled or fails, fall back to copy
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Error sharing:", error);
          await handleCopyText();
        }
      }
    } else {
      await handleCopyText();
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
          <DialogDescription>
            اختر البيانات التي تريد مشاركتها وقم بنسخها أو مشاركتها مباشرة
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[75vh]">
          <div className="space-y-6 pr-4">
          
          {/* Fields Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Checkbox 
                  checked={Object.values(includeFields).every(Boolean)}
                  onCheckedChange={(checked) => {
                    setIncludeFields(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: !!checked }), {} as typeof prev));
                  }}
                  className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                />
                اختيار البيانات للمشاركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="manufacturer"
                    checked={includeFields.manufacturer && includeFields.category}
                    onCheckedChange={(checked) => {
                      setIncludeFields(prev => ({ ...prev, manufacturer: !!checked, category: !!checked }));
                    }}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="manufacturer" className="text-sm">الصانع والفئة</Label>
                  <span className="text-xs text-gray-500">({vehicle.manufacturer} {vehicle.category})</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="trimLevel"
                    checked={includeFields.trimLevel}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, trimLevel: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="trimLevel" className="text-sm">درجة التجهيز</Label>
                  <span className="text-xs text-gray-500">({vehicle.trimLevel || "غير محدد"})</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="year"
                    checked={includeFields.year}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, year: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="year" className="text-sm">السنة</Label>
                  <span className="text-xs text-gray-500">({vehicle.year})</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="engineCapacity"
                    checked={includeFields.engineCapacity}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, engineCapacity: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="engineCapacity" className="text-sm">سعة المحرك</Label>
                  <span className="text-xs text-gray-500">({vehicle.engineCapacity})</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="exteriorColor"
                    checked={includeFields.exteriorColor}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, exteriorColor: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="exteriorColor" className="text-sm">اللون الخارجي</Label>
                  <span className="text-xs text-gray-500">({vehicle.exteriorColor})</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="interiorColor"
                    checked={includeFields.interiorColor}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, interiorColor: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="interiorColor" className="text-sm">اللون الداخلي</Label>
                  <span className="text-xs text-gray-500">({vehicle.interiorColor})</span>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="specifications"
                    checked={includeFields.specifications}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, specifications: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="specifications" className="text-sm">المواصفات التفصيلية</Label>
                  <span className="text-xs text-gray-500">
                    ({vehicle.detailedSpecifications ? "متوفرة" : "غير متوفرة"})
                  </span>
                </div>
                
                {/* Linked Image from Image Management */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="linkedImage"
                    checked={includeFields.linkedImage}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, linkedImage: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Label htmlFor="linkedImage" className="text-sm">رابط الصورة المرتبط</Label>
                  <span className="text-xs text-gray-500">
                    ({linkedImageUrl ? "متوفر" : "غير متوفر"})
                  </span>
                  {linkedImageUrl && (
                    <Link size={12} className="text-blue-500" />
                  )}
                </div>

                {/* Image Link for any vehicle with images */}
                {(vehicle.images && vehicle.images.length > 0) && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="imageLink"
                      checked={includeFields.imageLink}
                      onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, imageLink: !!checked }))}
                      className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                    />
                    <Label htmlFor="imageLink" className="text-sm">رابط الصورة</Label>
                    <span className="text-xs text-gray-500">({vehicle.images.length} صورة)</span>
                  </div>
                )}

                {vehicle.images && vehicle.images.length > 0 && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="images"
                      checked={includeFields.images}
                      onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, images: !!checked }))}
                      className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                    />
                    <Label htmlFor="images" className="text-sm">الصور المرفقة</Label>
                    <span className="text-xs text-gray-500">({vehicle.images.length} صورة)</span>
                  </div>
                )}

                {/* Mileage for used cars */}
                {(vehicle.importType === "شخصي مستعمل" || vehicle.importType === "مستعمل") && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="mileage"
                      checked={includeFields.mileage}
                      onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, mileage: !!checked }))}
                      className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                    />
                    <Label htmlFor="mileage" className="text-sm">الممشي (كيلومتر)</Label>
                    <span className="text-xs text-gray-500">
                      ({vehicle.mileage ? `${vehicle.mileage} كم` : "غير محدد"})
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price Configuration Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Checkbox 
                    checked={includeFields.price}
                    onCheckedChange={(checked) => setIncludeFields(prev => ({ ...prev, price: !!checked }))}
                    className="data-[state=checked]:bg-[#C49632] data-[state=checked]:border-[#C49632]"
                  />
                  <Calculator className="h-5 w-5" />
                  تفاصيل السعر
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingPrice(!isEditingPrice)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {includeFields.price && (
                <>
                  {isEditingPrice ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">السعر الإجمالي (شامل الضريبة)</Label>
                        <Input
                          value={sharePrice}
                          onChange={(e) => setSharePrice(e.target.value)}
                          placeholder="أدخل السعر الإجمالي..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">معدل الضريبة (%)</Label>
                        <Input
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          placeholder="15"
                          className="mt-1"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setIsEditingPrice(false)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 ml-1" />
                        حفظ
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sharePrice && (() => {
                        const priceBreakdown = calculatePriceBreakdown();
                        return priceBreakdown ? (
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>السعر الأساسي:</span>
                              <span className="font-mono">{Number(priceBreakdown.basePrice).toLocaleString()} ريال</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>الضريبة ({taxRate}%):</span>
                              <span className="font-mono">{Number(priceBreakdown.taxAmount).toLocaleString()} ريال</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                              <span>السعر الإجمالي:</span>
                              <span className="font-mono">{Number(priceBreakdown.totalPrice).toLocaleString()} ريال</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-blue-600 font-medium">{sharePrice}</p>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
              {!includeFields.price && (
                <p className="text-gray-500 text-sm">السعر غير مُحدد للمشاركة</p>
              )}
            </CardContent>
          </Card>

          {/* Specifications Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">المواصفات التفصيلية</CardTitle>
                {!showSpecificationForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSpecificationForm(true)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    {vehicle.detailedSpecifications ? (
                      <>
                        <Edit2 className="h-4 w-4 ml-1" />
                        تعديل
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة الوصف
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!showSpecificationForm ? (
                <div className="space-y-3">
                  {vehicle.detailedSpecifications ? (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{vehicle.detailedSpecifications}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-slate-400 text-4xl mb-2">📋</div>
                      <p className="text-sm text-slate-600">لا توجد مواصفات مضافة لهذه السيارة</p>
                      <p className="text-xs text-slate-500 mt-1">يمكنك إضافة مواصفات مخصصة لهذه السيارة فقط</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specification">الوصف التفصيلي لهذه السيارة</Label>
                    <Textarea
                      id="specification"
                      placeholder="اكتب الوصف التفصيلي لهذه السيارة المحددة..."
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
                        setSpecificationDescription(vehicle.detailedSpecifications || "");
                      }}
                    >
                      <X className="h-4 w-4 ml-1" />
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleSaveSpecification}
                      disabled={isUpdating}
                      className="bg-[#BF9231] text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
                    >
                      <Save className="h-4 w-4 ml-1" />
                      {isUpdating ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                  </div>
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
              <div className="bg-slate-50 p-4 rounded-lg border-r-4 border-blue-500 min-h-[100px]">
                {generateShareText() ? (
                  <pre className="text-sm whitespace-pre-wrap font-sans">{generateShareText()}</pre>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    اختر البيانات التي تريد مشاركتها لرؤية المعاينة
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleShare}
                className="flex-1"
                disabled={!generateShareText()}
              >
                <Share2 className="h-4 w-4 ml-1" />
                مشاركة
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyText}
                className="flex-1"
                disabled={!generateShareText()}
              >
                <Copy className="h-4 w-4 ml-1" />
                نسخ النص
              </Button>
            </div>
            
            {/* Image sharing buttons */}
            <div className="space-y-2">
              {/* Linked Image Button - show if linked image is available */}
              {linkedImageUrl && includeFields.linkedImage && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await copyToClipboard(linkedImageUrl);
                      toast({
                        title: "تم نسخ رابط الصورة",
                        description: "تم نسخ رابط الصورة المرتبط إلى الحافظة",
                      });
                    } catch (error) {
                      toast({
                        title: "خطأ في النسخ",
                        description: "لم تتمكن من نسخ رابط الصورة",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full"
                >
                  <Link className="h-4 w-4 ml-1" />
                  نسخ رابط الصورة المرتبط
                </Button>
              )}
              
              {/* Regular images buttons - only show if images are selected and available */}
              {includeFields.images && vehicle.images && vehicle.images.length > 0 && (
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleCopyImageLinks}
                    className="flex-1"
                  >
                    <Link className="h-4 w-4 ml-1" />
                    نسخ روابط الصور المرفقة ({vehicle.images.length})
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const shareText = `${generateShareText()}\n\nالصور:\n${vehicle.images?.join('\n') || ''}`;
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
                    مشاركة مع الصور المرفقة
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}