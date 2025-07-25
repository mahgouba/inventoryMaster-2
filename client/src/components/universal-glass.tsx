import React, { useEffect } from 'react';

/**
 * Universal Glass Morphism Application Component
 * Applies glass effects through CSS classes without interfering with functionality
 */
const UniversalGlass: React.FC = () => {
  useEffect(() => {
    // Add universal glass class to body to enable CSS-based glass effects
    document.body.classList.add('universal-glass-enabled');
    
    return () => {
      document.body.classList.remove('universal-glass-enabled');
    };
  }, []);

  return null; // This component doesn't render anything, it just enables glass effects
};

export default UniversalGlass;