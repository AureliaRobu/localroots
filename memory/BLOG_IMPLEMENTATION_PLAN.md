# Blog Feature with Admin CRUD - Implementation Plan

## Overview

Add a blog feature to LocalRoots with admin management capabilities. The blog will feature farmer stories, permaculture education, and motivational content.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rich Text Editor | Tiptap | Headless, React-native, outputs JSON for SEO, integrates with React Hook Form |
| Admin Routes | Separate route group `(admin)/admin/` | Clean separation from user dashboard, dedicated admin layout, easier to extend |
| Categories | Separate model | Allows admin management with i18n support |
| Tags | JSON array (`String[]`) | Flexible without schema complexity |
| i18n for content | Separate translations tables | Scalable for new languages without schema changes, queryable by locale, clean fallback logic |

---

## Phase 1: Database Schema

**Files to modify:**
- `/prisma/schema.prisma`

**Add models:**

```prisma
enum BlogPostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// Blog Categories (language-agnostic base)
model BlogCategory {
  id           String                    @id @default(cuid())
  slug         String                    @unique
  posts        BlogPost[]
  translations BlogCategoryTranslation[]
  createdAt    DateTime                  @default(now())
  updatedAt    DateTime                  @updatedAt

  @@map("blog_categories")
}

// Blog Category Translations
model BlogCategoryTranslation {
  id          String       @id @default(cuid())
  categoryId  String
  category    BlogCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  locale      String       // "en", "es", "fr", etc.
  name        String
  description String?

  @@unique([categoryId, locale])
  @@map("blog_category_translations")
  @@index([locale])
}

// Blog Posts (language-agnostic base)
model BlogPost {
  id            String                @id @default(cuid())
  slug          String                @unique
  status        BlogPostStatus        @default(DRAFT)
  featuredImage String?
  categoryId    String?
  category      BlogCategory?         @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tags          String[]
  authorId      String
  author        User                  @relation(fields: [authorId], references: [id], onDelete: Cascade)
  translations  BlogPostTranslation[]
  publishedAt   DateTime?
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  @@map("blog_posts")
  @@index([status, publishedAt])
  @@index([categoryId])
  @@index([authorId])
}

// Blog Post Translations
model BlogPostTranslation {
  id              String   @id @default(cuid())
  postId          String
  post            BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  locale          String   // "en", "es", "fr", etc.
  title           String
  excerpt         String?  @db.Text
  content         Json     // Tiptap JSON
  metaTitle       String?
  metaDescription String?

  @@unique([postId, locale])
  @@map("blog_post_translations")
  @@index([locale])
}
```

**Update User model:** Add `blogPosts BlogPost[]` relation

**Run:** `npx prisma db push && npx prisma generate`

**Fallback Strategy:**
- Query translations for current locale first
- If not found, fallback to default locale ("en")
- Posts without translation in current locale show English content

---

## Phase 2: Core Infrastructure

### Validation (`/lib/validations/blog.ts`)

```typescript
// Single translation entry
export const blogPostTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  title: z.string().min(3),
  excerpt: z.string().max(300).optional(),
  content: z.any(), // Tiptap JSON
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

// Full blog post with translations
export const blogPostSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  featuredImage: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  translations: z.array(blogPostTranslationSchema).min(1), // At least one translation required
})

// Category translation
export const categoryTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(2),
  description: z.string().optional(),
})

// Full category with translations
export const categorySchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  translations: z.array(categoryTranslationSchema).min(1),
})
```

### Database Queries (`/lib/db/blog.ts`)

- `getPublishedPosts(locale, options)` - Public listing with pagination, includes translation for locale (fallback to 'en')
- `getPostBySlug(slug, locale)` - Single post with translation for locale
- `getRelatedPosts(postId, locale, limit)` - Related posts by category/tags with translations
- `getAllCategories(locale)` - Categories with translations for locale
- `getAllPosts(options)` - Admin listing (all statuses, all translations)
- `getPostById(id)` - Admin edit (includes all translations)
- `getAvailableLocalesForPost(postId)` - List locales with translations for a post

### Server Actions (`/lib/actions/blog.ts`)

All use `requireAdmin()` check:
- `createBlogPost(data)` - Create post with translations (upserts translations)
- `updateBlogPost(id, data)` - Update post and translations
- `deleteBlogPost(id)` - Delete post (cascades to translations)
- `publishBlogPost(id)` - Set status to PUBLISHED, set publishedAt
- `unpublishBlogPost(id)` - Set status to DRAFT
- `createCategory(data)` - Create category with translations
- `updateCategory(id, data)` - Update category and translations
- `deleteCategory(id)` - Delete category (cascades to translations)
- `upsertTranslation(postId, locale, data)` - Add/update single translation

---

## Phase 3: Admin Interface

### Install Tiptap

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/pm
```

### Components to Create

| Component | Path | Purpose |
|-----------|------|---------|
| TiptapEditor | `/components/blog/admin/tiptap-editor.tsx` | Rich text editor with toolbar |
| BlogForm | `/components/blog/admin/blog-form.tsx` | Create/edit form with locale tabs for translations |
| BlogPostsTable | `/components/blog/admin/blog-posts-table.tsx` | Admin list with translation status indicators |
| BlogStatusBadge | `/components/blog/admin/blog-status-badge.tsx` | Draft/Published/Archived badge |
| CategoryForm | `/components/blog/admin/category-form.tsx` | Category CRUD form with locale tabs |
| LocaleTabs | `/components/blog/admin/locale-tabs.tsx` | Reusable tabs component for switching between locales |

**BlogForm UX:**
- Tabs for each supported locale (EN, ES, FR, etc.)
- Visual indicator showing which locales have translations
- "Copy from English" button for quick translation starting point
- Shared fields (slug, image, category, tags, status) outside tabs
- Per-locale fields (title, excerpt, content, meta) inside tabs

### Admin Pages

| Page | Path |
|------|------|
| Posts List | `/app/[locale]/(admin)/admin/blog/page.tsx` |
| Create Post | `/app/[locale]/(admin)/admin/blog/new/page.tsx` |
| Edit Post | `/app/[locale]/(admin)/admin/blog/[id]/edit/page.tsx` |
| Categories | `/app/[locale]/(admin)/admin/blog/categories/page.tsx` |

### Admin Layout & Sidebar

Create dedicated admin infrastructure:
- `/app/[locale]/(admin)/admin/layout.tsx` - Admin layout with auth check (`requireAdmin()`)
- `/components/admin-sidebar.tsx` - Dedicated admin sidebar with:
  - Dashboard link
  - Blog management (Posts, Categories)
  - Extensible for future admin features (Users, Analytics, etc.)

---

## Phase 4: Public Blog Pages

### Components to Create

| Component | Path | Purpose |
|-----------|------|---------|
| BlogCard | `/components/blog/blog-card.tsx` | Post card for listings |
| BlogFilters | `/components/blog/blog-filters.tsx` | Category/tag filters |
| BlogPagination | `/components/blog/blog-pagination.tsx` | Page navigation |
| BlogContentRenderer | `/components/blog/blog-content-renderer.tsx` | Render Tiptap JSON to HTML |
| RelatedPosts | `/components/blog/related-posts.tsx` | Related posts section |

### Public Pages

| Page | Path | Features |
|------|------|----------|
| Blog List | `/app/[locale]/blog/page.tsx` | Grid, filters, pagination, ISR (5min) |
| Blog Post | `/app/[locale]/blog/[slug]/page.tsx` | Content, author, related posts, ISR (1min) |
| Loading | `/app/[locale]/blog/loading.tsx` | Skeleton UI |
| Not Found | `/app/[locale]/blog/[slug]/not-found.tsx` | 404 for posts |

---

## Phase 5: SEO & i18n

### SEO

- Create `/components/seo/blog-post-schema.tsx` - Article JSON-LD
- Add `generateMetadata` to blog pages
- Configure `revalidate` for ISR

### Translations

Add `blog` namespace to `/messages/*.json`:
- `title`, `subtitle`, `readMore`, `publishedOn`, `by`
- `filters.category`, `filters.tag`, `filters.search`
- `admin.title`, `admin.newPost`, `admin.form.*`

### Header Navigation

Add "Blog" link to `/components/layout/Header.tsx`

---

## File Structure Summary

```
/app/[locale]/
├── blog/
│   ├── page.tsx
│   ├── loading.tsx
│   └── [slug]/
│       ├── page.tsx
│       └── not-found.tsx
└── (admin)/admin/
    ├── layout.tsx              # Admin layout with requireAdmin() check
    └── blog/
        ├── page.tsx
        ├── new/page.tsx
        ├── [id]/edit/page.tsx
        └── categories/page.tsx

/components/
├── admin-sidebar.tsx           # Dedicated admin sidebar
└── blog/
    ├── blog-card.tsx
    ├── blog-filters.tsx
    ├── blog-pagination.tsx
    ├── blog-content-renderer.tsx
    ├── related-posts.tsx
    └── admin/
        ├── tiptap-editor.tsx
        ├── blog-form.tsx
        ├── blog-posts-table.tsx
        ├── blog-status-badge.tsx
        └── category-form.tsx

/lib/
├── actions/blog.ts
├── db/blog.ts
└── validations/blog.ts

/components/seo/blog-post-schema.tsx
```

---

## Verification

1. **Database:** Run `npx prisma studio` and verify BlogPost, BlogPostTranslation, BlogCategory, BlogCategoryTranslation tables exist
2. **Admin Access:** Login as admin, navigate to `/admin/blog`, verify admin layout loads
3. **Non-Admin Redirect:** Login as regular user, try `/admin/blog`, verify redirect to dashboard
4. **Create Post:** Create a draft post with English translation, verify it saves
5. **Add Translation:** Add Spanish translation to existing post, verify locale tabs work
6. **Publish:** Publish post, verify it appears on public `/blog`
7. **Locale Switching:** View post in `/en/blog/[slug]`, then `/es/blog/[slug]`, verify correct translation shows
8. **Fallback:** View post in French (no translation), verify English fallback displays
9. **SEO:** Check page source for meta tags and JSON-LD schema in current locale
10. **Filters:** Test category and tag filtering on public blog
11. **ISR:** Edit a published post, verify it updates within revalidation period

---

## Dependencies

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/pm
```

---

## Key Patterns Reference

- **Server Actions:** Follow `/lib/actions/products.ts` pattern
- **Forms:** Follow `/components/products/add-product-form.tsx` pattern
- **Public Pages:** Follow `/app/[locale]/products/[id]/page.tsx` pattern
- **SEO Schemas:** Follow `/components/seo/product-schema.tsx` pattern
- **Image Upload:** Reuse `/lib/actions/upload.ts`
