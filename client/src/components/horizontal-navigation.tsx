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

  // Disable mouse drag - only touch drag allowed
  const handleMouseDown = (e: React.MouseEvent) => {
    // Disabled mouse drag functionality
    return;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Disabled mouse drag functionality
    return;
  };

  const handleMouseUp = () => {
    // Disabled mouse drag functionality
    return;
  };

  // Enhanced sound effects for different interactions
  const playSoundEffect = (type: 'drag' | 'snap' | 'select') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for different actions
      switch (type) {
        case 'drag':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.08);
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
          oscillator.stop(audioContext.currentTime + 0.08);
          break;
        case 'snap':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.12);
          gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
          oscillator.stop(audioContext.currentTime + 0.12);
          break;
        case 'select':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.06);
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          oscillator.stop(audioContext.currentTime + 0.15);
          break;
      }
      
      oscillator.start(audioContext.currentTime);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  // Touch drag handlers with magnetic center stop and sound
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
    
    // Only start dragging if moved more than 8px for more stable movement
    if (distance > 8) {
      if (!isDragging) {
        setIsDragging(true);
        playSoundEffect('drag'); // Play drag sound when starting
      }
      setHasMoved(true);
      
      // More stable horizontal scrolling with damping
      const walk = (x - startX) * 0.8; // Reduced multiplier for stability
      const newScrollLeft = scrollLeft - walk;
      
      // Constrain scrolling within bounds for stability
      const maxScrollLeft = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      const constrainedScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
      
      // Apply smooth scrolling without abrupt transitions
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollLeft = constrainedScrollLeft;
      
      // Play periodic drag sounds for feedback
      if (Math.abs(constrainedScrollLeft - scrollRef.current.scrollLeft) > 20) {
        playSoundEffect('drag');
      }
    }
  };

  const handleTouchEnd = () => {
    // Add stable deceleration with momentum
    if (scrollRef.current && hasMoved) {
      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.style.transition = 'scroll-left 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
      playSoundEffect('snap'); // Play snap sound when touch ends
    }
    handleDragEnd();
  };

  // Magnetic snap to center function
  const snapToCenter = () => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const containerCenter = container.offsetWidth / 2;
    const buttons = container.querySelectorAll('button');
    
    let closestButton = null;
    let closestDistance = Infinity;
    let closestIndex = 0;
    
    buttons.forEach((button, index) => {
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2 - container.scrollLeft;
      const distance = Math.abs(buttonCenter - containerCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestButton = allItems[index];
        closestIndex = index;
      }
    });
    
    // Magnetic snap when close to center (within 50px)
    if (closestDistance < 50 && closestButton) {
      const button = buttons[closestIndex] as HTMLElement;
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2;
      const targetScrollLeft = container.scrollLeft + (buttonCenter - containerCenter);
      
      // Stable smooth scroll to center with enhanced sound
      playSoundEffect('snap');
      container.style.scrollBehavior = 'smooth';
      container.style.transition = 'scroll-left 0.25s cubic-bezier(0.23, 1, 0.32, 1)';
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
      
      setCenterItem(closestButton);
    }
  };

  // Stable drag end with enhanced feedback
  const handleDragEnd = () => {
    // Reset transition for stability
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
    
    setTimeout(() => {
      setIsDragging(false);
      setHasMoved(false);
      setCenterItem(null);
    }, 50);
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
    
    // Play selection sound
    playSoundEffect('select');
    
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
          {/* Navigation Items with Horizontal Drag Scroll */}
          <div className="flex-1 overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex items-center justify-start space-x-3 space-x-reverse px-4 overflow-x-auto scrollbar-none"
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
                      "glass-button glass-text-primary transition-all duration-300 ease-in-out transform whitespace-nowrap flex-shrink-0 ios-nav-button",
                      "hover:scale-110 hover:shadow-lg hover:bg-white/25 hover:translate-y-[-1px]",
                      "active:scale-95 active:translate-y-0",
                      active && "bg-blue-600/40 border-blue-400/40 shadow-xl scale-110 text-white font-semibold ios-selection-ring"
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