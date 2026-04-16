# Data Model: Cart, Checkout & Order System

**Date**: 2026-04-08
**Branch**: `003-cart-checkout-orders`

## Client-Side: Cart (Browser Storage)

Cart items are stored locally via Zustand + localStorage.
NOT persisted in the database until order placement.

### Cart Item

| Field      | Type   | Notes                              |
|------------|--------|------------------------------------|
| productId  | string | Firestore product document ID      |
| name       | string | Product name (snapshot at add time) |
| image      | string | First product image URL             |
| size       | string | Selected size                      |
| quantity   | number | Units (min 1)                      |
| price      | number | Unit price at add time (EGP)       |

**Identity**: `productId + size` is the unique key.
Adding the same product+size increments quantity.
Adding the same product with a different size creates
a new cart item.

### Cart State

| Property    | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| items       | CartItem[]   | All cart items                 |
| addItem     | function     | Add or increment               |
| removeItem  | function     | Remove by productId + size     |
| updateQty   | function     | Set quantity for item           |
| clearCart   | function     | Remove all items               |
| totalItems  | computed     | Sum of all quantities           |
| totalPrice  | computed     | Sum of qty * price for all items |

---

## Server-Side: Order (Firestore)

### orders collection (extended from 001)

| Field         | Type                | Required | Notes                                          |
|---------------|---------------------|----------|-------------------------------------------------|
| customer      | map                 | Yes      | See Customer sub-schema                        |
| items         | array\<map\>        | Yes      | See OrderItem sub-schema                       |
| total_price   | number              | Yes      | Items subtotal + delivery fee (EGP)            |
| delivery_fee  | number              | Yes      | **(NEW)** Delivery fee in EGP                  |
| delivery_zone | string              | Yes      | **(NEW)** Zone name (e.g., "Cairo")            |
| status        | string (enum)       | Yes      | Initial: `pending`                             |
| created_at    | Timestamp           | Yes      | Firestore server timestamp                     |

**Customer sub-schema** (unchanged):

| Field    | Type   | Required |
|----------|--------|----------|
| name     | string | Yes      |
| phone    | string | Yes      |
| address  | string | Yes      |
| email    | string | No       |

**OrderItem sub-schema** (unchanged):

| Field      | Type   | Required |
|------------|--------|----------|
| product_id | string | Yes      |
| name       | string | Yes      |
| size       | string | Yes      |
| quantity   | number | Yes      |
| unit_price | number | Yes      |

---

## Delivery Zones (Hardcoded)

| Zone               | Fee (EGP) |
|--------------------|-----------|
| Cairo              | 30        |
| Giza / Alexandria  | 50        |
| Other Governorates | 80        |

Stored as a constant array. Configurable via admin
dashboard in Phase 10.

---

## Stock Decrement Logic

When an order is placed:
1. For each order item, read the product's `stock` map
2. Validate `stock[size] >= quantity` for each item
3. If all valid: batch write to decrement each
   `stock[size]` by the ordered quantity
4. If any invalid: reject order, list unavailable items

```
products/{id}.stock["32"] -= orderItem.quantity
```
