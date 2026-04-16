import { supabase } from "@/lib/supabase";
import { db, collection, getDocs, query, where, orderBy } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

/** Fetch all orders in a date range from Firestore */
async function fetchOrdersInRange(startDate: Date, endDate: Date) {
  const startTs = Timestamp.fromDate(startDate);
  const endTs = Timestamp.fromDate(endDate);

  const q = query(
    collection(db, "orders"),
    where("created_at", ">=", startTs),
    where("created_at", "<=", endTs),
    orderBy("created_at", "asc")
  );
  const snap = await getDocs(q);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, any>[];
}

/** Flatten order items from an array of orders */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenItems(orders: Record<string, any>[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Record<string, any>[] = [];
  for (const order of orders) {
    const orderItems = order.items ?? order.order_items ?? [];
    for (const item of orderItems) {
      items.push({ ...item, _order: order });
    }
  }
  return items;
}

export interface SummaryCards {
  ordersToday: number;
  revenueToday: number;
  viewsToday: number;
  siteVisits: number;
  conversionRate: number;
}

export async function getSummaryCards(date: Date): Promise<SummaryCards> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Views today from Supabase
  const { count: viewsToday } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "product_view")
    .gte("timestamp", startOfDay.toISOString());

  // Site visits (page_view events) from Supabase
  const { count: siteVisits } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "page_view")
    .gte("timestamp", startOfDay.toISOString());

  // Orders + Revenue today from Firestore (reliable source of truth)
  const startTs = Timestamp.fromDate(startOfDay);
  const ordersQuery = query(
    collection(db, "orders"),
    where("created_at", ">=", startTs),
    orderBy("created_at", "desc")
  );
  const ordersSnap = await getDocs(ordersQuery);
  const ordersToday = ordersSnap.docs.length;
  const revenueToday = ordersSnap.docs.reduce(
    (sum, d) => sum + (d.data().total_price || 0),
    0
  );

  // Conversion funnel for rate
  const { count: cartAdds } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "add_to_cart")
    .gte("timestamp", startOfDay.toISOString());

  const conversionRate =
    (viewsToday ?? 0) > 0
      ? Math.round(((ordersToday ?? 0) / (viewsToday ?? 1)) * 100)
      : 0;

  return {
    ordersToday: ordersToday ?? 0,
    revenueToday,
    viewsToday: viewsToday ?? 0,
    siteVisits: siteVisits ?? 0,
    conversionRate,
  };
}

export async function getMostViewed(
  startDate: Date,
  endDate: Date
): Promise<{ productId: string; productName: string; viewCount: number }[]> {
  const { data } = await supabase
    .from("events")
    .select("product_id")
    .eq("event_type", "product_view")
    .not("product_id", "is", null)
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString());

  if (!data || data.length === 0) return [];

  // Count views per product
  const counts = new Map<string, number>();
  data.forEach((e) => {
    const id = e.product_id!;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return sorted.map(([productId, viewCount]) => ({
    productId,
    productName: productId.slice(0, 8) + "...",
    viewCount,
  }));
}

export async function getConversionFunnel(
  startDate: Date,
  endDate: Date
): Promise<{ stage: string; count: number; percentage: number }[]> {
  const stages = ["product_view", "add_to_cart", "checkout_started", "order_created"];
  const labels = ["Product Views", "Add to Cart", "Checkout Started", "Orders Placed"];

  const results: { stage: string; count: number; percentage: number }[] = [];

  for (let i = 0; i < stages.length; i++) {
    const { count } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", stages[i])
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString());

    results.push({
      stage: labels[i],
      count: count ?? 0,
      percentage: 0,
    });
  }

  // Calculate percentages relative to first stage
  const firstCount = results[0]?.count || 1;
  results.forEach((r) => {
    r.percentage = Math.round((r.count / firstCount) * 100);
  });

  return results;
}

export async function getDailyRevenue(
  startDate: Date,
  endDate: Date
): Promise<{ date: string; revenue: number }[]> {
  const startTs = Timestamp.fromDate(startDate);
  const endTs = Timestamp.fromDate(endDate);

  const ordersQuery = query(
    collection(db, "orders"),
    where("created_at", ">=", startTs),
    where("created_at", "<=", endTs),
    orderBy("created_at", "asc")
  );
  const snap = await getDocs(ordersQuery);

  const dailyMap = new Map<string, number>();
  snap.docs.forEach((d) => {
    const data = d.data();
    const ts = data.created_at?.toDate?.() ?? new Date();
    const dateKey = ts.toISOString().split("T")[0];
    dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + (data.total_price || 0));
  });

  return [...dailyMap.entries()]
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopCustomers(
  startDate: Date,
  endDate: Date
): Promise<{ name: string; phone: string; totalSpent: number; orderCount: number }[]> {
  const startTs = Timestamp.fromDate(startDate);
  const endTs = Timestamp.fromDate(endDate);

  const ordersQuery = query(
    collection(db, "orders"),
    where("created_at", ">=", startTs),
    where("created_at", "<=", endTs),
    orderBy("created_at", "desc")
  );
  const snap = await getDocs(ordersQuery);

  const customers = new Map<string, { name: string; phone: string; totalSpent: number; orderCount: number }>();
  snap.docs.forEach((d) => {
    const data = d.data();
    const phone = data.customer?.phone ?? "unknown";
    const existing = customers.get(phone);
    if (existing) {
      existing.totalSpent += data.total_price || 0;
      existing.orderCount++;
    } else {
      customers.set(phone, {
        name: data.customer?.name ?? "Unknown",
        phone,
        totalSpent: data.total_price || 0,
        orderCount: 1,
      });
    }
  });

  return [...customers.values()]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 20);
}

/* ================================================================== */
/*  REVENUE                                                            */
/* ================================================================== */

export async function getRevenueByCategory(
  startDate: Date,
  endDate: Date
): Promise<{ category: string; revenue: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);
  const items = flattenItems(orders);

  const map = new Map<string, number>();
  for (const item of items) {
    const category = item.category ?? item.product_category ?? "Uncategorized";
    const rev = (item.unit_price ?? item.price ?? 0) * (item.quantity ?? 1);
    map.set(category, (map.get(category) ?? 0) + rev);
  }

  return [...map.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getRevenueByZone(
  startDate: Date,
  endDate: Date
): Promise<{ zone: string; revenue: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);

  const map = new Map<string, number>();
  for (const order of orders) {
    const zone = order.delivery_zone ?? "Unknown";
    map.set(zone, (map.get(zone) ?? 0) + (order.total_price ?? 0));
  }

  return [...map.entries()]
    .map(([zone, revenue]) => ({ zone, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getNetRevenue(
  startDate: Date,
  endDate: Date
): Promise<{ gross: number; returns: number; fees: number; net: number }> {
  const orders = await fetchOrdersInRange(startDate, endDate);

  let gross = 0;
  let returns = 0;
  let fees = 0;

  for (const order of orders) {
    gross += order.total_price ?? 0;

    // Sum returned item values
    const returnedItems = order.returns ?? order.returned_items ?? [];
    for (const ret of returnedItems) {
      returns += (ret.unit_price ?? ret.price ?? 0) * (ret.quantity ?? 1);
    }

    // Sum return fees paid by store
    const returnFees = order.return_fees ?? [];
    for (const fee of returnFees) {
      if (fee.paid_by === "store") {
        fees += fee.amount ?? fee.fee ?? 0;
      }
    }
  }

  return {
    gross,
    returns,
    fees,
    net: gross - returns - fees,
  };
}

/* ================================================================== */
/*  PRODUCTS                                                           */
/* ================================================================== */

export async function getTopProductsByRevenue(
  startDate: Date,
  endDate: Date,
  limit = 10
): Promise<{ productName: string; revenue: number; unitsSold: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);
  const items = flattenItems(orders);

  const map = new Map<string, { revenue: number; unitsSold: number }>();
  for (const item of items) {
    const name = item.product_name ?? item.name ?? "Unknown";
    const qty = item.quantity ?? 1;
    const rev = (item.unit_price ?? item.price ?? 0) * qty;
    const existing = map.get(name);
    if (existing) {
      existing.revenue += rev;
      existing.unitsSold += qty;
    } else {
      map.set(name, { revenue: rev, unitsSold: qty });
    }
  }

  return [...map.entries()]
    .map(([productName, stats]) => ({ productName, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getTopColors(
  startDate: Date,
  endDate: Date
): Promise<{ color: string; hex: string; count: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);
  const items = flattenItems(orders);

  const map = new Map<string, { hex: string; count: number }>();
  for (const item of items) {
    const colorName = item.color ?? item.color_name ?? "Unknown";
    const hex = item.color_hex ?? item.hex ?? "#888888";
    const qty = item.quantity ?? 1;
    const existing = map.get(colorName);
    if (existing) {
      existing.count += qty;
    } else {
      map.set(colorName, { hex, count: qty });
    }
  }

  return [...map.entries()]
    .map(([color, stats]) => ({ color, ...stats }))
    .sort((a, b) => b.count - a.count);
}

export async function getTopSizes(
  startDate: Date,
  endDate: Date
): Promise<{ size: string; count: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);
  const items = flattenItems(orders);

  const map = new Map<string, number>();
  for (const item of items) {
    const size = item.size ?? "Unknown";
    const qty = item.quantity ?? 1;
    map.set(size, (map.get(size) ?? 0) + qty);
  }

  return [...map.entries()]
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => b.count - a.count);
}

/* ================================================================== */
/*  ORDERS                                                             */
/* ================================================================== */

export async function getOrderStatusBreakdown(
  startDate: Date,
  endDate: Date
): Promise<{ status: string; count: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);

  const map = new Map<string, number>();
  for (const order of orders) {
    const status = order.status ?? "unknown";
    map.set(status, (map.get(status) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getReturnRate(
  startDate: Date,
  endDate: Date
): Promise<number> {
  const orders = await fetchOrdersInRange(startDate, endDate);
  if (orders.length === 0) return 0;

  const ordersWithReturns = orders.filter((o) => {
    const returns = o.returns ?? o.returned_items ?? [];
    return Array.isArray(returns) && returns.length > 0;
  });

  return (ordersWithReturns.length / orders.length) * 100;
}

export async function getAOVTrend(
  startDate: Date,
  endDate: Date
): Promise<{ date: string; aov: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);

  const dailyMap = new Map<string, { total: number; count: number }>();
  for (const order of orders) {
    const ts = order.created_at?.toDate?.() ?? new Date();
    const dateKey = ts.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey);
    if (existing) {
      existing.total += order.total_price ?? 0;
      existing.count++;
    } else {
      dailyMap.set(dateKey, { total: order.total_price ?? 0, count: 1 });
    }
  }

  return [...dailyMap.entries()]
    .map(([date, { total, count }]) => ({
      date,
      aov: count > 0 ? Math.round(total / count) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* ================================================================== */
/*  CUSTOMERS                                                          */
/* ================================================================== */

export async function getNewVsReturning(
  startDate: Date,
  endDate: Date
): Promise<{ newCustomers: number; returningCustomers: number }> {
  const startTs = Timestamp.fromDate(startDate);
  const endTs = Timestamp.fromDate(endDate);

  const usersQuery = query(
    collection(db, "users"),
    where("created_at", ">=", startTs),
    where("created_at", "<=", endTs),
    orderBy("created_at", "asc")
  );
  const snap = await getDocs(usersQuery);

  let newCustomers = 0;
  let returningCustomers = 0;
  snap.docs.forEach((d) => {
    const data = d.data();
    const orderCount = data.order_count ?? 0;
    if (orderCount > 1) {
      returningCustomers++;
    } else {
      newCustomers++;
    }
  });

  return { newCustomers, returningCustomers };
}

export async function getCustomerByGovernorate(
  startDate: Date,
  endDate: Date
): Promise<{ governorate: string; count: number }[]> {
  const orders = await fetchOrdersInRange(startDate, endDate);

  const map = new Map<string, number>();
  for (const order of orders) {
    const gov =
      order.customer?.location?.governorate ??
      order.delivery_zone ??
      "Unknown";
    map.set(gov, (map.get(gov) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([governorate, count]) => ({ governorate, count }))
    .sort((a, b) => b.count - a.count);
}

/* ================================================================== */
/*  SHIPPING                                                           */
/* ================================================================== */

export async function getShippingSettlement(
  startDate: Date,
  endDate: Date
): Promise<
  {
    company: string;
    ordersShipped: number;
    feesCollected: number;
    storePaid: number;
    customerPaid: number;
    netSettlement: number;
  }[]
> {
  const orders = await fetchOrdersInRange(startDate, endDate);

  const map = new Map<
    string,
    {
      ordersShipped: number;
      feesCollected: number;
      storePaid: number;
      customerPaid: number;
    }
  >();

  for (const order of orders) {
    const company =
      order.shipping_company ?? order.delivery_company ?? "Unknown";

    const existing = map.get(company) ?? {
      ordersShipped: 0,
      feesCollected: 0,
      storePaid: 0,
      customerPaid: 0,
    };

    existing.ordersShipped++;
    existing.feesCollected += order.delivery_fee ?? order.shipping_fee ?? 0;

    // Process return fees
    const returnFees = order.return_fees ?? [];
    for (const fee of returnFees) {
      const amount = fee.amount ?? fee.fee ?? 0;
      if (fee.paid_by === "store") {
        existing.storePaid += amount;
      } else {
        existing.customerPaid += amount;
      }
    }

    map.set(company, existing);
  }

  return [...map.entries()]
    .map(([company, stats]) => ({
      company,
      ...stats,
      netSettlement:
        stats.feesCollected - stats.customerPaid + stats.storePaid,
    }))
    .sort((a, b) => b.ordersShipped - a.ordersShipped);
}
