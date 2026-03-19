import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Car } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginPageProps {
  onLogin: (user: { username: string; role: string; id: number }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل تسجيل الدخول");
      }

      const userData = await response.json();
      localStorage.setItem("auth", JSON.stringify(userData));
      onLogin(userData);

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${userData.username}`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      dir="rtl"
      style={{ background: "#F8F9FA" }}
    >
      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: "#343A40",
              boxShadow: "0 8px 24px rgba(52,58,64,0.25)",
            }}
          >
            <Car className="w-8 h-8" style={{ color: "#F8F9FA" }} />
          </div>
          <h1
            className="text-3xl font-bold tracking-wide"
            style={{ color: "#343A40", letterSpacing: "0.04em" }}
          >
            نظام المبيعات
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8d9399" }}>
            مرحباً بك — تسجيل الدخول للمتابعة
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "#ffffff",
            border: "1px solid #DEE2E6",
            boxShadow: "0 8px 32px rgba(52,58,64,0.12)",
          }}
        >
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <label
                      className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                      style={{ color: "#5a6471" }}
                    >
                      اسم المستخدم
                    </label>
                    <FormControl>
                      <Input
                        placeholder="أدخل اسم المستخدم"
                        {...field}
                        data-testid="input-username"
                        className="h-12 rounded-xl text-sm font-medium"
                        style={{
                          background: "#F8F9FA",
                          border: "1px solid #DEE2E6",
                          color: "#343A40",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <label
                      className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                      style={{ color: "#5a6471" }}
                    >
                      كلمة المرور
                    </label>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        data-testid="input-password"
                        className="h-12 rounded-xl text-sm font-medium"
                        style={{
                          background: "#F8F9FA",
                          border: "1px solid #DEE2E6",
                          color: "#343A40",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={isLoading}
                data-testid="button-login"
                className="w-full h-12 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-2"
                style={{
                  background: isLoading ? "#6C757D" : "#343A40",
                  color: "#F8F9FA",
                  boxShadow: isLoading ? "none" : "0 4px 16px rgba(52,58,64,0.3)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري تسجيل الدخول...
                  </span>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs" style={{ color: "#adb5bd" }}>
          نظام إدارة المبيعات والمخزون
        </p>
      </div>
    </div>
  );
}
