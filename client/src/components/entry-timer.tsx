import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EntryTimerProps {
  entryDate: string | Date;
  className?: string;
}

export function EntryTimer({ entryDate, className = "" }: EntryTimerProps) {
  // حساب عدد الأيام منذ تاريخ الدخول
  const calculateDaysSinceEntry = () => {
    const today = new Date();
    const entry = new Date(entryDate);
    const diffTime = today.getTime() - entry.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceEntry = calculateDaysSinceEntry();
  const isOverThreshold = daysSinceEntry >= 30;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border ${
        isOverThreshold 
          ? 'bg-red-500/80 border-red-400 text-white shadow-red-500/20 shadow-lg' 
          : 'bg-blue-500/80 border-blue-400 text-white shadow-blue-500/20 shadow-md'
      }`}>
        {isOverThreshold ? (
          <AlertTriangle className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        <span className="font-bold">
          {daysSinceEntry} يوم
        </span>
      </div>
    </div>
  );
}