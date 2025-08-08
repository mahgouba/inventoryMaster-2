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
  Coffee,
  CheckSquare,
  Printer,
  Search,
  Filter
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
  const [isCreateRequestDialogOpen, setIsCreateRequestDialogOpen] = useState(false);

  // Create request form states
  const [requestType, setRequestType] = useState<string>("استئذان");
  const [requestDate, setRequestDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState<string>("");
  const [durationType, setDurationType] = useState<string>("ساعة");
  const [reason, setReason] = useState<string>("");

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

  // Fetch approved leave requests
  const { data: approvedLeaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
    select: (data) => data.filter(request => request.status === "approved"),
  });

  // Fetch employee work schedules
  const { data: workSchedules = [] } = useQuery<EmployeeWorkSchedule[]>({
    queryKey: ["/api/employee-work-schedules"],
  });

  // Fetch all daily attendance data
  const { data: dailyAttendance = [], refetch: refetchAttendance } = useQuery<DailyAttendance[]>({
    queryKey: ["/api/daily-attendance"],
    refetchInterval: 2000, // Refetch every 2 seconds
  });

  // Set default scheduled times when attendance dialog opens
  useEffect(() => {
    if (isAttendanceDialogOpen && selectedEmployeeForDialog) {
      const existingAttendance = dailyAttendance?.find((record: DailyAttendance) => 
        record.employeeId === selectedEmployeeForDialog.employeeId && 
        record.date === selectedDayForAttendance?.toISOString().split('T')[0]
      );
      
      if (!existingAttendance) {
        setTimeout(() => {
          // Default scheduled times
          const defaultTimes = {
            'continuous-checkin-time': '12:00',    // 12:00 PM
            'continuous-checkout-time': '22:00',   // 10:00 PM
            'morning-checkin-time': '09:30',       // 09:30 AM
            'morning-checkout-time': '13:00',      // 01:00 PM
            'evening-checkin-time': '16:00',       // 04:00 PM
            'evening-checkout-time': '21:00'       // 09:00 PM
          };
          
          Object.entries(defaultTimes).forEach(([inputId, defaultTime]) => {
            const input = document.getElementById(inputId) as HTMLInputElement;
            if (input) {
              input.value = defaultTime;
            }
          });
        }, 100);
      }
    }
  }, [isAttendanceDialogOpen, selectedEmployeeForDialog, selectedDayForAttendance, dailyAttendance]);

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

  // Create leave request mutation
  const createLeaveRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestData,
          requestedBy: userId,
          requestedByName: username,
          status: "pending"
        }),
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
        title: "تم إنشاء الطلب",
        description: "تم إرسال طلب الإجازة/الاستئذان بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      setIsCreateRequestDialogOpen(false);
      resetRequestForm();
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الطلب",
        description: "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    },
  });

  // Reset request form
  const resetRequestForm = () => {
    setRequestType("استئذان");
    setRequestDate(format(new Date(), "yyyy-MM-dd"));
    setDuration("");
    setDurationType("ساعة");
    setReason("");
  };

  // Handle create request
  const handleCreateRequest = () => {
    if (!duration || !reason) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      userId: userId,
      userName: username,
      requestType,
      startDate: requestDate,
      endDate: requestType === "إجازة" ? requestDate : null,
      duration: parseInt(duration),
      durationType: requestType === "إجازة" ? "يوم" : durationType,
      reason,
    };

    createLeaveRequestMutation.mutate(requestData);
  };

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
      queryClient.refetchQueries({ queryKey: ["/api/daily-attendance"] });
      
      // Also refresh other related queries
      queryClient.invalidateQueries({ queryKey: ["/api/employee-work-schedules"] });
      
      // Force re-fetch attendance data immediately
      refetchAttendance();
      
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

  // Handle printing approved requests
  const handlePrintRequest = (request: LeaveRequest) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب إجازة/استئذان معتمد - ${request.userName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Noto Sans Arabic', Arial, sans-serif;
            background: white;
            color: #333;
            line-height: 1.6;
            padding: 40px;
            direction: rtl;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #0891b2;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #0891b2;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header p {
            color: #64748b;
            font-size: 16px;
          }
          
          .request-card {
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
            background: #f8fafc;
          }
          
          .request-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .request-title {
            font-size: 22px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .status-badge {
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 14px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .detail-item {
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          
          .detail-label {
            font-weight: 600;
            color: #64748b;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .detail-value {
            font-size: 16px;
            color: #1e293b;
            font-weight: 500;
          }
          
          .reason-section {
            margin: 20px 0;
            padding: 20px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          
          .reason-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 16px;
          }
          
          .reason-text {
            color: #475569;
            line-height: 1.7;
            font-size: 15px;
          }
          
          .approval-section {
            background: #dcfdf7;
            border: 1px solid #6ee7b7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          
          .approval-title {
            color: #059669;
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>طلب إجازة/استئذان معتمد</h1>
          <p>نظام إدارة الموارد البشرية</p>
        </div>
        
        <div class="request-card">
          <div class="request-header">
            <div class="request-title">${request.requestType} - ${request.userName}</div>
            <div class="status-badge">معتمد ✓</div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">اسم الموظف</div>
              <div class="detail-value">${request.userName}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">نوع الطلب</div>
              <div class="detail-value">${request.requestType}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">تاريخ البداية</div>
              <div class="detail-value">${new Date(request.startDate).toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
              })}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">المدة</div>
              <div class="detail-value">${request.duration} ${request.durationType}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">رقم الطلب</div>
              <div class="detail-value">#${request.id}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">تاريخ تقديم الطلب</div>
              <div class="detail-value">${new Date(request.createdAt).toLocaleDateString('ar-SA')}</div>
            </div>
          </div>
          
          ${request.reason ? `
            <div class="reason-section">
              <div class="reason-title">سبب الطلب:</div>
              <div class="reason-text">${request.reason}</div>
            </div>
          ` : ''}
          
          <div class="approval-section">
            <div class="approval-title">
              ✓ تم اعتماد الطلب
            </div>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">المسؤول المعتمد</div>
                <div class="detail-value">${request.approvedByName || 'غير محدد'}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">تاريخ الاعتماد</div>
                <div class="detail-value">${request.approvedAt ? new Date(request.approvedAt).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-SA')}</p>
          <p>نظام إدارة الموارد البشرية - ${new Date().getFullYear()}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
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

  // حساب الساعات المتوقعة بناءً على جدول العمل الفعلي
  const calculateExpectedHours = (schedule: EmployeeWorkSchedule, day?: Date): number => {
    // التحقق من يوم الجمعة (دوام خاص من 4:00 مساءً إلى 9:00 مساءً)
    if (day && format(day, "EEEE", { locale: ar }) === "الجمعة") {
      return 5; // 5 ساعات في يوم الجمعة (4:00 PM - 9:00 PM)
    }
    
    if (schedule.scheduleType === "متصل") {
      if (schedule.continuousStartTime && schedule.continuousEndTime) {
        const startTime = new Date(`2024-01-01T${schedule.continuousStartTime}`);
        const endTime = new Date(`2024-01-01T${schedule.continuousEndTime}`);
        return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      }
    } else {
      let totalExpectedHours = 0;
      if (schedule.morningStartTime && schedule.morningEndTime) {
        const morningStart = new Date(`2024-01-01T${schedule.morningStartTime}`);
        const morningEnd = new Date(`2024-01-01T${schedule.morningEndTime}`);
        totalExpectedHours += (morningEnd.getTime() - morningStart.getTime()) / (1000 * 60 * 60);
      }
      if (schedule.eveningStartTime && schedule.eveningEndTime) {
        const eveningStart = new Date(`2024-01-01T${schedule.eveningStartTime}`);
        const eveningEnd = new Date(`2024-01-01T${schedule.eveningEndTime}`);
        totalExpectedHours += (eveningEnd.getTime() - eveningStart.getTime()) / (1000 * 60 * 60);
      }
      return totalExpectedHours;
    }
    return 8; // Default fallback
  };

  // دالة طباعة تقرير الحضور الشهري
  const handlePrintMonthlyReport = (schedule: EmployeeWorkSchedule) => {
    const monthAttendance = getEmployeeMonthAttendance(schedule.employeeId);
    const monthDays = getMonthDays();
    const monthName = format(currentMonth, "MMMM yyyy", { locale: ar });
    
    // إنشاء محتوى التقرير
    const reportContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">تقرير الحضور والإنصراف الشهري</h1>
          <h2 style="color: #666; font-size: 18px; margin-bottom: 5px;">الموظف: ${schedule.employeeName}</h2>
          <h3 style="color: #666; font-size: 16px; margin-bottom: 5px;">شهر: ${monthName}</h3>
          <p style="color: #888; font-size: 14px;">نوع الدوام: ${schedule.scheduleType}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">التاريخ</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">اليوم</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الحضور</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الانصراف</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">ساعات العمل</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${monthDays.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayAttendance = monthAttendance.find(a => a.date === dateStr);
              const dayName = format(day, "EEEE", { locale: ar });
              const isHoliday = dayAttendance?.notes === 'إجازة';
              const hasApprovedLeaveForDay = hasApprovedLeave(schedule.employeeId, day);
              
              let checkinTime = '-';
              let checkoutTime = '-';
              let workHours = '0.00';
              let status = 'غائب';
              
              if (isHoliday) {
                status = 'إجازة';
              } else if (hasApprovedLeaveForDay) {
                status = 'إجازة معتمدة';
              } else if (dayAttendance) {
                if (schedule.scheduleType === "متصل") {
                  checkinTime = dayAttendance.continuousCheckinTime || '-';
                  checkoutTime = dayAttendance.continuousCheckoutTime || '-';
                } else {
                  const morningIn = dayAttendance.morningCheckinTime;
                  const morningOut = dayAttendance.morningCheckoutTime;
                  const eveningIn = dayAttendance.eveningCheckinTime;
                  const eveningOut = dayAttendance.eveningCheckoutTime;
                  checkinTime = [morningIn, eveningIn].filter(t => t).join(', ') || '-';
                  checkoutTime = [morningOut, eveningOut].filter(t => t).join(', ') || '-';
                }
                workHours = calculateHoursWorked(schedule, dayAttendance);
                status = 'حاضر';
              }
              
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${format(day, "dd/MM/yyyy", { locale: ar })}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${dayName}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${checkinTime}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${checkoutTime}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${workHours}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold;
                    color: ${status === 'حاضر' ? '#22c55e' : status === 'إجازة' || status === 'إجازة معتمدة' ? '#3b82f6' : '#ef4444'};">
                    ${status}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #333; margin-bottom: 10px;">ملخص الشهر:</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
              <strong>إجمالي أيام العمل:</strong> ${monthDays.length} يوم
            </div>
            <div>
              <strong>أيام الحضور:</strong> ${monthAttendance.filter(a => a.notes !== 'إجازة').length} يوم
            </div>
            <div>
              <strong>أيام الإجازة:</strong> ${monthAttendance.filter(a => a.notes === 'إجازة').length} يوم
            </div>
            <div>
              <strong>إجمالي ساعات العمل:</strong> ${monthAttendance
                .filter(a => a.notes !== 'إجازة')
                .reduce((total, a) => total + parseFloat(calculateHoursWorked(schedule, a)), 0)
                .toFixed(2)} ساعة
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
          <p>تم إنشاء التقرير في: ${new Date().toLocaleString('ar-SA')}</p>
        </div>
      </div>
    `;
    
    // فتح نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>تقرير الحضور - ${schedule.employeeName} - ${monthName}</title>
            <meta charset="utf-8">
            <style>
              @media print {
                body { margin: 0; }
                @page { size: A4; margin: 1cm; }
              }
            </style>
          </head>
          <body>
            ${reportContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <GlassBackground>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الحضور والإنصراف والإستئذان</h1>
          <p className="text-gray-300">إدارة شاملة لحضور الموظفين وطلبات الإجازة والاستئذان</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-container backdrop-blur-md bg-white/10 border border-white/20">
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
            <TabsTrigger 
              value="approved-requests" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-testid="tab-approved-requests"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              الطلبات المعتمدة ({approvedLeaveRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Leave Requests Tab */}
          <TabsContent value="pending-requests" className="mt-6">
            <GlassContainer className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">طلبات الإجازة والاستئذان المعلقة</h2>
                <div className="flex gap-3 items-center">
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                    {pendingLeaveRequests.length} طلب معلق
                  </Badge>
                </div>
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
                          <Button
                            onClick={() => handlePrintMonthlyReport(schedule)}
                            size="sm"
                            variant="outline"
                            className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            طباعة التقرير
                          </Button>
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
                              const expectedHours = calculateExpectedHours(schedule, day);
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
                    
                    // Get default times - show scheduled times for new records
                    const getDefaultTime = (fieldType: string) => {
                      if (existingAttendance) {
                        // If attendance record exists, show saved time
                        return (existingAttendance as any)[fieldType] || getScheduledDefaultTime(fieldType);
                      } else {
                        // If no attendance record, show scheduled default times
                        return getScheduledDefaultTime(fieldType);
                      }
                    };

                    // Get scheduled default times based on field type
                    const getScheduledDefaultTime = (fieldType: string) => {
                      switch (fieldType) {
                        case 'continuousCheckinTime': return '12:00';   // 12:00 PM
                        case 'continuousCheckoutTime': return '22:00';  // 10:00 PM
                        case 'morningCheckinTime': return '09:30';      // 09:30 AM
                        case 'morningCheckoutTime': return '13:00';     // 01:00 PM
                        case 'eveningCheckinTime': return '16:00';      // 04:00 PM
                        case 'eveningCheckoutTime': return '21:00';     // 09:00 PM
                        default: return currentTime;
                      }
                    };

                    // Function to set current time in input fields when dialog opens
                    const setCurrentTimeToInputs = () => {
                      if (!existingAttendance) {
                        setTimeout(() => {
                          const timeInputs = ['continuous-checkin-time', 'continuous-checkout-time', 'morning-checkin-time', 'morning-checkout-time', 'evening-checkin-time', 'evening-checkout-time'];
                          timeInputs.forEach(inputId => {
                            const input = document.getElementById(inputId) as HTMLInputElement;
                            if (input) {
                              input.value = currentTime;
                            }
                          });
                        }, 100);
                      }
                    };
                    
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
                                    defaultValue={getDefaultTime('continuousCheckinTime')}
                                    className="text-2xl h-16 text-center font-mono bg-white/10 border-white/20 text-white"
                                    id="continuous-checkin-time"
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
                                    defaultValue={getDefaultTime('continuousCheckoutTime')}
                                    className="text-2xl h-16 text-center font-mono bg-white/10 border-white/20 text-white"
                                    id="continuous-checkout-time"
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
                                      defaultValue={getDefaultTime('morningCheckinTime')}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                      id="morning-checkin-time"
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
                                      defaultValue={getDefaultTime('morningCheckoutTime')}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                      id="morning-checkout-time"
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
                                      defaultValue={getDefaultTime('eveningCheckinTime')}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                      id="evening-checkin-time"
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
                                      defaultValue={getDefaultTime('eveningCheckoutTime')}
                                      className="text-lg h-12 text-center font-mono bg-white/10 border-white/20 text-white"
                                      id="evening-checkout-time"
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
                              // Get values from time inputs
                              const getInputValue = (id: string) => {
                                const input = document.getElementById(id) as HTMLInputElement;
                                return input?.value || currentTime;
                              };

                              if (!existingAttendance) {
                                // Create new attendance record with values from time inputs
                                const attendanceData = {
                                  employeeId: selectedEmployeeForDialog.employeeId,
                                  employeeName: selectedEmployeeForDialog.employeeName,
                                  date: dateStr,
                                  scheduleType: selectedEmployeeForDialog.scheduleType,
                                  ...(selectedEmployeeForDialog.scheduleType === "متصل" 
                                    ? {
                                        continuousCheckinTime: getInputValue('continuous-checkin-time'),
                                        continuousCheckoutTime: getInputValue('continuous-checkout-time')
                                      }
                                    : {
                                        morningCheckinTime: getInputValue('morning-checkin-time'),
                                        morningCheckoutTime: getInputValue('morning-checkout-time'),
                                        eveningCheckinTime: getInputValue('evening-checkin-time'),
                                        eveningCheckoutTime: getInputValue('evening-checkout-time')
                                      }
                                  )
                                };
                                createAttendanceMutation.mutate(attendanceData);
                              } else {
                                // Update existing attendance with values from time inputs
                                if (selectedEmployeeForDialog.scheduleType === "متصل") {
                                  const checkinTime = getInputValue('continuous-checkin-time');
                                  const checkoutTime = getInputValue('continuous-checkout-time');
                                  handleAttendanceUpdate(existingAttendance.id, 'continuousCheckinTime', checkinTime);
                                  setTimeout(() => handleAttendanceUpdate(existingAttendance.id, 'continuousCheckoutTime', checkoutTime), 100);
                                } else {
                                  const morningCheckin = getInputValue('morning-checkin-time');
                                  const morningCheckout = getInputValue('morning-checkout-time');
                                  const eveningCheckin = getInputValue('evening-checkin-time');
                                  const eveningCheckout = getInputValue('evening-checkout-time');
                                  
                                  handleAttendanceUpdate(existingAttendance.id, 'morningCheckinTime', morningCheckin);
                                  setTimeout(() => handleAttendanceUpdate(existingAttendance.id, 'morningCheckoutTime', morningCheckout), 100);
                                  setTimeout(() => handleAttendanceUpdate(existingAttendance.id, 'eveningCheckinTime', eveningCheckin), 200);
                                  setTimeout(() => handleAttendanceUpdate(existingAttendance.id, 'eveningCheckoutTime', eveningCheckout), 300);
                                }
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-12"
                            disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            حفظ الأوقات
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

          {/* Approved Requests Tab */}
          <TabsContent value="approved-requests" className="mt-6">
            <GlassContainer className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">الطلبات المعتمدة</h2>
                <div className="flex gap-3 items-center">
                  <Button
                    onClick={() => setIsCreateRequestDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="create-request-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إنشاء طلب جديد
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckSquare className="w-4 h-4" />
                    <span>إجمالي الطلبات المعتمدة: {approvedLeaveRequests.length}</span>
                  </div>
                </div>
              </div>

              {approvedLeaveRequests.length > 0 ? (
                <div className="space-y-4">
                  {approvedLeaveRequests.map((request) => (
                    <GlassCard key={request.id} className="p-6 transition-all duration-300 hover:bg-white/15">
                      <div className="space-y-4">
                        {/* Header with employee info and status */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                              <CheckSquare className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-white">{request.userName}</h3>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  {request.requestType}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">رقم الطلب: #{request.id}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintRequest(request)}
                            className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            طباعة
                          </Button>
                        </div>

                        {/* Request details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="space-y-1">
                            <span className="text-gray-400">تاريخ البداية:</span>
                            <div className="text-white font-medium">
                              {new Date(request.startDate).toLocaleDateString('ar-SA', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-400">المدة:</span>
                            <div className="text-white font-medium">
                              {request.duration} {request.durationType}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-400">وافق عليه:</span>
                            <div className="text-green-400 font-medium">
                              {request.approvedByName || 'غير محدد'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-gray-400">تاريخ الموافقة:</span>
                            <div className="text-white font-medium">
                              {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        {request.reason && (
                          <div className="space-y-2">
                            <span className="text-gray-400 text-sm">سبب الطلب:</span>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-white text-sm leading-relaxed">{request.reason}</p>
                            </div>
                          </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>تم إنشاء الطلب: {new Date(request.createdAt).toLocaleString('ar-SA')}</div>
                            {request.approvedAt && (
                              <div>تمت الموافقة: {new Date(request.approvedAt).toLocaleString('ar-SA')}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">لا توجد طلبات معتمدة</p>
                  <p className="text-gray-400">لم يتم العثور على أي طلبات إجازة أو استئذان معتمدة</p>
                </div>
              )}
            </GlassContainer>
          </TabsContent>

          {/* Create Request Dialog */}
          <Dialog open={isCreateRequestDialogOpen} onOpenChange={setIsCreateRequestDialogOpen}>
            <DialogContent 
              className="glass-container backdrop-blur-md bg-slate-900/90 border border-white/20 text-white max-w-md"
              aria-describedby="create-request-dialog-description"
            >
              <DialogHeader>
                <DialogTitle className="text-xl text-center">إنشاء طلب جديد</DialogTitle>
              </DialogHeader>
              
              <div id="create-request-dialog-description" className="sr-only">
                نموذج إنشاء طلب إجازة أو استئذان جديد
              </div>
              
              <div className="space-y-4" dir="rtl">
                {/* اسم المستخدم */}
                <div>
                  <Label className="text-gray-300">اسم المستخدم</Label>
                  <Input 
                    value={username} 
                    disabled 
                    className="bg-white/5 border-white/20 text-white" 
                  />
                </div>

                {/* نوع الطلب */}
                <div>
                  <Label className="text-gray-300">نوع الطلب</Label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="استئذان">استئذان (ساعات)</SelectItem>
                      <SelectItem value="إجازة">إجازة (أيام)</SelectItem>
                      <SelectItem value="تأخير في الحضور">تأخير في الحضور</SelectItem>
                      <SelectItem value="انصراف مبكر">انصراف مبكر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* تاريخ البداية / الوقت */}
                <div>
                  <Label className="text-gray-300">
                    {requestType === "إجازة" ? "تاريخ البداية" : "التاريخ"}
                  </Label>
                  <Select value={requestDate} onValueChange={setRequestDate}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value={format(new Date(), "yyyy-MM-dd")}>
                        اليوم - {format(new Date(), "dd/MM/yyyy", { locale: ar })}
                      </SelectItem>
                      <SelectItem value={format(new Date(Date.now() - 24 * 60 * 60 * 1000), "yyyy-MM-dd")}>
                        أمس - {format(new Date(Date.now() - 24 * 60 * 60 * 1000), "dd/MM/yyyy", { locale: ar })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* المدة */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-gray-300">المدة</Label>
                    <Input 
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="المدة"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">الوحدة</Label>
                    <Select 
                      value={requestType === "إجازة" ? "يوم" : durationType} 
                      onValueChange={setDurationType}
                      disabled={requestType === "إجازة"}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {requestType === "إجازة" ? (
                          <SelectItem value="يوم">يوم</SelectItem>
                        ) : (
                          <SelectItem value="ساعة">ساعة</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* السبب */}
                <div>
                  <Label className="text-gray-300">السبب</Label>
                  <Textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-white/10 border-white/20 text-white resize-none"
                    placeholder="اكتب سبب الطلب..."
                    rows={3}
                  />
                </div>

                {/* أزرار العمل */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateRequest}
                    disabled={createLeaveRequestMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    {createLeaveRequestMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateRequestDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Tabs>
      </div>
    </GlassBackground>
  );
}