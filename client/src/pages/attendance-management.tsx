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
  XCircle,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Coffee
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, parseISO } from "date-fns";
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayForAttendance, setSelectedDayForAttendance] = useState<Date | null>(null);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedEmployeeForDialog, setSelectedEmployeeForDialog] = useState<EmployeeWorkSchedule | null>(null);

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

  // Create daily attendance record
  const createAttendanceMutation = useMutation({
    mutationFn: async (data: { employeeId: number; date: string; scheduleType: string }) => {
      const response = await fetch("/api/daily-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في إنشاء سجل الحضور");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-attendance"] });
      toast({ title: "تم إنشاء سجل الحضور بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء سجل الحضور", variant: "destructive" });
    },
  });

  // Mark day as holiday
  const markHolidayMutation = useMutation({
    mutationFn: async (data: { employeeId: number; date: string; isHoliday: boolean }) => {
      const response = await fetch("/api/daily-attendance/holiday", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث حالة الإجازة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-attendance"] });
      toast({ title: "تم تحديث حالة الإجازة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث حالة الإجازة", variant: "destructive" });
    },
  });

  // Get calendar days for current month
  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Get attendance for specific employee and month
  const getEmployeeMonthAttendance = (employeeId: number) => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    return dailyAttendance.filter(attendance => 
      attendance.employeeId === employeeId && 
      attendance.date >= start && 
      attendance.date <= end
    );
  };

  // Handle clicking on employee to show monthly calendar
  const handleEmployeeClick = (employee: EmployeeWorkSchedule) => {
    setSelectedEmployeeForAttendance(employee.employeeId);
  };

  // Handle day click to show attendance dialog
  const handleDayClick = (day: Date, employee: EmployeeWorkSchedule) => {
    setSelectedDayForAttendance(day);
    setSelectedEmployeeForDialog(employee);
    setIsAttendanceDialogOpen(true);
  };

  // Confirm attendance for a specific day
  const handleConfirmAttendance = (type: 'checkin' | 'checkout', time: string, period?: 'morning' | 'evening') => {
    if (!selectedDayForAttendance || !selectedEmployeeForDialog) return;
    
    const dateStr = format(selectedDayForAttendance, "yyyy-MM-dd");
    let attendance = dailyAttendance.find(a => 
      a.employeeId === selectedEmployeeForDialog.employeeId && 
      a.date === dateStr
    );

    if (!attendance) {
      // Create new attendance record with proper typing
      const attendanceData = {
        employeeId: selectedEmployeeForDialog.employeeId,
        employeeName: selectedEmployeeForDialog.employeeName,
        date: dateStr,
        scheduleType: selectedEmployeeForDialog.scheduleType
      } as any; // Temporary type assertion until types are regenerated
      
      createAttendanceMutation.mutate(attendanceData);
    } else {
      // Update existing attendance
      let field: string;
      
      if (selectedEmployeeForDialog.scheduleType === "متصل") {
        field = type === 'checkin' ? 'continuousCheckinTime' : 'continuousCheckoutTime';
      } else {
        // For split schedule, determine field based on period
        if (period === 'morning') {
          field = type === 'checkin' ? 'morningCheckinTime' : 'morningCheckoutTime';
        } else {
          field = type === 'checkin' ? 'eveningCheckinTime' : 'eveningCheckoutTime';
        }
      }
      
      handleAttendanceUpdate(attendance.id, field, time);
    }
  };

  // Check if employee is late
  const isEmployeeLate = (employee: EmployeeWorkSchedule, day: Date): boolean => {
    const dateStr = format(day, "yyyy-MM-dd");
    const attendance = dailyAttendance.find(a => 
      a.employeeId === employee.employeeId && 
      a.date === dateStr
    );

    if (!attendance) return false;

    if (employee.scheduleType === "متصل") {
      if (attendance.continuousCheckinTime && employee.continuousStartTime) {
        return attendance.continuousCheckinTime > employee.continuousStartTime;
      }
    } else {
      if (attendance.morningCheckinTime && employee.morningStartTime) {
        return attendance.morningCheckinTime > employee.morningStartTime;
      }
    }

    return false;
  };

  // Mark day as holiday
  const handleMarkHoliday = () => {
    if (!selectedDayForAttendance || !selectedEmployeeForDialog) return;
    
    const dateStr = format(selectedDayForAttendance, "yyyy-MM-dd");
    markHolidayMutation.mutate({
      employeeId: selectedEmployeeForDialog.employeeId,
      date: dateStr,
      isHoliday: true
    });
    setIsAttendanceDialogOpen(false);
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
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <p className="text-white font-semibold">
                      {format(currentMonth, "MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <Button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Employee List */}
              <div className="grid gap-4 mb-6">
                {workSchedules.map((schedule) => {
                  const isExpanded = selectedEmployeeForAttendance === schedule.employeeId;
                  const monthAttendance = getEmployeeMonthAttendance(schedule.employeeId);
                  const monthDays = getMonthDays();
                  
                  return (
                    <GlassCard key={schedule.id} className="p-4">
                      <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => handleEmployeeClick(schedule)}
                      >
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-5 h-5 text-blue-400" />
                          <div>
                            <h3 className="font-semibold text-white text-lg">{schedule.employeeName}</h3>
                            <p className="text-gray-300 text-sm">{schedule.scheduleType} • {schedule.salary} ريال</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className="border-blue-400 text-blue-300 bg-blue-400/10"
                          >
                            {monthAttendance.length} يوم حضور هذا الشهر
                          </Badge>
                          <ChevronLeft 
                            className={`w-5 h-5 text-gray-300 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`} 
                          />
                        </div>
                      </div>

                      {/* Calendar View when expanded */}
                      {isExpanded && (
                        <div className="mt-6 space-y-4">
                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {/* Day Headers */}
                            {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((day) => (
                              <div key={day} className="p-2 text-center text-gray-400 text-sm font-medium">
                                {day}
                              </div>
                            ))}
                            
                            {/* Calendar Days */}
                            {monthDays.map((day) => {
                              const dayStr = format(day, "yyyy-MM-dd");
                              const dayAttendance = monthAttendance.find(a => a.date === dayStr);
                              const isToday = isSameDay(day, new Date());
                              const hasAttendance = !!dayAttendance;
                              const isHoliday = dayAttendance?.notes === 'إجازة';
                              const isLate = hasAttendance && !isHoliday && isEmployeeLate(schedule, day);
                              
                              return (
                                <div
                                  key={day.toISOString()}
                                  className={`
                                    p-2 text-center cursor-pointer rounded-lg transition-all duration-200
                                    ${isToday ? 'ring-2 ring-blue-400' : ''}
                                    ${isLate ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : ''}
                                    ${hasAttendance && !isHoliday && !isLate ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : ''}
                                    ${isHoliday ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : ''}
                                    ${!hasAttendance && !isHoliday ? 'bg-white/5 text-gray-300 hover:bg-white/10' : ''}
                                    hover:scale-105
                                  `}
                                  onClick={() => handleDayClick(day, schedule)}
                                >
                                  <div className="text-sm font-medium">
                                    {format(day, "d")}
                                  </div>
                                  {hasAttendance && (
                                    <div className="text-xs mt-1">
                                      {isHoliday ? (
                                        <Coffee className="w-3 h-3 mx-auto" />
                                      ) : isLate ? (
                                        <XCircle className="w-3 h-3 mx-auto" />
                                      ) : (
                                        <CheckCircle className="w-3 h-3 mx-auto" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Legend */}
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500/20 rounded"></div>
                              <span className="text-gray-300">حضور في الوقت</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                              <span className="text-gray-300">تأخير</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-yellow-500/20 rounded"></div>
                              <span className="text-gray-300">إجازة</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-white/5 rounded"></div>
                              <span className="text-gray-300">لا يوجد سجل</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border border-blue-400 rounded"></div>
                              <span className="text-gray-300">اليوم</span>
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

              {/* Enhanced Attendance Dialog */}
              <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
                <DialogContent className="glass-container backdrop-blur-md bg-slate-900/90 border border-white/20 text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      إدارة الحضور - {selectedEmployeeForDialog?.employeeName}
                    </DialogTitle>
                    <p className="text-gray-300">
                      {selectedDayForAttendance && format(selectedDayForAttendance, "EEEE، dd MMMM yyyy", { locale: ar })}
                    </p>
                  </DialogHeader>
                  
                  <div className="sr-only" aria-describedby="attendance-dialog-description">
                    إدارة حضور وانصراف الموظف للتاريخ المحدد مع إمكانية تعديل الأوقات وتحديد الإجازات
                  </div>
                  
                  {selectedEmployeeForDialog && selectedDayForAttendance && (() => {
                    const dateStr = format(selectedDayForAttendance, "yyyy-MM-dd");
                    const existingAttendance = dailyAttendance.find(a => 
                      a.employeeId === selectedEmployeeForDialog.employeeId && 
                      a.date === dateStr
                    );
                    
                    return (
                      <div className="space-y-6">
                        {/* Schedule Information */}
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-300 mb-2">معلومات الدوام</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-400">نوع الدوام:</span>
                              <p className="text-white">{selectedEmployeeForDialog.scheduleType}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">الراتب:</span>
                              <p className="text-white">{selectedEmployeeForDialog.salary} ريال</p>
                            </div>
                          </div>
                        </div>

                        {selectedEmployeeForDialog.scheduleType === "متصل" ? (
                          /* Continuous Schedule */
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">الدوام المتصل</h3>
                            
                            {/* Schedule Times */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-white/5 rounded-lg p-3">
                                <Label className="text-gray-300 text-sm">وقت الحضور المحدد</Label>
                                <p className="text-white font-mono">{selectedEmployeeForDialog.continuousStartTime}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <Label className="text-gray-300 text-sm">وقت الانصراف المحدد</Label>
                                <p className="text-white font-mono">{selectedEmployeeForDialog.continuousEndTime}</p>
                              </div>
                            </div>

                            {/* Attendance Times */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-300 text-sm">وقت الحضور الفعلي</Label>
                                <Input
                                  type="time"
                                  value={existingAttendance?.continuousCheckinTime || ""}
                                  onChange={(e) => existingAttendance && handleAttendanceUpdate(existingAttendance.id, 'continuousCheckinTime', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300 text-sm">وقت الانصراف الفعلي</Label>
                                <Input
                                  type="time"
                                  value={existingAttendance?.continuousCheckoutTime || ""}
                                  onChange={(e) => existingAttendance && handleAttendanceUpdate(existingAttendance.id, 'continuousCheckoutTime', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white mt-1"
                                />
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                onClick={() => handleConfirmAttendance('checkin', format(new Date(), "HH:mm"))}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                تأكيد الحضور الآن
                              </Button>
                              <Button
                                onClick={() => handleConfirmAttendance('checkout', format(new Date(), "HH:mm"))}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                تأكيد الانصراف الآن
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Split Schedule */
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">الدوام المنفصل</h3>
                            
                            {/* Morning Schedule */}
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-md font-medium text-white mb-3">الفترة الصباحية</h4>
                              
                              {/* Morning Schedule Times */}
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="bg-white/5 rounded-lg p-2">
                                  <Label className="text-gray-400 text-xs">وقت الحضور المحدد</Label>
                                  <p className="text-white font-mono text-sm">{selectedEmployeeForDialog.morningStartTime}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                  <Label className="text-gray-400 text-xs">وقت الانصراف المحدد</Label>
                                  <p className="text-white font-mono text-sm">{selectedEmployeeForDialog.morningEndTime}</p>
                                </div>
                              </div>

                              {/* Morning Attendance Times */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <Label className="text-gray-300 text-xs">الحضور الفعلي</Label>
                                  <Input
                                    type="time"
                                    value={existingAttendance?.morningCheckinTime || ""}
                                    onChange={(e) => existingAttendance && handleAttendanceUpdate(existingAttendance.id, 'morningCheckinTime', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-300 text-xs">الانصراف الفعلي</Label>
                                  <Input
                                    type="time"
                                    value={existingAttendance?.morningCheckoutTime || ""}
                                    onChange={(e) => existingAttendance && handleAttendanceUpdate(existingAttendance.id, 'morningCheckoutTime', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white text-sm mt-1"
                                  />
                                </div>
                              </div>

                              {/* Morning Quick Actions */}
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  onClick={() => handleConfirmAttendance('checkin', format(new Date(), "HH:mm"), 'morning')}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  حضور صباحي
                                </Button>
                                <Button
                                  onClick={() => handleConfirmAttendance('checkout', format(new Date(), "HH:mm"), 'morning')}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  انصراف صباحي
                                </Button>
                              </div>
                            </div>

                            {/* Evening Schedule */}
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-md font-medium text-white mb-3">الفترة المسائية</h4>
                              
                              {/* Evening Schedule Times */}
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="bg-white/5 rounded-lg p-2">
                                  <Label className="text-gray-400 text-xs">وقت الحضور المحدد</Label>
                                  <p className="text-white font-mono text-sm">{selectedEmployeeForDialog.eveningStartTime}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                  <Label className="text-gray-400 text-xs">وقت الانصراف المحدد</Label>
                                  <p className="text-white font-mono text-sm">{selectedEmployeeForDialog.eveningEndTime}</p>
                                </div>
                              </div>

                              {/* Evening Attendance Times */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <Label className="text-gray-300 text-xs">الحضور الفعلي</Label>
                                  <Input
                                    type="time"
                                    value={existingAttendance?.eveningCheckinTime || ""}
                                    onChange={(e) => existingAttendance && handleAttendanceUpdate(existingAttendance.id, 'eveningCheckinTime', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-300 text-xs">الانصراف الفعلي</Label>
                                  <Input
                                    type="time"
                                    value={existingAttendance?.eveningCheckoutTime || ""}
                                    onChange={(e) => existingAttendance && handleAttendanceUpdate(existingAttendance.id, 'eveningCheckoutTime', e.target.value)}
                                    className="bg-white/10 border-white/20 text-white text-sm mt-1"
                                  />
                                </div>
                              </div>

                              {/* Evening Quick Actions */}
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  onClick={() => handleConfirmAttendance('checkin', format(new Date(), "HH:mm"), 'evening')}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  حضور مسائي
                                </Button>
                                <Button
                                  onClick={() => handleConfirmAttendance('checkout', format(new Date(), "HH:mm"), 'evening')}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  انصراف مسائي
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Bottom Actions */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                          <Button
                            onClick={handleMarkHoliday}
                            variant="outline"
                            className="flex-1 border-yellow-400 text-yellow-300 hover:bg-yellow-400/10"
                            disabled={markHolidayMutation.isPending}
                          >
                            <Coffee className="w-4 h-4 mr-2" />
                            تحديد كإجازة
                          </Button>
                          
                          <Button
                            onClick={() => setIsAttendanceDialogOpen(false)}
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            إغلاق
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </DialogContent>
              </Dialog>
            </GlassContainer>
          </TabsContent>
        </Tabs>
      </div>
    </GlassBackground>
  );
}