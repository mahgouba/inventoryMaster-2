import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Users, Plus, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface User {
  id: number;
  username: string;
  role: string;
}

interface LeaveRequest {
  id: number;
  userId: number;
  userName: string;
  requestType: string;
  startDate: string;
  endDate: string | null;
  duration: number;
  durationType: string;
  reason: string;
  status: string;
  requestedBy: number;
  requestedByName: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface LeaveRequestsPageProps {
  userRole: string;
  username: string;
  userId: number;
}

export default function LeaveRequestsPage({ userRole, username, userId }: LeaveRequestsPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [requestType, setRequestType] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch leave requests
  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  // Create leave request mutation
  const createLeaveRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        throw new Error("Failed to create leave request");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: "تم إرسال طلب الإجازة/الاستئذان للمراجعة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الطلب",
        description: "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    },
  });

  // Approve/Reject mutations
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      const response = await fetch(`/api/leave-requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status, 
          rejectionReason,
          approvedBy: userId,
          approvedByName: username
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update request status");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === "approved" ? "تم الموافقة على الطلب" : "تم رفض الطلب",
        description: variables.status === "approved" ? "تم الموافقة على طلب الإجازة/الاستئذان" : "تم رفض الطلب",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث الطلب",
        description: "حدث خطأ أثناء تحديث حالة الطلب",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedUserId("");
    setRequestType("");
    setStartDate("");
    setEndDate("");
    setDuration("");
    setReason("");
  };

  const handleCreateRequest = () => {
    if (!selectedUserId || !requestType || !startDate || !duration || !reason) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const selectedUser = users.find(u => u.id.toString() === selectedUserId);
    if (!selectedUser) return;

    const requestData = {
      userId: parseInt(selectedUserId),
      userName: selectedUser.username,
      requestType,
      startDate: new Date(startDate).toISOString(),
      endDate: requestType === "إجازة" && endDate ? new Date(endDate).toISOString() : null,
      duration: parseInt(duration),
      durationType: requestType === "إجازة" ? "أيام" : "ساعات",
      reason,
      requestedBy: userId,
      requestedByName: username,
    };

    createLeaveRequestMutation.mutate(requestData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "في الانتظار",
      approved: "موافق عليه",
      rejected: "مرفوض",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="rtl">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">طلبات الإجازة والاستئذان</h1>
            <p className="text-slate-600 dark:text-slate-400">إدارة طلبات الإجازات والاستئذان للموظفين</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus size={20} className="ml-2" />
                إنشاء طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء طلب إجازة أو استئذان</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اختيار المستخدم</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستخدم" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>نوع الطلب</Label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="إجازة">إجازة (بالأيام)</SelectItem>
                      <SelectItem value="استئذان">استئذان (بالساعات)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>تاريخ البداية</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {requestType === "إجازة" && (
                  <div>
                    <Label>تاريخ النهاية</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label>
                    {requestType === "إجازة" ? "عدد الأيام" : "عدد الساعات"}
                  </Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={requestType === "إجازة" ? "عدد الأيام" : "عدد الساعات"}
                  />
                </div>

                <div>
                  <Label>سبب الطلب</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="اكتب سبب الإجازة أو الاستئذان"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleCreateRequest}
                    disabled={createLeaveRequestMutation.isPending}
                  >
                    {createLeaveRequestMutation.isPending ? "جاري الإنشاء..." : "إنشاء الطلب"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold">{leaveRequests.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {leaveRequests.filter(r => r.status === "pending").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">موافق عليها</p>
                  <p className="text-2xl font-bold text-green-600">
                    {leaveRequests.filter(r => r.status === "approved").length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">مرفوضة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {leaveRequests.filter(r => r.status === "rejected").length}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              قائمة الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">لا توجد طلبات حالياً</p>
                </div>
              ) : (
                leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {request.requestType} - {request.userName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {format(new Date(request.startDate), "PPP", { locale: ar })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {request.duration} {request.durationType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        {userRole === "admin" && request.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateRequestStatusMutation.mutate({
                                  id: request.id,
                                  status: "approved",
                                })
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateRequestStatusMutation.mutate({
                                  id: request.id,
                                  status: "rejected",
                                  rejectionReason: "تم الرفض من قبل الإدارة",
                                })
                              }
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>السبب:</strong> {request.reason}
                    </div>
                    
                    <div className="text-xs text-slate-500 dark:text-slate-400 border-t pt-2">
                      طلب بواسطة: {request.requestedByName} في{" "}
                      {format(new Date(request.createdAt), "PPP", { locale: ar })}
                      {request.approvedByName && (
                        <span className="mr-4">
                          تمت المراجعة بواسطة: {request.approvedByName}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}