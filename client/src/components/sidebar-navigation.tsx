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
  Palette
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
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            active && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-right flex-1">{item.title}</span>
          )}
        </button>
      );
    }

    return (
      <Link href={item.href}>
        <a
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            active && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-right flex-1">{item.title}</span>
          )}
        </a>
      </Link>
    );
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 z-50",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ش</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">شركة البريمي</div>
                <div className="text-xs text-slate-500">للسيارات</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Overview Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-right">
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
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-right">
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
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-right">
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-right flex-1">تسجيل الخروج</span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        {/* Theme Toggle */}
        <div className="mb-4">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="text-right flex-1">
                {isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
              </span>
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 text-right min-w-0">
              <div className="text-sm font-medium truncate">{user.username}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {user.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}