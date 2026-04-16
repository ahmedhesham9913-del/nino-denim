# Tasks: Storefront Firebase Integration

**Input**: Design documents from `specs/002-storefront-integration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Extend the Product schema and seed Firebase with test data.

- [x] T001 Update `src/lib/types.ts` — extend `Product` interface with new fields: `description` (string), `colors` (ProductColor[]), `style` (string), `originalPrice` (number), `rating` (number), `reviews` (number), `tag` (optional string). Change `stock` from `number` to `Record<string, number>`. Add `ProductColor` interface `{ name: string; hex: string }`. Remove the old single-number stock type.
- [x] T002 Update `src/services/products.ts` — adjust `createProduct`, `updateProduct`, and `getProducts` to handle the extended schema fields (colors, style, originalPrice, rating, reviews, tag, per-size stock map). Add support for `orderBy('price')` and `orderBy('rating')` sort options in `getProducts`.
- [x] T003 Create `src/scripts/seed.ts` — seed script that populates Firebase `products` collection with 25+ realistic products. Cover all 4 categories (Men, Women, Kids, Unisex), multiple styles (Slim Fit, Straight, Bootcut, etc.), 3-4 colors each, various sizes with per-size stock (include some sizes at 0). Use Unsplash/Pexels image URLs matching the existing pattern. Run via `npx tsx src/scripts/seed.ts`. Include `--clean` flag to clear existing products first.

**Checkpoint**: `npx tsx src/scripts/seed.ts` populates Firebase with 25+ products. Types compile without errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared hooks and skeleton components used by all user stories.

**CRITICAL**: User story pages depend on these hooks and skeleton components.

- [x] T004 Create `src/hooks/useProducts.ts` — custom hook wrapping Firebase products service. Interface: `useProducts({ category?, sortBy?, pageSize? })` returns `{ products, loading, error, hasMore, loadMore, reset }`. Manages pagination cursor internally. Triggers new Firebase query on category/sort change. Appends results on `loadMore()`.
- [x] T005 [P] Create `src/hooks/useAnalytics.ts` — custom hook wrapping `trackEvent` from `src/lib/supabase.ts`. Manages session ID (random UUID in sessionStorage). Exports `trackProductView(productId, source?)` and `trackFilterApplied(filters)`.
- [x] T006 [P] Create `src/components/SkeletonProductCard.tsx` — skeleton loader matching the exact layout of a product card (image area aspect-[3/4], name line, price line, color dots). Use pulse animation with `bg-nino-100/60` on `warm-white` background. Accepts `featured?: boolean` prop for larger variant.
- [x] T007 [P] Create `src/components/SkeletonProductDetail.tsx` — skeleton loader matching the product detail page layout (image gallery area, title, price, description lines, size buttons, add-to-cart button). Use pulse animation with NINO brand colors.

**Checkpoint**: Hooks return correct TypeScript types. Skeleton components render without errors.

---

## Phase 3: User Story 1 — Landing Page Real Products (Priority: P1)

**Goal**: ProductCards section on the homepage displays real products from Firebase instead of hardcoded mock data.

**Independent Test**: Seed Firebase with 6+ products. Visit `/`. Verify ProductCards shows real products. Click a product card — navigates to `/product/{id}`.

### Implementation for User Story 1

- [x] T008 [US1] Modify `src/components/ProductCards.tsx` — change from hardcoded inline `products` array to accepting a `products` prop of type `Product[]` (from `src/lib/types.ts`). Keep the existing 3D tilt card design, hover effects, shine sweep, and all animations. Add product card `Link` wrapping to `/product/{product.id}`. Show `SkeletonProductCard` components when `products` prop is empty/undefined. Add empty state message when products array is explicitly empty. Use the new `colors` field from Product for color dots. Derive discount from `price` vs `originalPrice`.
- [x] T009 [US1] Modify `src/app/page.tsx` — import `getProducts` from `src/services/products.ts` and fetch the top 6 products server-side (sorted by `created_at` desc, limit 6). Pass the fetched products as props to `<ProductCards products={products} />`. Wrap in error boundary — on fetch failure, pass empty array so ProductCards shows empty state.
- [x] T010 [US1] Wire analytics in `src/components/ProductCards.tsx` — import `useAnalytics` hook and call `trackProductView(product.id, 'landing')` when a product card enters the viewport (use Framer Motion `whileInView` callback or `useInView`).

**Checkpoint**: US1 complete — landing page shows real Firebase products with existing design preserved. Cards link to `/product/{id}`. Analytics events tracked.

---

## Phase 4: User Story 2 — Shop Page with Real Data (Priority: P1)

**Goal**: Shop page fetches products from Firebase with cursor pagination, category/sort via Firebase queries, and client-side filtering for size/color/price.

**Independent Test**: Seed 20+ products. Visit `/products`. Verify 12 products load from Firebase. Filter by "Women" — only women's products. Click "Load More" — 12 more append. Sort by price — correct order.

### Implementation for User Story 2

- [x] T011 [US2] Modify `src/app/products/ProductsClient.tsx` — replace `import { products as allProducts, ... } from "@/lib/products"` with the `useProducts` hook from `src/hooks/useProducts.ts`. Wire category filter buttons to trigger `reset()` and re-fetch with new category. Wire sort dropdown to trigger `reset()` and re-fetch with new sort. Keep style, color, size, price filters as client-side filters on the `products` array returned by the hook. Replace the current full product grid with skeleton cards (from `SkeletonProductCard`) during `loading` state.
- [x] T012 [US2] Add "Load More" button to `src/app/products/ProductsClient.tsx` — render a styled "Load More" button at the bottom of the product grid when `hasMore` is true. On click, call `loadMore()` from the hook. Show a loading indicator on the button while fetching. Hide the button when `hasMore` is false or during initial load.
- [x] T013 [US2] Update product cards in `src/app/products/ProductsClient.tsx` — wrap each `ProductCard` in a `Link` to `/product/{product.id}`. Update the `ProductCard` component to use the extended Product type (per-size stock, colors as ProductColor[], style, originalPrice, rating, reviews, tag).
- [x] T014 [US2] Wire analytics in `src/app/products/ProductsClient.tsx` — import `useAnalytics` hook. Call `trackFilterApplied` when any filter (category, style, color, size, price) changes. Call `trackProductView` when a product card enters the viewport.
- [x] T015 [US2] Add error state to `src/app/products/ProductsClient.tsx` — when `error` is returned from the hook, display an inline error message with a "Retry" button that calls `reset()`. Keep existing filter state visible so the customer doesn't lose context.

**Checkpoint**: US2 complete — shop page shows Firebase products, pagination works, filters work, sorting works, all 4 states implemented.

---

## Phase 5: User Story 3 — Product Detail Page (Priority: P1)

**Goal**: Dynamic `/product/[id]` page showing full product details with image gallery, size selector, and add-to-cart button.

**Independent Test**: Seed a product with 3+ images and mixed stock. Navigate to `/product/{id}`. Verify all details display. Select a size. Click "Add to Cart" — visual feedback. Navigate to `/product/fake-id` — 404 page.

### Implementation for User Story 3

- [x] T016 [P] [US3] Create `src/components/ProductGallery.tsx` — client component accepting `images: string[]` and `productName: string` props. Desktop: large main image + horizontal thumbnail strip below; clicking thumbnail switches main image with crossfade animation. Mobile: horizontal swipeable carousel using Framer Motion drag (similar to Hero MobileCardDeck pattern). All images use `next/image` with Cloudinary URLs and appropriate `sizes` prop. Fallback placeholder for broken image URLs.
- [x] T017 [P] [US3] Create `src/components/SizeSelector.tsx` — client component accepting `sizes: string[]`, `stock: Record<string, number>`, `selectedSize: string | null`, and `onSelect: (size: string) => void`. Render size buttons in a flex row. Sizes with `stock[size] === 0` are visually disabled (muted color, no pointer). Selected size is highlighted with `bg-nino-950 text-white`. Use Framer Motion `whileTap` for feedback. Show stock count below each size button (e.g., "3 left" for low stock).
- [x] T018 [P] [US3] Create `src/components/AddToCartButton.tsx` — client component accepting `disabled: boolean` and `onAdd: () => void`. Full-width button styled with `bg-nino-600 text-white`. Disabled state shows "SOLD OUT" with `bg-nino-200 text-nino-400`. On click, show brief scale animation + text change to "ADDED!" for 1.5s then revert (visual feedback only — cart logic deferred to Phase 7).
- [x] T019 [US3] Create `src/components/ProductDetailClient.tsx` — client wrapper component accepting full `Product` as prop. Manages state: `selectedSize`, gallery current image. Composes `ProductGallery`, `SizeSelector`, `AddToCartButton`, and product info (name, price, originalPrice with discount, description, rating stars, review count, category/style badges). Layout: 2-column on desktop (gallery left 7-col, info right 5-col), stacked on mobile. Follow NINO design system (Outfit headings, DM Sans body, nino color palette, signature animations).
- [x] T020 [US3] Create `src/app/product/[id]/page.tsx` — server component. Fetch product by ID using `getProductById` from `src/services/products.ts`. If product is null, call `notFound()` to trigger Next.js 404. If product exists, render `ProductDetailClient` with product data, `Navbar` (already in layout), and `Footer`. Include page metadata (title: product name, description). Show `SkeletonProductDetail` during loading via Suspense.
- [x] T021 [US3] Create `src/app/product/[id]/not-found.tsx` — styled 404 page matching NINO design. Show "Product Not Found" heading, brief message, and a "Back to Shop" link to `/products`. Use Outfit font, nino-950 text, warm-white background.
- [x] T022 [US3] Wire analytics in `src/components/ProductDetailClient.tsx` — import `useAnalytics` hook and call `trackProductView(product.id, 'detail')` on component mount (useEffect).

**Checkpoint**: US3 complete — product detail page works with gallery, size selector, add-to-cart feedback, 404 for invalid IDs, skeleton loading.

---

## Phase 6: User Story 4 — Analytics Event Tracking (Priority: P2)

**Goal**: Analytics events are tracked across all pages for product views and filter interactions.

**Independent Test**: Browse landing page, shop page, and product detail. Check Supabase `events` table — verify `product_view` and `filter_applied` events with correct product IDs and metadata.

### Implementation for User Story 4

- [x] T023 [US4] Verify analytics integration across all pages — confirm `trackProductView` fires on landing page (T010), shop page (T014), and product detail (T022). Confirm `trackFilterApplied` fires on shop page (T014). Check Supabase `events` table for correct event data (event_type, product_id, session_id, metadata).
- [x] T024 [US4] Add error resilience test — temporarily set an invalid Supabase URL in `.env.local`, browse the site, confirm no errors appear in the UI and pages function normally. Restore correct URL after test.

**Checkpoint**: US4 complete — analytics events flow to Supabase without affecting UX.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and build validation.

- [x] T025 [P] Run `npm run build` and confirm zero TypeScript errors across all new and modified files
- [x] T026 [P] Verify all 4 page states (loading, success, empty, error) work on: landing page ProductCards, shop page, and product detail page
- [x] T027 Test mobile responsive behavior on all three pages — verify swipe gallery on product detail, bottom-sheet filters on shop, and single-column stacking on landing page
- [x] T028 Confirm zero hardcoded mock product data remains in customer-facing pages — verify `src/components/ProductCards.tsx` no longer has inline product arrays, verify `src/app/products/ProductsClient.tsx` no longer imports from `@/lib/products`
- [x] T029 Create Firestore composite indexes if not already created: `products` (category ASC + created_at DESC), `products` (category ASC + price ASC). Follow Firebase console prompts if queries fail.
- [x] T030 Run through `quickstart.md` end-to-end verification steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001-T002 (types + service update)
- **US1 (Phase 3)**: Depends on Phase 2 (hooks + skeletons)
- **US2 (Phase 4)**: Depends on Phase 2 (useProducts hook critical)
- **US3 (Phase 5)**: Depends on T001 (types) + T007 (skeleton). Independent of US1/US2
- **US4 (Phase 6)**: Depends on US1-US3 analytics wiring (T010, T014, T022)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Needs T004 (useProducts hook is NOT used — server fetch instead), T006 (skeletons). Can start after Phase 2
- **US2 (P1)**: Needs T004 (useProducts hook), T005 (analytics), T006 (skeletons). Can start after Phase 2
- **US3 (P1)**: Needs T001 (types), T005 (analytics), T007 (skeleton). Can start in parallel with US1/US2
- **US4 (P2)**: Verification-only phase. Depends on analytics wiring in US1-US3

### Parallel Opportunities

```
Phase 1:
  T001 → T002 → T003 (sequential: each depends on prior)

Phase 2:
  T004 ─── T005 ─── T006 ─── T007 (all parallel: different files)

Phase 3 + Phase 5 (after Phase 2):
  T008 ─── T016 ─── T017 ─── T018 (parallel: different components)
  T009 ─── T019 (sequential within story)
  T010 ─── T020 ─── T021 ─── T022 (parallel mix)

Phase 4 (after Phase 2):
  T011 → T012 → T013 → T014 → T015 (mostly sequential: same file)

Phase 7:
  T025 ─── T026 (parallel)
  T027 → T028 → T029 → T030 (sequential verification)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: US1 Landing Page (T008-T010)
4. **STOP and VALIDATE**: Landing page shows real Firebase products
5. This gives you a live landing page with real data

### Incremental Delivery

1. Setup + Foundational → Types, seed, hooks, skeletons ready
2. US1 → Landing page live with real products
3. US2 → Shop page live with pagination and filters
4. US3 → Product detail page with gallery and size selector
5. US4 → Analytics verified across all pages
6. Each story adds capability without breaking previous stories

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Phase 2 done:
   - Developer A: US1 (landing page) + US2 (shop page)
   - Developer B: US3 (product detail page)
3. US4 (analytics verification) after both complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- T003 (seed script) must run BEFORE testing any user story
- T016-T018 (gallery, size selector, add-to-cart) are parallel — all different component files
- T011-T015 are mostly sequential because they all modify `ProductsClient.tsx`
- The existing `src/lib/products.ts` mock data file can be kept for reference but should no longer be imported by customer-facing pages
- Firestore composite indexes (T029) may be auto-suggested by Firebase when queries first run
