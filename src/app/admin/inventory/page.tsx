"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Product, ProductVariant } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";
import { getProducts, updateProduct } from "@/services/products";

const PAGE_SIZE = 12;

// ─── Helpers for both old and new schema ────────────────────────

function getTotalStock(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce(
      (sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0),
      0
    );
  }
  // Old schema fallback
  const legacy = product as Product & { stock?: Record<string, number> };
  if (legacy.stock) {
    return Object.values(legacy.stock).reduce((sum, v) => sum + v, 0);
  }
  return 0;
}

function stockStatusInfo(total: number): {
  label: string;
  dotClass: string;
  textClass: string;
} {
  if (total === 0) return { label: "Out of Stock", dotClass: "bg-red-500", textClass: "text-red-700" };
  if (total <= 5) return { label: "Low Stock", dotClass: "bg-yellow-500", textClass: "text-yellow-700" };
  return { label: "In Stock", dotClass: "bg-green-500", textClass: "text-green-700" };
}

function stockDot(count: number): string {
  if (count === 0) return "bg-red-500";
  if (count <= 5) return "bg-yellow-500";
  return "bg-green-500";
}

// ─── Per-variant stock editor ───────────────────────────────────

function VariantStockEditor({
  variants,
  onChange,
  onSave,
  saving,
}: {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const grandTotal = variants.reduce(
    (sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0),
    0
  );

  function handleStockChange(variantIdx: number, sizeValue: string, stock: number) {
    const updated = variants.map((v, vi) => {
      if (vi !== variantIdx) return v;
      return {
        ...v,
        sizes: v.sizes.map((s) =>
          s.value === sizeValue ? { ...s, stock: Math.max(0, stock) } : s
        ),
      };
    });
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {variants.map((variant, vIdx) => {
        const variantTotal = variant.sizes.reduce((sum, s) => sum + s.stock, 0);
        return (
          <div key={vIdx} className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-nino-200/30 shrink-0"
                style={{ backgroundColor: variant.colorHex }}
              />
              <h5 className="font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/60">
                {variant.colorName || "Unnamed"} ({variantTotal})
              </h5>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {variant.sizes.map((size) => (
                <div
                  key={size.value}
                  className="flex items-center gap-3 rounded-lg border border-nino-200/15 bg-white px-3 py-2.5"
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${stockDot(size.stock)}`} />
                  <span className="font-display font-semibold text-sm text-nino-950 min-w-[28px]">
                    {size.value}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={size.stock}
                    onChange={(e) =>
                      handleStockChange(vIdx, size.value, parseInt(e.target.value) || 0)
                    }
                    className="w-16 rounded-md border border-nino-200/20 bg-nino-50/30 px-2 py-1 text-sm font-body text-nino-800 text-center focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-body text-nino-800/60">
          Total Stock:{" "}
          <span className="font-display font-semibold text-nino-950">{grandTotal}</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-nino-950 px-5 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Legacy stock editor (old schema) ───────────────────────────

function LegacyStockEditor({
  sizes,
  stock,
  onChange,
  onSave,
  saving,
}: {
  sizes: string[];
  stock: Record<string, number>;
  onChange: (stock: Record<string, number>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const totalStock = sizes.reduce((sum, size) => sum + (stock[size] ?? 0), 0);

  return (
    <div className="space-y-3">
      <h4 className="font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
        Stock by Size
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sizes.map((size) => {
          const count = stock[size] ?? 0;
          return (
            <div
              key={size}
              className="flex items-center gap-3 rounded-lg border border-nino-200/15 bg-white px-3 py-2.5"
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${stockDot(count)}`} />
              <span className="font-display font-semibold text-sm text-nino-950 min-w-[28px]">
                {size}
              </span>
              <input
                type="number"
                min={0}
                value={count}
                onChange={(e) =>
                  onChange({ ...stock, [size]: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-16 rounded-md border border-nino-200/20 bg-nino-50/30 px-2 py-1 text-sm font-body text-nino-800 text-center focus:outline-none focus:ring-2 focus:ring-nino-500/30"
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-body text-nino-800/60">
          Total Stock:{" "}
          <span className="font-display font-semibold text-nino-950">{totalStock}</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-nino-950 px-5 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Page component ─────────────────────────────────────────────

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([null]);

  // Edited state for new schema
  const [editedVariants, setEditedVariants] = useState<ProductVariant[] | null>(null);
  // Edited state for old schema
  const [editedStock, setEditedStock] = useState<Record<string, number> | null>(null);

  const fetchProducts = useCallback(async (cursor: DocumentSnapshot | null = null) => {
    setLoading(true);
    setExpandedIndex(null);
    setEditedVariants(null);
    setEditedStock(null);
    try {
      const result = await getProducts({ pageSize: PAGE_SIZE, lastDoc: cursor });
      setProducts(result.items);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(null);
  }, [fetchProducts]);

  function handleNextPage() {
    if (!hasMore || !lastDoc) return;
    setPageHistory((prev) => [...prev, lastDoc]);
    setPage((p) => p + 1);
    fetchProducts(lastDoc);
  }

  function handlePrevPage() {
    if (page <= 1) return;
    const newHistory = [...pageHistory];
    newHistory.pop();
    setPageHistory(newHistory);
    setPage((p) => p - 1);
    fetchProducts(newHistory[newHistory.length - 1]);
  }

  function isNewSchema(product: Product): boolean {
    return !!(product.variants && product.variants.length > 0);
  }

  function handleRowClick(index: number) {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      setEditedVariants(null);
      setEditedStock(null);
    } else {
      setExpandedIndex(index);
      const product = products[index];
      if (isNewSchema(product)) {
        setEditedVariants(
          product.variants.map((v) => ({
            ...v,
            sizes: v.sizes.map((s) => ({ ...s })),
          }))
        );
        setEditedStock(null);
      } else {
        const legacy = product as Product & { stock?: Record<string, number> };
        setEditedStock(legacy.stock ? { ...legacy.stock } : {});
        setEditedVariants(null);
      }
    }
  }

  async function handleSaveStock() {
    if (expandedIndex === null) return;
    const product = products[expandedIndex];
    if (!product.id) return;
    setSaving(true);
    try {
      if (editedVariants) {
        await updateProduct(product.id, { variants: editedVariants });
      } else if (editedStock) {
        // Old schema: update stock directly
        await updateProduct(product.id, { stock: editedStock } as Partial<Product>);
      }
      const cursor = pageHistory[pageHistory.length - 1];
      await fetchProducts(cursor);
    } catch (err) {
      console.error("Failed to save stock:", err);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category", width: "120px" },
    { key: "colors", label: "Colors", width: "120px" },
    { key: "totalStock", label: "Total Stock", width: "120px" },
    { key: "status", label: "Status", width: "140px" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-nino-950">Inventory</h1>
        <p className="font-body text-sm text-nino-800/40 mt-1">Manage product stock levels</p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="w-full overflow-x-auto rounded-xl border border-nino-200/15 bg-white">
          <div className="animate-pulse">
            <div className="h-12 bg-nino-50/50 border-b border-nino-200/10" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 border-b border-nino-200/10 flex items-center px-5 gap-4">
                {columns.map((col) => (
                  <div key={col.key} className="h-4 bg-nino-100/50 rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
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
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-16 text-center font-body text-sm text-nino-400"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, rowIdx) => {
                    const total = getTotalStock(product);
                    const status = stockStatusInfo(total);
                    const colorHexes = product.variants?.map((v) => v.colorHex) ?? [];

                    return (
                      <React.Fragment key={`product-${product.id ?? rowIdx}`}>
                        <tr
                          onClick={() => handleRowClick(rowIdx)}
                          className={`border-b border-nino-200/15 cursor-pointer transition-colors duration-100 ${
                            expandedIndex === rowIdx
                              ? "bg-nino-100/30"
                              : rowIdx % 2 === 0
                              ? "bg-white"
                              : "bg-nino-50/30"
                          } hover:bg-nino-100/30`}
                        >
                          <td className="px-4 py-3.5 font-body text-sm text-nino-950 font-medium">
                            {product.name}
                          </td>
                          <td className="px-4 py-3.5 font-body text-sm text-nino-800/60">
                            {product.category}
                          </td>
                          <td className="px-4 py-3.5">
                            {colorHexes.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {colorHexes.map((hex, i) => (
                                  <span
                                    key={i}
                                    className="w-3.5 h-3.5 rounded-full border border-nino-200/30"
                                    style={{ backgroundColor: hex }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-display text-sm font-semibold text-nino-950">
                            {total}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                              <span className={`text-xs font-display font-medium ${status.textClass}`}>
                                {status.label}
                              </span>
                            </span>
                          </td>
                        </tr>

                        {/* Expanded stock editor */}
                        {expandedIndex === rowIdx && (
                          <tr>
                            <td
                              colSpan={columns.length}
                              className="bg-nino-50/30 px-6 py-5 border-b border-nino-200/15"
                            >
                              {editedVariants ? (
                                <VariantStockEditor
                                  variants={editedVariants}
                                  onChange={setEditedVariants}
                                  onSave={handleSaveStock}
                                  saving={saving}
                                />
                              ) : editedStock ? (
                                <LegacyStockEditor
                                  sizes={Object.keys(editedStock)}
                                  stock={editedStock}
                                  onChange={setEditedStock}
                                  onSave={handleSaveStock}
                                  saving={saving}
                                />
                              ) : null}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
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
