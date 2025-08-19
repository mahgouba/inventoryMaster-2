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