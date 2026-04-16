import { getOrderById } from "./orders";
import type { Order } from "@/lib/types";

/**
 * Fetch multiple orders by their IDs in parallel.
 * Skips any IDs that resolve to null (deleted / missing orders).
 */
export async function getCustomerOrders(
  orderIds: string[]
): Promise<Order[]> {
  if (orderIds.length === 0) return [];

  const results = await Promise.all(
    orderIds.map((id) => getOrderById(id))
  );

  // Filter out nulls (deleted orders) and return in original order
  return results.filter((o): o is Order => o !== null);
}
