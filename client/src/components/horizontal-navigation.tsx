import React, { useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <div className="glass-container fixed top-0 left-0 right-0 z-50 border-b border-white/20 dark:border-slate-700/30 backdrop-blur-xl bg-white/10 dark:bg-slate-900/20">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-center items-center h-16 sm:h-20">
          {/* Navigation Items with Horizontal Scroll */}
          <div className="flex-1">
            <ScrollArea className="w-full whitespace-nowrap" ref={scrollRef}>
              <div className="flex items-center justify-start space-x-3 space-x-reverse px-4">
                {allItems.map((item, index) => {
                  const active = isActive(item.href);
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigation(item)}
                      className={cn(
                        "glass-button glass-text-primary transition-all duration-300 ease-in-out transform whitespace-nowrap flex-shrink-0",
                        "hover:scale-110 hover:shadow-lg hover:bg-white/25",
                        active && "bg-blue-600/40 border-blue-400/40 shadow-xl scale-110 text-white font-semibold"
                      )}
                    >
                      <item.icon 
                        size={active ? 18 : 14} 
                        className={cn(
                          "ml-1 transition-all duration-300",
                          active && "drop-shadow-lg"
                        )} 
                      />
                      <span className={cn(
                        "text-sm transition-all duration-300",
                        active && "font-bold drop-shadow-sm"
                      )}>
                        {item.title}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="h-1 bg-white/20 opacity-50" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}