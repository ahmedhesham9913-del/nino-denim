import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from "@/lib/firebase";
import { writeBatch } from "firebase/firestore";
import type {
  Order,
  OrderStatus,
  OrderFee,
  PaginatedResult,
  CartItem,
  Customer,
  DeliveryZone,
  ProductVariant,
} from "@/lib/types";
import type { DocumentSnapshot, QueryConstraint } from "firebase/firestore";

const COLLECTION = "orders";
const DEFAULT_PAGE_SIZE = 12;

// Valid status transitions: each status maps to the set of statuses it can move to
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled", "partially_returned", "returned", "exchanged"],
  delivered: ["partially_returned", "returned", "exchanged"],
  cancelled: [],
  partially_returned: ["delivered", "partially_returned", "exchanged"],
  returned: ["delivered"],
  exchanged: ["delivered", "partially_returned", "returned"],
};

export async function createOrder(
  data: Omit<Order, "id" | "created_at" | "status">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: "pending" as OrderStatus,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function getOrders(options: {
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
  status?: OrderStatus;
} = {}): Promise<PaginatedResult<Order>> {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    lastDoc = null,
    status,
  } = options;

  const constraints: QueryConstraint[] = [];

  if (status) {
    constraints.push(where("status", "==", status));
  }

  constraints.push(orderBy("created_at", "desc"));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize + 1));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  const items: Order[] = docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Order[];

  return {
    items,
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

export async function getOrderById(
  id: string
): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
  shippingCompany?: string
): Promise<void> {
  const order = await getOrderById(id);
  if (!order) {
    throw new Error(`Order ${id} not found`);
  }

  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot transition order from "${order.status}" to "${newStatus}". ` +
        `Allowed transitions: ${allowed.join(", ") || "none (terminal state)"}`
    );
  }

  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === "shipped" && shippingCompany) {
    updateData.shipping_company = shippingCompany;
  }

  await updateDoc(doc(db, COLLECTION, id), updateData);
}

/**
 * Finalize delivery after return/exchange — update total price and fees.
 * Called from the UI with pre-calculated values.
 */
export async function finalizeDelivery(
  orderId: string,
  newTotal: number,
  fees: OrderFee[]
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status: "delivered" as OrderStatus,
    total_price: newTotal,
  };
  if (fees.length > 0) {
    updateData.return_fees = fees;
  }
  await updateDoc(doc(db, COLLECTION, orderId), updateData);
}

/* ------------------------------------------------------------------ */
/*  Client-facing checkout helper                                     */
/* ------------------------------------------------------------------ */

interface PlaceOrderInput {
  items: CartItem[];
  customer: Customer;
  deliveryZone: DeliveryZone;
  location?: { lat: number; lng: number };
  notes?: string;
}

type PlaceOrderResult =
  | { success: true; orderId: string }
  | { success: false; unavailableItems?: string[]; error?: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    // 1. Read products and validate stock via variant structure
    const unavailable: string[] = [];
    const productVariantsMap = new Map<string, ProductVariant[]>();

    for (const item of input.items) {
      const productSnap = await getDoc(doc(db, "products", item.productId));
      if (!productSnap.exists()) {
        unavailable.push(`${item.name} (product no longer exists)`);
        continue;
      }
      const data = productSnap.data();
      const variants = (data.variants ?? []) as ProductVariant[];
      productVariantsMap.set(item.productId, variants);

      // Find the variant matching the cart item's color
      const variant = variants.find((v) => v.colorName === item.color);
      if (!variant) {
        unavailable.push(`${item.name} — Color "${item.color}" no longer available`);
        continue;
      }
      const sizeEntry = variant.sizes.find((s) => s.value === item.size);
      if (!sizeEntry || sizeEntry.stock < item.quantity) {
        unavailable.push(
          `${item.name} — ${item.color} / Size ${item.size} (only ${sizeEntry?.stock ?? 0} left)`
        );
      }
    }

    if (unavailable.length > 0) {
      return { success: false, unavailableItems: unavailable };
    }

    // 2. Batch write: create order + decrement variant stock
    const batch = writeBatch(db);

    const orderItems = input.items.map((item) => ({
      product_id: item.productId,
      name: item.name,
      size: item.size,
      color: item.color,
      colorHex: item.colorHex,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const subtotal = input.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const orderRef = doc(collection(db, COLLECTION));
    const orderData: Record<string, unknown> = {
      customer: input.customer,
      items: orderItems,
      total_price: subtotal + input.deliveryZone.fee,
      delivery_fee: input.deliveryZone.fee,
      delivery_zone: input.deliveryZone.name,
      status: "pending",
      created_at: Timestamp.now(),
    };
    if (input.location) {
      orderData.location = input.location;
    }
    if (input.notes) {
      orderData.notes = input.notes;
    }
    batch.set(orderRef, orderData);

    // Decrement stock in each product's variant structure
    // Since Firestore can't update nested array elements by query,
    // we read the full variants, modify in-memory, and write back
    const processed = new Set<string>();
    for (const item of input.items) {
      if (processed.has(item.productId)) continue;
      processed.add(item.productId);

      const variants = productVariantsMap.get(item.productId)!;
      // Apply all decrements for this product
      const itemsForProduct = input.items.filter((i) => i.productId === item.productId);
      for (const cartItem of itemsForProduct) {
        const variant = variants.find((v) => v.colorName === cartItem.color);
        if (variant) {
          const sizeEntry = variant.sizes.find((s) => s.value === cartItem.size);
          if (sizeEntry) {
            sizeEntry.stock = Math.max(0, sizeEntry.stock - cartItem.quantity);
          }
        }
      }

      const productRef = doc(db, "products", item.productId);
      batch.update(productRef, { variants });
    }

    await batch.commit();

    // Auto-create or update customer by phone number
    try {
      await upsertCustomerByPhone(input.customer, orderRef.id, subtotal + input.deliveryZone.fee);
    } catch {
      // Non-critical — don't fail the order if customer tracking fails
    }

    return { success: true, orderId: orderRef.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

async function upsertCustomerByPhone(
  customer: Customer,
  orderId: string,
  orderTotal: number
): Promise<void> {
  const phone = customer.phone;
  if (!phone) return;

  // Find existing customer by phone
  const q = query(collection(db, "users"), where("phone", "==", phone), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    // Create new customer
    await addDoc(collection(db, "users"), {
      name: customer.name,
      email: "",
      phone,
      address: customer.address,
      orders: [orderId],
      total_spent: orderTotal,
      order_count: 1,
      delivered_count: 0,
      cancelled_count: 0,
      last_order_date: Timestamp.now(),
      created_at: Timestamp.now(),
    });
  } else {
    // Update existing customer
    const existingDoc = snap.docs[0];
    const existing = existingDoc.data();
    await updateDoc(doc(db, "users", existingDoc.id), {
      name: customer.name,
      address: customer.address,
      orders: [...(existing.orders || []), orderId],
      total_spent: (existing.total_spent || 0) + orderTotal,
      order_count: (existing.order_count || 0) + 1,
      last_order_date: Timestamp.now(),
    });
  }
}
