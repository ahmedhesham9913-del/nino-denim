# Implementation Plan: Performance, Security & Final Polish

**Branch**: `005-perf-security-polish` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-perf-security-polish/spec.md`

## Summary

Final production-readiness phase: optimize performance to
Lighthouse 90+ (image optimization, lazy loading, code
splitting), add Firebase Auth to protect admin routes,
deploy Firestore security rules, harden the upload API,
sanitize all inputs, and do a comprehensive polish audit
ensuring all 4 states on every page with zero console errors.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+
**Primary Dependencies**: firebase v10+ (Auth module), next v16
**Storage**: Firestore (security rules), Firebase Auth
**Target Platform**: Next.js 16 App Router on Vercel
**Project Type**: Web application (production hardening)
**Performance Goals**: Lighthouse 90+, LCP < 2.5s, bundle < 200KB
**Constraints**: Single admin account, no customer auth

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Visual Supremacy | PASS | Polish ensures consistent visual quality across all pages |
| II. Motion With Purpose | PASS | Loading skeletons and transitions verified in polish audit |
| III. Separation of Concerns | PASS | Auth in Firebase, rules in Firestore, sanitization in app layer |
| IV. Performance-First | PASS | Primary focus of this feature — Lighthouse 90+, < 200KB bundle |
| V. Mobile-Native | PASS | Polish audit verifies mobile responsive on all 16 routes |
| VI. Typography | PASS | Verified during polish — consistent Outfit/DM Sans |
| VII. Data-Driven | PASS | Analytics already instrumented in previous features |
| VIII. Progressive Disclosure | PASS | Verified during polish — all states implemented |
| IX. Color as Identity | PASS | Verified during polish — NINO palette consistent |
| X. Production-Grade | PASS | This IS the production-grade feature — all 4 states, security, validation |

**Result**: All 10 gates PASS.

## Project Structure

### New Files

```text
src/
├── app/admin/login/
│   └── page.tsx                  # Admin login page
├── components/admin/
│   └── AuthGuard.tsx             # Auth state check wrapper
└── lib/
    ├── auth.ts                   # Firebase Auth init + helpers
    └── sanitize.ts               # Input sanitization utilities
```

### Modified Files

```text
src/
├── app/admin/layout.tsx          # Wrap with AuthGuard
├── app/admin/AdminLayoutClient.tsx # Exclude login from sidebar
├── app/api/upload/route.ts       # File type + size validation
├── components/admin/AdminSidebar.tsx # Add logout button
├── components/CheckoutForm.tsx   # Sanitize customer inputs
└── (various) Image components    # Verify sizes + priority attrs
```

### Firestore Rules (deploy via Firebase Console)

```text
firestore.rules                   # Security rules file
```

## Implementation Phases

### Phase 1: Auth Infrastructure

1. Create `src/lib/auth.ts` — Firebase Auth initialization,
   `signIn(email, password)`, `signOut()`, `onAuthChange()`
2. Create `src/components/admin/AuthGuard.tsx` — wraps
   admin layout, checks auth state, redirects to login
3. Create `src/app/admin/login/page.tsx` — login form with
   email + password fields, error display
4. Update admin layout to wrap with AuthGuard (exclude login)
5. Add logout button to AdminSidebar

### Phase 2: Firestore Security Rules

1. Create `firestore.rules` file with rules from contracts
2. Document deployment steps (Firebase Console)

### Phase 3: Input Hardening

1. Create `src/lib/sanitize.ts` — `stripHtml()`, `sanitizePhone()`,
   `sanitizeEmail()`, `sanitizeAddress()`
2. Update upload API with file type + size validation
3. Apply sanitization to checkout form inputs

### Phase 4: Performance Optimization

1. Audit all Image components for proper `sizes` and `priority`
2. Add `placeholder="blur"` to product images where possible
3. Verify admin code is code-split (dynamic imports if needed)
4. Run Lighthouse and fix any issues to reach 90+

### Phase 5: Final Polish Audit

1. Systematic audit of all 16 routes for 4 states
2. Fix any missing loading/empty/error states
3. Mobile responsive check on all pages
4. Console error sweep — fix any warnings/errors
5. Fallback images for broken URLs
6. Final build verification

## Parallel Opportunities

| Phase Group | Can Parallelize |
|-------------|----------------|
| Phase 1 (auth) | Sequential — guard before pages |
| Phase 2 (rules) + Phase 3 (hardening) | Yes — independent |
| Phase 4 (perf) | After Phase 1-3 |
| Phase 5 (polish) | After all — final pass |

## Dependencies

### From previous features

- All features 001-004 complete
- Firebase project with Auth enabled in console
- Admin user created manually in Firebase console

### New imports

- `firebase/auth` — already bundled with the `firebase` package

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Auth blocks admin access | Can't manage store | Test thoroughly before deploying rules |
| Security rules too strict | Checkout breaks | Test customer flows after rule deployment |
| Performance changes break UI | Visual regressions | Audit visually after each optimization |
| Bundle analysis reveals large deps | Can't hit < 200KB | Dynamic import heavy components |
