# Vehicle Inventory Management System

## Overview
This project is a full-stack vehicle inventory management system designed for vehicle dealerships. It provides comprehensive tools for managing vehicle inventory, tracking sales, handling user roles, and performing financial calculations. The system aims to streamline dealership operations, improve efficiency in inventory handling, and enhance sales processes.

## User Preferences
None specified yet.

## System Architecture
The system is built with a modern technology stack:
- **Frontend**: Developed using React 18, TypeScript, Vite, Tailwind CSS for styling, and `shadcn/ui` for UI components. `TanStack Query` is used for server state management, and `Wouter` handles client-side routing.
- **Backend**: Implemented with Express.js and TypeScript, designed to be scalable and maintainable.
- **Database**: Utilizes PostgreSQL, integrated with Drizzle ORM for efficient and type-safe database interactions.
- **Authentication**: Handled by Passport.js with a local strategy for secure user access.
- **Core Features**:
    - Detailed vehicle inventory management.
    - Role-based access control for different user types (e.g., admin, accountant, salesperson).
    - Sales and reservation tracking.
    - Integration for financing calculations with bank information.
    - Management of manufacturer and vehicle model hierarchies.
    - Image and document handling capabilities.
    - Employee attendance management, including editable records, leave requests, and reporting.
- **Design Principles**: Unified dark gold theme throughout the entire system. Near-black background (#0A0B0D) with gold accent colors (#C49632 / #E8B84B). CSS variables in `:root` and `.dark` both set to dark gold theme (no dependency on `.dark` class toggle). All teal (#00627F) references replaced with gold (#C49632) across all pages, components, and CSS. All `backdrop-filter: blur()` globally disabled for performance. No CSS transitions globally (`transition: none !important`). RTL Arabic support throughout.
- **Color System**: `--background: hsl(225,15%,5%)`, `--card: hsl(225,12%,8%)`, `--primary: hsl(38,62%,48%)` (gold), `--border: hsl(38,30%,20%)`. Login page, all page files, and print templates use gold.
- **Technical Implementations**: Includes robust API endpoints for CRUD operations across all modules, secure password hashing with bcrypt, and role-based filtering for data visibility.

## External Dependencies
- **PostgreSQL**: Primary database for all system data.
- **Neon**: An external PostgreSQL database service used for primary data storage and deployment.
- **Vercel**: Deployment platform targeted for production environment.
- **Passport.js**: Authentication middleware.
- **TanStack Query**: Data fetching and state management library.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Reusable UI components.
- **Drizzle ORM**: TypeScript ORM for PostgreSQL.
- **React**: Frontend library.
- **Express.js**: Backend web framework.
- **Vite**: Frontend build tool.
- **Wouter**: Client-side router.