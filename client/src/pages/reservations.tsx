import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Car, CreditCard, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ManufacturerLogo } from "@/components/manufacturer-logo";

export default function ReservationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservedItems = [], isLoading } = useQuery({
    queryKey: ["/api/inventory/reserved"],
    queryFn: () => apiRequest("/api/inventory/reserved"),
  });

  // Filter reserved items based on search query
  const filteredReservations = useMemo(() => {
    if (!searchQuery.trim()) return reservedItems;
    
    const query = searchQuery.toLowerCase();
    return reservedItems.filter((item: any) =>
      item.customerName?.toLowerCase().includes(query) ||
      item.customerPhone?.toLowerCase().includes(query) ||
      item.manufacturer?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.chassisNumber?.toLowerCase().includes(query)
    );
  }, [reservedItems, searchQuery]);

  const sellMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest(`/api/inventory/${itemId}/sell-reserved`, {
        method: "PUT"
      });
    },
    onSuccess: () => {
      toast({
        title: "تم البيع بنجاح",
        description: "تم بيع السيارة بناءً على بيانات الحجز",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/reserved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "فشل في البيع",
        description: error.message || "حدث خطأ أثناء بيع السيارة",
        variant: "destructive",
      });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest(`/api/inventory/${itemId}/cancel-reservation`, {
        method: "PUT"
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إلغاء الحجز",
        description: "تم إلغاء حجز السيارة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/reserved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/manufacturer-stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "فشل في إلغاء الحجز",
        description: error.message || "حدث خطأ أثناء إلغاء الحجز",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return "غير محدد";
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "غير محدد";
    return new Date(date).toLocaleDateString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="container mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">جاري تحميل طلبات الحجز...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4" dir="rtl">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            إدارة طلبات الحجز
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة طلبات حجز السيارات وبيانات العملاء
          </p>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في طلبات الحجز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-custom-primary">{reservedItems.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الحجوزات</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reservedItems.reduce((sum: number, item: any) => sum + (parseFloat(item.paidAmount) || 0), 0).toLocaleString('ar-SA')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبالغ المدفوعة</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredReservations.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">نتائج البحث</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد طلبات حجز"}
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {searchQuery ? "جرب البحث بكلمات أخرى" : "لم يتم إجراء أي حجوزات بعد"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ManufacturerLogo manufacturer={item.manufacturer} size="sm" />
                      <CardTitle className="text-lg">{item.manufacturer}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-custom-primary/10 text-custom-primary">
                      محجوز
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.category} {item.trimLevel && `- ${item.trimLevel}`}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Vehicle Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Car className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">السنة:</span>
                      <span>{item.year}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-600">الهيكل:</span>
                      <span className="font-mono">{item.chassisNumber}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-semibold text-sm mb-2">بيانات العميل</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{item.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span dir="ltr">{item.customerPhone}</span>
                      </div>
                      {item.salesRepresentative && (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-600 font-medium">
                            مندوب المبيعات: {item.salesRepresentative}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(item.paidAmount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDate(item.reservationDate)}</span>
                      </div>
                    </div>

                    {item.reservationNote && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <strong>ملاحظات:</strong> {item.reservationNote}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => sellMutation.mutate(item.id)}
                      disabled={sellMutation.isPending || cancelReservationMutation.isPending}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      بيع
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => cancelReservationMutation.mutate(item.id)}
                      disabled={sellMutation.isPending || cancelReservationMutation.isPending}
                    >
                      <X className="w-3 h-3 mr-1" />
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}