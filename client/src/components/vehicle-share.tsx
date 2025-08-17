import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Plus, Share2, Copy, Edit2, Save, X, Image, Link, Calculator, MessageCircle, Settings, Car, Gauge, Fuel, Palette, FileText, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InventoryItem, VehicleSpecification, VehicleImageLink } from "@shared/schema";

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
  
  const [sharePrice, setSharePrice] = useState(vehicle.price || "");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [taxRate, setTaxRate] = useState("15"); // Default VAT rate 15%
  const [linkedImageUrl, setLinkedImageUrl] = useState<string>("");
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState("");
  const [hierarchySpecifications, setHierarchySpecifications] = useState<VehicleSpecification[]>([]);
  const [hierarchyImageLinks, setHierarchyImageLinks] = useState<VehicleImageLink[]>([]);
  const [selectedHierarchySpec, setSelectedHierarchySpec] = useState<VehicleSpecification | null>(null);
  const [selectedHierarchyImages, setSelectedHierarchyImages] = useState<VehicleImageLink[]>([]);
  
  // Checkbox states for what to include in sharing
  const [includeFields, setIncludeFields] = useState({
    manufacturer: true,
    category: true,
    trimLevel: true,
    year: true,
    engineCapacity: true,
    exteriorColor: true,
    interiorColor: true,
    status: false, // Hide status by default as requested
    price: true,
    specifications: true,
    images: true,
    linkedImage: true, // Include linked image from image management system
    imageLink: true, // Include image link if available
    mileage: false // Include mileage only when shown (for used cars)
  });

  // Fetch hierarchy management data for this vehicle
  const fetchHierarchyData = async () => {
    try {
      // Fetch specifications from specifications-management page
      const specsResponse = await fetch('/api/vehicle-specifications');
      if (specsResponse.ok) {
        const allSpecifications = await specsResponse.json();
        
        // Filter specifications based on vehicle data or chassis number
        const matchingSpecs = allSpecifications.filter((spec: VehicleSpecification) => {
          // First try to match by chassis number if available
          if (vehicle.chassisNumber && spec.chassisNumber === vehicle.chassisNumber) {
            return true;
          }
          
          // Otherwise match by vehicle details
          return spec.manufacturer === vehicle.manufacturer &&
                 spec.category === vehicle.category &&
                 (!spec.trimLevel || spec.trimLevel === vehicle.trimLevel) &&
                 (!spec.year || spec.year === vehicle.year);
        });
        
        setHierarchySpecifications(matchingSpecs);
        
        // Auto-select the best matching specification
        if (matchingSpecs.length > 0) {
          // Prefer chassis number match first
          const chassisMatch = matchingSpecs.find((spec: VehicleSpecification) => 
            vehicle.chassisNumber && spec.chassisNumber === vehicle.chassisNumber
          );
          
          // Then prefer exact trim and year match
          const exactMatch = matchingSpecs.find((spec: VehicleSpecification) => 
            spec.year === vehicle.year && spec.trimLevel === vehicle.trimLevel
          );
          
          setSelectedHierarchySpec(chassisMatch || exactMatch || matchingSpecs[0]);
        }
      }

      // Fetch image links from specifications-management page
      const imageResponse = await fetch('/api/vehicle-image-links');
      if (imageResponse.ok) {
        const allImageLinks = await imageResponse.json();
        
        // Filter image links based on vehicle data or chassis number
        const matchingImages = allImageLinks.filter((link: VehicleImageLink) => {
          // First try to match by chassis number if available
          if (vehicle.chassisNumber && link.chassisNumber === vehicle.chassisNumber) {
            return true;
          }
          
          // Otherwise match by vehicle details
          return link.manufacturer === vehicle.manufacturer &&
                 link.category === vehicle.category &&
                 (!link.trimLevel || link.trimLevel === vehicle.trimLevel) &&
                 (!link.exteriorColor || link.exteriorColor === vehicle.exteriorColor) &&
                 (!link.interiorColor || link.interiorColor === vehicle.interiorColor);
        });
        
        setHierarchyImageLinks(allImageLinks);
        setSelectedHierarchyImages(matchingImages);
        
        // Set the first linked image URL if available
        if (matchingImages.length > 0 && matchingImages[0].imageUrl) {
          setLinkedImageUrl(matchingImages[0].imageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching hierarchy data:', error);
    }
  };

  // Fetch hierarchy data when dialog opens and set mileage checkbox for used cars
  useEffect(() => {
    if (open) {
      fetchHierarchyData();
      // Enable mileage checkbox by default for used cars when dialog opens
      if (vehicle.importType === "شخصي مستعمل" || vehicle.importType === "مستعمل") {
        setIncludeFields(prev => ({ ...prev, mileage: true }));
      }
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

  

  const generateShareText = () => {
    let shareText = "";
    
    // Build text based on selected fields
    if (includeFields.manufacturer && includeFields.category) {
      shareText += `🚗 ${vehicle.manufacturer} ${vehicle.category}`;
    }
    
    if (includeFields.trimLevel && vehicle.trimLevel) {
      shareText += `\n⚙️ درجة التجهيز: ${vehicle.trimLevel}`;
    }
    
    if (includeFields.year) {
      shareText += `\n📅 السنة: ${vehicle.year}`;
    }
    
    if (includeFields.engineCapacity) {
      shareText += `\n🔧 سعة المحرك: ${vehicle.engineCapacity}`;
    }

    if (includeFields.exteriorColor && vehicle.exteriorColor) {
      shareText += `\n🎨 اللون الخارجي: ${vehicle.exteriorColor}`;
    }
    
    if (includeFields.interiorColor && vehicle.interiorColor) {
      shareText += `\n🪑 اللون الداخلي: ${vehicle.interiorColor}`;
    }

    if (includeFields.status) {
      shareText += `\n✅ الحالة: ${vehicle.status}`;
    }

    // Add price - with or without tax breakdown based on import type
    if (includeFields.price && sharePrice) {
      // For used cars, show simple price without tax breakdown
      if (vehicle.importType === "مستعمل" || vehicle.importType === "مستعمل شخصي") {
        shareText += `\n💰 السعر: ${sharePrice}`;
      } else {
        // For new cars, show detailed price breakdown
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

    // Add hierarchy specifications if available and selected
    if (includeFields.specifications) {
      if (selectedHierarchySpec && selectedHierarchySpec.specifications) {
        shareText += `\n\n📋 المواصفات التفصيلية:`;
        const specs = selectedHierarchySpec.specifications as any;
        
        // Handle different specification formats
        if (typeof specs === 'string') {
          shareText += `\n${specs}`;
        } else if (typeof specs === 'object') {
          // Handle object-based specifications
          if (specs.engine) shareText += `\n🔧 المحرك: ${specs.engine}`;
          if (specs.power) shareText += `\n⚡ القوة: ${specs.power}`;
          if (specs.transmission) shareText += `\n⚙️ ناقل الحركة: ${specs.transmission}`;
          if (specs.fuelType) shareText += `\n⛽ نوع الوقود: ${specs.fuelType}`;
          if (specs.seatingCapacity) shareText += `\n👥 عدد المقاعد: ${specs.seatingCapacity}`;
          if (specs.driveType) shareText += `\n🚗 نوع الدفع: ${specs.driveType}`;
          if (specs.acceleration) shareText += `\n🏃 التسارع: ${specs.acceleration}`;
          if (specs.topSpeed) shareText += `\n🏎️ السرعة القصوى: ${specs.topSpeed}`;
          if (specs.fuelConsumption) shareText += `\n💨 استهلاك الوقود: ${specs.fuelConsumption}`;
          if (specs.safetyRating) shareText += `\n🛡️ تقييم الأمان: ${specs.safetyRating}`;
          if (specs.warranty) shareText += `\n📝 الضمان: ${specs.warranty}`;
          if (specs.features) shareText += `\n✨ المزايا: ${specs.features}`;
          if (specs.technology) shareText += `\n📱 التقنيات: ${specs.technology}`;
          if (specs.comfort) shareText += `\n🛋️ وسائل الراحة: ${specs.comfort}`;
          if (specs.entertainment) shareText += `\n🎵 الترفيه: ${specs.entertainment}`;
        }
      } else if (vehicle.detailedSpecifications) {
        // Fallback to vehicle's own detailed specifications if no hierarchy specs
        shareText += `\n\n📋 المواصفات التفصيلية:\n${vehicle.detailedSpecifications}`;
      }
    }

    // Add hierarchy image links if available and selected
    if (includeFields.linkedImage && selectedHierarchyImages.length > 0) {
      shareText += `\n\n🖼️ روابط الصور من إدارة المواصفات:`;
      selectedHierarchyImages.forEach((imageLink, index) => {
        if (imageLink.imageUrl) {
          shareText += `\n📸 صورة ${index + 1} (${imageLink.exteriorColor} - ${imageLink.interiorColor}): ${imageLink.imageUrl}`;
        }
      });
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

  const handleWhatsAppShare = () => {
    if (!whatsappPhoneNumber.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف",
        variant: "destructive"
      });
      return;
    }

    const shareText = generateShareText();
    const formattedPhone = whatsappPhoneNumber.startsWith('+966') 
      ? whatsappPhoneNumber 
      : `+966${whatsappPhoneNumber.replace(/^0/, '')}`;
    const whatsappUrl = `https://wa.me/${formattedPhone.replace(/\+/g, '')}?text=${encodeURIComponent(shareText)}`;
    
    window.open(whatsappUrl, '_blank');
    setWhatsappPhoneNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" style={{color: '#C49632'}} />
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
                <Settings className="h-5 w-5" style={{color: '#C49632'}} />
                اختيار البيانات للمشاركة
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
                  <Calculator className="h-5 w-5" style={{color: '#C49632'}} />
                  تفاصيل السعر
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingPrice(!isEditingPrice)}
                  className="hover:bg-orange-50"
                  style={{color: '#C49632'}}
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
                        style={{backgroundColor: '#C49632', borderColor: '#C49632'}}
                        className="hover:opacity-90"
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

          {/* المواصفات وروابط الصور من صفحة إدارة المواصفات */}
          {(hierarchySpecifications.length > 0 || selectedHierarchyImages.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{color: '#C49632'}} />
                  المواصفات وروابط الصور المحفوظة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* عرض المواصفات التفصيلية المتاحة */}
                {hierarchySpecifications.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">المواصفات التفصيلية المحفوظة ({hierarchySpecifications.length})</Label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                      {hierarchySpecifications.map((spec) => (
                        <div 
                          key={spec.id} 
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedHierarchySpec?.id === spec.id 
                              ? 'border-[#C49632] bg-yellow-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedHierarchySpec(spec)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">
                                {spec.manufacturer} {spec.category} - {spec.year} {spec.trimLevel}
                              </p>
                              {spec.chassisNumber && (
                                <p className="text-xs text-gray-500">رقم الهيكل: {spec.chassisNumber}</p>
                              )}
                              {spec.specifications && typeof spec.specifications === 'object' && (spec.specifications as any).engine && (
                                <p className="text-xs text-gray-600">المحرك: {(spec.specifications as any).engine}</p>
                              )}
                            </div>
                            {selectedHierarchySpec?.id === spec.id && (
                              <div className="w-2 h-2 bg-[#C49632] rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedHierarchyImages.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">روابط الصور المطابقة ({selectedHierarchyImages.length})</Label>
                    <div className="mt-2 space-y-2">
                      {selectedHierarchyImages.map((imageLink) => (
                        <div key={imageLink.id} className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{imageLink.exteriorColor} - {imageLink.interiorColor}</p>
                              <p className="text-xs text-gray-600">رابط صورة متاح</p>
                              {imageLink.chassisNumber && (
                                <p className="text-xs text-gray-500">رقم الهيكل: {imageLink.chassisNumber}</p>
                              )}
                            </div>
                            <Image className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          

          {/* Share Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" style={{color: '#C49632'}} />
                معاينة المشاركة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-lg border-r-4 min-h-[100px]" style={{borderRightColor: '#C49632'}}>
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
                style={{backgroundColor: '#C49632', borderColor: '#C49632'}}
              >
                <Car className="h-4 w-4 ml-1" />
                مشاركة
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyText}
                className="flex-1"
                disabled={!generateShareText()}
                style={{borderColor: '#C49632', color: '#C49632'}}
              >
                <Copy className="h-4 w-4 ml-1" />
                نسخ النص
              </Button>
            </div>

            {/* WhatsApp Share Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" style={{color: '#C49632'}} />
                  مشاركة عبر الواتساب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="5xxxxxxxx"
                      value={whatsappPhoneNumber}
                      onChange={(e) => setWhatsappPhoneNumber(e.target.value)}
                      className="flex-1"
                      dir="ltr"
                      disabled={!generateShareText()}
                    />
                    <Button
                      onClick={handleWhatsAppShare}
                      className="px-4"
                      disabled={!generateShareText() || !whatsappPhoneNumber.trim()}
                      style={{backgroundColor: '#C49632', borderColor: '#C49632'}}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    أدخل رقم الهاتف بدون +966 (مثال: 512345678)
                  </p>
                </div>
              </CardContent>
            </Card>
            
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
                  style={{backgroundColor: '#C49632', borderColor: '#C49632', color: 'white'}}
                >
                  <ExternalLink className="h-4 w-4 ml-1" />
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
                    style={{backgroundColor: '#C49632', borderColor: '#C49632', color: 'white'}}
                  >
                    <ExternalLink className="h-4 w-4 ml-1" />
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