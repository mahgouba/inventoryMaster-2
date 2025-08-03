import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, FileText, User, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const leaveRequestSchema = z.object({
  requestType: z.string().min(1, "نوع الطلب مطلوب"),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  endDate: z.string().optional(),
  duration: z.number().min(1, "المدة مطلوبة"),
  durationType: z.string().min(1, "نوع المدة مطلوب"),
  reason: z.string().min(1, "السبب مطلوب"),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

export function LeaveRequestForm({ open, onOpenChange, username }: LeaveRequestFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      requestType: "",
      startDate: "",
      endDate: "",
      duration: 1,
      durationType: "أيام",
      reason: "",
    },
  });

  const requestType = form.watch("requestType");
  const durationType = form.watch("durationType");

  const createLeaveRequestMutation = useMutation({
    mutationFn: async (data: LeaveRequestFormData) => {
      return await apiRequest("/api/leave-requests", "POST", {
        ...data,
        userName: username,
        requestedByName: username,
        userId: 1, // Will be replaced with actual user ID from auth
        requestedBy: 1, // Will be replaced with actual user ID from auth
        status: "قيد الموافقة", // Default status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب الإجازة/الاستئذان بنجاح وهو الآن قيد الموافقة",
        variant: "default",
      });
      form.reset();
      onOpenChange(false);
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error creating leave request:", error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال طلب الإجازة/الاستئذان",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    setIsSubmitting(true);
    createLeaveRequestMutation.mutate(data);
  };

  // Calculate end date automatically for vacation requests
  const calculateEndDate = (startDate: string, duration: number, durationType: string) => {
    if (!startDate || durationType !== "أيام") return "";
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    
    return end.toISOString().split('T')[0];
  };

  // Update end date when start date or duration changes for vacation
  const handleStartDateChange = (value: string) => {
    form.setValue("startDate", value);
    if (requestType === "إجازة" && durationType === "أيام") {
      const duration = form.getValues("duration");
      const endDate = calculateEndDate(value, duration, "أيام");
      form.setValue("endDate", endDate);
    }
  };

  const handleDurationChange = (value: number) => {
    form.setValue("duration", value);
    if (requestType === "إجازة" && durationType === "أيام") {
      const startDate = form.getValues("startDate");
      if (startDate) {
        const endDate = calculateEndDate(startDate, value, "أيام");
        form.setValue("endDate", endDate);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-container max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <FileText size={20} />
            طلب إجازة أو استئذان
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee Name (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <User size={16} />
                اسم الموظف
              </label>
              <div className="glass-input-container p-3 text-white bg-slate-700/30">
                {username}
              </div>
            </div>

            {/* Request Type */}
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200 flex items-center gap-2">
                    <FileText size={16} />
                    نوع الطلب
                  </FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    // Reset end date when switching types
                    if (value === "استئذان") {
                      form.setValue("endDate", "");
                      form.setValue("durationType", "ساعات");
                    } else {
                      form.setValue("durationType", "أيام");
                    }
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="اختر نوع الطلب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="إجازة">إجازة</SelectItem>
                      <SelectItem value="استئذان">استئذان</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200 flex items-center gap-2">
                    <Calendar size={16} />
                    {requestType === "استئذان" ? "التاريخ" : "تاريخ البداية"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="glass-input"
                      {...field}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration Type */}
            <FormField
              control={form.control}
              name="durationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200 flex items-center gap-2">
                    <Clock size={16} />
                    نوع المدة
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass-input">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {requestType === "إجازة" ? (
                        <SelectItem value="أيام">أيام</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="ساعات">ساعات</SelectItem>
                          <SelectItem value="أيام">أيام</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200 flex items-center gap-2">
                    <Clock size={16} />
                    المدة ({durationType})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={durationType === "ساعات" ? "24" : "365"}
                      className="glass-input"
                      {...field}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date (for vacation only) */}
            {requestType === "إجازة" && durationType === "أيام" && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200 flex items-center gap-2">
                      <Calendar size={16} />
                      تاريخ النهاية
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="glass-input bg-slate-700/30"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200 flex items-center gap-2">
                    <FileText size={16} />
                    السبب
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="glass-input min-h-[80px]"
                      placeholder="اكتب سبب الإجازة أو الاستئذان..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Note */}
            <div className="glass-container p-3 border-l-4 border-yellow-500">
              <p className="text-yellow-200 text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                سيتم إرسال الطلب مع حالة "قيد الموافقة" وسيظهر في الصفحة الرئيسية
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="glass-button"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="glass-button bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}