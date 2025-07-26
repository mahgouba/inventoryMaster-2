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
  MessageCircle, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  User,
  ChevronLeft,
  ChevronRight,
  Building,
  Calculator,
  UserCheck,
  FileSpreadsheet,
  Truck,
  CreditCard,
  Archive,
  Users,
  Palette,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface SidebarNavigationProps {
  user: {
    username: string;
    role: string;
    id: number;
  };
  onLogout: () => void;
}

export default function SidebarNavigation({ user, onLogout }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { settings, toggleDarkMode } = useTheme();
  const isDarkMode = settings?.darkMode || false;

  const overviewItems = [
    { 
      title: "لوحة المتابعة", 
      href: "/inventory", 
      icon: LayoutDashboard,
      description: "Dashboard"
    },
    { 
      title: "عرض البطاقات", 
      href: "/card-view-new", 
      icon: Package,
      description: "Card View"
    },
    { 
      title: "إنشاء عرض سعر", 
      href: "/quotation-creation", 
      icon: MessageSquare,
      description: "Create Quote"
    },
    { 
      title: "إدارة العروض", 
      href: "/quotation-management", 
      icon: FileText,
      description: "Quote Management"
    },
    { 
      title: "إدارة الفواتير", 
      href: "/invoice-management", 
      icon: Calendar,
      description: "Invoice Management"
    },
    { 
      title: "طلبات الحجز", 
      href: "/reservations", 
      icon: Activity,
      description: "Reservations"
    },
    { 
      title: "السيارات المباعة", 
      href: "/sold-vehicles", 
      icon: BarChart3,
      description: "Sold Vehicles"
    },
    { 
      title: "حاسبة التمويل", 
      href: "/financing-calculator", 
      icon: Calculator,
      description: "Financing Calculator"
    },
    { 
      title: "طلبات الإجازة", 
      href: "/leave-requests", 
      icon: UserCheck,
      description: "Leave Requests"
    }
  ];

  const adminItems = user.role === "admin" ? [
    { 
      title: "إدارة المستخدمين", 
      href: "/user-management", 
      icon: Users,
      description: "User Management"
    },
    { 
      title: "إدارة الشركات", 
      href: "/company-management", 
      icon: Building,
      description: "Company Management"
    },
    { 
      title: "إدارة البنوك", 
      href: "/bank-management", 
      icon: CreditCard,
      description: "Bank Management"
    },
    { 
      title: "إدارة شعارات الصناع", 
      href: "/manufacturer-logos", 
      icon: Image,
      description: "Manufacturer Logos"
    },
    { 
      title: "إدارة المظهر", 
      href: "/appearance", 
      icon: Palette,
      description: "Appearance"
    },
    { 
      title: "التحكم الديناميكي", 
      href: "/dynamic-company-control", 
      icon: Archive,
      description: "Dynamic Control"
    },
    { 
      title: "إدارة التكامل", 
      href: "/integration-management", 
      icon: Settings,
      description: "Integration Management"
    },
    { 
      title: "القوائم الشاملة", 
      href: "/comprehensive-lists", 
      icon: FileSpreadsheet,
      description: "Comprehensive Lists"
    },
    { 
      title: "إدارة المواقع", 
      href: "/locations", 
      icon: Truck,
      description: "Locations"
    }
  ] : [];

  const accountItems = [
    { 
      title: "الدردشة", 
      href: "#", 
      icon: MessageCircle,
      description: "Chat",
      onClick: () => {}
    },
    { 
      title: "الإعدادات", 
      href: "#", 
      icon: Settings,
      description: "Settings",
      onClick: () => {}
    }
  ];

  const isActive = (href: string) => {
    if (href === "/inventory" && (location === "/" || location === "/inventory")) {
      return true;
    }
    return location === href;
  };

  const NavItem = ({ item, section = "overview" }: { 
    item: any; 
    section?: "overview" | "admin" | "account" 
  }) => {
    const active = isActive(item.href);
    
    if (item.onClick) {
      return (
        <button
          onClick={item.onClick}
          className={cn(
            "glass-button w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            "text-white/90 hover:text-white border border-white/20 hover:border-white/30",
            active && "glass-button-primary text-white border-blue-400/40 shadow-lg backdrop-blur-md"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0 drop-shadow-md" />
          {!isCollapsed && (
            <span className="text-right flex-1 drop-shadow-md">{item.title}</span>
          )}
        </button>
      );
    }

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "glass-button w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer",
            "text-white/90 hover:text-white border border-white/20 hover:border-white/30",
            active && "glass-button-primary text-white border-blue-400/40 shadow-lg backdrop-blur-md"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0 drop-shadow-md" />
          {!isCollapsed && (
            <span className="text-right flex-1 drop-shadow-md">{item.title}</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen glass-container border-l border-white/20 transition-all duration-300 z-50 shadow-2xl flex flex-col relative overflow-hidden",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Animated Glass Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95">
          <div className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-4 w-16 h-16 bg-gradient-to-r from-green-400/15 to-blue-500/15 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-8 w-20 h-20 bg-gradient-to-r from-pink-400/15 to-orange-500/15 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-2 w-12 h-12 bg-gradient-to-r from-yellow-400/15 to-red-500/15 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
      </div>
      {/* Header */}
      <div className="glass-header p-4 border-b border-white/20 relative z-10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/80 to-blue-600/80 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
                <span className="text-white font-bold text-sm drop-shadow-md">ش</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm text-white drop-shadow-md">شركة البريمي</div>
                <div className="text-xs text-white/80 drop-shadow-sm">للسيارات</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="glass-button h-8 w-8 p-0 text-white hover:text-white border border-white/30"
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4 drop-shadow-md" /> : <ChevronRight className="h-4 w-4 drop-shadow-md" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden max-h-screen relative z-10">
        {/* Overview Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 text-right drop-shadow-md border-b border-white/10 pb-2">
              النظرة العامة
            </h3>
          )}
          <nav className="space-y-1">
            {overviewItems.map((item, index) => (
              <NavItem key={index} item={item} section="overview" />
            ))}
          </nav>
        </div>

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 text-right drop-shadow-md border-b border-white/10 pb-2">
                إدارة النظام
              </h3>
            )}
            <nav className="space-y-1">
              {adminItems.map((item, index) => (
                <NavItem key={index} item={item} section="admin" />
              ))}
            </nav>
          </div>
        )}

        {/* Account Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 text-right drop-shadow-md border-b border-white/10 pb-2">
              الحساب
            </h3>
          )}
          <nav className="space-y-1">
            {accountItems.map((item, index) => (
              <NavItem key={index} item={item} section="account" />
            ))}
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="glass-button w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-400/30 hover:border-red-400/50"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 drop-shadow-md" />
              {!isCollapsed && (
                <span className="text-right flex-1 drop-shadow-md">تسجيل الخروج</span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="glass-header p-4 border-t border-white/20 relative z-10">
        {/* Theme Toggle */}
        <div className="mb-4">
          <button
            onClick={toggleDarkMode}
            className="glass-button w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-white/90 hover:text-white border border-white/30 hover:border-white/40"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 flex-shrink-0 drop-shadow-md" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0 drop-shadow-md" />
            )}
            {!isCollapsed && (
              <span className="text-right flex-1 drop-shadow-md">
                {isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
              </span>
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="glass-container flex items-center gap-3 p-3 rounded-lg border border-white/30">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500/80 to-blue-600/80 text-white shadow-lg border border-white/20">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 text-right min-w-0">
              <div className="text-sm font-medium truncate text-white drop-shadow-md">{user.username}</div>
              <div className="text-xs text-white/70 drop-shadow-sm">
                {user.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}