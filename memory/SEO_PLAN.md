# LocalRoots SEO Strategy Plan

A comprehensive SEO plan for the LocalRoots organic farmers marketplace.

---

## 1. Executive Summary

LocalRoots is a multilingual (EN, FR, ES) marketplace connecting local organic farmers with customers. This SEO plan focuses on:
- **Local SEO** optimization for farmer discovery
- **Technical SEO** foundations for a Next.js 15 application
- **Content strategy** for organic traffic growth
- **Structured data** for rich search results
- **International SEO** for multilingual support

---

## 2. Current SEO Status Analysis

### What's Already Implemented
- Basic metadata in root layout (`title`, `description`)
- Dynamic metadata for product detail pages via `generateMetadata`
- Static metadata for privacy and terms pages
- Next.js Image optimization with WebP/AVIF formats
- Internationalization with next-intl (en, fr, es locales)
- Clean URL structure with locale prefixes

### Gaps Identified
- No sitemap.xml implementation
- No robots.txt file
- Missing metadata on many key pages (home, products list, about, map)
- No Open Graph / Twitter Card metadata
- No structured data (JSON-LD) for products, local business, breadcrumbs
- No canonical URLs configured
- Missing hreflang tags for international SEO
- No 404 page SEO optimization
- No favicon/manifest.json configuration

---

## 3. Technical SEO Implementation

### 3.1 Sitemap.xml

Create a dynamic sitemap at `app/sitemap.ts`:

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import prisma from '@/lib/db/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.com'
  const locales = ['en', 'fr', 'es']

  // Static pages
  const staticPages = ['', '/about', '/products', '/map', '/login', '/register']

  const staticRoutes = locales.flatMap(locale =>
    staticPages.map(page => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'daily' : 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  // Dynamic product pages
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  })

  const productRoutes = locales.flatMap(locale =>
    products.map(product => ({
      url: `${baseUrl}/${locale}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  return [...staticRoutes, ...productRoutes]
}
```

### 3.2 Robots.txt

Create `app/robots.ts`:

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/messages/',
          '/checkout/',
          '/orders/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### 3.3 Root Metadata Configuration

Update `app/[locale]/layout.tsx` with comprehensive metadata:

```typescript
import { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.com'

  const titles = {
    en: 'LocalRoots - Local Organic Farmers Marketplace',
    fr: 'LocalRoots - Marche des Agriculteurs Bio Locaux',
    es: 'LocalRoots - Mercado de Agricultores Organicos Locales',
  }

  const descriptions = {
    en: 'Connect with local organic farmers. Browse fresh produce, support sustainable agriculture, and discover farm-to-table food in your community.',
    fr: 'Connectez-vous avec les agriculteurs bio locaux. Parcourez les produits frais, soutenez lagriculture durable.',
    es: 'Conecta con agricultores organicos locales. Descubre productos frescos y apoya la agricultura sostenible.',
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: titles[locale] || titles.en,
      template: `%s | LocalRoots`,
    },
    description: descriptions[locale] || descriptions.en,
    keywords: [
      'organic farmers', 'local produce', 'farm to table',
      'sustainable agriculture', 'farmers market', 'organic food',
      'local food', 'fresh vegetables', 'organic marketplace'
    ],
    authors: [{ name: 'LocalRoots' }],
    creator: 'LocalRoots',
    publisher: 'LocalRoots',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      alternateLocale: ['en', 'fr', 'es'].filter(l => l !== locale),
      url: baseUrl,
      siteName: 'LocalRoots',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'LocalRoots - Local Organic Farmers Marketplace',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'fr': `${baseUrl}/fr`,
        'es': `${baseUrl}/es`,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      // Add Bing, Yandex if needed
    },
  }
}
```

### 3.4 Fix HTML lang Attribute

Update `app/[locale]/layout.tsx` to use dynamic locale:

```typescript
// Change from:
<html lang="en">

// To:
<html lang={locale}>
```

---

## 4. Page-Specific Metadata

### 4.1 Home Page (`app/[locale]/page.tsx`)

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Real Farmers. Real Food. Real Connections.',
    description: 'Discover fresh, organic produce from farmers in your community. Support local agriculture and eat healthier with LocalRoots marketplace.',
    openGraph: {
      title: 'LocalRoots - Connect with Local Organic Farmers',
      description: 'Discover fresh, organic produce from farmers in your community.',
    },
  }
}
```

### 4.2 Products List Page (`app/[locale]/products/page.tsx`)

```typescript
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const category = (await searchParams)?.category

  const title = category
    ? `${category} - Fresh Local Products | LocalRoots`
    : 'Browse Local Organic Products | LocalRoots'

  return {
    title,
    description: 'Browse fresh, organic products from local farmers. Filter by category, location, and availability. Farm-to-table produce delivered to you.',
  }
}
```

### 4.3 Product Detail Page (enhance existing)

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const product = await getProductById(id)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localroots.com'
  const farmName = product.farmer.sellerProfile?.farmName || 'Local Farm'
  const location = product.farmer.sellerProfile
    ? `${product.farmer.sellerProfile.city}, ${product.farmer.sellerProfile.state}`
    : ''

  return {
    title: `${product.name} from ${farmName}`,
    description: product.description ||
      `Buy fresh ${product.name} from ${farmName}${location ? ` in ${location}` : ''}. ${product.price.toFixed(2)}/${product.unit}. Support local organic farmers.`,
    openGraph: {
      title: `${product.name} - ${farmName} | LocalRoots`,
      description: product.description || `Fresh ${product.name} from local organic farmers`,
      images: product.imageUrl ? [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ] : undefined,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/products/${id}`,
    },
  }
}
```

### 4.4 Map Page (`app/[locale]/map/page.tsx`)

```typescript
export const metadata: Metadata = {
  title: 'Find Local Farmers Near You | Interactive Map',
  description: 'Use our interactive map to discover organic farmers in your area. Find fresh, local produce and connect with farmers near you.',
}
```

### 4.5 About Page (`app/[locale]/about/page.tsx`)

```typescript
export const metadata: Metadata = {
  title: 'About LocalRoots - Our Mission & Values',
  description: 'LocalRoots connects local organic farmers with customers who value fresh, sustainable food. Learn about our mission, values, and commitment to community.',
}
```

---

## 5. Structured Data (JSON-LD)

### 5.1 Organization Schema (Root Layout)

Create `components/seo/organization-schema.tsx`:

```typescript
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LocalRoots',
    url: 'https://localroots.com',
    logo: 'https://localroots.com/logo.png',
    description: 'Marketplace connecting local organic farmers with customers',
    sameAs: [
      // Add social media URLs
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@localroots.com',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 5.2 Product Schema (Product Detail Page)

Create `components/seo/product-schema.tsx`:

```typescript
interface ProductSchemaProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    unit: string
    imageUrl: string | null
    inStock: boolean
    averageRating: number | null
    reviewCount: number
    farmer: {
      name: string | null
      sellerProfile: {
        farmName: string
        city: string
        state: string
      } | null
    }
  }
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: {
      '@type': 'Brand',
      name: product.farmer.sellerProfile?.farmName || product.farmer.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'LocalBusiness',
        name: product.farmer.sellerProfile?.farmName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: product.farmer.sellerProfile?.city,
          addressRegion: product.farmer.sellerProfile?.state,
        },
      },
    },
    ...(product.averageRating && product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 5.3 LocalBusiness Schema (For Farmer Profiles)

```typescript
export function FarmerSchema({ farmer }: FarmerSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://localroots.com/farmers/${farmer.id}`,
    name: farmer.sellerProfile.farmName,
    description: farmer.sellerProfile.description,
    telephone: farmer.sellerProfile.phone,
    url: farmer.sellerProfile.website,
    address: {
      '@type': 'PostalAddress',
      streetAddress: farmer.sellerProfile.address,
      addressLocality: farmer.sellerProfile.city,
      addressRegion: farmer.sellerProfile.state,
      postalCode: farmer.sellerProfile.zipCode,
      addressCountry: farmer.sellerProfile.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: farmer.sellerProfile.latitude,
      longitude: farmer.sellerProfile.longitude,
    },
    priceRange: '$$',
    openingHoursSpecification: [], // Add if available
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 5.4 Breadcrumb Schema

Create `components/seo/breadcrumb-schema.tsx`:

```typescript
interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 5.5 WebSite Schema with SearchAction

```typescript
export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LocalRoots',
    url: 'https://localroots.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://localroots.com/en/products?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## 6. Local SEO Strategy

### 6.1 Google Business Profile
- Create a Google Business Profile for LocalRoots as a platform
- Encourage farmers to create their own Google Business Profiles
- Link farmer profiles to their Google Business listings

### 6.2 Location-Based Landing Pages
Create SEO-optimized location pages:
- `/en/farmers/california`
- `/en/farmers/new-york`
- `/en/farmers/[city-slug]`

Each page should include:
- H1: "Organic Farmers in [Location]"
- List of farmers in that area
- LocalBusiness schema for each farmer
- Map of farmer locations
- FAQ section about local organic farming

### 6.3 NAP Consistency
Ensure Name, Address, Phone consistency across:
- Farmer profile pages
- Structured data
- External directory listings

### 6.4 Local Keywords Strategy

**Primary Keywords:**
- local organic farmers near me
- organic produce [city name]
- farm to table marketplace
- buy local organic food
- farmers market online

**Long-tail Keywords:**
- organic vegetables delivery [city]
- local farm fresh eggs near me
- sustainable farming marketplace
- connect with local farmers
- organic food subscription box local

---

## 7. Content Strategy

### 7.1 Blog Section (Recommended Addition)

Create a blog at `/en/blog` covering:

**Farmer Stories:**
- "Meet [Farmer Name]: Growing Organic Tomatoes in [City]"
- "A Day in the Life of a Local Organic Farmer"

**Educational Content:**
- "Benefits of Buying from Local Organic Farmers"
- "How to Choose the Best Seasonal Produce"
- "Understanding Organic Certifications"
- "Farm-to-Table: Why Distance Matters"

**Seasonal Guides:**
- "What's in Season: Spring Produce Guide"
- "Summer Harvest: Best Local Fruits"
- "Fall Vegetables: A Buying Guide"

**Recipes:**
- "Farm Fresh Recipes from LocalRoots Farmers"
- "Cooking with Seasonal Local Produce"

### 7.2 FAQ Pages

Create FAQ pages for:
- General: `/en/faq`
- Farmers: `/en/faq/farmers`
- Customers: `/en/faq/customers`

Include FAQ schema markup for rich snippets.

### 7.3 Category Pages Enhancement

For each product category, create dedicated landing pages:
- `/en/products/vegetables`
- `/en/products/fruits`
- `/en/products/dairy`
- `/en/products/meat`
- `/en/products/eggs`

Each with:
- Unique H1 and content
- Category-specific keywords
- Featured products
- Related farmer profiles

---

## 8. International SEO

### 8.1 Hreflang Implementation

Already configured via `alternates.languages` in metadata. Ensure all pages include:

```html
<link rel="alternate" hreflang="en" href="https://localroots.com/en/..." />
<link rel="alternate" hreflang="fr" href="https://localroots.com/fr/..." />
<link rel="alternate" hreflang="es" href="https://localroots.com/es/..." />
<link rel="alternate" hreflang="x-default" href="https://localroots.com/en/..." />
```

### 8.2 Language-Specific Keywords

**English:**
- organic farmers marketplace
- local produce delivery
- farm fresh food

**French:**
- marche agriculteurs bio
- produits locaux livraison
- aliments frais ferme

**Spanish:**
- mercado agricultores organicos
- productos locales entrega
- alimentos frescos granja

### 8.3 Regional Targeting

Consider adding country-specific versions:
- `en-US`, `en-GB`, `en-CA`
- `fr-FR`, `fr-CA`
- `es-ES`, `es-MX`

---

## 9. Performance Optimization for SEO

### 9.1 Core Web Vitals

**Current Optimizations (Keep):**
- Next.js Image component with priority loading
- Font display: swap for FOIT prevention
- CloudFront CDN for static assets

**Additional Recommendations:**
- Implement lazy loading for below-fold images
- Add `fetchpriority="high"` to hero images
- Optimize CLS by setting explicit image dimensions
- Consider removing unused font weights

### 9.2 Mobile Optimization

- Ensure all pages pass Mobile-Friendly Test
- Test touch targets (minimum 48x48px)
- Verify viewport meta tag
- Test on various screen sizes

### 9.3 Page Speed Improvements

- Enable Gzip/Brotli compression
- Implement aggressive caching headers
- Consider ISR for product listings
- Lazy load map components (already using dynamic import)

---

## 10. Monitoring & Analytics

### 10.1 Google Search Console

Setup for:
- All language versions
- Sitemap submission
- Index coverage monitoring
- Core Web Vitals tracking
- Mobile usability reports

### 10.2 Key Metrics to Track

- Organic traffic by page/locale
- Keyword rankings for target terms
- Click-through rates (CTR)
- Core Web Vitals scores
- Indexed pages count
- Crawl errors

### 10.3 Tools

- Google Search Console
- Google Analytics 4
- Vercel Analytics (already integrated)
- Ahrefs/SEMrush for keyword tracking (optional)

---

## 11. Implementation Roadmap

### Phase 1: Technical Foundation (Priority: High)

1. [ ] Create `app/sitemap.ts`
2. [ ] Create `app/robots.ts`
3. [ ] Fix HTML lang attribute to use dynamic locale
4. [ ] Add `NEXT_PUBLIC_BASE_URL` environment variable
5. [ ] Create and add favicon, apple-touch-icon, manifest.json
6. [ ] Create OG image (1200x630) for social sharing

### Phase 2: Metadata Enhancement (Priority: High)

1. [ ] Update root layout with comprehensive metadata
2. [ ] Add metadata to home page
3. [ ] Add metadata to products list page
4. [ ] Add metadata to about page
5. [ ] Add metadata to map page
6. [ ] Enhance product detail metadata with OG images

### Phase 3: Structured Data (Priority: Medium)

1. [ ] Add Organization schema to root layout
2. [ ] Add WebSite schema with SearchAction
3. [ ] Add Product schema to product detail pages
4. [ ] Add LocalBusiness schema for farmer profiles
5. [ ] Add BreadcrumbList schema to all pages
6. [ ] Add FAQ schema to terms/privacy pages

### Phase 4: Content Expansion (Priority: Medium)

1. [ ] Create location-based landing pages
2. [ ] Create category landing pages
3. [ ] Consider adding blog section
4. [ ] Create FAQ pages with schema

### Phase 5: Monitoring Setup (Priority: Medium)

1. [ ] Set up Google Search Console
2. [ ] Submit sitemap
3. [ ] Configure Google Analytics 4
4. [ ] Set up keyword tracking

### Phase 6: Ongoing Optimization (Priority: Ongoing)

1. [ ] Monitor Core Web Vitals
2. [ ] Track keyword rankings
3. [ ] Update content regularly
4. [ ] Build quality backlinks
5. [ ] Monitor and fix crawl errors

---

## 12. Quick Wins Checklist

These can be implemented immediately for fast SEO improvements:

- [ ] Add `sitemap.ts` (30 min)
- [ ] Add `robots.ts` (10 min)
- [ ] Fix `<html lang={locale}>` (5 min)
- [ ] Add metadata to home page (20 min)
- [ ] Create OG image and add to metadata (1 hr)
- [ ] Add Organization schema (30 min)
- [ ] Submit sitemap to Google Search Console (15 min)

---

## 13. SEO Audit Checklist

Use this checklist periodically to verify SEO health:

### Technical
- [ ] All pages return 200 status
- [ ] No duplicate content issues
- [ ] Canonical URLs are correct
- [ ] Hreflang tags are implemented
- [ ] Sitemap is accessible and up-to-date
- [ ] Robots.txt allows crawling of important pages
- [ ] No broken internal links
- [ ] SSL certificate is valid

### On-Page
- [ ] Every page has unique title (50-60 chars)
- [ ] Every page has unique meta description (150-160 chars)
- [ ] H1 tags are present and unique
- [ ] Images have descriptive alt text
- [ ] Internal linking is logical
- [ ] URLs are clean and descriptive

### Performance
- [ ] LCP < 2.5 seconds
- [ ] FID < 100 milliseconds
- [ ] CLS < 0.1
- [ ] Mobile-friendly
- [ ] Fast on 3G connections

### Structured Data
- [ ] No errors in Google Rich Results Test
- [ ] Product pages have valid Product schema
- [ ] Organization schema is present
- [ ] Breadcrumbs are implemented

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Maintained By:** Development Team
