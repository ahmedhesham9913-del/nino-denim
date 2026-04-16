"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTaxonomyItems,
  addTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type ColorItem,
} from "@/services/taxonomies";

export default function ColorsEditor() {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<{ name: string; hex: string }>({ name: "", hex: "#000000" });
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<{ name: string; hex: string }>({ name: "", hex: "#2563eb" });

  const load = async () => {
    setLoading(true);
    const data = await getTaxonomyItems<ColorItem>("colors");
    setColors(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newItem.name.trim()) return;
    await addTaxonomyItem("colors", { ...newItem, order: colors.length });
    setNewItem({ name: "", hex: "#2563eb" });
    setAdding(false);
    load();
  };

  const handleEdit = async (id: string) => {
    if (!editValue.name.trim()) return;
    await updateTaxonomyItem("colors", id, editValue);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete color "${name}"?`)) return;
    await deleteTaxonomyItem("colors", id);
    load();
  };

  const startEdit = (color: ColorItem) => {
    setEditingId(color.id!);
    setEditValue({ name: color.name, hex: color.hex });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-nino-100/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {colors.map((color) => (
            <motion.div
              key={color.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative rounded-2xl border border-nino-200/30 bg-white p-4 hover:border-nino-300/60 transition-colors"
            >
              {editingId === color.id ? (
                <div className="space-y-3">
                  <div
                    className="aspect-square rounded-xl border-2 border-nino-200/40"
                    style={{ backgroundColor: editValue.hex }}
                  />
                  <input
                    type="color"
                    value={editValue.hex}
                    onChange={(e) => setEditValue({ ...editValue, hex: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editValue.name}
                    onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-nino-200/40 text-sm font-[var(--font-body)]"
                    placeholder="Name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(color.id!)}
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
                  <div
                    className="aspect-square rounded-xl border-2 border-nino-200/30 mb-3 cursor-pointer transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => startEdit(color)}
                  />
                  <div className="text-center">
                    <div className="font-[var(--font-display)] font-semibold text-nino-950 text-sm truncate">
                      {color.name}
                    </div>
                    <div className="text-[10px] text-nino-800/30 font-[var(--font-display)] uppercase">
                      {color.hex}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(color.id!, color.name)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-dashed border-nino-300/50 bg-white p-4 space-y-3"
          >
            <div
              className="aspect-square rounded-xl border-2 border-nino-200/40"
              style={{ backgroundColor: newItem.hex }}
            />
            <input
              type="color"
              value={newItem.hex}
              onChange={(e) => setNewItem({ ...newItem, hex: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-nino-200/40 text-sm font-[var(--font-body)]"
              placeholder="Color name"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 py-2 rounded-lg bg-nino-950 text-white text-xs font-[var(--font-display)] font-semibold tracking-wider"
              >
                ADD
              </button>
              <button
                onClick={() => { setAdding(false); setNewItem({ name: "", hex: "#2563eb" }); }}
                className="flex-1 py-2 rounded-lg border border-nino-200/40 text-nino-700/50 text-xs font-[var(--font-display)] font-semibold tracking-wider"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="aspect-square min-h-[180px] rounded-2xl border-2 border-dashed border-nino-300/40 hover:border-nino-500/60 hover:bg-nino-50/30 transition-all flex flex-col items-center justify-center gap-2 text-nino-700/40 hover:text-nino-700/70"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs font-[var(--font-display)] font-semibold tracking-wider">ADD COLOR</span>
          </button>
        )}
      </div>
    </div>
  );
}
