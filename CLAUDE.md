

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LocalRoots is a Next.js 15 marketplace application connecting local organic farmers with customers. Built with App Router, TypeScript, Prisma (PostgreSQL), NextAuth v5, and next-intl for internationalization.

## Core Commands

### Development
```bash
npm run dev           # Start dev server on localhost:3000
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
```

### Database
```bash
npx prisma generate   # Generate Prisma client after schema changes
npx prisma db push    # Push schema changes to database
npx prisma studio     # Open Prisma Studio GUI
npm run prisma:seed   # Seed database with sample data
```

## Architecture

### App Structure (Next.js 15 App Router)

The app uses Next.js 15 with internationalization via `next-intl`:
- **`/app/[locale]/`** - All routes are nested under locale parameter (`en`, `fr`, `es`)
- **`/app/[locale]/(auth)/`** - Auth pages (login, register) with shared layout
- **`/app/[locale]/(dashboard)/`** - Protected dashboard routes
  - `/farmer/dashboard` - Farmer dashboard
  - `/farmer/products` - Farmer product management
  - `/customer/dashboard` - Customer dashboard
- **`/app/[locale]/products/`** - Product browsing and detail pages
- **`/app/[locale]/map/`** - Interactive map showing farmers
- **`/app/[locale]/api/`** - API routes (auth, registration)

### Authentication Flow

Uses **NextAuth v5** with Prisma adapter:
- **Configuration**: `/lib/auth/auth.config.ts` - Auth providers and callbacks
- **Setup**: `/lib/auth/auth.ts` - NextAuth initialization with PrismaAdapter
- **Session Helper**: `/lib/auth/session.ts` - Server-side session utilities
- **Providers**: Credentials (email/password), Google OAuth, Facebook OAuth
- **User Roles**: FARMER, CUSTOMER, ADMIN (defined in Prisma schema)
- **JWT Strategy**: Session stored in JWT with role and user ID in token

Auth callbacks handle:
- OAuth user creation with default CUSTOMER role
- Role injection into JWT token and session
- Custom sign-in page at `/login`

### Database Schema (Prisma)

**Key Models**:
- **User**: Core user model with email, password (bcrypt), role, OAuth accounts relation
- **Account**: OAuth accounts (NextAuth adapter)
- **FarmerProfile**: Extended profile for farmers with farm details, geolocation (lat/lng), address
- **Product**: Farmer products with name, price, unit, category, S3 image URL, stock status

**Relations**:
- User → FarmerProfile (one-to-one)
- User → Products (one-to-many, via farmerId)
- User → Accounts (one-to-many for OAuth)

### Server Actions

Located in `/lib/actions/`:
- **farmer.ts**: Create/update farmer profiles, geocoding integration
- **products.ts**: CRUD operations for products, filtered queries
- **geocoding.ts**: Address to lat/lng conversion (external geocoding API)
- **upload.ts**: AWS S3 image uploads with validation (5MB limit, JPEG/PNG/WebP)

All actions use `'use server'` directive and return structured results with error handling.

### Internationalization

Uses **next-intl**:
- **Routing**: `/i18n/routing.ts` - Defines locales (`en`, `fr`, `es`), default locale
- **Messages**: `/messages/` - JSON translation files (en.json, es.json, fr.json)
- **Middleware**: `/middleware.ts` - Handles locale detection and routing
- **Provider**: Wrapped in root layout with `NextIntlClientProvider`

All user-facing strings should use `useTranslations()` hook or `getTranslations()` for server components.

### Image Uploads

**AWS S3 Integration**:
- Server action: `/lib/actions/upload.ts`
- Validates file type (JPEG/PNG/WebP) and size (max 5MB)
- Generates unique UUID-based filenames under `products/` prefix
- Returns public S3 URL: `https://[bucket].s3.[region].amazonaws.com/products/[uuid].[ext]`

**Required Environment Variables**:
```
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=localroots-product-images
```

**Next.js Config**: Remote patterns configured for S3 bucket and unsplash.com in `next.config.ts`.

### UI Components

- **Radix UI**: Dialog, Dropdown, Select, Alert Dialog, Avatar, Label, Radio Group, Popover
- **Custom Components**:
  - `/components/ui/` - shadcn/ui components with Tailwind variants
  - `/components/layout/` - Header, navigation
  - `/components/farmer/` - Farmer-specific forms and views
  - `/components/products/` - Product cards, filters
  - `/components/maps/` - Leaflet/react-leaflet map components for farmer locations
- **Styling**: Tailwind CSS 4 with custom config, `class-variance-authority` for variants

### Type System

- **Prisma Types**: Auto-generated from schema, exported from `/types/index.ts`
- **Extended Types**: `UserWithProfile`, `ProductWithFarmer` - include relations
- **Form Types**: `LoginFormData`, `RegisterFormData`, `FarmerProfileFormData`, `ProductFormData`
- **NextAuth Types**: Extended session/JWT types in `/types/next-auth.d.ts`

### Key Patterns

**Server Components by Default**: Use `'use client'` only when needed (forms, hooks, client interactivity).

**Data Fetching**: Direct Prisma queries in Server Components or Server Actions.

**Forms**: React Hook Form + Zod validation (schemas in `/lib/validations/`).

**Error Handling**: Server actions return `{ success: boolean, error?: string, data?: T }` pattern.

**Authentication Checks**: Use `auth()` from `/lib/auth/auth.ts` in Server Components/Actions to get session.

### Environment Configuration

Required `.env` variables:
```
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
AUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."

# AWS S3
AWS_REGION="eu-north-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="localroots-product-images"
```

### Map Functionality

Uses **Leaflet** and **react-leaflet** for interactive maps showing farmer locations:
- Farmer coordinates stored in `FarmerProfile` (latitude, longitude)
- Map components in `/components/maps/`
- Displays markers for farmers, filterable by distance
- Uses OpenStreetMap tiles (default Leaflet provider)
