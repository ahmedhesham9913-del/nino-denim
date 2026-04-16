# UI Contracts: Admin Dashboard, Analytics & Reports

**Date**: 2026-04-08

## Route Structure

| Route | Type | Description |
|-------|------|-------------|
| `/admin` | Layout + redirect | Admin layout with sidebar. Redirects to `/admin/products` |
| `/admin/products` | Client | Product list + CRUD |
| `/admin/products/new` | Client | Create product form |
| `/admin/products/[id]/edit` | Client | Edit product form |
| `/admin/orders` | Client | Order list + management |
| `/admin/inventory` | Client | Inventory stock editor |
| `/admin/delivery` | Client | Delivery zone management |
| `/admin/analytics` | Client | Analytics dashboard + charts |

## Layout Contract

### AdminLayout (`src/app/admin/layout.tsx`)

```typescript
// Shared layout for all /admin/* routes
// Contains: fixed left sidebar + main content area
// Sidebar width: 260px desktop, collapsible on mobile
// Main content: flex-1 with padding
```

### AdminSidebar (`src/components/admin/AdminSidebar.tsx`)

```typescript
// Fixed left sidebar
// Logo at top (small NINO JEANS branding)
// Nav links with icons:
//   - Products (box icon)
//   - Orders (clipboard icon)
//   - Inventory (package icon)
//   - Delivery (truck icon)
//   - Analytics (chart icon)
// Active link highlighted with bg-nino-100/50
// Collapsible on mobile (hamburger toggle)
```

## Component Contracts

### AdminTable

```typescript
interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    hasMore: boolean;
    onLoadMore: () => void;
    loading: boolean;
  };
}
```

### ProductForm

```typescript
interface ProductFormProps {
  product?: Product;  // undefined = create mode
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: ProductCategory;
  style: string;
  sizes: string[];
  colors: ProductColor[];
  stock: Record<string, number>;
  tag?: ProductTag;
  images: File[] | string[];  // Files for new uploads, URLs for existing
}
```

### ImageUploader

```typescript
interface ImageUploaderProps {
  images: (File | string)[];  // Mix of new files and existing URLs
  onChange: (images: (File | string)[]) => void;
  maxImages?: number;  // default 8
}
// Drag-and-drop zone + file input
// Thumbnail previews with reorder + remove
// Upload happens on parent form submit
```

### Analytics Charts

```typescript
// Bar chart for most viewed products
interface BarChartProps {
  data: { label: string; value: number }[];
  maxBars?: number;
}

// Funnel for conversion
interface FunnelChartProps {
  stages: { label: string; count: number }[];
}

// Line chart for revenue over time
interface LineChartProps {
  data: { date: string; value: number }[];
  label: string;
}

// Date range picker
interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  presets: { label: string; days: number }[];
}
```

### Delivery Zone Editor

```typescript
interface ZoneEditorProps {
  zones: DeliveryZone[];
  onAdd: (zone: { name: string; fee: number }) => void;
  onEdit: (id: string, zone: { name: string; fee: number }) => void;
  onDelete: (id: string) => void;
}
```

## Analytics Service Contract

```typescript
// src/services/analytics.ts
interface AnalyticsService {
  getSummaryCards(date: Date): Promise<{
    ordersToday: number;
    revenueToday: number;
    viewsToday: number;
    conversionRate: number;
  }>;

  getMostViewed(startDate: Date, endDate: Date): Promise<
    { productId: string; productName: string; viewCount: number }[]
  >;

  getConversionFunnel(startDate: Date, endDate: Date): Promise<
    { stage: string; count: number; percentage: number }[]
  >;

  getDailyRevenue(startDate: Date, endDate: Date): Promise<
    { date: string; revenue: number }[]
  >;

  getTopCustomers(startDate: Date, endDate: Date): Promise<
    { name: string; phone: string; totalSpent: number; orderCount: number }[]
  >;
}
```

## Delivery Zone Service Contract

```typescript
// src/services/delivery-zones.ts
interface DeliveryZoneService {
  getZones(): Promise<DeliveryZone[]>;
  addZone(zone: { name: string; fee: number }): Promise<string>;
  updateZone(id: string, data: { name?: string; fee?: number }): Promise<void>;
  deleteZone(id: string): Promise<void>;
}
```
