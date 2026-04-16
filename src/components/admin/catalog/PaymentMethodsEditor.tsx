"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTaxonomyItems,
  addTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type PaymentMethodItem,
} from "@/services/taxonomies";

const ICONS = ["💵", "💳", "🏦", "📱", "💰", "🪙", "💎", "💸"];

export default function PaymentMethodsEditor() {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState({ name: "", icon: "💵", enabled: true });
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", icon: "💵", enabled: true });

  const load = async () => {
    setLoading(true);
    const data = await getTaxonomyItems<PaymentMethodItem>("payment_methods");
    setMethods(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newItem.name.trim()) return;
    await addTaxonomyItem("payment_methods", { ...newItem, order: methods.length });
    setNewItem({ name: "", icon: "💵", enabled: true });
    setAdding(false);
    load();
  };

  const handleEdit = async (id: string) => {
    if (!editValue.name.trim()) return;
    await updateTaxonomyItem("payment_methods", id, editValue);
    setEditingId(null);
    load();
  };

  const handleToggle = async (method: PaymentMethodItem) => {
    await updateTaxonomyItem("payment_methods", method.id!, { enabled: !method.enabled });
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete payment method "${name}"?`)) return;
    await deleteTaxonomyItem("payment_methods", id);
    load();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-nino-100/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {methods.map((method) => (
          <motion.div
            key={method.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group relative rounded-2xl border-2 p-5 transition-all ${
              method.enabled
                ? "border-nino-500/40 bg-white shadow-sm shadow-nino-500/5"
                : "border-nino-200/30 bg-nino-50/30 opacity-60"
            }`}
          >
            {editingId === method.id ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditValue({ ...editValue, icon })}
                      className={`w-9 h-9 rounded-lg text-lg ${editValue.icon === icon ? "bg-nino-100 ring-2 ring-nino-500" : "hover:bg-nino-50"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editValue.name}
                  onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-nino-200/40 text-sm font-[var(--font-body)]"
                  placeholder="Method name"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(method.id!)}
                    className="flex-1 py-2 rounded-lg bg-nino-950 text-white text-xs font-[var(--font-display)] font-semibold tracking-wider"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-2 rounded-lg border border-nino-200/40 text-nino-700/50 text-xs font-[var(--font-display)] font-semibold tracking-wider"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{method.icon}</div>
                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(method)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      method.enabled ? "bg-nino-600" : "bg-nino-200"
                    }`}
                    aria-label={`Toggle ${method.name}`}
                  >
                    <motion.div
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ x: method.enabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <button
                  onClick={() => { setEditingId(method.id!); setEditValue({ name: method.name, icon: method.icon || "💵", enabled: method.enabled }); }}
                  className="block text-left w-full"
                >
                  <h4 className="font-[var(--font-display)] font-bold text-nino-950">
                    {method.name}
                  </h4>
                  <p className="text-[10px] text-nino-800/30 font-[var(--font-display)] mt-0.5 uppercase tracking-wider">
                    {method.enabled ? "Active" : "Inactive"}
                  </p>
                </button>
                <button
                  onClick={() => handleDelete(method.id!, method.name)}
                  className="absolute top-3 right-14 w-6 h-6 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  aria-label="Delete"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add new card */}
      {adding ? (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-dashed border-nino-500 bg-white p-5 space-y-3"
        >
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setNewItem({ ...newItem, icon })}
                className={`w-9 h-9 rounded-lg text-lg ${newItem.icon === icon ? "bg-nino-100 ring-2 ring-nino-500" : "hover:bg-nino-50"}`}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Payment method name"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-nino-200/40 text-sm font-[var(--font-body)]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-2 rounded-lg bg-nino-950 text-white text-xs font-[var(--font-display)] font-semibold tracking-wider"
            >
              ADD
            </button>
            <button
              onClick={() => { setAdding(false); setNewItem({ name: "", icon: "💵", enabled: true }); }}
              className="flex-1 py-2 rounded-lg border border-nino-200/40 text-nino-700/50 text-xs font-[var(--font-display)] font-semibold tracking-wider"
            >
              CANCEL
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-2xl border-2 border-dashed border-nino-300/40 hover:border-nino-500/60 hover:bg-nino-50/30 transition-all p-5 min-h-[140px] flex flex-col items-center justify-center gap-2 text-nino-700/40 hover:text-nino-700/70"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-xs font-[var(--font-display)] font-semibold tracking-wider uppercase">
            Add Payment Method
          </span>
        </button>
      )}
    </div>
  );
}
