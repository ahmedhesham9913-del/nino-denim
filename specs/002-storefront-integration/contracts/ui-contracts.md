# UI Contracts: Storefront Firebase Integration

**Date**: 2026-04-08

## Page Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static + server fetch | Landing page with real ProductCards |
| `/products` | Client-side | Shop page with Firebase pagination |
| `/product/[id]` | **(NEW)** Dynamic server | Product detail page |

---

## Component Contracts

### ProductCards (landing page — modified)

**Current**: Hardcoded 6 products inline.
**New**: Receives `products: Product[]` as props from parent
Server Component. Renders up to 6 products.

```typescript
// Props change
interface ProductCardsProps {
  products: Product[];
}
```

**States**: loading (skeleton), success (cards), empty (message),
error (retry).

---

### ProductsClient (shop page — modified)

**Current**: Imports 52 mock products from `@/lib/products`.
**New**: Uses `useProducts` hook to fetch from Firebase.

```typescript
// New hook contract
function useProducts(options?: {
  category?: ProductCategory;
  sortBy?: "newest" | "price-asc" | "price-desc" | "popular";
  pageSize?: number;
}): {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}
```

**States**: loading (skeleton grid), success (product grid +
"Load More" button), empty (no matches message), error (inline
error + retry).

**Filter behavior**:
- Category: triggers new Firebase query (server-side filter)
- Style, color, size, price: applied client-side on fetched results
- Sort: triggers new Firebase query with different `orderBy`

---

### Product Detail Page (NEW)

**Route**: `/product/[id]`

**Server Component** (`page.tsx`):
- Fetches product by ID via `getProductById()`
- Returns 404 if product not found
- Passes product data to client components

**Client Components**:

```typescript
// Image gallery
interface ProductGalleryProps {
  images: string[];
  productName: string;
}

// Size selector
interface SizeSelectorProps {
  sizes: string[];
  stock: Record<string, number>;
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

// Add to cart button (UI-only for Phase 6, wired in Phase 7)
interface AddToCartProps {
  disabled: boolean;  // true when sold out or no size selected
  onAdd: () => void;
}

// Product info
interface ProductInfoProps {
  product: Product;
}
```

**States**: loading (skeleton), success (full detail),
not-found (404 page), error (retry).

---

### useAnalytics Hook (NEW)

```typescript
function useAnalytics(): {
  trackProductView: (productId: string, source?: string) => void;
  trackFilterApplied: (filters: Record<string, unknown>) => void;
}
```

Manages session ID internally (sessionStorage). Calls
`trackEvent()` from `@/lib/supabase` with fire-and-forget.

---

## Seed Script Contract

**Path**: `src/scripts/seed.ts`
**Execution**: `npx tsx src/scripts/seed.ts`

**Behavior**:
- Clears existing products collection (optional `--clean` flag)
- Inserts 25+ sample products with realistic data
- Uses Cloudinary-compatible image URLs (Unsplash/Pexels)
- Covers all 4 categories, multiple styles, colors, sizes
- Includes products with zero stock in some sizes
- Outputs count of seeded products on completion
