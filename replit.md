# Inventory Management System

## Overview

This is a full-stack Arabic-first inventory management system built with modern web technologies. The application specializes in vehicle inventory management with comprehensive features for tracking cars, their status, locations, and transfers. It provides a clean, responsive interface with dark mode support and voice-activated features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom Arabic font support (Noto Sans Arabic)
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Animation**: Framer Motion for smooth UI transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Style**: RESTful API endpoints with consistent error handling
- **Middleware**: Custom logging, error handling, and CORS middleware
- **Development**: Hot reload with tsx for TypeScript execution

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Validation**: Zod schemas for runtime type checking
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling with WebSocket support

## Key Components

### Database Schema
The system uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: Authentication and role management (admin/seller)
- **inventory_items**: Core vehicle inventory with Arabic field names
  - manufacturer (الصانع)
  - category (الفئة) 
  - engineCapacity (سعة المحرك)
  - year (السنة)
  - exteriorColor/interiorColor (الألوان)
  - status (الحالة)
  - importType (نوع الاستيراد)
  - location (الموقع)
  - chassisNumber (رقم الهيكل)
  - reservation system with dates and notes
- **manufacturers**: Brand management with logo support
- **locations**: Physical location tracking for vehicles
- **locationTransfers**: Transfer history between locations
- **appearanceSettings**: Customizable UI themes and branding

### API Architecture
The REST API provides comprehensive endpoints:

- **Authentication**: `/api/auth/login` - Session-based authentication
- **Inventory Management**: 
  - `GET/POST /api/inventory` - CRUD operations
  - `GET /api/inventory/stats` - Dashboard metrics
  - `GET /api/inventory/manufacturer-stats` - Brand analytics
- **Voice Processing**: `/api/voice/process` - AI-powered voice commands
- **Location Management**: `/api/locations` - Physical location tracking
- **User Management**: `/api/users` - User administration (admin only)
- **Appearance**: `/api/appearance` - Theme customization

### Voice Assistant Integration
- **OpenAI Integration**: GPT-4o model for natural language processing
- **Voice Commands**: Arabic voice recognition for inventory operations
- **Smart Actions**: Add, edit, delete, search, reserve vehicles via voice
- **Audio Processing**: Web Audio API for real-time voice capture

## Data Flow

1. **Authentication Flow**: Login → Session storage → Role-based access control
2. **Inventory Operations**: Form input → Validation → API call → Database update → UI refresh
3. **Voice Commands**: Audio capture → OpenAI processing → Intent extraction → Action execution
4. **Real-time Updates**: TanStack Query cache invalidation for instant UI updates
5. **Image Processing**: Base64 encoding for logos and vehicle images

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database hosting
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI components
- **framer-motion**: Smooth animations
- **bcryptjs**: Password hashing
- **openai**: AI voice processing

### Development Tools
- **tsx**: TypeScript execution
- **vite**: Build tool and dev server
- **tailwindcss**: Utility-first CSS
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

The application is configured for Replit deployment with:

- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server
- **Development**: `npm run dev` with hot reload and error overlay
- **Production**: `npm start` serves built application
- **Database**: Automatic schema push with `npm run db:push`
- **Environment**: Uses `DATABASE_URL` and `OPENAI_API_KEY` environment variables

## Changelog

- July 06, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.