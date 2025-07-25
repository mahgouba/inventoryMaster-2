import React from 'react';

interface SystemGlassWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SystemGlassWrapper: React.FC<SystemGlassWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`dark-system-wrapper min-h-screen w-full ${className}`}>
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/6 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      {/* Glass Content Container */}
      <div className="relative z-10 min-h-screen backdrop-blur-sm">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SystemGlassWrapper;