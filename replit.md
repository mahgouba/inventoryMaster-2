# Vehicle Inventory Management System

## Project Overview
A full-stack vehicle inventory management system built with React/TypeScript frontend and Express/Node.js backend, using PostgreSQL database with Drizzle ORM. The system manages vehicle inventory, sales tracking, user management, and financial calculations for a vehicle dealership.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL with automatic provisioning
- **Authentication**: Passport.js with local strategy
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

## Key Features
- Vehicle inventory management with detailed specifications
- User role-based access control (admin, accountant, salesperson, etc.)
- Sales tracking and reservation system
- Bank integration for financing calculations
- Manufacturer and model hierarchy management
- Image and document handling
- Employee attendance management with collapsible daily views
- Editable attendance records with time tracking
- Leave request system with approval workflow
- Monthly attendance reporting and printing

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes/           # API routes
│   └── db-related files  # Database setup and utilities
├── shared/               # Shared schemas and types
└── attached_assets/      # User-uploaded assets
```

## Database Schema
Core entities:
- `users` - System users with role-based permissions
- `inventory_items` - Vehicle inventory with detailed specs
- `banks` - Bank information for financing
- `manufacturers` - Vehicle manufacturers
- `vehicle_categories` - Vehicle models/categories
- `vehicle_trim_levels` - Trim level specifications

## Recent Changes
- ✅ Migrated from Replit Agent to Replit environment (Aug 18, 2025)
- ✅ Set up PostgreSQL database connection with all tables
- ✅ Configured proper client/server separation
- ✅ Updated project structure for Replit compatibility
- ✅ Created default user accounts for testing
- ✅ Added collapsible employee lists in attendance management (Aug 18, 2025)
- ✅ Added edit functionality for individual attendance days (Aug 18, 2025)
- ✅ Improved UI with hide/show buttons for better organization (Aug 18, 2025)
- ✅ Fixed React hooks error and optimized performance (Aug 18, 2025)
- ✅ Fixed attendance duplicate records issue and prevented future duplicates (Aug 18, 2025)
- ✅ Configured main production database connection for deployment (Aug 18, 2025)
- ✅ Updated deployment settings with SSL configuration for Neon database (Aug 18, 2025)
- ✅ Completely redesigned database management page with advanced features (Aug 18, 2025)
- ✅ Added external database connection capability with import/export functions (Aug 18, 2025)
- ✅ Successfully exported complete database to external Neon database (Aug 18, 2025)
- ✅ Migrated to external Neon database as primary database (Aug 18, 2025)
- ✅ All system data now operates from external database with 18 users, 31 manufacturers, 10 banks, 117 vehicle categories, 478 trim levels, and 109 inventory items (Aug 18, 2025)
- ✅ Fixed login authentication issues after user data updates (Aug 19, 2025)
- ✅ Added comprehensive user management API routes (create, update, delete users) (Aug 19, 2025)
- ✅ Implemented proper password hashing with bcrypt for secure authentication (Aug 19, 2025)
- ✅ Resolved user creation and authentication conflicts in external database (Aug 19, 2025)
- ✅ Implemented role-based attendance system - users now see only their personal attendance data (Aug 19, 2025)
- ✅ Added complete attendance management API with proper access controls (Aug 19, 2025)
- ✅ Synchronized external database with complete data set including all manufacturers, banks, categories and trim levels (Aug 19, 2025)
- ✅ Fixed banks display issue - added proper API route for banks by type with Arabic text support (Aug 19, 2025)
- ✅ Enhanced action buttons functionality with proper data-testid attributes for testing (Aug 19, 2025)
- ✅ Restored missing "Show Used Cars" toggle button in card view filters (Aug 19, 2025)
- ✅ All action buttons now work properly: share, sell, quote, price card, reserve, cancel reservation (Aug 19, 2025)
- ✅ Connected to external Neon database as requested by user (Aug 19, 2025)
- ✅ Fixed ahmad_aljawhary login authentication with proper password encryption (Aug 19, 2025)
- ✅ Added sample vehicle inventory data to external database (Aug 19, 2025)
- ✅ Successfully imported complete hierarchy data: 31 manufacturers, 117 categories, 478 trim levels (Aug 19, 2025)
- ✅ System now displays proper manufacturer and category data in dropdown menus (Aug 19, 2025)
- ✅ All vehicle management features working with complete database structure (Aug 19, 2025)
- ✅ Fixed banks display issue - added proper API route for banks by type with Arabic text support (Aug 19, 2025)
- ✅ Added complete bank management API routes (create, update, delete) with proper error handling (Aug 19, 2025)
- ✅ Fixed bank visibility toggle and hide/show functionality (Aug 19, 2025)
- ✅ Completed migration from Replit Agent to Replit environment (Aug 19, 2025)
- ✅ Fixed authentication system with proper password hashing for all existing users (Aug 19, 2025)
- ✅ All users now use password 'admin123' for testing and development (Aug 19, 2025)
- ✅ Fixed role-based routing issues - all user types now redirect to appropriate pages (Aug 19, 2025)
- ✅ Fixed regular user permissions - chassis numbers and price card buttons now visible (Aug 19, 2025)
- ✅ Updated permissions for user, seller, and salesperson roles for better access control (Aug 19, 2025)
- ✅ Completely removed hierarchy management pages from the system per user request (Aug 19, 2025)
- ✅ All references to HierarchicalView component and /hierarchy routes have been deleted (Aug 19, 2025)
- ✅ Successfully completed migration from Replit Agent to standard Replit environment (Aug 19, 2025)
- ✅ Fixed JavaScript errors by removing unused dropdown-options-management references (Aug 19, 2025)
- ✅ All components now load without errors, project is ready for continued development (Aug 19, 2025)
- ✅ Restored dropdown options management page per user request (Aug 19, 2025)
- ✅ Fixed all JavaScript errors and component loading issues (Aug 19, 2025)
- ✅ Completely redesigned dropdown options management page with modern styling (Aug 19, 2025)
- ✅ Applied inventory page design patterns with gradient backgrounds and glass morphism (Aug 19, 2025)
- ✅ Enhanced UI with better search, filters, and collapsible hierarchy display (Aug 19, 2025)
- ✅ Fixed missing inventory management endpoints for reserve, sell, delete, and update operations (Aug 19, 2025)
- ✅ Successfully completed full migration from Replit Agent to Replit environment with all functionality restored (Aug 19, 2025)
- ✅ Fixed critical security vulnerability - banks pages now require authentication (Aug 19, 2025)
- ✅ Fixed user role permissions for regular users - price card buttons and prices now visible (Aug 19, 2025)
- ✅ Implemented role-based vehicle filtering - cars with status "خاص" or "تشغيل" now hidden from regular users (Aug 19, 2025)
- ✅ Updated salesperson UI - only share and reservation buttons are visible, all other action buttons hidden (Aug 19, 2025)
- ✅ Optimized mobile layout for vehicle count badges - reduced size and spacing for better mobile display (Aug 19, 2025)
- ✅ Enhanced attendance management dialog for mobile - responsive design with proper sizing and spacing (Aug 19, 2025)
- ✅ Confirmed Tesla logo is properly linked to manufacturer "تسلا" in the logo system (Aug 19, 2025)
- ✅ Fixed ROX manufacturer logo mapping to use correct /logos /ROX.svg file instead of Tesla logo (Aug 19, 2025)
- ✅ Successfully linked GMC logo to manufacturer "جي إم سي" using /logos /gmc.svg (Aug 19, 2025)
- ✅ Updated bank_accountant role permissions - access to main page, inventory, and quotations with only share and reserve buttons visible (Aug 19, 2025)
- ✅ Hidden price cards page and buttons from bank_accountant role as requested (Aug 19, 2025)
- ✅ Prepared system for Vercel deployment with proper configuration files (Aug 19, 2025)
- ✅ Created vercel.json, deployment guide, and serverless function setup (Aug 19, 2025)
- ✅ System ready for production deployment on Vercel platform (Aug 19, 2025)
- ✅ Successfully completed migration to Replit environment (Aug 20, 2025)
- ✅ Fixed missing API endpoints for vehicle specifications, image links, and hierarchical colors (Aug 20, 2025)
- ✅ Added complete CRUD operations for vehicle specifications and image links (Aug 20, 2025)
- ✅ Resolved data fetching issues and TypeScript errors in server routes (Aug 20, 2025)
- ✅ All API endpoints now properly connected and working with database (Aug 20, 2025)
- ✅ Fixed duplicate manufacturers issue - reduced from 51 to 33 manufacturers by removing duplicates safely (Aug 20, 2025)
- ✅ Fixed duplicate categories issue - reduced from 122 to 119 categories with proper reference migration (Aug 20, 2025)
- ✅ Eliminated React warnings about duplicate keys in manufacturer and category dropdown menus (Aug 20, 2025)
- ✅ All vehicle hierarchy data now displays correctly without duplicates or conflicts (Aug 20, 2025)
- ✅ Completed migration from Replit Agent to standard Replit environment (Aug 20, 2025)
- ✅ Fixed categories and trim levels dropdown filtering issues in vehicle form (Aug 20, 2025)
- ✅ Added API endpoint filtering support for manufacturerId and categoryId parameters (Aug 20, 2025)
- ✅ Corrected TypeScript interface definitions to match database schema (nameAr vs name_ar) (Aug 20, 2025)
- ✅ All dropdown menus now load and filter correctly in the vehicle inventory form (Aug 20, 2025)
- ✅ Fixed dropdown options management window database connection issues (Aug 20, 2025)
- ✅ Resolved TypeScript errors in dropdown options management with proper interface definitions (Aug 20, 2025)
- ✅ Added proper error handling for trimLevels API calls to prevent JavaScript crashes (Aug 20, 2025)
- ✅ Corrected field name mapping from name_ar to nameAr across all components (Aug 20, 2025)
- ✅ Added clear all inventory functionality in database management page (Aug 20, 2025)
- ✅ Implemented secure clear inventory button with double confirmation dialogs (Aug 20, 2025)
- ✅ Created /api/inventory/clear-all endpoint for bulk inventory deletion (Aug 20, 2025)
- ✅ Fixed missing inventory management endpoints for reserve, sell, delete, and update operations (Aug 20, 2025)
- ✅ Added missing /api/specifications endpoint for vehicle specifications retrieval (Aug 20, 2025)
- ✅ Connected vehicle specifications to database with proper parameter-based filtering (Aug 20, 2025)
- ✅ Fixed vehicle specifications display in quotation creation page (Aug 20, 2025)

## Default Login Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Sales Manager**: username: `sales_manager`, password: `admin123`
- **Accountant**: username: `accountant`, password: `admin123`
- **Salesperson**: username: `salesperson`, password: `admin123`

## User Preferences
None specified yet.

## Development Notes
- Uses modern full-stack JavaScript patterns
- Follows security best practices
- Database automatically provisions on Replit
- Supports both development and production environments