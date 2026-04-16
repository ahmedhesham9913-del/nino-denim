"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Order, OrderStatus, OrderReturnRecord, OrderFee } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";
import { getOrders, updateOrderStatus } from "@/services/orders";
import { processReturn } from "@/services/returns";
import AdminTable, { type AdminTableColumn } from "@/components/admin/AdminTable";
import OrderDetail from "@/components/admin/OrderDetail";
import OrderFilterBar from "@/components/admin/OrderFilterBar";

const ALL_STATUSES: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "partially_returned",
  "returned",
  "exchanged",
];

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

const PAGE_SIZE = 100;

function formatDate(createdAt: unknown): string {
  try {
    const ts = createdAt as { toDate?: () => Date };
    const date = ts?.toDate?.() ?? new Date(createdAt as string);
    return date.toLocaleDateString("en-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "--";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);
  const [filters, setFilters] = useState({ search: "", startDate: "", endDate: "" });

  const fetchOrders = useCallback(
    async (cursor: DocumentSnapshot | null = null) => {
      setLoading(true);
      setExpandedIndex(null);
      try {
        const result = await getOrders({
          pageSize: PAGE_SIZE,
          lastDoc: cursor,
          status: activeTab === "all" ? undefined : activeTab,
        });
        setOrders(result.items);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    setPage(1);
    setPageHistory([null]);
    fetchOrders(null);
  }, [fetchOrders]);

  function handleNextPage() {
    if (!hasMore || !lastDoc) return;
    setPageHistory((prev) => [...prev, lastDoc]);
    setPage((p) => p + 1);
    fetchOrders(lastDoc);
  }

  function handlePrevPage() {
    if (page <= 1) return;
    const newHistory = [...pageHistory];
    newHistory.pop();
    setPageHistory(newHistory);
    setPage((p) => p - 1);
    fetchOrders(newHistory[newHistory.length - 1]);
  }

  async function handleStatusChange(
    orderId: string,
    newStatus: OrderStatus,
    shippingCompany?: string,
    returns?: OrderReturnRecord[],
    fees?: OrderFee[]
  ) {
    // If returns/exchanges are provided, use processReturn for stock management
    if (returns && returns.length > 0) {
      await processReturn(orderId, returns, fees ?? [], newStatus);
    } else {
      await updateOrderStatus(orderId, newStatus, shippingCompany);
    }
    // Refresh the current page
    const cursor = pageHistory[pageHistory.length - 1];
    await fetchOrders(cursor);
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchId = (order.id ?? "").toLowerCase().includes(searchLower);
        const matchName = order.customer.name.toLowerCase().includes(searchLower);
        const matchPhone = order.customer.phone.toLowerCase().includes(searchLower);
        const matchProduct = order.items.some((i) =>
          i.name.toLowerCase().includes(searchLower)
        );
        if (!matchId && !matchName && !matchPhone && !matchProduct) return false;
      }
      // Date filters
      if (filters.startDate || filters.endDate) {
        let orderDate: Date;
        try {
          const ts = order.created_at as unknown as { toDate?: () => Date; seconds?: number };
          if (ts?.toDate) {
            orderDate = ts.toDate();
          } else if (ts?.seconds) {
            orderDate = new Date(ts.seconds * 1000);
          } else {
            orderDate = new Date(order.created_at as unknown as string);
          }
        } catch {
          return false;
        }
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }
      }
      return true;
    });
  }, [orders, filters]);

  const columns: AdminTableColumn[] = [
    {
      key: "id",
      label: "Order ID",
      width: "120px",
      render: (item) => (
        <span className="font-display font-medium text-nino-600 text-xs">
          {((item.id as string) ?? "").slice(0, 8)}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (item) => {
        const customer = item.customer as Order["customer"];
        return <span className="font-body text-sm">{customer?.name ?? "--"}</span>;
      },
    },
    {
      key: "items",
      label: "Items",
      width: "80px",
      render: (item) => {
        const items = item.items as Order["items"];
        return <span className="font-body text-sm text-nino-800/60">{items?.length ?? 0}</span>;
      },
    },
    {
      key: "total_price",
      label: "Total",
      width: "120px",
      render: (item) => (
        <span className="font-display font-semibold text-sm">
          {((item.total_price as number) ?? 0).toLocaleString()} EGP
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (item) => {
        const status = item.status as OrderStatus;
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-display font-semibold capitalize ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      width: "120px",
      render: (item) => (
        <span className="font-body text-xs text-nino-800/50">
          {formatDate(item.created_at)}
        </span>
      ),
    },
  ];

  // Map filtered orders to Record<string, unknown> for AdminTable
  const tableData: Record<string, unknown>[] = filteredOrders.map((o) => ({ ...o }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-nino-950">Orders</h1>
        <p className="font-body text-sm text-nino-800/40 mt-1">Manage and track customer orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-1.5 rounded-lg text-xs font-display font-semibold capitalize transition-colors ${
              activeTab === status
                ? "bg-nino-950 text-white"
                : "bg-white border border-nino-200/20 text-nino-800/60 hover:bg-nino-50"
            }`}
          >
            {status === "all" ? "All" : status}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <OrderFilterBar filters={filters} onChange={setFilters} />

      {/* Table */}
      {loading ? (
        <AdminTable columns={columns} data={[]} loading />
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-xl border border-nino-200/15 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nino-200/15">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40"
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-16 text-center font-body text-sm text-nino-400"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  tableData.map((item, rowIdx) => (
                    <React.Fragment key={`order-${rowIdx}`}>
                      <tr
                        onClick={() =>
                          setExpandedIndex(expandedIndex === rowIdx ? null : rowIdx)
                        }
                        className={`border-b border-nino-200/15 cursor-pointer transition-colors duration-100 ${
                          expandedIndex === rowIdx
                            ? "bg-nino-100/30"
                            : rowIdx % 2 === 0
                            ? "bg-white"
                            : "bg-nino-50/30"
                        } hover:bg-nino-100/30`}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className="px-4 py-3.5 font-body text-sm text-nino-800"
                            style={col.width ? { width: col.width } : undefined}
                          >
                            {col.render ? col.render(item) : (item[col.key] as React.ReactNode) ?? "\u2014"}
                          </td>
                        ))}
                      </tr>
                      {expandedIndex === rowIdx && (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="bg-nino-50/30 px-6 py-5 border-b border-nino-200/15"
                          >
                            <OrderDetail
                              order={filteredOrders[rowIdx]}
                              onStatusChange={handleStatusChange}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-nino-800/40 font-display">Page {page}</span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-display font-medium rounded-lg border border-nino-200/20 text-nino-800/60 hover:bg-nino-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className="px-3 py-1.5 text-xs font-display font-medium rounded-lg border border-nino-200/20 text-nino-800/60 hover:bg-nino-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
