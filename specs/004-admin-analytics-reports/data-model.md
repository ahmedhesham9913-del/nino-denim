# Data Model: Admin Dashboard, Analytics & Reports

**Date**: 2026-04-08
**Branch**: `004-admin-analytics-reports`

## New Firestore Collection: delivery_zones

| Field | Type   | Required | Notes                    |
|-------|--------|----------|--------------------------|
| name  | string | Yes      | Zone display name        |
| fee   | number | Yes      | Delivery fee in EGP      |

**Identity**: Auto-generated Firestore document ID.
**Seed data**: Migrated from hardcoded constants (Cairo 30,
Giza/Alexandria 50, Other Governorates 80).

---

## Existing Collections (no schema changes)

### products
Used for: product CRUD, inventory management.
All fields from 002-storefront-integration data model.

### orders
Used for: order management, status transitions.
All fields from 003-cart-checkout-orders data model
(including delivery_fee, delivery_zone).

---

## Supabase Analytics Queries

### Summary Cards

```sql
-- Total orders today
SELECT COUNT(*) FROM events
WHERE event_type = 'order_created'
AND timestamp >= CURRENT_DATE;

-- Total product views today
SELECT COUNT(*) FROM events
WHERE event_type = 'product_view'
AND timestamp >= CURRENT_DATE;
```

Note: Revenue comes from Firestore orders (sum of
total_price for orders created today), not Supabase.

### Most Viewed Products (Top 10)

```sql
SELECT product_id, COUNT(*) as view_count
FROM events
WHERE event_type = 'product_view'
AND timestamp >= :start_date
AND timestamp <= :end_date
GROUP BY product_id
ORDER BY view_count DESC
LIMIT 10;
```

Product names resolved client-side from Firestore.

### Conversion Funnel

```sql
SELECT event_type, COUNT(DISTINCT session_id) as sessions
FROM events
WHERE event_type IN ('product_view', 'add_to_cart',
  'checkout_started', 'order_created')
AND timestamp >= :start_date
AND timestamp <= :end_date
GROUP BY event_type;
```

### Daily Revenue (from Firestore orders)

Query Firestore orders collection grouped by date.
Sum `total_price` per day for the last 30 days.

### Top Customers

Query Firestore orders grouped by `customer.phone`
(unique identifier since no auth). Sum `total_price`
and count orders per customer.
