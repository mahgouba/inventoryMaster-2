import { useEffect } from 'react';

interface ThemeStylesProps {
  themeStyle: string;
  darkMode: boolean;
}

export function ThemeStyles({ themeStyle, darkMode }: ThemeStylesProps) {
  useEffect(() => {
    // Remove existing theme classes
    document.documentElement.classList.remove('glass-theme', 'neumorphism-theme', 'classic-theme');
    
    // Add the current theme class
    document.documentElement.classList.add(`${themeStyle}-theme`);
    
    // Apply theme-specific CSS variables
    const root = document.documentElement;
    
    if (themeStyle === 'neumorphism') {
      // Neumorphism theme colors - soft, muted palette
      if (darkMode) {
        // Dark neumorphism
        root.style.setProperty('--neumorphism-bg', '#2a2a2a');
        root.style.setProperty('--neumorphism-surface', '#2a2a2a');
        root.style.setProperty('--neumorphism-shadow-light', '#404040');
        root.style.setProperty('--neumorphism-shadow-dark', '#1a1a1a');
        root.style.setProperty('--neumorphism-text', '#e0e0e0');
        root.style.setProperty('--neumorphism-text-secondary', '#a0a0a0');
        root.style.setProperty('--neumorphism-primary', '#5a8f7b');
        root.style.setProperty('--neumorphism-primary-hover', '#4a7a68');
        root.style.setProperty('--neumorphism-accent', '#c49632');
        root.style.setProperty('--neumorphism-accent-hover', '#b08628');
      } else {
        // Light neumorphism
        root.style.setProperty('--neumorphism-bg', '#e6e7ee');
        root.style.setProperty('--neumorphism-surface', '#e6e7ee');
        root.style.setProperty('--neumorphism-shadow-light', '#ffffff');
        root.style.setProperty('--neumorphism-shadow-dark', '#d1d1d6');
        root.style.setProperty('--neumorphism-text', '#2d3748');
        root.style.setProperty('--neumorphism-text-secondary', '#718096');
        root.style.setProperty('--neumorphism-primary', '#0f766e');
        root.style.setProperty('--neumorphism-primary-hover', '#134e4a');
        root.style.setProperty('--neumorphism-accent', '#bf9231');
        root.style.setProperty('--neumorphism-accent-hover', '#a67c27');
      }
    } else if (themeStyle === 'classic') {
      // Classic theme - traditional flat design
      if (darkMode) {
        root.style.setProperty('--classic-bg', '#1a1a1a');
        root.style.setProperty('--classic-surface', '#2d3748');
        root.style.setProperty('--classic-border', '#4a5568');
        root.style.setProperty('--classic-text', '#f7fafc');
        root.style.setProperty('--classic-text-secondary', '#cbd5e0');
      } else {
        root.style.setProperty('--classic-bg', '#ffffff');
        root.style.setProperty('--classic-surface', '#f7fafc');
        root.style.setProperty('--classic-border', '#e2e8f0');
        root.style.setProperty('--classic-text', '#2d3748');
        root.style.setProperty('--classic-text-secondary', '#718096');
      }
    }
  }, [themeStyle, darkMode]);

  return null;
}