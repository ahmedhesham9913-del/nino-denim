# Feature Specification: Cart, Checkout & Order System

**Feature Branch**: `003-cart-checkout-orders`
**Created**: 2026-04-08
**Status**: Draft
**Input**: User description: "Plan.md phases 7-9: Cart system, checkout system, order system"

## Clarifications

### Session 2026-04-08

- Q: What delivery zones and fees should be used? → A: 3 zones: Cairo (30 EGP), Giza/Alexandria (50 EGP), Other Governorates (80 EGP)
- Q: What cart UI pattern — full page, drawer, or both? → A: Slide-over drawer (bag icon click) + full `/cart` page (for detailed editing)

## User Scenarios & Testing

### User Story 1 - Shopping Cart (Priority: P1)

As a customer browsing the store, I need a persistent
shopping cart so that I can add multiple products with
specific sizes and quantities, review my selections, and
modify them before proceeding to checkout.

**Why this priority**: The cart is the bridge between
browsing and buying. Without it, the "Add to Cart" buttons
on product pages are non-functional and no commerce can
happen.

**Independent Test**: Add a product with size "32" to the
cart from the product detail page. Add a second product.
Navigate to the cart page. Verify both items show with
correct sizes and quantities. Change quantity of first
item. Remove second item. Refresh the page — verify cart
persists.

**Acceptance Scenarios**:

1. **Given** a customer is on a product detail page with a
   size selected, **When** they click "Add to Cart",
   **Then** the product is added to the cart with the
   selected size and quantity of 1.
2. **Given** an item is already in the cart with size "32",
   **When** the customer adds the same product with size
   "32" again, **Then** the quantity increments by 1
   (not a duplicate entry).
3. **Given** a customer adds the same product but with a
   different size, **When** viewing the cart, **Then** it
   appears as a separate line item (size "30" and size "32"
   are distinct cart items).
4. **Given** items are in the cart, **When** the customer
   navigates to the cart page, **Then** all items are
   displayed with: product name, image, selected size,
   quantity, unit price, and line total.
5. **Given** the cart page is open, **When** the customer
   changes the quantity of an item, **Then** the line
   total and cart total update instantly.
6. **Given** the cart page is open, **When** the customer
   clicks "Remove" on an item, **Then** the item is
   removed and the cart total updates.
7. **Given** items are in the cart, **When** the customer
   closes the browser and returns later, **Then** the
   cart contents are preserved.
8. **Given** the cart has items, **When** the customer
   views any page, **Then** the navbar cart icon shows
   the total item count as a badge number.
9. **Given** the customer clicks the navbar bag icon,
   **When** items are in the cart, **Then** a slide-over
   drawer opens showing a quick cart summary with items,
   total, and a "View Cart" button linking to `/cart`.
10. **Given** the cart drawer is open, **When** the
    customer clicks "Checkout", **Then** they proceed
    directly to `/checkout`.
11. **Given** the cart is empty, **When** the customer
    visits the cart page, **Then** an empty state is shown
    with a "Continue Shopping" link to `/products`.

---

### User Story 2 - Checkout Flow (Priority: P1)

As a customer ready to purchase, I need a checkout process
where I can enter my delivery information, see delivery
fees, review my order summary, and confirm the purchase.

**Why this priority**: Checkout is the revenue conversion
point. Without it, the store cannot accept orders. This
is the most critical business-facing feature alongside the
cart.

**Independent Test**: Add items to cart. Click "Checkout".
Fill in customer form (name, phone, address). Select
delivery zone. Verify delivery fee is calculated. Review
order summary showing items + delivery fee = total. Click
"Place Order". Verify success confirmation.

**Acceptance Scenarios**:

1. **Given** a customer has items in the cart, **When**
   they click "Checkout" or "Proceed to Checkout",
   **Then** they are taken to the checkout page.
2. **Given** the checkout page is loaded, **When** the
   customer views the form, **Then** it shows a multi-step
   layout: Step 1 (Customer Info), Step 2 (Delivery),
   Step 3 (Review & Pay).
3. **Given** Step 1 is active, **When** the customer fills
   in name, phone, and address, **Then** all fields are
   validated (name required, phone format validated,
   address required). Errors appear inline.
4. **Given** Step 2 is active, **When** the customer
   selects a delivery zone, **Then** the delivery fee is
   displayed and added to the order total.
5. **Given** Step 3 is active, **When** the customer
   reviews the order, **Then** they see: all cart items
   with sizes/quantities/prices, delivery fee, and grand
   total.
6. **Given** the order summary is reviewed, **When** the
   customer clicks "Place Order", **Then** the order is
   submitted and a success confirmation page is shown with
   an order reference number.
7. **Given** an order is successfully placed, **When** the
   confirmation page loads, **Then** the cart is cleared.
8. **Given** the checkout page is loaded, **When** the
   customer's cart is empty (e.g., they navigated directly
   to `/checkout`), **Then** they are redirected to the
   cart page with a message.
9. **Given** the customer is on any checkout step, **When**
   they click "Back", **Then** they return to the previous
   step without losing entered data.

---

### User Story 3 - Order Placement & Persistence (Priority: P1)

As the store owner, I need customer orders saved to the
database with all details so that I can fulfill them and
track their status.

**Why this priority**: Without order persistence, placed
orders would be lost. This is the fundamental business
operation — converting cart items into a trackable order
record.

**Independent Test**: Place an order via checkout. Verify
the order document appears in the database with correct
customer info, items, total price, delivery fee, and status
"pending". Verify the order ID matches the confirmation page.

**Acceptance Scenarios**:

1. **Given** a customer completes checkout, **When** the
   order is submitted, **Then** a new order document is
   created in the database with: customer details, all
   cart items (product ID, name, size, quantity, unit
   price), delivery fee, total price, status "pending",
   and timestamp.
2. **Given** an order is created, **When** the confirmation
   page loads, **Then** the customer sees the order
   reference number (the document ID).
3. **Given** an order contains items with per-size stock,
   **When** the order is placed, **Then** the stock for
   each ordered size is decremented in the product
   document.
4. **Given** a customer tries to order a quantity exceeding
   available stock for a size, **When** they submit the
   order, **Then** the order is rejected with a clear
   message identifying which items are unavailable.
5. **Given** an order is successfully placed, **When** the
   store owner views the database, **Then** the order
   document contains all information needed to fulfill
   the order without additional lookups.

---

### User Story 4 - Order Tracking for Customer (Priority: P2)

As a customer who placed an order, I need to see a
confirmation page with my order details and a way to look
up my order status later.

**Why this priority**: Post-purchase confidence reduces
support inquiries and builds trust. However, a full order
history portal is deferred — this phase only covers the
immediate confirmation and a simple lookup page.

**Independent Test**: After placing an order, note the order
ID from the confirmation page. Navigate to
`/order/{orderId}`. Verify order details and current status
are displayed.

**Acceptance Scenarios**:

1. **Given** an order was just placed, **When** the
   confirmation page loads, **Then** it shows: order ID,
   ordered items summary, delivery details, total paid,
   and current status ("pending").
2. **Given** a customer has an order ID, **When** they
   navigate to `/order/{orderId}`, **Then** the order
   details and current status are displayed.
3. **Given** an invalid order ID, **When** a customer
   visits `/order/{invalidId}`, **Then** a "Order not
   found" message is displayed.
4. **Given** the order status changes (e.g., from "pending"
   to "confirmed"), **When** the customer revisits the
   order page, **Then** the updated status is displayed.

---

### Edge Cases

- What happens when a product is deleted or goes out of
  stock between adding to cart and checkout? The checkout
  MUST validate stock availability before placing the order
  and show a clear message for unavailable items.
- What happens when the customer refreshes during checkout?
  Entered form data MUST persist within the session.
- What happens when the order placement fails (e.g.,
  database error)? The customer MUST see an error with a
  "Try Again" option — the cart MUST NOT be cleared.
- What happens when two customers try to order the last
  item of a size simultaneously? The first order succeeds;
  the second receives an "out of stock" error for that size.
- What happens when the customer enters an invalid phone
  number format? Inline validation MUST show the error
  before they can proceed to the next step.
- What happens when the delivery address is outside all
  defined delivery zones? A clear "We don't deliver to
  this area yet" message MUST be shown.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a persistent shopping cart
  that survives page navigation and browser close (stored
  locally on the customer's device).
- **FR-002**: Cart MUST store: product ID, product name,
  product image URL, selected size, quantity, and unit price.
- **FR-003**: Adding the same product + size combination
  MUST increment quantity, not create a duplicate.
- **FR-004**: Cart page MUST display all items with line
  totals and a cart summary total.
- **FR-005**: Cart MUST support quantity adjustment (increase,
  decrease, minimum 1) and item removal.
- **FR-006**: Navbar cart icon MUST display the total item
  count across all pages. Clicking the icon MUST open a
  slide-over cart drawer with a quick summary. The drawer
  includes a "View Cart" link to `/cart` and a "Checkout"
  button to `/checkout`.
- **FR-007**: Checkout MUST use a multi-step form: Customer
  Info, Delivery, Review & Pay.
- **FR-008**: Customer form MUST collect: name (required),
  phone (required, validated format), address (required),
  email (optional).
- **FR-009**: Delivery step MUST show 3 selectable delivery
  zones: Cairo (30 EGP), Giza/Alexandria (50 EGP), Other
  Governorates (80 EGP). Currency is Egyptian Pounds (EGP).
- **FR-010**: Review step MUST display: all items, delivery
  fee, and grand total before order confirmation.
- **FR-011**: Payment method for initial launch MUST be
  Cash on Delivery only.
- **FR-012**: Placing an order MUST create an order document
  in the database with all required fields (customer, items,
  total_price, delivery_fee, status "pending", created_at).
- **FR-013**: Placing an order MUST decrement per-size stock
  in the product documents.
- **FR-014**: Stock MUST be validated at checkout time —
  reject orders for items that are no longer available.
- **FR-015**: A success confirmation page MUST display the
  order reference number after successful placement.
- **FR-016**: Cart MUST be cleared after successful order
  placement.
- **FR-017**: Order lookup page at `/order/{id}` MUST
  display order details and current status.
- **FR-018**: Cart page MUST show an empty state with
  "Continue Shopping" link when no items are present.
- **FR-019**: Checkout MUST redirect to cart if the cart
  is empty.
- **FR-020**: All checkout form data MUST persist within
  the session when navigating between steps.
- **FR-021**: Analytics events MUST be tracked:
  `add_to_cart`, `cart_remove`, `checkout_started`,
  `order_created`.

### Key Entities

- **Cart Item**: A product + size + quantity combination
  stored on the customer's device. Not persisted in the
  database until order placement.
- **Delivery Zone**: A named region with an associated
  delivery fee. Three zones: Cairo (30 EGP),
  Giza/Alexandria (50 EGP), Other Governorates (80 EGP).
  Initially hardcoded, configurable via dashboard in Phase 10.
- **Order** (existing, extended): The database record
  created at checkout. Extended with `delivery_fee` and
  `delivery_zone` fields.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A customer can add a product to the cart and
  complete checkout in under 3 minutes.
- **SC-002**: Cart persists across browser sessions with
  100% reliability.
- **SC-003**: Order is saved to the database within 2
  seconds of clicking "Place Order".
- **SC-004**: Stock is correctly decremented for 100% of
  placed orders (no overselling).
- **SC-005**: All checkout form validations trigger before
  the customer can proceed to the next step.
- **SC-006**: The confirmation page displays within 1
  second after order placement.
- **SC-007**: Analytics events are recorded for at least
  90% of cart and checkout interactions.
- **SC-008**: Zero orders are lost due to database errors
  (failed placements keep the cart intact for retry).

## Assumptions

- The 001-backend-foundation and 002-storefront-integration
  features are complete — Firebase services, product detail
  pages, and the "Add to Cart" button UI all exist.
- Payment is Cash on Delivery only for this phase. Online
  payment (Stripe/Paymob) is deferred to a future phase.
- Delivery zones and fees are hardcoded as 3 zones:
  Cairo (30 EGP), Giza/Alexandria (50 EGP), Other
  Governorates (80 EGP). Configurable in Phase 10.
- All prices are in Egyptian Pounds (EGP).
- User authentication is not required for checkout.
  Customers are identified by the information they provide
  in the checkout form, not by a login.
- The order confirmation page uses the database document ID
  as the order reference number — no separate order number
  sequence is needed.
- Stock validation happens at order placement time, not
  during cart addition (to avoid unnecessarily blocking
  the browsing experience).
- The customer's cart is stored on their device (browser
  storage), not in the database. If they switch devices,
  the cart does not follow.
