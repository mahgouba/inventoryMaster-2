import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { InventoryItem } from "@shared/schema";

interface VehicleShareProps {
  vehicle: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VehicleShare({ vehicle, open, onOpenChange }: VehicleShareProps) {
  const [copied, setCopied] = useState(false);

  // Get specifications for this vehicle
  const { data: specifications = [] } = useQuery({
    queryKey: ['/api/specifications/vehicle', vehicle.manufacturer, vehicle.category],
    enabled: open && !!vehicle.manufacturer && !!vehicle.category
  });

  // Get the most relevant specification (first one that matches)
  const relevantSpec = specifications.find((spec: any) => 
    spec.manufacturer === vehicle.manufacturer && 
    spec.category === vehicle.category
  );

  const generateShareText = () => {
    const lines = [
      `🚗 ${vehicle.manufacturer} ${vehicle.category}`,
      `📅 الموديل: ${vehicle.year}`,
      `🎨 اللون الخارجي: ${vehicle.exteriorColor}`,
      `🪑 اللون الداخلي: ${vehicle.interiorColor}`,
      `⚙️ سعة المحرك: ${vehicle.engineCapacity}`,
      `📋 الحالة: ${vehicle.status}`,
      `📦 نوع الاستيراد: ${vehicle.importType}`,
      `📍 الموقع: ${vehicle.location}`,
      `🔢 رقم الهيكل: ${vehicle.chassisNumber}`,
    ];

    if (relevantSpec?.trimLevel) {
      lines.push(`✨ درجة التجهيز: ${relevantSpec.trimLevel}`);
    }

    if (relevantSpec?.detailedSpecs) {
      lines.push('');
      lines.push('📝 المواصفات التفصيلية:');
      lines.push(relevantSpec.detailedSpecs);
    }

    if (vehicle.notes) {
      lines.push('');
      lines.push('💬 ملاحظات:');
      lines.push(vehicle.notes);
    }

    return lines.join('\n');
  };

  const shareText = generateShareText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ بيانات المركبة إلى الحافظة"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "لم يتم نسخ البيانات. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vehicle.manufacturer} ${vehicle.category} - ${vehicle.year}`,
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            مشاركة بيانات المركبة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {vehicle.manufacturer} {vehicle.category}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">موديل {vehicle.year}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-700 dark:text-gray-300">اللون الخارجي</div>
                  <div className="text-gray-600 dark:text-gray-400">{vehicle.exteriorColor}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-700 dark:text-gray-300">اللون الداخلي</div>
                  <div className="text-gray-600 dark:text-gray-400">{vehicle.interiorColor}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-700 dark:text-gray-300">سعة المحرك</div>
                  <div className="text-gray-600 dark:text-gray-400">{vehicle.engineCapacity}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-gray-700 dark:text-gray-300">الحالة</div>
                  <div className="text-gray-600 dark:text-gray-400">{vehicle.status}</div>
                </div>
              </div>

              {relevantSpec && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                    درجة التجهيز: {relevantSpec.trimLevel}
                  </div>
                  {relevantSpec.detailedSpecs && (
                    <div className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-wrap">
                      {relevantSpec.detailedSpecs}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Text Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نص المشاركة:
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans">
                    {shareText}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Share2 className="h-4 w-4 ml-2" />
                  مشاركة
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4 ml-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 ml-2" />
                  )}
                  {copied ? "تم النسخ!" : "نسخ"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}