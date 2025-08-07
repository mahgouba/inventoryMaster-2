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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, parseISO, isBefore } from "date-fns";
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
      queryClient.invalidateQueries({ queryKey: ["/api/daily-attendance"] });
      setIsAttendanceDialogOpen(false); // إغلاق الـ Dialog بعد النجاح
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
    mutationFn: async (data: any) => {
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
      queryClient.refetchQueries({ queryKey: ["/api/daily-attendance"] });
      toast({ title: "تم تسجيل الحضور بنجاح" });
      setIsAttendanceDialogOpen(false);
    },
    onError: (error) => {
      console.error("Attendance creation error:", error);
      toast({ title: "خطأ في تسجيل الحضور", variant: "destructive" });
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
    onSuccess: (data) => {
      // Force refresh both queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["/api/daily-attendance"] });
      
      // Also refresh other related queries
      queryClient.invalidateQueries({ queryKey: ["/api/employee-work-schedules"] });
      
      toast({ 
        title: "تم تحديد اليوم كإجازة بنجاح", 
        description: `تم تحديث حالة يوم ${format(selectedDayForAttendance!, "dd/MM/yyyy", { locale: ar })} بنجاح` 
      });
      setIsAttendanceDialogOpen(false);
      
      // Small delay to allow data to propagate
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/daily-attendance"] });
      }, 100);
    },
    onError: (error) => {
      console.error("Holiday marking error:", error);
      toast({ title: "خطأ في تحديد الإجازة", description: "يرجى المحاولة مرة أخرى", variant: "destructive" });
    },
  });

  // Get calendar days for current month (only current and past days)
  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const today = new Date();
    const end = isBefore(endOfMonth(currentMonth), today) ? endOfMonth(currentMonth) : today;
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
      // Create new attendance record with proper timing data
      const attendanceData = {
        employeeId: selectedEmployeeForDialog.employeeId,
        employeeName: selectedEmployeeForDialog.employeeName,
        date: dateStr,
        scheduleType: selectedEmployeeForDialog.scheduleType,
        // Add the timing data immediately when creating
        ...(selectedEmployeeForDialog.scheduleType === "متصل" 
          ? {
              [type === 'checkin' ? 'continuousCheckinTime' : 'continuousCheckoutTime']: time
            }
          : {
              ...(period === 'morning' 
                ? { [type === 'checkin' ? 'morningCheckinTime' : 'morningCheckoutTime']: time }
                : { [type === 'checkin' ? 'eveningCheckinTime' : 'eveningCheckoutTime']: time }
              )
            }
        )
      };
      
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
    
    // Dialog will be closed by the mutation success handler
  };

  // Handle both checkin and checkout in one operation
  const handleConfirmBothAttendance = (checkinTime: string, checkoutTime: string, period?: 'morning' | 'evening') => {
    if (!selectedDayForAttendance || !selectedEmployeeForDialog) return;
    
    const dateStr = format(selectedDayForAttendance, "yyyy-MM-dd");
    let attendance = dailyAttendance.find(a => 
      a.employeeId === selectedEmployeeForDialog.employeeId && 
      a.date === dateStr
    );

    if (!attendance) {
      // Create new attendance record with both times
      const attendanceData = {
        employeeId: selectedEmployeeForDialog.employeeId,
        employeeName: selectedEmployeeForDialog.employeeName,
        date: dateStr,
        scheduleType: selectedEmployeeForDialog.scheduleType,
        // Add both timing data when creating
        ...(selectedEmployeeForDialog.scheduleType === "متصل" 
          ? {
              continuousCheckinTime: checkinTime,
              continuousCheckoutTime: checkoutTime
            }
          : {
              ...(period === 'morning' 
                ? { 
                    morningCheckinTime: checkinTime,
                    morningCheckoutTime: checkoutTime
                  }
                : { 
                    eveningCheckinTime: checkinTime,
                    eveningCheckoutTime: checkoutTime
                  }
              )
            }
        )
      };
      
      createAttendanceMutation.mutate(attendanceData);
    } else {
      // Update existing attendance with both times
      if (selectedEmployeeForDialog.scheduleType === "متصل") {
        handleAttendanceUpdate(attendance.id, 'continuousCheckinTime', checkinTime);
        setTimeout(() => handleAttendanceUpdate(attendance.id, 'continuousCheckoutTime', checkoutTime), 100);
      } else {
        // For split schedule, determine fields based on period
        if (period === 'morning') {
          handleAttendanceUpdate(attendance.id, 'morningCheckinTime', checkinTime);
          setTimeout(() => handleAttendanceUpdate(attendance.id, 'morningCheckoutTime', checkoutTime), 100);
        } else {
          handleAttendanceUpdate(attendance.id, 'eveningCheckinTime', checkinTime);
          setTimeout(() => handleAttendanceUpdate(attendance.id, 'eveningCheckoutTime', checkoutTime), 100);
        }
      }
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

  // Check if day is a holiday/leave
  const isDayHoliday = (employee: EmployeeWorkSchedule, day: Date): boolean => {
    const dateStr = format(day, "yyyy-MM-dd");
    const attendance = dailyAttendance.find(a => 
      a.employeeId === employee.employeeId && 
      a.date === dateStr
    );
    
    return attendance?.notes === "إجازة";
  };

  // Fetch all leave requests for checking approved leave
  const { data: allLeaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  // Check if employee has approved leave for a specific day
  const hasApprovedLeave = (employeeId: number, day: Date): boolean => {
    const dateStr = format(day, "yyyy-MM-dd");
    return allLeaveRequests.some(request => 
      request.userId === employeeId &&
      request.status === "approved" &&
      format(new Date(request.startDate), "yyyy-MM-dd") <= dateStr &&
      (request.endDate ? format(new Date(request.endDate), "yyyy-MM-dd") >= dateStr : format(new Date(request.startDate), "yyyy-MM-dd") === dateStr)
    );
  };

  // Mark day as holiday
  const handleMarkHoliday = () => {
    if (!selectedDayForAttendance || !selectedEmployeeForDialog) return;
    
    const dateStr = format(selectedDayForAttendance, "yyyy-MM-dd");
    const existingAttendance = dailyAttendance.find(a => 
      a.employeeId === selectedEmployeeForDialog.employeeId && 
      a.date === dateStr
    );
    
    // Toggle holiday status if record exists
    const isCurrentlyHoliday = existingAttendance?.notes === 'إجازة';
    
    markHolidayMutation.mutate({
      employeeId: selectedEmployeeForDialog.employeeId,
      date: dateStr,
      isHoliday: !isCurrentlyHoliday
    });
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
                    <DialogContent 
                      className="glass-container backdrop-blur-md bg-slate-900/90 border border-white/20 text-white max-w-md"
                      aria-describedby="schedule-dialog-description"
                    >
                      <DialogHeader>
                        <DialogTitle>إنشاء جدول عمل جديد</DialogTitle>
                      </DialogHeader>
                      
                      <div id="schedule-dialog-description" className="sr-only">
                        إنشاء جدول عمل جديد للموظف مع تحديد نوع الدوام والأوقات المطلوبة
                      </div>
                      
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
                          {/* Bar-style Calendar */}
                          <div className="bg-white/5 rounded-lg p-6 space-y-3">
                            {/* Calendar Days as Progress Bars */}
                            {monthDays.map((day) => {
                              const dayStr = format(day, "yyyy-MM-dd");
                              const dayAttendance = monthAttendance.find(a => a.date === dayStr);
                              const isToday = isSameDay(day, new Date());
                              const hasAttendance = !!dayAttendance;
                              const isHoliday = dayAttendance?.notes === 'إجازة';
                              const hasApprovedLeaveForDay = hasApprovedLeave(schedule.employeeId, day);
                              const isLate = hasAttendance && !isHoliday && !hasApprovedLeaveForDay && isEmployeeLate(schedule, day);
                              
                              // Calculate hours worked
                              const hoursWorked = hasAttendance && !isHoliday ? parseFloat(calculateHoursWorked(schedule, dayAttendance)) : 0;
                              const expectedHours = schedule.scheduleType === "متصل" ? 8 : 8; // Default 8 hours
                              const workPercentage = Math.min((hoursWorked / expectedHours) * 100, 100);
                              
                              // Get day name in Arabic
                              const dayName = format(day, "EEEE", { locale: ar });
                              
                              return (
                                <div
                                  key={day.toISOString()}
                                  className={`
                                    group cursor-pointer transition-all duration-300 hover:scale-[1.02]
                                    ${isToday ? 'ring-2 ring-blue-400 rounded-lg p-1' : ''}
                                  `}
                                  onClick={() => handleDayClick(day, schedule)}
                                >
                                  <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                                    {/* Date Info */}
                                    <div className="flex flex-col items-center min-w-[80px]">
                                      <div className={`text-2xl font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                                        {format(day, "d")}
                                      </div>
                                      <div className="text-xs text-gray-400 truncate">
                                        {dayName}
                                      </div>
                                    </div>
                                    
                                    {/* Progress Bar Container */}
                                    <div className="flex-1 space-y-1">
                                      <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-300">
                                          {isHoliday ? 'إجازة' : hasApprovedLeaveForDay ? 'إجازة معتمدة' : hasAttendance ? `${hoursWorked.toFixed(1)} ساعة` : 'لا يوجد سجل'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {hasAttendance && !isHoliday && !hasApprovedLeaveForDay ? `${workPercentage.toFixed(0)}%` : ''}
                                        </div>
                                      </div>
                                      
                                      {/* Progress Bar */}
                                      <div className="relative h-6 bg-gray-700/50 rounded-full overflow-hidden">
                                        {/* Background gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/30 to-gray-600/50"></div>
                                        
                                        {/* Progress fill */}
                                        {isHoliday || hasApprovedLeaveForDay ? (
                                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                                            <Coffee className="w-4 h-4 text-white" />
                                          </div>
                                        ) : hasAttendance ? (
                                          <div 
                                            className={`
                                              h-full transition-all duration-500 flex items-center justify-center
                                              ${isLate ? 'bg-gradient-to-r from-red-500 to-red-600' : ''}
                                              ${workPercentage >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
                                              ${workPercentage >= 75 && workPercentage < 100 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}
                                              ${workPercentage >= 50 && workPercentage < 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
                                              ${workPercentage < 50 && workPercentage > 0 ? 'bg-gradient-to-r from-orange-500 to-red-500' : ''}
                                            `}
                                            style={{ width: `${Math.max(workPercentage, 10)}%` }}
                                          >
                                            {isLate ? (
                                              <XCircle className="w-3 h-3 text-white" />
                                            ) : workPercentage >= 100 ? (
                                              <CheckCircle className="w-3 h-3 text-white" />
                                            ) : workPercentage > 0 ? (
                                              <Clock className="w-3 h-3 text-white" />
                                            ) : null}
                                          </div>
                                        ) : (
                                          <div className="h-full bg-gradient-to-r from-gray-600/20 to-gray-600/30 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                                          </div>
                                        )}
                                        
                                        {/* Glow effect for today */}
                                        {isToday && (
                                          <div className="absolute inset-0 bg-blue-400/20 animate-pulse"></div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Status Icon */}
                                    <div className="min-w-[40px] flex justify-center">
                                      {isHoliday || hasApprovedLeaveForDay ? (
                                        <Coffee className="w-5 h-5 text-yellow-400" />
                                      ) : hasAttendance ? (
                                        isLate ? (
                                          <XCircle className="w-5 h-5 text-red-400" />
                                        ) : workPercentage >= 100 ? (
                                          <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : (
                                          <Clock className="w-5 h-5 text-blue-400" />
                                        )
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-gray-500 rounded-full opacity-30"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Enhanced Legend */}
                          <div className="bg-white/5 rounded-lg p-4 mt-4">
                            <h4 className="text-white font-semibold mb-3 text-center">دليل الألوان والحالات</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                                <span className="text-green-200 font-medium">100%+ (مكتمل)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                                <span className="text-blue-200 font-medium">75-99% (جيد)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                                <span className="text-yellow-200 font-medium">50-74% (مقبول)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                                <span className="text-orange-200 font-medium">25-49% (ضعيف)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                                <span className="text-red-200 font-medium">تأخير</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                                  <Coffee className="w-2 h-2 text-white" />
                                </div>
                                <span className="text-yellow-200 font-medium">إجازة</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 bg-gray-600/30 rounded-full"></div>
                                <span className="text-gray-300 font-medium">لا يوجد سجل</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-3 border-2 border-blue-400 rounded-full bg-blue-400/20"></div>
                                <span className="text-blue-300 font-medium">اليوم الحالي</span>
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

              {/* Redesigned Attendance Dialog */}
              <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
                <DialogContent 
                  className="glass-container backdrop-blur-md bg-slate-900/90 border border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto"
                  aria-describedby="attendance-dialog-description"
                >
                  <DialogHeader>
                    <DialogTitle className="text-xl text-center">
                      إدارة الحضور - {selectedEmployeeForDialog?.employeeName}
                    </DialogTitle>
                    <p className="text-gray-300 text-center">
                      {selectedDayForAttendance && format(selectedDayForAttendance, "EEEE، dd MMMM yyyy", { locale: ar })}
                    </p>
                  </DialogHeader>
                  
                  <div id="attendance-dialog-description" className="sr-only">
                    إدارة حضور وانصراف الموظف للتاريخ المحدد مع إمكانية تعديل الأوقات وتحديد الإجازات
                  </div>
                  
                  {selectedEmployeeForDialog && selectedDayForAttendance && (() => {
                    const dateStr = format(selectedDayForAttendance, "yyyy-MM-dd");
                    const existingAttendance = dailyAttendance.find(a => 
                      a.employeeId === selectedEmployeeForDialog.employeeId && 
                      a.date === dateStr
                    );
                    
                    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div className="space-y-6" dir="rtl">
                        {/* Employee Info */}
                        <div className="bg-white/5 rounded-lg p-4 text-center">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">الموظف: </span>
                              <span className="text-white font-medium">{selectedEmployeeForDialog.employeeName}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">نوع الدوام: </span>
                              <span className="text-white font-medium">{selectedEmployeeForDialog.scheduleType}</span>
                            </div>
                          </div>
                        </div>

                        {selectedEmployeeForDialog.scheduleType === "متصل" ? (
                          /* Continuous Schedule - 2 Fields */
                          <div className="bg-white/5 rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-6 text-center text-blue-300">الدوام المتصل</h3>
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300 text-center">وقت الحضور الفعلي</label>
                                <div className="flex gap-3 justify-center">
                                  <Input
                                    type="time"
                                    value={existingAttendance?.continuousCheckinTime || currentTime}
                                    onChange={(e) => {
                                      if (existingAttendance) {
                                        handleAttendanceUpdate(existingAttendance.id, 'continuousCheckinTime', e.target.value);
                                      }
                                    }}
                                    className="text-2xl h-16 text-center font-mono bg-white/10 border-white/20 text-white"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                      if (existingAttendance) {
                                        handleAttendanceUpdate(existingAttendance.id, 'continuousCheckinTime', time);
                                      }
                                    }}
                                    className="h-16 px-4 border-white/20 hover:bg-white/10"
                                  >
                                    <Clock className="w-5 h-5" />
                                  </Button>
                                </div>
                                <div className="text-xs text-gray-400 text-center">
                                  الوقت المحدد: {selectedEmployeeForDialog.continuousStartTime}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300 text-center">وقت الانصراف الفعلي</label>
                                <div className="flex gap-3 justify-center">
                                  <Input
                                    type="time"
                                    value={existingAttendance?.continuousCheckoutTime || currentTime}
                                    onChange={(e) => {
                                      if (existingAttendance) {
                                        handleAttendanceUpdate(existingAttendance.id, 'continuousCheckoutTime', e.target.value);
                                      }
                                    }}
                                    className="text-2xl h-16 text-center font-mono bg-white/10 border-white/20 text-white"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                      if (existingAttendance) {
                                        handleAttendanceUpdate(existingAttendance.id, 'continuousCheckoutTime', time);
                                      }
                                    }}
                                    className="h-16 px-4 border-white/20 hover:bg-white/10"
                                  >
                                    <Clock className="w-5 h-5" />
                                  </Button>
                                </div>
                                <div className="text-xs text-gray-400 text-center">
                                  الوقت المحدد: {selectedEmployeeForDialog.continuousEndTime}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Split Schedule - 4 Fields */
                          <div className="space-y-6">
                            <h3 className="font-semibold text-lg text-center text-blue-300">الدوام المنفصل</h3>
                            
                            {/* Morning Period */}
                            <div className="bg-white/5 rounded-lg p-6">
                              <h4 className="font-medium mb-4 text-center text-orange-400">الفترة الصباحية</h4>
                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-300 text-center">وقت الحضور الصباحي</label>
                                  <div className="flex gap-3 justify-center">
                                    <Input
                                      type="time"
                                      value={existingAttendance?.morningCheckinTime || currentTime}
                                      onChange={(e) => {
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'morningCheckinTime', e.target.value);
                                        }
                                      }}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'morningCheckinTime', time);
                                        }
                                      }}
                                      className="h-12 px-3 border-white/20 hover:bg-white/10"
                                    >
                                      <Clock className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="text-xs text-gray-400 text-center">
                                    الوقت المحدد: {selectedEmployeeForDialog.morningStartTime}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-300 text-center">وقت الانصراف الصباحي</label>
                                  <div className="flex gap-3 justify-center">
                                    <Input
                                      type="time"
                                      value={existingAttendance?.morningCheckoutTime || currentTime}
                                      onChange={(e) => {
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'morningCheckoutTime', e.target.value);
                                        }
                                      }}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'morningCheckoutTime', time);
                                        }
                                      }}
                                      className="h-12 px-3 border-white/20 hover:bg-white/10"
                                    >
                                      <Clock className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="text-xs text-gray-400 text-center">
                                    الوقت المحدد: {selectedEmployeeForDialog.morningEndTime}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Evening Period */}
                            <div className="bg-white/5 rounded-lg p-6">
                              <h4 className="font-medium mb-4 text-center text-purple-400">الفترة المسائية</h4>
                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-300 text-center">وقت الحضور المسائي</label>
                                  <div className="flex gap-3 justify-center">
                                    <Input
                                      type="time"
                                      value={existingAttendance?.eveningCheckinTime || currentTime}
                                      onChange={(e) => {
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'eveningCheckinTime', e.target.value);
                                        }
                                      }}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'eveningCheckinTime', time);
                                        }
                                      }}
                                      className="h-12 px-3 border-white/20 hover:bg-white/10"
                                    >
                                      <Clock className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="text-xs text-gray-400 text-center">
                                    الوقت المحدد: {selectedEmployeeForDialog.eveningStartTime}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <label className="block text-sm font-medium text-gray-300 text-center">وقت الانصراف المسائي</label>
                                  <div className="flex gap-3 justify-center">
                                    <Input
                                      type="time"
                                      value={existingAttendance?.eveningCheckoutTime || currentTime}
                                      onChange={(e) => {
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'eveningCheckoutTime', e.target.value);
                                        }
                                      }}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                        if (existingAttendance) {
                                          handleAttendanceUpdate(existingAttendance.id, 'eveningCheckoutTime', time);
                                        }
                                      }}
                                      className="h-12 px-3 border-white/20 hover:bg-white/10"
                                    >
                                      <Clock className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="text-xs text-gray-400 text-center">
                                    الوقت المحدد: {selectedEmployeeForDialog.eveningEndTime}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 pt-6 border-t border-white/10">
                          <Button
                            onClick={handleMarkHoliday}
                            variant="outline"
                            className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border-yellow-400/50 px-8"
                            disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending || markHolidayMutation.isPending}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {existingAttendance?.notes === 'إجازة' ? 'إلغاء الإجازة' : 'تحديد كإجازة'}
                          </Button>
                          
                          <Button
                            onClick={() => {
                              // Save attendance data with current form values
                              if (!existingAttendance) {
                                // Create new attendance record
                                const attendanceData = {
                                  employeeId: selectedEmployeeForDialog.employeeId,
                                  employeeName: selectedEmployeeForDialog.employeeName,
                                  date: dateStr,
                                  scheduleType: selectedEmployeeForDialog.scheduleType,
                                  ...(selectedEmployeeForDialog.scheduleType === "متصل" 
                                    ? {
                                        continuousCheckinTime: currentTime,
                                        continuousCheckoutTime: currentTime
                                      }
                                    : {
                                        morningCheckinTime: currentTime,
                                        morningCheckoutTime: currentTime,
                                        eveningCheckinTime: currentTime,
                                        eveningCheckoutTime: currentTime
                                      }
                                  )
                                };
                                createAttendanceMutation.mutate(attendanceData);
                              } else {
                                // Update existing attendance with current form values
                                toast({ title: "تم حفظ بيانات الحضور بنجاح" });
                                setIsAttendanceDialogOpen(false);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-12"
                            disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            حفظ
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => setIsAttendanceDialogOpen(false)}
                            disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                            className="px-8 border-white/20 text-white hover:bg-white/10"
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