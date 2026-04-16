"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Order, OrderStatus, OrderReturnRecord } from "@/lib/types";
import { Timestamp } from "@/lib/firebase";

interface ReturnModalProps {
  open: boolean;
  order: Order;
  onConfirm: (
    returns: OrderReturnRecord[],
    newStatus: OrderStatus
  ) => Promise<void>;
  onCancel: () => void;
}

interface ReturnSelection {
  selected: boolean;
  quantity: number;
  reason: string;
}

export default function ReturnModal({
  open,
  order,
  onConfirm,
  onCancel,
}: ReturnModalProps) {
  const [selections, setSelections] = useState<ReturnSelection[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const prevOpenRef = useRef(false);

  // Compute already-returned quantity per item index
  const alreadyReturned = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of order.returns ?? []) {
      map.set(r.item_index, (map.get(r.item_index) ?? 0) + r.quantity);
    }
    return map;
  }, [order.returns]);

  // Max returnable per item
  const maxReturnable = useMemo(
    () =>
      order.items.map(
        (item, i) => item.quantity - (alreadyReturned.get(i) ?? 0)
      ),
    [order.items, alreadyReturned]
  );

  // Reset selections when modal opens
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSelections(
        order.items.map(() => ({ selected: false, quantity: 1, reason: "" }))
      );
      setSubmitting(false);
    }
    prevOpenRef.current = open;
  }, [open, order.items]);

  function toggle(idx: number) {
    setSelections((prev) => {
      const next = [...prev];
      if (!next[idx]) {
        next[idx] = { selected: false, quantity: 1, reason: "" };
      }
      next[idx] = { ...next[idx], selected: !next[idx].selected };
      return next;
    });
  }

  function setQty(idx: number, qty: number) {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        quantity: Math.min(Math.max(1, qty), maxReturnable[idx]),
      };
      return next;
    });
  }

  function setReason(idx: number, reason: string) {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], reason };
      return next;
    });
  }

  const hasSelection = selections.some(
    (s, i) => s.selected && maxReturnable[i] > 0
  );

  // Determine suggested status
  const suggestedStatus: OrderStatus = useMemo(() => {
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    let totalReturned = 0;
    for (const [, qty] of alreadyReturned) {
      totalReturned += qty;
    }
    // Add currently selected
    for (let i = 0; i < selections.length; i++) {
      if (selections[i]?.selected) {
        totalReturned += selections[i].quantity;
      }
    }
    return totalReturned >= totalItems ? "returned" : "partially_returned";
  }, [order.items, alreadyReturned, selections]);

  async function handleConfirm() {
    const records: OrderReturnRecord[] = [];
    for (let i = 0; i < selections.length; i++) {
      const sel = selections[i];
      if (!sel?.selected || maxReturnable[i] <= 0) continue;
      records.push({
        item_index: i,
        type: "return",
        quantity: sel.quantity,
        reason: sel.reason || undefined,
        date: Timestamp.now(),
      });
    }
    if (records.length === 0) return;

    setSubmitting(true);
    try {
      await onConfirm(records, suggestedStatus);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl border border-nino-200/30 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <h3 className="font-display text-lg font-bold text-nino-950 mb-1">
                Return Items
              </h3>
              <p className="text-sm font-body text-nino-800/40">
                Select items to return. Stock will be restored automatically.
              </p>
            </div>

            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
              {order.items.map((item, i) => {
                const max = maxReturnable[i];
                const sel = selections[i] ?? {
                  selected: false,
                  quantity: 1,
                  reason: "",
                };
                const disabled = max <= 0;

                return (
                  <div
                    key={i}
                    className={`rounded-xl border-2 p-4 transition-colors ${
                      sel.selected && !disabled
                        ? "border-nino-500 bg-nino-50/50"
                        : disabled
                        ? "border-nino-200/15 bg-nino-50/20 opacity-50"
                        : "border-nino-200/30 hover:border-nino-200/60"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sel.selected && !disabled}
                        disabled={disabled}
                        onChange={() => toggle(i)}
                        className="mt-1 rounded border-nino-300 text-nino-600 focus:ring-nino-500/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-medium text-nino-950 truncate">
                            {item.name}
                          </span>
                          {item.colorHex && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-nino-200/30 shrink-0"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          )}
                        </div>
                        <span className="text-xs font-body text-nino-800/50">
                          {item.color} / Size {item.size} — Qty {item.quantity}
                          {(alreadyReturned.get(i) ?? 0) > 0 && (
                            <span className="text-orange-600 ml-1">
                              ({alreadyReturned.get(i)} already returned)
                            </span>
                          )}
                          {disabled && (
                            <span className="text-red-500 ml-1">
                              (fully returned)
                            </span>
                          )}
                        </span>
                      </div>
                    </label>

                    {sel.selected && !disabled && (
                      <div className="mt-3 ml-7 space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-display text-nino-800/50 uppercase tracking-wider">
                            Qty
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={max}
                            value={sel.quantity}
                            onChange={(e) =>
                              setQty(i, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-16 rounded-lg border border-nino-200/20 bg-white px-2 py-1 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                          />
                          <span className="text-xs text-nino-800/40">
                            / {max}
                          </span>
                        </div>
                        <textarea
                          value={sel.reason}
                          onChange={(e) => setReason(i, e.target.value)}
                          placeholder="Reason (optional)"
                          rows={2}
                          className="w-full rounded-lg border border-nino-200/20 bg-white px-3 py-2 text-sm font-body text-nino-800 placeholder:text-nino-400 focus:outline-none focus:ring-2 focus:ring-nino-500/30 resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status hint */}
            {hasSelection && (
              <div className="px-6 pb-2">
                <p className="text-xs font-body text-nino-800/50">
                  Status will be set to{" "}
                  <span className="font-semibold capitalize text-nino-700">
                    {suggestedStatus.replace("_", " ")}
                  </span>
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-nino-200/20 bg-nino-50/30">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-nino-200/20 px-4 py-2 text-xs font-display font-semibold text-nino-800/60 hover:bg-nino-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!hasSelection || submitting}
                className="rounded-lg bg-nino-950 px-5 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Processing..." : "Return Selected"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
