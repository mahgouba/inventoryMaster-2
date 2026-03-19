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
      style={{
        background: "linear-gradient(160deg, #0A0B0D 0%, #0D0F14 50%, #0A0B0D 100%)",
      }}
    >
      {/* Subtle gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(196,150,50,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: "linear-gradient(135deg, #C49632, #E8B84B)",
              boxShadow: "0 8px 32px rgba(196,150,50,0.35)",
            }}
          >
            <Car className="w-8 h-8 text-black" />
          </div>
          <h1
            className="text-3xl font-bold tracking-wide"
            style={{ color: "#ffffff", letterSpacing: "0.04em" }}
          >
            نظام المبيعات
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            مرحباً بك — تسجيل الدخول للمتابعة
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(17,19,24,0.85)",
            border: "1px solid rgba(196,150,50,0.18)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
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
                      style={{ color: "rgba(255,255,255,0.45)" }}
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
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#ffffff",
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
                      style={{ color: "rgba(255,255,255,0.45)" }}
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
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#ffffff",
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
                  background: isLoading
                    ? "rgba(196,150,50,0.5)"
                    : "linear-gradient(135deg, #C49632, #E8B84B)",
                  color: "#000000",
                  boxShadow: isLoading ? "none" : "0 4px 20px rgba(196,150,50,0.4)",
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
        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          نظام إدارة المبيعات والمخزون
        </p>
      </div>
    </div>
  );
}
