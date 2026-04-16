# Implementation Plan: Backend Foundation Setup

**Branch**: `001-backend-foundation` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-backend-foundation/spec.md`

## Summary

Establish the backend service layer for the NINO JEANS
e-commerce platform: secure credential management, Firebase
Firestore integration with typed collections (products,
orders, users), Cloudinary image upload via API route, and
Supabase analytics foundation. All three services initialized
as typed singletons in `src/lib/` with environment variable
validation at startup.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+
**Primary Dependencies**: firebase v10+, cloudinary v2, @supabase/supabase-js v2
**Storage**: Firebase Firestore (products, orders, users), Supabase PostgreSQL (events)
**Testing**: Manual verification via dev server and Supabase dashboard
**Target Platform**: Next.js 16 App Router on Vercel
**Project Type**: Web application (e-commerce)
**Performance Goals**: Service client init < 1s, paginated queries < 2s, image upload < 5s
**Constraints**: No full collection fetches, no images in Firebase, no analytics in Firebase
**Scale/Scope**: ~200 products initial, growing to 1000+; ~100 orders/day initial

## Constitution Check

*GATE: Must pass before implementation. Re-checked after design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Visual Supremacy | N/A | Backend-only feature, no UI changes |
| II. Motion With Purpose | N/A | Backend-only feature |
| III. Separation of Concerns | PASS | Firebase=data, Cloudinary=media, Supabase=analytics — strict separation enforced |
| IV. Performance-First Commerce | PASS | Cursor-based pagination (FR-009), Cloudinary CDN delivery, page size 12 |
| V. Mobile-Native, Desktop-Enhanced | N/A | Backend-only feature |
| VI. Typography as Architecture | N/A | Backend-only feature |
| VII. Data-Driven Decision Making | PASS | Supabase events table with schema matching constitution's required fields |
| VIII. Progressive Disclosure | N/A | Backend-only feature |
| IX. Color as Identity | N/A | Backend-only feature |
| X. Production-Grade Quality | PASS | Env validation at startup (FR-010), error handling in edge cases, typed interfaces |

**Result**: All applicable gates PASS. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-foundation/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Entity schemas and relationships
├── quickstart.md        # Developer setup guide
├── contracts/
│   └── api-routes.md    # API and module interface contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (new files)

```text
src/
├── lib/
│   ├── firebase.ts      # Firebase client singleton
│   ├── cloudinary.ts    # Cloudinary upload helper (server-only)
│   ├── supabase.ts      # Supabase client + trackEvent
│   ├── types.ts         # Shared TypeScript interfaces
│   └── env.ts           # Environment variable validation
└── app/
    └── api/
        └── upload/
            └── route.ts # POST /api/upload (Cloudinary proxy)

Root files:
├── .env.local           # Real credentials (git-ignored)
├── .env.local.example   # Template with placeholders
└── .gitignore           # Updated to exclude .env.local
```

**Structure Decision**: Single Next.js project with service
modules in `src/lib/`. API routes in `src/app/api/` for
server-side operations (Cloudinary upload). No separate
backend directory — Next.js serves both frontend and API.

## Complexity Tracking

No constitution violations to justify.

## Dependencies

### New npm packages

| Package | Version | Purpose |
|---------|---------|---------|
| `firebase` | ^10.x | Firestore client SDK (modular/tree-shakable) |
| `cloudinary` | ^2.x | Image upload and management (server-only) |
| `@supabase/supabase-js` | ^2.x | Analytics event tracking |

### External services

| Service | Project | Status |
|---------|---------|--------|
| Firebase Firestore | `nino-denim` | Assumed active (from Firebase.txt) |
| Cloudinary | `deh0z0hx7` | Assumed active (from Firebase.txt) |
| Supabase | `vwrkdsbviozpwcwfspwa` | Assumed active (from Firebase.txt) |

## Implementation Phases

### Phase 1: Environment & Security (US1)

**Files**: `.env.local`, `.env.local.example`, `.gitignore`, `src/lib/env.ts`

1. Update `.gitignore` to include `.env.local` and `Firebase.txt`
2. Create `.env.local` with actual credentials from `Firebase.txt`
3. Create `.env.local.example` with placeholder descriptions
4. Create `src/lib/env.ts` — validates all required env vars at import time, throws descriptive error if any missing
5. Install npm dependencies: `firebase`, `cloudinary`, `@supabase/supabase-js`

**Checkpoint**: `npm run dev` starts without env errors.

### Phase 2: TypeScript Types (US2 prerequisite)

**Files**: `src/lib/types.ts`

1. Define `ProductCategory`, `OrderStatus` union types
2. Define `Product`, `OrderItem`, `Customer`, `Order`, `User` interfaces
3. Define `AnalyticsEvent` interface
4. All interfaces match data-model.md schemas exactly

**Checkpoint**: Types compile without errors.

### Phase 3: Firebase Integration (US2)

**Files**: `src/lib/firebase.ts`

1. Initialize Firebase app with config from env vars (singleton pattern)
2. Export `db` (Firestore instance)
3. Re-export commonly used Firestore utilities for convenience
4. Validate env vars via `src/lib/env.ts` import

**Checkpoint**: Firebase client initializes without errors on dev server start.

### Phase 4: Cloudinary Integration (US3)

**Files**: `src/lib/cloudinary.ts`, `src/app/api/upload/route.ts`

1. Create `src/lib/cloudinary.ts` — configure Cloudinary with server-only env vars, export `uploadImage()` helper
2. Create `src/app/api/upload/route.ts` — POST handler that accepts multipart form data, calls `uploadImage()`, returns CDN URL

**Checkpoint**: `POST /api/upload` with a test image returns a Cloudinary CDN URL.

### Phase 5: Supabase Integration (US4)

**Files**: `src/lib/supabase.ts`

1. Initialize Supabase client with URL and anon key from env vars
2. Implement `trackEvent()` — fire-and-forget insert into `events` table
3. Wrap in try/catch: log errors to console, never throw

**Note**: The `events` table must be created in Supabase SQL Editor manually (see quickstart.md).

**Checkpoint**: `trackEvent({ event_type: 'test' })` inserts a row in Supabase `events` table.

### Phase 6: Verification & Cleanup

1. Verify all three clients initialize on `npm run dev`
2. Verify `.env.local` is git-ignored (not in `git status`)
3. Verify `Firebase.txt` is git-ignored
4. Run `npm run build` to ensure no type errors
5. Update `src/lib/products.ts` imports if needed (existing mock data file)

**Checkpoint**: Clean build, all services connected, no credentials in tracked files.

## Parallel Opportunities

| Task Group | Can Parallelize |
|------------|----------------|
| Phase 1 (env) + Phase 2 (types) | Yes — no dependencies |
| Phase 3 (Firebase) + Phase 4 (Cloudinary) + Phase 5 (Supabase) | Yes — each is independent after Phase 1+2 |
| Phase 6 (verification) | Sequential — depends on all prior phases |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase credentials revoked | Blocks all data operations | Verify credentials before starting implementation |
| Cloudinary free tier limits | Upload failures at scale | Monitor usage; upgrade plan if needed |
| Supabase connection issues | Analytics gaps (non-critical) | Fire-and-forget pattern ensures no user impact |
| Exposed credentials in git history | Security breach | `Firebase.txt` should be removed from git history (separate cleanup task) |
