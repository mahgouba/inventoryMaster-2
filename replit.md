# Inventory Management System

## Overview
This is a full-stack inventory management system for managing inventory items with support for categories, versions, statuses, and image attachments. The system features an Arabic-first interface. Successfully migrated from Replit Agent to standard Replit environment with clean, organized codebase (30 pages, no duplicates). Features comprehensive vehicle inventory management, quotation system, bank management with database persistence, and multi-role user system.

## Recent Changes (August 2025) - Migration Completed Successfully
- ✅ Successfully migrated project from Replit Agent to standard Replit environment (August 2025)
- ✅ Connected to external PostgreSQL database with proper SSL configuration
- ✅ Fixed database connection fallback system (DatabaseStorage when DATABASE_URL available, MemStorage otherwise)
- ✅ Modified database driver from Neon serverless to standard node-postgres for better compatibility
- ✅ Database successfully connected with 480 inventory items and complete data structure
- ✅ Application runs successfully on port 5000 with Express + PostgreSQL backend
- ✅ All authentication and API endpoints working correctly with external database
- ✅ Full-stack inventory management system operational in Replit environment
- ✅ Clean migration completed with proper security practices (secrets management)
- ✅ Database schema created with all necessary tables (29 tables total)
- ✅ Project ready for continued development and deployment with persistent data storage
- ✅ Enhanced dropdown options management page with full CRUD functionality (August 2025)
- ✅ Implemented complete add/edit/delete operations for all dropdown categories
- ✅ Added data persistence for static options using localStorage
- ✅ Enhanced backend API routes for comprehensive dropdown data management
- ✅ Improved database storage methods for manufacturers, categories, trim levels management
- ✅ Added validation to prevent duplicate entries in dropdown options
- ✅ Successfully migrated dropdown data retrieval from cars.json to Railway PostgreSQL database (August 2025)
- ✅ Updated API endpoints (/api/hierarchical/*) to fetch data directly from Railway database
- ✅ Verified data access: 30 manufacturers, 116 categories, 263 trim levels from Railway
- ✅ Fixed DatabaseStorage SQL queries and added proper error handling for database operations
- ✅ Implemented complete CRUD operations (GET/POST/PUT/DELETE) for all dropdown management
- ✅ Final migration to Replit environment completed successfully (August 3, 2025)
- ✅ Railway PostgreSQL database fully connected and operational with 480 inventory items
- ✅ All 29 database tables created and populated with complete data structure
- ✅ System running smoothly on Replit with external database integration
- ✅ Successfully migrated from Replit Agent to standard Replit (August 3, 2025)
- ✅ PostgreSQL database connection successfully established and tested
- ✅ Application running on port 5000 with full database connectivity
- ✅ All core functionality operational with proper fallback mechanisms
- ✅ Railway PostgreSQL database successfully connected and integrated (August 3, 2025)
- ✅ Complete data import from Railway database: 480 inventory items, 28 manufacturers, 10 banks, 17 users
- ✅ Railway import API endpoints created for selective data migration
- ✅ Database migration system established with fallback to MemStorage for compatibility
- ✅ Successfully completed final migration from Replit Agent to standard Replit environment (August 3, 2025)
- ✅ All migration checklist items completed: packages installed, workflow restarted, project verified
- ✅ Application running smoothly with proper user authentication and inventory management functionality
- ✅ Updated price card component background styling per user request (removed SVG background, added gradient)
- ✅ Successfully completed final migration to Replit environment (August 3, 2025)
- ✅ Enhanced price cards management page layout (August 3, 2025)
- ✅ Removed fixed preview panel per user request - simplified layout to show only cards grid
- ✅ Restored original grid layout for better focus on price cards management
- ✅ Modified price card preview dialog to display fixed A4 size (210mm x 297mm) that remains consistent across all devices
- ✅ Updated dialog layout to center A4 preview with proper scaling and responsive constraints
- ✅ Changed price card background to blue gradient (from #00627F to #004A61) per user request (August 3, 2025)
- ✅ Made price card content fixed and non-responsive - same size across all devices (mobile/desktop)
- ✅ Converted all elements to absolute positioning with fixed pixel dimensions
- ✅ Changed price card to A4 landscape orientation (1123px x 794px)
- ✅ Completely redesigned price card to match user's reference design (August 3, 2025)
- ✅ Added teal gradient background with golden decorative pattern on right edge
- ✅ Positioned red circle in top-left corner, golden company logo at top-center
- ✅ Large white year text centered on card background
- ✅ White content card at bottom with manufacturer logo, model, price, and status
- ✅ Applied appropriate color scheme: teal background, golden accents, white text
- ✅ Reorganized content layout: vehicle info (category, trim, manufacturer logo) on right, price/status info on left
- ✅ Enlarged white content box by 20% for better visibility and readability
- ✅ Enhanced PDF export feature with professional print quality (August 3, 2025)
- ✅ Added multiple export options: high-quality PDF, JPG image, and direct browser printing
- ✅ Implemented print-optimized styling with proper A4 landscape formatting
- ✅ Added error handling and user feedback for export operations
- ✅ Successfully migrated from Replit Agent to standard Replit environment (August 4, 2025)
- ✅ Updated price card background to use custom background image (background-price-card.jpg)
- ✅ Removed golden decorative pattern overlay in favor of background image design
- ✅ All migration checklist items completed and project fully operational in Replit
- ✅ Fixed LSP diagnostics errors in price card component (August 4, 2025)
- ✅ Replaced background image with user-specified design from attached assets
- ✅ Updated background image reference to backgorun-price-card.jpg per user request (August 4, 2025)
- ✅ Fixed ManufacturerLogo component styling by wrapping with filter div to resolve TypeScript errors
- ✅ Removed red circle element from price card design per user request (August 4, 2025)
- ✅ Removed price card preview section, keeping only action buttons per user request (August 4, 2025)
- ✅ Restored price card preview with backgorun-price-card.jpg background image per user request (August 4, 2025)
- ✅ Updated background image reference to price-card.jpg per user request (August 4, 2025)
- ✅ Completely removed price cards management page from application per user request (August 4, 2025)
- ✅ Rebuilt price cards page with custom form inputs and A4 landscape preview per user request (August 4, 2025)
- ✅ Updated price card background image to "price -card.jpg" per user request (August 4, 2025)
- ✅ Updated price card background color to #00607f and reduced company logo size by 30% (August 4, 2025)
- ✅ Removed duplicate price card component (new-price-card.tsx) to maintain clean codebase (August 4, 2025)
- ✅ Updated price card background image back to price-card.jpg per user request (August 4, 2025)
- ✅ Removed company logo, background/border from content container, and changed divider line to white (August 4, 2025)
- ✅ Successfully completed migration from Replit Agent to standard Replit environment (August 4, 2025)
- ✅ Updated price card status element with semi-transparent white background styling per user request
- ✅ Completely removed appearance management system per user request (August 4, 2025)
- ✅ Deleted theme-management page, useTheme hook, theme-styles component, and all appearance API routes
- ✅ Simplified application architecture by removing appearance customization features
- ✅ Migration completed successfully with clean, functioning codebase
- ✅ **MAJOR BUGFIX**: Resolved all 153+ TypeScript diagnostic errors across the codebase (January 2025)
- ✅ Fixed missing `useTheme` hook import in inventory page, resolving React component issues
- ✅ Resolved MemStorage class interface compliance by adding missing `getColorAssociations` method
- ✅ Corrected property name inconsistencies (reservationNotes → reservationNote) and type mismatches in storage layer
- ✅ Updated TypeScript configuration to ES2015 target with downlevelIteration, fixing Set iteration compilation errors
- ✅ Fixed user creation routes by adding required fields (name, jobTitle, phoneNumber) for proper authentication
- ✅ Corrected bank interest rate field mappings (rateName/rateValue → categoryName/interestRate) to match schema
- ✅ Enhanced company creation with proper default values and all required fields

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