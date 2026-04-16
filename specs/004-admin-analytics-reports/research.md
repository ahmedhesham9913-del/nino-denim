# Research: Admin Dashboard, Analytics & Reports

**Date**: 2026-04-08
**Branch**: `004-admin-analytics-reports`

## R1: Admin Layout Architecture

**Decision**: Use a Next.js App Router layout at
`src/app/admin/layout.tsx` with a fixed left sidebar
component. The sidebar renders nav links for all admin
sections. The main content area uses `{children}` slot.

**Rationale**: App Router nested layouts are the native
pattern. A shared layout ensures the sidebar persists
across all admin pages without remounting. Each admin page
is a separate route (`/admin/products`, `/admin/orders`,
etc.) rendered in the main content area.

**Alternatives considered**:
- Single admin page with tab switching: Loses URL-based
  navigation and deep-linking.
- Client-side routing within admin: Fights against App
  Router conventions.

---

## R2: Charting Approach

**Decision**: Use lightweight SVG-based charts built with
basic HTML/CSS + Framer Motion for animations. For the bar
chart and line chart, use a thin wrapper around SVG elements.
No external charting library.

**Rationale**: The analytics dashboard needs only 4 chart
types: bar chart, funnel, line chart, and table. These are
simple enough to build with SVG + Framer Motion. Adding
Chart.js or Recharts would add 50-100KB to the bundle for
features we don't need. Constitution Principle IV requires
bundle size awareness.

**Alternatives considered**:
- Recharts: Full-featured but 100KB+. Overkill for 4 charts.
- Chart.js: Canvas-based, doesn't integrate well with
  React Server Components.
- Lightweight-charts: Trading-focused, wrong domain.

---

## R3: Delivery Zone Storage Migration

**Decision**: Create a Firestore `delivery_zones` collection.
Each zone is a document with `name` (string) and `fee`
(number). On app startup, the checkout flow reads from this
collection instead of the hardcoded constant. Keep the
constant file as a fallback default.

**Rationale**: Moving to Firestore allows the admin to
manage zones without code changes. The constant file remains
as a seed/fallback for when the collection is empty. Minimal
migration — just read from Firestore instead of the constant.

---

## R4: Admin Image Upload UX

**Decision**: Drag-and-drop zone using native HTML5 drag
events + file input fallback. Image previews shown as
thumbnails. Reorder via drag handles. Upload to Cloudinary
happens on form submit (not on drop) to avoid orphaned
uploads.

**Rationale**: HTML5 drag events are well-supported and
avoid extra dependencies. Uploading on submit (not on drop)
prevents orphaned Cloudinary images if the admin abandons
the form. Matches the existing `/api/upload` route.

---

## R5: Analytics Query Strategy

**Decision**: Use Supabase client SDK for analytics queries
(events table). Use Firebase client SDK for order queries
(orders collection). Cross-database metrics (like revenue
per product) are computed client-side by joining results
from both sources.

**Rationale**: Both clients already exist. Cross-database
joins must happen in the application since there's no shared
query engine. At the current data scale (< 10K events,
< 1K orders), client-side joining is fast enough. The date
range filter is applied at the query level in both databases.

---

## R6: Admin Table Pattern

**Decision**: Build a reusable `AdminTable` component with
sortable columns, pagination, and status filters. Each
admin section (products, orders, inventory) uses this
component with different column configurations.

**Rationale**: All three management sections (products,
orders, inventory) need tabular data with similar patterns.
A shared component reduces duplication. Column configs make
it flexible.

---

## R7: Product Form Architecture

**Decision**: Single `ProductForm` component used for both
create and edit. In create mode, all fields are empty. In
edit mode, fields are pre-populated from the existing
product. The form handles validation, image upload, and
submission.

**Rationale**: Create and edit forms are identical except
for initial values and the submit action (addDoc vs
updateDoc). A single component with a `product?: Product`
prop handles both cases cleanly.
