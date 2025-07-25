import React, { useEffect } from 'react';

/**
 * Universal Glass Morphism Application Component
 * Applies glass effects to all buttons, dialogs, and UI elements automatically
 */
const UniversalGlass: React.FC = () => {
  useEffect(() => {
    const applyGlassEffect = () => {
      // Apply glass effects to all buttons
      const buttons = document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]');
      buttons.forEach(button => {
        if (!button.classList.contains('btn-primary') && 
            !button.classList.contains('btn-secondary') && 
            !button.classList.contains('btn-destructive')) {
          button.classList.add('glass-button');
        }
      });

      // Apply glass effects to all dialogs and modals
      const dialogs = document.querySelectorAll('[role="dialog"], .dialog-content, .modal, .popover-content');
      dialogs.forEach(dialog => {
        dialog.classList.add('glass-dialog');
      });

      // Apply glass effects to all form inputs
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="tel"], input[type="url"], input[type="search"], textarea, select');
      inputs.forEach(input => {
        input.classList.add('glass-input');
      });

      // Apply glass effects to all containers and cards
      const containers = document.querySelectorAll('.card, .container, .panel, .section');
      containers.forEach(container => {
        container.classList.add('glass-container');
      });

      // Apply glass effects to all dropdown content
      const dropdowns = document.querySelectorAll('[role="listbox"], .dropdown-content, .select-content');
      dropdowns.forEach(dropdown => {
        dropdown.classList.add('glass-dropdown-content');
      });

      // Apply glass effects to all badges
      const badges = document.querySelectorAll('.badge, .chip, span.badge, .inline-badge');
      badges.forEach(badge => {
        badge.classList.add('glass-badge');
      });

      // Apply glass effects to all tabs
      const tabs = document.querySelectorAll('[role="tab"], .tab-trigger');
      tabs.forEach(tab => {
        tab.classList.add('glass-tab');
      });

      // Apply glass effects to all overlays
      const overlays = document.querySelectorAll('[data-overlay], .overlay, .backdrop');
      overlays.forEach(overlay => {
        overlay.classList.add('glass-overlay');
      });
    };

    // Initial application
    applyGlassEffect();

    // Apply on DOM changes (for dynamically added elements)
    const observer = new MutationObserver(() => {
      applyGlassEffect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything, it just applies effects
};

export default UniversalGlass;