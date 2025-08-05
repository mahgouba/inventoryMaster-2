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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  Download, 
  FileText, 
  Eye,
  UserCheck,
  Clock as UserClock,
  Settings,
  Timer,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

interface EmployeeWorkSchedule {
  id: number;
  employeeId: number;
  employeeName: string;
  salary: string;
  scheduleType: string;
  continuousStartTime?: string;
  continuousEndTime?: string;
  morningStartTime?: string;
  morningEndTime?: string;
  eveningStartTime?: string;
  eveningEndTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DailyAttendance {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  scheduleType: string;
  continuousCheckinTime?: string;
  continuousCheckoutTime?: string;
  continuousCheckinStatus?: string;
  continuousCheckoutStatus?: string;
  morningCheckinTime?: string;
  morningCheckoutTime?: string;
  morningCheckinStatus?: string;
  morningCheckoutStatus?: string;
  eveningCheckinTime?: string;
  eveningCheckoutTime?: string;
  eveningCheckinStatus?: string;
  eveningCheckoutStatus?: string;
  totalHoursWorked?: string;
  notes?: string;
  createdBy?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceManagementPageProps {
  userRole: string;
  username: string;
  userId: number;
}

export default function AttendanceManagementPage({ userRole, username, userId }: AttendanceManagementPageProps) {
  const [selectedTab, setSelectedTab] = useState("pending-requests");
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<string>("متصل");
  const [salary, setSalary] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState<number | null>(null);

  // Schedule form states
  const [continuousStartTime, setContinuousStartTime] = useState("09:00");
  const [continuousEndTime, setContinuousEndTime] = useState("17:00");
  const [morningStartTime, setMorningStartTime] = useState("09:00");
  const [morningEndTime, setMorningEndTime] = useState("12:00");
  const [eveningStartTime, setEveningStartTime] = useState("14:00");
  const [eveningEndTime, setEveningEndTime] = useState("17:00");

  // Define permissions based on user role
  const canApproveRequests = ["admin", "sales_manager"].includes(userRole);
  const canManageSchedules = ["admin", "sales_manager"].includes(userRole);
  const canManageAttendance = ["admin", "sales_manager", "accountant"].includes(userRole);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch pending leave requests
  const { data: pendingLeaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
    select: (data) => data.filter(request => request.status === "pending"),
  });

  // Fetch employee work schedules
  const { data: workSchedules = [] } = useQuery<EmployeeWorkSchedule[]>({
    queryKey: ["/api/employee-work-schedules"],
  });

  // Fetch daily attendance for selected date
  const { data: dailyAttendance = [] } = useQuery<DailyAttendance[]>({
    queryKey: ["/api/daily-attendance", { date: selectedDate }],
    queryFn: async () => {
      const response = await fetch(`/api/daily-attendance?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    }
  });

  // Filter work schedules
  const filteredSchedules = workSchedules.filter(schedule =>
    employeeFilter === "" || 
    schedule.employeeName.toLowerCase().includes(employeeFilter.toLowerCase())
  );

  // Approve/Reject leave request mutation
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      const response = await fetch(`/api/leave-requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          rejectionReason,
          approvedBy: userId,
          approvedByName: username
        }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
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

  // Create work schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await fetch("/api/employee-work-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الجدول الزمني",
        description: "تم إنشاء جدول العمل للموظف بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-work-schedules"] });
      setIsCreateScheduleDialogOpen(false);
      resetScheduleForm();
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الجدول",
        description: "حدث خطأ أثناء إنشاء جدول العمل",
        variant: "destructive",
      });
    },
  });

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ attendanceId, field, value, status }: { 
      attendanceId: number; 
      field: string; 
      value: string; 
      status?: string;
    }) => {
      const attendance = dailyAttendance.find(a => a.id === attendanceId);
      if (!attendance) throw new Error("Attendance record not found");

      const updateData = {
        ...attendance,
        [field]: value,
        ...(status && { [`${field.replace('Time', 'Status')}`]: status }),
        date: new Date(attendance.date)
      };

      const response = await fetch(`/api/daily-attendance/${attendanceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الحضور",
        description: "تم تحديث بيانات الحضور بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-attendance", { date: selectedDate }] });
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث الحضور",
        description: "حدث خطأ أثناء تحديث بيانات الحضور",
        variant: "destructive",
      });
    },
  });

  const resetScheduleForm = () => {
    setSelectedEmployeeId("");
    setScheduleType("متصل");
    setSalary("");
    setContinuousStartTime("09:00");
    setContinuousEndTime("17:00");
    setMorningStartTime("09:00");
    setMorningEndTime("12:00");
    setEveningStartTime("14:00");
    setEveningEndTime("17:00");
  };

  const handleApproveRequest = (id: number) => {
    updateRequestStatusMutation.mutate({ id, status: "approved" });
  };

  const handleRejectRequest = (id: number, rejectionReason?: string) => {
    updateRequestStatusMutation.mutate({ id, status: "rejected", rejectionReason });
  };

  const handleCreateSchedule = () => {
    if (!selectedEmployeeId || !salary) return;

    const selectedUser = users.find(u => u.id === parseInt(selectedEmployeeId));
    if (!selectedUser) return;

    const scheduleData = {
      employeeId: parseInt(selectedEmployeeId),
      employeeName: selectedUser.name,
      salary: parseFloat(salary).toString(),
      scheduleType,
      ...(scheduleType === "متصل" 
        ? {
            continuousStartTime,
            continuousEndTime
          }
        : {
            morningStartTime,
            morningEndTime,
            eveningStartTime,
            eveningEndTime
          }
      )
    };

    createScheduleMutation.mutate(scheduleData);
  };

  const handleAttendanceUpdate = (attendanceId: number, field: string, value: string) => {
    updateAttendanceMutation.mutate({ attendanceId, field, value });
  };

  const calculateHoursWorked = (schedule: EmployeeWorkSchedule, attendance: DailyAttendance): string => {
    if (schedule.scheduleType === "متصل") {
      if (attendance.continuousCheckinTime && attendance.continuousCheckoutTime) {
        const checkin = new Date(`2024-01-01T${attendance.continuousCheckinTime}`);
        const checkout = new Date(`2024-01-01T${attendance.continuousCheckoutTime}`);
        const diff = (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60);
        return diff.toFixed(2);
      }
    } else {
      let totalHours = 0;
      if (attendance.morningCheckinTime && attendance.morningCheckoutTime) {
        const morningCheckin = new Date(`2024-01-01T${attendance.morningCheckinTime}`);
        const morningCheckout = new Date(`2024-01-01T${attendance.morningCheckoutTime}`);
        totalHours += (morningCheckout.getTime() - morningCheckin.getTime()) / (1000 * 60 * 60);
      }
      if (attendance.eveningCheckinTime && attendance.eveningCheckoutTime) {
        const eveningCheckin = new Date(`2024-01-01T${attendance.eveningCheckinTime}`);
        const eveningCheckout = new Date(`2024-01-01T${attendance.eveningCheckoutTime}`);
        totalHours += (eveningCheckout.getTime() - eveningCheckin.getTime()) / (1000 * 60 * 60);
      }
      return totalHours.toFixed(2);
    }
    return "0.00";
  };

  return (
    <GlassBackground>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الحضور والإنصراف والإستئذان</h1>
          <p className="text-gray-300">إدارة شاملة لحضور الموظفين وطلبات الإجازة والاستئذان</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-container backdrop-blur-md bg-white/10 border border-white/20">
            <TabsTrigger 
              value="pending-requests" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-testid="tab-pending-requests"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              طلبات الإجازة المعلقة ({pendingLeaveRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="work-schedules" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-testid="tab-work-schedules"
            >
              <Settings className="w-4 h-4 mr-2" />
              إدارة جداول العمل
            </TabsTrigger>
            <TabsTrigger 
              value="daily-attendance" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-testid="tab-daily-attendance"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              الحضور اليومي
            </TabsTrigger>
          </TabsList>

          {/* Pending Leave Requests Tab */}
          <TabsContent value="pending-requests" className="mt-6">
            <GlassContainer className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">طلبات الإجازة والاستئذان المعلقة</h2>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                  {pendingLeaveRequests.length} طلب معلق
                </Badge>
              </div>

              {pendingLeaveRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">لا توجد طلبات معلقة</p>
                  <p className="text-gray-400">جميع طلبات الإجازة والاستئذان تم التعامل معها</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingLeaveRequests.map((request) => (
                    <GlassCard key={request.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{request.userName}</h3>
                          <p className="text-gray-300">{request.requestType}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="border-yellow-400 text-yellow-300 bg-yellow-400/10"
                        >
                          معلق
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-gray-300 text-sm">تاريخ البداية</Label>
                          <p className="text-white">{format(new Date(request.startDate), "dd/MM/yyyy", { locale: ar })}</p>
                        </div>
                        {request.endDate && (
                          <div>
                            <Label className="text-gray-300 text-sm">تاريخ النهاية</Label>
                            <p className="text-white">{format(new Date(request.endDate), "dd/MM/yyyy", { locale: ar })}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-gray-300 text-sm">المدة</Label>
                          <p className="text-white">{request.duration} {request.durationType}</p>
                        </div>
                        <div>
                          <Label className="text-gray-300 text-sm">طلب بواسطة</Label>
                          <p className="text-white">{request.requestedByName}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Label className="text-gray-300 text-sm">السبب</Label>
                        <p className="text-white bg-white/5 rounded p-2 mt-1">{request.reason}</p>
                      </div>
                      
                      {canApproveRequests && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={updateRequestStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`approve-request-${request.id}`}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            موافقة
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={updateRequestStatusMutation.isPending}
                            variant="destructive"
                            data-testid={`reject-request-${request.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            رفض
                          </Button>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}
            </GlassContainer>
          </TabsContent>

          {/* Work Schedules Tab */}
          <TabsContent value="work-schedules" className="mt-6">
            <GlassContainer className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">إدارة جداول العمل</h2>
                {canManageSchedules && (
                  <Dialog open={isCreateScheduleDialogOpen} onOpenChange={setIsCreateScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="create-schedule-button">
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة جدول عمل
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-container backdrop-blur-md bg-slate-900/90 border border-white/20 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle>إنشاء جدول عمل جديد</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label>الموظف</Label>
                          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="اختر الموظف" />
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
                          <Label>راتب الموظف</Label>
                          <Input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder="الراتب بالريال السعودي"
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <Label>نوع الدوام</Label>
                          <Select value={scheduleType} onValueChange={setScheduleType}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="متصل">دوام متصل</SelectItem>
                              <SelectItem value="منفصل">دوام منفصل</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {scheduleType === "متصل" ? (
                          <>
                            <div>
                              <Label>وقت الحضور</Label>
                              <Input
                                type="time"
                                value={continuousStartTime}
                                onChange={(e) => setContinuousStartTime(e.target.value)}
                                className="bg-white/10 border-white/20 text-white"
                              />
                            </div>
                            <div>
                              <Label>وقت الانصراف</Label>
                              <Input
                                type="time"
                                value={continuousEndTime}
                                onChange={(e) => setContinuousEndTime(e.target.value)}
                                className="bg-white/10 border-white/20 text-white"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>الفترة الصباحية - بداية</Label>
                                <Input
                                  type="time"
                                  value={morningStartTime}
                                  onChange={(e) => setMorningStartTime(e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                              <div>
                                <Label>الفترة الصباحية - نهاية</Label>
                                <Input
                                  type="time"
                                  value={morningEndTime}
                                  onChange={(e) => setMorningEndTime(e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>الفترة المسائية - بداية</Label>
                                <Input
                                  type="time"
                                  value={eveningStartTime}
                                  onChange={(e) => setEveningStartTime(e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                              <div>
                                <Label>الفترة المسائية - نهاية</Label>
                                <Input
                                  type="time"
                                  value={eveningEndTime}
                                  onChange={(e) => setEveningEndTime(e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleCreateSchedule}
                            disabled={createScheduleMutation.isPending || !selectedEmployeeId || !salary}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            data-testid="save-schedule-button"
                          >
                            حفظ الجدول
                          </Button>
                          <Button
                            onClick={() => setIsCreateScheduleDialogOpen(false)}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="mb-4">
                <Input
                  placeholder="البحث عن موظف..."
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  data-testid="employee-filter-input"
                />
              </div>

              <div className="grid gap-4">
                {filteredSchedules.map((schedule) => (
                  <GlassCard key={schedule.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white text-lg">{schedule.employeeName}</h3>
                        <p className="text-gray-300">الراتب: {parseFloat(schedule.salary).toLocaleString()} ريال</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={schedule.scheduleType === "متصل" 
                          ? "border-blue-400 text-blue-300 bg-blue-400/10"
                          : "border-green-400 text-green-300 bg-green-400/10"
                        }
                      >
                        {schedule.scheduleType}
                      </Badge>
                    </div>
                    
                    {schedule.scheduleType === "متصل" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300 text-sm">وقت الحضور</Label>
                          <p className="text-white">{schedule.continuousStartTime}</p>
                        </div>
                        <div>
                          <Label className="text-gray-300 text-sm">وقت الانصراف</Label>
                          <p className="text-white">{schedule.continuousEndTime}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300 text-sm">الفترة الصباحية</Label>
                          <p className="text-white">{schedule.morningStartTime} - {schedule.morningEndTime}</p>
                        </div>
                        <div>
                          <Label className="text-gray-300 text-sm">الفترة المسائية</Label>
                          <p className="text-white">{schedule.eveningStartTime} - {schedule.eveningEndTime}</p>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>

              {filteredSchedules.length === 0 && (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">لا توجد جداول عمل</p>
                  <p className="text-gray-400">لم يتم إنشاء أي جداول عمل للموظفين بعد</p>
                </div>
              )}
            </GlassContainer>
          </TabsContent>

          {/* Daily Attendance Tab */}
          <TabsContent value="daily-attendance" className="mt-6">
            <GlassContainer className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">الحضور اليومي</h2>
                <div>
                  <Label className="text-gray-300 text-sm">التاريخ</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    data-testid="date-selector"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {workSchedules.map((schedule) => {
                  const attendance = dailyAttendance.find(a => a.employeeId === schedule.employeeId);
                  const hoursWorked = attendance ? calculateHoursWorked(schedule, attendance) : "0.00";
                  
                  return (
                    <GlassCard key={schedule.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{schedule.employeeName}</h3>
                          <p className="text-gray-300">{schedule.scheduleType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-300">ساعات العمل</p>
                          <p className="text-white font-semibold">{hoursWorked} ساعة</p>
                        </div>
                      </div>
                      
                      {schedule.scheduleType === "متصل" ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300 text-sm">الحضور</Label>
                            <div className="flex gap-2 items-center mt-1">
                              <Input
                                type="time"
                                value={attendance?.continuousCheckinTime || ""}
                                onChange={(e) => attendance && handleAttendanceUpdate(attendance.id, 'continuousCheckinTime', e.target.value)}
                                className="bg-white/10 border-white/20 text-white"
                                disabled={!canManageAttendance}
                              />
                              <Badge 
                                variant="outline" 
                                className={attendance?.continuousCheckinStatus === "في الوقت" 
                                  ? "border-green-400 text-green-300 bg-green-400/10"
                                  : "border-red-400 text-red-300 bg-red-400/10"
                                }
                              >
                                {attendance?.continuousCheckinStatus || "غير محدد"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">الانصراف</Label>
                            <div className="flex gap-2 items-center mt-1">
                              <Input
                                type="time"
                                value={attendance?.continuousCheckoutTime || ""}
                                onChange={(e) => attendance && handleAttendanceUpdate(attendance.id, 'continuousCheckoutTime', e.target.value)}
                                className="bg-white/10 border-white/20 text-white"
                                disabled={!canManageAttendance}
                              />
                              <Badge 
                                variant="outline" 
                                className={attendance?.continuousCheckoutStatus === "في الوقت" 
                                  ? "border-green-400 text-green-300 bg-green-400/10"
                                  : "border-red-400 text-red-300 bg-red-400/10"
                                }
                              >
                                {attendance?.continuousCheckoutStatus || "غير محدد"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-300 text-sm">الحضور الصباحي</Label>
                              <div className="flex gap-2 items-center mt-1">
                                <Input
                                  type="time"
                                  value={attendance?.morningCheckinTime || ""}
                                  onChange={(e) => attendance && handleAttendanceUpdate(attendance.id, 'morningCheckinTime', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                  disabled={!canManageAttendance}
                                />
                                <Badge 
                                  variant="outline" 
                                  className={attendance?.morningCheckinStatus === "في الوقت" 
                                    ? "border-green-400 text-green-300 bg-green-400/10"
                                    : "border-red-400 text-red-300 bg-red-400/10"
                                  }
                                >
                                  {attendance?.morningCheckinStatus || "غير محدد"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-300 text-sm">الانصراف الصباحي</Label>
                              <div className="flex gap-2 items-center mt-1">
                                <Input
                                  type="time"
                                  value={attendance?.morningCheckoutTime || ""}
                                  onChange={(e) => attendance && handleAttendanceUpdate(attendance.id, 'morningCheckoutTime', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                  disabled={!canManageAttendance}
                                />
                                <Badge 
                                  variant="outline" 
                                  className={attendance?.morningCheckoutStatus === "في الوقت" 
                                    ? "border-green-400 text-green-300 bg-green-400/10"
                                    : "border-red-400 text-red-300 bg-red-400/10"
                                  }
                                >
                                  {attendance?.morningCheckoutStatus || "غير محدد"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-300 text-sm">الحضور المسائي</Label>
                              <div className="flex gap-2 items-center mt-1">
                                <Input
                                  type="time"
                                  value={attendance?.eveningCheckinTime || ""}
                                  onChange={(e) => attendance && handleAttendanceUpdate(attendance.id, 'eveningCheckinTime', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                  disabled={!canManageAttendance}
                                />
                                <Badge 
                                  variant="outline" 
                                  className={attendance?.eveningCheckinStatus === "في الوقت" 
                                    ? "border-green-400 text-green-300 bg-green-400/10"
                                    : "border-red-400 text-red-300 bg-red-400/10"
                                  }
                                >
                                  {attendance?.eveningCheckinStatus || "غير محدد"}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-300 text-sm">الانصراف المسائي</Label>
                              <div className="flex gap-2 items-center mt-1">
                                <Input
                                  type="time"
                                  value={attendance?.eveningCheckoutTime || ""}
                                  onChange={(e) => attendance && handleAttendanceUpdate(attendance.id, 'eveningCheckoutTime', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white"
                                  disabled={!canManageAttendance}
                                />
                                <Badge 
                                  variant="outline" 
                                  className={attendance?.eveningCheckoutStatus === "في الوقت" 
                                    ? "border-green-400 text-green-300 bg-green-400/10"
                                    : "border-red-400 text-red-300 bg-red-400/10"
                                  }
                                >
                                  {attendance?.eveningCheckoutStatus || "غير محدد"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>

              {workSchedules.length === 0 && (
                <div className="text-center py-12">
                  <UserClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">لا توجد جداول عمل</p>
                  <p className="text-gray-400">يجب إنشاء جداول عمل للموظفين أولاً لتتمكن من إدارة الحضور</p>
                </div>
              )}
            </GlassContainer>
          </TabsContent>
        </Tabs>
      </div>
    </GlassBackground>
  );
}