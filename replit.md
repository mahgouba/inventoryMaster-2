# Inventory Management System

## Overview
This is a full-stack inventory management system designed for comprehensive inventory management, specifically for vehicles, with support for categories, versions, statuses, and image attachments. It includes a quotation system, bank management, and a multi-role user system. The system features an Arabic-first interface and aims to provide an efficient and user-friendly experience for inventory management.

## User Preferences
Preferred communication style: Simple, everyday language.
Migration Status: Successfully completed migration from Replit Agent to Replit environment (August 9, 2025). Fixed early departure hour calculation and progress bar coloring issue - system now accurately calculates work percentage for early departure requests showing actual work hours vs expected hours, with proper purple color coding for early departure progress bars instead of showing 100% completion. Enhanced specifications management system (August 10, 2025) with bilingual Arabic/English display format replacing JSON technical format - specifications now show in readable text with proper labeling for engine, year, trim level, and detailed descriptions in both languages. Successfully migrated to standard Replit environment (August 10, 2025) with enhanced hierarchy management interface - converted Category, Trim Level, and Year fields to dropdown menus, added comprehensive color selection dropdowns with visual indicators, and removed transmission, drivetrain, and fuel type fields per user request. Enhanced with Excel import functionality (August 10, 2025) for bulk import of manufacturers, categories, trim levels, and colors with downloadable template and comprehensive data processing. Enhanced attendance management interface with "Create New Request" button integrated into both pending requests and approved requests tabs in attendance-management.tsx, and added "Create Request" button to approved requests tab in card-view.tsx attendance dialog, providing streamlined access to leave request creation functionality from multiple locations. Removed neumorphism toggle button from card view page per user request to simplify interface. Fixed duplicate manufacturer data issue in hierarchical view by disabling auto-populate function. Enhanced monthly attendance report with detailed hour calculations - removed approved request statistics section and replaced simple duration display with actual work hours and permission hours breakdown. When leave requests (permission, late arrival, early departure) are linked to daily attendance, reports now show "ساعات العمل: X.XX | ساعات الإذن: X.XX" instead of basic duration text. Enhanced price card creation dialog to show action buttons (PDF, JPG, Print, Delete) when editing existing cards within the same dialog interface. Fixed attendance progress bar calculation and coloring issue - early departure and other approved leave requests now show accurate work percentages instead of 100% green bars, with proper color coding (purple for early departure, blue for permission, orange/red for late arrival).
Comprehensive Vehicle Hierarchy Data: Added extensive vehicle manufacturer and model data including 19 major brands (Toyota, Mercedes-Benz, BMW, Audi, Lexus, Land Rover, Rolls-Royce, Bentley, Ferrari, Porsche, Lamborghini, Tesla, Ford, GMC, Chevrolet, Dodge, Lincoln, Nissan, Infiniti) with their respective categories in both Arabic and English. Implemented comprehensive trim levels, exterior colors (15 options), and interior colors (8 options) with bilingual support for enhanced user experience and complete vehicle specification management.
Attendance Button Integration: Added comprehensive attendance management button to car cards page header next to "وصل اليوم" button. The attendance dialog integrates daily attendance monitoring and pending leave request approval workflows in a unified interface with tabbed navigation. Features real-time data fetching, approval/rejection capabilities, and proper Arabic localization with glass morphism design consistency.
Enhanced Daily Attendance View: Updated the daily attendance tab to display monthly calendar format with progress bars for each day, matching the exact styling from the attendance management page. Shows only previous days and current day, with color-coded progress bars (green for full attendance, yellow for partial, red for insufficient), larger status icons, and proper handling of holidays and approved leave requests.
Attendance Interface Removal: Completely removed the attendance interface dialog from the card view page per user request. All attendance management functionality has been removed from the cards page to simplify the interface and eliminate unnecessary navigation options.
WhatsApp Integration: Enhanced WhatsApp sharing functionality across the application:
- Bank Management: Long-press bank icons in card view opens sharing dialog with native share button, copy link, and WhatsApp phone number input for both company and personal banks
- Vehicle Sharing: Added comprehensive WhatsApp phone number input section to vehicle share dialog with Saudi Arabia country code integration (+966) for direct WhatsApp sharing of vehicle details
- Smart Pricing Display: Used cars (مستعمل/مستعمل شخصي) now share simple price without tax breakdown, while new cars show detailed VAT calculations
- Enhanced Status Sharing: Vehicle status is properly included in sharing text with improved icon display (✅ for status)
- Smart Share Fallback: Native share API with automatic fallback to copy functionality when not supported
Attendance Management: Successfully created integrated attendance system:
- Integrated attendance requests with leave request approval workflow system
- Attendance requests are sent through leave request API and appear in pending approvals
- Upon approval, attendance requests automatically create daily attendance records
- Main attendance management interface handles all attendance functionality
UI preferences: Add specifications management button next to "Add Item" button for easy access.
Header navigation: Added "طلب إجازة وإستئذان" (Leave Request and Permission) button next to "وصل اليوم" (Arrived Today) button in the car cards page header for easy access to leave request functionality.
Card View Enhancement: Added comprehensive action buttons to vehicle cards including Create Quote (إنشاء عرض سعر), Create Price Card (إنشاء بطاقة سعر), and updated sell functionality to match inventory page behavior with proper confirmation dialogs.
Hierarchy Integration: Enhanced vehicle sharing interface to integrate with hierarchy management system - car specifications and image links are now automatically fetched and displayed from the hierarchy management page based on vehicle manufacturer, category, trim level, and colors. The sharing interface shows available specifications with engine details and matching image links, allowing users to select which hierarchy data to include in shared content.
Navigation: Clean navigation structure with comprehensive attendance management integrated directly into card view attendance interface dialog, eliminating need for separate attendance management page navigation.
User Experience: Disabled text selection on long press to prevent unwanted text highlighting when interacting with UI elements, while maintaining text selection for input fields and text areas.
Project Organization: Clean and organized codebase with no duplicate or backup files - removed all .backup, .bak files and consolidated similar pages. Removed duplicate price card component (/components/price-card.tsx) to eliminate confusion and maintain clean architecture with single unified price card solution in /pages/price-cards.tsx. Completely removed /detailed-specifications, /images-management, and /theme-management pages per user request to simplify navigation and reduce unnecessary features. Removed duplicate hierarchy-management.tsx page (August 10, 2025) - consolidated hierarchy management into single HierarchicalView component to eliminate confusion and streamline vehicle specifications management interface. Removed duplicate `/hierarchy` route - now using only `/hierarchy-management` for cleaner navigation structure.
Navigation: Single horizontal navigation system at the top - removed duplicate sidebar navigation component to eliminate confusion and maintain clean architecture.
Print Requirements: Price card printing should be clean without shadows, borders, or extra white space at the bottom. All visual elements must be properly positioned for A4 landscape printing. Removed print button from quotation preview component per user request (August 10, 2025).

## System Architecture

### Core Design Principles
The system follows a clear separation of concerns, with distinct layers for frontend, backend, and data management. It emphasizes a modern, responsive UI with an Arabic-first design approach and consistent glass morphism design.

### Frontend
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query for server state.
- **UI/UX**: shadcn/ui components (built on Radix UI) styled with Tailwind CSS, supporting custom Arabic fonts (Noto Sans Arabic).
- **Form Handling**: React Hook Form with Zod validation.
- **Interaction**: iOS-style vertical and horizontal pickers, touch-only navigation with magnetic snapping, and animations.
- **Theming**: System-wide dark theme with unified glass morphism, customizable color schemes, and company branding integration.

### Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **API Style**: RESTful API endpoints.
- **Middleware**: Custom logging and error handling.

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations.
- **Database**: PostgreSQL.
- **Schema Validation**: Zod schemas.
- **Migrations**: Drizzle Kit for schema management.
- **Storage**: Intelligent storage fallback system (DatabaseStorage when `DATABASE_URL` available, MemStorage otherwise).

### Key Features & Technical Implementations
- **Inventory Management**: CRUD for inventory items, supporting categories, versions, statuses, images, and detailed specifications.
- **Quotation System**: Full-page quotation creation with QR code generation, dynamic pricing, company branding, and PDF/JPG export. Supports quotation and invoice modes.
- **Vehicle Sharing**: Share vehicle details with linked images and editable pricing.
- **Enhanced WhatsApp Sharing**: Share quotations via WhatsApp with automatic PDF generation, Saudi Arabia country code integration, employee selection, and option to send to work numbers.
- **Manufacturer Management**: Comprehensive system for managing manufacturers, categories, and trim levels with logo integration.
- **Data Management**: Import/export functionality for various data types via Excel and JSON. Enhanced Excel import system for hierarchy data with template generation and bulk data processing for manufacturers, categories, trim levels, and colors.
- **Bank Management**: Management of company and personal bank accounts, including visibility toggles and share functionality.
- **Financing Calculator**: APR-based calculation with integration to managed financing rates from Saudi banks.
- **Integrated Attendance System**: Monthly attendance interface showing only confirmed attendance days, with attendance requests integrated into the leave request approval workflow. Attendance requests automatically create daily attendance records upon approval.
- **Leave Request System**: Comprehensive system for managing employee leave requests, including auto-calculation, PDF generation, and role-based approval workflow.
- **Role-Based Access Control (RBAC)**: Permissions system for admin, accountant, salesperson, and sales manager roles, dynamically adapting UI.
- **Localization**: Arabic-first design with RTL support, Gregorian calendar (DD/MM/YYYY) and 24-hour time.
- **Print System**: Optimized PDF and JPG exports with high quality and proper print-specific CSS.
- **Smart Pricing Display**: Dynamic pricing system in price cards that handles different import types with appropriate VAT calculations and color coding:
  - Company imports (استيراد شركة) with new condition: Shows base price (excluding VAT), VAT amount (15%), and total price
  - Personal imports (استيراد شخصي) with new condition: Shows simple price without breakdown (green status badge)
  - Used/personal used (مستعمل/مستعمل شخصي): Shows simple price with mileage display (red status badge)

## External Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver.
- **drizzle-orm**: TypeScript ORM.
- **@tanstack/react-query**: Server state management.
- **react-hook-form**: Form handling and validation.
- **zod**: Schema validation library.
- **@radix-ui/***: Accessible UI component primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.
- **vite**: Build tool and development server.
- **tsx**: TypeScript execution for Node.js.
- **xlsx**: Library for Excel file parsing.
- **html2canvas**: For capturing HTML elements as images.
- **jspdf**: For generating PDF documents.
- **qrcode**: For QR code generation.