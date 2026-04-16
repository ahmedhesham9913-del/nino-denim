# Quickstart: Storefront Firebase Integration

## Prerequisites

- 001-backend-foundation complete (Firebase, Cloudinary, Supabase clients working)
- `.env.local` configured with valid credentials
- `npm install` run with all dependencies

## Setup Steps

### 1. Update TypeScript types

The Product interface in `src/lib/types.ts` must be extended
with the new fields (description, colors, style, originalPrice,
rating, reviews, tag, and stock changed to per-size map).

### 2. Seed Firebase with sample products

```bash
npx tsx src/scripts/seed.ts
```

This creates 25+ sample products in Firestore with realistic
data across all categories.

### 3. Create Firestore composite indexes

In the Firebase Console > Firestore > Indexes, create:

1. **Collection**: `products` | **Fields**: `category` ASC, `created_at` DESC
2. **Collection**: `products` | **Fields**: `category` ASC, `price` ASC

These indexes are required for category filtering with sort.
Firebase will also auto-suggest them if you run queries that
need them.

### 4. Start development server

```bash
npm run dev
```

### 5. Verify

1. **Landing page** (`/`): ProductCards section shows real
   products from Firebase.
2. **Shop page** (`/products`): Products load from Firebase.
   Filter by "Women" — only women's products show. Click
   "Load More" — next page appends.
3. **Product detail** (`/product/{id}`): Click any product
   card — full detail page loads with images, sizes, stock.
4. **Analytics**: Check Supabase `events` table for
   `product_view` events.

## New Files

```
src/
├── app/
│   └── product/
│       └── [id]/
│           └── page.tsx          # Product detail page (server)
├── components/
│   ├── ProductGallery.tsx        # Image gallery (client)
│   ├── SizeSelector.tsx          # Size picker (client)
│   └── AddToCartButton.tsx       # Add to cart UI (client)
├── hooks/
│   ├── useProducts.ts            # Shop page data hook
│   └── useAnalytics.ts           # Analytics tracking hook
└── scripts/
    └── seed.ts                   # Firebase product seeder
```

## Modified Files

```
src/
├── lib/
│   └── types.ts                  # Extended Product interface
├── services/
│   └── products.ts               # Updated for new schema fields
├── components/
│   └── ProductCards.tsx           # Props-based instead of hardcoded
└── app/
    └── products/
        └── ProductsClient.tsx    # Firebase hook instead of mock data
```
