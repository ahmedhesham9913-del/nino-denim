# Data Model: Backend Foundation Setup

**Date**: 2026-04-08
**Branch**: `001-backend-foundation`

## Firestore Collections

### products

| Field        | Type                | Required | Notes                                          |
|--------------|---------------------|----------|------------------------------------------------|
| name         | string              | Yes      | Product display name                           |
| price        | number              | Yes      | Current selling price in USD                   |
| images       | array\<string\>     | Yes      | Ordered Cloudinary CDN URLs                    |
| sizes        | array\<string\>     | Yes      | Available sizes (e.g., "28", "30", "S", "M")   |
| category     | string (enum)       | Yes      | `Men` \| `Women` \| `Kids` \| `Unisex`        |
| stock        | number              | Yes      | Units available (0 = out of stock)             |
| created_at   | Timestamp           | Yes      | Firestore server timestamp                     |

**Identity**: Auto-generated Firestore document ID.
**Ordering**: Default sort by `created_at` descending.
**Pagination**: Cursor-based via `startAfter()`, page size 12.

---

### orders

| Field        | Type                | Required | Notes                                          |
|--------------|---------------------|----------|------------------------------------------------|
| customer     | map                 | Yes      | See Customer sub-schema below                  |
| items        | array\<map\>        | Yes      | See OrderItem sub-schema below                 |
| total_price  | number              | Yes      | Sum of all item quantities * unit prices        |
| status       | string (enum)       | Yes      | See Status Lifecycle below                     |
| created_at   | Timestamp           | Yes      | Firestore server timestamp                     |

**Customer sub-schema**:

| Field    | Type   | Required | Notes                       |
|----------|--------|----------|-----------------------------|
| name     | string | Yes      | Full name                   |
| phone    | string | Yes      | Contact phone               |
| address  | string | Yes      | Delivery address            |
| email    | string | No       | Optional email              |

**OrderItem sub-schema**:

| Field      | Type   | Required | Notes                                |
|------------|--------|----------|--------------------------------------|
| product_id | string | Yes      | Firestore document ID reference      |
| name       | string | Yes      | Product name snapshot at order time   |
| size       | string | Yes      | Selected size                        |
| quantity   | number | Yes      | Units ordered (min 1)                |
| unit_price | number | Yes      | Price per unit at order time         |

**Status Lifecycle**:

```
pending → confirmed → processing → shipped → delivered
   ↓         ↓           ↓           ↓
cancelled  cancelled   cancelled   cancelled
```

- Initial status on creation: `pending`
- `cancelled` is reachable from any pre-`delivered` state
- `delivered` is a terminal state
- `cancelled` is a terminal state

---

### users

| Field      | Type                | Required | Notes                              |
|------------|---------------------|----------|------------------------------------|
| name       | string              | Yes      | Display name                       |
| email      | string              | Yes      | Unique identifier                  |
| phone      | string              | No       | Contact phone                      |
| orders     | array\<string\>     | No       | Array of order document IDs        |
| created_at | Timestamp           | Yes      | Firestore server timestamp         |

**Identity**: Auto-generated Firestore document ID.
**Uniqueness**: `email` should be unique (enforced at app level
since Firestore has no unique constraints).

---

## Supabase Tables

### events

| Column      | Type        | Nullable | Notes                                    |
|-------------|-------------|----------|------------------------------------------|
| id          | uuid        | No       | Primary key, auto-generated              |
| event_type  | text        | No       | e.g., `product_view`, `add_to_cart`      |
| user_id     | text        | Yes      | Anonymous session ID or auth user ID     |
| product_id  | text        | Yes      | Firestore product document ID            |
| metadata    | jsonb       | Yes      | Arbitrary event-specific data            |
| timestamp   | timestamptz | No       | Event occurrence time (default: now())   |
| session_id  | text        | Yes      | Browser session identifier               |

**SQL DDL**:

```sql
CREATE TABLE IF NOT EXISTS events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  text NOT NULL,
  user_id     text,
  product_id  text,
  metadata    jsonb DEFAULT '{}',
  timestamp   timestamptz DEFAULT now() NOT NULL,
  session_id  text
);

-- Index for common query patterns
CREATE INDEX idx_events_type_ts ON events (event_type, timestamp DESC);
CREATE INDEX idx_events_product ON events (product_id, timestamp DESC);

-- RLS: Allow inserts from anon, restrict reads to service role
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON events FOR INSERT TO anon
  WITH CHECK (true);
CREATE POLICY "service_read" ON events FOR SELECT TO service_role
  USING (true);
```

---

## Relationships

```
Product ──1:N──→ Order.items[].product_id (reference)
User ──1:N──→ Order (via users.orders[] document IDs)
Product ──1:N──→ Event.product_id (analytics reference, cross-database)
User ──1:N──→ Event.user_id (analytics reference, cross-database)
```

**Cross-database note**: Product/User live in Firestore while
Events live in Supabase. References are by string ID only —
no foreign key enforcement across databases. Application code
MUST handle missing references gracefully.
