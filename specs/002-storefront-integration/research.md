# Research: Storefront Firebase Integration

**Date**: 2026-04-08
**Branch**: `002-storefront-integration`

## R1: Product Schema Extension Strategy

**Decision**: Extend the existing Product TypeScript interface
and Firestore schema with the fields needed by the storefront:
`description`, `colors`, `style`, `originalPrice`, `rating`,
`reviews`, `tag`. Change `stock` from `number` to a per-size
map `Record<string, number>`.

**Rationale**: The existing shop page mock data already uses
all these fields. Extending the schema means the frontend
components need minimal structural changes — only the data
source switches from mock to Firebase. The per-size stock
map enables FR-013 (disable out-of-stock sizes) without a
separate inventory service.

**Alternatives considered**:
- Separate inventory collection for per-size stock: Overkill
  for current scale. A map field on the product document is
  simpler and eliminates extra reads.
- Computed fields (rating from reviews subcollection):
  Premature optimization. A denormalized `rating` number
  on the product is sufficient until review volume justifies
  a separate collection.

---

## R2: Data Fetching Pattern for Landing Page

**Decision**: Use a React Server Component (RSC) to fetch
landing page products server-side, passing the data as props
to the client ProductCards component for animation.

**Rationale**: Server-side fetching for the landing page
avoids a client-side loading flash on first visit — the
products are embedded in the HTML. The ProductCards component
stays a client component for Framer Motion animations but
receives data as props instead of fetching internally.

**Alternatives considered**:
- Client-side fetch with useEffect: Causes a loading flash
  on every page visit. Poor for first impression.
- Static generation (SSG) with revalidation: Good for
  production but requires ISR setup. Can be added later as
  optimization.

---

## R3: Shop Page Data Fetching Pattern

**Decision**: Keep the shop page as a client component.
Use a custom React hook (`useProducts`) that wraps the
Firebase products service with state management for
pagination, filters, and sorting. The hook returns
`{ products, loading, error, hasMore, loadMore }`.

**Rationale**: The shop page has complex interactive state
(filters, sort, view mode, pagination cursor) that maps
naturally to a client component with a custom hook. Server
Components cannot manage this interactive state. The existing
`ProductsClient.tsx` is already a client component — the
architecture stays the same, only the data source changes.

**Alternatives considered**:
- Server Actions for each filter change: Higher latency per
  interaction, requires form submissions. Filters feel
  sluggish compared to instant client-side updates.
- React Query / SWR: Adds a dependency. The custom hook is
  lightweight and sufficient for cursor-based pagination.

---

## R4: Product Detail Page Architecture

**Decision**: Use Next.js App Router dynamic route at
`src/app/product/[id]/page.tsx`. The page component is a
Server Component that fetches the product by ID. Interactive
elements (image gallery, size selector, add-to-cart button)
are separate client components receiving product data as props.

**Rationale**: Server-side product fetch enables SEO (product
data in initial HTML). Interactive UI elements are isolated
as client components — only the parts that need interactivity
ship JavaScript. This aligns with Constitution Principle IV
(Performance-First: client components as leaf nodes).

**Alternatives considered**:
- Fully client-side page: Poor SEO, loading flash on every
  product visit.
- generateStaticParams for SSG: Requires knowing all product
  IDs at build time. Not feasible with a dynamic catalog.

---

## R5: Image Gallery Pattern

**Decision**: Desktop: main image + thumbnail strip below.
Click thumbnail to switch main image. Mobile: horizontal
swipeable carousel using Framer Motion drag gestures (matches
the existing Hero card deck pattern).

**Rationale**: Thumbnail gallery is the e-commerce standard
for desktop. The swipeable carousel matches the existing NINO
mobile interaction pattern (Hero MobileCardDeck uses the same
drag gesture approach). Keeps the codebase consistent.

---

## R6: Product Seeding for Development

**Decision**: Create a seed script at `src/scripts/seed.ts`
that populates Firebase with sample products matching the
extended schema. Run via `npx tsx src/scripts/seed.ts`.

**Rationale**: Manual product creation in the Firebase console
is tedious for 20+ products. A seed script ensures consistent
test data, is repeatable, and documents the expected schema by
example. Using `tsx` avoids build step for a one-off script.

---

## R7: Analytics Hook

**Decision**: Create a `useAnalytics` hook that wraps the
existing `trackEvent` function with session ID management
and convenience methods (`trackProductView`, `trackFilterApplied`).

**Rationale**: Centralizes analytics logic. Session ID
generation (random UUID stored in sessionStorage) is handled
once in the hook, not scattered across components. Follows
Constitution Principle VII (Data-Driven Decision Making).
