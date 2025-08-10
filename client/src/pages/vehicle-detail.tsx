import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Calendar, 
  ShoppingCart, 
  Share2, 
  X, 
  ArrowLeft,
  Receipt,
  Home
} from "lucide-react";
import { ManufacturerLogo } from "@/components/manufacturer-logo";
import { ReservationDialog } from "@/components/reservation-dialog";
import { EnhancedSaleDialog } from "@/components/enhanced-sale-dialog";
import VehicleShare from "@/components/vehicle-share";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { InventoryItem } from "@shared/schema";

interface VehicleDetailPageProps {
  userRole: string;
  username: string;
  onLogout: () => void;
}

export default function VehicleDetailPage({ userRole, username, onLogout }: VehicleDetailPageProps) {
  const [match, params] = useRoute("/vehicles/:id");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sellingItemId, setSellingItemId] = useState<number | null>(null);
  const [cancelingReservationId, setCancelingReservationId] = useState<number | null>(null);

  const vehicleId = params?.id ? parseInt(params.id) : null;

  // Fetch vehicle data
  const { data: vehicle, isLoading, error } = useQuery<InventoryItem>({
    queryKey: [`/api/inventory/${vehicleId}`],
    enabled: !!vehicleId,
  });

  // Reserve mutation  
  const reserveMutation = useMutation({
    mutationFn: async (vehicleData: InventoryItem) => {
      return apiRequest("POST", "/api/reservations", {
        body: JSON.stringify({
          inventoryItemId: vehicleData.id,
          manufacturer: vehicleData.manufacturer,
          category: vehicleData.category,
          year: vehicleData.year,
          exteriorColor: vehicleData.exteriorColor,
          price: vehicleData.price,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الحجز بنجاح",
        description: "تم حجز المركبة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/${vehicleId}`] });
      setReserveDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "خطأ في الحجز",
        description: "حدث خطأ أثناء حجز المركبة",
        variant: "destructive",
      });
    }
  });

  // Cancel reservation mutation
  const cancelReservationMutation = useMutation({
    mutationFn: async (itemId: number) => {
      setCancelingReservationId(itemId);
      return apiRequest("DELETE", `/api/reservations/item/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء حجز المركبة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/${vehicleId}`] });
      setCancelingReservationId(null);
    },
    onError: () => {
      toast({
        title: "خطأ في إلغاء الحجز",
        description: "حدث خطأ أثناء إلغاء حجز المركبة",
        variant: "destructive",
      });
      setCancelingReservationId(null);
    }
  });

  // Sell mutation
  const sellMutation = useMutation({
    mutationFn: async (saleData: any) => {
      if (vehicle) setSellingItemId(vehicle.id);
      return apiRequest("POST", "/api/sold-vehicles", {
        body: JSON.stringify(saleData),
      });
    },
    onSuccess: () => {
      toast({
        title: "تم البيع بنجاح",
        description: "تم بيع المركبة وتحديث المخزون",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/${vehicleId}`] });
      setSellingItemId(null);
      setSellDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "خطأ في البيع",
        description: "حدث خطأ أثناء بيع المركبة",
        variant: "destructive",
      });
      setSellingItemId(null);
    }
  });

  const handleReserve = () => {
    if (vehicle) {
      reserveMutation.mutate(vehicle);
    }
  };

  const handleCancelReservation = () => {
    if (vehicle) {
      cancelReservationMutation.mutate(vehicle.id);
    }
  };

  const handleSell = (saleData: any) => {
    sellMutation.mutate(saleData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات المركبة...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">المركبة غير موجودة</h1>
          <p className="text-gray-600 dark:text-gray-400">لم يتم العثور على المركبة المطلوبة</p>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/card-view">
            <Button variant="outline" className="glass-button glass-text-primary">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">تفاصيل المركبة</h1>
          <div></div>
        </div>

        {/* Vehicle Card */}
        <Card className="glass-morphism border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <ManufacturerLogo
                manufacturerName={vehicle.manufacturer}
                size="md"
                className="w-12 h-12"
              />
              <div>
                <div className="text-xl font-bold">
                  {vehicle.manufacturer} {vehicle.category}
                </div>
                <div className="text-sm text-gray-300">
                  {vehicle.year} • {vehicle.trimLevel}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Images */}
            {vehicle.images && vehicle.images.length > 0 && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                <img
                  src={vehicle.images[0]}
                  alt={`${vehicle.manufacturer} ${vehicle.category}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Vehicle Specifications */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">المواصفات الأساسية</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">الصانع:</span>
                    <span className="text-white font-medium">{vehicle.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">الفئة:</span>
                    <span className="text-white font-medium">{vehicle.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">السنة:</span>
                    <span className="text-white font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">درجة التجهيز:</span>
                    <span className="text-white font-medium">{vehicle.trimLevel}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">التفاصيل الإضافية</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">اللون الخارجي:</span>
                    <span className="text-white font-medium">{vehicle.exteriorColor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">اللون الداخلي:</span>
                    <span className="text-white font-medium">{vehicle.interiorColor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">الحالة:</span>
                    <Badge 
                      variant={
                        vehicle.status === 'متوفر' ? 'default' : 
                        vehicle.status === 'محجوز' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                  {vehicle.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">السعر:</span>
                      <span className="text-2xl font-bold text-green-400">
                        {vehicle.price.toLocaleString()} ر.س
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
              {/* Reserve/Cancel Reservation Button */}
              {vehicle.status === "محجوز" ? (
                <Button
                  onClick={handleCancelReservation}
                  disabled={cancelingReservationId === vehicle.id}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-lg py-3"
                >
                  <X className="w-5 h-5 ml-2" />
                  {cancelingReservationId === vehicle.id ? "جاري الإلغاء..." : "إلغاء الحجز"}
                </Button>
              ) : (
                <Button
                  onClick={() => setReserveDialogOpen(true)}
                  disabled={vehicle.status === "محجوز" || vehicle.status === "مباع"}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
                >
                  <Calendar className="w-5 h-5 ml-2" />
                  حجز
                </Button>
              )}

              {/* Sell Button */}
              <Button
                onClick={() => setSellDialogOpen(true)}
                disabled={sellingItemId === vehicle.id || vehicle.status === "مباع"}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-3"
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                {sellingItemId === vehicle.id ? "جاري البيع..." : "بيع"}
              </Button>

              {/* Share Button */}
              <Button
                onClick={() => setShareDialogOpen(true)}
                className="flex-1 text-lg py-3"
                style={{backgroundColor: '#BF9231', color: 'white'}}
              >
                <Share2 className="w-5 h-5 ml-2" />
                مشاركة
              </Button>
            </div>

            {/* Price Card Button */}
            <Button
              onClick={() => {
                localStorage.setItem('selectedVehicleForPriceCard', JSON.stringify(vehicle));
                window.location.href = '/price-cards';
              }}
              variant="outline"
              className="w-full glass-button glass-text-primary text-lg py-3"
            >
              <Receipt className="w-5 h-5 ml-2" />
              إنشاء بطاقة سعر
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reserve Dialog */}
      {vehicle && (
        <ReservationDialog
          open={reserveDialogOpen}
          onOpenChange={setReserveDialogOpen}
          item={vehicle}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: [`/api/inventory/${vehicleId}`] });
          }}
        />
      )}

      {/* Sell Dialog */}
      {vehicle && (
        <EnhancedSaleDialog
          isOpen={sellDialogOpen}
          onClose={() => setSellDialogOpen(false)}
          onConfirm={handleSell}
          vehicleData={{
            id: vehicle.id,
            manufacturer: vehicle.manufacturer,
            category: vehicle.category,
            year: vehicle.year,
            chassisNumber: vehicle.chassisNumber || '',
          }}
        />
      )}

      {/* Share Dialog */}
      {vehicle && (
        <VehicleShare
          vehicle={vehicle}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}
    </div>
  );
}