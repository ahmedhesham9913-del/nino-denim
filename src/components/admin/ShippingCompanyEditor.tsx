"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EGYPT_GOVERNORATES } from "@/lib/constants";
import type { ShippingCompany, ShippingStatusRule } from "@/lib/types";
import {
  getShippingCompanies,
  addShippingCompany,
  updateShippingCompany,
  deleteShippingCompany,
} from "@/services/shipping-companies";

interface CompanyCardState {
  data: ShippingCompany;
  expanded: boolean;
  saving: boolean;
  deleting: boolean;
  confirmDelete: boolean;
  dirty: boolean;
}

export default function ShippingCompanyEditor() {
  const [companies, setCompanies] = useState<CompanyCardState[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShippingCompanies();
      setCompanies(
        data.map((c) => ({
          data: c,
          expanded: false,
          saving: false,
          deleting: false,
          confirmDelete: false,
          dirty: false,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch shipping companies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  function updateCompany(index: number, patch: Partial<CompanyCardState>) {
    setCompanies((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function updateCompanyData(
    index: number,
    dataPatch: Partial<ShippingCompany>
  ) {
    setCompanies((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        data: { ...next[index].data, ...dataPatch },
        dirty: true,
      };
      return next;
    });
  }

  function updateGovernorateCost(
    index: number,
    gov: string,
    field: "shipping" | "return_cost",
    value: number
  ) {
    setCompanies((prev) => {
      const next = [...prev];
      const costs = { ...next[index].data.governorate_costs };
      costs[gov] = {
        ...costs[gov],
        shipping: costs[gov]?.shipping ?? 0,
        return_cost: costs[gov]?.return_cost ?? 0,
        [field]: value,
      };
      next[index] = {
        ...next[index],
        data: { ...next[index].data, governorate_costs: costs },
        dirty: true,
      };
      return next;
    });
  }

  function setAllShipping(index: number, value: number) {
    setCompanies((prev) => {
      const next = [...prev];
      const costs: Record<string, { shipping: number; return_cost: number }> =
        {};
      for (const gov of EGYPT_GOVERNORATES) {
        costs[gov] = {
          shipping: value,
          return_cost:
            next[index].data.governorate_costs[gov]?.return_cost ?? 0,
        };
      }
      next[index] = {
        ...next[index],
        data: { ...next[index].data, governorate_costs: costs },
        dirty: true,
      };
      return next;
    });
  }

  function setAllReturn(index: number, value: number) {
    setCompanies((prev) => {
      const next = [...prev];
      const costs: Record<string, { shipping: number; return_cost: number }> =
        {};
      for (const gov of EGYPT_GOVERNORATES) {
        costs[gov] = {
          shipping:
            next[index].data.governorate_costs[gov]?.shipping ?? 0,
          return_cost: value,
        };
      }
      next[index] = {
        ...next[index],
        data: { ...next[index].data, governorate_costs: costs },
        dirty: true,
      };
      return next;
    });
  }

  const STATUS_RULE_KEYS: { key: string; label: string }[] = [
    { key: "returned", label: "Returned" },
    { key: "partially_returned", label: "Partially Returned" },
    { key: "exchanged", label: "Exchanged" },
  ];

  const DEFAULT_STATUS_RULES: Record<string, ShippingStatusRule> = {
    returned: { formula: "percentage", percentage: 100, paid_by: "customer" },
    partially_returned: { formula: "percentage", percentage: 100, paid_by: "customer" },
    exchanged: { formula: "percentage", percentage: 100, paid_by: "customer" },
  };

  function updateStatusRule(
    index: number,
    statusKey: string,
    patch: Partial<ShippingStatusRule>
  ) {
    setCompanies((prev) => {
      const next = [...prev];
      const current = next[index].data.status_rules ?? { ...DEFAULT_STATUS_RULES };
      const currentRule = current[statusKey] ?? DEFAULT_STATUS_RULES[statusKey];
      current[statusKey] = { ...currentRule, ...patch };
      next[index] = {
        ...next[index],
        data: { ...next[index].data, status_rules: { ...current } },
        dirty: true,
      };
      return next;
    });
  }

  async function handleSave(index: number) {
    const card = companies[index];
    if (!card.data.id) return;
    updateCompany(index, { saving: true });
    try {
      const { id, ...rest } = card.data;
      await updateShippingCompany(id!, rest);
      updateCompany(index, { saving: false, dirty: false });
    } catch {
      updateCompany(index, { saving: false });
    }
  }

  async function handleDelete(index: number) {
    const card = companies[index];
    if (!card.confirmDelete) {
      updateCompany(index, { confirmDelete: true });
      return;
    }
    if (!card.data.id) return;
    updateCompany(index, { deleting: true });
    try {
      await deleteShippingCompany(card.data.id);
      setCompanies((prev) => prev.filter((_, i) => i !== index));
    } catch {
      updateCompany(index, { deleting: false, confirmDelete: false });
    }
  }

  async function handleAdd() {
    setAdding(true);
    const defaultCosts: Record<
      string,
      { shipping: number; return_cost: number }
    > = {};
    for (const gov of EGYPT_GOVERNORATES) {
      defaultCosts[gov] = { shipping: 0, return_cost: 0 };
    }
    try {
      const id = await addShippingCompany({
        name: "New Company",
        governorate_costs: defaultCosts,
        status_rules: { ...DEFAULT_STATUS_RULES },
        cod_fee: 0,
        insurance_fee: 0,
        weight_limit_kg: 0,
        notes: "",
        enabled: true,
      });
      await fetchCompanies();
      // Expand the newly added company
      setCompanies((prev) => {
        const idx = prev.findIndex((c) => c.data.id === id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], expanded: true };
          return next;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to add shipping company:", err);
    } finally {
      setAdding(false);
    }
  }

  // Bulk input states
  const [bulkShipping, setBulkShipping] = useState<Record<number, string>>({});
  const [bulkReturn, setBulkReturn] = useState<Record<number, string>>({});

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-nino-200/20 bg-white p-4"
          >
            <div className="h-10 bg-nino-100/50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companies.map((card, index) => (
        <div
          key={card.data.id ?? index}
          className="rounded-xl border border-nino-200/20 bg-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() =>
                updateCompany(index, { expanded: !card.expanded })
              }
              className="text-nino-400 hover:text-nino-700 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${
                  card.expanded ? "rotate-90" : ""
                }`}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <span className="flex-1 font-display font-semibold text-sm text-nino-950 truncate">
              {card.data.name || "Untitled"}
            </span>

            {/* Enabled toggle */}
            <button
              type="button"
              onClick={() =>
                updateCompanyData(index, { enabled: !card.data.enabled })
              }
              className={`relative w-10 h-5 rounded-full transition-colors ${
                card.data.enabled ? "bg-green-500" : "bg-nino-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  card.data.enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-[10px] font-display text-nino-400 uppercase tracking-wider w-14">
              {card.data.enabled ? "Active" : "Off"}
            </span>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(index)}
              disabled={card.deleting}
              className={`rounded-lg px-3 py-1.5 text-xs font-display font-semibold transition-colors disabled:opacity-40 ${
                card.confirmDelete
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-red-500 hover:bg-red-50"
              }`}
            >
              {card.deleting
                ? "..."
                : card.confirmDelete
                ? "Confirm"
                : "Delete"}
            </button>
            {card.confirmDelete && !card.deleting && (
              <button
                type="button"
                onClick={() =>
                  updateCompany(index, { confirmDelete: false })
                }
                className="text-xs font-display text-nino-400 hover:text-nino-700"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {card.expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-nino-200/20 px-4 py-4 space-y-5">
                  {/* Name + Enabled row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={card.data.name}
                        onChange={(e) =>
                          updateCompanyData(index, { name: e.target.value })
                        }
                        className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                          COD Fee
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={card.data.cod_fee ?? 0}
                          onChange={(e) =>
                            updateCompanyData(index, {
                              cod_fee: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                          Insurance
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={card.data.insurance_fee ?? 0}
                          onChange={(e) =>
                            updateCompanyData(index, {
                              insurance_fee: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={card.data.weight_limit_kg ?? 0}
                          onChange={(e) =>
                            updateCompanyData(index, {
                              weight_limit_kg: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Per-governorate costs table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] text-nino-800/35 font-display uppercase tracking-wider">
                        Per-Governorate Costs (EGP)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="Shipping"
                          value={bulkShipping[index] ?? ""}
                          onChange={(e) =>
                            setBulkShipping((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          className="w-20 rounded-lg border border-nino-200/20 bg-nino-50/30 px-2 py-1 text-xs font-body text-nino-800 placeholder:text-nino-300 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(bulkShipping[index] ?? "0");
                            setAllShipping(index, val);
                          }}
                          className="rounded-lg bg-nino-100 px-2.5 py-1 text-[10px] font-display font-semibold text-nino-700 hover:bg-nino-200 transition-colors"
                        >
                          Set All Shipping
                        </button>
                        <input
                          type="number"
                          min={0}
                          placeholder="Return"
                          value={bulkReturn[index] ?? ""}
                          onChange={(e) =>
                            setBulkReturn((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          className="w-20 rounded-lg border border-nino-200/20 bg-nino-50/30 px-2 py-1 text-xs font-body text-nino-800 placeholder:text-nino-300 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(bulkReturn[index] ?? "0");
                            setAllReturn(index, val);
                          }}
                          className="rounded-lg bg-nino-100 px-2.5 py-1 text-[10px] font-display font-semibold text-nino-700 hover:bg-nino-200 transition-colors"
                        >
                          Set All Return
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-nino-200/20 overflow-hidden">
                      <div className="max-h-80 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-nino-50">
                            <tr>
                              <th className="text-left px-3 py-2 text-[11px] font-display font-semibold text-nino-800/40 uppercase tracking-wider">
                                Governorate
                              </th>
                              <th className="text-left px-3 py-2 text-[11px] font-display font-semibold text-nino-800/40 uppercase tracking-wider">
                                Shipping (EGP)
                              </th>
                              <th className="text-left px-3 py-2 text-[11px] font-display font-semibold text-nino-800/40 uppercase tracking-wider">
                                Return (EGP)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {EGYPT_GOVERNORATES.map((gov, gi) => {
                              const costs =
                                card.data.governorate_costs[gov] ?? {
                                  shipping: 0,
                                  return_cost: 0,
                                };
                              return (
                                <tr
                                  key={gov}
                                  className={
                                    gi % 2 === 0
                                      ? "bg-white"
                                      : "bg-nino-50/30"
                                  }
                                >
                                  <td className="px-3 py-1.5 font-body text-nino-800 text-xs">
                                    {gov}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      value={costs.shipping}
                                      onChange={(e) =>
                                        updateGovernorateCost(
                                          index,
                                          gov,
                                          "shipping",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-full rounded border border-nino-200/20 bg-transparent px-2 py-1 text-xs font-body text-nino-800 focus:outline-none focus:ring-1 focus:ring-nino-500/30"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      value={costs.return_cost}
                                      onChange={(e) =>
                                        updateGovernorateCost(
                                          index,
                                          gov,
                                          "return_cost",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-full rounded border border-nino-200/20 bg-transparent px-2 py-1 text-xs font-body text-nino-800 focus:outline-none focus:ring-1 focus:ring-nino-500/30"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Status Fee Rules */}
                  <div>
                    <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-2">
                      Status Fee Rules
                    </label>
                    <div className="rounded-lg border border-nino-200/20 overflow-hidden divide-y divide-nino-200/20">
                      {STATUS_RULE_KEYS.map(({ key, label }) => {
                        const rules = card.data.status_rules ?? DEFAULT_STATUS_RULES;
                        const rule = rules[key] ?? DEFAULT_STATUS_RULES[key];
                        return (
                          <div
                            key={key}
                            className="flex flex-wrap items-center gap-3 px-3 py-2.5 bg-white"
                          >
                            {/* Status label */}
                            <span className="font-display font-semibold text-xs text-nino-800 w-32 shrink-0">
                              {label}
                            </span>

                            {/* Formula selector */}
                            <select
                              value={rule.formula}
                              onChange={(e) =>
                                updateStatusRule(index, key, {
                                  formula: e.target.value as ShippingStatusRule["formula"],
                                })
                              }
                              className="rounded-lg border border-nino-200/20 bg-nino-50/30 px-2 py-1.5 text-xs font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                            >
                              <option value="percentage">Percentage of shipping fee</option>
                              <option value="fixed">Fixed amount</option>
                              <option value="percentage_plus_fixed">Percentage + Fixed</option>
                            </select>

                            {/* Conditional inputs based on formula */}
                            <div className="flex items-center gap-1.5">
                              {(rule.formula === "percentage" ||
                                rule.formula === "percentage_plus_fixed") && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={rule.percentage ?? 0}
                                    onChange={(e) =>
                                      updateStatusRule(index, key, {
                                        percentage: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-16 rounded-lg border border-nino-200/20 bg-nino-50/30 px-2 py-1.5 text-xs font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                                  />
                                  <span className="text-xs font-display text-nino-400">%</span>
                                </div>
                              )}

                              {rule.formula === "percentage_plus_fixed" && (
                                <span className="text-xs font-display text-nino-400">+</span>
                              )}

                              {(rule.formula === "fixed" ||
                                rule.formula === "percentage_plus_fixed") && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={rule.fixed_amount ?? 0}
                                    onChange={(e) =>
                                      updateStatusRule(index, key, {
                                        fixed_amount: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-16 rounded-lg border border-nino-200/20 bg-nino-50/30 px-2 py-1.5 text-xs font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                                  />
                                  <span className="text-xs font-display text-nino-400">EGP</span>
                                </div>
                              )}
                            </div>

                            {/* Paid by toggle */}
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-[10px] font-display text-nino-400 uppercase tracking-wider">
                                Paid by
                              </span>
                              <div className="flex rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatusRule(index, key, { paid_by: "customer" })
                                  }
                                  className={`px-3 py-1.5 text-[11px] font-display font-semibold transition-colors ${
                                    rule.paid_by === "customer"
                                      ? "bg-nino-950 text-white"
                                      : "border border-nino-200/40 text-nino-600 hover:bg-nino-50"
                                  }`}
                                >
                                  Customer
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatusRule(index, key, { paid_by: "store" })
                                  }
                                  className={`px-3 py-1.5 text-[11px] font-display font-semibold transition-colors ${
                                    rule.paid_by === "store"
                                      ? "bg-nino-950 text-white"
                                      : "border border-nino-200/40 text-nino-600 hover:bg-nino-50"
                                  }`}
                                >
                                  Store
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] text-nino-800/35 font-display uppercase tracking-wider mb-1">
                      Notes
                    </label>
                    <textarea
                      value={card.data.notes ?? ""}
                      onChange={(e) =>
                        updateCompanyData(index, { notes: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 focus:outline-none focus:ring-2 focus:ring-nino-500/30 resize-none"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSave(index)}
                      disabled={card.saving || !card.dirty}
                      className="rounded-lg bg-nino-950 px-6 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {card.saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={adding}
        className="w-full rounded-xl border border-nino-200/20 border-dashed bg-white py-3 text-sm font-display font-medium text-nino-600 transition-colors hover:bg-nino-50/50 hover:text-nino-800 disabled:opacity-40"
      >
        {adding ? "Adding..." : "+ Add Shipping Company"}
      </button>
    </div>
  );
}
