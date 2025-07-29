import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Users, Plus, Check, X, AlertCircle, Download, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Glass Background Components
const GlassBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const GlassContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`glass-container backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl ${className}`}>
      {children}
    </div>
  );
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`glass-card backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg shadow-lg hover:bg-white/10 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  jobTitle: string;
  phoneNumber: string;
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
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [selectedRequestForPrint, setSelectedRequestForPrint] = useState<LeaveRequest | null>(null);
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewRequest, setPreviewRequest] = useState<LeaveRequest | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch leave requests
  const { data: allLeaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  // Filter leave requests based on employee name and status
  const leaveRequests = allLeaveRequests.filter(request => {
    const matchesName = employeeNameFilter === "" || 
      request.userName.toLowerCase().includes(employeeNameFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesName && matchesStatus;
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

  // Auto-calculate end time/date based on duration
  useEffect(() => {
    if (requestType && startDate && duration) {
      if (requestType === "استئذان" && startTime) {
        // Calculate end time for leave requests (in hours)
        const start = new Date(`${startDate}T${startTime}`);
        const hours = parseInt(duration);
        const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
        setEndTime(end.toTimeString().slice(0, 5));
      } else if (requestType === "إجازة") {
        // Calculate end date for vacation requests (in days)
        const start = new Date(startDate);
        const days = parseInt(duration);
        const end = new Date(start.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
        setEndDate(end.toISOString().split('T')[0]);
      }
    }
  }, [requestType, startDate, startTime, duration]);

  const resetForm = () => {
    setSelectedUserId("");
    setRequestType("");
    setStartDate("");
    setStartTime("09:00");
    setEndDate("");
    setEndTime("");
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

    let finalStartDate, finalEndDate;
    
    if (requestType === "استئذان") {
      // For leave requests, include time in the date
      finalStartDate = new Date(`${startDate}T${startTime}`).toISOString();
      finalEndDate = endTime ? new Date(`${startDate}T${endTime}`).toISOString() : null;
    } else {
      // For vacation requests, use date only
      finalStartDate = new Date(startDate).toISOString();
      finalEndDate = endDate ? new Date(endDate).toISOString() : null;
    }

    const requestData = {
      userId: parseInt(selectedUserId),
      userName: selectedUser.name, // Use name instead of username
      requestType,
      startDate: finalStartDate,
      endDate: finalEndDate,
      duration: parseInt(duration),
      durationType: requestType === "إجازة" ? "أيام" : "ساعات",
      reason,
      requestedBy: userId,
      requestedByName: username,
    };

    createLeaveRequestMutation.mutate(requestData);
  };

  // PDF Generation functionality
  const generatePDF = async (request: LeaveRequest) => {
    try {
      const element = document.getElementById(`leave-request-print-${request.id}`);
      if (!element) {
        toast({
          title: "خطأ في إنشاء PDF",
          description: "لم يتم العثور على بيانات الطلب",
          variant: "destructive",
        });
        return;
      }

      // Temporarily show the element for capture
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.zIndex = '9999';
      element.style.width = '794px'; // A4 width in pixels at 96 DPI
      element.style.height = 'auto';
      element.style.display = 'block';
      element.style.visibility = 'visible';

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: element.scrollHeight,
        logging: false
      });

      // Hide the element again
      element.style.position = 'fixed';
      element.style.top = '-9999px';
      element.style.left = '-9999px';
      element.style.display = 'none';

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has zero dimensions');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`طلب_${request.requestType}_${request.userName}_${new Date().toLocaleDateString('ar-SA')}.pdf`);
      
      toast({
        title: "تم إنشاء PDF بنجاح",
        description: "تم تحميل ملف PDF للطلب",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "خطأ في إنشاء PDF",
        description: "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive",
      });
    }
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
    <GlassBackground>
      <div className="container mx-auto p-6" dir="rtl">
        <GlassContainer className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">طلبات الإجازة والاستئذان</h1>
              <p className="text-white/80 drop-shadow-md">إدارة طلبات الإجازات والاستئذان للموظفين</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-white/20 text-white shadow-lg">
                  <Plus size={20} className="ml-2" />
                  إنشاء طلب جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md backdrop-blur-md bg-slate-900/90 border border-white/20" dir="rtl" aria-describedby="dialog-description">
                <DialogHeader>
                  <DialogTitle className="text-white">إنشاء طلب إجازة أو استئذان</DialogTitle>
                  <p id="dialog-description" className="text-white/80 text-sm">املأ النموذج لإنشاء طلب إجازة أو استئذان جديد</p>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/90 drop-shadow-md">اختيار المستخدم</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <SelectValue placeholder="اختر المستخدم" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} - {user.jobTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/90 drop-shadow-md">نوع الطلب</Label>
                    <Select value={requestType} onValueChange={setRequestType}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <SelectValue placeholder="اختر نوع الطلب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="إجازة">إجازة (بالأيام)</SelectItem>
                        <SelectItem value="استئذان">استئذان (بالساعات)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/90 drop-shadow-md">تاريخ البداية</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white backdrop-blur-sm"
                    />
                  </div>

                  {requestType === "استئذان" && (
                    <div>
                      <Label className="text-white/90 drop-shadow-md">وقت البداية</Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-white/10 border-white/20 text-white backdrop-blur-sm"
                      />
                    </div>
                  )}

                  {requestType === "استئذان" && endTime && (
                    <div>
                      <Label className="text-white/90 drop-shadow-md">وقت النهاية (محسوب تلقائياً)</Label>
                      <Input
                        type="time"
                        value={endTime}
                        readOnly
                        className="bg-green-500/20 border-green-400/50 text-white backdrop-blur-sm"
                      />
                    </div>
                  )}

                  {requestType === "إجازة" && endDate && (
                    <div>
                      <Label className="text-white/90 drop-shadow-md">تاريخ النهاية (محسوب تلقائياً)</Label>
                      <Input
                        type="date"
                        value={endDate}
                        readOnly
                        className="bg-green-500/20 border-green-400/50 text-white backdrop-blur-sm"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-white/90 drop-shadow-md">
                      {requestType === "إجازة" ? "عدد الأيام" : "عدد الساعات"}
                    </Label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder={requestType === "إجازة" ? "عدد الأيام" : "عدد الساعات"}
                      className="bg-white/10 border-white/20 text-white backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90 drop-shadow-md">سبب الطلب</Label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="اكتب سبب الإجازة أو الاستئذان"
                      rows={3}
                      className="bg-white/10 border-white/20 text-white backdrop-blur-sm placeholder:text-white/60"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleCreateRequest}
                      disabled={createLeaveRequestMutation.isPending}
                      className="bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-white/20 text-white"
                    >
                      {createLeaveRequestMutation.isPending ? "جاري الإنشاء..." : "إنشاء الطلب"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </GlassContainer>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 drop-shadow-md">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-white drop-shadow-lg">{allLeaveRequests.length}</p>
                {employeeNameFilter || statusFilter !== "all" ? (
                  <p className="text-xs text-white/60">المفلترة: {leaveRequests.length}</p>
                ) : null}
              </div>
              <Users className="h-8 w-8 text-blue-400 drop-shadow-lg" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 drop-shadow-md">في الانتظار</p>
                <p className="text-2xl font-bold text-yellow-400 drop-shadow-lg">
                  {leaveRequests.filter(r => r.status === "pending").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 drop-shadow-md">موافق عليها</p>
                <p className="text-2xl font-bold text-green-400 drop-shadow-lg">
                  {leaveRequests.filter(r => r.status === "approved").length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-400 drop-shadow-lg" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 drop-shadow-md">مرفوضة</p>
                <p className="text-2xl font-bold text-red-400 drop-shadow-lg">
                  {leaveRequests.filter(r => r.status === "rejected").length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-400 drop-shadow-lg" />
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassContainer className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white/90 drop-shadow-md">البحث باسم الموظف</Label>
              <Input
                type="text"
                placeholder="ادخل اسم الموظف..."
                value={employeeNameFilter}
                onChange={(e) => setEmployeeNameFilter(e.target.value)}
                className="bg-white/10 border-white/20 text-white backdrop-blur-sm placeholder:text-white/60"
              />
            </div>
            <div>
              <Label className="text-white/90 drop-shadow-md">تصفية حسب الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطلبات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليها</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEmployeeNameFilter("");
                  setStatusFilter("all");
                }}
                className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20"
              >
                إعادة تعيين الفلاتر
              </Button>
            </div>
          </div>
        </GlassContainer>

        {/* Requests List */}
        <GlassContainer className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              <Calendar size={20} />
              قائمة الطلبات ({leaveRequests.length})
            </h2>
          </div>
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-white/40 mb-4 drop-shadow-lg" />
                <p className="text-white/70 drop-shadow-md">لا توجد طلبات حالياً</p>
              </div>
            ) : (
              leaveRequests.map((request) => (
                <GlassCard key={request.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-white drop-shadow-lg">
                          {request.requestType} - {request.userName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-white/70 drop-shadow-md">
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
                        
                        {/* Preview Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPreviewRequest(request);
                            setPreviewDialogOpen(true);
                          }}
                          className="bg-green-600/20 border-green-400/50 text-white hover:bg-green-600/40 backdrop-blur-sm"
                        >
                          <Eye size={14} />
                        </Button>
                        
                        {/* PDF Download Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generatePDF(request)}
                          className="bg-blue-600/20 border-blue-400/50 text-white hover:bg-blue-600/40 backdrop-blur-sm"
                        >
                          <Download size={14} />
                        </Button>
                        
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
                              className="bg-green-600/80 hover:bg-green-700/90 backdrop-blur-sm border border-white/20"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600/80 hover:bg-red-700/90 backdrop-blur-sm border border-white/20"
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
                    
                    <div className="text-sm text-white/80 drop-shadow-md">
                      <strong className="text-white drop-shadow-lg">السبب:</strong> {request.reason}
                    </div>
                    
                    <div className="text-xs text-white/60 border-t border-white/20 pt-2 drop-shadow-md">
                      طلب بواسطة: {request.requestedByName} في{" "}
                      {format(new Date(request.createdAt), "PPP", { locale: ar })}
                      {request.approvedByName && (
                        <span className="mr-4">
                          تمت المراجعة بواسطة: {request.approvedByName}
                        </span>
                      )}
                    </div>
                </GlassCard>
              ))
            )}
        </GlassContainer>

        {/* Print Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto backdrop-blur-md bg-slate-900/90 border border-white/20" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Eye size={20} />
                معاينة الطباعة
              </DialogTitle>
            </DialogHeader>
            
            {previewRequest && (() => {
              const user = users.find(u => u.id === previewRequest.userId);
              return (
                <div className="space-y-4">
                  {/* Preview of the PDF */}
                  <div className="bg-white p-8 rounded-lg shadow-lg relative" style={{ 
                    fontFamily: 'Arial, sans-serif', 
                    direction: 'rtl', 
                    textAlign: 'right',
                    minHeight: '600px',
                    backgroundImage: 'url(/albarimi-2.svg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundSize: '50% auto'
                  }}>
                    {/* Background overlay to make text readable */}
                    <div className="absolute inset-0 bg-white/80 rounded-lg"></div>
                    <div className="relative z-10">
                    {/* Company Header with Logo */}
                    <div className="flex items-center justify-between mb-8 border-b-2 border-gray-300 pb-4">
                      <div className="text-right">
                        <h1 className="text-2xl font-bold text-gray-800">شركة البريمي للسيارات</h1>
                        <p className="text-gray-600">Al-Barimi Cars Company</p>
                      </div>
                      <div className="flex-shrink-0">
                        <img 
                          src="/albarimi-2.svg" 
                          alt="Company Logo" 
                          className="h-20 w-auto"
                        />
                      </div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold text-gray-800">
                        طلب {previewRequest.requestType === "leave" ? "إجازة" : "استئذان"}
                      </h2>
                      <p className="text-gray-600">Leave Request Form</p>
                    </div>

                    {/* Employee Information */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموظف:</label>
                        <p className="text-gray-800 border-b border-gray-300 pb-1">{previewRequest.userName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي:</label>
                        <p className="text-gray-800 border-b border-gray-300 pb-1">{user?.jobTitle || "غير محدد"}</p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع الطلب:</label>
                        <p className="text-gray-800 border-b border-gray-300 pb-1">
                          {previewRequest.requestType === "leave" ? "إجازة" : "استئذان"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الطلب:</label>
                        <p className="text-gray-800 border-b border-gray-300 pb-1">
                          {format(new Date(previewRequest.startDate), "yyyy/MM/dd", { locale: ar })}
                        </p>
                      </div>
                    </div>

                    {previewRequest.requestType === "leave" ? (
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية:</label>
                          <p className="text-gray-800 border-b border-gray-300 pb-1">
                            {format(new Date(previewRequest.startDate), "yyyy/MM/dd", { locale: ar })}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية:</label>
                          <p className="text-gray-800 border-b border-gray-300 pb-1">
                            {previewRequest.endDate ? format(new Date(previewRequest.endDate), "yyyy/MM/dd", { locale: ar }) : "غير محدد"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">وقت البداية:</label>
                          <p className="text-gray-800 border-b border-gray-300 pb-1">
                            {previewRequest.startDate ? format(new Date(previewRequest.startDate), "HH:mm") : "غير محدد"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">وقت النهاية:</label>
                          <p className="text-gray-800 border-b border-gray-300 pb-1">
                            {previewRequest.endDate ? format(new Date(previewRequest.endDate), "HH:mm") : "غير محدد"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">المدة:</label>
                          <p className="text-gray-800 border-b border-gray-300 pb-1">{previewRequest.duration}</p>
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">سبب الطلب:</label>
                      <div className="bg-gray-50 p-4 rounded border">
                        <p className="text-gray-800">{previewRequest.reason}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-1">حالة الطلب:</label>
                      <p className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        previewRequest.status === "approved" ? "bg-green-100 text-green-800" :
                        previewRequest.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {previewRequest.status === "pending" ? "في الانتظار" :
                         previewRequest.status === "approved" ? "موافق عليه" : "مرفوض"}
                      </p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-16">
                      <div className="text-center">
                        <div className="border-t border-gray-400 pt-2">
                          <p className="text-sm text-gray-600">توقيع الموظف</p>
                          <p className="text-xs text-gray-500">Employee Signature</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-gray-400 pt-2">
                          <p className="text-sm text-gray-600">توقيع المدير</p>
                          <p className="text-xs text-gray-500">Manager Signature</p>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => {
                        generatePDF(previewRequest);
                        setPreviewDialogOpen(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download size={16} className="ml-2" />
                      تحميل PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPreviewDialogOpen(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      إغلاق
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Hidden PDF Print Templates */}
        {leaveRequests.map((request) => {
          const user = users.find(u => u.id === request.userId);
          return (
            <div
              key={`print-${request.id}`}
              id={`leave-request-print-${request.id}`}
              className="fixed top-[-9999px] left-[-9999px] w-[210mm] bg-white p-8 print:relative print:top-0 print:left-0 relative"
              style={{ 
                fontFamily: 'Arial, sans-serif', 
                direction: 'rtl', 
                textAlign: 'right',
                minHeight: '297mm',
                pageBreakAfter: 'always',
                backgroundImage: 'url(/albarimi-2.svg)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: '50% auto'
              }}
            >
              {/* Background overlay for text readability */}
              <div className="absolute inset-0 bg-white/85"></div>
              <div className="relative z-10">
              {/* Company Letterhead */}
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <img 
                  src="/albarimi-2.svg" 
                  alt="Company Logo" 
                  className="mx-auto mb-4 h-20 w-auto"
                />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">شركة البريمي للسيارات</h1>
                <p className="text-gray-600">طلب {request.requestType}</p>
              </div>

              {/* Request Details */}
              <div className="space-y-6">
                {/* Employee Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">بيانات الموظف</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">الاسم: </span>
                      <span className="text-gray-800">{request.userName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">المسمى الوظيفي: </span>
                      <span className="text-gray-800">{user?.jobTitle || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">رقم الهاتف: </span>
                      <span className="text-gray-800">{user?.phoneNumber || 'غير محدد'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">تاريخ الطلب: </span>
                      <span className="text-gray-800">{format(new Date(request.createdAt), "dd/MM/yyyy", { locale: ar })}</span>
                    </div>
                  </div>
                </div>

                {/* Request Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">تفاصيل الطلب</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">نوع الطلب: </span>
                      <span className="text-gray-800 font-semibold">{request.requestType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">المدة: </span>
                      <span className="text-gray-800">{request.duration} {request.durationType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">تاريخ البداية: </span>
                      <span className="text-gray-800">{format(new Date(request.startDate), "dd/MM/yyyy", { locale: ar })}</span>
                    </div>
                    {request.endDate && (
                      <div>
                        <span className="font-medium text-gray-700">تاريخ النهاية: </span>
                        <span className="text-gray-800">{format(new Date(request.endDate), "dd/MM/yyyy", { locale: ar })}</span>
                      </div>
                    )}
                    {request.requestType === "استئذان" && (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">وقت البداية: </span>
                          <span className="text-gray-800">{format(new Date(request.startDate), "HH:mm", { locale: ar })}</span>
                        </div>
                        {request.endDate && (
                          <div>
                            <span className="font-medium text-gray-700">وقت النهاية: </span>
                            <span className="text-gray-800">{format(new Date(request.endDate), "HH:mm", { locale: ar })}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">سبب الطلب</h3>
                  <p className="text-gray-800 leading-relaxed">{request.reason}</p>
                </div>

                {/* Status and Approval */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">حالة الطلب</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">الحالة: </span>
                      <span className={`font-semibold ${
                        request.status === 'approved' ? 'text-green-600' : 
                        request.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {request.status === 'approved' ? 'موافق عليه' : 
                         request.status === 'rejected' ? 'مرفوض' : 'في الانتظار'}
                      </span>
                    </div>
                    {request.approvedByName && (
                      <div>
                        <span className="font-medium text-gray-700">تمت المراجعة بواسطة: </span>
                        <span className="text-gray-800">{request.approvedByName}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">طلب بواسطة: </span>
                      <span className="text-gray-800">{request.requestedByName}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="font-semibold text-gray-800">توقيع الموظف</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="font-semibold text-gray-800">توقيع المدير المباشر</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500 border-t pt-4">
                  <p>شركة البريمي للسيارات - نظام إدارة طلبات الإجازة والاستئذان</p>
                  <p>تم إنشاء هذا الطلب في تاريخ: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ar })}</p>
                </div>
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassBackground>
  );
}