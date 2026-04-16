<!--
  Sync Impact Report
  ────────────────────────────────────────
  Version change: 0.0.0 -> 1.0.0 (MAJOR — initial ratification)

  Modified principles: N/A (initial creation)

  Added sections:
    - 10 Core Principles (I through X)
    - Design System & Identity
    - Technical Architecture & Constraints
    - Development Workflow
    - Governance

  Removed sections: N/A

  Templates requiring updates:
    - plan-template.md: Constitution Check section now has 10 gates ✅ (aligned)
    - spec-template.md: User stories and requirements structure ✅ (aligned)
    - tasks-template.md: Phase structure and parallel execution ✅ (aligned)
    - checklist-template.md: Generic checklist ✅ (aligned)

  Follow-up TODOs: None
-->

# NINO JEANS Constitution

## Core Principles

### I. Visual Supremacy

Every page MUST feel like a premium fashion editorial, not a
template. The brand identity is built on cinematic contrast,
generous whitespace, oversized typography, and deliberate
asymmetry. Generic or stock-looking layouts are rejected on
sight. UI elements MUST carry the weight and restraint of a
luxury denim house — confident, unhurried, and tactile.

- Section backgrounds alternate between deep indigo
  `oklch(0.13 0.03 250)` and warm cream `--color-warm-white`
  to create cinematic rhythm.
- Oversized watermark numbers, giant sliding background text,
  and stitch-pattern accents reinforce the denim identity.
- Product imagery MUST always be hero-sized with generous
  bleed and gradient overlays.
- Cards use rounded-2xl corners, subtle shadows, and
  glass-morphism accents (backdrop-blur, border-white/10).
- No flat, lifeless grids. Layouts MUST use asymmetric
  column splits (7/5, 5/7), staggered entries, and
  editorial compositions.

### II. Motion With Purpose

Every animation MUST serve the user experience — guiding
attention, confirming interaction, or creating spatial
continuity. Decorative-only motion is prohibited. All motion
MUST respect `prefers-reduced-motion` and degrade gracefully.

- Use Framer Motion as the single animation library.
  No mixing with CSS @keyframes for interactive elements
  (CSS keyframes are reserved for ambient loops like
  `hero-shift` and `marquee`).
- Entry animations use the signature easing
  `[0.16, 1, 0.3, 1]` (ease-out expo).
- Stagger delays MUST be short (0.06-0.1s per item) to
  feel snappy, not sluggish.
- 3D transforms (perspective, rotateX/Y, preserve-3d) are
  a core interaction pattern for product cards.
- Viewport-triggered animations use `once: true` to avoid
  replaying on scroll-back.
- Page transitions MUST feel like a continuous experience,
  not separate page loads.

### III. Separation of Concerns

Each backend service owns exactly one domain. NEVER mix
responsibilities across services. This separation is
non-negotiable and MUST be enforced at the architectural level.

- **Firebase Firestore**: Product catalog, orders, users,
  and real-time operational data. Firestore is the single
  source of truth for transactional state.
- **Cloudinary**: ALL image storage, optimization,
  transformation, and CDN delivery. NEVER store image
  binary data in Firebase. Firestore stores only Cloudinary
  URLs.
- **Supabase**: Analytics events, reporting queries, and
  SQL-powered dashboards. Analytics data flows one-way
  from the frontend into Supabase. Supabase MUST NOT be
  used for transactional operations.

### IV. Performance-First Commerce

An e-commerce store that loads slowly loses revenue. Every
technical decision MUST prioritize perceived and measured
performance. The site MUST achieve a Lighthouse performance
score of 90+ on mobile.

- NEVER fetch all products from Firestore. ALWAYS use
  cursor-based pagination with `limit()` and `startAfter()`.
- Images MUST be served through Cloudinary with automatic
  format negotiation (WebP/AVIF), responsive `sizes`
  attributes, and lazy loading for below-fold content.
- Use Next.js `priority` on above-fold hero images (max 3).
- Client components MUST be leaf nodes. Server Components
  handle data fetching and layout; client components handle
  interactivity only.
- Bundle splitting via dynamic imports for heavy sections
  (admin dashboard, analytics charts).
- Aim for < 200KB initial JavaScript bundle (gzipped).

### V. Mobile-Native, Desktop-Enhanced

Every feature MUST be designed for touch-first on mobile
screens, then progressively enhanced for desktop. Mobile is
not an afterthought — it is the primary experience.

- All interactive targets MUST meet 44x44px minimum touch
  area (WCAG 2.5.5).
- Mobile layouts MUST use single-column stacking with
  full-width cards and bottom-sheet drawers for filters.
- Swipe gestures (card decks, carousels) MUST be the
  primary mobile interaction — not hover states.
- Desktop enhancements include: sidebar filters, 3D tilt
  on hover, multi-column grids, and expanded card details.
- Breakpoint strategy: mobile-first with `sm:` (640px),
  `md:` (768px), `lg:` (1024px). Max content width is
  1400px (shop grid extends to 1600px).

### VI. Typography as Architecture

Typography is not decoration — it is the structural skeleton
of every page. The dual-font system MUST be applied
consistently and never deviated from.

- **Outfit** (`--font-display`): All headings, navigation,
  labels, buttons, badges, stats, kickers, and any text
  that carries brand voice. Weights 300-900.
- **DM Sans** (`--font-body`): Body copy, descriptions,
  form inputs, and long-form content. Weights 300-700.
- Hero headings use `clamp()` for fluid sizing, with
  tight `leading-[0.88]` and `tracking-tight`.
- Section kickers follow the pattern: `text-[10px]`
  `tracking-[0.4em]` `font-medium` uppercase.
- NEVER introduce a third typeface. NEVER use system fonts
  for visible UI text.

### VII. Data-Driven Decision Making

Every meaningful user interaction MUST be instrumented for
analytics. Decisions about product placement, pricing, and
UX changes MUST be informed by data, not guesswork.

- Track these events to Supabase: `product_view`,
  `add_to_cart`, `cart_remove`, `checkout_started`,
  `checkout_completed`, `order_created`, `search_query`,
  `filter_applied`, `wishlist_add`, `newsletter_signup`.
- Event schema MUST include: `event_type`, `user_id`
  (anonymous or authenticated), `product_id` (if applicable),
  `metadata` (JSON), `timestamp`, `session_id`.
- Analytics writes MUST be non-blocking (fire-and-forget
  with error logging).
- Dashboard reports MUST include: conversion funnel,
  top products by views and revenue, cart abandonment rate,
  revenue per day/week/month, and customer cohort analysis.

### VIII. Progressive Disclosure

Complexity MUST be revealed gradually. Show the essential
information first, then expand details through interaction.
This applies to product cards, filters, navigation, and
checkout flows.

- Product cards show name, price, and color dots by default.
  Sizes, buy button, and expanded details reveal on hover
  (desktop) or tap (mobile).
- Filters use collapsible sections with `AnimatePresence`.
  All sections default to open on desktop, collapsed on
  mobile behind a bottom-sheet drawer.
- Checkout flows MUST use multi-step forms (customer info,
  delivery, payment) — never a single intimidating page.
- Error messages appear inline at the point of failure,
  not in global toast notifications that disappear.

### IX. Color as Identity

The NINO color system is built on oklch and MUST be the
exclusive palette. Random hex colors or Tailwind defaults
are prohibited for brand-facing UI.

- **Brand palette**: `--color-nino-50` through
  `--color-nino-950` (indigo spectrum at hue 240).
- **Neutrals**: `--color-cream`, `--color-warm-white`,
  `--color-silk`, `--color-denim-dark`, `--color-denim-light`.
- **Gradient text**: `.text-gradient` (dark contexts) and
  `.text-gradient-light` (dark backgrounds).
- Dark sections use `oklch(0.13 0.03 250)` as base with
  white text at carefully calibrated opacities
  (white/20, white/30, white/40 — never full white).
- Light sections use `warm-white` or
  `oklch(0.965 0.008 240)` as base with `nino-950` text.
- Product tags, buttons, and accents use `nino-500` through
  `nino-700` for interactive elements.
- Text selection: `oklch(0.58 0.20 240 / 0.2)`.

### X. Production-Grade Quality

No feature ships without complete state management. Every
user-facing flow MUST handle all four states: loading,
success, empty, and error. Security and input validation
are not optional phases — they are built into every feature
from the start.

- Loading states MUST use skeleton screens or subtle pulse
  animations, never spinners.
- Empty states MUST include a helpful message and a clear
  call-to-action (e.g., "No matches found — clear filters").
- Error states MUST be recoverable — provide retry actions
  or fallback content, never dead ends.
- All user inputs MUST be validated both client-side (for
  UX) and server-side (for security).
- Firebase Security Rules MUST restrict reads/writes to
  authorized operations only.
- API routes MUST validate request bodies, sanitize inputs,
  and return structured error responses.
- Environment secrets MUST live in `.env.local` and NEVER
  be committed to version control.

## Design System & Identity

The NINO JEANS visual system is a premium denim editorial
identity. It is NOT a generic e-commerce template.

**Brand Pillars:**
- Premium without pretension
- Urban sophistication meets artisan craftsmanship
- Cinematic visual storytelling
- Tactile digital experiences

**Component Patterns:**
- Hero sections: Full-viewport, dark indigo, animated card
  decks with text reveals and scroll indicators.
- Product grids: 3D-tilt cards, shine sweep on hover,
  expandable details via CSS grid-template-rows animation.
- Content sections: Alternating light/dark tone pairs with
  connecting gradient fades.
- Section headers: Animated line + kicker label + oversized
  heading with gradient text spans.
- Navigation: Transparent on hero, frosted glass on scroll,
  with `layoutId` animated underline.

**Spacing Rhythm:**
- Sections: `py-32` (light) to `py-36`/`py-48` (dark).
- Content max-width: `max-w-[1400px] mx-auto px-6`.
- Card gaps: `gap-5` to `gap-6`.
- Section transitions: gradient overlays (`h-36`/`h-40`)
  or `h-[1px]` dividers.

## Technical Architecture & Constraints

**Stack:**
- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with `@theme inline` for
  custom properties
- **Animation**: Framer Motion (single animation library)
- **Backend**: Firebase Firestore (data), Cloudinary (media),
  Supabase (analytics)
- **State**: React Context or Zustand for client state
  (cart, UI). No global state libraries for server data.
- **Deployment**: Vercel with automatic preview deployments

**File Organization:**
```
src/
  app/           # Next.js App Router pages and layouts
  components/    # Reusable UI components (client)
  lib/           # Service clients (firebase.js, cloudinary.js,
                 #   supabase.js) and shared utilities
  services/      # Business logic layer (order processing,
                 #   inventory, analytics)
  hooks/         # Custom React hooks
```

**Constraints:**
- No full collection fetches from Firestore — ALWAYS
  paginate.
- No images stored in Firebase — Cloudinary only.
- No analytics queries against Firebase — Supabase only.
- No third-party CSS frameworks alongside Tailwind.
- No jQuery or legacy DOM manipulation libraries.
- No `any` types in TypeScript — use proper typing.

## Development Workflow

**Feature Development Flow:**
1. Spec the feature requirements and user stories.
2. Plan the implementation with file paths and dependencies.
3. Build functionality first — design polish comes after
   the feature works.
4. Test all four states (loading, success, empty, error).
5. Verify mobile experience before desktop refinement.
6. Ensure analytics events are instrumented.
7. Check Lighthouse scores before marking complete.

**Code Quality Gates:**
- TypeScript strict mode — no implicit any.
- All components MUST have proper `aria-label` attributes
  on interactive elements.
- Images MUST have descriptive `alt` text and `sizes` props.
- CSS classes MUST use the project's design tokens, not
  arbitrary values (except where oklch is used inline for
  one-off effects).

**Commit Standards:**
- Feature commits: `feat: description`
- Bug fixes: `fix: description`
- Refactors: `refactor: description`
- Style/design: `style: description`
- Documentation: `docs: description`

## Governance

This constitution is the supreme governing document for the
NINO JEANS codebase. It supersedes all other practices,
conventions, or habits.

**Amendment Procedure:**
1. Propose the change with rationale.
2. Document the specific principle or section affected.
3. Update the constitution with a version bump.
4. Propagate changes to dependent templates (plan, spec,
   tasks, checklist).
5. Log the change in the Sync Impact Report comment block.

**Versioning:**
- MAJOR: Removing or fundamentally redefining a principle.
- MINOR: Adding new principles or expanding existing guidance.
- PATCH: Clarifications, wording improvements, typo fixes.

**Compliance:**
- Every plan MUST include a Constitution Check gate that
  verifies alignment with all 10 principles before
  implementation begins.
- Code reviews MUST verify adherence to the design system,
  performance constraints, and accessibility requirements.
- Runtime development guidance lives in `CLAUDE.md` and
  `AGENTS.md` — these files provide implementation-level
  instructions but MUST NOT contradict this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08
