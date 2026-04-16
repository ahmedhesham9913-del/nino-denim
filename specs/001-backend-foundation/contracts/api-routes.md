# API Route Contracts: Backend Foundation

**Date**: 2026-04-08

## POST /api/upload

Upload a product image to Cloudinary.

**Request**:
- Content-Type: `multipart/form-data`
- Body: `file` (image binary), `folder` (string, optional, default: `nino-jeans/products`)

**Response (200)**:
```json
{
  "url": "https://res.cloudinary.com/deh0z0hx7/image/upload/v.../nino-jeans/products/abc123.jpg",
  "public_id": "nino-jeans/products/abc123",
  "width": 800,
  "height": 1200,
  "format": "jpg"
}
```

**Response (400)**:
```json
{
  "error": "No file provided"
}
```

**Response (500)**:
```json
{
  "error": "Upload failed: <cloudinary error message>"
}
```

**Notes**:
- Server-only route — Cloudinary secret never exposed to client
- Max file size: 10MB (Cloudinary default)
- Accepted formats: jpg, png, webp, avif

---

## Service Module Contracts

These are internal TypeScript module interfaces, not HTTP APIs.

### firebase.ts

```typescript
// Exports
export const db: Firestore;

// Re-exported from firebase/firestore for convenience
export { collection, doc, addDoc, getDoc, getDocs,
         updateDoc, deleteDoc, query, where, orderBy,
         limit, startAfter, Timestamp } from "firebase/firestore";
```

### cloudinary.ts

```typescript
// Server-only module (used in API routes)
export const cloudinary: CloudinaryV2;

export async function uploadImage(
  file: Buffer | string,
  folder?: string
): Promise<{
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}>;
```

### supabase.ts

```typescript
// Exports
export const supabase: SupabaseClient;

export async function trackEvent(event: {
  event_type: string;
  user_id?: string;
  product_id?: string;
  metadata?: Record<string, unknown>;
  session_id?: string;
}): Promise<void>;
// Fire-and-forget: logs errors but never throws
```

### types.ts

```typescript
export type ProductCategory = "Men" | "Women" | "Kids" | "Unisex";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Product {
  id?: string;
  name: string;
  price: number;
  images: string[];
  sizes: string[];
  category: ProductCategory;
  stock: number;
  created_at: Timestamp;
}

export interface OrderItem {
  product_id: string;
  name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface Order {
  id?: string;
  customer: Customer;
  items: OrderItem[];
  total_price: number;
  status: OrderStatus;
  created_at: Timestamp;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  orders: string[];
  created_at: Timestamp;
}

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  product_id?: string;
  metadata?: Record<string, unknown>;
  session_id?: string;
}
```
