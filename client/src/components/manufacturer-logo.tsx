import { getManufacturerLogo } from "@shared/manufacturer-logos";
import { Building2 } from "lucide-react";

interface ManufacturerLogoProps {
  manufacturerName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showFallback?: boolean;
  customLogo?: string; // Base64 or URL for uploaded logo
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8", 
  lg: "w-12 h-12"
};

export function ManufacturerLogo({ 
  manufacturerName, 
  className = "", 
  size = "md", 
  showFallback = true,
  customLogo
}: ManufacturerLogoProps) {
  // Prioritize custom uploaded logo over static logo
  const logoPath = customLogo || getManufacturerLogo(manufacturerName);
  
  if (logoPath) {
    return (
      <img
        src={logoPath}
        alt={`شعار ${manufacturerName}`}
        className={`object-contain ${sizeClasses[size]} ${className}`}
        onError={(e) => {
          // Fallback to icon if image fails to load
          if (showFallback) {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }
        }}
      />
    );
  }

  // Fallback icon when no logo is available
  if (showFallback) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-md`}>
        <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </div>
    );
  }

  return null;
}