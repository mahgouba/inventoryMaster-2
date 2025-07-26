import React, { useRef, useState, useEffect } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [centerItem, setCenterItem] = useState<any>(null);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setDragStartTime(Date.now());
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const distance = Math.abs(x - startX);
    
    // Only start dragging if moved more than 5px or held for more than 100ms
    if (distance > 5 || (Date.now() - dragStartTime > 100)) {
      if (!isDragging) {
        setIsDragging(true);
      }
      setHasMoved(true);
      e.preventDefault();
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollRef.current.scrollLeft = scrollLeft - walk;
      
      // Check which item is in the center during drag
      checkCenterItem();
    }
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setDragStartTime(Date.now());
    setHasMoved(false);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const distance = Math.abs(x - startX);
    
    // Only start dragging if moved more than 10px (more threshold for touch)
    if (distance > 10) {
      if (!isDragging) {
        setIsDragging(true);
      }
      setHasMoved(true);
      const walk = (x - startX) * 1.5; // Touch scroll speed
      scrollRef.current.scrollLeft = scrollLeft - walk;
      
      // Check which item is in the center during drag
      checkCenterItem();
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Function to check which item is in the center
  const checkCenterItem = () => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const containerCenter = container.offsetWidth / 2;
    const buttons = container.querySelectorAll('button');
    
    let closestButton = null;
    let closestDistance = Infinity;
    
    buttons.forEach((button, index) => {
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2 - container.scrollLeft;
      const distance = Math.abs(buttonCenter - containerCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestButton = allItems[index];
      }
    });
    
    setCenterItem(closestButton);
  };

  // Auto-navigate to center item when drag ends
  const handleDragEnd = () => {
    setTimeout(() => {
      if (centerItem && hasMoved) {
        // Navigate to the center item
        if (centerItem.internal) {
          setLocation(centerItem.href);
        } else {
          window.location.href = centerItem.href;
        }
      }
      setIsDragging(false);
      setHasMoved(false);
      setCenterItem(null);
    }, 100);
  };

  // Cleanup mouse events
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

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
    // Prevent navigation if user was dragging
    if (hasMoved || isDragging) {
      return;
    }
    
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
        <div className="flex justify-center items-center h-16 sm:h-20 relative">
          {/* Center Selection Box */}
          <div className="absolute left-1/2 top-1/2 w-32 h-12 border-2 border-yellow-400/60 bg-yellow-400/10 rounded-lg transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-yellow-400/15 to-yellow-400/5 rounded-lg"></div>
            <div className="absolute top-1 left-1 right-1 bottom-1 border border-yellow-400/30 rounded-md"></div>
          </div>
          
          {/* Navigation Items with Horizontal Drag Scroll */}
          <div className="flex-1 overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex items-center justify-start space-x-3 space-x-reverse px-4 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
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
          </div>
        </div>
      </div>
    </div>
  );
}