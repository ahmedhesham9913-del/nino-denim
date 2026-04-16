# Quickstart: Admin Dashboard, Analytics & Reports

## Prerequisites

- Features 001-003 complete (Firebase, storefront, cart/checkout)
- Products seeded in Firebase
- Orders placed (for analytics data)
- `.env.local` configured

## Setup Steps

### 1. Seed delivery zones to Firestore

The admin delivery management will read from a
`delivery_zones` collection. Run the zone seeder or
create zones manually in the admin UI once it's built.

### 2. Start development server

```bash
npm run dev -- -p 3002
```

### 3. Verify admin dashboard

1. Visit `/admin` — redirects to `/admin/products`
2. Sidebar shows all 5 sections
3. Product list loads with all seeded products

### 4. Test product CRUD

1. Click "Add Product" — fill form, upload images, save
2. Verify product appears on shop page
3. Edit the product — change price, save
4. Delete the product — confirm, verify gone from shop

### 5. Test order management

1. Visit `/admin/orders` — all orders listed
2. Click an order — detail view opens
3. Change status from "pending" to "confirmed"

### 6. Test inventory

1. Visit `/admin/inventory`
2. Click a product — per-size stock editor opens
3. Update a size's stock, save
4. Verify product detail page shows updated stock

### 7. Test analytics

1. Visit `/admin/analytics`
2. Summary cards show today's metrics
3. Charts render with existing event data
4. Change date range — charts update

## New Files

```
src/
├── app/admin/
│   ├── layout.tsx                # Admin layout with sidebar
│   ├── page.tsx                  # Redirect to /admin/products
│   ├── products/
│   │   ├── page.tsx              # Product list
│   │   ├── new/page.tsx          # Create product
│   │   └── [id]/edit/page.tsx    # Edit product
│   ├── orders/
│   │   └── page.tsx              # Order list + management
│   ├── inventory/
│   │   └── page.tsx              # Inventory management
│   ├── delivery/
│   │   └── page.tsx              # Delivery zone management
│   └── analytics/
│       └── page.tsx              # Analytics dashboard
├── components/admin/
│   ├── AdminSidebar.tsx          # Left sidebar navigation
│   ├── AdminTable.tsx            # Reusable data table
│   ├── ProductForm.tsx           # Create/edit product form
│   ├── ImageUploader.tsx         # Drag-and-drop image upload
│   ├── OrderDetail.tsx           # Order detail panel
│   ├── StockEditor.tsx           # Per-size stock inputs
│   ├── ZoneEditor.tsx            # Delivery zone CRUD
│   ├── BarChart.tsx              # SVG bar chart
│   ├── FunnelChart.tsx           # Conversion funnel
│   ├── LineChart.tsx             # Revenue timeline
│   ├── SummaryCards.tsx          # KPI cards
│   └── DateRangePicker.tsx       # Date filter
└── services/
    ├── analytics.ts              # Supabase analytics queries
    └── delivery-zones.ts         # Firestore zone CRUD
```

## Modified Files

```
src/
├── app/checkout/page.tsx         # Read zones from Firestore
├── components/DeliverySelector.tsx # Read zones from Firestore
└── components/CheckoutForm.tsx   # Fetch zones dynamically
```
