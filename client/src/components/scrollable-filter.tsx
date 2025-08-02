import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ScrollableFilterProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onItemToggle: (item: string) => void;
  onClearSelection: () => void;
  className?: string;
}

export default function ScrollableFilter({
  title,
  items,
  selectedItems,
  onItemToggle,
  onClearSelection,
  className = ""
}: ScrollableFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      container.classList.add('cursor-grabbing');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.classList.remove('cursor-grabbing');
    };

    const handleMouseUp = () => {
      isDown = false;
      container.classList.remove('cursor-grabbing');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {title}
          </h3>
          {selectedItems.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {selectedItems.length}
            </Badge>
          )}
        </div>
        {selectedItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            مسح الكل
          </Button>
        )}
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto cursor-grab select-none scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: 'none'
        }}
      >
        {items.map((item, index) => {
          const isSelected = selectedItems.includes(item);
          return (
            <Button
              key={index}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onItemToggle(item)}
              className={`
                flex-shrink-0 h-8 px-3 text-xs whitespace-nowrap transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-600'
                }
                hover:scale-105 active:scale-95
              `}
            >
              {item}
            </Button>
          );
        })}
      </div>
    </div>
  );
}