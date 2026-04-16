# Research: Backend Foundation Setup

**Date**: 2026-04-08
**Branch**: `001-backend-foundation`

## R1: Firebase Web SDK for Next.js App Router

**Decision**: Use `firebase` v10+ client SDK with modular
(tree-shakable) imports. Initialize in `src/lib/firebase.ts`
as a singleton.

**Rationale**: The modular SDK (`firebase/app`, `firebase/firestore`)
is the recommended approach for modern web apps. Tree-shakable
imports keep the bundle small. A singleton pattern ensures one
Firestore instance across the app.

**Alternatives considered**:
- Firebase Admin SDK: Server-only, cannot be used in client
  components. Would require API routes for all reads. Overkill
  for development phase without auth.
- `firebase-admin` + client SDK hybrid: Adds complexity.
  Deferred to auth phase when server-side operations are needed.

**Key patterns**:
- `getFirestore()` from `firebase/firestore`
- `collection()`, `doc()`, `addDoc()`, `getDocs()`,
  `query()`, `limit()`, `startAfter()`, `orderBy()`
  for paginated reads
- `Timestamp.now()` for `created_at` fields

---

## R2: Cloudinary Upload Strategy

**Decision**: Use the Cloudinary Upload API via a Next.js
API route (server-side). The client sends the image to our
API route, which forwards to Cloudinary using the Node.js SDK.

**Rationale**: Direct browser-to-Cloudinary uploads expose the
API secret to the client. An API route keeps the secret
server-side while still being simple to implement.

**Alternatives considered**:
- Unsigned uploads with upload presets: Simpler but less
  control over folder structure and transformations.
- Direct signed uploads from browser: Requires generating
  signatures server-side anyway.

**Key patterns**:
- `cloudinary` npm package (v2) for Node.js
- `cloudinary.v2.uploader.upload()` in API route
- Configure `cloud_name`, `api_key`, `api_secret` from env
- Folder organization: `nino-jeans/products/`
- Automatic format/quality: `f_auto,q_auto` in delivery URLs

---

## R3: Supabase Client for Analytics

**Decision**: Use `@supabase/supabase-js` v2 client SDK.
Initialize in `src/lib/supabase.ts` as a singleton using
the anon key (public) for analytics event inserts.

**Rationale**: The JS client is lightweight and supports
both browser and server environments. Using the anon key with
Row Level Security (RLS) policies allows insert-only access
from the frontend — no reads of other users' data.

**Alternatives considered**:
- Direct PostgreSQL connection via Prisma/Drizzle: More
  powerful but heavier dependency. Analytics inserts don't
  need an ORM.
- Supabase Edge Functions: Adds latency for simple inserts.
  Better suited for complex server-side logic later.

**Key patterns**:
- `createClient(url, anonKey)` from `@supabase/supabase-js`
- `.from('events').insert()` for fire-and-forget writes
- Wrap in try/catch with `console.error` — never throw

---

## R4: Environment Variable Management

**Decision**: Use Next.js built-in `.env.local` with
`NEXT_PUBLIC_` prefix for client-accessible variables and
no prefix for server-only secrets.

**Rationale**: Next.js natively supports `.env.local` without
extra configuration. The `NEXT_PUBLIC_` prefix controls which
variables are bundled into client code vs. available only on
the server — critical for keeping Cloudinary secrets safe.

**Key mapping**:
- `NEXT_PUBLIC_FIREBASE_API_KEY` — client (safe to expose)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — client
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — client
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — client
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` — client
- `NEXT_PUBLIC_FIREBASE_APP_ID` — client
- `CLOUDINARY_CLOUD_NAME` — server-only
- `CLOUDINARY_API_KEY` — server-only
- `CLOUDINARY_API_SECRET` — server-only
- `NEXT_PUBLIC_SUPABASE_URL` — client (safe to expose)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client (safe with RLS)

---

## R5: Pagination Strategy for Firestore

**Decision**: Cursor-based pagination using `startAfter()`
with `limit()` and `orderBy()`. Page size default: 12 items
(matches the 3/4-column grid layout).

**Rationale**: Cursor-based pagination is Firestore's native
approach and performs well at scale. Offset-based pagination
is not supported in Firestore without workarounds.

**Key patterns**:
- First page: `query(collection, orderBy('created_at', 'desc'), limit(12))`
- Next page: `query(collection, orderBy('created_at', 'desc'), startAfter(lastDoc), limit(12))`
- Track `lastDoc` snapshot for cursor position
- Return `{ items, hasMore, lastDoc }` from query functions

---

## R6: TypeScript Type Definitions

**Decision**: Define shared TypeScript interfaces in
`src/lib/types.ts` for all Firestore document shapes.
Use discriminated unions for order status.

**Rationale**: Centralized types prevent schema drift between
service modules and ensure compile-time validation of document
shapes across the codebase.
