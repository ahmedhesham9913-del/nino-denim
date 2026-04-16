# UI Contracts: Cart, Checkout & Order System

**Date**: 2026-04-08

## Page Routes

| Route | Type | Description |
|-------|------|-------------|
| `/cart` | **(NEW)** Client | Full cart page with item editing |
| `/checkout` | **(NEW)** Client | Multi-step checkout form |
| `/order/[id]` | **(NEW)** Dynamic server | Order confirmation/tracking |

## Component Contracts

### Cart Store (`src/store/cart.ts`)

```typescript
interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}
```

### CartDrawer (`src/components/CartDrawer.tsx`)

Slide-over from right. Triggered by navbar bag icon.

```typescript
interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}
```

**Contents**: Item list (image, name, size, qty, price),
subtotal, "View Cart" link, "Checkout" button.
Empty state: "Your bag is empty" + "Continue Shopping".

### CartPage (`src/app/cart/page.tsx`)

Full page cart view at `/cart`.

**Contents**: Item list with quantity controls (+/-),
remove buttons, line totals, cart summary (subtotal,
item count), "Proceed to Checkout" button.
Empty state: illustration + "Continue Shopping" link.

### CheckoutPage (`src/app/checkout/page.tsx`)

Multi-step form. Client component managing step state.

**Steps**:
1. `CustomerForm` — name, phone, address, email
2. `DeliverySelector` — zone radio buttons with fees
3. `OrderReview` — items + delivery + total + "Place Order"

```typescript
interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface DeliveryZone {
  name: string;
  fee: number;
}

// Step progress indicator
interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}
```

### OrderConfirmation (`src/app/order/[id]/page.tsx`)

Server component. Fetches order by ID.

**Contents**: Order ID, status badge, items summary,
customer info, delivery zone + fee, total paid.
404: "Order not found" with back link.

### Navbar Update

Modify existing `src/components/Navbar.tsx`:
- Bag icon shows dynamic item count from cart store
- Click opens CartDrawer (not navigation)

### AddToCartButton Update

Modify existing `src/components/AddToCartButton.tsx`:
- On click, calls `cart.addItem()` with product data
- Shows "ADDED!" feedback then reverts

### Analytics Events

| Event | Trigger | Metadata |
|-------|---------|----------|
| `add_to_cart` | Item added to cart | `{ product_id, size, price }` |
| `cart_remove` | Item removed from cart | `{ product_id, size }` |
| `checkout_started` | Customer enters checkout | `{ item_count, subtotal }` |
| `order_created` | Order placed successfully | `{ order_id, total, item_count }` |
