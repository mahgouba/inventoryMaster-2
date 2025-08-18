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
- Migrated from Replit Agent to Replit environment
- Set up PostgreSQL database connection
- Configured proper client/server separation
- Updated project structure for Replit compatibility

## User Preferences
None specified yet.

## Development Notes
- Uses modern full-stack JavaScript patterns
- Follows security best practices
- Database automatically provisions on Replit
- Supports both development and production environments