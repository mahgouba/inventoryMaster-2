import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Image, 
  ChevronLeft, 
  ChevronRight,
  Wrench,
  ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSpecsImagesProps {
  className?: string;
}

export default function SidebarSpecsImages({ className }: SidebarSpecsImagesProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();

  const sidebarItems = [
    { 
      title: "المواصفات التفصيلية", 
      href: "/detailed-specifications", 
      icon: Settings,
      description: "عرض وإدارة المواصفات التفصيلية للمركبات"
    },
    { 
      title: "إدارة الصور", 
      href: "/images-management", 
      icon: Image,
      description: "إدارة صور المركبات والمعرض"
    }
  ];

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-black/20 backdrop-blur-lg border-r border-white/10 transition-all duration-300 z-50",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 space-x-reverse">
            <Wrench className="w-5 h-5 text-[#C79C45]" />
            <span className="text-white font-semibold text-sm">أدوات إضافية</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapseToggle}
          className="text-white/70 hover:text-white hover:bg-white/10 p-2"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="p-2 space-y-2">
        {sidebarItems.map((item, index) => {
          const isActive = location === item.href;
          
          return (
            <Link key={index} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-right h-auto p-3 transition-all duration-200",
                  isActive 
                    ? "bg-[#C79C45]/20 text-[#C79C45] border border-[#C79C45]/30" 
                    : "text-white/70 hover:text-white hover:bg-white/10",
                  isCollapsed && "justify-center p-2"
                )}
              >
                <item.icon className={cn(
                  "flex-shrink-0",
                  isCollapsed ? "w-5 h-5" : "w-5 h-5 ml-3"
                )} />
                
                {!isCollapsed && (
                  <div className="flex-1 text-right">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-white/50 mt-1 leading-tight">
                      {item.description}
                    </div>
                  </div>
                )}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <ImageIcon className="w-4 h-4 text-[#C79C45]" />
              <span className="text-white/90 text-xs font-medium">أدوات المواصفات والصور</span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              إدارة المواصفات التفصيلية وصور المركبات بسهولة
            </p>
          </div>
        </div>
      )}
    </div>
  );
}