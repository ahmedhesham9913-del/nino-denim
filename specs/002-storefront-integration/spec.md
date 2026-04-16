# Feature Specification: Storefront Firebase Integration

**Feature Branch**: `002-storefront-integration`
**Created**: 2026-04-08
**Status**: Draft
**Input**: User description: "Plan.md phases 3-6: Cloudinary setup (done), Landing page, Shop page, Product page — wire existing frontend to Firebase backend"

## Clarifications

### Session 2026-04-08

- Q: What fields need to be added to the Product schema for the storefront? → A: Extend with `description`, `colors` (array of {name, hex}), `style`, `originalPrice`, `rating`, `reviews`, `tag`
- Q: How should stock be tracked — single number or per-size? → A: Per-size stock map: `{ "28": 5, "30": 0, "32": 12 }`
- Q: What pagination trigger for the shop page? → A: "Load More" button at bottom of grid

## User Scenarios & Testing

### User Story 1 - Landing Page Real Products (Priority: P1)

As a customer visiting the homepage, I need to see real
products from the store's catalog so that I can browse
current inventory and click through to purchase.

**Why this priority**: The landing page is the first
impression. Showing hardcoded placeholder data makes the
site feel like a demo. Real products from Firebase give
it credibility and allow the store owner to control what
customers see by managing their catalog.

**Independent Test**: Add 6+ products to Firebase with
Cloudinary image URLs. Visit the homepage. Verify that
the ProductCards section displays real products from
Firebase, not hardcoded mock data.

**Acceptance Scenarios**:

1. **Given** products exist in the Firebase catalog,
   **When** a customer visits the homepage, **Then** the
   ProductCards section displays up to 6 real products
   fetched from the database.
2. **Given** a product in Firebase has Cloudinary image
   URLs, **When** it appears on the landing page, **Then**
   the images load from the Cloudinary CDN with automatic
   format optimization.
3. **Given** a product is displayed on the landing page,
   **When** a customer clicks it or its "VIEW DETAILS"
   button, **Then** they are navigated to the product
   detail page for that product.
4. **Given** the Firebase database is temporarily
   unavailable, **When** the landing page loads, **Then**
   the product sections show a graceful loading state
   (skeleton screens) rather than crashing.
5. **Given** no products exist in Firebase yet, **When**
   the landing page loads, **Then** the product sections
   display an appropriate empty state with a message.

---

### User Story 2 - Shop Page with Real Data (Priority: P1)

As a customer browsing the shop, I need to see real products
from the store's Firebase catalog with working pagination,
filtering by category/size/color, and sorting so that I can
find exactly the jeans I want.

**Why this priority**: The shop page is the core commerce
experience. Without real data and working filters, customers
cannot discover or purchase products. This is the primary
revenue-driving page.

**Independent Test**: Populate Firebase with 20+ products
across multiple categories and sizes. Visit /products. Verify
products load from Firebase. Filter by "Women" category —
verify only women's products show. Click "Load more" — verify
next page loads without duplicates. Sort by price — verify
correct ordering.

**Acceptance Scenarios**:

1. **Given** products exist in Firebase, **When** a customer
   visits /products, **Then** the first page of products
   (12 items) loads from the database, not from mock data.
2. **Given** the first page is loaded, **When** the customer
   clicks the "Load More" button at the bottom of the grid,
   **Then** the next 12 products append below the existing
   ones using cursor-based pagination with no duplicates.
3. **Given** the shop page is loaded, **When** a customer
   selects the "Women" category filter, **Then** only
   products with category "Women" are displayed, fetched
   from Firebase with the filter applied server-side.
4. **Given** the shop page is loaded, **When** a customer
   selects a size filter (e.g., "30"), **Then** only
   products that include that size are displayed.
5. **Given** the shop page is loaded, **When** a customer
   sorts by "Price: Low to High", **Then** products are
   re-fetched from Firebase ordered by ascending price.
6. **Given** the shop page is loaded, **When** a customer
   clicks a product card, **Then** they are navigated to
   the product detail page.
7. **Given** filters return no matching products, **When**
   the results are empty, **Then** a helpful empty state is
   shown with a "Clear filters" action.
8. **Given** products are loading from Firebase, **When**
   the fetch is in progress, **Then** skeleton cards are
   displayed instead of a blank page or spinner.

---

### User Story 3 - Product Detail Page (Priority: P1)

As a customer who found a product they like, I need a
dedicated product page showing full details — images, sizes,
stock availability, price, and description — so that I can
make an informed purchase decision and select their size.

**Why this priority**: Without a product detail page, the
e-commerce flow is broken. Customers cannot view product
details or select a size. This page is the bridge between
browsing and purchasing.

**Independent Test**: Create a product in Firebase with
multiple Cloudinary images and sizes. Navigate to
`/product/{id}`. Verify all product details display
correctly. Select a size — verify it highlights. Click
"Add to Cart" — verify the button responds (cart state
is deferred to Phase 7, but the UI must be interactive).

**Acceptance Scenarios**:

1. **Given** a product exists in Firebase, **When** a
   customer navigates to `/product/{id}`, **Then** the
   product's full details are displayed: name, price,
   description, all images, available sizes, and stock
   status.
2. **Given** a product has multiple images, **When** the
   product page loads, **Then** all images are displayed
   in a gallery with the ability to browse between them
   (thumbnail selection or swipe on mobile).
3. **Given** a product has per-size stock data, **When** the
   customer views the size selector, **Then** all sizes
   are shown with sizes having zero stock visually disabled.
4. **Given** a customer selects a size, **When** they
   click the size button, **Then** it becomes visually
   highlighted as the active selection.
5. **Given** a customer is viewing the product page,
   **When** they click "Add to Cart", **Then** the button
   provides visual feedback (the actual cart logic is
   deferred to Phase 7 — this phase only wires the UI).
6. **Given** an invalid product ID is used in the URL,
   **When** the page loads, **Then** a 404 "Product not
   found" page is displayed.
7. **Given** a product has zero stock across all sizes,
   **When** the page loads, **Then** the "Add to Cart"
   button is disabled and a "Sold Out" indicator is shown.
8. **Given** the product page is loading, **When** data
   is being fetched, **Then** a skeleton layout is shown
   matching the page structure.

---

### User Story 4 - Analytics Event Tracking (Priority: P2)

As the store owner, I need customer browsing behavior
tracked so that I can understand which products get viewed,
which pages are popular, and how customers navigate the
store.

**Why this priority**: Analytics tracking should be wired
in as pages are built, not retrofitted later. Tracking from
day one gives the store owner data to inform product and
pricing decisions.

**Independent Test**: Visit the homepage, navigate to the
shop, filter by a category, click a product. Verify that
`product_view`, `filter_applied`, and page view events
appear in the Supabase events table.

**Acceptance Scenarios**:

1. **Given** the analytics system is connected, **When** a
   customer views a product on the landing page or shop,
   **Then** a `product_view` event is recorded with the
   product ID.
2. **Given** a customer is on the shop page, **When** they
   apply a filter (category, size, color, price), **Then** a
   `filter_applied` event is recorded with the filter details.
3. **Given** a customer visits the product detail page,
   **When** the page loads, **Then** a `product_view` event
   is recorded with the product ID and source page.
4. **Given** analytics tracking is active, **When** the
   Supabase service is unavailable, **Then** event tracking
   fails silently without affecting the customer experience.

---

### Edge Cases

- What happens when a product is deleted from Firebase while
  a customer is viewing the shop page? The product should
  disappear on next fetch, not cause errors.
- What happens when a product's images are missing or broken
  Cloudinary URLs? A fallback placeholder image MUST display.
- What happens when the customer navigates directly to
  `/product/nonexistent-id`? A styled 404 page MUST display.
- What happens when Firebase returns an error during
  pagination? The current page should remain visible with
  an inline error message and retry option.
- What happens when screen resizes between mobile and desktop
  during shop page browsing? Filters and layout MUST adapt
  without losing the current filter state.

## Requirements

### Functional Requirements

- **FR-001**: Landing page ProductCards section MUST fetch
  and display real products from the database, not
  hardcoded mock data.
- **FR-002**: Landing page MUST show a loading skeleton
  while products are being fetched.
- **FR-003**: Landing page product cards MUST link to the
  product detail page.
- **FR-004**: Shop page MUST fetch products from the
  database using cursor-based pagination (12 products per
  page, no full collection fetches). A "Load More" button
  at the bottom of the grid triggers loading the next page.
- **FR-005**: Shop page MUST support server-side filtering
  by category (`Men`, `Women`, `Kids`, `Unisex`).
- **FR-006**: Shop page MUST support client-side filtering
  by size, color, and price range.
- **FR-007**: Shop page MUST support sorting by newest,
  price ascending, price descending, and popularity.
- **FR-008**: Shop page MUST show skeleton loading states
  during data fetches.
- **FR-009**: Shop page MUST display a helpful empty state
  when no products match the active filters.
- **FR-010**: Product detail page MUST be accessible via
  dynamic URL (`/product/{id}`).
- **FR-011**: Product detail page MUST display: product
  name, price, description, image gallery, size selector,
  stock status, and "Add to Cart" button.
- **FR-012**: Product detail page image gallery MUST
  support browsing multiple images (thumbnails on desktop,
  swipe on mobile).
- **FR-013**: Product detail page MUST visually disable
  sizes that have zero stock (using per-size stock data).
- **FR-014**: Product detail page MUST show a 404 page
  for invalid product IDs.
- **FR-015**: Product detail page MUST show a skeleton
  loading state while data is fetched.
- **FR-016**: All product images MUST display through the
  CDN with automatic format optimization.
- **FR-017**: All product cards (landing page and shop)
  MUST navigate to the product detail page when clicked.
- **FR-018**: Analytics events MUST be tracked for
  `product_view` and `filter_applied` interactions.
- **FR-019**: Analytics tracking MUST be non-blocking and
  fail silently.
- **FR-020**: All pages MUST maintain the existing design
  system (NINO brand colors, typography, animations).
- **FR-021**: Product schema MUST be extended with:
  `description` (string), `colors` (array of {name, hex}),
  `style` (string), `originalPrice` (number), `rating`
  (number), `reviews` (number), `tag` (string, optional).
- **FR-022**: Product `stock` field MUST be changed from a
  single number to a per-size map (e.g.,
  `{ "28": 5, "30": 0, "32": 12 }`) to enable per-size
  availability tracking.

### Key Entities

- **Product** (extended): Fetched from the database via
  the products service. Schema expanded with: `description`,
  `colors` (array of {name, hex}), `style`, `originalPrice`,
  `rating`, `reviews`, `tag`, and `stock` changed to a
  per-size map. Displayed across landing page, shop page,
  and product detail page.
- **Analytics Event** (existing): Tracked to the analytics
  database for browsing behavior.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Landing page loads real products from the
  database within 2 seconds on a standard connection.
- **SC-002**: Shop page displays the first 12 products
  within 2 seconds; subsequent pages load within 1 second.
- **SC-003**: Filtering and sorting on the shop page
  returns results within 1 second.
- **SC-004**: Product detail page loads full product data
  (including images) within 2 seconds.
- **SC-005**: Zero hardcoded mock product data remains in
  the customer-facing storefront pages.
- **SC-006**: 100% of product card clicks successfully
  navigate to the correct product detail page.
- **SC-007**: All four page states (loading, success,
  empty, error) are implemented on every data-fetching
  page.
- **SC-008**: Analytics events are recorded for at least
  90% of product views (allowing for network failures).

## Assumptions

- The Firebase backend foundation (001-backend-foundation)
  is complete and all three service clients are operational.
- Products will be seeded into Firebase manually or via a
  seed script before testing — this spec does not cover
  product seeding or admin dashboard functionality (Phase 10).
- The "Add to Cart" button on the product detail page will
  show visual feedback but will NOT implement actual cart
  state management — that is deferred to Phase 7 (Cart
  System).
- The existing landing page editorial sections
  (FeaturedCollection, DenimJourney, BrandStory,
  SocialProof, Newsletter) will retain their current
  hardcoded content as brand/editorial content — only the
  ProductCards section is wired to live data.
- EditorialLookbook component retains its current design
  with model images and featured product highlights — it
  will be wired to live data in a future iteration.
- Product descriptions are stored as plain text strings in
  Firebase (no rich text or markdown).
- The existing shop page design, animations, and filter UI
  are preserved — only the data source changes from mock
  to Firebase.
