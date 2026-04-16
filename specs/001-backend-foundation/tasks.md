# Tasks: Backend Foundation Setup

**Input**: Design documents from `specs/001-backend-foundation/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies and prepare the project for service integration.

- [x] T001 Install npm dependencies: `npm install firebase cloudinary @supabase/supabase-js` in project root
- [x] T002 [P] Create shared TypeScript interfaces in `src/lib/types.ts` defining `ProductCategory`, `OrderStatus`, `Product`, `OrderItem`, `Customer`, `Order`, `User`, and `AnalyticsEvent` per `contracts/api-routes.md`

**Checkpoint**: `npm run build` succeeds with new dependencies and types.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Secure credentials and validate environment. MUST complete before ANY user story.

**CRITICAL**: No service client can initialize until environment variables are in place.

- [x] T003 Update `.gitignore` to add `.env.local`, `.env.local.*`, and `Firebase.txt` entries
- [x] T004 [P] Create `.env.local` at project root with actual credentials extracted from `Firebase.txt`: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] T005 [P] Create `.env.local.example` at project root with placeholder descriptions for every variable in `.env.local` (no real values)
- [x] T006 Create `src/lib/env.ts` that validates all required environment variables at import time and throws a descriptive error listing any missing variables

**Checkpoint**: `npm run dev` starts without environment validation errors. `.env.local` does not appear in `git status`.

---

## Phase 3: User Story 1 — Secure Credential Management (Priority: P1)

**Goal**: All credentials secured in environment variables, no secrets in tracked files, new developers can onboard via `.env.local.example`.

**Independent Test**: Clone repo fresh, verify zero credentials in tracked files, copy `.env.local.example` to `.env.local`, fill values, run `npm run dev` — app starts cleanly.

### Implementation for User Story 1

- [x] T007 [US1] Verify `.env.local` is excluded from git by running `git status` and confirming it does not appear as untracked or modified
- [x] T008 [US1] Verify `Firebase.txt` is excluded from git tracking via `.gitignore` (file remains on disk but is not committed going forward)
- [x] T009 [US1] Verify `src/lib/env.ts` throws a clear error when any required variable is missing by temporarily removing one variable from `.env.local` and confirming the error message

**Checkpoint**: US1 complete — zero credentials in version control, env validation works, `.env.local.example` documents all required variables.

---

## Phase 4: User Story 2 — Firebase Data Layer (Priority: P1)

**Goal**: Firebase Firestore connected, three collections (products, orders, users) with typed schemas, paginated query pattern established.

**Independent Test**: Start dev server, create a test product document in Firestore via the client module, retrieve it with a paginated query, verify all schema fields are correct.

### Implementation for User Story 2

- [x] T010 [US2] Create `src/lib/firebase.ts` — initialize Firebase app as singleton using env vars from `src/lib/env.ts`, export `db` (Firestore instance) and re-export common Firestore utilities (`collection`, `doc`, `addDoc`, `getDoc`, `getDocs`, `updateDoc`, `deleteDoc`, `query`, `where`, `orderBy`, `limit`, `startAfter`, `Timestamp`)
- [x] T011 [US2] Create `src/services/products.ts` — implement `getProducts({ pageSize, lastDoc?, category?, orderByField? })` returning `{ items: Product[], lastDoc, hasMore }` using cursor-based pagination with `startAfter()` and `limit()` (default page size 12); implement `getProductById(id)`, `createProduct(data)`, `updateProduct(id, data)`
- [x] T012 [US2] Create `src/services/orders.ts` — implement `createOrder(data)` that sets initial status to `pending` and validates required fields; implement `getOrders({ pageSize, lastDoc?, status? })` with cursor pagination; implement `updateOrderStatus(id, newStatus)` that enforces the status lifecycle from data-model.md
- [x] T013 [US2] Create `src/services/users.ts` — implement `createUser(data)` with email uniqueness check (query-then-create); implement `getUserByEmail(email)`, `getUserById(id)`, `addOrderToUser(userId, orderId)`

**Checkpoint**: US2 complete — Firebase client connects, all three service modules can create and retrieve documents with typed interfaces, pagination returns correct page sizes.

---

## Phase 5: User Story 3 — Cloudinary Image Management (Priority: P2)

**Goal**: Images uploadable to Cloudinary via API route, CDN URLs returned and storable in Firestore product documents.

**Independent Test**: POST a test image to `/api/upload`, receive a Cloudinary CDN URL in the response, store that URL in a Firestore product's `images` array, verify the URL loads the image.

### Implementation for User Story 3

- [x] T014 [US3] Create `src/lib/cloudinary.ts` — configure Cloudinary v2 with server-only env vars (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`); export `uploadImage(file, folder?)` that uploads to `nino-jeans/products/` folder and returns `{ url, public_id, width, height, format }`
- [x] T015 [US3] Create `src/app/api/upload/route.ts` — POST handler that parses multipart form data, extracts the file, calls `uploadImage()` from `src/lib/cloudinary.ts`, returns JSON with CDN URL; returns 400 if no file, 500 on Cloudinary errors with error message
- [x] T016 [US3] Add `addProductImage(productId, imageUrl)` function to `src/services/products.ts` that appends a Cloudinary URL to the product's `images` array in Firestore using `arrayUnion`

**Checkpoint**: US3 complete — image upload API route works end-to-end, returned URLs are valid Cloudinary CDN links, URLs can be stored in and retrieved from Firestore product documents.

---

## Phase 6: User Story 4 — Supabase Analytics Foundation (Priority: P3)

**Goal**: Supabase client connected, events table schema established, `trackEvent()` helper works as fire-and-forget.

**Independent Test**: Call `trackEvent({ event_type: 'test_event' })`, verify the row appears in Supabase `events` table via the dashboard, confirm no errors thrown to caller.

### Implementation for User Story 4

- [x] T017 [US4] Create Supabase `events` table by running the SQL DDL from `data-model.md` in the Supabase SQL Editor (includes table, indexes, and RLS policies)
- [x] T018 [US4] Create `src/lib/supabase.ts` — initialize Supabase client as singleton using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env vars; export `supabase` client; implement and export `trackEvent(event)` that inserts into `events` table with try/catch wrapping (logs errors via `console.error`, never throws)

**Checkpoint**: US4 complete — Supabase client connects, `trackEvent()` inserts events without blocking, errors are logged silently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and build validation.

- [x] T019 [P] Verify all three service clients initialize without errors on `npm run dev` — check browser console and terminal for Firebase, Cloudinary, and Supabase connection issues
- [x] T020 [P] Run `npm run build` and confirm zero TypeScript errors across all new files in `src/lib/` and `src/services/` and `src/app/api/`
- [x] T021 Verify the existing `src/lib/products.ts` (mock data) does not conflict with the new `src/services/products.ts` (Firestore service); ensure imports in existing components still resolve correctly
- [x] T022 Run through `quickstart.md` end-to-end: fresh `.env.local` setup, dev server start, Cloudinary upload test, Supabase event test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (npm install) from Setup
- **US1 (Phase 3)**: Depends on Phase 2 completion (env vars must exist)
- **US2 (Phase 4)**: Depends on Phase 2 completion (env vars + types)
- **US3 (Phase 5)**: Depends on Phase 2 + T010 from US2 (Firebase client needed for image URL storage)
- **US4 (Phase 6)**: Depends on Phase 2 completion only (independent of Firebase)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can verify after Phase 2 — no other story dependency
- **US2 (P1)**: Can start after Phase 2 — independent of US1 verification
- **US3 (P2)**: Needs US2's Firebase client (T010) — can start T014 in parallel with US2 implementation, but T016 depends on T011
- **US4 (P3)**: Fully independent after Phase 2 — can run in parallel with US2 and US3

### Within Each User Story

- Service modules before API routes
- Core CRUD before specialized operations
- Integration tasks after core implementation

### Parallel Opportunities

```
Phase 1:
  T001 ─── T002 (parallel: different concerns)

Phase 2:
  T003 ─── T004 ─── T005 (parallel: different files)
       └── T006 (sequential: needs env var names from T004)

Phase 4 + Phase 5 + Phase 6 (after Phase 2):
  T010 ─── T014 ─── T017 (parallel: different services)
  T011 ─── T015 ─── T018 (parallel: different files)
  T012 ──┘
  T013 ──┘

Phase 7:
  T019 ─── T020 (parallel: different checks)
       └── T021 ─── T022 (sequential: verification flow)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T006)
3. Complete Phase 3: US1 verification (T007-T009)
4. Complete Phase 4: US2 Firebase (T010-T013)
5. **STOP and VALIDATE**: Test product CRUD + pagination
6. This gives you a working Firestore backend ready for the shop page

### Incremental Delivery

1. Setup + Foundational → Environment ready
2. US1 + US2 → Firebase working → Can wire real products to shop page
3. US3 → Image upload → Can add real product photos
4. US4 → Analytics → Ready for event tracking in future phases
5. Each story adds capability without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- T017 (Supabase SQL) is a manual step in the Supabase dashboard, not a code task
- The existing `src/lib/products.ts` mock data file will coexist with the new `src/services/products.ts` Firestore service — they serve different purposes until the frontend is wired to Firebase
