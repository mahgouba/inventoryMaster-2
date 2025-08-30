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
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 text-xs ${
        isOverThreshold 
          ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700' 
          : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
      } ${className}`}
    >
      {isOverThreshold ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      <span className="font-medium">
        {daysSinceEntry} يوم
      </span>
    </Badge>
  );
}