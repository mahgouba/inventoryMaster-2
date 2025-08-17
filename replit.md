# Inventory Management System

## Overview
This is a full-stack inventory management system for comprehensive vehicle inventory management, including categories, versions, statuses, and image attachments. It features a quotation system, bank management, and a multi-role user system. The system offers an Arabic-first interface, aiming for an efficient and user-friendly experience in inventory management, with a business vision to streamline vehicle sales and associated financial processes.

## User Preferences
Preferred communication style: Simple, everyday language.
UI preferences: Add specifications management button next to "Add Item" button for easy access.
Removed neumorphism toggle button from card view page per user request to simplify interface.
Completely removed the attendance interface dialog from the card view page per user request. All attendance management functionality has been removed from the cards page to simplify the interface and eliminate unnecessary navigation options.
Replaced animated floating action button (FAB) with popup actions in inventory page with simple "إضافة عنصر" (Add Item) button at bottom-right corner per user request to simplify interface.
Removed all animations from floating action button in card view page per user request to make it static and non-animated.
Enhanced main page filter design with:
- Improved filter toggle button with active filters indicator and smooth animations
- Glass morphism background with gradient effects and decorative elements
- Responsive grid layout (1 column mobile, 2 columns medium, 3 columns large screens)
- Better desktop optimization with enhanced spacing and visual hierarchy
Removed duplicate manufacturer data issue in hierarchical view by disabling auto-populate function.
Removed duplicate price card component (/components/price-card.tsx) to eliminate confusion and maintain clean architecture with single unified price card solution in /pages/price-cards.tsx. Completely removed /detailed-specifications, /images-management, and /theme-management pages per user request to simplify navigation and reduce unnecessary features. Removed duplicate hierarchy-management.tsx page - consolidated hierarchy management into single HierarchicalView component to eliminate confusion and streamline vehicle specifications management interface. Removed duplicate `/hierarchy` route - now using only `/hierarchy-management` for cleaner navigation structure.
Single horizontal navigation system at the top - removed duplicate sidebar navigation component to eliminate confusion and maintain clean architecture.
Removed print button from quotation preview component per user request.
Disabled text selection on long press to prevent unwanted text highlighting when interacting with UI elements, while maintaining text selection for input fields and text areas.
Removed detailed specifications box and "متوفر" availability checkbox from vehicle addition dialog per user request.
Added gear (Settings) button in vehicle form header for controlling dropdown data (Year, Import Type, Status, Location, Ownership Type) with add/remove functionality.
Updated sale status from "متوفر" to "متاح للبيع" for clearer terminology.
Excel Import: Requested removal of specific fields from Excel import template (Serial Number, Payment System, Transmission, Fuel Type) to streamline data entry process. These fields are either auto-generated or use default values.
Changed "مستعمل شخصي" display to "مستعمل" in statistics boxes per user request.
Hidden "متاح للبيع" field from vehicle addition dialog per user request to simplify interface.
Updated import type options: Changed "مستعمل شخصي" to just "مستعمل" in dropdown selections.
Moved card view icon (البطاقات) to position below inventory icon (المخزون) in horizontal navigation per user request.
Hidden engine capacity field when chassis number is entered in vehicle form per user request to simplify data entry.
Changed default landing page from CardViewPage to MainDashboard (inventory page) per user request - main page button now redirects to inventory.

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
- **Inventory Management**: CRUD for inventory items with detailed specifications, categories, versions, statuses, and images.
- **Quotation System**: Full-page quotation creation with QR code generation, dynamic pricing, company branding, and PDF/JPG export. Supports quotation and invoice modes.
- **Vehicle Sharing**: Share vehicle details with linked images and editable pricing, integrated with hierarchy data and enhanced WhatsApp sharing.
- **Manufacturer Management**: Comprehensive system for managing manufacturers, categories, and trim levels with logo integration. Includes extensive vehicle hierarchy data with bilingual support for major brands, trim levels, and colors.
- **Data Management**: Import/export functionality for various data types via Excel and JSON, with enhanced Excel import for hierarchy data. Excel import system with custom template excluding Serial Number, Payment System, Transmission, and Fuel Type fields - these are auto-generated or use defaults. Automatic unique chassis number generation when duplicates or placeholder values ("000") are detected.
- **Bank Management**: Management of company and personal bank accounts, including visibility toggles and share functionality.
- **Financing Calculator**: APR-based calculation with integration to managed financing rates from Saudi banks.
- **Integrated Attendance System**: Monthly attendance interface showing only confirmed attendance days, with attendance requests integrated into the leave request approval workflow. Includes daily attendance view with calendar format and progress bars. CRUD for employee work schedules with permission-based access control.
- **Leave Request System**: Comprehensive system for managing employee leave requests, including auto-calculation, PDF generation, and role-based approval workflow.
- **Role-Based Access Control (RBAC)**: Permissions system for admin, accountant, salesperson, and sales manager roles, dynamically adapting UI.
- **Localization**: Arabic-first design with RTL support, Gregorian calendar (DD/MM/YYYY) and 24-hour time.
- **Print System**: Optimized PDF and JPG exports with high quality and proper print-specific CSS. Price card printing is clean without shadows, borders, or extra white space for A4 landscape.
- **Smart Pricing Display**: Dynamic pricing system in price cards that handles different import types with appropriate VAT calculations and color coding.
- **QR Code Scanning**: Comprehensive QR code scanning functionality with camera access for scanning vehicle QR codes, opening a detailed vehicle dialog with action buttons (حجز/Reserve, بيع/Sell, مشاركة/Share).
- **Card View Enhancement**: Comprehensive action buttons to vehicle cards including Create Quote (إنشاء عرض سعر), Create Price Card (إنشاء بطاقة سعر), and updated sell functionality.

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