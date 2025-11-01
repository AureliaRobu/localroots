# LocalRoots - Technical Specification

## 1. Project Overview

**Project Name**: LocalRoots
**Version**: 1.0.0
**Description**: A marketplace web application connecting local organic farmers directly with customers, enabling transparent farm-to-table commerce with geolocation-based discovery.

**Primary Goal**: Create a user-friendly platform where farmers can showcase their products and customers can discover and connect with local organic producers in their area.

---

## 2. Technical Stack

### Core Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18+
- **Package Manager**: npm

### Frontend
- **UI Framework**: React 19 (via Next.js 15)
- **Styling**: Tailwind CSS 4
- **Component Library**: Radix UI primitives
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Internationalization**: next-intl
- **Maps**: Leaflet, react-leaflet
- **Variants**: class-variance-authority (CVA)

### Backend
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Authentication**: NextAuth v5 (Auth.js)
- **Password Hashing**: bcryptjs
- **File Storage**: AWS S3
- **API**: Next.js API Routes & Server Actions

### External Services
- **Image Hosting**: AWS S3 (eu-north-1)
- **Geocoding**: External geocoding API
- **OAuth Providers**: Google, Facebook
- **Map Tiles**: OpenStreetMap

---

## 3. Application Architecture

### 3.1 Directory Structure

```
localroots/
├── app/
│   └── [locale]/              # Internationalized routes
│       ├── (auth)/            # Authentication pages
│       │   ├── login/
│       │   └── register/
│       ├── (dashboard)/       # Protected dashboard routes
│       │   ├── farmer/
│       │   │   ├── dashboard/
│       │   │   └── products/
│       │   └── customer/
│       │       └── dashboard/
│       ├── about/
│       ├── api/               # API routes
│       ├── map/               # Farmer location map
│       ├── products/          # Product browsing
│       └── page.tsx           # Home page
├── components/
│   ├── farmer/                # Farmer-specific components
│   ├── layout/                # Layout components
│   ├── maps/                  # Map components
│   ├── products/              # Product components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── actions/               # Server Actions
│   ├── auth/                  # Authentication config
│   ├── db/                    # Database utilities
│   └── validations/           # Zod schemas
├── messages/                  # i18n translation files
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── public/                    # Static assets
└── types/                     # TypeScript types
```

### 3.2 Routing Strategy

**Internationalized Routing**: All routes are prefixed with locale parameter (`/[locale]/...`)

**Supported Locales**:
- `en` (English) - Default
- `es` (Spanish)
- `fr` (French)

**Route Groups**:
- `(auth)` - Public authentication pages with shared layout
- `(dashboard)` - Protected routes requiring authentication

**Route Protection**: Middleware checks authentication status and redirects unauthenticated users to login.

### 3.3 Data Flow

```
User Request → Middleware (locale, auth) → Page Component (Server)
                                              ↓
                                         Server Action
                                              ↓
                                         Prisma Query
                                              ↓
                                         PostgreSQL
                                              ↓
                                         Response to Client
```

---

## 4. Database Schema

### 4.1 Core Models

#### User
```prisma
model User {
  id            String          @id @default(cuid())
  name          String?
  email         String          @unique
  emailVerified DateTime?
  password      String?         # bcrypt hash (null for OAuth)
  image         String?
  role          Role            @default(CUSTOMER)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  # Relations
  accounts      Account[]
  farmerProfile FarmerProfile?
  products      Product[]       @relation("FarmerProducts")
}
```

#### FarmerProfile
```prisma
model FarmerProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  farmName    String
  description String?
  address     String
  city        String
  state       String?
  zipCode     String
  country     String
  latitude    Float
  longitude   Float
  phone       String?
  certifications String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Product
```prisma
model Product {
  id          String      @id @default(cuid())
  name        String
  description String
  price       Float
  unit        String
  category    String
  imageUrl    String?
  inStock     Boolean     @default(true)
  farmerId    String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  farmer      User        @relation("FarmerProducts", fields: [farmerId], references: [id], onDelete: Cascade)
}
```

#### Account (NextAuth)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

### 4.2 Enums

```prisma
enum Role {
  CUSTOMER
  FARMER
  ADMIN
}
```

### 4.3 Database Indexes

- `User.email` - Unique index for fast lookup
- `Product.farmerId` - Index for farmer product queries
- `FarmerProfile.userId` - Unique index for profile lookup
- `FarmerProfile.latitude, longitude` - Composite index for geospatial queries

---

## 5. Authentication & Authorization

### 5.1 Authentication Strategy

**Provider**: NextAuth v5 (Auth.js)
**Session Storage**: JWT (JSON Web Tokens)
**Adapter**: PrismaAdapter

**Supported Login Methods**:
1. **Credentials**: Email + Password (bcrypt)
2. **OAuth - Google**: Google OAuth 2.0
3. **OAuth - Facebook**: Facebook Login

### 5.2 Authentication Flow

#### Registration
1. User submits registration form (name, email, password, role)
2. Server validates input with Zod schema
3. Password hashed with bcrypt (10 rounds)
4. User record created in database
5. Auto-login via NextAuth credentials provider
6. Redirect to appropriate dashboard

#### Login
1. User submits credentials (email + password)
2. NextAuth validates against database
3. Password verified with bcrypt.compare()
4. JWT token generated with user ID and role
5. Session created with role and user data
6. Redirect to dashboard based on role

#### OAuth Login
1. User clicks OAuth provider button
2. Redirect to provider's consent screen
3. Provider redirects back with authorization code
4. NextAuth exchanges code for tokens
5. User profile fetched from provider
6. User created/updated in database (default CUSTOMER role)
7. JWT and session created
8. Redirect to customer dashboard

### 5.3 Session Structure

```typescript
session: {
  user: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "FARMER" | "ADMIN";
    image?: string;
  }
}
```

### 5.4 Authorization Rules

**Role-Based Access Control (RBAC)**:

| Route | CUSTOMER | FARMER | ADMIN |
|-------|----------|--------|-------|
| `/customer/dashboard` | ✓ | ✗ | ✓ |
| `/farmer/dashboard` | ✗ | ✓ | ✓ |
| `/farmer/products` | ✗ | ✓ | ✓ |
| `/products` (browse) | ✓ | ✓ | ✓ |
| `/map` | ✓ | ✓ | ✓ |

**Product Management**:
- Farmers can only edit/delete their own products
- Admins can manage all products

### 5.5 Security Measures

- **Password Requirements**: Validated in registration form (minimum length, complexity)
- **JWT Secret**: Strong random secret in environment variables
- **CSRF Protection**: Built into NextAuth
- **Secure Cookies**: httpOnly, secure flags on production
- **SQL Injection**: Prevented via Prisma parameterized queries
- **XSS Protection**: React's automatic escaping

---

## 6. Features & Functionality

### 6.1 User Management

#### Registration
- **Inputs**: Name, email, password, role selection (FARMER/CUSTOMER)
- **Validation**: Email format, password strength, unique email
- **Flow**: Register → Auto-login → Role-based dashboard redirect
- **i18n**: Fully translated form labels and error messages

#### Login
- **Methods**: Email/password, Google OAuth, Facebook OAuth
- **Features**: Remember me (extended session), error handling
- **Redirect**: Post-login redirect to intended page or dashboard
- **i18n**: Translated authentication pages

### 6.2 Farmer Features

#### Profile Management
- **Setup**: First-time farmers must complete profile
- **Fields**:
  - Farm name, description
  - Full address (street, city, state, zip, country)
  - Phone number
  - Certifications (multi-select)
- **Geocoding**: Address automatically converted to lat/lng coordinates
- **Validation**: Required fields enforced, phone format validated

#### Product Management
- **Create Product**:
  - Name, description, price, unit (kg, lb, bunch, etc.)
  - Category (Vegetables, Fruits, Dairy, Meat, etc.)
  - Image upload (AWS S3)
  - Stock status (in stock / out of stock)
- **Edit Product**: Update any field including image replacement
- **Delete Product**: Soft delete with confirmation dialog
- **List View**: Grid/list view of farmer's products with filters

#### Dashboard
- **Overview**: Total products, active listings, profile completion status
- **Quick Actions**: Add product, edit profile, view on map
- **Recent Activity**: Latest product views, customer inquiries (future)

### 6.3 Customer Features

#### Product Discovery
- **Browse Page**: Grid view of all available products
- **Filters**:
  - Category
  - Price range
  - In stock only
  - Distance from location (future)
- **Search**: Full-text search by product name, description, farm name
- **Sorting**: Price, newest, alphabetical

#### Product Details
- **View**: Full product information, farmer details
- **Images**: High-quality product images from S3
- **Farmer Info**: Farm name, location, certifications
- **Actions**: Contact farmer (future), add to cart (future)

#### Farmer Map
- **Interactive Map**: Leaflet map showing farmer locations
- **Markers**: Custom markers for each farmer
- **Popups**: Farm name, distance, link to products
- **Filters**: Search by location, radius filter
- **Geolocation**: Use customer's location for proximity

#### Dashboard
- **Overview**: Order history (future), favorite farms (future)
- **Quick Actions**: Browse products, view map

### 6.4 Shared Features

#### Internationalization
- **Languages**: English, Spanish, French
- **Scope**: All UI text, error messages, validation messages
- **Detection**: Browser language detection with manual override
- **Persistence**: Locale stored in cookie
- **Switcher**: Language dropdown in header

#### Responsive Design
- **Breakpoints**: Mobile, tablet, desktop (Tailwind defaults)
- **Mobile-First**: All components built mobile-first
- **Touch-Friendly**: Large tap targets, swipeable carousels

---

## 7. Server Actions

### 7.1 Farmer Actions (`/lib/actions/farmer.ts`)

#### `createFarmerProfile(data: FarmerProfileFormData)`
- **Auth**: Requires authenticated user with FARMER role
- **Validation**: Zod schema validation
- **Geocoding**: Converts address to coordinates
- **Returns**: Created profile or error

#### `updateFarmerProfile(userId: string, data: FarmerProfileFormData)`
- **Auth**: User can only update own profile
- **Validation**: Zod schema validation
- **Geocoding**: Updates coordinates if address changed
- **Returns**: Updated profile or error

#### `getFarmerProfile(userId: string)`
- **Auth**: Public (read-only)
- **Returns**: Farmer profile with user data or null

### 7.2 Product Actions (`/lib/actions/products.ts`)

#### `createProduct(data: ProductFormData)`
- **Auth**: Requires FARMER role
- **Validation**: Zod schema validation
- **Image**: Optional S3 URL from separate upload
- **Returns**: Created product or error

#### `updateProduct(productId: string, data: ProductFormData)`
- **Auth**: Must be product owner or admin
- **Validation**: Zod schema validation
- **Returns**: Updated product or error

#### `deleteProduct(productId: string)`
- **Auth**: Must be product owner or admin
- **Returns**: Success boolean or error

#### `getProducts(filters?: ProductFilters)`
- **Auth**: Public
- **Filters**: category, inStock, farmerId, search
- **Returns**: Array of products with farmer data

#### `getProductById(productId: string)`
- **Auth**: Public
- **Returns**: Product with farmer profile or null

### 7.3 Upload Actions (`/lib/actions/upload.ts`)

#### `uploadProductImage(formData: FormData)`
- **Auth**: Requires FARMER role
- **Validation**:
  - File types: JPEG, PNG, WebP
  - Max size: 5MB
- **Process**:
  - Generate UUID filename
  - Upload to S3 `products/` prefix
  - Return public URL
- **Returns**: S3 URL or error

### 7.4 Geocoding Actions (`/lib/actions/geocoding.ts`)

#### `geocodeAddress(address: string, city: string, state: string, zipCode: string, country: string)`
- **Service**: External geocoding API
- **Returns**: `{ latitude: number, longitude: number }` or error
- **Fallback**: Error handling for invalid addresses

---

## 8. API Routes

### 8.1 NextAuth Routes (`/app/api/auth/[...nextauth]`)

**Endpoints** (handled by NextAuth):
- `GET /api/auth/signin` - Sign-in page
- `POST /api/auth/signin/:provider` - Sign-in with provider
- `GET /api/auth/callback/:provider` - OAuth callback
- `POST /api/auth/signout` - Sign-out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - CSRF token

### 8.2 Custom API Routes

#### `POST /app/api/register`
- **Purpose**: User registration (alternative to direct server action)
- **Body**: `{ name, email, password, role }`
- **Returns**: User object or error
- **Status Codes**: 201 (created), 400 (validation), 409 (conflict)

---

## 9. UI/UX Design

### 9.1 Design System

**Color Palette**:
- Primary: Green (organic, natural theme)
- Secondary: Earth tones (brown, beige)
- Accent: Orange/yellow (warmth, harvest)
- Neutral: Gray scale
- Success: Green
- Error: Red
- Warning: Amber

**Typography**:
- Headings: Sans-serif (system font stack)
- Body: Sans-serif (readable, clean)
- Code: Monospace (technical elements)

**Spacing**: Tailwind's default spacing scale (4px base unit)

**Shadows**: Subtle shadows for depth (Tailwind shadow utilities)

### 9.2 Component Library

**UI Primitives (Radix UI)**:
- Dialog
- Dropdown Menu
- Select
- Alert Dialog
- Avatar
- Label
- Radio Group
- Popover

**Custom Components**:
- Button variants (primary, secondary, outline, ghost, destructive)
- Form inputs (text, email, password, number, textarea)
- Card layouts (product cards, profile cards)
- Navigation (header, sidebar, breadcrumbs)
- Product grid
- Farmer map (Leaflet)

### 9.3 Accessibility

- **Semantic HTML**: Proper heading hierarchy, landmark elements
- **ARIA Labels**: Screen reader support for interactive elements
- **Keyboard Navigation**: Tab order, focus management
- **Color Contrast**: WCAG AA compliance
- **Alt Text**: Required for all product images
- **Form Labels**: Explicit label associations

### 9.4 Responsive Breakpoints

```css
sm: 640px   /* Tablet */
md: 768px   /* Small laptop */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## 10. Performance Optimization

### 10.1 Next.js Optimizations

- **Server Components**: Default for data fetching
- **Client Components**: Only for interactivity
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Optimization**: System font stack (no web fonts)
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: Static pages where possible
- **Incremental Static Regeneration**: Product listings (future)

### 10.2 Database Optimizations

- **Indexes**: Strategic indexes on foreign keys and lookup fields
- **Connection Pooling**: Prisma connection pooling
- **Query Optimization**:
  - Include only needed relations
  - Limit and pagination for large datasets
  - Select only required fields

### 10.3 Caching Strategy

- **Browser Caching**: Static assets (images, CSS, JS)
- **CDN**: S3 CloudFront distribution for images (future)
- **API Caching**: Cache-Control headers for product listings
- **ISR**: Revalidation intervals for product pages (future)

### 10.4 Image Optimization

- **Format**: WebP preferred (fallback to JPEG/PNG)
- **Sizes**: Multiple sizes for responsive images
- **Compression**: S3 upload with quality reduction
- **Lazy Loading**: Below-the-fold images
- **Dimensions**: Fixed aspect ratios for layout stability

---

## 11. Testing Strategy

### 11.1 Testing Levels (Recommended)

**Unit Tests**:
- Validation schemas (Zod)
- Utility functions
- Data transformations

**Integration Tests**:
- Server Actions
- API Routes
- Database operations
- Authentication flows

**E2E Tests**:
- User registration/login
- Farmer profile creation
- Product CRUD operations
- Map functionality

### 11.2 Testing Tools (Suggested)

- **Unit/Integration**: Jest, Vitest
- **E2E**: Playwright, Cypress
- **Component Testing**: React Testing Library
- **Database**: Separate test database

---

## 12. Environment Configuration

### 12.1 Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/localroots"
DIRECT_URL="postgresql://user:password@host:5432/localroots"

# NextAuth
AUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# OAuth - Google
GOOGLE_CLIENT_ID="[from Google Cloud Console]"
GOOGLE_CLIENT_SECRET="[from Google Cloud Console]"

# OAuth - Facebook
FACEBOOK_CLIENT_ID="[from Facebook Developers]"
FACEBOOK_CLIENT_SECRET="[from Facebook Developers]"

# AWS S3
AWS_REGION="eu-north-1"
AWS_ACCESS_KEY_ID="[from AWS IAM]"
AWS_SECRET_ACCESS_KEY="[from AWS IAM]"
AWS_S3_BUCKET_NAME="localroots-product-images"

# External APIs
GEOCODING_API_KEY="[from geocoding service]"
GEOCODING_API_URL="[geocoding service endpoint]"
```

### 12.2 Environment-Specific Config

**Development**:
- `NODE_ENV=development`
- Hot reload enabled
- Detailed error messages
- Source maps

**Production**:
- `NODE_ENV=production`
- Optimized builds
- Error logging (Sentry, etc.)
- Security headers
- HTTPS enforced

---

## 13. Deployment

### 13.1 Deployment Platform

**Recommended**: Vercel (Next.js native platform)

**Alternative**: AWS (ECS, Amplify), DigitalOcean, Railway

### 13.2 Build Process

```bash
npm run build      # Next.js production build
npm run start      # Start production server
```

### 13.3 Database Deployment

**Hosting**: Neon, Supabase, AWS RDS, DigitalOcean Managed DB

**Migration Strategy**:
```bash
npx prisma migrate deploy   # Apply migrations
npx prisma generate         # Generate client
```

### 13.4 Environment Setup

1. Set all environment variables in hosting platform
2. Configure OAuth redirect URIs for production domain
3. Set up S3 bucket with proper CORS policy
4. Configure custom domain and SSL
5. Set up error monitoring (Sentry, etc.)
6. Configure analytics (PostHog, Plausible, etc.)

### 13.5 CI/CD Pipeline (Suggested)

```yaml
# GitHub Actions example
- Install dependencies
- Run linting
- Run type checking
- Run tests
- Build application
- Deploy to staging
- Run E2E tests on staging
- Deploy to production
```

---

## 14. Security Considerations

### 14.1 Authentication Security

- ✅ Passwords hashed with bcrypt (10+ rounds)
- ✅ JWT tokens with secure secret
- ✅ httpOnly cookies for session
- ✅ CSRF protection via NextAuth
- ✅ OAuth token storage secured in database

### 14.2 Data Security

- ✅ Parameterized queries (Prisma)
- ✅ Input validation (Zod schemas)
- ✅ Output sanitization (React escaping)
- ✅ Role-based authorization checks
- ✅ User can only modify own data

### 14.3 File Upload Security

- ✅ File type validation (MIME type)
- ✅ File size limits (5MB)
- ✅ Unique filenames (UUID)
- ✅ S3 bucket permissions (no public write)
- ✅ Virus scanning (future enhancement)

### 14.4 API Security

- ✅ Rate limiting (future with middleware)
- ✅ CORS configuration
- ✅ Security headers (helmet.js recommended)
- ✅ Environment variable protection
- ✅ No sensitive data in client bundles

---

## 15. Future Enhancements

### 15.1 Planned Features

**Phase 2**:
- Shopping cart and checkout
- Stripe payment integration
- Order management system
- Email notifications (SendGrid, Resend)
- Customer reviews and ratings
- Farmer messaging system

**Phase 3**:
- Delivery scheduling
- Subscription boxes
- Loyalty program
- Advanced analytics dashboard
- Mobile app (React Native)
- Admin panel

### 15.2 Technical Improvements

- **Performance**:
  - Redis caching layer
  - Image CDN (CloudFront)
  - Database read replicas

- **Monitoring**:
  - Error tracking (Sentry)
  - Performance monitoring (Vercel Analytics)
  - User analytics (PostHog)

- **Testing**:
  - Comprehensive test suite
  - CI/CD pipeline
  - Automated E2E tests

- **Documentation**:
  - API documentation (Swagger)
  - Component Storybook
  - Developer onboarding guide

---

## 16. Development Guidelines

### 16.1 Code Standards

**TypeScript**:
- Strict mode enabled
- No `any` types (use `unknown` if necessary)
- Explicit return types for functions
- Interface over type when possible

**React**:
- Server Components by default
- Client Components only when needed
- Hooks follow rules of hooks
- Props destructuring in function signature

**Naming Conventions**:
- Components: PascalCase (`ProductCard`)
- Files: kebab-case for non-components (`product-actions.ts`)
- Variables/functions: camelCase (`getUserProfile`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### 16.2 Git Workflow

**Branch Strategy**:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

**Commit Messages**:
```
feat: add product filtering by category
fix: resolve geocoding API timeout issue
refactor: extract image upload logic to separate action
docs: update API documentation
```

### 16.3 Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Server Actions have error handling
- [ ] Authorization checks are in place
- [ ] Input is validated with Zod
- [ ] i18n keys are added for new text
- [ ] Components are responsive
- [ ] Accessibility standards met
- [ ] No console.log statements in production code
- [ ] Tests added/updated (if applicable)

---

## 17. Troubleshooting

### 17.1 Common Issues

**Database Connection**:
```bash
# Check connection
npx prisma db push
# Regenerate client
npx prisma generate
```

**OAuth Not Working**:
- Verify redirect URIs in provider console
- Check environment variables are set
- Ensure NEXTAUTH_URL matches deployment URL

**Images Not Loading**:
- Verify S3 bucket permissions
- Check remote patterns in next.config.ts
- Confirm AWS credentials are valid

**Geocoding Fails**:
- Check API key and URL
- Verify address format
- Handle errors gracefully with fallback

### 17.2 Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev          # All debug logs
DEBUG=nextauth:* npm run dev # NextAuth logs only
```

---

## 18. Appendices

### 18.1 Glossary

- **Server Action**: Server-side function callable from client
- **Server Component**: React component rendered on server
- **Client Component**: React component with client-side interactivity
- **ISR**: Incremental Static Regeneration
- **RBAC**: Role-Based Access Control
- **OAuth**: Open Authorization protocol
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping

### 18.2 External Resources

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://authjs.dev
- next-intl Docs: https://next-intl-docs.vercel.app
- Tailwind CSS: https://tailwindcss.com
- Radix UI: https://www.radix-ui.com

### 18.3 Contact & Support

**Development Team**: [Add contact info]
**Project Repository**: [Add GitHub URL]
**Issue Tracker**: [Add issue tracker URL]
**Documentation**: [Add docs URL]

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Development Team
