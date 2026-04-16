# Research: Cart, Checkout & Order System

**Date**: 2026-04-08
**Branch**: `003-cart-checkout-orders`

## R1: Cart State Management

**Decision**: Use Zustand for cart state with localStorage
persistence. Zustand store exported from `src/store/cart.ts`.

**Rationale**: Zustand is lightweight (~1KB), requires no
provider wrapper, and has built-in `persist` middleware for
localStorage. React Context would work but adds boilerplate
for a store with complex actions (add, remove, update
quantity, clear). The constitution mentions "React Context
or Zustand" — Zustand is the better fit for a cart with
multiple actions and cross-component reads (navbar badge,
drawer, cart page, checkout).

**Alternatives considered**:
- React Context + useReducer: More boilerplate, requires
  provider in layout. Workable but verbose.
- Redux: Overkill for a single store.
- localStorage only (no state lib): Requires manual
  event listeners for cross-component reactivity.

---

## R2: Cart Drawer Pattern

**Decision**: Slide-over drawer from the right, triggered
by the navbar bag icon. Uses Framer Motion for enter/exit
animation + backdrop. Contains: item list, subtotal, "View
Cart" link, "Checkout" button. Rendered in the root layout
so it's accessible from all pages.

**Rationale**: A drawer provides instant cart feedback
without navigation. Matches the existing mobile filter
drawer pattern in `ProductsClient.tsx` (bottom sheet on
mobile, side panel on desktop). Keeps the premium,
unhurried feel — no jarring page transitions for quick
cart checks.

---

## R3: Checkout Multi-Step Form

**Decision**: Single `/checkout` page with 3 steps managed
by local React state (step number). No separate routes per
step. Framer Motion AnimatePresence for step transitions.

**Rationale**: A single page with step state is simpler than
3 routes and avoids browser back-button complexity. Step
data persists naturally in component state. The existing
EditorialLookbook uses a similar multi-panel pattern.
Session persistence is handled by keeping the checkout
component mounted.

**Step layout**:
- Step 1: Customer form (name, phone, address, email)
- Step 2: Delivery zone selector + fee display
- Step 3: Order review + "Place Order" button

---

## R4: Order Placement Flow

**Decision**: Order placement is a two-step atomic-ish
operation:
1. Validate stock for all items (read current stock from
   Firestore for each product)
2. If all available: create order document + decrement
   stock for each product (batch write)

**Rationale**: Firestore doesn't support cross-document
transactions in the client SDK easily, but a batch write
ensures the order and stock updates are written together.
Stock validation happens immediately before the write.
At the current scale (~100 orders/day), race conditions
are extremely unlikely and acceptable.

**Alternatives considered**:
- Cloud Function for atomic order placement: More robust
  but requires Firebase Functions setup (out of scope).
  Can be added later for high-concurrency scenarios.
- Optimistic stock decrement: Risky — could oversell.

---

## R5: Currency & Pricing

**Decision**: All prices displayed in EGP (Egyptian Pounds).
No currency conversion. Delivery fees are in EGP. Products
currently have USD prices from the seed script — these will
need to be updated to EGP values. For now, treat the numeric
price field as EGP.

**Rationale**: The delivery zones are Egypt-specific (Cairo,
Giza/Alexandria, Other Governorates). The store targets the
Egyptian market.

---

## R6: Order Schema Extension

**Decision**: Extend the existing Order interface from
001-backend-foundation with `delivery_fee` (number) and
`delivery_zone` (string) fields. The `customer` map already
has name, phone, address, email.

**Rationale**: Delivery info is per-order, not per-item.
Adding two fields to the existing schema is cleaner than
a nested delivery sub-document.

---

## R7: Phone Number Validation

**Decision**: Validate Egyptian phone numbers: must start
with `01` followed by 9 digits (11 digits total). Accept
with or without country code `+20`. Display format: local.

**Rationale**: Egyptian mobile numbers follow this pattern
(Vodafone, Orange, Etisalat, WE). Simple regex validation
is sufficient for the checkout form.

Pattern: `/^(\+20)?01[0125]\d{8}$/`
