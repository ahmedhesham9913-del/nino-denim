# Feature Specification: Admin Dashboard, Analytics & Reports

**Feature Branch**: `004-admin-analytics-reports`
**Created**: 2026-04-08
**Status**: Draft
**Input**: User description: "Plan.md phases 10-12: Admin Dashboard, Analytics System, Reports Dashboard"

## Clarifications

### Session 2026-04-08

- Q: What layout pattern for the admin dashboard navigation? → A: Fixed left sidebar with vertical links + main content area on the right
- Q: What visual style for the admin dashboard? → A: NINO-branded but toned down — same colors and fonts, clean/minimal layout, subtle animations, data-dense tables

## User Scenarios & Testing

### User Story 1 - Product Management (Priority: P1)

As the store owner, I need a dashboard to add, edit, and
delete products — including uploading images via Cloudinary
— so that I can manage my catalog without touching the
database directly.

**Why this priority**: The store cannot operate without
product management. Currently products can only be added
via the seed script or Firebase console. A proper dashboard
is the minimum viable admin experience.

**Independent Test**: Log into the admin dashboard. Create
a new product with name, price, description, sizes, colors,
category, and upload 3 images. Verify the product appears
in the shop page. Edit the price. Delete the product. Verify
it disappears from the shop.

**Acceptance Scenarios**:

1. **Given** the admin visits `/admin/products`, **When**
   the page loads, **Then** all products are listed in a
   table with name, image thumbnail, category, price, stock
   status, and actions (edit/delete).
2. **Given** the admin clicks "Add Product", **When** the
   form opens, **Then** it shows fields for: name,
   description, price, original price, category, style,
   sizes (multi-select), colors (add name + hex), tag,
   and an image upload area.
3. **Given** the admin uploads images in the product form,
   **When** they drop or select files, **Then** images are
   uploaded to Cloudinary and previewed in the form. Images
   can be reordered and removed before saving.
4. **Given** the admin fills the product form and clicks
   "Save", **When** all required fields are valid, **Then**
   the product is created in the database with all fields
   including Cloudinary image URLs.
5. **Given** the admin clicks "Edit" on a product, **When**
   the edit form opens, **Then** all current values are
   pre-populated. Changes are saved on submit.
6. **Given** the admin clicks "Delete" on a product, **When**
   they confirm the deletion, **Then** the product is
   removed from the database.
7. **Given** the product list is long, **When** the admin
   scrolls, **Then** products are paginated (not all loaded
   at once).

---

### User Story 2 - Order Management (Priority: P1)

As the store owner, I need to view all orders and update
their fulfillment status so that I can track and process
customer orders efficiently.

**Why this priority**: Orders are flowing in from the
checkout system. Without order management, the store owner
has no way to track which orders need to be fulfilled,
shipped, or are already delivered.

**Independent Test**: Navigate to `/admin/orders`. Verify
all orders appear with customer name, total, date, and
status. Click an order to expand details. Change status
from "pending" to "confirmed". Verify the status updates.

**Acceptance Scenarios**:

1. **Given** the admin visits `/admin/orders`, **When** the
   page loads, **Then** all orders are listed with: order
   ID, customer name, total price (EGP), item count, status
   badge, and date.
2. **Given** the admin clicks an order, **When** the detail
   view opens, **Then** it shows: full customer info (name,
   phone, address), all order items with sizes and
   quantities, delivery zone + fee, total, and current
   status.
3. **Given** the admin views an order detail, **When** they
   select a new status from the dropdown, **Then** the
   status is updated following the valid transition rules
   (pending > confirmed > processing > shipped > delivered,
   or cancelled from any pre-delivered state).
4. **Given** an invalid status transition is attempted,
   **When** the admin tries to apply it, **Then** an error
   message explains which transitions are allowed.
5. **Given** orders exist, **When** the admin filters by
   status (e.g., "pending" only), **Then** only matching
   orders are displayed.

---

### User Story 3 - Inventory Management (Priority: P2)

As the store owner, I need to update per-size stock levels
for products so that I can keep inventory accurate as new
shipments arrive or manual adjustments are needed.

**Why this priority**: Stock levels change constantly from
orders and new shipments. Without inventory management, the
store owner cannot replenish stock without database access.

**Independent Test**: Navigate to `/admin/inventory`. Find
a product. View its per-size stock. Change size "32" stock
from 5 to 15. Verify the update is reflected. Verify the
product detail page shows the updated stock.

**Acceptance Scenarios**:

1. **Given** the admin visits `/admin/inventory`, **When**
   the page loads, **Then** products are listed with: name,
   category, total stock across all sizes, and a stock
   status indicator (in stock / low stock / out of stock).
2. **Given** the admin clicks a product, **When** the
   stock editor opens, **Then** all sizes are shown with
   their current stock count in editable number inputs.
3. **Given** the admin changes a size's stock value and
   clicks "Save", **When** the update is submitted,
   **Then** the per-size stock map is updated in the
   database.
4. **Given** a product has any size with stock <= 5,
   **When** the inventory list loads, **Then** it shows
   a "Low Stock" warning indicator.

---

### User Story 4 - Delivery Zone Management (Priority: P2)

As the store owner, I need to manage delivery zones and
their fees so that I can adjust pricing or add new regions
without code changes.

**Why this priority**: Delivery zones are currently
hardcoded. Making them configurable gives the store owner
full control over delivery pricing.

**Independent Test**: Navigate to `/admin/delivery`. View
current zones. Edit "Cairo" fee from 30 to 35 EGP. Add a
new zone "Hurghada" with 100 EGP fee. Verify checkout
reflects the changes.

**Acceptance Scenarios**:

1. **Given** the admin visits `/admin/delivery`, **When**
   the page loads, **Then** all delivery zones are listed
   with name, fee (EGP), and edit/delete actions.
2. **Given** the admin clicks "Add Zone", **When** they
   enter a name and fee, **Then** the new zone is saved
   and appears in the list.
3. **Given** the admin edits a zone's fee, **When** they
   save the change, **Then** the fee is updated and new
   checkout orders use the updated fee.
4. **Given** the admin deletes a zone, **When** they
   confirm, **Then** the zone is removed from the list
   and no longer appears in checkout.

---

### User Story 5 - Analytics Dashboard (Priority: P2)

As the store owner, I need a visual dashboard showing key
business metrics so that I can understand customer behavior
and make data-driven decisions about products and pricing.

**Why this priority**: Event tracking is already active
from phases 7-9. The store owner needs a way to visualize
this data without querying the database directly.

**Independent Test**: Navigate to `/admin/analytics`. Verify
charts show: most viewed products (bar chart), conversion
funnel (product_view > add_to_cart > checkout > order),
sales over time (line chart), and top customers table.

**Acceptance Scenarios**:

1. **Given** the admin visits `/admin/analytics`, **When**
   the page loads, **Then** summary cards show: total
   orders today, total revenue today (EGP), total product
   views today, and cart-to-order conversion rate.
2. **Given** analytics data exists, **When** the admin
   views the "Most Viewed Products" section, **Then** a
   bar chart shows the top 10 products by view count.
3. **Given** analytics data exists, **When** the admin
   views the "Conversion Funnel" section, **Then** a
   funnel visualization shows: product views > add to cart
   > checkout started > order placed, with counts and
   percentages at each stage.
4. **Given** analytics data exists, **When** the admin
   views the "Sales Over Time" section, **Then** a line
   chart shows daily revenue for the last 30 days.
5. **Given** analytics data exists, **When** the admin
   views the "Top Customers" section, **Then** a table
   shows customers ranked by total spend with order count.
6. **Given** the admin selects a date range filter, **When**
   they apply it, **Then** all charts and metrics update
   to reflect the selected period.

---

### Edge Cases

- What happens when the admin tries to delete a product
  that has pending orders? A warning MUST be shown — the
  product can still be deleted but existing orders retain
  the product name snapshot.
- What happens when the admin uploads an image that exceeds
  the maximum file size? An inline error MUST display before
  the upload attempt.
- What happens when the Supabase analytics database is
  temporarily unavailable? The analytics dashboard MUST
  show a "Data temporarily unavailable" message, not crash.
- What happens when there are no analytics events yet?
  Charts MUST show an empty state with a message, not
  broken renders.
- What happens when two admins edit the same product
  simultaneously? The last save wins — no locking required
  at current scale.

## Requirements

### Functional Requirements

- **FR-001**: Admin dashboard MUST be accessible at
  `/admin` with sub-routes for products, orders, inventory,
  delivery, and analytics. Navigation uses a fixed left
  sidebar with vertical links. The sidebar persists across
  all admin pages.
- **FR-002**: Product management MUST support CRUD
  operations: create, read, update, delete.
- **FR-003**: Product creation/editing MUST include image
  upload to Cloudinary with drag-and-drop, reorder, and
  remove capabilities.
- **FR-004**: Product list MUST be paginated (not all
  loaded at once).
- **FR-005**: Order management MUST display all orders
  with filtering by status.
- **FR-006**: Order status changes MUST follow the valid
  transition rules defined in the order system.
- **FR-007**: Order detail view MUST show complete order
  information (customer, items, delivery, total, status).
- **FR-008**: Inventory management MUST allow per-size
  stock updates for any product.
- **FR-009**: Inventory list MUST show stock status
  indicators (in stock, low stock, out of stock).
- **FR-010**: Delivery zone management MUST support
  add, edit, and delete operations.
- **FR-011**: Delivery zones MUST be stored in the database
  (migrated from hardcoded constants).
- **FR-012**: Analytics dashboard MUST show: summary cards
  (orders, revenue, views, conversion rate), most viewed
  products chart, conversion funnel, sales timeline, and
  top customers table.
- **FR-013**: Analytics dashboard MUST support date range
  filtering.
- **FR-014**: All analytics queries MUST read from the
  Supabase events table and Firestore orders collection.
- **FR-015**: Admin dashboard MUST use NINO brand colors
  and typography but with a toned-down, functional style:
  clean/minimal layout, subtle animations, data-dense
  tables. No editorial styling (oversized typography, 3D
  cards, heavy motion) — prioritize usability and data
  density over visual impact.
- **FR-016**: Delete operations MUST require confirmation
  before executing.
- **FR-017**: All form inputs MUST have inline validation.
- **FR-018**: Analytics charts MUST show empty states when
  no data exists.

### Key Entities

- **Product** (existing): Managed via CRUD in the admin.
- **Order** (existing): Viewed and status-managed in admin.
- **Delivery Zone** (migrating): Moving from hardcoded
  constant to a Firestore `delivery_zones` collection.
- **Analytics Event** (existing, Supabase): Queried for
  dashboard visualizations.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A store owner can create a new product with
  images and have it appear on the shop within 30 seconds.
- **SC-002**: A store owner can view and update order status
  within 3 clicks from the admin dashboard.
- **SC-003**: Stock updates are reflected on the product
  detail page within 5 seconds.
- **SC-004**: The analytics dashboard loads all charts
  within 3 seconds.
- **SC-005**: The conversion funnel accurately reflects
  the ratio of views to orders.
- **SC-006**: All admin CRUD operations provide immediate
  visual feedback (success/error).
- **SC-007**: Zero data loss when managing products,
  orders, or delivery zones.

## Assumptions

- The admin dashboard is not behind authentication for this
  phase. Authentication (Firebase Auth) is deferred to
  Phase 14 (Security). The `/admin` route is accessible to
  anyone who knows the URL. This is acceptable for initial
  development.
- Charts will use a lightweight charting approach (SVG-based
  or a minimal library) — no heavy charting libraries like
  Chart.js or Recharts unless necessary.
- The delivery zone migration from hardcoded to database-
  stored will require updating the checkout flow to read
  zones from Firestore instead of the constant file.
- Analytics queries run against the Supabase `events` table.
  Revenue and order data comes from Firestore `orders`
  collection. Some metrics require cross-database joins
  done client-side.
- The admin dashboard is desktop-first (store owners
  typically use laptops/desktops for management), with
  basic mobile responsiveness for quick checks.
