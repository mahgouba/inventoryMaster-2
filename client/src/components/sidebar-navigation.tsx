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
  Image,
  Landmark
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
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function SidebarNavigation({ user, onLogout, onCollapseChange }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { settings, toggleDarkMode } = useTheme();
  const isDarkMode = settings?.darkMode || false;

  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const overviewItems = [
    { 
      title: "لوحة المتابعة", 
      href: "/inventory", 
      icon: LayoutDashboard,
      description: "Dashboard"
    },
    { 
      title: "إنشاء عرض سعر", 
      href: "/quotation-creation", 
      icon: MessageSquare,
      description: "Create Quote"
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

  const userManagementItems = user.role === "admin" ? [
    { 
      title: "إدارة المستخدمين", 
      href: "/user-management", 
      icon: Users,
      description: "User Management"
    },
    { 
      title: "إدارة النسب", 
      href: "/bank-management", 
      icon: Landmark,
      description: "Ratio Management"
    }
  ] : [];

  const adminItems = user.role === "admin" ? [
    { 
      title: "إدارة شعارات الصناع", 
      href: "/manufacturer-logos", 
      icon: Image,
      description: "Manufacturer Logos"
    },
    { 
      title: "إدارة القوائم", 
      href: "/list-management", 
      icon: Settings,
      description: "List Management"
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
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 glass-button",
            "hover:bg-white/10 text-white/90 hover:text-white",
            active && "glass-button-primary border border-blue-400/30 shadow-lg"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0 drop-shadow-sm" />
          {!isCollapsed && (
            <span className="text-right flex-1 drop-shadow-sm">{item.title}</span>
          )}
        </button>
      );
    }

    return (
      <Link href={item.href}>
        <div
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 glass-button cursor-pointer",
            "hover:bg-white/10 text-white/90 hover:text-white",
            active && "glass-button-primary border border-blue-400/30 shadow-lg"
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0 drop-shadow-sm" />
          {!isCollapsed && (
            <span className="text-right flex-1 drop-shadow-sm">{item.title}</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen backdrop-blur-xl bg-gradient-to-br from-gray-900 via-black to-purple-950 border-l border-white/20 dark:border-white/10 transition-all duration-300 z-50 shadow-2xl flex flex-col relative overflow-hidden",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Company Logo Background - Same as main page */}
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
      {/* Animated Mesh Background - Same as main page */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-20 right-5 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-5 w-32 h-32 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-white/20 dark:border-white/10 backdrop-blur-sm glass-container">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg overflow-hidden" style={{ backgroundColor: '#00627F' }}>
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
                    className="w-6 h-6 object-contain"
                  />
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm text-white drop-shadow-sm">{settings?.companyName || 'شركة البريمي'}</div>
                <div className="text-xs text-white/70 drop-shadow-sm">للسيارات</div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapseToggle}
            className="h-8 w-8 p-0 backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4 drop-shadow-sm" /> : <ChevronRight className="h-4 w-4 drop-shadow-sm" />}
          </Button>
        </div>
      </div>

      {/* Banks & Cards Section - Direct under company logo */}
      <div className="relative z-10 px-4 pt-3 pb-4 border-b border-golden/20 dark:border-golden/10 backdrop-blur-sm">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-golden uppercase tracking-wider mb-3 text-right drop-shadow-sm">
            البنوك والبطاقات
          </h3>
        )}
        <nav className="space-y-1">
          <Link href="/card-view-new">
            <div className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 glass-button cursor-pointer",
              "hover:bg-golden/10 text-white/90 hover:text-white border-golden/20 hover:border-golden/40",
              isActive("/card-view-new") && "glass-button-golden border border-golden/50 shadow-lg bg-golden/20"
            )}>
              <Package className="h-5 w-5 flex-shrink-0 drop-shadow-sm text-golden" />
              {!isCollapsed && (
                <span className="text-right flex-1 drop-shadow-sm">عرض البطاقات</span>
              )}
            </div>
          </Link>
          
          <Link href="/banks-personal">
            <div className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 glass-button cursor-pointer",
              "hover:bg-golden/10 text-white/90 hover:text-white border-golden/20 hover:border-golden/40",
              isActive("/banks-personal") && "glass-button-golden border border-golden/50 shadow-lg bg-golden/20"
            )}>
              <CreditCard className="h-5 w-5 flex-shrink-0 drop-shadow-sm text-golden" />
              {!isCollapsed && (
                <span className="text-right flex-1 drop-shadow-sm">البنوك الشخصية</span>
              )}
            </div>
          </Link>

          <Link href="/banks-company">
            <div className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 glass-button cursor-pointer",
              "hover:bg-golden/10 text-white/90 hover:text-white border-golden/20 hover:border-golden/40",
              isActive("/banks-company") && "glass-button-golden border border-golden/50 shadow-lg bg-golden/20"
            )}>
              <Building className="h-5 w-5 flex-shrink-0 drop-shadow-sm text-golden" />
              {!isCollapsed && (
                <span className="text-right flex-1 drop-shadow-sm">بنوك الشركة</span>
              )}
            </div>
          </Link>
        </nav>
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex-1 p-4 overflow-y-auto overflow-x-hidden max-h-screen">
        {/* Overview Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 text-right drop-shadow-sm">
              النظرة العامة
            </h3>
          )}
          <nav className="space-y-1">
            {overviewItems.map((item, index) => (
              <NavItem key={index} item={item} section="overview" />
            ))}
          </nav>
        </div>

        {/* User Management Section */}
        {userManagementItems.length > 0 && (
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 text-right drop-shadow-sm">
                إدارة المستخدمين
              </h3>
            )}
            <nav className="space-y-1">
              {userManagementItems.map((item, index) => (
                <NavItem key={index} item={item} section="admin" />
              ))}
            </nav>
          </div>
        )}

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 text-right drop-shadow-sm">
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
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 text-right drop-shadow-sm">
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 glass-button hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-400/20 hover:border-red-400/40"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 drop-shadow-sm" />
              {!isCollapsed && (
                <span className="text-right flex-1 drop-shadow-sm">تسجيل الخروج</span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 p-4 border-t border-white/20 dark:border-white/10 backdrop-blur-sm glass-container">
        {/* Theme Toggle */}
        <div className="mb-4">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 glass-button hover:bg-white/10 text-white/90 hover:text-white border border-white/20 hover:border-white/30"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 flex-shrink-0 drop-shadow-sm" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0 drop-shadow-sm" />
            )}
            {!isCollapsed && (
              <span className="text-right flex-1 drop-shadow-sm">
                {isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
              </span>
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg glass-container bg-white/5 border border-white/20">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 text-right min-w-0">
              <div className="text-sm font-medium truncate text-white drop-shadow-sm">{user.username}</div>
              <div className="text-xs text-white/60 drop-shadow-sm">
                {user.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}