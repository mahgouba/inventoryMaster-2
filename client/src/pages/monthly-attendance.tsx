import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  Coffee,
  XCircle,
  User
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from "date-fns";
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

interface AttendanceRequest {
  id: number;
  requestType: string;
  date: string;
  timeFrom?: string;
  timeTo?: string;
  duration: number;
  durationType: string;
  reason: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  employeeName?: string;
}

interface MonthlyAttendancePageProps {
  userRole: string;
  username: string;
  userId: number;
}

export default function MonthlyAttendancePage({ userRole, username, userId }: MonthlyAttendancePageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch daily attendance data
  const { data: dailyAttendance = [] } = useQuery<DailyAttendance[]>({
    queryKey: ["/api/daily-attendance"],
  });

  // Fetch attendance requests
  const { data: attendanceRequests = [] } = useQuery<AttendanceRequest[]>({
    queryKey: ["/api/attendance-requests"],
  });

  // Get calendar days for current month
  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Get attendance for current user and month
  const getUserMonthAttendance = () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    return dailyAttendance.filter(attendance => 
      attendance.employeeId === userId && 
      attendance.date >= start && 
      attendance.date <= end
      // Remove isConfirmed filter to show all attendance records
    );
  };

  // Get approved attendance requests for the month
  const getApprovedRequests = () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    return attendanceRequests.filter(request => 
      request.date >= start && 
      request.date <= end &&
      request.status === 'approved'
    );
  };

  // Check if user has approved leave for a specific day
  const hasApprovedRequestForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return getApprovedRequests().some(request => request.date === dayStr);
  };

  // Get approved request details for a specific day
  const getApprovedRequestForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return getApprovedRequests().find(request => request.date === dayStr);
  };

  // Calculate day status
  const getDayStatus = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayAttendance = getUserMonthAttendance().find(a => a.date === dayStr);
    const approvedRequest = getApprovedRequestForDay(day);
    
    if (dayAttendance) {
      if (dayAttendance.notes === 'إجازة') return 'holiday';
      const totalHours = dayAttendance.totalHoursWorked ? parseFloat(dayAttendance.totalHoursWorked) : 0;
      
      if (totalHours >= 7) {
        // Check if there's an approved late arrival or early departure
        if (approvedRequest) {
          if (approvedRequest.requestType === 'تأخير') return 'late-approved';
          if (approvedRequest.requestType === 'انصراف مبكر') return 'early-departure-approved';
        }
        return 'full';
      }
      if (totalHours >= 4) return 'partial';
      return 'present';
    }
    
    if (approvedRequest) {
      if (approvedRequest.requestType === 'استئذان') return 'permission-approved';
      if (approvedRequest.requestType === 'إجازة') return 'leave-approved';
      return 'approved-request';
    }
    return 'absent';
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'full':
        return { color: 'bg-green-500/20 text-green-300', icon: CheckCircle, text: 'حضور كامل' };
      case 'partial':
        return { color: 'bg-yellow-500/20 text-yellow-300', icon: Clock, text: 'حضور جزئي' };
      case 'present':
        return { color: 'bg-blue-500/20 text-blue-300', icon: CheckCircle, text: 'حاضر' };
      case 'holiday':
        return { color: 'bg-purple-500/20 text-purple-300', icon: Coffee, text: 'إجازة' };
      case 'late-approved':
        return { color: 'bg-orange-500/20 text-orange-300', icon: Clock, text: 'حضور متأخر بإذن' };
      case 'early-departure-approved':
        return { color: 'bg-amber-500/20 text-amber-300', icon: Clock, text: 'انصراف مبكر بإذن' };
      case 'permission-approved':
        return { color: 'bg-cyan-500/20 text-cyan-300', icon: CheckCircle, text: 'استئذان معتمد' };
      case 'leave-approved':
        return { color: 'bg-teal-500/20 text-teal-300', icon: Coffee, text: 'إجازة بإذن' };
      case 'approved-request':
        return { color: 'bg-indigo-500/20 text-indigo-300', icon: CheckCircle, text: 'طلب معتمد' };
      case 'absent':
        return { color: 'bg-red-500/20 text-red-300', icon: XCircle, text: 'غائب' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400', icon: XCircle, text: 'لا يوجد سجل' };
    }
  };

  const monthDays = getMonthDays();
  const userAttendance = getUserMonthAttendance();
  const approvedRequests = getApprovedRequests();

  // Enhanced statistics calculation
  const calculateDetailedStats = () => {
    const workingDays = monthDays.filter(day => {
      const dayOfWeek = day.getDay();
      return dayOfWeek !== 5 && dayOfWeek !== 6; // Exclude Fridays and Saturdays
    });

    const stats = {
      totalWorkingDays: workingDays.length,
      presentDays: 0,
      fullPresenceDays: 0,
      partialPresenceDays: 0,
      absentDays: 0,
      holidayDays: 0,
      lateArrivalWithPermission: 0,
      earlyDepartureWithPermission: 0,
      permissionRequests: 0,
      leaveWithPermission: 0,
      totalApprovedRequests: 0,
      totalHours: userAttendance.reduce((sum, a) => sum + (a.totalHoursWorked ? parseFloat(a.totalHoursWorked) : 0), 0),
      averageHoursPerDay: 0
    };

    workingDays.forEach(day => {
      const status = getDayStatus(day);
      const dayStr = format(day, "yyyy-MM-dd");
      const dayAttendance = userAttendance.find(a => a.date === dayStr);
      
      switch (status) {
        case 'full':
          stats.presentDays++;
          stats.fullPresenceDays++;
          break;
        case 'partial':
          stats.presentDays++;
          stats.partialPresenceDays++;
          break;
        case 'present':
          stats.presentDays++;
          break;
        case 'holiday':
          stats.holidayDays++;
          break;
        case 'late-approved':
          stats.presentDays++;
          stats.fullPresenceDays++;
          stats.lateArrivalWithPermission++;
          stats.totalApprovedRequests++;
          break;
        case 'early-departure-approved':
          stats.presentDays++;
          stats.fullPresenceDays++;
          stats.earlyDepartureWithPermission++;
          stats.totalApprovedRequests++;
          break;
        case 'permission-approved':
          stats.permissionRequests++;
          stats.totalApprovedRequests++;
          break;
        case 'leave-approved':
          stats.leaveWithPermission++;
          stats.totalApprovedRequests++;
          break;
        case 'absent':
          stats.absentDays++;
          break;
      }
    });

    // Calculate average hours per working day (excluding absences and leaves)
    const workingPresenceDays = stats.fullPresenceDays + stats.partialPresenceDays;
    stats.averageHoursPerDay = workingPresenceDays > 0 ? stats.totalHours / workingPresenceDays : 0;

    return stats;
  };

  const detailedStats = calculateDetailedStats();

  return (
    <GlassBackground>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">واجهة الدوام والحضور</h1>
              <p className="text-gray-300">دوام شهر {format(currentMonth, "MMMM yyyy", { locale: ar })}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Enhanced Statistics Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Statistics */}
            <GlassContainer className="p-4">
              <h3 className="text-white font-medium mb-3 text-center">إحصائيات الطلبات المعتمدة</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-300">{detailedStats.presentDays}</div>
                  <div className="text-gray-300 text-xs">أيام الحضور</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-300">{detailedStats.absentDays}</div>
                  <div className="text-gray-300 text-xs">أيام الغياب</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-300">{detailedStats.totalApprovedRequests}</div>
                  <div className="text-gray-300 text-xs">طلبات معتمدة</div>
                </div>
              </div>
            </GlassContainer>

            {/* Tardiness and Early Departure */}
            <GlassContainer className="p-4">
              <h3 className="text-white font-medium mb-3 text-center text-sm">التأخير والانصراف المبكر</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">حضور متأخر بإذن</span>
                  <span className="text-orange-300 font-bold">{detailedStats.lateArrivalWithPermission}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">انصراف مبكر بإذن</span>
                  <span className="text-amber-300 font-bold">{detailedStats.earlyDepartureWithPermission}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">استئذان معتمد</span>
                  <span className="text-cyan-300 font-bold">{detailedStats.permissionRequests}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">إجازة بإذن</span>
                  <span className="text-teal-300 font-bold">{detailedStats.leaveWithPermission}</span>
                </div>
              </div>
            </GlassContainer>

            {/* Work Hours Statistics */}
            <GlassContainer className="p-4">
              <h3 className="text-white font-medium mb-3 text-center text-sm">إحصائيات الساعات</h3>
              <div className="space-y-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{Math.round(detailedStats.totalHours)}</div>
                  <div className="text-gray-300 text-xs">إجمالي الساعات</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-300">{detailedStats.averageHoursPerDay.toFixed(1)}</div>
                  <div className="text-gray-300 text-xs">متوسط الساعات/يوم</div>
                </div>
              </div>
            </GlassContainer>

            {/* Enhanced Legend */}
            <GlassContainer className="p-4">
              <h3 className="text-white font-medium mb-3 text-sm">دليل الألوان</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500/20 rounded"></div>
                  <span className="text-gray-300">حضور كامل</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500/20 rounded"></div>
                  <span className="text-gray-300">حضور جزئي</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500/20 rounded"></div>
                  <span className="text-gray-300">متأخر بإذن</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500/20 rounded"></div>
                  <span className="text-gray-300">انصراف مبكر بإذن</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500/20 rounded"></div>
                  <span className="text-gray-300">استئذان معتمد</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500/20 rounded"></div>
                  <span className="text-gray-300">إجازة بإذن</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500/20 rounded"></div>
                  <span className="text-gray-300">إجازة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                  <span className="text-gray-300">غائب</span>
                </div>
              </div>
            </GlassContainer>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3">
            <GlassContainer className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                  الشهر السابق
                </Button>
                
                <h2 className="text-xl font-bold text-white">
                  {format(currentMonth, "MMMM yyyy", { locale: ar })}
                </h2>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="text-white hover:bg-white/10"
                >
                  الشهر التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
                  <div key={day} className="p-3 text-center text-gray-400 text-sm font-medium">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {monthDays.map((day) => {
                  const status = getDayStatus(day);
                  const statusDisplay = getStatusDisplay(status);
                  const isToday = isSameDay(day, new Date());
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayAttendance = userAttendance.find(a => a.date === dayStr);
                  const StatusIcon = statusDisplay.icon;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        p-3 text-center rounded-lg transition-all duration-200 min-h-[80px] flex flex-col justify-between
                        ${isToday ? 'ring-2 ring-blue-400' : ''}
                        ${statusDisplay.color}
                        ${status !== 'absent' ? 'cursor-pointer hover:scale-105' : ''}
                      `}
                    >
                      <div className="text-sm font-medium">
                        {format(day, "d")}
                      </div>
                      
                      {status !== 'absent' && (
                        <div className="flex flex-col items-center gap-1">
                          <StatusIcon className="w-4 h-4" />
                          {dayAttendance && dayAttendance.totalHoursWorked && (
                            <div className="text-xs">{parseFloat(dayAttendance.totalHoursWorked).toFixed(1)}س</div>
                          )}
                          {status === 'late-approved' && (
                            <div className="text-xs text-orange-300">متأخر بإذن</div>
                          )}
                          {status === 'early-departure-approved' && (
                            <div className="text-xs text-amber-300">انصراف بإذن</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassContainer>
          </div>
        </div>

        {/* Recent Attendance Details */}
        <div className="mt-6">
          <GlassContainer className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">تفاصيل الحضور الأخير</h3>
            <div className="space-y-3">
              {userAttendance.slice(-5).reverse().map((attendance) => (
                <div key={attendance.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">
                        {format(new Date(attendance.date), "EEEE، dd MMMM", { locale: ar })}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {attendance.scheduleType === 'متصل' ? (
                          <>
                            {attendance.continuousCheckinTime && `دخول: ${attendance.continuousCheckinTime}`}
                            {attendance.continuousCheckoutTime && ` | خروج: ${attendance.continuousCheckoutTime}`}
                          </>
                        ) : (
                          <>
                            {attendance.morningCheckinTime && `ص دخول: ${attendance.morningCheckinTime}`}
                            {attendance.morningCheckoutTime && ` | ص خروج: ${attendance.morningCheckoutTime}`}
                            {attendance.eveningCheckinTime && ` | م دخول: ${attendance.eveningCheckinTime}`}
                            {attendance.eveningCheckoutTime && ` | م خروج: ${attendance.eveningCheckoutTime}`}
                          </>
                        )}
                        {/* Show approved request status */}
                        {(() => {
                          const approvedRequest = getApprovedRequestForDay(new Date(attendance.date));
                          if (approvedRequest) {
                            if (approvedRequest.requestType === 'تأخير') return ' (حضور متأخر بإذن)';
                            if (approvedRequest.requestType === 'انصراف مبكر') return ' (انصراف مبكر بإذن)';
                            if (approvedRequest.requestType === 'استئذان') return ' (استئذان معتمد)';
                            if (approvedRequest.requestType === 'إجازة') return ' (إجازة بإذن)';
                          }
                          return '';
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-green-400 text-green-300 bg-green-400/10">
                      {attendance.totalHoursWorked ? `${parseFloat(attendance.totalHoursWorked).toFixed(1)} ساعات` : 'مؤكد'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {userAttendance.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-white">لا توجد سجلات حضور مؤكدة هذا الشهر</p>
                  <p className="text-gray-400 text-sm">سيتم عرض سجلات الحضور بعد تأكيدها من قبل الإدارة</p>
                </div>
              )}
            </div>
          </GlassContainer>
        </div>
      </div>
    </GlassBackground>
  );
}