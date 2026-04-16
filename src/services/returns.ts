import {
  db,
  doc,
  getDoc,
  Timestamp,
} from "@/lib/firebase";
import { writeBatch } from "firebase/firestore";
import type {
  Order,
  OrderStatus,
  OrderReturnRecord,
  OrderFee,
  ProductVariant,
} from "@/lib/types";

/**
 * Process return / exchange for an order.
 *
 * 1. For each "return" record  → restore stock to the original product variant + size.
 * 2. For each "exchange" record → restore old stock AND decrement new stock.
 * 3. Update the order document: append to `returns`, append to `return_fees`, set new status.
 *
 * Everything happens inside a single Firestore batch write.
 */
export async function processReturn(
  orderId: string,
  returns: OrderReturnRecord[],
  fees: OrderFee[],
  newStatus: OrderStatus
): Promise<void> {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    throw new Error(`Order ${orderId} not found`);
  }
  const order = { id: orderSnap.id, ...orderSnap.data() } as Order;

  // Collect all product docs we need to read (old items + exchange targets)
  const productIdsToRead = new Set<string>();

  for (const r of returns) {
    const item = order.items[r.item_index];
    if (!item) throw new Error(`Invalid item_index ${r.item_index}`);
    productIdsToRead.add(item.product_id);

    if (r.type === "exchange" && r.exchange_product_id) {
      productIdsToRead.add(r.exchange_product_id);
    }
  }

  // Read all required product docs
  const productVariantsMap = new Map<string, ProductVariant[]>();
  for (const pid of productIdsToRead) {
    const pSnap = await getDoc(doc(db, "products", pid));
    if (!pSnap.exists()) {
      throw new Error(`Product ${pid} not found — cannot adjust stock`);
    }
    const data = pSnap.data();
    productVariantsMap.set(pid, [...(data.variants ?? [])] as ProductVariant[]);
  }

  // Deep-clone variants so mutations are safe
  function cloneVariants(variants: ProductVariant[]): ProductVariant[] {
    return variants.map((v) => ({
      ...v,
      sizes: v.sizes.map((s) => ({ ...s })),
    }));
  }

  const mutatedProducts = new Map<string, ProductVariant[]>();

  function getVariants(pid: string): ProductVariant[] {
    if (!mutatedProducts.has(pid)) {
      mutatedProducts.set(pid, cloneVariants(productVariantsMap.get(pid)!));
    }
    return mutatedProducts.get(pid)!;
  }

  // Apply stock changes
  for (const r of returns) {
    const item = order.items[r.item_index];

    if (r.type === "return") {
      // Restore stock to the original variant + size
      const variants = getVariants(item.product_id);
      const variant = variants.find((v) => v.colorName === item.color);
      if (variant) {
        const size = variant.sizes.find((s) => s.value === item.size);
        if (size) {
          size.stock += r.quantity;
        }
      }
    } else if (r.type === "exchange") {
      // Restore old stock
      const oldVariants = getVariants(item.product_id);
      const oldVariant = oldVariants.find((v) => v.colorName === item.color);
      if (oldVariant) {
        const oldSize = oldVariant.sizes.find((s) => s.value === item.size);
        if (oldSize) {
          oldSize.stock += r.quantity;
        }
      }

      // Decrement new stock
      if (r.exchange_product_id && r.exchange_color && r.exchange_size) {
        const newVariants = getVariants(r.exchange_product_id);
        const newVariant = newVariants.find(
          (v) => v.colorName === r.exchange_color
        );
        if (newVariant) {
          const newSize = newVariant.sizes.find(
            (s) => s.value === r.exchange_size
          );
          if (newSize) {
            newSize.stock = Math.max(0, newSize.stock - r.quantity);
          }
        }
      }
    }
  }

  // Build batch
  const batch = writeBatch(db);

  // Write back mutated product variants
  for (const [pid, variants] of mutatedProducts) {
    batch.update(doc(db, "products", pid), { variants });
  }

  // Stamp each return record with the current timestamp
  const stamped: OrderReturnRecord[] = returns.map((r) => ({
    ...r,
    date: Timestamp.now(),
  }));

  // Update order
  const existingReturns: OrderReturnRecord[] = order.returns ?? [];
  const existingFees: OrderFee[] = order.return_fees ?? [];

  batch.update(orderRef, {
    returns: [...existingReturns, ...stamped],
    return_fees: [...existingFees, ...fees],
    status: newStatus,
  });

  await batch.commit();
}
