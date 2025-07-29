import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Activity, 
  BarChart3, 
  Calculator, 
  UserCheck, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronLeft,
  ChevronRight,
  Building,
  CreditCard,
  Archive,
  Users,
  Palette,
  Image,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface NewSidebarProps {
  user: {
    username: string;
    role: string;
    id: number;
  };
  onLogout: () => void;
}

export default function NewSidebar({ user, onLogout }: NewSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { settings, toggleDarkMode } = useTheme();

  const menuItems = [
    { 
      title: "لوحة المتابعة", 
      href: "/inventory", 
      icon: LayoutDashboard 
    },
    { 
      title: "عرض البطاقات", 
      href: "/card-view-new", 
      icon: Package 
    },
    { 
      title: "إنشاء عرض سعر", 
      href: "/quotation-creation", 
      icon: MessageSquare 
    },
    { 
      title: "طلبات الحجز", 
      href: "/reservations", 
      icon: Activity 
    },
    { 
      title: "السيارات المباعة", 
      href: "/sold-vehicles", 
      icon: BarChart3 
    },
    { 
      title: "حاسبة التمويل", 
      href: "/financing-calculator", 
      icon: Calculator 
    },
    { 
      title: "طلبات الإجازة", 
      href: "/leave-requests", 
      icon: UserCheck 
    }
  ];

  const adminItems = user.role === "admin" ? [
    { 
      title: "إدارة المظهر", 
      href: "/pdf-appearance", 
      icon: Palette 
    },
    { 
      title: "شعارات الشركات", 
      href: "/manufacturer-logos", 
      icon: Image 
    },
    { 
      title: "إدارة القوائم", 
      href: "/list-management", 
      icon: Settings 
    },
    { 
      title: "إدارة المستخدمين", 
      href: "/user-management", 
      icon: Users 
    },
    { 
      title: "إدارة البنوك", 
      href: "/bank-management", 
      icon: Building 
    }
  ] : [];

  const accountItems = [
    { 
      title: "البنوك الشخصية", 
      href: "/banks-personal", 
      icon: CreditCard 
    },
    { 
      title: "البنوك الشركة", 
      href: "/banks-company", 
      icon: Building 
    }
  ];

  const isActive = (href: string) => location === href;

  const NavItem = ({ item }: { item: any }) => {
    const active = isActive(item.href);
    
    if (item.onClick) {
      return (
        <button
          onClick={item.onClick}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200",
            "hover:bg-white/10 text-white/90 hover:text-white",
            active && "bg-blue-600/30 border border-blue-400/30 shadow-lg text-white"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="text-right flex-1">{item.title}</span>
        </button>
      );
    }

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer",
            "hover:bg-white/10 text-white/90 hover:text-white",
            active && "bg-blue-600/30 border border-blue-400/30 shadow-lg text-white"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="text-right flex-1">{item.title}</span>
        </div>
      </Link>
    );
  };

  // Toggle button (mobile/floating)
  const toggleButton = (
    <Button
      onClick={() => setIsOpen(!isOpen)}
      className="fixed top-4 right-4 z-[60] h-12 w-12 rounded-full bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm border border-white/20 shadow-lg"
      size="sm"
    >
      {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
    </Button>
  );

  return (
    <>
      {/* Toggle Button */}
      {toggleButton}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-gray-900 via-black to-purple-950 backdrop-blur-xl border-l border-white/20 z-50 transition-transform duration-300 overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        
        {/* Company Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          {settings?.companyLogo ? (
            <img 
              src={settings.companyLogo} 
              alt="شعار الشركة" 
              className="w-32 h-32 object-contain"
            />
          ) : (
            <img 
              src="/copmany logo.svg" 
              alt="شعار البريمي للسيارات" 
              className="w-32 h-32 object-contain"
            />
          )}
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-5 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-5 w-32 h-32 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden bg-blue-600">
                {settings?.companyLogo ? (
                  <img 
                    src={settings.companyLogo} 
                    alt="شعار الشركة" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src="/copmany logo.svg" 
                    alt="شعار البريمي للسيارات" 
                    className="w-8 h-8 object-contain"
                  />
                )}
              </div>
              <div className="text-right flex-1">
                <div className="font-bold text-white text-lg">{settings?.companyName || 'شركة البريمي'}</div>
                <div className="text-white/70 text-sm">للسيارات</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-white/90 text-sm">مرحباً، {user.username}</div>
              <div className="text-white/60 text-xs">{user.role === "admin" ? "المدير" : "البائع"}</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            
            {/* Main Menu */}
            <div>
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 text-right font-semibold">
                القائمة الرئيسية
              </h3>
              <nav className="space-y-1">
                {menuItems.map((item, index) => (
                  <NavItem key={index} item={item} />
                ))}
              </nav>
            </div>

            {/* Admin Menu */}
            {adminItems.length > 0 && (
              <div>
                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 text-right font-semibold">
                  إدارة النظام
                </h3>
                <nav className="space-y-1">
                  {adminItems.map((item, index) => (
                    <NavItem key={index} item={item} />
                  ))}
                </nav>
              </div>
            )}

            {/* Account Menu */}
            <div>
              <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3 text-right font-semibold">
                الحسابات المصرفية
              </h3>
              <nav className="space-y-1">
                {accountItems.map((item, index) => (
                  <NavItem key={index} item={item} />
                ))}
              </nav>
            </div>

            {/* Settings & Logout */}
            <div className="pt-6 border-t border-white/20">
              <nav className="space-y-1">
                <NavItem item={{
                  title: settings?.darkMode ? "الوضع النهاري" : "الوضع الليلي",
                  icon: settings?.darkMode ? Sun : Moon,
                  onClick: toggleDarkMode
                }} />
                <NavItem item={{
                  title: "تسجيل الخروج",
                  icon: LogOut,
                  onClick: onLogout
                }} />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}