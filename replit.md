# Inventory Management System

## Overview

This is a full-stack inventory management system built with React, Express, and TypeScript. The application features a modern Arabic-first interface for managing inventory items with support for categories, versions, statuses, and image attachments. The system uses Drizzle ORM for database operations and shadcn/ui for the component library.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic font support (Noto Sans Arabic)
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Middleware**: Custom logging and error handling middleware
- **Development**: Hot reload with tsx for TypeScript execution

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with DatabaseStorage implementation
- **Schema Validation**: Zod schemas for runtime type checking
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Database Schema
- **Users Table**: Basic user authentication structure
- **Inventory Items Table**: Core inventory management with fields:
  - Category (الفئة)
  - Version (الإصدار) 
  - Year (السنة)
  - Color (اللون)
  - Status (الحالة)
  - Engineer (المهنشي)
  - Chassis Number (رقم الهيكل)
  - Images array for attachments

### API Endpoints
- `GET /api/inventory` - Retrieve all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update existing item
- `DELETE /api/inventory/:id` - Remove inventory item
- `GET /api/inventory/stats` - Get inventory statistics
- `GET /api/inventory/search` - Search inventory items
- `GET /api/inventory/filter` - Filter items by category/status/year

### UI Components
- **InventoryStats**: Dashboard statistics display
- **InventoryTable**: Data table with sorting and filtering
- **InventoryForm**: Modal form for CRUD operations
- **Custom UI Components**: Complete shadcn/ui component library

## Data Flow

1. **Client Request**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests and validate data
3. **Data Storage**: PostgreSQL database accessed through DatabaseStorage class
4. **Response**: JSON responses sent back to client
5. **UI Update**: Query client automatically updates UI state

The application supports real-time updates through query invalidation and provides optimistic updates for better user experience. Database operations are handled through Drizzle ORM with proper connection pooling.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Modern TypeScript ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation library

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development tools

## Development Strategy

The system is designed with a clear separation of concerns:

- **Shared Schema**: Common TypeScript types and Zod schemas in `/shared`
- **Client Code**: React application in `/client` with component-based architecture  
- **Server Code**: Express API in `/server` with modular route handling
- **Database Layer**: PostgreSQL with Drizzle ORM and connection pooling
- **Configuration**: Centralized config files for build tools and frameworks

The application uses PostgreSQL for persistent data storage with proper database seeding. The Arabic-first design supports RTL layout and includes proper font loading for Arabic text.

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for frontend
- Express server with tsx for TypeScript execution
- Concurrent development with both servers running

### Production Build
- Vite builds optimized static assets to `/dist/public`
- esbuild bundles server code to `/dist/index.js`
- Single Node.js process serves both API and static files

### Database Setup
- Drizzle migrations in `/migrations` directory
- Environment variable `DATABASE_URL` required for PostgreSQL connection
- `npm run db:push` command for schema deployment

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for frontend
- Express server with tsx for TypeScript execution
- Concurrent development with both servers running

### Production Build
- Vite builds optimized static assets to `/dist/public`
- esbuild bundles server code to `/dist/index.js`
- Single Node.js process serves both API and static files

### Database Setup
- Drizzle migrations in `/migrations` directory
- Environment variable `DATABASE_URL` required for PostgreSQL connection
- `npm run db:push` command for schema deployment

### Docker Deployment
- **Dockerfile**: Multi-stage build with Node.js 20 Alpine
- **docker-compose.yml**: Complete orchestration with PostgreSQL
- **Production-ready**: Includes health checks, persistent volumes, and networking
- **Database**: PostgreSQL 15 with persistent data storage
- **Environment**: Supports OpenAI API key integration
- **Setup Script**: `run-docker.sh` for automated deployment
- **Documentation**: Complete setup guide in `DOCKER_SETUP.md`

## Recent Changes

### Color Theme Change - Blue Theme Implementation (July 19, 2025)
- ✅ Replaced teal color theme (#0f756d) with blue color theme (#00627F) across entire application
- ✅ Updated all filter buttons, action buttons, and interactive elements to use new blue color
- ✅ Created custom CSS classes for consistent color application (bg-custom-primary, text-custom-primary)
- ✅ Applied systematic color replacement across all React components using sed commands
- ✅ Updated hover states and focus states to use darker blue shade (#004f66)
- ✅ Maintained dark mode compatibility with new blue color scheme
- ✅ Enhanced visual consistency across inventory table, card view, and all UI elements

### Filter System Enhancement - Button-Based Interface with Statistics (July 19, 2025)
- ✅ Reverted all filters back to button-based interface with horizontal scrolling per user final request
- ✅ Converted all filter dropdowns to interactive button-based interface in inventory page
- ✅ Converted all filter dropdowns to button-based interface in card-view-new page  
- ✅ Added horizontal scrollable areas (ScrollArea) for filters to handle overflow content
- ✅ Implemented smooth scroll behavior for mobile devices and small screens
- ✅ Each filter section has clear headings and organized button groups
- ✅ Added "Reset Filters" button to clear all filters at once
- ✅ Enhanced filter buttons with proper selected/unselected states and hover effects
- ✅ Improved user experience with whitespace-nowrap to prevent button text wrapping
- ✅ Added proper dark mode support for all filter buttons and scroll areas
- ✅ Made filter container span full page width with proper responsive design
- ✅ Added item count statistics to all filter buttons showing number of items for each option
- ✅ Implemented getFilterCount function to dynamically calculate and display statistics
- ✅ Enhanced user experience with real-time count updates based on available inventory data

### Data Refresh Issue Fixed (July 19, 2025)
- ✅ Fixed cache invalidation issue that prevented data updates from appearing in UI
- ✅ Changed queryClient staleTime from Infinity to 5 minutes to allow proper data refresh
- ✅ Enhanced mutation success handlers to force immediate data refetch after updates
- ✅ Added removeQueries() calls to ensure cached data is cleared before refetch
- ✅ Improved form data loading with better error handling and field validation

### Filter UI Enhancement - Collapsible Right-Aligned Filters (July 19, 2025)
- ✅ Implemented collapsible filter boxes in both inventory table and card view pages per user request
- ✅ Added right-aligned filter toggle button with Arabic "الفلاتر" label and expand/collapse icons
- ✅ Wrapped filter sections in Collapsible components with proper Card containers
- ✅ Enhanced filter UI with gradient backgrounds and smooth transitions
- ✅ Maintained all existing filter button functionality while improving layout organization
- ✅ Applied consistent styling across both inventory.tsx and card-view-new.tsx pages
- ✅ Filters now start in closed state and can be toggled open/closed as requested
- ✅ Proper responsive design maintained for mobile and desktop viewing

### Statistics Display Fix - Proper Exclusion of Sold Cars (July 20, 2025)
- ✅ Fixed critical statistics display issue: main dashboard now properly excludes sold cars from all statistics
- ✅ Updated both DatabaseStorage and MemStorage implementations to filter out sold cars (`!item.isSold && item.status !== "مباع"`)
- ✅ Main statistics now show: Total (5 instead of 7), Available (2), In Transit (2), Maintenance (1), Reserved (0)
- ✅ Sold cars count (2) now displayed separately only next to "إظهار السيارات المباعة" button
- ✅ Import type statistics also properly exclude sold cars: Personal (2), Company (2), Used Personal (1)
- ✅ Added sold cars count badge next to "إظهار السيارات المباعة" button for admin users
- ✅ Enhanced inventory statistics to show sold count only where appropriate (next to show sold cars button)

### Final Migration to Replit Environment Completed (July 22, 2025)
- ✅ Successfully completed full migration from Replit Agent to standard Replit environment
- ✅ All required packages installed and verified working (Node.js 20, all dependencies present)
- ✅ Application running properly with Express server on port 5000
- ✅ Using in-memory storage for development compatibility without database setup requirements
- ✅ All functionality verified through feedback tool - inventory system, appearance management, and all features working correctly
- ✅ Migration checklist completed: all items marked as done in progress tracker
- ✅ User successfully logged in as admin and accessed all features
- ✅ API endpoints responding correctly (authentication, inventory, stats, appearance management)
- ✅ Comprehensive Arabic-first interface fully operational with manufacturer logos and filtering system
- ✅ All custom icons and SVG files properly served from public directory including exterior color icon (اللون-الخارجي.svg)
- ✅ Updated card view icons: connected icons to actual data with exterior-color.svg, interior-color.svg, and dynamic import type icons
- ✅ Implemented intelligent icon selection for import types: company, personal, and used vehicles get specific icons based on data
- ✅ Enhanced visual data representation with contextually appropriate icons throughout the card interface
- ✅ Adjusted icon sizes in card view to medium size (w-6 h-6) for optimal balance between visibility and layout
- ✅ Reorganized card layout: moved Category/Trim Level to header next to status badge, optimized remaining rows for better space utilization
- ✅ Enhanced print functionality per user request: simple table layout without icons, landscape orientation
- ✅ Print now displays clean, professional table suitable for landscape printing with minimal styling
- ✅ Updated manufacturer statistics display to use authentic manufacturer logos instead of emoji icons
- ✅ Integrated manufacturer logo system from shared/manufacturer-logos.ts for professional branding display
- ✅ Replaced chassis number icon with "VIN:" text label in card view per user request for better clarity
- ✅ Enhanced card layout per user request: hidden entry date, reorganized rows with interior color/import type/ownership type in same row, location and chassis number (VIN) in same row, added ownership type icon (ownerchip.svg)
- ✅ Applied golden styling to category and trim level: enlarged icon (w-9 h-9), bold text, and golden color (#BF9231)
- ✅ Repositioned chassis number (VIN) to be in same row as location but under import type column with blue color (#00627F)  
- ✅ Converted action buttons to single row with icons only and tooltips
- ✅ Changed share button color to golden (#BF9231) per user request
- ✅ Restructured manufacturer data: converted "رنج روفر" and "دفيندر" from manufacturers to categories under "لاند روفر" manufacturer
- ✅ Updated comprehensive seed data with new Land Rover structure and added Defender vehicles
- ✅ Reseeded database with updated manufacturer hierarchy and vehicle categorization
- ✅ Added Land Rover data to cars.json with all Range Rover and Defender models and trims
- ✅ Fixed specifications management API integration to properly load Land Rover categories and trim levels
- ✅ Resolved Land Rover trim levels issue by cleaning duplicate entries in cars.json file
- ✅ Fixed API endpoints for cars/trims to properly return Land Rover model trim levels
- ✅ Verified all Land Rover models now return correct trim level data via API
- ✅ Fixed critical JavaScript runtime errors including Calendar and ShoppingCart import issues
- ✅ Resolved TypeScript compilation errors in inventory page for production readiness

### Vehicle Reservation Enhancement - Allow Booking Vehicles On The Road (July 22, 2025)
- ✅ Updated vehicle reservation logic to allow booking cars regardless of status except for sold or already reserved vehicles
- ✅ Modified frontend validation in inventory table to permit reservations for vehicles with status "في الطريق" (on the road)
- ✅ Changed reservation button disable condition from `item.status !== "متوفر"` to `item.status === "محجوز"`
- ✅ Users can now reserve vehicles that are in transit, in maintenance, or have any status other than already reserved or sold

### Comprehensive Vehicle Edit Form Enhancement (July 21, 2025)
- ✅ Enhanced vehicle edit form to display complete vehicle data instead of just basic inventory information
- ✅ Added comprehensive fields: detailed specifications, sale status, sold date, reservation date, reserved by, reservation notes
- ✅ Implemented conditional display: sold date field only appears when vehicle is marked as sold
- ✅ Updated insertInventoryItemSchema to support all additional vehicle data fields with proper validation
- ✅ Enhanced form with proper Arabic labels: المواصفات التفصيلية، حالة البيع، تاريخ البيع، تاريخ الحجز، محجوز بواسطة، ملاحظة الحجز
- ✅ Maintained existing functionality while expanding data visibility for complete vehicle management
- ✅ Fixed TypeScript integration and form validation for all new fields

### Database Integration Completed (July 21, 2025)
- ✅ Successfully integrated PostgreSQL database with complete schema deployment
- ✅ Migrated from in-memory storage to DatabaseStorage implementation
- ✅ Database schema pushed and applied successfully using Drizzle Kit
- ✅ Comprehensive data seeding completed with sample inventory, users, manufacturers, and companies
- ✅ All API endpoints now connected to PostgreSQL database for persistent data storage
- ✅ Application successfully running with database integration and real data persistence

### Vehicle Sharing Enhancement - Linked Images Integration (July 21, 2025)
- ✅ Enhanced vehicle sharing system to include linked image URLs from image management system
- ✅ Added automatic image link lookup based on vehicle specifications (manufacturer, category, trim level, year, colors, engine capacity)
- ✅ Integrated linked image URL display in share text with dedicated icon and status indicator
- ✅ Added separate checkbox control for linked image inclusion in sharing options
- ✅ Created dedicated copy button for linked image URL with proper error handling
- ✅ Enhanced sharing preview to show linked image URL when available and selected
- ✅ Maintained existing image attachment functionality while adding linked image support
- ✅ Improved sharing interface with clear distinction between linked images and attached images

### Manufacturer Logo Integration System (July 21, 2025)
- ✅ Integrated comprehensive manufacturer logo collection with 23+ car brand logos (Mercedes, BMW, Toyota, Lexus, Nissan, etc.)
- ✅ Created manufacturer-logos.ts mapping system linking Arabic and English brand names to SVG logo files
- ✅ Moved all logo files from logos/ folder to public/ directory for web accessibility
- ✅ Built ManufacturerLogo component with fallback handling and multiple size options (sm, md, lg)
- ✅ Integrated logos into inventory table showing logo + manufacturer name for each vehicle
- ✅ Updated card view pages (both card-view.tsx and card-view-new.tsx) to display manufacturer logos
- ✅ Enhanced visual identity with professional brand logos for luxury car manufacturers
- ✅ Updated Excel import template to match user's specified columns exactly as requested
- ✅ System now displays authentic manufacturer logos throughout the inventory management interface
- ✅ Updated Excel import template to match user requirements with exact columns: الصانع، الفئة، درجة التجهيز، سعة المحرك، السنة، اللون الخارجي، اللون الداخلي، الحالة، الموقع، الإستيراد، رقم الهيكل، نوع الملكية، تاريخ الدخول، السعر، الملاحظات
- ✅ Fixed TypeScript error handling in Excel import component for better type safety

### Luxury Vehicle Inventory Addition (July 21, 2025)
- ✅ Added 50 luxury vehicles to the inventory system as requested by user
- ✅ Collection includes: Range Rover (8 vehicles), Mercedes (15 vehicles), Lexus (12 vehicles), Genesis (8 vehicles), Nissan (7 vehicles), Bentley (7 vehicles)
- ✅ Variety of vehicle types: SUVs, sedans, sports cars, electric vehicles, hybrids, and convertibles
- ✅ Complete with detailed specifications: engine capacity, trim levels, colors, prices, locations, and status
- ✅ Mix of import types: company imports, personal imports, and used personal vehicles
- ✅ Different statuses: available, in transit, reserved, maintenance, and sold
- ✅ Price ranges from 85,000 SAR (used Nissan Altima) to 2,250,000 SAR (limited edition Lexus LFA)
- ✅ Includes special editions and electric vehicles: Mercedes EQS580, Genesis Electrified GV70, Range Rover Electric

### VIN-Based Vehicle Linking System Implementation (July 21, 2025)
- ✅ Added chassis number (VIN) field to specifications management system for vehicle-specific linking
- ✅ Enhanced specifications database schema to include optional chassisNumber field with proper TypeScript integration
- ✅ Updated specifications management component with VIN input field and visual indicators showing linked chassis numbers
- ✅ Added chassis number field to image management system for linking images to specific vehicles
- ✅ Enhanced image links database schema and UI to support VIN-based image associations
- ✅ Updated MemStorage implementation to handle chassis number data in CRUD operations
- ✅ Visual enhancements: specifications display blue badges for linked VIN numbers, image management shows chassis numbers in details
- ✅ Both systems now support optional vehicle-specific linking while maintaining general specification/image management functionality

### Image Management System Implementation (July 20, 2025)
- ✅ Created comprehensive Image Management component for linking images to vehicle specifications
- ✅ Added "إدارة الصور" button next to "إدارة المواصفات" in main inventory page admin section
- ✅ Implemented image URL linking system with vehicle attributes: manufacturer, category, trim level, year, exterior color, interior color
- ✅ Added special engine capacity field that appears specifically for "رنج روفر" vehicles
- ✅ Created API endpoints for CRUD operations on image links (/api/image-links)
- ✅ Enhanced MemStorage with placeholder methods for image link management
- ✅ Integrated comprehensive form validation and error handling for image URL management
- ✅ Added visual preview system with error handling for broken image links
- ✅ Implemented tabbed interface with separate sections for adding/editing and managing existing links
- ✅ Enhanced individual vehicle specifications system for detailed per-vehicle data tracking

### Image URL Field Replaced with Ownership Type (July 20, 2025)
- ✅ Replaced "رابط الصور" (Image URL) field with "نوع الملكية" (Ownership Type) in both inventory forms per user request
- ✅ Updated inventory-form-simple.tsx to include ownership type selection with options: "ملك الشركة" and "معرض (وسيط)"
- ✅ Updated inventory-form.tsx to show ownership type field with editable select component
- ✅ Modified inventory table to display ownership type column instead of images column
- ✅ Enhanced card-view-new.tsx with ownership type filtering capabilities
- ✅ Added ownership type to search functionality across all filter systems
- ✅ Updated default values and schema validation to include ownership type field
- ✅ Maintained consistency across all UI components and filtering systems
- ✅ Added Excel import functionality per user request:
  - Added "استيراد من Excel" button in admin section of inventory page
  - Enhanced ExcelImport component to properly parse real Excel files using xlsx library
  - Supports .xlsx, .xls, and .csv file formats
  - Includes proper field mapping for Arabic headers
  - Validates required fields and provides detailed error messages
  - Downloads template with proper Arabic headers and sample data
- ✅ Fixed year button statistics bug in card view filters (number/string comparison issue)
- ✅ Made filter container take full width (100%) per user request
- ✅ Updated layout and alignment to proper RTL (right-to-left) for Arabic content:
  - Added dir="rtl" to main container
  - Changed text alignment to right-aligned for all Arabic text
  - Updated filter button layouts to start from right
  - Modified search input positioning for RTL layout
  - Fixed button spacing and alignment for Arabic interface
- ✅ Fixed year filter statistics bug in card view - year field comparison now properly handles number/string conversion
- ✅ Integrated comprehensive car data from cars.json file into inventory forms and specifications management
- ✅ Added API endpoints to serve car data (manufacturers, models, trims) from cars.json
- ✅ Fixed specifications management to properly save data in MemStorage with full CRUD operations
- ✅ Added import functionality for car data from cars.json into database
- ✅ Removed "إنشاء عرض سعر" (Create Quote) buttons from main inventory page only per user request:
  - Removed main create quote button from inventory page admin section
  - Removed QuickQuoteGenerator component from inventory table actions
  - Kept quote creation buttons in card view pages (both card-view.tsx and card-view-new.tsx)
  - Maintained handleCreateQuote function and QuickQuoteGenerator for card views
- ✅ Fixed inventory edit form to properly display and save all vehicle data:
  - Enhanced form data initialization to ensure all fields are populated during edit
  - Added trimLevel field to edit form with proper input handling
  - Fixed year field to use value instead of defaultValue for proper data binding
  - Improved form reset logic for both edit and create modes
  - Ensured price field is properly included in form schema and validation
- ✅ Enhanced card view filters to use real inventory data only:
  - Updated filter functions to extract values from actual inventory items
  - Removed hardcoded manufacturer and category lists
  - Added getAvailableManufacturers() to dynamically load manufacturers from inventory
  - Modified getAvailableCategories() to show categories from real data based on selected manufacturer
  - All filter dropdowns now display only available options from existing inventory items
  - Improved data filtering to exclude sold cars unless specifically requested to show them

### Print System Enhancements - Golden Headers & Clean Layout (July 21, 2025)
- ✅ Enhanced table printing with golden header styling (#C49632) and white text per user request
- ✅ Removed actions column (الإجراءات) completely from printed tables for cleaner appearance
- ✅ Removed engineer checkbox from print customization dialogs to streamline column selection
- ✅ Improved print function with better HTML cleaning and actions column removal logic
- ✅ Updated both advanced-print-dialog.tsx and print-customization-dialog.tsx to exclude engineer field
- ✅ Enhanced table header styling with inline CSS to ensure golden background color persists in print
- ✅ Comprehensive table cleaning: removes SVGs, buttons, actions cells, and class attributes for clean printing
- ✅ Modified print function to use improved regex patterns for reliable actions column removal

### System-Wide Golden Checkbox Styling Implementation (July 21, 2025)
- ✅ Applied golden color (#C49632) to ALL checkboxes and radio buttons throughout the entire system per user request
- ✅ Updated vehicle-share.tsx component with golden checkbox styling for all field selection options
- ✅ Updated quotation-creation.tsx with golden styling for VAT and license plate checkboxes
- ✅ Updated quotation-edit.tsx with golden styling for license plate checkbox and radio buttons
- ✅ Updated advanced-print-dialog.tsx with golden styling for column selection checkboxes
- ✅ Updated print-customization-dialog.tsx with golden styling for all checkboxes and additional options
- ✅ Added global CSS rules in index.css to ensure consistent golden color for all checkbox/radio elements:
  - Native HTML checkbox/radio elements use accent-color: #C49632
  - Shadcn/ui Checkbox components use data-[state=checked] styling
  - RadioGroup components use button[role="radio"] styling
- ✅ Ensured system-wide consistency across all forms, dialogs, and interactive components
- ✅ Both native HTML form elements and shadcn/ui components now display golden color when selected

### Enhanced Manufacturer Logo Management - Full Coverage System (July 20, 2025)
- ✅ Enhanced manufacturer logo management to include ALL manufacturers from inventory data
- ✅ Added comprehensive "الصناع من المخزون" section showing auto-detected manufacturers
- ✅ Created separate sections for registered vs inventory manufacturers with distinct visual styling
- ✅ Added SVG format support to logo uploads alongside existing formats (PNG, JPG, JPEG, GIF, WebP)
- ✅ Enhanced logo upload interface with improved visual sections and clear instructions
- ✅ Added "إضافة للنظام" button for inventory manufacturers to register them for logo management
- ✅ Updated supported formats documentation to include SVG in help text and validation messages
- ✅ Improved manufacturer count display to show accurate totals including inventory manufacturers
- ✅ Enhanced visual design with color-coded sections (green for inventory, blue for registered)
- ✅ Added proper file type validation for all supported formats including SVG (image/svg+xml)

### Excel Import/Export Enhancement - Comprehensive Data Fields (July 20, 2025)
- ✅ Added Excel import button to inventory page admin section
- ✅ Enhanced ExcelImport component to use real xlsx library for proper file parsing
- ✅ Updated Excel import template to include all inventory fields:
  - Basic fields: الصانع، الفئة، درجة التجهيز، سعة المحرك، السنة، الألوان
  - Status fields: الحالة، نوع الاستيراد، الموقع، رقم الهيكل
  - Financial fields: السعر، المشتري، سعر البيع، الربح
  - Management fields: المهندس، تاريخ الوصول، تاريخ البيع، الملاحظات
  - System fields: مباع (boolean support for Yes/No values)
- ✅ Enhanced file validation to accept .xlsx, .xls, and .csv formats
- ✅ Improved data validation with detailed error messages for missing required fields
- ✅ Updated export functionality (exportToExcel) to include all comprehensive fields:
  - Added Arabic headers mapping for all new fields
  - Enhanced date formatting for arrival and sale dates
  - Added price formatting with Arabic locale
  - Improved boolean field display (نعم/لا)
  - Added proper column widths for all fields in Excel export
- ✅ Updated template download functionality with sample data showing all fields
- ✅ Enhanced user instructions with detailed field explanations and format requirements

### Previous Migration to Replit Environment (July 17, 2025)
- ✅ Successfully completed migration from Replit Agent to Replit environment
- ✅ All required packages installed and verified
- ✅ Configured storage system to use in-memory storage for development compatibility  
- ✅ Modified database configuration to gracefully handle missing DATABASE_URL
- ✅ Application runs properly on Replit without requiring immediate database setup
- ✅ Verified project functionality with feedback tool
- ✅ Enhanced quotation preview layout with improved customer addressing section
- Migration completed with full functionality verification
- Updated quotation preview layout per user request: moved customer details (name, email) to display directly below "عرض سعر" header and date
- Added PDF download functionality to quotation preview component with html2canvas and jsPDF integration
- Enhanced quotation system with download button for generating PDF files of quotes and invoices
- All dependencies properly installed and application fully functional
- Fixed server storage interface to include all required methods for terms and conditions, system settings, and company management
- Implemented complete MemStorage class with all required methods to ensure compatibility
- Removed fixed width and height styling from quotation preview div element per user request
- Updated quotation preview layout: moved quote number and date to same row as "عرض سعر" title
- Reorganized vehicle information section into three rows: (1) Manufacturer/Category/Trim Level, (2) Year/Engine/Exterior Color, (3) Interior Color/Chassis Number
- Removed representative phone field from quotation preview per user request
- Enhanced PDF export quality with 4x resolution scaling, PNG format, optimized font rendering, and fallback system for ultra-high quality output
- Implemented fixed A4 dimensions (2480x3508px at 300 DPI) for consistent PDF output regardless of device screen size or mobile/desktop viewing
- Added customer title/addressing format to quotation preview with options for السادة، السيد، السيدة، الشيخ، سمو الأمير displayed as "Title / CustomerName الموقرين"
- Added full-width customer addressing section directly below "عرض سعر" header with centered text and enhanced styling
- Reorganized quotation layout with improved visual structure: side-by-side customer and vehicle information, enhanced shadows, better spacing, and consistent styling across all sections
- Moved representative information section below Terms & Conditions section in quotation preview per user request
- Updated quotation preview layout to display quote number and date in the same row as "عرض سعر" title
- Removed customer addressing section from quotation preview per user request
- Fixed currency display from "قرش" to "هلل" in Arabic number conversion for quotation totals
- Reorganized vehicle information into 2 rows: (1) Manufacturer/Category/Trim/Year, (2) Exterior Color/Interior Color/Chassis Number
- Removed engine capacity field from vehicle information display
- Added print-specific styling to hide edit button while preserving original margins to match preview display in PDF output
- Enhanced quotation preview with improved padding and spacing for better presentation
- Fixed Arabic currency text in numberToArabic function: changed "قرش" to "هلل" for proper Saudi currency format
- Updated customer information section styling in quotation preview with specific classes: pt-[1px] pb-[1px] text-[13px] text-right
- Added background toggle switch functionality to quotation preview allowing users to switch between albarimi-1.jpg and albarimi-2.jpg backgrounds with Arabic labels (خلفية 1 / خلفية 2)
- Updated vehicle information display format to show labels and values side by side (e.g., "الصانع: مرسيدس") instead of vertically stacked for better readability
- Fixed text alignment in vehicle information section from center to right-aligned for proper Arabic text display
- Enhanced specifications management to load all dropdown data from database APIs (manufacturers, categories, engine capacities)
- Removed email field from customer information section in quotation preview per user request
- Reorganized vehicle information section into grid layout with three rows: (1) Manufacturer/Category/Trim Level, (2) Year/Engine/Exterior Color, (3) Interior Color/Chassis Number for better space utilization
- Migration completed with full functionality verification
- Updated quotation preview layout per user request: moved customer details (name, email) to display directly below "عرض سعر" header and date
- Added PDF download functionality to quotation preview component with html2canvas and jsPDF integration
- Enhanced quotation system with download button for generating PDF files of quotes and invoices
- All dependencies properly installed and application fully functional
- Fixed server storage interface to include all required methods for terms and conditions, system settings, and company management
- Implemented complete MemStorage class with all required methods to ensure compatibility
- Removed fixed width and height styling from quotation preview div element per user request
- Updated quotation preview layout: moved quote number and date to same row as "عرض سعر" title
- Reorganized vehicle information section into three rows: (1) Manufacturer/Category/Trim Level, (2) Year/Engine/Exterior Color, (3) Interior Color/Chassis Number
- Removed representative phone field from quotation preview per user request
- Enhanced PDF export quality with 4x resolution scaling, PNG format, optimized font rendering, and fallback system for ultra-high quality output
- Implemented fixed A4 dimensions (2480x3508px at 300 DPI) for consistent PDF output regardless of device screen size or mobile/desktop viewing
- Added customer title/addressing format to quotation preview with options for السادة، السيد، السيدة، الشيخ، سمو الأمير displayed as "Title / CustomerName الموقرين"
- Added full-width customer addressing section directly below "عرض سعر" header with centered text and enhanced styling
- Reorganized quotation layout with improved visual structure: side-by-side customer and vehicle information, enhanced shadows, better spacing, and consistent styling across all sections
- Moved representative information section below Terms & Conditions section in quotation preview per user request
- Updated quotation preview layout to display quote number and date in the same row as "عرض سعر" title

## Changelog

```
Changelog:
- July 02, 2025: Initial setup with Arabic inventory management system
- July 02, 2025: Updated field structure - changed المهنشي to الاستيراد, added الصانع field, split colors into interior/exterior, changed الإصدار to سعة المحرك
- July 02, 2025: Added PostgreSQL database with DatabaseStorage implementation, seeded with sample data
- July 02, 2025: Restructured to hierarchical manufacturer → category system (مرسيدس → E200, C200, C300), auto-populated entry date, enhanced mobile responsiveness
- July 02, 2025: Implemented one-time manufacturer logo management system with dedicated manufacturers table and API endpoints
- July 02, 2025: Added 13 base manufacturers (مرسيدس، بي ام دبليو، رولز رويز، بنتلي، رنج روفر، دفندر، بورش، لكزس، لينكون، شوفولية، تويوتا، تسلا، لوسيد)
- July 02, 2025: Modified card view to exclude sold cars from display and calculations, replaced category counts with dropdown list
- July 02, 2025: Updated Excel import template with all new fields (manufacturer, category, engine capacity, colors, status, import type, location, chassis number, price, notes) and added comprehensive instructions with valid values for each field
- July 02, 2025: Redesigned navigation header with company logo placeholder, improved mobile responsiveness, and removed system title text for cleaner look
- July 02, 2025: Created comprehensive appearance management page with theme colors, company branding, manufacturer logos, and UI customization options
- July 02, 2025: Integrated ListManager component for better list options management with tabbed interface
- July 02, 2025: Added appearance management to admin navigation with back-to-home button for better user navigation
- July 02, 2025: Added admin dropdown menu next to logout button with options for appearance management, user management, and manufacturer settings
- July 02, 2025: Implemented sell vehicle functionality with status update to "مباع" and automatic sale date recording using Gregorian calendar
- July 02, 2025: Created CategoryManager component for managing manufacturer-linked categories with hierarchical organization
- July 02, 2025: Updated card view to display only manufacturer logo and count without "متوفر" text for cleaner appearance
- July 02, 2025: Implemented comprehensive appearance management system with database schema (appearance_settings table), API endpoints for settings and logo management, real-time theme application, and full UI controls for company branding, color schemes, manufacturer logos, and layout preferences
- July 02, 2025: Integrated global theme control across entire website with useTheme hook, ThemeProvider component, and CSS variables for real-time theme updates in all pages including inventory and card views
- July 02, 2025: Fixed dark mode system and added real-time color preview in appearance management with instant theme application, proper CSS variable handling for both light and dark modes, and immediate visual feedback for color changes
- July 02, 2025: Fixed manufacturer logo upload system in appearance management to apply directly to manufacturer database with updated API endpoints and manufacturer-stats integration for real-time logo display in card view
- July 03, 2025: Implemented comprehensive chassis number photo capture and OCR extraction system using OpenAI Vision API with camera support, image processing, and automatic text extraction integrated into inventory form with unique constraint validation
- July 03, 2025: Enhanced manufacturer logo upload system with improved visual design - expanded upload area, clearer instructions, better preview display, and integrated logo upload directly into manufacturer creation form with dedicated upload box
- July 03, 2025: Updated voice chat icon from message square to volume/speaker icon in floating action buttons across all pages, improved visual clarity for audio functionality, and ensured consistent use of uploaded manufacturer logos in aggregated data displays
- July 03, 2025: Upgraded voice assistant with comprehensive AI-powered inventory management - replaced basic voice chat with advanced VoiceAssistant component featuring natural language processing through OpenAI GPT-4o, complete vehicle management capabilities (add, edit, sell, delete), chassis number OCR extraction from photos, and intelligent command interpretation with Arabic language support
- July 03, 2025: Enhanced manufacturer management system integration - improved appearance management page with dedicated manufacturer logo section and instructions, enhanced manufacturer management page with better visual design and upload areas, integrated manufacturer filtering in card view with dropdown selector showing logos and counts, and linked appearance management directly to manufacturer logo management for seamless workflow
- July 03, 2025: Resolved manufacturer creation issue - removed standalone manufacturers management page and consolidated all manufacturer creation functionality into appearance page with dedicated "Add New Manufacturer" button, implemented duplicate name validation with clear error messages in Arabic, and enhanced API error handling for unique constraint violations with user-friendly messaging
- July 03, 2025: Implemented interactive manufacturer logo hover effects with smooth animations, scaling effects, pulse animations, ring effects, and enhanced visual feedback in both main card view and filter dropdown for improved user experience
- July 03, 2025: Added comprehensive search functionality to card view interface with real-time filtering across multiple fields (chassis number, category, colors, location, manufacturer, engine capacity, year, status, import type, notes), visual search results indicator with clear search button, and responsive search input with Arabic placeholder text
- July 03, 2025: Implemented comprehensive dark mode system with custom color palette - Black (#000000), Sooty (#141414), Dire Wolf (#282828), and deep purple accents (#230046, #320064), added dark mode toggle icons to all pages, enhanced useTheme hook with toggle functionality, and updated CSS variables for complete dark mode theming support
- July 05, 2025: Added smooth CSS animations for dark mode transitions with 0.3s ease transitions on all elements, implemented car reservation functionality with status change to "محجوز" and automatic reservation date tracking, added reservation button to action buttons with Calendar icon and appropriate styling, and enhanced database schema with reservationDate field for tracking reservation timestamps
- July 05, 2025: Fixed inventory statistics data accuracy - updated database storage to include "reserved" category in stats, reorganized statistics grid layout with proper 4+1 column arrangement (قيد الصيانة، متوفر، في الطريق، إجمالي العناصر in first row, محجوز in second row), and integrated real manufacturer logos from database instead of emoji placeholders in manufacturer statistics cards
- July 05, 2025: Removed "sold" box from dashboard and reorganized statistics layout into cleaner 4-column grid (Reserved + 3 import types), and redesigned action buttons in card view with improved two-row layout (Edit/Delete in first row, Reserve-Cancel/Sell in second row) with better visual styling and larger button sizes for improved usability
- July 05, 2025: Expanded seed data with comprehensive manufacturer categories including popular models (Mercedes S-Class/E-Class/C-Class, BMW 7/5/3 Series, Audi A8/A6/Q8, Toyota Land Cruiser/Camry, Lexus LX 600/ES 350, Range Rover Vogue/Sport, Porsche Cayenne/911, and luxury brands like Ferrari/Lamborghini/Maserati), added 25+ manufacturers total, and implemented reservation/cancel reservation buttons in main inventory table with proper API integration and visual indicators
- July 05, 2025: Implemented company logo display system - integrated company logo from appearance management to be displayed in website headers across inventory and card view pages, with fallback to default "ش" character when no logo is uploaded, enhanced logo container with proper sizing and overflow handling for optimal display
- July 05, 2025: Fixed vehicle reservation system - prevented reservation of sold vehicles by adding isSold condition to reservation buttons in both inventory table and card view, ensuring sold vehicles cannot be reserved while maintaining proper reservation functionality for available vehicles
- July 05, 2025: Fixed manufacturer statistics in homepage - updated getManufacturerStats to include sold vehicles in total count and prevent manufacturer cards from being hidden when all vehicles are sold, ensuring accurate inventory representation across all statuses
- July 05, 2025: Fixed manufacturer card display in homepage - updated card view to show total vehicle count including sold vehicles using allGroupedData instead of filtered data, ensuring accurate count display in manufacturer cards
- July 05, 2025: Updated manufacturer statistics to exclude sold vehicles - modified both frontend card display and backend getManufacturerStats to filter out sold vehicles from total counts, ensuring sold vehicles are removed from manufacturer card totals when sold
- July 05, 2025: Implemented "Show Sold Cars" toggle feature in card view - added showSoldCars state variable, conditional display logic for sold vehicles, dynamic manufacturer count calculation (includes sold cars when toggle is active), and toggle button in filter section for complete sold car visibility control
- July 05, 2025: Implemented role-based access control for admin-only features - restricted "Show Sold Cars" button and "Appearance Management" button to admin users only in both inventory table and card view interfaces, ensuring regular users cannot access these administrative functions while maintaining full functionality for admin users
- July 05, 2025: Streamlined authentication system - removed user registration functionality from login interface, maintaining only admin and seller roles with secure password authentication, ensuring simplified user access management focused on inventory operations
- July 17, 2025: Successfully migrated project from Replit Agent to Replit environment - set up PostgreSQL database with complete schema migration, populated with comprehensive demo data including 15 inventory items across multiple manufacturers, integrated professional Arabic quote template system with Albarimi branding, added Quick Quote Generator buttons to both inventory table and card view interfaces for seamless PDF quote generation with company branding and vehicle detailsn interface, fixed authentication for user "abdullah" with proper bcrypt password hashing, improved login button styling with blue color scheme and loading states, and removed "manufacturer management" button from admin dropdown menu to simplify interface
- July 05, 2025: Simplified admin interface - removed "user management" and "manufacturer management" buttons from both inventory table header and card view admin dropdown menus to streamline the interface and reduce administrative complexity
- July 05, 2025: Updated admin interface - replaced "location management" button with "user management" button in both inventory table and card view interfaces, restoring user management functionality while removing location management to simplify the admin workflow
- July 05, 2025: Fixed admin interface functionality - removed notification bell button from inventory page, created new simplified user management page (user-management-simple.tsx) with working CRUD operations, proper API integration, and clean Arabic interface to replace the broken user management page
- July 05, 2025: Changed date system from Hijri to Gregorian calendar - updated all date displays and reservation date recording throughout the system, modified entry date display in card view from 'ar-SA' to 'en-US' locale, updated reservation date display and recording in both card view and inventory table, and changed print date format in utils.ts to use Gregorian calendar for consistency across the entire application
- July 05, 2025: Enhanced voice assistant with dual input mode support - implemented comprehensive text and voice command interface using Tabs component, added text input field with Enter key support and Send button, integrated both voice recognition and text input processing through the same API endpoint, included example commands for user guidance, and improved accessibility with DialogTitle for screen readers
- July 05, 2025: Implemented comprehensive database integration for voice assistant - added complete CRUD operations support including vehicle search, addition, editing, deletion, selling, reservation and cancellation, integrated OpenAI GPT-4o for intelligent command interpretation with Arabic language support, developed dedicated action handlers for all vehicle operations with proper error handling and user feedback, and enhanced system prompt with detailed examples for accurate command recognition
- July 06, 2025: Implemented complete Docker containerization - created production-ready Dockerfile with Node.js 20 Alpine, comprehensive docker-compose.yml with PostgreSQL 15, health checks, persistent volumes, and networking, automated setup script (run-docker.sh) for one-command deployment, complete documentation (DOCKER_SETUP.md) with troubleshooting guide, and support for environment variable management including OpenAI API key integration
- July 13, 2025: Added comprehensive trim level management system - created trim_levels database table with manufacturer, category, and trimLevel fields, implemented full CRUD API endpoints, added trim level dropdown to inventory form with category dependency, integrated trim level management button for easy administration, added trim level display to both card view and inventory table, updated search functionality to include trim level filtering, and populated test data for Mercedes (E200/E300, S500/S600) and BMW (xDrive30i/xDrive40i) models
- July 13, 2025: Implemented comprehensive specifications management system - created specifications database table with manufacturer, category, trimLevel, year, and engineCapacity as primary keys, built full CRUD API endpoints for specifications management, added specifications share functionality with detailed vehicle information display, integrated specifications management button in both inventory table and card view admin dropdowns, created dedicated specifications management component with Arabic interface, and implemented vehicle sharing with comprehensive specifications lookup and display
- July 14, 2025: Enhanced quotation creation system with comprehensive pricing controls - redesigned quotation from simple dialog to full-page creation interface with multiple management windows, implemented automatic quote number generation with QR code (non-editable), added comprehensive pricing details section with base price/quantity/tax calculations, integrated license plate pricing with tax control options (subject to tax or exempt), added VAT inclusive/exclusive pricing modes with automatic tax calculation, created vehicle data editing within quotes, built company and representative data management with save/load functionality, added quotes viewing window for searching and editing saved quotes, implemented print functionality for quotations, and updated database schema with pricing details and QR code data fields
- July 14, 2025: Implemented comprehensive quotation improvements - added mandatory representative and company selection fields with pre-populated options, fixed quotation saving system with proper validation, created professional A4 print format with company header including logo and company info, QR code display, proper date formatting, customer and representative information sections, vehicle details with manufacturer logo, structured price breakdown (base price, tax, license plates, total), tax value display when tax-inclusive is selected, added Arabic text conversion for final total amount, and enhanced print layout with proper spacing and professional formatting
- July 14, 2025: Successfully migrated project from Replit Agent to Replit environment - configured PostgreSQL database with proper connection, installed all dependencies, set up OpenAI API key for voice assistant functionality, seeded database with comprehensive sample data including manufacturers and inventory items, created default user accounts (admin/admin123, seller/seller123), fixed React warning in inventory form by removing problematic useEffect refetch call, and verified all core functionality including inventory management, specifications system, quotation creation, and voice assistant integration
- July 14, 2025: Cleaned up quotation interface - removed "Show Sold Cars" button from card view, removed "إدارة بيانات الشركة" button from quotation creation page, and restructured quotation preview to include license plate column alongside tax column with 6-column layout (Model, Quantity, Price, Tax, License Plates, Total) where license plates are tax-exempt with default value of 900
- July 14, 2025: Enhanced vehicle sharing feature - added editable price functionality for sharing, included exterior and interior colors in share text, implemented price editing interface with save button, and fixed React maximum update depth warning in inventory form by removing problematic useEffect dependency
- July 14, 2025: Enhanced quotation A4 preview with comprehensive company information display - added registration number, tax number, and license number fields to header section below company name and address, implemented conditional display based on selected company data availability, and removed empty div element from quotation preview for cleaner layout
- July 14, 2025: Successfully migrated project from Replit Agent to Replit environment with full functionality - configured PostgreSQL database, installed all dependencies, integrated OpenAI API for voice assistant, seeded database with comprehensive sample data, verified all core features working including inventory management, specifications system, quotation creation, and voice assistant integration
- July 14, 2025: Fixed manufacturer management interface - added inline name editing functionality with save/cancel buttons, resolved logo upload issues with proper file handling and error validation, improved user experience with real-time editing capabilities and better error messages for duplicate names and file size constraints
- July 15, 2025: Enhanced quotation A4 preview with manufacturer logo display in vehicle information section, added company stamp functionality with dedicated stamp area beside terms and conditions, implemented stamp upload button in quotation creation interface with real-time preview updates, removed "Model" column from pricing table to simplify layout (now 5 columns), and integrated automatic terms refresh in quotation preview when terms are updated
- July 15, 2025: Added new "إنشاء عرض سعر" (Create Quote) button to inventory page for creating quotations with empty vehicle data, implemented comprehensive quotation creation page with dropdown selections for manufacturer, category, trim level, year, engine capacity, colors, and chassis number, integrated vehicle data selection tabs (vehicle, pricing, company, representative), added missing API endpoints for categories and engine capacities, and created complete quotation workflow with empty vehicle data input
- July 15, 2025: Successfully migrated project from Replit Agent to Replit environment with full functionality - configured PostgreSQL database, installed all dependencies, integrated OpenAI API for voice assistant, seeded database with comprehensive sample data, verified all core features working including inventory management, specifications system, quotation creation, and voice assistant integration
- July 15, 2025: Modified quotation to invoice conversion functionality - removed all data validation requirements from convertToInvoice function, allowing conversion to invoice even with incomplete data by using fallback values for missing fields, ensuring seamless invoice creation regardless of data completeness
- July 15, 2025: Implemented comprehensive QR code functionality in quotation headers - added QR code generation using qrcode library with vehicle details, customer information, and pricing data, integrated QR code display in quotation A4 preview header section, fixed styling issues in stamp and notes sections, and removed unused quotation-creation-empty page and its references from routing system
- July 15, 2025: Replaced invoice button with toggle switch for seamless quotation/invoice mode switching - implemented Switch component with purple styling, automatic invoice number generation when switching to invoice mode, toast notifications for mode changes, and dynamic label display showing current mode (عرض سعر/فاتورة)
- July 15, 2025: Enhanced quotation A4 preview with comprehensive company-specific customization - implemented dynamic color theming system using company's primaryColor, secondaryColor, and accentColor for headers, borders, and UI elements, added extensive company data display including registration number, tax number, license number, and website, created adaptive design that applies company branding throughout all preview sections (customer info, vehicle details, pricing table, terms & conditions, and stamp area), and integrated company logo watermark background for professional appearance
- July 16, 2025: Cleaned up quotation creation interface - removed multiple management buttons (شركات, إدارة الشركات, إدارة بيانات المندوب, تحكم الشركات) for streamlined user experience, removed unused dialog components and state variables, eliminated redundant company and representative management dialogs, simplified interface while maintaining core quotation functionality
- July 16, 2025: Fixed quotation editing functionality - implemented proper edit button behavior in quotation management to load quotation data into creation form, enhanced data loading from localStorage for editing mode, added quotation update API endpoint and storage method, fixed duplicate quote number errors with enhanced unique number generation including timestamp and random components for both quotations and invoices
- July 16, 2025: Enhanced quotation creation vehicle data handling - modified "Create Quote" button to clear stored vehicle data ensuring empty vehicle fields with dropdown menus for manual selection, improved vehicle data initialization logic to support both editing mode (pre-populated) and new creation mode (empty fields), implemented proper vehicle data state management for different creation scenarios
- July 16, 2025: Implemented comprehensive integration management page - created dedicated page for managing API keys and external services (OpenAI, PostgreSQL, Email, SMS, Cloud Storage, Payment Gateway), added tabbed interface for different service types (APIs, Databases, Services), integrated connection testing functionality, added admin dropdown menu access from both inventory and card view pages, implemented service status monitoring and configuration management
- July 16, 2025: Implemented comprehensive vehicle data editing in quotation creation - added full edit dialog for modifying all vehicle specifications (manufacturer, category, trim level, year, engine capacity, exterior/interior colors, chassis number, price), integrated dropdown menus for structured data fields, automatic price transfer to pricing details section when vehicle data is updated, real-time state synchronization across all vehicle-related form fields
- July 16, 2025: Enhanced quotation creation with automatic specifications display - implemented real-time specifications preview when vehicle parameters are selected (manufacturer, category, trim level, year, engine capacity), added VehicleSpecificationsDisplayComponent to show detailed vehicle specifications including engine details, transmission, drivetrain, fuel type, seating capacity, performance data, safety features, comfort features, and warranty information, integrated automatic specification retrieval with proper loading states and error handling, ensured all quotation data is properly saved to database with comprehensive data structure including vehicle specifications, pricing calculations, company information, and representative data
- July 17, 2025: Updated quotation A4 preview background to use A4 - 1.jpg template - completely recreated quotation preview component with new professional A4 template as background image, copied A4 - 1.jpg to public folder for web accessibility, enhanced visual design with semi-transparent content sections for better readability, maintained all existing functionality including PDF download, QR codes, pricing calculations, and company branding while improving overall appearance and layout
- July 17, 2025: Added customer title/honorific selection feature - implemented customerTitle field in quotation creation form with dropdown options (السادة، السيد، السيدة، الشيخ، سمو الأمير), added customerTitle to quotation schema, integrated title display in quotation preview as "Title / CustomerName الموقرين", updated quotation data saving to include customer title in database
- July 17, 2025: Enhanced quotation A4 preview layout per user feedback - removed "الاسم:" label from customer section, created full-width centered customer display with title/name format, added spacing between customer name and "الموقرين" text, integrated "صالح حتى" (valid until) date next to main date showing 30-day validity period, reduced row height in price details table from p-3 to p-2 for compact layout, made stamp section transparent background for professional appearance
- July 19, 2025: Finalized quotation system improvements - updated validity period default from 30 days to 3 days with editable field, completely removed additional notes section from quotation creation form, removed company selection field from quotation creation interface for streamlined workflow, maintained all existing functionality including PDF export and print optimization with 3mm margins
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
UI preferences: Add specifications management button next to "Add Item" button for easy access.
```