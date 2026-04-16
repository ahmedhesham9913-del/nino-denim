"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Order,
  OrderStatus,
  OrderReturnRecord,
  Product,
  ProductVariant,
} from "@/lib/types";
import { Timestamp } from "@/lib/firebase";
import { getProducts, getProductById } from "@/services/products";

interface ExchangeModalProps {
  open: boolean;
  order: Order;
  onConfirm: (
    returns: OrderReturnRecord[],
    newStatus: OrderStatus
  ) => Promise<void>;
  onCancel: () => void;
}

interface ExchangeSelection {
  selected: boolean;
  quantity: number;
  // Exchange target
  searchQuery: string;
  searchResults: Product[];
  searching: boolean;
  selectedProduct: Product | null;
  selectedVariant: ProductVariant | null;
  selectedSize: string;
}

function createEmptySelection(): ExchangeSelection {
  return {
    selected: false,
    quantity: 1,
    searchQuery: "",
    searchResults: [],
    searching: false,
    selectedProduct: null,
    selectedVariant: null,
    selectedSize: "",
  };
}

export default function ExchangeModal({
  open,
  order,
  onConfirm,
  onCancel,
}: ExchangeModalProps) {
  const [selections, setSelections] = useState<ExchangeSelection[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const prevOpenRef = useRef(false);
  const searchTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Compute already-returned quantity per item index
  const alreadyReturned = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of order.returns ?? []) {
      map.set(r.item_index, (map.get(r.item_index) ?? 0) + r.quantity);
    }
    return map;
  }, [order.returns]);

  const maxExchangeable = useMemo(
    () =>
      order.items.map(
        (item, i) => item.quantity - (alreadyReturned.get(i) ?? 0)
      ),
    [order.items, alreadyReturned]
  );

  // Reset selections when modal opens
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSelections(order.items.map(() => createEmptySelection()));
      setSubmitting(false);
    }
    prevOpenRef.current = open;
  }, [open, order.items]);

  // Cleanup search timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of searchTimers.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  function toggle(idx: number) {
    setSelections((prev) => {
      const next = [...prev];
      if (!next[idx]) next[idx] = createEmptySelection();
      next[idx] = { ...next[idx], selected: !next[idx].selected };
      return next;
    });
  }

  function setQty(idx: number, qty: number) {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        quantity: Math.min(Math.max(1, qty), maxExchangeable[idx]),
      };
      return next;
    });
  }

  const handleSearch = useCallback(
    (idx: number, query: string) => {
      setSelections((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          searchQuery: query,
          selectedProduct: null,
          selectedVariant: null,
          selectedSize: "",
        };
        return next;
      });

      // Debounce
      const existing = searchTimers.current.get(idx);
      if (existing) clearTimeout(existing);

      if (query.trim().length < 2) {
        setSelections((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], searchResults: [], searching: false };
          return next;
        });
        return;
      }

      setSelections((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], searching: true };
        return next;
      });

      const timer = setTimeout(async () => {
        try {
          const result = await getProducts({ pageSize: 10 });
          // Client-side filter by name since getProducts doesn't support text search
          const filtered = result.items.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase())
          );
          setSelections((prev) => {
            const next = [...prev];
            if (next[idx]) {
              next[idx] = {
                ...next[idx],
                searchResults: filtered,
                searching: false,
              };
            }
            return next;
          });
        } catch {
          setSelections((prev) => {
            const next = [...prev];
            if (next[idx]) {
              next[idx] = {
                ...next[idx],
                searchResults: [],
                searching: false,
              };
            }
            return next;
          });
        }
      }, 400);

      searchTimers.current.set(idx, timer);
    },
    []
  );

  async function selectProduct(idx: number, product: Product) {
    // Fetch full product details to get variants
    const full = product.id
      ? await getProductById(product.id)
      : product;
    if (!full) return;

    setSelections((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        searchQuery: full.name,
        searchResults: [],
        selectedProduct: full,
        selectedVariant: full.variants.length > 0 ? full.variants[0] : null,
        selectedSize:
          full.variants.length > 0 && full.variants[0].sizes.length > 0
            ? full.variants[0].sizes[0].value
            : "",
      };
      return next;
    });
  }

  function selectVariant(idx: number, variant: ProductVariant) {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        selectedVariant: variant,
        selectedSize:
          variant.sizes.length > 0 ? variant.sizes[0].value : "",
      };
      return next;
    });
  }

  function selectSize(idx: number, size: string) {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], selectedSize: size };
      return next;
    });
  }

  const hasValidSelection = selections.some(
    (s, i) =>
      s.selected &&
      maxExchangeable[i] > 0 &&
      s.selectedProduct &&
      s.selectedVariant &&
      s.selectedSize
  );

  async function handleConfirm() {
    const records: OrderReturnRecord[] = [];
    for (let i = 0; i < selections.length; i++) {
      const sel = selections[i];
      if (
        !sel?.selected ||
        maxExchangeable[i] <= 0 ||
        !sel.selectedProduct ||
        !sel.selectedVariant ||
        !sel.selectedSize
      )
        continue;

      records.push({
        item_index: i,
        type: "exchange",
        quantity: sel.quantity,
        exchange_product_id: sel.selectedProduct.id,
        exchange_product_name: sel.selectedProduct.name,
        exchange_color: sel.selectedVariant.colorName,
        exchange_size: sel.selectedSize,
        date: Timestamp.now(),
      });
    }
    if (records.length === 0) return;

    setSubmitting(true);
    try {
      await onConfirm(records, "exchanged");
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
            className="relative bg-white rounded-2xl shadow-xl border border-nino-200/30 w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <h3 className="font-display text-lg font-bold text-nino-950 mb-1">
                Exchange Items
              </h3>
              <p className="text-sm font-body text-nino-800/40">
                Select items to exchange and pick replacement products.
              </p>
            </div>

            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              {order.items.map((item, i) => {
                const max = maxExchangeable[i];
                const sel = selections[i] ?? createEmptySelection();
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
                      <div className="mt-3 ml-7 space-y-3">
                        {/* Quantity */}
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

                        {/* Product Search */}
                        <div>
                          <label className="block text-xs font-display text-nino-800/50 uppercase tracking-wider mb-1">
                            Exchange For
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={sel.searchQuery}
                              onChange={(e) =>
                                handleSearch(i, e.target.value)
                              }
                              placeholder="Search product by name..."
                              className="w-full rounded-lg border border-nino-200/20 bg-white px-3 py-2 text-sm font-body text-nino-800 placeholder:text-nino-400 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                            />
                            {sel.searching && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-nino-300 border-t-nino-600 rounded-full animate-spin" />
                              </div>
                            )}

                            {/* Search results dropdown */}
                            {sel.searchResults.length > 0 &&
                              !sel.selectedProduct && (
                                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-nino-200/30 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                  {sel.searchResults.map((product) => (
                                    <button
                                      key={product.id}
                                      type="button"
                                      onClick={() =>
                                        selectProduct(i, product)
                                      }
                                      className="w-full text-left px-3 py-2.5 hover:bg-nino-50 transition-colors border-b border-nino-200/10 last:border-b-0"
                                    >
                                      <span className="font-display text-sm font-medium text-nino-950 block truncate">
                                        {product.name}
                                      </span>
                                      <span className="text-xs font-body text-nino-800/40">
                                        {product.price.toLocaleString()} EGP —{" "}
                                        {product.variants.length} variant
                                        {product.variants.length !== 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Selected product: color + size pickers */}
                        {sel.selectedProduct && (
                          <div className="flex flex-wrap gap-3">
                            {/* Color */}
                            <div className="flex-1 min-w-[140px]">
                              <label className="block text-xs font-display text-nino-800/50 uppercase tracking-wider mb-1">
                                Color
                              </label>
                              <select
                                value={
                                  sel.selectedVariant?.colorName ?? ""
                                }
                                onChange={(e) => {
                                  const v =
                                    sel.selectedProduct!.variants.find(
                                      (v) =>
                                        v.colorName === e.target.value
                                    );
                                  if (v) selectVariant(i, v);
                                }}
                                className="w-full rounded-lg border border-nino-200/20 bg-white px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                              >
                                {sel.selectedProduct.variants.map(
                                  (v) => (
                                    <option
                                      key={v.colorName}
                                      value={v.colorName}
                                    >
                                      {v.colorName}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            {/* Size */}
                            {sel.selectedVariant && (
                              <div className="flex-1 min-w-[120px]">
                                <label className="block text-xs font-display text-nino-800/50 uppercase tracking-wider mb-1">
                                  Size
                                </label>
                                <select
                                  value={sel.selectedSize}
                                  onChange={(e) =>
                                    selectSize(i, e.target.value)
                                  }
                                  className="w-full rounded-lg border border-nino-200/20 bg-white px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                                >
                                  {sel.selectedVariant.sizes.map(
                                    (s) => (
                                      <option
                                        key={s.value}
                                        value={s.value}
                                      >
                                        {s.value}{" "}
                                        {s.stock > 0
                                          ? `(${s.stock} in stock)`
                                          : "(out of stock)"}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Selected product summary */}
                        {sel.selectedProduct &&
                          sel.selectedVariant &&
                          sel.selectedSize && (
                            <div className="rounded-lg bg-nino-50 border border-nino-200/20 px-3 py-2">
                              <p className="text-xs font-body text-nino-700">
                                Exchanging for:{" "}
                                <span className="font-semibold">
                                  {sel.selectedProduct.name}
                                </span>{" "}
                                — {sel.selectedVariant.colorName} / Size{" "}
                                {sel.selectedSize}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
                disabled={!hasValidSelection || submitting}
                className="rounded-lg bg-nino-950 px-5 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Processing..." : "Exchange Selected"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
