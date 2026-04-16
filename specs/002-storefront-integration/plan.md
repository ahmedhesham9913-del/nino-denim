# Implementation Plan: Storefront Firebase Integration

**Branch**: `002-storefront-integration` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-storefront-integration/spec.md`

## Summary

Wire the existing NINO JEANS frontend (landing page,
shop page) to the Firebase backend with real product data,
build the product detail page with dynamic routing, and
instrument analytics tracking. Extend the Product schema
with description, colors, style, pricing, ratings, and
per-size stock. Replace all hardcoded mock product data
with live Firebase queries using cursor-based pagination.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+
**Primary Dependencies**: firebase v10+, framer-motion v12+, next v16
**Storage**: Firebase Firestore (products collection, extended schema)
**Testing**: Manual verification via seeded products + dev server
**Target Platform**: Next.js 16 App Router on Vercel
**Project Type**: Web application (e-commerce storefront)
**Performance Goals**: Landing page < 2s, shop pagination < 1s, product detail < 2s
**Constraints**: No full collection fetches, client components as leaf nodes, preserve existing design system

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Visual Supremacy | PASS | Preserves editorial layout, asymmetric grids, 3D cards. Product detail page follows established patterns |
| II. Motion With Purpose | PASS | Framer Motion animations preserved. Image gallery uses signature easing. Skeleton loaders for transitions |
| III. Separation of Concerns | PASS | Firebase for data, Cloudinary for images, Supabase for analytics. No mixing |
| IV. Performance-First Commerce | PASS | Cursor pagination (12/page), server-side product fetch for detail page, lazy loading below fold |
| V. Mobile-Native, Desktop-Enhanced | PASS | Mobile swipe gallery, touch-first size selector, responsive grid. Desktop gets thumbnails + hover effects |
| VI. Typography as Architecture | PASS | Outfit for display, DM Sans for body. Product detail follows existing heading hierarchy |
| VII. Data-Driven Decision Making | PASS | `product_view` and `filter_applied` events tracked to Supabase |
| VIII. Progressive Disclosure | PASS | Product cards show essentials, expand on hover. Detail page reveals full info. Load More for pagination |
| IX. Color as Identity | PASS | NINO oklch palette throughout. No Tailwind defaults |
| X. Production-Grade Quality | PASS | All 4 states on every page (loading/success/empty/error). 404 for invalid product IDs. Fallback images |

**Result**: All 10 gates PASS.

## Project Structure

### Documentation

```text
specs/002-storefront-integration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technical decisions
├── data-model.md        # Extended product schema
├── quickstart.md        # Developer setup guide
├── contracts/
│   └── ui-contracts.md  # Component and hook contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (new + modified files)

```text
New files:
src/
├── app/product/[id]/
│   └── page.tsx                  # Product detail (server component)
├── components/
│   ├── ProductGallery.tsx        # Image gallery (client)
│   ├── SizeSelector.tsx          # Size picker with stock (client)
│   ├── AddToCartButton.tsx       # Add to cart UI placeholder (client)
│   ├── ProductDetailClient.tsx   # Client wrapper for detail page
│   ├── SkeletonProductCard.tsx   # Skeleton loader for product cards
│   └── SkeletonProductDetail.tsx # Skeleton loader for detail page
├── hooks/
│   ├── useProducts.ts            # Firebase product fetching + pagination
│   └── useAnalytics.ts           # Analytics event tracking
└── scripts/
    └── seed.ts                   # Firebase product seeder

Modified files:
src/
├── lib/types.ts                  # Extended Product interface
├── services/products.ts          # Updated queries for new fields
├── components/ProductCards.tsx    # Props-based data, links to detail
└── app/products/ProductsClient.tsx # Firebase hook replaces mock data
```

## Implementation Phases

### Phase 1: Schema & Types Update

**Files**: `src/lib/types.ts`, `src/services/products.ts`

1. Extend `Product` interface with: `description`, `colors`
   (ProductColor[]), `style`, `originalPrice`, `rating`,
   `reviews`, `tag`. Change `stock` to `Record<string, number>`.
2. Add `ProductColor` interface.
3. Update product service for new schema fields.

### Phase 2: Seed Script

**Files**: `src/scripts/seed.ts`

1. Create seed script populating Firebase with 25+ products.
2. Cover all categories, styles, colors. Vary stock levels.
3. Use Unsplash/Pexels image URLs.

### Phase 3: Custom Hooks

**Files**: `src/hooks/useProducts.ts`, `src/hooks/useAnalytics.ts`

1. `useProducts`: Firebase pagination, filter, sort, loadMore.
2. `useAnalytics`: session ID + trackProductView, trackFilterApplied.

### Phase 4: Skeleton Components

**Files**: `src/components/SkeletonProductCard.tsx`, `src/components/SkeletonProductDetail.tsx`

1. Skeleton loaders matching product card and detail layouts.
2. Pulse animation with NINO brand colors.

### Phase 5: Landing Page Integration (US1)

**Files**: `src/app/page.tsx`, `src/components/ProductCards.tsx`

1. Server-side fetch of featured products (top 6).
2. ProductCards accepts props instead of hardcoded data.
3. Loading/empty/error states. Links to `/product/{id}`.
4. Analytics: trackProductView on card visibility.

### Phase 6: Shop Page Integration (US2)

**Files**: `src/app/products/ProductsClient.tsx`

1. Replace mock data with `useProducts` hook.
2. Category/sort trigger new Firebase queries.
3. Style/color/size/price remain client-side filters.
4. "Load More" button. Skeleton loading states.
5. Product card links to `/product/{id}`.
6. Analytics: trackFilterApplied.

### Phase 7: Product Detail Page (US3)

**Files**: `src/app/product/[id]/page.tsx`, `src/components/ProductGallery.tsx`,
`src/components/SizeSelector.tsx`, `src/components/AddToCartButton.tsx`,
`src/components/ProductDetailClient.tsx`

1. Dynamic route with server-side product fetch.
2. 404 for invalid IDs.
3. Image gallery (thumbnails desktop, swipe mobile).
4. Size selector with per-size stock awareness.
5. Add to Cart button (visual only, cart deferred).
6. Skeleton loading state.
7. Analytics: trackProductView.

### Phase 8: Polish & Verification

1. Verify all 4 states on every page.
2. `npm run build` — zero errors.
3. Mobile responsive testing.
4. Analytics events in Supabase.
5. Confirm zero mock data in customer-facing pages.
6. Create Firestore composite indexes.

## Parallel Opportunities

| Phase Group | Can Parallelize |
|-------------|----------------|
| Phase 1 + Phase 2 | No — seed depends on types |
| Phase 3 + Phase 4 | Yes — independent files |
| Phase 5 + Phase 7 | Yes — independent pages |
| Phase 6 | Depends on Phase 3 (useProducts hook) |
| Phase 8 | Sequential — depends on all |

## Dependencies

### From 001-backend-foundation

- `src/lib/firebase.ts`, `src/lib/supabase.ts`, `src/lib/env.ts`
- `src/services/products.ts` (base CRUD, will be extended)
- `.env.local` with valid credentials

### Firestore Composite Indexes

Create before shop page queries:
1. `products`: `category` ASC + `created_at` DESC
2. `products`: `category` ASC + `price` ASC

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Index creation delay | Shop filters fail briefly | Create indexes in Phase 1 |
| Empty catalog | Empty states everywhere | Seed script in Phase 2 |
| Image URL mismatch | Broken images | Use same Unsplash/Pexels pattern |
| Filter state complexity | Stale results | Clear client filters on server query change |
