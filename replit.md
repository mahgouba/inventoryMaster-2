# Inventory Management System

## Overview
This is a full-stack inventory management system designed for comprehensive inventory management, specifically for vehicles, with support for categories, versions, statuses, and image attachments. It includes a quotation system, bank management, and a multi-role user system. The system features an Arabic-first interface and aims to provide an efficient and user-friendly experience for inventory management.

## User Preferences
Preferred communication style: Simple, everyday language.
Migration Status: Successfully completed migration from Replit Agent to Replit environment (August 8, 2025). Enhanced monthly attendance report with comprehensive statistics including tardiness, early departure, and absence tracking. Added detailed calculations for approved requests with status indicators: "حضور متأخر بإذن" (late arrival with permission), "انصراف مبكر بإذن" (early departure with permission), "استئذان معتمد" (approved permission), and "إجازة بإذن" (approved leave). System now provides complete statistical analysis of attendance patterns and approval statuses.
Attendance Management: Successfully created integrated attendance system:
- Integrated attendance requests with leave request approval workflow system
- Attendance requests are sent through leave request API and appear in pending approvals
- Upon approval, attendance requests automatically create daily attendance records
- Main attendance management interface handles all attendance functionality
UI preferences: Add specifications management button next to "Add Item" button for easy access.
Header navigation: Added "طلب إجازة وإستئذان" (Leave Request and Permission) button next to "وصل اليوم" (Arrived Today) button in the car cards page header for easy access to leave request functionality.
Navigation: Clean navigation structure with comprehensive attendance management through main interface.
User Experience: Disabled text selection on long press to prevent unwanted text highlighting when interacting with UI elements, while maintaining text selection for input fields and text areas.
Project Organization: Clean and organized codebase with no duplicate or backup files - removed all .backup, .bak files and consolidated similar pages. Removed duplicate price card component (/components/price-card.tsx) to eliminate confusion and maintain clean architecture with single unified price card solution in /pages/price-cards.tsx.
Navigation: Single horizontal navigation system at the top - removed duplicate sidebar navigation component to eliminate confusion and maintain clean architecture.
Print Requirements: Price card printing should be clean without shadows, borders, or extra white space at the bottom. All visual elements must be properly positioned for A4 landscape printing.

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
- **Data Management**: Import/export functionality for various data types via Excel and JSON.
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