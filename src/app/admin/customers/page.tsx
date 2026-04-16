"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { User, Order, OrderStatus } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";
import { getUsers } from "@/services/users";
import { getCustomerOrders } from "@/services/customers";
import Link from "next/link";

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  partially_returned: "bg-orange-100 text-orange-800",
  returned: "bg-rose-100 text-rose-800",
  exchanged: "bg-teal-100 text-teal-800",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDate(value: unknown): string {
  try {
    const ts = value as { toDate?: () => Date; seconds?: number };
    let date: Date;
    if (ts?.toDate) {
      date = ts.toDate();
    } else if (ts?.seconds) {
      date = new Date(ts.seconds * 1000);
    } else {
      date = new Date(value as string);
    }
    if (isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "--";
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-EG") + " EGP";
}

function toDate(value: unknown): Date | null {
  try {
    const ts = value as { toDate?: () => Date; seconds?: number };
    if (ts?.toDate) return ts.toDate();
    if (ts?.seconds) return new Date(ts.seconds * 1000);
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function isActiveCustomer(lastOrderDate: unknown): boolean {
  const date = toDate(lastOrderDate);
  if (!date) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return date >= thirtyDaysAgo;
}

/* ------------------------------------------------------------------ */
/*  Expanded Customer Detail                                          */
/* ------------------------------------------------------------------ */

function CustomerExpandedRow({ user }: { user: User }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchOrders() {
      setLoadingOrders(true);
      setOrderError("");
      try {
        const result = await getCustomerOrders(user.orders ?? []);
        if (!cancelled) {
          // Sort by created_at descending
          result.sort((a, b) => {
            const da = toDate(a.created_at)?.getTime() ?? 0;
            const db = toDate(b.created_at)?.getTime() ?? 0;
            return db - da;
          });
          setOrders(result);
        }
      } catch {
        if (!cancelled) setOrderError("Failed to load orders");
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    }
    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user.orders]);

  const memberSince = formatDate(user.created_at);
  const avgOrderValue =
    user.order_count > 0 ? user.total_spent / user.order_count : 0;

  return (
    <div className="space-y-5">
      {/* Customer Info Card */}
      <div>
        <h4 className="mb-2 font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
          Customer Information
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="mb-0.5 block font-display text-[11px] uppercase tracking-wider text-nino-800/35">
              Name
            </span>
            <span className="font-body text-sm text-nino-950">
              {user.name}
            </span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="mb-0.5 block font-display text-[11px] uppercase tracking-wider text-nino-800/35">
              Phone
            </span>
            <span className="font-body text-sm text-nino-950">
              {user.phone || "\u2014"}
            </span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="mb-0.5 block font-display text-[11px] uppercase tracking-wider text-nino-800/35">
              Address
            </span>
            <span className="font-body text-sm text-nino-950">
              {user.address || "\u2014"}
            </span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="mb-0.5 block font-display text-[11px] uppercase tracking-wider text-nino-800/35">
              Member Since
            </span>
            <span className="font-body text-sm text-nino-950">
              {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div>
        <h4 className="mb-2 font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
          Customer Stats
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-lg border border-nino-200/15 bg-white p-3 text-center">
            <span className="block font-display text-lg font-bold text-nino-950">
              {formatCurrency(user.total_spent)}
            </span>
            <span className="font-display text-[10px] uppercase tracking-wider text-nino-800/35">
              Total Spent
            </span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3 text-center">
            <span className="block font-display text-lg font-bold text-nino-950">
              {user.order_count}
            </span>
            <span className="font-display text-[10px] uppercase tracking-wider text-nino-800/35">
              Orders
            </span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3 text-center">
            <span className="block font-display text-lg font-bold text-green-700">
              {user.delivered_count ?? 0}
            </span>
            <span className="font-display text-[10px] uppercase tracking-wider text-nino-800/35">
              Delivered
            </span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3 text-center">
            <span className="block font-display text-lg font-bold text-red-600">
              {user.cancelled_count ?? 0}
            </span>
            <span className="font-display text-[10px] uppercase tracking-wider text-nino-800/35">
              Cancelled
            </span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3 text-center">
            <span className="block font-display text-lg font-bold text-nino-950">
              {formatCurrency(Math.round(avgOrderValue))}
            </span>
            <span className="font-display text-[10px] uppercase tracking-wider text-nino-800/35">
              Avg. Order
            </span>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h4 className="mb-2 font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
          Order History
        </h4>

        {loadingOrders ? (
          <div className="rounded-lg border border-nino-200/15 bg-white p-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-nino-300 border-t-nino-600" />
              <span className="font-body text-sm text-nino-400">
                Loading orders...
              </span>
            </div>
          </div>
        ) : orderError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
            {orderError}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-nino-200/15 bg-white px-4 py-8 text-center">
            <span className="font-body text-sm text-nino-400">
              No orders found for this customer
            </span>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-nino-200/15 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nino-200/15 bg-nino-50/30">
                  <th className="px-4 py-2 text-left font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/35">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/35">
                    Date
                  </th>
                  <th className="px-4 py-2 text-right font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/35">
                    Items
                  </th>
                  <th className="px-4 py-2 text-right font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/35">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/35">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/35">
                    Zone
                  </th>
                  <th className="px-4 py-2 text-right font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/35">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id ?? i}
                    className="border-b border-nino-200/10 last:border-b-0"
                  >
                    <td className="px-4 py-2.5">
                      <span className="font-display text-xs font-medium text-nino-600">
                        {(order.id ?? "").slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-body text-sm text-nino-800">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-body text-sm text-nino-800/60">
                      {order.items?.length ?? 0}
                    </td>
                    <td className="px-4 py-2.5 text-right font-display text-sm font-semibold text-nino-950">
                      {formatCurrency(order.total_price)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 font-display text-xs font-semibold capitalize ${
                          STATUS_COLORS[order.status] ??
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-body text-sm text-nino-800/60">
                      {order.delivery_zone || "\u2014"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href="/admin/orders"
                        className="font-display text-[11px] font-medium text-nino-600 transition-colors hover:text-nino-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([
    null,
  ]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(
    async (cursor: DocumentSnapshot | null = null) => {
      setLoading(true);
      setExpandedId(null);
      try {
        const result = await getUsers({
          pageSize: PAGE_SIZE,
          lastDoc: cursor,
        });
        setUsers(result.items);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(null);
  }, [fetchUsers]);

  function handleNextPage() {
    if (!hasMore || !lastDoc) return;
    setPageHistory((prev) => [...prev, lastDoc]);
    setPage((p) => p + 1);
    fetchUsers(lastDoc);
  }

  function handlePrevPage() {
    if (page <= 1) return;
    const newHistory = [...pageHistory];
    newHistory.pop();
    setPageHistory(newHistory);
    setPage((p) => p - 1);
    fetchUsers(newHistory[newHistory.length - 1]);
  }

  /* Client-side search filtering by name or phone */
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-nino-950">
          Customers
        </h1>
        <p className="mt-1 font-body text-sm text-nino-800/40">
          Customer analytics and order history
        </p>
      </div>

      {/* Search + Count bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-nino-400"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11 11l3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full rounded-lg border border-nino-200/30 bg-white py-2 pl-9 pr-3 font-body text-sm text-nino-800 outline-none transition-colors focus:border-nino-500 focus:ring-2 focus:ring-nino-500/20"
          />
        </div>
        <span className="font-display text-xs text-nino-800/40">
          {filteredUsers.length} customer{filteredUsers.length !== 1 ? "s" : ""}
          {search.trim() && users.length !== filteredUsers.length && (
            <span> of {users.length}</span>
          )}
        </span>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="w-full overflow-x-auto rounded-xl border border-nino-200/15 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-nino-200/15">
                {["Name", "Phone", "Total Spent", "Orders", "Delivery Ratio", "Last Order", "Status"].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-4 rounded bg-nino-200/30" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center rounded-xl border border-nino-200/15 bg-white py-16">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 text-nino-300/50"
          >
            <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="28" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M24 28c0-3.314 1.79-6 4-6s4 2.686 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="font-body text-sm text-nino-400">
            {search.trim() ? "No customers match your search" : "No customers yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-xl border border-nino-200/15 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nino-200/15">
                  <th className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-right font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-center font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                    Delivery Ratio
                  </th>
                  <th className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                    Last Order
                  </th>
                  <th className="px-4 py-3 text-center font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, rowIdx) => {
                  const isExpanded = expandedId === user.id;
                  const active = isActiveCustomer(user.last_order_date);
                  const delivered = user.delivered_count ?? 0;
                  const cancelled = user.cancelled_count ?? 0;

                  return (
                    <React.Fragment key={user.id ?? rowIdx}>
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : (user.id ?? null))
                        }
                        className={`cursor-pointer border-b border-nino-200/15 transition-colors duration-100 ${
                          isExpanded
                            ? "bg-nino-100/30"
                            : rowIdx % 2 === 0
                            ? "bg-white"
                            : "bg-nino-50/30"
                        } hover:bg-nino-100/30`}
                      >
                        {/* Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-semibold ${
                                active
                                  ? "bg-nino-600/10 text-nino-700"
                                  : "bg-nino-200/30 text-nino-500"
                              }`}
                            >
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                            <span className="font-body text-sm font-medium text-nino-800">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3.5 font-body text-sm text-nino-800/70">
                          {user.phone || "\u2014"}
                        </td>

                        {/* Total Spent */}
                        <td className="px-4 py-3.5 text-right font-display text-sm font-semibold text-nino-950">
                          {formatCurrency(user.total_spent)}
                        </td>

                        {/* Orders */}
                        <td className="px-4 py-3.5 text-center font-display text-sm font-semibold text-nino-600">
                          {user.order_count}
                        </td>

                        {/* Delivery Ratio */}
                        <td className="px-4 py-3.5">
                          <span className="font-body text-sm text-nino-800/60">
                            {delivered}/{user.order_count} delivered
                            {cancelled > 0 && (
                              <span className="text-red-500">
                                , {cancelled} cancelled
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Last Order */}
                        <td className="px-4 py-3.5 font-body text-xs text-nino-800/50">
                          {formatDate(user.last_order_date)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 font-display text-[11px] font-semibold ${
                              active
                                ? "bg-green-100 text-green-700"
                                : "bg-nino-100 text-nino-500"
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-b border-nino-200/15 bg-nino-50/30 px-6 py-5"
                          >
                            <CustomerExpandedRow user={user} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="font-display text-xs text-nino-800/40">
              Page {page}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="rounded-lg border border-nino-200/20 px-3 py-1.5 font-display text-xs font-medium text-nino-800/60 transition-colors hover:bg-nino-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasMore}
                className="rounded-lg border border-nino-200/20 px-3 py-1.5 font-display text-xs font-medium text-nino-800/60 transition-colors hover:bg-nino-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
