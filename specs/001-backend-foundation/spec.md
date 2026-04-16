# Feature Specification: Backend Foundation Setup

**Feature Branch**: `001-backend-foundation`
**Created**: 2026-04-08
**Status**: Draft
**Input**: User description: "Plan.md phases 1-3: Project setup, Firebase integration, Cloudinary setup"

## Clarifications

### Session 2026-04-08

- Q: What are the valid order status values and transitions? → A: `pending` > `confirmed` > `processing` > `shipped` > `delivered` > `cancelled`
- Q: What are the valid product category values? → A: `Men`, `Women`, `Kids`, `Unisex` (matches existing frontend)
- Q: What Firestore security posture for development phase? → A: Open for development (allow all reads/writes), with TODO marker for Phase 14 lockdown

## User Scenarios & Testing

### User Story 1 - Secure Credential Management (Priority: P1)

As a developer, I need all third-party service credentials
stored securely so that API keys, database passwords, and
cloud secrets are never exposed in source code or version
control.

**Why this priority**: Credentials are already exposed in a
plain text file (`Firebase.txt`) committed to the repository.
This is a critical security issue that blocks all other work.
Nothing should proceed until secrets are properly secured.

**Independent Test**: Verify that `.env.local` contains all
required keys, that `.gitignore` excludes it, and that no
credentials appear in any tracked file.

**Acceptance Scenarios**:

1. **Given** the project repository, **When** a developer
   clones it fresh, **Then** no API keys, passwords, or
   secrets are visible in any tracked file.
2. **Given** an `.env.local.example` file exists, **When**
   a new developer reads it, **Then** they know exactly which
   environment variables to configure with placeholder
   descriptions (no real values).
3. **Given** `.env.local` is populated with valid credentials,
   **When** any service client is initialized, **Then** it
   reads from environment variables — never from hardcoded
   values.

---

### User Story 2 - Firebase Data Layer (Priority: P1)

As the store owner, I need a structured database to hold my
product catalog, customer orders, and user records so that the
website can display real products, accept orders, and track
customers.

**Why this priority**: The entire e-commerce platform depends
on having a working data layer. Without Firebase connected and
collections defined, no real product data can flow through the
site.

**Independent Test**: Verify that the Firebase client
initializes successfully, that the three core Firestore
collections exist with their schemas, and that basic
read/write operations work.

**Acceptance Scenarios**:

1. **Given** the Firebase client is configured, **When** the
   application starts, **Then** it connects to the
   `nino-denim` Firestore project without errors.
2. **Given** a `products` collection exists, **When** a
   product document is created with all required fields
   (name, price, images, sizes, category, stock,
   created\_at), **Then** it is persisted and retrievable.
3. **Given** an `orders` collection exists, **When** an order
   document is created with customer info, items, total price,
   status, and timestamp, **Then** it is persisted and
   retrievable.
4. **Given** a `users` collection exists, **When** a user
   document is created with profile fields, **Then** it is
   persisted and retrievable.
5. **Given** the products collection, **When** products are
   queried, **Then** results MUST be paginated — never a full
   collection fetch.

---

### User Story 3 - Cloudinary Image Management (Priority: P2)

As the store owner, I need a way to upload product images and
have them automatically optimized, resized, and delivered via
a fast CDN so that customers see high-quality images that load
quickly on any device.

**Why this priority**: Products without images cannot be sold.
However, this builds on top of the Firebase data layer (the
image URLs are stored in Firestore), making it a natural
second step after the database is working.

**Independent Test**: Verify that an image can be uploaded to
Cloudinary, that a CDN URL is returned, and that the URL is
stored in a Firestore product document.

**Acceptance Scenarios**:

1. **Given** the Cloudinary client is configured, **When** an
   image file is uploaded, **Then** it is stored in the
   Cloudinary account and a CDN URL is returned.
2. **Given** a Cloudinary URL is returned after upload,
   **When** that URL is stored in a Firestore product
   document's `images` array, **Then** the product displays
   the image via the CDN URL.
3. **Given** an image is uploaded, **When** it is served to
   users, **Then** Cloudinary automatically delivers the
   optimal format (WebP/AVIF) and size based on the
   requesting device.
4. **Given** image upload is available, **When** multiple
   images are uploaded for one product, **Then** all URLs
   are stored as an ordered array in the product document.

---

### User Story 4 - Supabase Analytics Foundation (Priority: P3)

As the store owner, I need an analytics pipeline established
so that future features (event tracking, dashboards, reports)
have a working connection and base schema to build on.

**Why this priority**: Analytics is foundational infrastructure
for Phase 11+ but the connection and base schema should be
established now alongside the other service integrations to
avoid rework later.

**Independent Test**: Verify that the Supabase client connects
successfully and that a test event can be written to and read
from an `events` table.

**Acceptance Scenarios**:

1. **Given** the Supabase client is configured, **When** it
   attempts to connect, **Then** it establishes a connection
   to the `nino-denim` Supabase project without errors.
2. **Given** an `events` table exists with the analytics
   schema (event\_type, user\_id, product\_id, metadata,
   timestamp, session\_id), **When** a test event is
   inserted, **Then** it is persisted and queryable.
3. **Given** the analytics client is available, **When** it
   writes an event, **Then** the write is non-blocking and
   does not affect frontend performance.

---

### Edge Cases

- What happens when Firebase credentials are invalid or the
  project is unreachable? The application MUST show a clear
  error state and not crash.
- What happens when Cloudinary upload fails mid-transfer?
  The system MUST handle partial failures gracefully and not
  leave orphaned references in Firestore.
- What happens when Supabase is temporarily unavailable?
  Analytics writes MUST fail silently (fire-and-forget) —
  never block the user experience.
- What happens when `.env.local` is missing required
  variables? The application MUST fail fast at startup with
  a clear message identifying which variables are missing.

## Requirements

### Functional Requirements

- **FR-001**: System MUST store all third-party credentials
  in environment variables, never in source code.
- **FR-002**: System MUST provide a Firebase client module
  that initializes a Firestore connection using environment
  variables.
- **FR-003**: System MUST define a `products` Firestore
  collection with schema: `name` (string), `price` (number),
  `images` (array of Cloudinary URL strings), `sizes` (array
  of strings), `category` (enum: `Men` | `Women` | `Kids` |
  `Unisex`), `stock` (number), `created_at` (timestamp).
- **FR-004**: System MUST define an `orders` Firestore
  collection with schema: `customer` (map), `items` (array of
  maps: `product_id` (string), `name` (string), `size`
  (string), `quantity` (number), `unit_price` (number)),
  `total_price` (number), `status` (enum: `pending` |
  `confirmed` | `processing` | `shipped` | `delivered` |
  `cancelled`), `created_at` (timestamp).
- **FR-005**: System MUST define a `users` Firestore
  collection with schema: `name` (string), `email` (string),
  `phone` (string), `orders` (array of order references),
  `created_at` (timestamp).
- **FR-006**: System MUST provide a Cloudinary client module
  that handles image upload and returns CDN URLs.
- **FR-007**: System MUST provide a Supabase client module
  that connects to the analytics database.
- **FR-008**: System MUST include an `events` table schema in
  Supabase with fields: `event_type`, `user_id`, `product_id`,
  `metadata` (JSONB), `timestamp`, `session_id`.
- **FR-009**: System MUST enforce paginated queries on all
  Firestore collection reads — full collection fetches are
  prohibited.
- **FR-010**: System MUST validate required environment
  variables at startup and fail fast with descriptive errors
  if any are missing.
- **FR-011**: Firestore Security Rules MUST be set to open
  (allow all reads/writes) for the development phase. A TODO
  marker MUST be placed in the rules file referencing Phase 14
  lockdown.

### Key Entities

- **Product**: The core catalog item. Contains name, price,
  image URLs (from Cloudinary), available sizes, category
  (`Men` | `Women` | `Kids` | `Unisex`), stock count, and
  creation timestamp. Lives in Firestore.
- **Order**: A customer purchase record. Contains customer
  details, ordered items (each with product\_id, name, size,
  quantity, unit\_price), total price, status (`pending` >
  `confirmed` > `processing` > `shipped` > `delivered` |
  `cancelled`), and creation timestamp. Lives in Firestore.
- **User**: A customer profile. Contains name, email, phone,
  and references to their orders. Lives in Firestore.
- **Event**: An analytics data point. Contains event type,
  anonymous or authenticated user ID, optional product
  reference, arbitrary metadata, timestamp, and session ID.
  Lives in Supabase.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All three service clients (Firebase, Cloudinary,
  Supabase) initialize without errors when valid credentials
  are provided.
- **SC-002**: A product can be created in Firestore with all
  schema fields and retrieved within 2 seconds.
- **SC-003**: An image can be uploaded to Cloudinary and the
  returned URL stored in Firestore within 5 seconds.
- **SC-004**: An analytics event can be written to Supabase
  without blocking the calling function.
- **SC-005**: Zero credentials are present in any version-
  controlled file.
- **SC-006**: A new developer can set up the project by
  copying `.env.local.example`, filling in values, and
  running the dev server — within 5 minutes.

## Assumptions

- The Firebase project `nino-denim` is already created and
  Firestore is enabled in the Firebase console.
- The Cloudinary account associated with the provided API
  credentials is active and has sufficient storage quota.
- The Supabase project at the provided URL is active and
  the `postgres` database is accessible with the provided
  connection string.
- Firebase Authentication is deferred to a later phase (the
  plan marks it as "optional later") — this phase uses
  Firestore only.
- The development environment is local (localhost) with
  no CI/CD pipeline configured yet.
- Payment integration is out of scope — the order collection
  stores order data but does not process payments.
- The Supabase `events` table will be created manually or
  via a migration script — this spec covers the schema
  definition and client connection, not database migrations
  tooling.
