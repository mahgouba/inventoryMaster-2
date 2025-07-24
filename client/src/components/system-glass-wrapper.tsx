import React from 'react';
import GlassBackground from './glass-background';

interface SystemGlassWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SystemGlassWrapper: React.FC<SystemGlassWrapperProps> = ({ children, className = '' }) => {
  return (
    <GlassBackground variant="default" className={`min-h-screen w-full ${className}`}>
      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </GlassBackground>
  );
};

export default SystemGlassWrapper;