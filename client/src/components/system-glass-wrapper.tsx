import React from 'react';

interface SystemGlassWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SystemGlassWrapper: React.FC<SystemGlassWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass-background min-h-screen w-full ${className}`}>
      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-full">
        {children}
      </div>
    </div>
  );
};

export default SystemGlassWrapper;