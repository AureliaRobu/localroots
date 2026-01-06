# Customer Reviews and Ratings System - Implementation Plan

## Overview
Implement a customer reviews and ratings system allowing customers to review products they've purchased (verified purchases only). Display ratings on product pages and cards, and integrate review functionality into order completion flow.

## Current State
- No Review model exists in database
- Products have no rating/review fields
- Order system exists with COMPLETED status tracking
- Customer order pages already implemented

## Implementation Steps

### 1. Database Schema (Critical - Do First)

**File:** `/home/krysa/Projects/localroots/prisma/schema.prisma`

Add Review model:
```prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5 stars
  title     String   // Short review title
  comment   String?  @db.Text

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  isVerified Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
  @@map("reviews")
  @@index([productId])
  @@index([userId])
}
```

Update Product model - add:
```prisma
averageRating Float?
reviewCount   Int @default(0)
reviews       Review[]
```

Update User and Order models - add:
```prisma
reviews Review[]
```

Run migration:
```bash
npx prisma db push
npx prisma generate
```

---

### 2. Validation Schemas

**File:** `/home/krysa/Projects/localroots/lib/validations/review.ts` (CREATE)

```typescript
import * as z from 'zod'

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(100),
  comment: z.string().min(10).max(2000).optional().or(z.literal('')),
  productId: z.string().cuid(),
  orderId: z.string().cuid()
})

export const updateReviewSchema = z.object({
  reviewId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(100),
  comment: z.string().min(10).max(2000).optional().or(z.literal(''))
})

export type ReviewFormData = z.infer<typeof reviewSchema>
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>
```

---

### 3. Server Actions

**File:** `/home/krysa/Projects/localroots/lib/actions/review.ts` (CREATE)

Implement following actions (follow pattern from `/lib/actions/order.ts`):

1. **createReview(data: ReviewFormData)**
   - Validate user authenticated
   - Verify order is COMPLETED and belongs to user
   - Verify product is in order
   - Check no existing review (unique constraint)
   - Create review
   - Update product aggregates (averageRating, reviewCount)
   - Revalidate paths: `/products/${productId}`, `/customer/orders`, `/orders/${orderId}`

2. **updateReview(data: UpdateReviewFormData)**
   - Validate ownership
   - Update review
   - Recalculate product aggregates

3. **deleteReview(reviewId: string)**
   - Validate ownership or admin
   - Delete review
   - Recalculate product aggregates

4. **getProductReviews(productId: string, options?)**
   - Fetch with pagination (limit: 10)
   - Include user data
   - Support sorting: recent, highest, lowest

5. **canReviewProduct(productId: string)**
   - Check user has COMPLETED order with product
   - Check not already reviewed
   - Return: `{ canReview: boolean, orderId?: string, reason?: string }`

6. **Helper: updateProductRatingAggregates(productId)**
   - Calculate average and count from reviews
   - Update Product model

---

### 4. UI Components

Create in `/home/krysa/Projects/localroots/components/reviews/`:

**A. star-rating.tsx** (CREATE)
- Display variant: read-only stars
- Input variant: clickable stars for forms
- Props: rating, variant, size, onChange

**B. review-card.tsx** (CREATE)
- Display single review with avatar, name, verified badge
- Star rating, title, comment, date
- Edit/delete buttons (if owned by current user)

**C. review-form.tsx** (CREATE)
- React Hook Form + Zod validation
- Star rating input
- Title and comment fields
- Loading states, error handling
- Use pattern from farmer profile form

**D. reviews-list.tsx** (CREATE)
- Display multiple ReviewCards
- Sort dropdown (recent, highest, lowest)
- Load more pagination
- Empty state

**E. review-summary.tsx** (CREATE)
- Large average rating display
- Total review count
- Rating distribution bars (1-5 stars)
- "Write Review" button

---

### 5. Page Integrations

**A. Product Detail Page**

**File:** `/home/krysa/Projects/localroots/app/[locale]/products/[id]/page.tsx`

After "More from this farmer" section (line ~240):
- Add ReviewSummary component
- Add ReviewsList component
- Fetch reviews server-side
- Check if current user can review
- Add "Write Review" dialog

**B. Product Cards**

**File:** `/home/krysa/Projects/localroots/components/products/product-card.tsx`

After price display (~line 91):
- Add compact StarRating display
- Show review count: "(X reviews)"
- Add averageRating and reviewCount to props

Update all ProductCard usages:
- `/app/[locale]/products/page.tsx`
- `/app/[locale]/products/[id]/page.tsx`

**C. Order Detail Page**

**File:** `/home/krysa/Projects/localroots/app/[locale]/orders/[orderId]/page.tsx`

In order items section (after line ~149):
- Add "Leave Review" button for COMPLETED orders
- Create ReviewButton client component
- Open ReviewForm in Dialog
- Check if product already reviewed

**D. Customer Orders Page** (Optional enhancement)

**File:** `/home/krysa/Projects/localroots/app/[locale]/(dashboard)/customer/orders/page.tsx`

Add review status badge showing pending reviews count

---

### 6. Translations

**Files:** `/home/krysa/Projects/localroots/messages/en.json`, `es.json`, `fr.json`

Add `reviews` namespace:
```json
{
  "reviews": {
    "title": "Customer Reviews",
    "writeReview": "Write a Review",
    "editReview": "Edit Review",
    "verifiedPurchase": "Verified Purchase",
    "rating": "Rating",
    "ratingRequired": "Please select a rating",
    "reviewTitle": "Review Title",
    "titlePlaceholder": "Sum up your experience in one line",
    "comment": "Your Review",
    "commentPlaceholder": "Tell others about your experience...",
    "submit": "Submit Review",
    "cancel": "Cancel",
    "createSuccess": "Review posted successfully!",
    "updateSuccess": "Review updated successfully!",
    "noReviews": "No reviews yet",
    "loadMore": "Load More Reviews",
    "sortRecent": "Most Recent",
    "sortHighest": "Highest Rating",
    "sortLowest": "Lowest Rating",
    "leaveReview": "Leave Review",
    "deleteReview": "Delete Review",
    "confirmDelete": "Are you sure you want to delete this review?"
  }
}
```

Translate to Spanish and French.

---

### 7. Type Definitions

**File:** `/home/krysa/Projects/localroots/types/index.ts`

Add:
```typescript
export type { Review } from '@prisma/client'

export type ReviewWithUser = Review & {
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export type { ReviewFormData, UpdateReviewFormData } from '@/lib/validations/review'
```

---

## Implementation Order

1. ✅ Database schema changes → Run migration
2. ✅ Validation schemas → Quick, standalone
3. ✅ Server actions → Core business logic
4. ✅ UI components → Build reusable pieces
5. ✅ Translations → Add all keys
6. ✅ Page integrations → Wire everything together
7. ✅ Manual testing → Verify all flows

## Critical Files to Modify

1. `/home/krysa/Projects/localroots/prisma/schema.prisma`
2. `/home/krysa/Projects/localroots/lib/validations/review.ts` (new)
3. `/home/krysa/Projects/localroots/lib/actions/review.ts` (new)
4. `/home/krysa/Projects/localroots/components/reviews/star-rating.tsx` (new)
5. `/home/krysa/Projects/localroots/components/reviews/review-card.tsx` (new)
6. `/home/krysa/Projects/localroots/components/reviews/review-form.tsx` (new)
7. `/home/krysa/Projects/localroots/components/reviews/reviews-list.tsx` (new)
8. `/home/krysa/Projects/localroots/components/reviews/review-summary.tsx` (new)
9. `/home/krysa/Projects/localroots/app/[locale]/products/[id]/page.tsx`
10. `/home/krysa/Projects/localroots/components/products/product-card.tsx`
11. `/home/krysa/Projects/localroots/app/[locale]/orders/[orderId]/page.tsx`
12. `/home/krysa/Projects/localroots/messages/en.json`
13. `/home/krysa/Projects/localroots/messages/es.json`
14. `/home/krysa/Projects/localroots/messages/fr.json`
15. `/home/krysa/Projects/localroots/types/index.ts`

## Key Design Decisions

- **Verified Purchases Only**: Reviews linked to orders, ensuring genuine customer feedback
- **One Review Per Product**: Unique constraint on userId + productId
- **Denormalized Ratings**: Store averageRating and reviewCount on Product for performance
- **Cascade Deletes**: If user/product/order deleted, reviews cascade delete
- **Server-Side Aggregation**: Calculate averages in server actions, not client-side
- **Dialog-based Forms**: Review forms open in dialogs, not separate pages

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Customer can review completed order products
- [ ] Cannot review same product twice
- [ ] Cannot review incomplete orders
- [ ] Product aggregates update correctly
- [ ] Star rating component works (display + input)
- [ ] Review form validation works
- [ ] Reviews display on product page
- [ ] Product cards show ratings
- [ ] Order page shows "Leave Review" button
- [ ] All translations work (en, es, fr)
- [ ] Edit/delete own reviews works
- [ ] Mobile responsive design

## Future Enhancements (Not in MVP)

- Review helpfulness voting
- Farmer responses to reviews
- Image uploads with reviews
- Email notifications for new reviews
- Review moderation/approval workflow

---

## Notes

This plan was created on 2025-12-10 and is ready for implementation. When you're ready to continue, just ask Claude to implement the reviews system following this plan.
