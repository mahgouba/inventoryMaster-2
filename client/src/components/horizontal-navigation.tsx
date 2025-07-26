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
    setStartX(e.touches[0].pageY - scrollRef.current.getBoundingClientRect().top); // Using Y coordinate for vertical
    setScrollLeft(scrollRef.current.scrollTop); // Using scrollTop for vertical
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const y = e.touches[0].pageY - scrollRef.current.getBoundingClientRect().top;
    const distance = Math.abs(y - startX); // Using startX for Y coordinate
    
    // Only start dragging if moved more than 8px for more stable movement
    if (distance > 8) {
      if (!isDragging) {
        setIsDragging(true);
        playSoundEffect('drag'); // Play drag sound when starting
      }
      setHasMoved(true);
      
      // More stable vertical scrolling with damping
      const walk = (y - startX) * 0.8; // Reduced multiplier for stability
      const newScrollTop = scrollLeft - walk; // Using scrollLeft for Y position
      
      // Constrain scrolling within bounds for stability
      const maxScrollTop = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      const constrainedScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));
      
      // Apply smooth scrolling without abrupt transitions
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollTop = constrainedScrollTop;
      
      // Play periodic drag sounds for feedback
      if (Math.abs(constrainedScrollTop - scrollRef.current.scrollTop) > 20) {
        playSoundEffect('drag');
      }
    }
  };

  const handleTouchEnd = () => {
    // Add stable deceleration with momentum for vertical scrolling
    if (scrollRef.current && hasMoved) {
      scrollRef.current.style.scrollBehavior = 'smooth';
      scrollRef.current.style.transition = 'scroll-top 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
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
    <div className="fixed top-0 right-0 z-50 w-16 h-screen bg-gradient-to-b from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-l border-white/30 shadow-2xl overflow-hidden sidebar-glass-container">
      {/* Header Section */}
      <div className="p-3 border-b border-white/20 flex items-center justify-center">
        <img 
          src="/copmany logo.svg" 
          alt="شعار البريمي للسيارات" 
          className="w-8 h-8 object-contain filter brightness-150"
        />
      </div>

      {/* Scroll Up Button */}
      <div className="p-2 border-b border-white/10">
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollBy({ top: -200, behavior: 'smooth' });
            }
          }}
          className="w-full py-2 text-white/60 hover:text-white transition-colors duration-300"
        >
          <div className="flex items-center justify-center">
            <div className="w-6 h-1 bg-white/30 rounded-full"></div>
          </div>
          <div className="flex items-center justify-center mt-1">
            <div className="w-4 h-1 bg-white/40 rounded-full"></div>
          </div>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2">
        <div 
          ref={scrollRef}
          className="flex flex-col items-center space-y-3 h-full overflow-y-auto scrollbar-none"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {allItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <div
                key={index}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "group relative w-12 h-12 cursor-pointer flex-shrink-0",
                  "flex flex-col items-center justify-center",
                  active 
                    ? "text-white" 
                    : "text-white/70 hover:text-white"
                )}
                title={item.title}
              >
                {/* Icon */}
                <item.icon 
                  size={18} 
                  className={cn(
                    "mb-1",
                    active 
                      ? "text-blue-400 drop-shadow-lg" 
                      : "text-white/70 hover:text-blue-300"
                  )} 
                />
                
                {/* Label */}
                <span className={cn(
                  "text-[7px] text-center leading-tight font-medium",
                  active 
                    ? "text-blue-400 font-bold" 
                    : "text-white/70 hover:text-blue-300"
                )}>
                  {item.title.split(' ')[0]}
                </span>

                {/* Active Indicator */}
                {active && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Down Button */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
            }
          }}
          className="w-full py-2 text-white/60 hover:text-white transition-colors duration-300"
        >
          <div className="flex items-center justify-center">
            <div className="w-4 h-1 bg-white/40 rounded-full"></div>
          </div>
          <div className="flex items-center justify-center mt-1">
            <div className="w-6 h-1 bg-white/30 rounded-full"></div>
          </div>
        </button>
      </div>

      {/* Footer Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
    </div>
  );
}