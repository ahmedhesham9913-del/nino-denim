# Quickstart: Cart, Checkout & Order System

## Prerequisites

- 001-backend-foundation + 002-storefront-integration complete
- Firebase seeded with products
- `.env.local` configured
- `npm install` run

## Setup Steps

### 1. Install Zustand

```bash
npm install zustand
```

### 2. Start development server

```bash
npm run dev -- -p 3002
```

### 3. Verify cart

1. Visit `/products` or any product detail page
2. Add a product to the cart (select size first)
3. Click the bag icon in navbar — drawer opens
4. Click "View Cart" — full cart page at `/cart`
5. Adjust quantities, verify totals update

### 4. Verify checkout

1. From cart, click "Proceed to Checkout"
2. Fill customer form (name, Egyptian phone, address)
3. Select delivery zone — fee appears
4. Review order summary
5. Click "Place Order"
6. Verify confirmation page shows order ID

### 5. Verify order in Firebase

Check Firestore > orders collection for the new document.
Verify: customer info, items, total_price, delivery_fee,
delivery_zone, status "pending".

### 6. Verify stock decrement

Check the ordered product's `stock` map in Firestore.
The ordered size's count should be decremented.

## New Files

```
src/
├── store/
│   └── cart.ts                   # Zustand cart store
├── components/
│   ├── CartDrawer.tsx            # Slide-over cart drawer
│   ├── CartItemRow.tsx           # Cart item with qty controls
│   ├── CheckoutForm.tsx          # Multi-step checkout
│   ├── CustomerForm.tsx          # Step 1: customer info
│   ├── DeliverySelector.tsx      # Step 2: zone selection
│   ├── OrderReview.tsx           # Step 3: review + place
│   └── StepIndicator.tsx         # Step progress bar
├── app/
│   ├── cart/
│   │   └── page.tsx              # Full cart page
│   ├── checkout/
│   │   └── page.tsx              # Checkout page
│   └── order/
│       └── [id]/
│           ├── page.tsx          # Order confirmation
│           └── not-found.tsx     # Order not found
└── services/
    └── orders.ts                 # Extended with placeOrder()
```

## Modified Files

```
src/
├── lib/types.ts                  # CartItem type, Order extended
├── components/
│   ├── Navbar.tsx                # Dynamic cart count + drawer trigger
│   └── AddToCartButton.tsx       # Wired to cart store
└── app/
    └── layout.tsx                # CartDrawer rendered at root
```
