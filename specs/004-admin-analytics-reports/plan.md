# Implementation Plan: Admin Dashboard, Analytics & Reports

**Branch**: `004-admin-analytics-reports` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-admin-analytics-reports/spec.md`

## Summary

Build a full admin dashboard with fixed left sidebar
navigation, product CRUD with Cloudinary image upload,
order management with status transitions, per-size
inventory editing, delivery zone CRUD (migrated from
hardcoded to Firestore), and an analytics dashboard with
SVG charts (most viewed, conversion funnel, sales timeline,
top customers). NINO-branded but toned-down functional style.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+
**Primary Dependencies**: firebase v10+, @supabase/supabase-js v2, framer-motion v12+, next v16
**Storage**: Firestore (products, orders, delivery_zones), Supabase (events)
**Target Platform**: Next.js 16 App Router on Vercel
**Project Type**: Web application (admin dashboard)
**Performance Goals**: Page loads < 2s, analytics charts < 3s, CRUD operations < 1s
**Constraints**: No auth (Phase 14), desktop-first, SVG charts (no charting libraries), NINO-branded minimal style

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Visual Supremacy | JUSTIFIED | Toned-down for admin — NINO colors/fonts but functional layout. Storefront visual supremacy not applicable to admin |
| II. Motion With Purpose | PASS | Subtle animations for transitions and feedback only. No heavy motion in data-dense tables |
| III. Separation of Concerns | PASS | Firestore for CRUD data, Supabase for analytics, Cloudinary for images |
| IV. Performance-First | PASS | Paginated tables, SVG charts (no heavy lib), lazy-loaded analytics queries |
| V. Mobile-Native | JUSTIFIED | Desktop-first for admin (assumption). Basic mobile responsive for quick checks |
| VI. Typography | PASS | Outfit for labels/headings, DM Sans for data/inputs |
| VII. Data-Driven | PASS | Full analytics dashboard with 4 chart types + summary cards |
| VIII. Progressive Disclosure | PASS | Sidebar nav, expandable order details, tabbed product form |
| IX. Color as Identity | PASS | NINO palette throughout admin, status badges use semantic colors |
| X. Production-Grade | PASS | All CRUD operations have loading/success/error states, confirmation dialogs for deletes |

**Result**: All gates PASS (2 justified deviations for admin context).

## Project Structure

### New Files

```text
src/
├── app/admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── orders/page.tsx
│   ├── inventory/page.tsx
│   ├── delivery/page.tsx
│   └── analytics/page.tsx
├── components/admin/
│   ├── AdminSidebar.tsx
│   ├── AdminTable.tsx
│   ├── ProductForm.tsx
│   ├── ImageUploader.tsx
│   ├── OrderDetail.tsx
│   ├── StockEditor.tsx
│   ├── ZoneEditor.tsx
│   ├── BarChart.tsx
│   ├── FunnelChart.tsx
│   ├── LineChart.tsx
│   ├── SummaryCards.tsx
│   └── DateRangePicker.tsx
└── services/
    ├── analytics.ts
    └── delivery-zones.ts
```

### Modified Files

```text
src/
├── components/DeliverySelector.tsx  # Read zones from Firestore
└── components/CheckoutForm.tsx      # Fetch zones dynamically
```

## Implementation Phases

### Phase 1: Admin Infrastructure

1. Create admin layout with sidebar (`src/app/admin/layout.tsx`)
2. Create AdminSidebar component with nav links
3. Create admin redirect page (`/admin` → `/admin/products`)
4. Create reusable AdminTable component
5. Create delivery zone Firestore service

### Phase 2: Product Management (US1)

1. Product list page with AdminTable
2. ProductForm component (create + edit mode)
3. ImageUploader with drag-and-drop + Cloudinary upload
4. Create product page (`/admin/products/new`)
5. Edit product page (`/admin/products/[id]/edit`)
6. Delete product with confirmation dialog

### Phase 3: Order Management (US2)

1. Order list page with status badges and filters
2. OrderDetail expandable panel
3. Status update dropdown with transition validation

### Phase 4: Inventory Management (US3)

1. Inventory list page with stock indicators
2. StockEditor per-size input component
3. Bulk stock update functionality

### Phase 5: Delivery Zone Management (US4)

1. ZoneEditor CRUD component
2. Delivery zones page
3. Migrate checkout to read zones from Firestore
4. Seed existing hardcoded zones to Firestore

### Phase 6: Analytics Dashboard (US5)

1. Analytics service (Supabase queries + Firestore aggregation)
2. SummaryCards component
3. BarChart (most viewed products)
4. FunnelChart (conversion funnel)
5. LineChart (daily revenue)
6. Top customers table
7. DateRangePicker with presets
8. Analytics dashboard page composing all charts

### Phase 7: Polish

1. Build verification — zero TypeScript errors
2. Desktop + mobile responsive testing
3. All CRUD states verified (loading, success, empty, error)
4. Analytics empty states

## Parallel Opportunities

| Phase Group | Can Parallelize |
|-------------|----------------|
| Phase 1 (infrastructure) | Sequential — layout before pages |
| Phase 2 (products) + Phase 3 (orders) | Yes — independent pages |
| Phase 4 (inventory) + Phase 5 (delivery) | Yes — independent pages |
| Phase 6 (analytics) | After Phase 1. Chart components are parallel |
| Phase 7 (polish) | After all |

## Dependencies

### From previous features

- `src/lib/firebase.ts` — Firestore client
- `src/lib/supabase.ts` — Supabase client + trackEvent
- `src/services/products.ts` — Product CRUD
- `src/services/orders.ts` — Order management
- `src/app/api/upload/route.ts` — Cloudinary upload
- `src/lib/types.ts` — All entity types
- `src/components/DeliverySelector.tsx` — Will be modified

### New npm packages

None required — all functionality built with existing dependencies.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| No admin auth | Anyone can access `/admin` | Acceptable for development. Phase 14 adds auth |
| Cross-database analytics | Slow joins for revenue by product | Client-side join at current scale. Can optimize with denormalized views later |
| Cloudinary upload orphans | Unused images if form abandoned | Upload on submit, not on drop |
| Delivery zone migration | Checkout breaks during transition | Keep hardcoded fallback, read from Firestore with fallback |
