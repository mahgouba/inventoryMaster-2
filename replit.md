# Inventory Management System

## Overview
This is a full-stack inventory management system for managing inventory items with support for categories, versions, statuses, and image attachments. The system features an Arabic-first interface. Successfully migrated from Replit Agent to standard Replit environment with clean, organized codebase (30 pages, no duplicates). Features comprehensive vehicle inventory management, quotation system, bank management with database persistence, and multi-role user system.

## Recent Changes (January 2025)
- ✅ Successfully migrated project from Replit Agent to Replit environment
- ✅ Cleaned up duplicate files and backup versions (removed .backup, .bak files)
- ✅ Consolidated similar pages: user-management-simple → user-management, card-view-new → card-view
- ✅ Fixed bank visibility toggle to use database persistence instead of localStorage
- ✅ Updated all navigation references to use consolidated page names
- ✅ Verified application runs correctly on port 5000 with Express + PostgreSQL
- ✅ Fixed table column alignment issue in inventory management (updated colSpan from 14 to 16)
- ✅ Optimized price card year display with 8% size reduction and improved margins
- ✅ Added bulk inventory clearing functionality and cleared all inventory items as requested

## User Preferences
Preferred communication style: Simple, everyday language.
UI preferences: Add specifications management button next to "Add Item" button for easy access.
Header navigation: Added "طلب إجازة وإستئذان" (Leave Request and Permission) button next to "وصل اليوم" (Arrived Today) button in the car cards page header for easy access to leave request functionality.
User Experience: Disabled text selection on long press to prevent unwanted text highlighting when interacting with UI elements, while maintaining text selection for input fields and text areas.
Project Organization: Clean and organized codebase with no duplicate or backup files - removed all .backup, .bak files and consolidated similar pages.

## System Architecture

### Core Design Principles
The system follows a clear separation of concerns, with distinct layers for frontend, backend, and data management. It emphasizes a modern, responsive UI with an Arabic-first design approach.

### Frontend
- **Framework**: React 18 with TypeScript, using Vite for development.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query for server state.
- **UI/UX**: shadcn/ui components (built on Radix UI) styled with Tailwind CSS, supporting custom Arabic fonts (Noto Sans Arabic). Features consistent glass morphism design throughout.
- **Form Handling**: React Hook Form with Zod validation.
- **Interaction**: iOS-style vertical and horizontal pickers, touch-only navigation with magnetic snapping, and animations for enhanced user experience.
- **Theming**: System-wide dark theme with unified glass morphism, customizable color schemes, and company branding integration.

### Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **API Style**: RESTful API endpoints.
- **Middleware**: Custom logging and error handling.

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations.
- **Database**: PostgreSQL (with Neon serverless support and connection pooling).
- **Schema Validation**: Zod schemas for runtime type checking.
- **Migrations**: Drizzle Kit for schema management.
- **Storage**: Intelligent storage fallback system (DatabaseStorage when `DATABASE_URL` available, MemStorage otherwise).

### Key Features & Technical Implementations
- **Inventory Management**: CRUD operations for inventory items, supporting categories, versions, statuses, images, and detailed specifications (e.g., chassis number, engine capacity, colors).
- **Quotation System**: Full-page quotation creation with QR code generation, dynamic pricing (VAT, license plates), company branding (logo, details, custom colors), and PDF/JPG export. Supports both quotation and invoice modes.
- **Vehicle Sharing**: Share vehicle details with linked images and editable pricing.
- **Enhanced WhatsApp Sharing**: Share quotations via WhatsApp with automatic PDF generation, Saudi Arabia country code (+966) integration, employee selection dropdown, and option to send to work numbers.
- **Manufacturer Management**: Comprehensive system for managing manufacturers, categories, and trim levels with logo integration.
- **Data Management**: Import/export functionality for various data types (inventory, banks, rates, users) via Excel and JSON, with selective options.
- **Bank Management**: Management of company and personal bank accounts, including visibility toggles and share functionality.
- **Financing Calculator**: APR-based calculation with integration to managed financing rates from various Saudi banks.
- **Leave Request System**: Comprehensive system for managing employee leave requests, including auto-calculation, PDF generation, and role-based approval workflow.
- **Role-Based Access Control (RBAC)**: Permissions system for admin, accountant, salesperson, and sales manager roles, dynamically adapting UI elements based on user permissions.
- **Localization**: Arabic-first design with RTL support, Gregorian calendar system (DD/MM/YYYY format) and 24-hour time format.
- **Print System**: Optimized PDF and JPG exports with high quality, white backgrounds, and proper print-specific CSS for professional document output.

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
- **html2canvas**: For capturing HTML elements as images (for PDF/JPG generation).
- **jspdf**: For generating PDF documents.
- **qrcode**: For QR code generation.
- **openai**: For AI-powered voice assistant (though voice assistant features have been removed from the final system, it indicates past integration).