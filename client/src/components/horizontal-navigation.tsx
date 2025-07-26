import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  FileText, 
  Calendar, 
  ShoppingCart, 
  Calculator, 
  UserCheck, 
  MapPin, 
  CreditCard, 
  Building2, 
  Palette, 
  Image, 
  Users, 
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalNavigationProps {
  userRole: string;
}

export default function HorizontalNavigation({ userRole }: HorizontalNavigationProps) {
  const [location, setLocation] = useLocation();

  const menuItems = [
    { 
      title: "المخزون", 
      href: "/inventory", 
      icon: LayoutDashboard,
      internal: true
    },
    { 
      title: "عرض سعر", 
      href: "/quotation-creation", 
      icon: MessageSquare,
      internal: true
    },
    { 
      title: "الفواتير", 
      href: "/invoice-management", 
      icon: FileText,
      internal: true
    },
    { 
      title: "الحجوزات", 
      href: "/reservations", 
      icon: Calendar,
      internal: true
    },
    { 
      title: "المبيعات", 
      href: "/sold-vehicles", 
      icon: ShoppingCart,
      internal: true
    },
    { 
      title: "التمويل", 
      href: "/financing-calculator", 
      icon: Calculator,
      internal: true
    },
    { 
      title: "الإجازات", 
      href: "/leave-requests", 
      icon: UserCheck,
      internal: true
    },
    { 
      title: "المواقع", 
      href: "/locations", 
      icon: MapPin,
      internal: true
    },
    // External pages (will navigate away)
    { 
      title: "البطاقات", 
      href: "/card-view-new", 
      icon: Package,
      internal: false
    },
    { 
      title: "البنوك الشخصية", 
      href: "/banks-personal", 
      icon: CreditCard,
      internal: false
    },
    { 
      title: "بنوك الشركة", 
      href: "/banks-company", 
      icon: Building2,
      internal: false
    }
  ];

  const adminItems = userRole === "admin" ? [
    { 
      title: "المظهر", 
      href: "/pdf-appearance", 
      icon: Palette,
      internal: true
    },
    { 
      title: "الشعارات", 
      href: "/manufacturer-logos", 
      icon: Image,
      internal: true
    },
    { 
      title: "المستخدمين", 
      href: "/user-management", 
      icon: Users,
      internal: true
    },
    { 
      title: "إدارة البنوك", 
      href: "/bank-management", 
      icon: Building,
      internal: true
    }
  ] : [];

  const allItems = [...menuItems, ...adminItems];

  const isActive = (href: string) => location === href;

  const handleNavigation = (item: any) => {
    if (item.internal) {
      // For internal pages, just update the URL without navigating away
      setLocation(item.href);
    } else {
      // For external pages (banks, cards), navigate normally
      window.location.href = item.href;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Curved Navigation Background */}
      <div className="relative h-20 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border-b border-white/20">
        {/* Curved shape for center button */}
        <div className="absolute inset-x-0 top-0 h-full">
          <svg 
            viewBox="0 0 800 80" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,15 L300,15 Q350,15 375,40 Q400,55 425,40 Q450,15 500,15 L800,15 L800,80 L0,80 Z" 
              className="fill-white/10 backdrop-blur-xl"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
            />
          </svg>
        </div>
        
        {/* Navigation Items Container */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="flex items-center justify-center space-x-6 space-x-reverse">
            {allItems.slice(0, 2).map((item, index) => {
              const active = isActive(item.href);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "glass-button glass-text-primary transition-all duration-300 rounded-xl",
                    active && "bg-blue-600/30 border border-blue-400/30 shadow-lg"
                  )}
                >
                  <item.icon size={18} className="ml-1" />
                  <span className="hidden sm:inline text-sm">{item.title}</span>
                </Button>
              );
            })}
            
            {/* Center highlighted button */}
            {allItems[2] && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleNavigation(allItems[2])}
                className={cn(
                  "relative rounded-full w-16 h-16 bg-white/20 border-white/30 text-white shadow-xl transition-all duration-300 hover:bg-white/25 hover:scale-105",
                  isActive(allItems[2].href) && "bg-blue-600/40 border-blue-400/40"
                )}
              >
                {React.createElement(allItems[2].icon, { size: 28 })}
              </Button>
            )}
            
            {allItems.slice(3, 5).map((item, index) => {
              const active = isActive(item.href);
              return (
                <Button
                  key={index + 3}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "glass-button glass-text-primary transition-all duration-300 rounded-xl",
                    active && "bg-blue-600/30 border border-blue-400/30 shadow-lg"
                  )}
                >
                  <item.icon size={18} className="ml-1" />
                  <span className="hidden sm:inline text-sm">{item.title}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}