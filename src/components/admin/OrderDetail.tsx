"use client";

import React, { useState, useEffect } from "react";
import type { Order, OrderStatus, OrderReturnRecord, OrderFee, ShippingCompany, ShippingStatusRule } from "@/lib/types";
import { getShippingCompanies } from "@/services/shipping-companies";
import { getProductById } from "@/services/products";
import { finalizeDelivery } from "@/services/orders";
import ShippingCompanyModal from "./ShippingCompanyModal";
import ReturnModal from "./ReturnModal";
import ExchangeModal from "./ExchangeModal";

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

const RETURN_STATUSES: OrderStatus[] = ["partially_returned", "returned"];
const EXCHANGE_STATUSES: OrderStatus[] = ["exchanged"];

interface OrderDetailProps {
  order: Order;
  onStatusChange: (
    orderId: string,
    newStatus: OrderStatus,
    shippingCompany?: string,
    returns?: OrderReturnRecord[],
    fees?: OrderFee[]
  ) => Promise<void>;
  loading?: boolean;
}

function formatTimestamp(ts: unknown): string {
  try {
    const stamp = ts as { toDate?: () => Date; seconds?: number };
    if (stamp?.toDate) return stamp.toDate().toLocaleString("en-EG");
    if (stamp?.seconds) return new Date(stamp.seconds * 1000).toLocaleString("en-EG");
    return new Date(ts as string).toLocaleString("en-EG");
  } catch {
    return "--";
  }
}

export default function OrderDetail({ order, onStatusChange, loading }: OrderDetailProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  const validTransitions = STATUS_TRANSITIONS[order.status] ?? [];

  // Calculate settlement info for post-return delivery
  const RETURN_EXCHANGE_STATUSES: OrderStatus[] = ["partially_returned", "returned", "exchanged"];
  const isPostReturn = RETURN_EXCHANGE_STATUSES.includes(order.status);
  const returns = order.returns || [];

  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [settlementInfo, setSettlementInfo] = useState<{
    newSubtotal: number;
    newTotal: number;
    returnedValue: number;
    exchangeValue: number;
    fees: OrderFee[];
  } | null>(null);

  // Compute settlement when showing it — fetches shipping company + exchange product prices
  async function computeSettlement() {
    setSettlementLoading(true);
    try {
      // 1. Remaining items after returns (not exchanges — exchanged items are replaced, not removed)
      const returnedQtys = order.items.map((_, idx) =>
        returns
          .filter((r) => r.item_index === idx && r.type === "return")
          .reduce((sum, r) => sum + r.quantity, 0)
      );

      const remainingSubtotal = order.items.reduce(
        (sum, item, idx) => sum + item.unit_price * Math.max(0, item.quantity - returnedQtys[idx]),
        0
      );
      const returnedValue = order.items.reduce(
        (sum, item, idx) => sum + item.unit_price * returnedQtys[idx],
        0
      );

      // 2. Exchange price differences — fetch new product prices
      let exchangePriceDiff = 0;
      const exchangeRecords = returns.filter((r) => r.type === "exchange" && r.exchange_product_id);
      for (const ex of exchangeRecords) {
        const originalItem = order.items[ex.item_index];
        if (!originalItem) continue;
        // Fetch the new product to get its actual price
        if (ex.exchange_product_id) {
          const newProduct = await getProductById(ex.exchange_product_id);
          if (newProduct) {
            const priceDiff = (newProduct.price - originalItem.unit_price) * ex.quantity;
            exchangePriceDiff += priceDiff;
          }
        }
      }

      // 3. Fetch shipping company fee rules
      const fees: OrderFee[] = [...(order.return_fees || [])];
      if (order.shipping_company) {
        const companies = await getShippingCompanies();
        const company = companies.find((c) => c.name === order.shipping_company);
        if (company?.status_rules) {
          // Determine which rule key applies
          const hasReturns = returns.some((r) => r.type === "return");
          const hasExchanges = returns.some((r) => r.type === "exchange");
          const allReturned = returnedQtys.every((q, idx) => q >= order.items[idx].quantity);

          let ruleKey: string | null = null;
          if (allReturned) ruleKey = "returned";
          else if (hasExchanges) ruleKey = "exchanged";
          else if (hasReturns) ruleKey = "partially_returned";

          if (ruleKey && company.status_rules[ruleKey]) {
            const rule: ShippingStatusRule = company.status_rules[ruleKey];
            let feeAmount = 0;
            if (rule.formula === "percentage") {
              feeAmount = (order.delivery_fee * (rule.percentage || 0)) / 100;
            } else if (rule.formula === "fixed") {
              feeAmount = rule.fixed_amount || 0;
            } else if (rule.formula === "percentage_plus_fixed") {
              feeAmount = (order.delivery_fee * (rule.percentage || 0)) / 100 + (rule.fixed_amount || 0);
            }

            const statusLabel = ruleKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            // Only add if not already in fees
            if (!fees.some((f) => f.label.includes(statusLabel))) {
              fees.push({
                label: `${statusLabel} Fee (${company.name})`,
                amount: Math.round(feeAmount),
                paid_by: rule.paid_by,
              });
            }
          }
        }
      }

      // 4. Customer-paid fees add to their total, store-paid fees don't
      const customerFees = fees.filter((f) => f.paid_by === "customer").reduce((s, f) => s + f.amount, 0);

      const newTotal = remainingSubtotal + exchangePriceDiff + order.delivery_fee + customerFees;

      setSettlementInfo({
        newSubtotal: remainingSubtotal,
        newTotal: Math.max(0, newTotal),
        returnedValue,
        exchangeValue: exchangePriceDiff,
        fees,
      });
    } catch (err) {
      console.error("Settlement calculation failed:", err);
    } finally {
      setSettlementLoading(false);
    }
  }

  async function handleStatusChange() {
    if (!selectedStatus || !order.id) return;

    // Intercept "shipped" to show shipping company modal
    if (selectedStatus === "shipped") {
      setShowShippingModal(true);
      return;
    }

    // Intercept return statuses to show ReturnModal
    if (RETURN_STATUSES.includes(selectedStatus as OrderStatus)) {
      setShowReturnModal(true);
      return;
    }

    // Intercept exchange status to show ExchangeModal
    if (EXCHANGE_STATUSES.includes(selectedStatus as OrderStatus)) {
      setShowExchangeModal(true);
      return;
    }

    // Intercept "delivered" after return/exchange to show settlement
    if (selectedStatus === "delivered" && isPostReturn) {
      setShowSettlement(true);
      computeSettlement();
      return;
    }

    await applyStatusChange(selectedStatus as OrderStatus);
  }

  async function applyStatusChange(
    status: OrderStatus,
    shippingCompany?: string,
    returns?: OrderReturnRecord[],
    fees?: OrderFee[]
  ) {
    setError(null);
    setUpdating(true);
    try {
      await onStatusChange(order.id!, status, shippingCompany, returns, fees);
      setSelectedStatus("");
      setShowShippingModal(false);
      setShowReturnModal(false);
      setShowExchangeModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleReturnConfirm(
    returns: OrderReturnRecord[],
    newStatus: OrderStatus
  ) {
    await applyStatusChange(newStatus, undefined, returns, []);
  }

  async function handleExchangeConfirm(
    returns: OrderReturnRecord[],
    newStatus: OrderStatus
  ) {
    await applyStatusChange(newStatus, undefined, returns, []);
  }

  return (
    <div className="space-y-5">
      {/* Customer Info */}
      <div>
        <h4 className="font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40 mb-2">
          Customer Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-0.5">Name</span>
            <span className="text-sm font-body text-nino-950">{order.customer.name}</span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-0.5">Phone</span>
            <span className="text-sm font-body text-nino-950">{order.customer.phone}</span>
          </div>
          <div className="rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-0.5">Address</span>
            <span className="text-sm font-body text-nino-950">{order.customer.address}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <h4 className="font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40 mb-2">
          Order Items
        </h4>
        <div className="rounded-lg border border-nino-200/15 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-nino-200/15 bg-nino-50/30">
                <th className="px-4 py-2 text-left text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Name</th>
                <th className="px-4 py-2 text-left text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Color</th>
                <th className="px-4 py-2 text-left text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Size</th>
                <th className="px-4 py-2 text-right text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Qty</th>
                <th className="px-4 py-2 text-right text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Unit Price</th>
                <th className="px-4 py-2 text-right text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-nino-200/10 last:border-b-0">
                  <td className="px-4 py-2.5 text-sm font-body text-nino-950">{item.name}</td>
                  <td className="px-4 py-2.5 text-sm font-body text-nino-800">
                    <span className="flex items-center gap-1.5">
                      {item.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-nino-200/30 shrink-0 inline-block"
                          style={{ backgroundColor: item.colorHex }}
                        />
                      )}
                      {item.color}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-body text-nino-800">{item.size}</td>
                  <td className="px-4 py-2.5 text-sm font-body text-nino-800 text-right">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-sm font-body text-nino-800 text-right">{item.unit_price.toLocaleString()} EGP</td>
                  <td className="px-4 py-2.5 text-sm font-body font-medium text-nino-950 text-right">
                    {(item.unit_price * item.quantity).toLocaleString()} EGP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery + Totals */}
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="rounded-lg border border-nino-200/15 bg-white p-3 min-w-[200px]">
          <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-0.5">Delivery Zone</span>
          <span className="text-sm font-body text-nino-950">{order.delivery_zone}</span>
          <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mt-2 mb-0.5">Delivery Fee</span>
          <span className="text-sm font-body text-nino-950">{order.delivery_fee.toLocaleString()} EGP</span>
          {order.shipping_company && (
            <>
              <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mt-2 mb-0.5">Shipping Company</span>
              <span className="text-sm font-body text-nino-950">{order.shipping_company}</span>
            </>
          )}
        </div>
        {order.notes && (
          <div className="col-span-full rounded-lg border border-nino-200/15 bg-white p-3">
            <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-0.5">Customer Notes</span>
            <p className="text-sm font-body text-nino-950 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
        <div className="rounded-lg border border-nino-200/15 bg-white p-3 min-w-[200px] text-right">
          <span className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-0.5">Total Price</span>
          <span className="text-lg font-display font-bold text-nino-950">{order.total_price.toLocaleString()} EGP</span>
        </div>
      </div>

      {/* Return / Exchange History */}
      {order.returns && order.returns.length > 0 && (
        <div>
          <h4 className="font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40 mb-2">
            Return / Exchange History
          </h4>
          <div className="rounded-lg border border-nino-200/15 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nino-200/15 bg-nino-50/30">
                  <th className="px-4 py-2 text-left text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Date</th>
                  <th className="px-4 py-2 text-left text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Type</th>
                  <th className="px-4 py-2 text-left text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Item</th>
                  <th className="px-4 py-2 text-right text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Qty</th>
                  <th className="px-4 py-2 text-left text-[11px] font-display font-medium uppercase tracking-[0.1em] text-nino-800/35">Details</th>
                </tr>
              </thead>
              <tbody>
                {order.returns.map((r, idx) => {
                  const originalItem = order.items[r.item_index];
                  return (
                    <tr key={idx} className="border-b border-nino-200/10 last:border-b-0">
                      <td className="px-4 py-2.5 text-xs font-body text-nino-800/50">
                        {formatTimestamp(r.date)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-display font-semibold capitalize ${
                            r.type === "return"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-body text-nino-800">
                        {originalItem
                          ? `${originalItem.name} (${originalItem.color} / ${originalItem.size})`
                          : `Item #${r.item_index}`}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-body text-nino-800 text-right">
                        {r.quantity}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-body text-nino-800/60">
                        {r.type === "exchange" && r.exchange_product_name && (
                          <span>
                            Exchanged for: {r.exchange_product_name} ({r.exchange_color} / {r.exchange_size})
                          </span>
                        )}
                        {r.reason && (
                          <span className={r.type === "exchange" && r.exchange_product_name ? "block mt-0.5" : ""}>
                            Reason: {r.reason}
                          </span>
                        )}
                        {r.type === "return" && !r.reason && "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Fees */}
      {order.return_fees && order.return_fees.length > 0 && (
        <div>
          <h4 className="font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40 mb-2">
            Return / Exchange Fees
          </h4>
          <div className="space-y-2">
            {order.return_fees.map((fee, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-nino-200/15 bg-white px-4 py-2.5"
              >
                <span className="text-sm font-body text-nino-800">{fee.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-display font-semibold text-nino-950">
                    {fee.amount.toLocaleString()} EGP
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-display font-semibold ${
                      fee.paid_by === "customer"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    Paid by {fee.paid_by}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status + Change */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-nino-800/35 font-display uppercase tracking-wider">Current Status</span>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-display font-semibold capitalize ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800"}`}>
            {order.status.replace("_", " ")}
          </span>
        </div>

        {validTransitions.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as OrderStatus);
                setError(null);
              }}
              className="rounded-lg border border-nino-200/20 bg-white px-3 py-1.5 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
            >
              <option value="">Change status...</option>
              {validTransitions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleStatusChange}
              disabled={!selectedStatus || updating || loading}
              className="rounded-lg bg-nino-950 px-4 py-1.5 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {updating ? "Updating..." : "Apply"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-body text-red-700">
          {error}
        </div>
      )}

      {/* Settlement Summary — shown when moving to delivered after return/exchange */}
      {showSettlement && (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50/50 p-4 space-y-3">
          <h4 className="font-display text-sm font-semibold text-orange-800">
            Settlement Summary — Finalize Delivery
          </h4>

          {settlementLoading ? (
            <div className="py-6 text-center text-sm text-orange-700/50">Calculating settlement...</div>
          ) : settlementInfo ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-nino-800/50">Original Total:</span>
                <span className="font-display font-semibold text-nino-950 text-right">{order.total_price.toLocaleString()} EGP</span>

                {settlementInfo.returnedValue > 0 && (
                  <>
                    <span className="text-nino-800/50">Returned Items:</span>
                    <span className="font-display font-semibold text-red-600 text-right">-{settlementInfo.returnedValue.toLocaleString()} EGP</span>
                  </>
                )}

                {settlementInfo.exchangeValue !== 0 && (
                  <>
                    <span className="text-nino-800/50">Exchange Price Diff:</span>
                    <span className={`font-display font-semibold text-right ${settlementInfo.exchangeValue > 0 ? "text-blue-600" : "text-green-600"}`}>
                      {settlementInfo.exchangeValue > 0 ? "+" : ""}{settlementInfo.exchangeValue.toLocaleString()} EGP
                    </span>
                  </>
                )}

                <span className="text-nino-800/50">Delivery Fee:</span>
                <span className="font-display font-semibold text-nino-950 text-right">{order.delivery_fee} EGP</span>

                {/* Fee rules from shipping company */}
                {settlementInfo.fees.map((fee, i) => (
                  <React.Fragment key={i}>
                    <span className="text-nino-800/50">{fee.label}:</span>
                    <span className="font-display font-semibold text-right">
                      {fee.amount} EGP
                      <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${fee.paid_by === "customer" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {fee.paid_by} pays
                      </span>
                    </span>
                  </React.Fragment>
                ))}

                <div className="col-span-2 border-t border-orange-200 pt-2 mt-1 flex justify-between">
                  <span className="font-display font-bold text-nino-950">Customer Pays:</span>
                  <span className="font-display text-lg font-bold text-nino-950">
                    {settlementInfo.newTotal.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              <p className="text-xs text-orange-700/60">
                Confirming will update the order total and mark as delivered.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setUpdating(true);
                    try {
                      await finalizeDelivery(order.id!, settlementInfo.newTotal, settlementInfo.fees);
                      setShowSettlement(false);
                      setSelectedStatus("");
                      // Refresh parent without re-running status transition
                      window.location.reload();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Failed to finalize");
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-xs font-display font-semibold tracking-wider hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? "UPDATING..." : "CONFIRM & DELIVER"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSettlement(false); setSettlementInfo(null); }}
                  className="px-4 py-2.5 rounded-lg border border-nino-200/40 text-xs font-display font-semibold text-nino-700/50 hover:bg-nino-50 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </>
          ) : (
            <div className="py-4 text-center text-sm text-red-500">Failed to calculate settlement</div>
          )}
        </div>
      )}

      {/* Modals */}
      <ShippingCompanyModal
        open={showShippingModal}
        onConfirm={(company) => applyStatusChange("shipped", company)}
        onCancel={() => setShowShippingModal(false)}
      />
      <ReturnModal
        open={showReturnModal}
        order={order}
        onConfirm={handleReturnConfirm}
        onCancel={() => setShowReturnModal(false)}
      />
      <ExchangeModal
        open={showExchangeModal}
        order={order}
        onConfirm={handleExchangeConfirm}
        onCancel={() => setShowExchangeModal(false)}
      />
    </div>
  );
}
