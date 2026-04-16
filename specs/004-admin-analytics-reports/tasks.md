# Tasks: Admin Dashboard, Analytics & Reports

**Input**: Design documents from `specs/004-admin-analytics-reports/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Create admin layout infrastructure, shared components, and services.

- [x] T001 Create `src/app/admin/layout.tsx` — admin layout with fixed left sidebar (260px) + main content area. Sidebar uses `AdminSidebar` component. Main area renders `{children}` with padding. NINO-branded but toned-down: warm-white background, nino-950 sidebar bg, Outfit font for nav labels. Mobile: sidebar collapses behind hamburger toggle.
- [x] T002 Create `src/components/admin/AdminSidebar.tsx` — fixed left sidebar component. Small NINO JEANS logo at top. Vertical nav links with icons (SVG): Products (box), Orders (clipboard), Inventory (package), Delivery (truck), Analytics (chart). Active link: `bg-white/10 text-white`. Inactive: `text-white/40 hover:text-white/70`. Current route detected via `usePathname()` from `next/navigation`.
- [x] T003 Create `src/app/admin/page.tsx` — redirect page. Use `redirect('/admin/products')` from `next/navigation` to auto-redirect `/admin` to the products section.
- [x] T004 [P] Create `src/components/admin/AdminTable.tsx` — reusable data table component. Props: `columns: Column[]` (key, label, render function, sortable, width), `data: T[]`, `loading`, `emptyMessage`, `onRowClick`, `pagination` (hasMore, onLoadMore, loading). Renders: column headers, data rows, loading skeleton rows, empty state, "Load More" button. NINO style: clean borders, `font-[var(--font-display)]` for headers, `font-[var(--font-body)]` for data cells.
- [x] T005 [P] Create `src/services/delivery-zones.ts` — Firestore CRUD for `delivery_zones` collection. Functions: `getZones()`, `addZone({ name, fee })`, `updateZone(id, data)`, `deleteZone(id)`. Import Firestore utilities from `@/lib/firebase`.
- [x] T006 [P] Create `src/services/analytics.ts` — analytics query service. Functions: `getSummaryCards(date)` (orders today, revenue today from Firestore, views today from Supabase, conversion rate), `getMostViewed(start, end)` (top 10 products by view count from Supabase, resolve names from Firestore), `getConversionFunnel(start, end)` (product_view > add_to_cart > checkout_started > order_created counts from Supabase), `getDailyRevenue(start, end)` (daily total_price from Firestore orders), `getTopCustomers(start, end)` (group orders by customer.phone, sum total_price, count orders).

**Checkpoint**: Admin layout renders with sidebar. AdminTable component works. Services compile.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared admin components used by multiple user stories.

- [x] T007 Create `src/components/admin/ImageUploader.tsx` — drag-and-drop image upload component. Props: `images: (File | string)[]`, `onChange`, `maxImages` (default 8). HTML5 drag events + file input fallback. Shows thumbnail previews (existing URLs + new File previews). Drag handles for reorder. Remove button on each. Drop zone with dashed border and upload icon. Files are NOT uploaded to Cloudinary here — that happens on form submit.
- [x] T008 [P] Create `src/components/admin/DateRangePicker.tsx` — date range filter component. Props: `startDate`, `endDate`, `onChange`, `presets`. Presets: "Today", "Last 7 Days", "Last 30 Days", "This Month". Two date inputs + preset buttons. NINO Outfit font.

**Checkpoint**: ImageUploader handles drag-and-drop with previews. DateRangePicker shows presets.

---

## Phase 3: User Story 1 — Product Management (Priority: P1)

**Goal**: Full product CRUD with image upload in the admin dashboard.

**Independent Test**: Visit `/admin/products`. See product list. Click "Add Product". Fill form, upload 3 images, save. Verify product appears in shop. Edit price. Delete product.

### Implementation for User Story 1

- [x] T009 [US1] Create `src/components/admin/ProductForm.tsx` — create/edit product form. Props: `product?: Product` (undefined = create mode), `onSubmit`, `onCancel`. Fields: name (text), description (textarea), price (number), originalPrice (number), category (select: Men/Women/Kids/Unisex), style (text), sizes (multi-select checkboxes), colors (dynamic add: name + hex color picker), tag (select: New/Sale/Bestseller/Limited/Trending/none), stock per size (number inputs for each selected size). Includes ImageUploader for product images. On submit: upload new image files to Cloudinary via `POST /api/upload`, then create/update product in Firestore with all data including Cloudinary URLs. Inline validation for required fields.
- [x] T010 [US1] Create `src/app/admin/products/page.tsx` — product list page. Fetch products using `getProducts` from `@/services/products` with pagination. Render AdminTable with columns: image thumbnail (40x40), name, category, price (EGP), total stock, tag badge, actions (Edit link, Delete button). "Add Product" button linking to `/admin/products/new`. Delete with confirmation dialog.
- [x] T011 [US1] Create `src/app/admin/products/new/page.tsx` — create product page. Renders ProductForm in create mode. On submit success: redirect to `/admin/products` with success message. On cancel: navigate back to product list.
- [x] T012 [US1] Create `src/app/admin/products/[id]/edit/page.tsx` — edit product page. Fetch product by ID. Render ProductForm with pre-populated data. On submit success: redirect to `/admin/products`. On product not found: show error.

**Checkpoint**: US1 complete — products can be created, listed, edited, and deleted from the admin.

---

## Phase 4: User Story 2 — Order Management (Priority: P1)

**Goal**: View all orders, see details, and update fulfillment status.

**Independent Test**: Visit `/admin/orders`. See all orders. Click an order — detail panel opens. Change status from "pending" to "confirmed". Filter by "pending" — only pending orders shown.

### Implementation for User Story 2

- [x] T013 [P] [US2] Create `src/components/admin/OrderDetail.tsx` — expandable order detail panel. Props: `order: Order`, `onStatusChange`. Shows: customer name/phone/address/email, items list (name, size, qty, unit price, line total), delivery zone + fee, total price, status badge (color-coded), status change dropdown with only valid transitions (from constitution's STATUS_TRANSITIONS map). Inline error for invalid transitions.
- [x] T014 [US2] Create `src/app/admin/orders/page.tsx` — order list page. Fetch orders using `getOrders` from `@/services/orders` with pagination. Render AdminTable with columns: order ID (truncated), customer name, items count, total (EGP), status badge, date. Status filter tabs at top: All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled. Click row expands OrderDetail below. Status change in OrderDetail calls `updateOrderStatus` and refreshes the list.

**Checkpoint**: US2 complete — orders listed, filtered by status, details viewable, status updatable.

---

## Phase 5: User Story 3 — Inventory Management (Priority: P2)

**Goal**: View and update per-size stock levels for all products.

**Independent Test**: Visit `/admin/inventory`. Find a product. Click it. Change size "32" stock from 5 to 15. Save. Verify product detail page shows updated stock.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create `src/components/admin/StockEditor.tsx` — per-size stock editing component. Props: `sizes: string[]`, `stock: Record<string, number>`, `onChange`, `onSave`, `saving`. Renders a row per size: size label, number input for stock, visual indicator (green = in stock, yellow = low <= 5, red = 0). "Save" button. Calculates and shows total stock.
- [x] T016 [US3] Create `src/app/admin/inventory/page.tsx` — inventory list page. Fetch products with `getProducts`. Render AdminTable with columns: name, category, total stock, stock status indicator (In Stock / Low Stock / Out of Stock). Click row opens inline StockEditor below. Save calls `updateProduct(id, { stock })` from `@/services/products`.

**Checkpoint**: US3 complete — stock viewable and editable per size from admin.

---

## Phase 6: User Story 4 — Delivery Zone Management (Priority: P2)

**Goal**: CRUD for delivery zones, migrated from hardcoded to Firestore.

**Independent Test**: Visit `/admin/delivery`. See 3 existing zones. Edit Cairo fee to 35 EGP. Add "Hurghada" zone at 100 EGP. Delete it. Verify checkout shows updated zones.

### Implementation for User Story 4

- [x] T017 [P] [US4] Create `src/components/admin/ZoneEditor.tsx` — delivery zone CRUD component. Props: `zones`, `onAdd`, `onEdit`, `onDelete`. Renders zone list as editable cards: name (text input), fee (number input) in EGP. Add zone button with inline form. Edit in-place. Delete with confirmation. NINO clean style.
- [x] T018 [US4] Create `src/app/admin/delivery/page.tsx` — delivery zone management page. Fetches zones from `src/services/delivery-zones.ts`. Renders ZoneEditor. CRUD operations call the delivery zone service.
- [x] T019 [US4] Create `src/scripts/seed-zones.ts` — seed script that populates Firestore `delivery_zones` collection with the 3 default zones (Cairo 30, Giza/Alexandria 50, Other Governorates 80). Run via `npx tsx --env-file=.env.local src/scripts/seed-zones.ts`.
- [x] T020 [US4] Update `src/components/DeliverySelector.tsx` — change from importing hardcoded `DELIVERY_ZONES` constant to fetching zones from Firestore via `getZones()` from `@/services/delivery-zones.ts`. Add loading state while zones fetch. Fallback to hardcoded constant if Firestore fetch fails.

**Checkpoint**: US4 complete — zones manageable from admin. Checkout reads from Firestore.

---

## Phase 7: User Story 5 — Analytics Dashboard (Priority: P2)

**Goal**: Visual analytics dashboard with charts, summary cards, and date filtering.

**Independent Test**: Visit `/admin/analytics`. See today's summary cards. View most viewed products bar chart. View conversion funnel. View sales timeline for last 30 days. View top customers table. Change date range — all charts update.

### Implementation for User Story 5

- [x] T021 [P] [US5] Create `src/components/admin/SummaryCards.tsx` — four KPI cards in a grid. Props: `data: { ordersToday, revenueToday, viewsToday, conversionRate }`, `loading`. Cards: "Orders Today" (number), "Revenue Today" (EGP), "Views Today" (number), "Conversion Rate" (percentage). Loading state with pulse animation. NINO style: white cards, nino-950 values, nino-600 labels.
- [x] T022 [P] [US5] Create `src/components/admin/BarChart.tsx` — SVG bar chart for most viewed products. Props: `data: { label, value }[]`, `maxBars`. Horizontal bars with labels and value counts. NINO nino-500 bar color. Animated bar width on mount via Framer Motion.
- [x] T023 [P] [US5] Create `src/components/admin/FunnelChart.tsx` — conversion funnel visualization. Props: `stages: { label, count }[]`. Horizontal funnel with decreasing widths. Each stage shows: label, count, and percentage of first stage. Colors: nino-500 gradient from full to light. Animated widths.
- [x] T024 [P] [US5] Create `src/components/admin/LineChart.tsx` — SVG line chart for daily revenue. Props: `data: { date, value }[]`, `label`. SVG path with gradient fill below. X-axis: dates. Y-axis: values (EGP). Hover tooltip showing date + value. NINO nino-500 line color.
- [x] T025 [US5] Create `src/app/admin/analytics/page.tsx` — analytics dashboard page. Composes: DateRangePicker at top (default: last 30 days), SummaryCards, BarChart (most viewed), FunnelChart (conversion), LineChart (daily revenue), AdminTable (top customers: name, phone, total spent, order count). Fetches all data via `src/services/analytics.ts`. Loading states for each section. Empty states when no data.

**Checkpoint**: US5 complete — full analytics dashboard with live data from Supabase + Firestore.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, responsive testing, state coverage.

- [x] T026 [P] Run `npm run build` and confirm zero TypeScript errors across all new admin files
- [x] T027 [P] Verify all admin CRUD operations have proper loading, success, and error states: product create/edit/delete, order status change, stock update, zone add/edit/delete
- [x] T028 Test desktop layout: sidebar + content area renders correctly at 1200px+ width
- [x] T029 Test mobile responsive: sidebar collapses, content is usable on 375px width
- [x] T030 Verify analytics empty states: each chart shows a helpful message when no data exists
- [x] T031 Run seed-zones script and verify checkout reads zones from Firestore
- [x] T032 Full end-to-end: create product in admin → appears on shop → place order → order appears in admin → update status → view analytics

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (layout must exist)
- **US1 (Phase 3)**: Depends on Phase 2 (ImageUploader, AdminTable)
- **US2 (Phase 4)**: Depends on Phase 1 (AdminTable). Independent of US1
- **US3 (Phase 5)**: Depends on Phase 1 (AdminTable). Independent of US1/US2
- **US4 (Phase 6)**: Depends on Phase 1 (layout). Independent of US1-US3
- **US5 (Phase 7)**: Depends on Phase 1 (layout) + T006 (analytics service) + T008 (DateRangePicker)
- **Polish (Phase 8)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Needs ImageUploader (T007), AdminTable (T004)
- **US2 (P1)**: Needs AdminTable (T004). Can run parallel with US1
- **US3 (P2)**: Needs AdminTable (T004). Can run parallel with US1/US2
- **US4 (P2)**: Independent — just needs layout + zone service
- **US5 (P2)**: Needs analytics service (T006) + DateRangePicker (T008)

### Parallel Opportunities

```
Phase 1:
  T001 → T002 → T003 (sequential: layout first)
  T004 ─── T005 ─── T006 (parallel: different files)

Phase 2:
  T007 ─── T008 (parallel: different files)

Phase 3 + Phase 4 + Phase 5 + Phase 6 (after Phase 2):
  T009 ─── T013 ─── T015 ─── T017 (all parallel: different pages)
  T010 ─── T014 ─── T016 ─── T018 (parallel: different pages)
  T011 ─── T012 (sequential within US1)

Phase 7 (after Phase 1):
  T021 ─── T022 ─── T023 ─── T024 (all parallel: chart components)
  T025 depends on T021-T024

Phase 8:
  T026 ─── T027 (parallel)
  T028 → T029 → T030 → T031 → T032 (sequential verification)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001-T006)
2. Phase 2: Foundational (T007-T008)
3. Phase 3: US1 Products (T009-T012)
4. **STOP and VALIDATE**: Admin can create, edit, delete products
5. This gives a working product management dashboard

### Incremental Delivery

1. Setup + Foundational → Admin layout + shared components
2. US1 → Product CRUD (most critical admin function)
3. US2 → Order management (fulfillment tracking)
4. US3 + US4 → Inventory + delivery zones (parallel)
5. US5 → Analytics dashboard (data visualization)
6. Each story adds admin capability independently

---

## Notes

- All admin pages are client components (interactive CRUD)
- AdminTable is the workhorse — used in products, orders, inventory
- ImageUploader does NOT upload to Cloudinary on drop — only on form submit
- Analytics queries use both Supabase (events) and Firestore (orders) — joined client-side
- Delivery zone migration (T020) modifies checkout — test that existing checkout still works
- No authentication — `/admin` is publicly accessible until Phase 14
- Chart components are all SVG-based — no charting library dependencies
