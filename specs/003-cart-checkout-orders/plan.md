# Implementation Plan: Cart, Checkout & Order System

**Branch**: `003-cart-checkout-orders` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-cart-checkout-orders/spec.md`

## Summary

Build the complete purchase flow: persistent shopping cart
(Zustand + localStorage), slide-over cart drawer, full cart
page, multi-step checkout (customer info, delivery zone
selection with EGP fees, order review), order placement to
Firebase with stock decrement, and order confirmation/tracking
page. Cash on Delivery only for initial launch.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+
**Primary Dependencies**: zustand (new), firebase v10+, framer-motion v12+, next v16
**Storage**: Zustand + localStorage (cart), Firebase Firestore (orders)
**Target Platform**: Next.js 16 App Router on Vercel
**Project Type**: Web application (e-commerce purchase flow)
**Performance Goals**: Cart operations instant, order placement < 2s
**Constraints**: COD only, no auth, EGP currency, 3 delivery zones

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Visual Supremacy | PASS | Cart drawer + checkout follow editorial design. Premium feel, generous spacing |
| II. Motion With Purpose | PASS | Drawer slide animation, step transitions via AnimatePresence, button feedback |
| III. Separation of Concerns | PASS | Cart in client store, orders in Firebase, analytics in Supabase |
| IV. Performance-First Commerce | PASS | Cart operations are instant (local state). Stock validation at order time only |
| V. Mobile-Native, Desktop-Enhanced | PASS | Drawer works on both. Checkout is single-column mobile, wider desktop |
| VI. Typography as Architecture | PASS | Outfit for labels/buttons/headings, DM Sans for form inputs/descriptions |
| VII. Data-Driven Decision Making | PASS | 4 analytics events: add_to_cart, cart_remove, checkout_started, order_created |
| VIII. Progressive Disclosure | PASS | Multi-step checkout reveals complexity gradually. Drawer shows quick summary |
| IX. Color as Identity | PASS | NINO palette throughout. EGP amounts in nino-950 |
| X. Production-Grade Quality | PASS | All 4 states on cart/checkout/order pages. Stock validation. Form validation |

**Result**: All 10 gates PASS.

## Project Structure

### New Files

```text
src/
├── store/
│   └── cart.ts                   # Zustand cart store + localStorage
├── components/
│   ├── CartDrawer.tsx            # Slide-over drawer
│   ├── CartItemRow.tsx           # Item row with qty +/- and remove
│   ├── CheckoutForm.tsx          # Multi-step checkout wrapper
│   ├── CustomerForm.tsx          # Step 1: name/phone/address/email
│   ├── DeliverySelector.tsx      # Step 2: zone radio + fee
│   ├── OrderReview.tsx           # Step 3: summary + place order
│   └── StepIndicator.tsx         # Step progress indicator
├── app/
│   ├── cart/
│   │   └── page.tsx              # Full cart page
│   ├── checkout/
│   │   └── page.tsx              # Checkout page
│   └── order/
│       └── [id]/
│           ├── page.tsx          # Order confirmation/tracking
│           └── not-found.tsx     # Order not found
└── lib/
    └── delivery-zones.ts         # Hardcoded zone/fee constants
```

### Modified Files

```text
src/
├── lib/types.ts                  # CartItem interface, Order delivery fields
├── services/orders.ts            # placeOrder() with stock validation
├── components/
│   ├── Navbar.tsx                # Dynamic cart count + drawer trigger
│   └── AddToCartButton.tsx       # Wired to cart store
└── app/
    └── layout.tsx                # CartDrawer in root layout
```

## Implementation Phases

### Phase 1: Cart Infrastructure

**Files**: `src/store/cart.ts`, `src/lib/types.ts`, `src/lib/delivery-zones.ts`

1. Install Zustand dependency.
2. Add `CartItem` interface to types.ts. Add `delivery_fee`
   and `delivery_zone` to Order interface.
3. Create Zustand cart store with persist middleware
   (localStorage). Actions: addItem, removeItem, updateQuantity,
   clearCart. Computed: totalItems, totalPrice.
4. Create delivery-zones.ts with 3 zones and fees.

### Phase 2: Cart Drawer + Navbar Integration

**Files**: `src/components/CartDrawer.tsx`, `src/components/Navbar.tsx`, `src/app/layout.tsx`

1. Create CartDrawer — slide-over from right with backdrop.
   Shows item list, subtotal, "View Cart", "Checkout" buttons.
   Empty state. Framer Motion animation.
2. Update Navbar — bag icon shows dynamic count from cart
   store. Click opens CartDrawer (not navigation).
3. Add CartDrawer to root layout.

### Phase 3: Cart Page

**Files**: `src/app/cart/page.tsx`, `src/components/CartItemRow.tsx`

1. Create CartItemRow — product image, name, size, quantity
   controls (+/-), unit price, line total, remove button.
2. Create cart page — list of CartItemRows, subtotal summary,
   "Proceed to Checkout" button, empty state.

### Phase 4: AddToCart Wiring

**Files**: `src/components/AddToCartButton.tsx`, `src/components/ProductDetailClient.tsx`

1. Update AddToCartButton to call `cart.addItem()` with
   product data and selected size.
2. Update ProductDetailClient to pass product info to
   AddToCartButton's onAdd callback.

### Phase 5: Checkout Flow

**Files**: `src/app/checkout/page.tsx`, `src/components/CheckoutForm.tsx`,
`src/components/CustomerForm.tsx`, `src/components/DeliverySelector.tsx`,
`src/components/OrderReview.tsx`, `src/components/StepIndicator.tsx`

1. StepIndicator — 3-step progress bar.
2. CustomerForm — name, phone (Egyptian validation), address,
   email. Inline validation.
3. DeliverySelector — 3 zone radio buttons with fees.
4. OrderReview — items from cart, delivery fee, total, "Place
   Order" button.
5. CheckoutForm — manages step state, wraps steps with
   AnimatePresence transitions. Redirects to cart if empty.
6. Checkout page — renders CheckoutForm.

### Phase 6: Order Placement

**Files**: `src/services/orders.ts`

1. Extend orders service with `placeOrder()` function:
   - Accept cart items + customer info + delivery zone
   - Validate stock for all items (read current stock)
   - If valid: batch write order document + stock decrements
   - If invalid: return error with unavailable items list
   - Return order document ID on success

### Phase 7: Order Confirmation Page

**Files**: `src/app/order/[id]/page.tsx`, `src/app/order/[id]/not-found.tsx`

1. Server component — fetch order by ID.
2. Display: order ID, status badge, items summary, customer
   info, delivery zone + fee, total. 404 for invalid IDs.

### Phase 8: Analytics & Polish

1. Wire analytics: add_to_cart, cart_remove, checkout_started,
   order_created events.
2. Verify all 4 states on cart, checkout, and order pages.
3. Test mobile responsive behavior.
4. `npm run build` — zero errors.

## Parallel Opportunities

| Phase Group | Can Parallelize |
|-------------|----------------|
| Phase 1 (store) | Sequential — types before store |
| Phase 2 (drawer) + Phase 3 (cart page) | Yes after Phase 1 |
| Phase 4 (add-to-cart) | After Phase 1 |
| Phase 5 (checkout components) | After Phase 1 — all step components parallel |
| Phase 6 (order placement) | After Phase 1 (types) |
| Phase 7 (confirmation) | After Phase 6 |
| Phase 8 (polish) | After all |

## Dependencies

### From 001 + 002

- `src/lib/firebase.ts` — Firestore client
- `src/lib/supabase.ts` — Analytics trackEvent
- `src/services/orders.ts` — Base order CRUD (will be extended)
- `src/services/products.ts` — getProductById for stock reads
- `src/components/AddToCartButton.tsx` — UI placeholder (will be wired)
- `src/components/Navbar.tsx` — Bag icon (will be updated)

### New npm packages

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.x | Cart state management with localStorage persist |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stock race condition | Overselling | Validate immediately before write; acceptable at current scale |
| Cart data stale (price changed) | Wrong total at checkout | Validate prices at order time against current Firebase data |
| Large cart (20+ items) | Slow checkout validation | Batch stock reads; unlikely at current scale |
| Browser storage cleared | Cart lost | Acceptable tradeoff vs database-stored cart complexity |
