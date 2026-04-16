# Research: Performance, Security & Final Polish

**Date**: 2026-04-08
**Branch**: `005-perf-security-polish`

## R1: Firebase Auth for Admin

**Decision**: Use Firebase Authentication with email/password
provider. Create a single admin account in the Firebase
console. Protect admin routes with a client-side auth check
that redirects unauthenticated users to `/admin/login`.

**Rationale**: Firebase Auth is already in the project's
Firebase ecosystem. Email/password is the simplest auth
method for a single admin. No additional dependencies needed
— the `firebase` SDK already installed includes auth modules.

**Alternatives considered**:
- NextAuth.js: Adds a dependency and complexity for a single
  admin user. Overkill.
- Custom JWT: Requires server-side token management. Firebase
  handles this automatically.
- Middleware-based protection: Next.js middleware could check
  auth, but the Firebase client SDK auth state is client-side.
  A client-side redirect is simpler and sufficient.

---

## R2: Firestore Security Rules

**Decision**: Deploy restrictive rules:
- `products`: Public read, authenticated write
- `orders`: Public create (checkout), authenticated read/update
- `users`: Authenticated read/write
- `delivery_zones`: Public read, authenticated write
- Default deny all other collections

**Rationale**: Customers need to read products and zones
without auth. They need to create orders at checkout. All
other writes require admin authentication. This matches the
application's access patterns exactly.

---

## R3: Image Optimization Strategy

**Decision**: Leverage the existing Cloudinary + Next.js
Image stack. Ensure all `<Image>` components use proper
`sizes` attributes and `priority` for above-fold images.
Add `placeholder="blur"` with `blurDataURL` for progressive
loading. No additional image pipeline needed.

**Rationale**: Cloudinary already delivers WebP/AVIF with
`f_auto,q_auto`. Next.js Image component handles responsive
sizing and lazy loading. The only missing piece is blur-up
placeholders and ensuring `sizes` attributes are correct.

---

## R4: Bundle Size Optimization

**Decision**: Use dynamic imports (`next/dynamic`) for admin
pages and heavy components. The admin layout and all its
children should be code-split from the customer-facing bundle.
Verify with `next build` output and `@next/bundle-analyzer`
if needed.

**Rationale**: Admin dashboard code (tables, forms, charts,
CRUD logic) should not be included in the customer-facing
bundle. Next.js App Router already code-splits by route, but
we should verify no admin imports leak into shared layouts.

---

## R5: Input Sanitization

**Decision**: Sanitize all user inputs at the application
layer before writing to Firestore. Strip HTML tags from text
fields using a simple regex replace. Validate phone numbers,
emails, and addresses at the form level. No additional
sanitization library needed.

**Rationale**: Firestore doesn't execute stored data, so XSS
is only a concern when displaying user-submitted content.
Stripping HTML tags on input prevents stored XSS. The existing
phone validation (Egyptian format regex) is already in place.

---

## R6: Upload API Hardening

**Decision**: Add file type validation (accept only
image/jpeg, image/png, image/webp, image/avif) and size
limit (10MB) to the existing `/api/upload` route handler.
Return 400 for invalid types, 413 for oversized files.

**Rationale**: The current upload route accepts any file.
Restricting to image types prevents abuse. The 10MB limit
matches Cloudinary's default for free tier.

---

## R7: Polish Audit Approach

**Decision**: Systematic page-by-page audit of all 16 routes.
For each page, verify: loading state, success state, empty
state, error state, mobile responsive, zero console errors.
Fix issues found during the audit rather than pre-listing
specific fixes.

**Rationale**: The most effective polish approach is a
systematic audit rather than guessing what might be broken.
Many issues only become visible through actual navigation.
