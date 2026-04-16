# Quickstart: Performance, Security & Final Polish

## Prerequisites

- Features 001-004 complete
- Firebase project with Auth enabled
- Admin user created in Firebase Console

## Setup Steps

### 1. Enable Firebase Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Go to Users tab > Add user
4. Enter admin email and password
5. Note the email for login

### 2. Deploy Firestore Security Rules

Copy the rules from `contracts/security-contracts.md` and
deploy via Firebase Console > Firestore > Rules tab.

### 3. Run Performance Audit

```bash
npm run build
npx next start -p 3002
```

Open Chrome DevTools > Lighthouse > Run audit on:
- http://localhost:3002/ (homepage)
- http://localhost:3002/products (shop)
- http://localhost:3002/product/{id} (detail)

Target: 90+ mobile performance score.

### 4. Test Admin Auth

1. Visit `/admin/products` — should redirect to `/admin/login`
2. Enter admin email + password — should access admin
3. Click logout — should redirect to login
4. Try invalid credentials — should show error

### 5. Test Security Rules

After deploying rules:
1. Open browser console on storefront
2. Try writing to products collection — should fail
3. Place an order via checkout — should succeed
4. Verify admin can still manage everything

## New Files

```
src/
├── app/admin/
│   └── login/
│       └── page.tsx              # Admin login page
├── components/admin/
│   └── AuthGuard.tsx             # Auth check wrapper
└── lib/
    ├── auth.ts                   # Firebase Auth helpers
    └── sanitize.ts               # Input sanitization utils
```

## Modified Files

```
src/
├── app/admin/layout.tsx          # Wrap with AuthGuard
├── app/admin/AdminLayoutClient.tsx # Add logout to sidebar
├── app/api/upload/route.ts       # File type + size validation
├── components/admin/AdminSidebar.tsx # Add logout button
└── components/CheckoutForm.tsx   # Sanitize customer inputs
```
