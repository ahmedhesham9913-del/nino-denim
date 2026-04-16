# Tasks: Performance, Security & Final Polish

**Input**: Design documents from `specs/005-perf-security-polish/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Create auth and sanitization utilities.

- [x] T001 Create `src/lib/auth.ts` — initialize Firebase Auth from `firebase/auth`. Export `signIn(email, password)` using `signInWithEmailAndPassword`, `signOut()` using Firebase `signOut`, and `onAuthChange(callback)` using `onAuthStateChanged`. Use the existing Firebase app instance from `src/lib/firebase.ts` (import `getAuth` and call it with the app).
- [x] T002 [P] Create `src/lib/sanitize.ts` — export utility functions: `stripHtml(str)` (replace `/<[^>]*>/g` with empty string), `sanitizePhone(str)` (strip non-digits except leading +, validate Egyptian pattern), `sanitizeEmail(str)` (lowercase, trim), `sanitizeAddress(str)` (strip HTML, trim, enforce max 500 chars). All functions return sanitized string.

**Checkpoint**: Auth helpers compile. Sanitize utilities work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth guard and login page — blocks all admin security work.

- [x] T003 Create `src/components/admin/AuthGuard.tsx` — "use client" component wrapping admin layout children. Uses `onAuthStateChanged` from `firebase/auth` to listen for auth state. Three states: loading (show centered spinner), authenticated (render children), unauthenticated (redirect to `/admin/login` via `useRouter().replace()`). Import `getAuth` from `firebase/auth`.
- [x] T004 Create `src/app/admin/login/page.tsx` — "use client" login page. Email + password form fields. On submit: call `signIn(email, password)` from `src/lib/auth.ts`. On success: redirect to `/admin/products`. On failure: show inline error "Invalid email or password" (don't reveal which field is wrong). If already authenticated (check on mount): redirect to `/admin/products`. NINO branding: centered card on warm-white background, NINO JEANS logo, Outfit font headings, nino-950 submit button.

**Checkpoint**: `/admin/login` renders. Valid credentials grant access. Invalid credentials show error.

---

## Phase 3: User Story 1 — Performance Optimization (Priority: P1)

**Goal**: Lighthouse 90+ mobile, images optimized, lazy loading, < 200KB bundle.

**Independent Test**: Run Lighthouse on homepage, shop, product detail. Score 90+ mobile. Images served as WebP/AVIF. Bundle under 200KB gzipped.

### Implementation for User Story 1

- [x] T005 [US1] Audit all `Image` components across customer-facing pages (`src/components/Hero.tsx`, `src/components/ProductCards.tsx`, `src/components/FeaturedCollection.tsx`, `src/components/EditorialLookbook.tsx`, `src/components/DenimJourney.tsx`, `src/components/BrandStory.tsx`, `src/components/SocialProof.tsx`, `src/components/ProductGallery.tsx`). Ensure every `<Image>` has a proper `sizes` attribute matching its actual rendered size. Add `priority` to above-fold hero images (max 3). Remove `priority` from below-fold images.
- [x] T006 [US1] Verify admin code splitting — run `npm run build` and check the route output. Admin pages (`/admin/*`) should be separate chunks from customer pages. If any admin component is imported in a shared layout or customer page, fix with dynamic imports via `next/dynamic`.
- [x] T007 [US1] Run Lighthouse audit via Chrome DevTools on `npm run build && npx next start`. Test homepage, shop page, product detail. Document scores. If any page scores below 90: identify specific issues (render-blocking resources, large images, unused JS) and fix them.

**Checkpoint**: US1 complete — Lighthouse 90+ on all customer pages. Bundle verified under 200KB.

---

## Phase 4: User Story 2 — Admin Authentication (Priority: P1)

**Goal**: Admin routes protected by Firebase Auth login.

**Independent Test**: Access `/admin/products` unauthenticated — redirected to login. Login with valid credentials — access granted. Logout — redirected to login. Invalid credentials — error shown.

### Implementation for User Story 2

- [x] T008 [US2] Update `src/app/admin/layout.tsx` (or `src/app/admin/AdminLayoutClient.tsx`) — wrap the admin content with `AuthGuard`. The login page at `/admin/login` MUST NOT be wrapped by AuthGuard (it needs to be accessible without auth). Use pathname check: if `pathname === '/admin/login'`, render children directly without AuthGuard.
- [x] T009 [US2] Update `src/components/admin/AdminSidebar.tsx` — add a "Log Out" button at the bottom of the sidebar. On click: call `signOut()` from `src/lib/auth.ts`, then redirect to `/admin/login` via `useRouter().replace()`. Style: `text-white/30 hover:text-white/60`, small text, separated by a divider from the nav links.
- [x] T010 [US2] Test auth flow end-to-end: verify unauthenticated redirect, successful login, page navigation while authenticated, and logout redirect. Verify session persists across page refreshes (Firebase Auth persists by default in browser).

**Checkpoint**: US2 complete — admin fully protected. Login/logout flow works.

---

## Phase 5: User Story 3 — Data Security (Priority: P1)

**Goal**: Firestore rules deployed, inputs sanitized, upload API hardened.

**Independent Test**: Try writing to `products` collection without auth — rejected. Submit checkout with HTML in name — stripped. Upload a .exe file — rejected.

### Implementation for User Story 3

- [x] T011 [US3] Create `firestore.rules` at project root — copy the security rules from `specs/005-perf-security-polish/contracts/security-contracts.md`. Rules: products/delivery_zones = public read + auth write, orders = public create + auth read/update, users = auth only, default deny. Document in a comment at top: "Deploy via Firebase Console > Firestore > Rules"
- [x] T012 [US3] Update `src/app/api/upload/route.ts` — add validation before Cloudinary upload: check `file.type` is in `["image/jpeg", "image/png", "image/webp", "image/avif"]`, reject with 400 if not. Check `file.size <= 10_485_760` (10MB), reject with 400 if exceeded. Keep existing upload logic for valid files.
- [x] T013 [US3] Update `src/components/CheckoutForm.tsx` — import sanitization utils from `src/lib/sanitize.ts`. Before passing customer data to `placeOrder()`, sanitize: `stripHtml(name)`, `sanitizePhone(phone)`, `sanitizeAddress(address)`, `sanitizeEmail(email)`. Apply sanitization in the form submit handler.
- [x] T014 [US3] Update `src/components/CustomerForm.tsx` — apply `stripHtml()` to name and address fields on blur (sanitize as user types). Apply `sanitizePhone()` to phone on blur. This provides immediate feedback to users.

**Checkpoint**: US3 complete — rules written, upload hardened, inputs sanitized.

---

## Phase 6: User Story 4 — Final Polish (Priority: P2)

**Goal**: Every page has all 4 states, zero console errors, mobile responsive, fallback images.

**Independent Test**: Navigate every route. Verify skeletons on load, error recovery, empty states, mobile at 375px, zero console errors.

### Implementation for User Story 4

- [x] T015 [US4] Audit all 16 routes for the 4 states (loading, success, empty, error). Create a checklist and test each page. Fix any missing states. Priority pages: `/cart` (empty), `/checkout` (empty cart redirect), `/admin/orders` (no orders), `/admin/analytics` (no events), `/admin/inventory` (no products).
- [x] T016 [US4] Audit all product image rendering across the site. Ensure every `<Image>` component has an `onError` handler or wrapping that shows a fallback placeholder (grey box with camera icon) when the image URL is broken. Check: `ProductCards.tsx`, `ProductsClient.tsx`, `ProductGallery.tsx`, `CartDrawer.tsx`, `CartItemRow.tsx`.
- [x] T017 [US4] Mobile responsive audit — test all pages at 375px viewport width. Fix: overflow issues, text clipping, touch target sizes (min 44x44px), sidebar collapse on admin. Priority: checkout form, product detail gallery, admin tables.
- [x] T018 [US4] Console error sweep — run `npm run build && npx next start`, navigate every page, check browser console. Fix any errors or warnings (React hydration mismatches, missing keys, deprecated APIs, failed fetches).

**Checkpoint**: US4 complete — polished, production-ready experience.

---

## Phase 7: Final Verification

**Purpose**: Build and ship-readiness check.

- [x] T019 Run `npm run build` and confirm zero TypeScript errors
- [x] T020 Run final Lighthouse audit on 3 customer pages — all 90+
- [x] T021 Verify full e2e: browse → add to cart → checkout → order confirmation → admin login → view order → update status → view analytics
- [x] T022 Verify Firestore security rules are documented and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on T001 (auth lib)
- **US1 (Phase 3)**: Independent — can start after Phase 1
- **US2 (Phase 4)**: Depends on Phase 2 (AuthGuard + login page)
- **US3 (Phase 5)**: Depends on T002 (sanitize utils). Independent of US1/US2
- **US4 (Phase 6)**: After US1-US3 (final pass)
- **Verification (Phase 7)**: After all

### Parallel Opportunities

```
Phase 1:
  T001 ─── T002 (parallel: different files)

Phase 2:
  T003 → T004 (sequential: guard before login)

Phase 3 + Phase 5 (after Phase 1):
  T005 ─── T011 ─── T012 ─── T013 (all parallel: different files)
  T006 ─── T014 (parallel)
  T007 (after T005-T006)

Phase 4 (after Phase 2):
  T008 → T009 → T010 (sequential)

Phase 6:
  T015 ─── T016 ─── T017 (parallel: different concerns)
  T018 (after T015-T017)

Phase 7:
  T019 → T020 → T021 → T022 (sequential)
```

---

## Implementation Strategy

### MVP First (US2 Auth Only)

1. Phase 1: Setup (T001-T002)
2. Phase 2: Foundational (T003-T004)
3. Phase 4: US2 Auth (T008-T010)
4. **STOP and VALIDATE**: Admin is protected
5. Most critical security gap closed

### Full Delivery

1. Setup + Foundational → Auth + sanitize ready
2. US1 (Performance) + US3 (Security) → Run in parallel
3. US2 (Auth) → After foundational
4. US4 (Polish) → Final audit after everything else
5. Verification → Ship it

---

## Notes

- T011 creates `firestore.rules` but does NOT deploy them — deployment is manual via Firebase Console
- T007 and T020 (Lighthouse audits) require a production build (`next start`), not dev server
- Auth uses Firebase's built-in session persistence (localStorage) — no additional session management needed
- Admin account must be pre-created in Firebase Console before T010 can be tested
- The sanitization in T013-T014 is defense-in-depth — Firestore doesn't execute stored data, but sanitizing prevents display-time XSS
