# Data Model: Storefront Firebase Integration

**Date**: 2026-04-08
**Branch**: `002-storefront-integration`

## Product Schema (Extended)

The Product entity is extended from the 001-backend-foundation
schema. New fields are marked with **(NEW)**.

### Firestore Collection: `products`

| Field         | Type                          | Required | Notes                                              |
|---------------|-------------------------------|----------|----------------------------------------------------|
| name          | string                        | Yes      | Product display name                               |
| description   | string                        | Yes      | **(NEW)** Plain text product description           |
| price         | number                        | Yes      | Current selling price in USD                       |
| originalPrice | number                        | Yes      | **(NEW)** Original price before discount           |
| images        | array\<string\>               | Yes      | Ordered Cloudinary CDN URLs                        |
| sizes         | array\<string\>               | Yes      | Available size labels (e.g., "28", "S")            |
| stock         | map\<string, number\>         | Yes      | **(CHANGED)** Per-size stock: `{ "28": 5, "30": 0 }` |
| colors        | array\<{name, hex}\>          | Yes      | **(NEW)** e.g., `[{name:"Indigo", hex:"#2563eb"}]` |
| category      | string (enum)                 | Yes      | `Men` \| `Women` \| `Kids` \| `Unisex`            |
| style         | string                        | Yes      | **(NEW)** e.g., "Slim Fit", "Straight", "Bootcut" |
| tag           | string                        | No       | **(NEW)** e.g., "New", "Sale", "Bestseller", "Limited" |
| rating        | number                        | Yes      | **(NEW)** Average rating 0-5                       |
| reviews       | number                        | Yes      | **(NEW)** Total review count                       |
| created_at    | Timestamp                     | Yes      | Firestore server timestamp                         |

**Identity**: Auto-generated Firestore document ID.
**Ordering**: Default sort by `created_at` descending.
**Pagination**: Cursor-based via `startAfter()`, page size 12.

### Computed Properties (client-side)

| Property      | Derivation                                      |
|---------------|-------------------------------------------------|
| discount %    | `Math.round((1 - price / originalPrice) * 100)` |
| totalStock    | `Object.values(stock).reduce((a, b) => a + b, 0)` |
| isSoldOut     | `totalStock === 0`                              |
| inStockSizes  | `sizes.filter(s => stock[s] > 0)`               |

### Firestore Indexes Required

| Fields                        | Order | Purpose              |
|-------------------------------|-------|----------------------|
| category, created_at          | DESC  | Category filter + pagination |
| category, price               | ASC   | Category + price sort |
| price (single field)          | ASC   | Price sort           |

---

## TypeScript Interface Update

```typescript
// Extended Product interface (replaces 001 version)
export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  sizes: string[];
  stock: Record<string, number>;  // per-size: { "28": 5, "30": 0 }
  colors: ProductColor[];
  category: ProductCategory;
  style: string;
  tag?: "New" | "Sale" | "Bestseller" | "Limited" | "Trending";
  rating: number;
  reviews: number;
  created_at: Timestamp;
}

export interface ProductColor {
  name: string;
  hex: string;
}
```

---

## Relationships (unchanged from 001)

```
Product ──1:N──→ Order.items[].product_id
Product ──1:N──→ Event.product_id
```
