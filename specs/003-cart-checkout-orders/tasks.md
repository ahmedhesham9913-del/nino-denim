# Tasks: Cart, Checkout & Order System

**Input**: Design documents from `specs/003-cart-checkout-orders/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies, extend types, create shared infrastructure.

- [x] T001 Install Zustand: `npm install zustand` in project root
- [x] T002 Update `src/lib/types.ts` — add `CartItem` interface (productId, name, image, size, quantity, price). Add `delivery_fee: number` and `delivery_zone: string` fields to the `Order` interface. Add `DeliveryZone` interface `{ name: string; fee: number }`.
- [x] T003 [P] Create `src/lib/delivery-zones.ts` — export `DELIVERY_ZONES` constant array with 3 zones: `{ name: "Cairo", fee: 30 }`, `{ name: "Giza / Alexandria", fee: 50 }`, `{ name: "Other Governorates", fee: 80 }`. Export `CURRENCY = "EGP"` constant.
- [x] T004 Create `src/store/cart.ts` — Zustand store with `persist` middleware (localStorage key: `nino-cart`). State: `items: CartItem[]`. Actions: `addItem(item)` — if same productId+size exists, increment quantity, else push new item; `removeItem(productId, size)`; `updateQuantity(productId, size, qty)` — remove if qty < 1; `clearCart()`. Computed getters: `totalItems()` — sum of all quantities; `totalPrice()` — sum of qty * price for all items.

**Checkpoint**: Zustand store compiles. Cart operations work (add, remove, update, clear). Data persists in localStorage.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create cart drawer and wire navbar. These are needed by ALL user stories.

**CRITICAL**: The cart drawer and navbar integration must work before any story-specific UI.

- [x] T005 Create `src/components/CartDrawer.tsx` — slide-over drawer from the right using Framer Motion (AnimatePresence + motion.div). Accepts `open: boolean` and `onClose: () => void` props. Shows: list of cart items (image, name, size, qty, price), subtotal, "View Cart" link to `/cart`, "Checkout" link to `/checkout`. Empty state: "Your bag is empty" + "Continue Shopping" link to `/products`. Backdrop overlay that closes on click. NINO design system (Outfit font, nino palette, rounded-2xl, signature animations).
- [x] T006 Update `src/components/Navbar.tsx` — replace hardcoded "3" badge on bag icon with dynamic count from `useCartStore().totalItems()`. Add `useState` for drawer open/close. On bag icon click, toggle CartDrawer open (not navigate). Import and render `<CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />` inside the Navbar component.
- [x] T007 Update `src/app/layout.tsx` — no changes needed (CartDrawer is rendered inside Navbar). Verify Navbar is already in the layout.

**Checkpoint**: Click bag icon → drawer slides in from right showing cart items or empty state. Badge shows correct count. Drawer closes on backdrop click.

---

## Phase 3: User Story 1 — Shopping Cart (Priority: P1)

**Goal**: Full cart functionality — add from product page, view/edit on cart page, persist across sessions.

**Independent Test**: Go to a product detail page. Select size "32". Click "Add to Cart". Verify bag icon count updates. Click bag icon → drawer shows item. Click "View Cart" → full cart page shows item with qty controls. Change qty to 3 → total updates. Remove item → empty state. Close browser, reopen → cart state restored.

### Implementation for User Story 1

- [x] T008 [US1] Update `src/components/AddToCartButton.tsx` — modify `onAdd` callback to accept product data. When clicked, call `useCartStore().addItem({ productId, name, image, size, price })` with the product's details. Keep existing "ADDED!" visual feedback animation.
- [x] T009 [US1] Update `src/components/ProductDetailClient.tsx` — pass an `onAdd` callback to `AddToCartButton` that includes the current product's id, name, first image URL, selected size, and price. After adding, briefly open the cart drawer (optional: show a toast or the drawer auto-opens for 2 seconds).
- [x] T010 [P] [US1] Create `src/components/CartItemRow.tsx` — client component for a single cart item. Shows: product image (64x64, rounded-xl), product name, selected size badge, quantity controls (- button, number, + button), unit price, line total (qty * price), remove (X) button. Calls `updateQuantity` and `removeItem` from cart store. NINO design: Outfit font for labels, nino-950 text, nino-100/50 backgrounds for controls.
- [x] T011 [US1] Create `src/app/cart/page.tsx` — client component. Import cart store. If cart empty: show empty state with large illustration or icon, "Your cart is empty" heading, "Continue Shopping" button linking to `/products`. If items exist: render list of `CartItemRow` components, cart summary section (subtotal, item count), "Proceed to Checkout" button linking to `/checkout`. Include `Navbar` (from layout) and `Footer`. Page title "Your Cart | NINO JEANS".

**Checkpoint**: US1 complete — full cart CRUD from product page to cart page. Persistence verified. Navbar badge accurate.

---

## Phase 4: User Story 2 — Checkout Flow (Priority: P1)

**Goal**: Multi-step checkout form collecting customer info, delivery zone, and order review.

**Independent Test**: Add items to cart. Click "Checkout". Fill Step 1: name "Ahmed", phone "01012345678", address "123 Tahrir St, Cairo". Proceed. Step 2: select "Cairo" zone → 30 EGP fee shown. Proceed. Step 3: verify items + 30 EGP delivery + total. Click "Place Order" → order created.

### Implementation for User Story 2

- [x] T012 [P] [US2] Create `src/components/StepIndicator.tsx` — client component accepting `currentStep: number` and `steps: string[]`. Render a horizontal progress bar with step circles and labels. Active step: `bg-nino-950 text-white`. Completed steps: `bg-nino-500 text-white` with checkmark. Future steps: `bg-nino-100/50 text-nino-400`. Connecting lines between steps. NINO Outfit font.
- [x] T013 [P] [US2] Create `src/components/CustomerForm.tsx` — client component for checkout Step 1. Form fields: name (text, required), phone (text, required, Egyptian format validation `/^(\+20)?01[0125]\d{8}$/`), address (textarea, required), email (email, optional). All fields use `font-[var(--font-body)]` for inputs, `font-[var(--font-display)]` for labels. Inline error messages below each field in red. "Continue" button at bottom. Accepts `initialData` and `onSubmit(data)` props.
- [x] T014 [P] [US2] Create `src/components/DeliverySelector.tsx` — client component for checkout Step 2. Import `DELIVERY_ZONES` from `src/lib/delivery-zones.ts`. Render radio button cards for each zone showing zone name and fee in EGP. Selected zone highlighted with `border-nino-500` and `bg-nino-50/50`. Shows selected delivery fee prominently. "Continue" and "Back" buttons. Accepts `selectedZone` and `onSelect(zone)` / `onBack()` props.
- [x] T015 [P] [US2] Create `src/components/OrderReview.tsx` — client component for checkout Step 3. Shows: cart items list (image, name, size, qty, price), subtotal, delivery zone name + fee, grand total (subtotal + delivery). "Place Order" button (full width, `bg-nino-950`). "Back" button. Payment method note: "Cash on Delivery". Accepts `customer`, `deliveryZone`, `onPlaceOrder()`, `onBack()`, `isSubmitting` props.
- [x] T016 [US2] Create `src/components/CheckoutForm.tsx` — client component managing multi-step state. State: `step` (1-3), `customerData`, `selectedZone`, `isSubmitting`, `error`. Step transitions use Framer Motion AnimatePresence. Renders StepIndicator + current step component. On "Place Order": calls the order placement service (Phase 6), handles success (redirect to confirmation) and error (show inline error, keep cart).
- [x] T017 [US2] Create `src/app/checkout/page.tsx` — client component. Imports cart store. If cart empty: redirect to `/cart` with message. Otherwise: render CheckoutForm with cart items. Page title "Checkout | NINO JEANS". Include Footer.

**Checkpoint**: US2 complete — 3-step checkout flow with validation, delivery zone selection, and order review.

---

## Phase 5: User Story 3 — Order Placement & Persistence (Priority: P1)

**Goal**: Orders saved to Firebase with stock validation and decrement.

**Independent Test**: Place an order via checkout. Check Firestore `orders` collection — document exists with customer info, items, delivery_fee, delivery_zone, total_price, status "pending". Check the product's stock map — ordered size decremented.

### Implementation for User Story 3

- [x] T018 [US3] Extend `src/services/orders.ts` — add `placeOrder(params)` function accepting `{ items: CartItem[], customer: Customer, deliveryZone: DeliveryZone }`. Implementation: (1) For each cart item, read the product document and validate `stock[item.size] >= item.quantity`. (2) If any item fails validation, return `{ success: false, unavailableItems: [...] }`. (3) If all valid, use Firestore `writeBatch`: create order document (customer, items mapped to OrderItem[], total_price = items subtotal + zone.fee, delivery_fee = zone.fee, delivery_zone = zone.name, status = "pending", created_at = Timestamp.now()) + update each product's stock map (decrement `stock[size]` by quantity). (4) Commit batch. Return `{ success: true, orderId: string }`.
- [x] T019 [US3] Wire `placeOrder` into `src/components/CheckoutForm.tsx` — on "Place Order" click in OrderReview, call `placeOrder()` with cart items, customer data, and selected zone. On success: clear cart via `clearCart()`, redirect to `/order/{orderId}`. On failure: if unavailable items, show error listing which items/sizes are out of stock. If database error, show generic retry message. Set `isSubmitting` during the operation to disable the button and show loading state.

**Checkpoint**: US3 complete — orders saved to Firebase, stock decremented, confirmation redirect works. Stock validation rejects unavailable items.

---

## Phase 6: User Story 4 — Order Tracking (Priority: P2)

**Goal**: Order confirmation page and simple order lookup.

**Independent Test**: After placing an order, verify the confirmation page shows order ID, items, delivery info, total, and status "pending". Navigate to `/order/{id}` directly — same details shown. Navigate to `/order/fake-id` — 404 page.

### Implementation for User Story 4

- [x] T020 [P] [US4] Create `src/app/order/[id]/page.tsx` — server component. Fetch order by ID using `getOrderById()` from `src/services/orders.ts`. If not found: call `notFound()`. If found: serialize Timestamps, render order details: order ID (large, prominent), status badge (color-coded: pending=yellow, confirmed=blue, shipped=purple, delivered=green, cancelled=red), items list, customer info, delivery zone + fee, total. Include "Continue Shopping" link. Page title "Order {id} | NINO JEANS".
- [x] T021 [P] [US4] Create `src/app/order/[id]/not-found.tsx` — styled 404 page matching NINO design. "Order Not Found" heading, message, "Back to Shop" link. Same pattern as product not-found page.

**Checkpoint**: US4 complete — order confirmation shows all details, lookup works, 404 for invalid IDs.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Analytics, state verification, mobile testing, build validation.

- [x] T022 [P] Wire analytics events: `add_to_cart` in AddToCartButton (T008), `cart_remove` in CartItemRow (T010), `checkout_started` in CheckoutForm when step 1 loads (T016), `order_created` in CheckoutForm on successful placement (T019). Import `useAnalytics` hook in each component and call appropriate tracking methods.
- [x] T023 [P] Run `npm run build` and confirm zero TypeScript errors across all new and modified files
- [x] T024 Verify all 4 page states (loading, success, empty, error) on: cart page (empty/with items), checkout page (empty cart redirect/form/submitting/error), order page (loading/found/not-found)
- [x] T025 Test mobile responsive behavior: cart drawer full-width on mobile, checkout form single-column, order page readable on small screens
- [x] T026 Test full end-to-end flow: browse products → add to cart → view cart → checkout → place order → confirmation page → verify Firebase order document + stock decrement

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 + T004 (Zustand store)
- **US1 (Phase 3)**: Depends on Phase 2 (drawer + navbar wired)
- **US2 (Phase 4)**: Depends on Phase 1 (types + zones). Independent of US1
- **US3 (Phase 5)**: Depends on T016 (CheckoutForm) from US2
- **US4 (Phase 6)**: Depends on T018 (placeOrder service) from US3
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Needs Phase 2. Can start immediately after foundational
- **US2 (P1)**: Needs Phase 1 types/zones. Step components are all parallel (T012-T015). CheckoutForm (T016) depends on step components
- **US3 (P1)**: Needs US2's CheckoutForm to wire into
- **US4 (P2)**: Needs US3's order service. Independent page otherwise

### Parallel Opportunities

```
Phase 1:
  T001 → T002 → T004 (sequential: install → types → store)
  T003 (parallel with T002: different file)

Phase 2:
  T005 → T006 (sequential: drawer before navbar)

Phase 3 + Phase 4 (after Phase 2):
  T008 ─── T012 ─── T013 ─── T014 ─── T015 (all parallel)
  T009 ─── T010 ─── T011 (parallel within US1)
  T016 depends on T012-T015 (composes step components)
  T017 depends on T016

Phase 5:
  T018 → T019 (sequential: service before wiring)

Phase 6:
  T020 ─── T021 (parallel: different files)

Phase 7:
  T022 ─── T023 (parallel)
  T024 → T025 → T026 (sequential verification)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007)
3. Complete Phase 3: US1 Cart (T008-T011)
4. **STOP and VALIDATE**: Cart fully functional — add, view, edit, persist
5. This gives a working cart for user testing

### Incremental Delivery

1. Setup + Foundational → Cart store + drawer + navbar wired
2. US1 → Cart page fully functional
3. US2 → Checkout form complete (no order placement yet)
4. US3 → Orders saving to Firebase with stock decrement
5. US4 → Confirmation page + order lookup
6. Each story adds capability without breaking previous

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- T012-T015 (checkout step components) are ALL parallel — different files, no dependencies
- T018 (placeOrder) uses Firestore `writeBatch` for atomic order + stock update
- Analytics wiring (T022) is a cross-cutting task touching multiple files from earlier phases
- Cart drawer is rendered inside Navbar (not in layout.tsx) to share the open/close state
- Phone validation uses Egyptian pattern: `/^(\+20)?01[0125]\d{8}$/`
- All prices in EGP — no currency conversion needed
