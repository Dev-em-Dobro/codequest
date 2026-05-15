# CodeLearn - Programming Exercise Platform

## Overview

CodeLearn is an interactive web development learning platform that provides hands-on programming exercises for HTML, CSS, and JavaScript. The application features a code editor with live preview capabilities, progress tracking, and a gamified learning experience with points and achievements. Users can work through structured exercises, receive real-time feedback, and track their learning progress across different web development technologies.

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication preference: Email/password only (no Google OAuth)
Interface language: Portuguese
Color scheme: Custom palette (#172122 primary, #ae32f8 secondary, #919595 hover)

## Recent Changes (2025-01-18)

### CRITICAL AUTHENTICATION SECURITY FIXES & SESSION PERSISTENCE
- **RESOLVED CRITICAL BUG**: Fixed data contamination and authentication issues
- **Removed "demo-user" fallbacks**: All API endpoints now require proper authentication
- **Implemented user data isolation**: Each user has completely separate progress, points, and exercises
- **Added authentication middleware**: All protected routes now validate user tokens
- **Fixed header points display**: Real-time user points now update correctly after exercise completion
- **Database structure secured**: User progress stored with proper user ID references
- **Prevented data leakage**: Users can only access their own data, no cross-user contamination
- **SESSION PERSISTENCE IMPLEMENTED**: Points and authentication now persist through page refresh (F5)
- **localStorage Integration**: User sessions stored locally and verified with backend on page load
- **Global Auth Client**: Consistent authentication state management across all API calls

### Exercise Management System
- **Exercise Definition Standard**: Created standardized format for adding new exercises
- **Two-layer Architecture**: Primary exercises in Firebase backend, fallback in frontend sample data
- **Validation Engine**: Comprehensive validation system supporting multiple rule types
- **Empty Code Requirement**: All exercises start with completely empty code editors as required

### Firebase Migration Setup
- Migrated from PostgreSQL/Drizzle to Firebase/Firestore architecture
- Updated Firebase configuration for both client and server environments
- Created Firebase authentication system using email/password (no Google OAuth as per user preference)
- Implemented Firebase Firestore storage interface with proper collection structure
- Added temporary memory storage fallback for development until Firebase credentials are configured
- Created sample exercises with proper Portuguese interface and empty starter code requirement
- Updated API routes to work with new Firebase backend structure
- Maintained user preference for email/password authentication only

## System Architecture

### Frontend Architecture

The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **React Router**: Uses Wouter for lightweight client-side routing with category-based exercise organization
- **State Management**: Combines React Query for server state with local component state
- **UI Framework**: Built on Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS custom properties for theming and dark mode support
- **Code Editor**: Monaco Editor integration for syntax highlighting and code editing capabilities
- **Navigation Structure**: Category-based routing (/exercises/html, /exercises/css, /exercises/javascript)

### Backend Architecture

The backend follows a REST API pattern built with Express.js:

- **Server Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for exercises, user progress, and code management
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Development Setup**: Vite integration for hot module replacement and development server

### Data Storage Solutions

The application uses Firebase Firestore with fallback to memory storage:

- **Primary Database**: Firebase Firestore with collections for users, exercises, user_progress
- **Authentication**: Firebase Auth with email/password authentication (no Google OAuth per user preference)
- **Collection Structure**: 
  - users: { id, name, email, points, level, createdAt }
  - exercises: { id, title, description, difficulty, category, initialCode, solutionCode, points }
  - user_progress: { userId, exerciseId, completed, submittedCode, completedAt }
- **Development Fallback**: In-memory storage implementation for rapid development when Firebase not configured
- **Migration Support**: Firebase Admin SDK for data management and seeding

### Code Management System

The platform includes sophisticated code handling:

- **Multi-language Support**: Separate code storage for HTML, CSS, and JavaScript
- **Auto-save Functionality**: Real-time code persistence as users type
- **Live Preview**: Iframe-based preview system that renders user code in real-time
- **Validation System**: Configurable validation rules for exercise completion checking

### Exercise System Architecture

The learning content is structured around a comprehensive exercise framework:

- **Difficulty Progression**: Exercises categorized by difficulty levels (beginner, intermediate, advanced)
- **Category Organization**: Content organized by technology (HTML, CSS, JavaScript)
- **Hints System**: Multi-level hint system to guide learners
- **Starter Templates**: Pre-configured starter code for each exercise
- **Solution Tracking**: Complete solutions stored for validation and reference

### User Experience Features

The platform prioritizes an engaging learning experience:

- **Progress Tracking**: Visual progress indicators and completion statistics per category
- **Points System**: Gamified learning with point rewards for completed exercises
- **Category Navigation**: Organized exercise browsing by HTML, CSS, and JavaScript
- **Authentication System**: Email/password and Google OAuth integration with user profiles
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: Built on accessible Radix UI primitives with proper ARIA support
- **Theme Support**: CSS custom properties enabling light/dark mode switching

### Authentication & User Management

The platform includes a comprehensive authentication system:

- **BetterAuth Integration**: Development-friendly authentication with email/password support
- **User Profiles**: Profile management with points tracking and achievements
- **Session Management**: Persistent login sessions with automatic session checking
- **Google OAuth**: Social login integration for easy account creation
- **Progress Persistence**: User-specific exercise progress and code storage

## External Dependencies

### Core Framework Dependencies
- **React 18**: Component framework with modern hooks and concurrent features
- **Express.js**: Web server framework for the REST API backend
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Build tool and development server with HMR support

### Database and ORM
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL interaction
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **PostgreSQL**: Primary database for production data storage

### UI and Styling
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Development and Code Editing
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **React Query**: Server state management and caching solution
- **Wouter**: Minimalist router for React applications
- **React Hook Form**: Form state management with validation

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **TSX**: TypeScript execution for development server
- **Replit Integration**: Development environment support and deployment tools