import type { Timestamp, DocumentSnapshot } from "firebase/firestore";

export type ProductCategory = "Men" | "Women" | "Kids" | "Unisex";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "partially_returned"
  | "returned"
  | "exchanged";

// ─── Variant System ──────────────────────────────────────────────

export interface ProductColor {
  name: string;
  hex: string;
}

export type ProductTag = "New" | "Sale" | "Bestseller" | "Limited" | "Trending";

export interface VariantSize {
  value: string;   // "28", "30", "XL"
  stock: number;
}

export interface ProductVariant {
  colorId: string;     // references taxonomy colors collection
  colorName: string;   // denormalized: "Indigo"
  colorHex: string;    // denormalized: "#2563eb"
  images: string[];    // Cloudinary URLs for this color
  sizes: VariantSize[];
}

// ─── Product ─────────────────────────────────────────────────────

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  mainImage: string;
  variants: ProductVariant[];
  category: string;
  style: string;
  tag?: string;
  rating: number;
  reviews: number;
  created_at: Timestamp;
}

// ─── Orders ──────────────────────────────────────────────────────

export interface OrderItem {
  product_id: string;
  name: string;
  size: string;
  color: string;
  colorHex?: string;
  quantity: number;
  unit_price: number;
}

export interface CustomerLocation {
  lat: number;
  lng: number;
  governorate?: string;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  location?: CustomerLocation;
}

export interface OrderReturnRecord {
  item_index: number;
  type: "return" | "exchange";
  quantity: number;
  exchange_product_id?: string;
  exchange_product_name?: string;
  exchange_size?: string;
  exchange_color?: string;
  reason?: string;
  date: Timestamp;
}

export interface OrderFee {
  label: string;
  amount: number;
  paid_by: "customer" | "store";
}

export interface Order {
  id?: string;
  customer: Customer;
  items: OrderItem[];
  total_price: number;
  delivery_fee: number;
  delivery_zone: string;
  shipping_company?: string;
  location?: { lat: number; lng: number };
  notes?: string;
  returns?: OrderReturnRecord[];
  return_fees?: OrderFee[];
  status: OrderStatus;
  created_at: Timestamp;
}

// ─── Shipping ────────────────────────────────────────────────────

export interface ShippingStatusRule {
  formula: "percentage" | "fixed" | "percentage_plus_fixed";
  percentage?: number;       // e.g., 100 = 100% of shipping fee
  fixed_amount?: number;     // e.g., 20 EGP
  paid_by: "customer" | "store";
}

export interface ShippingCompany {
  id?: string;
  name: string;
  governorate_costs: Record<string, { shipping: number; return_cost: number }>;
  status_rules?: Record<string, ShippingStatusRule>; // keys: "returned", "partially_returned", "exchanged"
  cod_fee?: number;
  insurance_fee?: number;
  weight_limit_kg?: number;
  notes?: string;
  enabled: boolean;
}

// ─── Cart ────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  price: number;
}

// ─── Other ───────────────────────────────────────────────────────

export interface DeliveryZone {
  id?: string;
  name: string;
  fee: number;
  governorates?: string[];
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  orders: string[];
  total_spent: number;
  order_count: number;
  delivered_count?: number;
  cancelled_count?: number;
  last_order_date?: Timestamp;
  created_at: Timestamp;
}

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  product_id?: string;
  metadata?: Record<string, unknown>;
  session_id?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}
