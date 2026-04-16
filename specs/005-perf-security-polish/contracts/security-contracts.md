# Security Contracts: Performance, Security & Final Polish

**Date**: 2026-04-08

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders: public create, admin read/update
    match /orders/{orderId} {
      allow create: if true;
      allow read, update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Users: admin only
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }

    // Delivery zones: public read, admin write
    match /delivery_zones/{zoneId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Auth Flow

```
Unauthenticated → /admin/* → Redirect to /admin/login
/admin/login → Enter email + password → Firebase signInWithEmailAndPassword
Success → Redirect to /admin/products
Failure → Show error message
Authenticated → /admin/* → Access granted
Logout → Firebase signOut → Redirect to /admin/login
```

## Admin Auth Guard Component

```typescript
// src/components/admin/AuthGuard.tsx
interface AuthGuardProps {
  children: React.ReactNode;
}
// Wraps admin layout
// Listens to onAuthStateChanged
// If not authenticated: redirect to /admin/login
// If authenticated: render children
// Loading state while checking auth
```

## Upload API Validation

```
POST /api/upload
  Validate: Content-Type must include multipart/form-data
  Validate: file field must exist and be a Blob
  Validate: file.type in ["image/jpeg", "image/png", "image/webp", "image/avif"]
  Validate: file.size <= 10MB (10_485_760 bytes)
  On invalid type: 400 { error: "Invalid file type. Accepted: JPEG, PNG, WebP, AVIF" }
  On oversized: 400 { error: "File too large. Maximum size: 10MB" }
  On success: upload to Cloudinary, return URL
```

## Input Sanitization Rules

```
All text inputs:
  - Strip HTML tags: replace(/<[^>]*>/g, '')
  - Trim whitespace
  - Max length enforcement

Phone (Egyptian):
  - Must match: /^(\+20)?01[0125]\d{8}$/
  - Strip non-digit chars except leading +

Email:
  - Standard email format validation
  - Lowercase normalization

Address:
  - Strip HTML tags
  - Min 10 characters
  - Max 500 characters
```
