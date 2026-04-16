"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTaxonomyItems,
  addTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type SizeItem,
} from "@/services/taxonomies";

const GROUPS: SizeItem["group"][] = ["Men", "Women", "Kids", "Unisex"];

export default function SizesEditor() {
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addingGroup, setAddingGroup] = useState<SizeItem["group"] | null>(null);
  const [newValue, setNewValue] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await getTaxonomyItems<SizeItem>("sizes");
    setSizes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (group: SizeItem["group"]) => {
    if (!newValue.trim()) return;
    const groupSizes = sizes.filter((s) => s.group === group);
    await addTaxonomyItem("sizes", { value: newValue.trim(), group, order: groupSizes.length });
    setNewValue("");
    setAddingGroup(null);
    load();
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) return;
    await updateTaxonomyItem("sizes", id, { value: editValue.trim() });
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string, value: string) => {
    if (!confirm(`Delete size "${value}"?`)) return;
    await deleteTaxonomyItem("sizes", id);
    load();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="h-4 w-24 bg-nino-100/40 rounded animate-pulse mb-3" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-xl bg-nino-100/40 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {GROUPS.map((group) => {
        const groupSizes = sizes.filter((s) => s.group === group);
        return (
          <div key={group}>
            <h4 className="text-[11px] tracking-[0.2em] text-nino-800/40 font-[var(--font-display)] font-semibold mb-3 uppercase">
              {group} Sizes
            </h4>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {groupSizes.map((size) => (
                  <motion.div
                    key={size.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="group relative"
                  >
                    {editingId === size.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEdit(size.id!)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(size.id!);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="w-14 h-14 rounded-xl border-2 border-nino-500 text-center font-[var(--font-display)] font-bold text-nino-950 focus:outline-none"
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(size.id!); setEditValue(size.value); }}
                          className="w-14 h-14 rounded-xl bg-white border border-nino-200/40 hover:border-nino-500/60 font-[var(--font-display)] font-bold text-nino-950 transition-colors"
                        >
                          {size.value}
                        </button>
                        <button
                          onClick={() => handleDelete(size.id!, size.value)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          aria-label={`Delete size ${size.value}`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {addingGroup === group ? (
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onBlur={() => newValue ? handleAdd(group) : setAddingGroup(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd(group);
                    if (e.key === "Escape") { setAddingGroup(null); setNewValue(""); }
                  }}
                  placeholder="?"
                  autoFocus
                  className="w-14 h-14 rounded-xl border-2 border-dashed border-nino-500 text-center font-[var(--font-display)] font-bold text-nino-950 focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => setAddingGroup(group)}
                  className="w-14 h-14 rounded-xl border-2 border-dashed border-nino-300/40 hover:border-nino-500/60 hover:bg-nino-50/30 text-nino-700/40 hover:text-nino-700/70 transition-all flex items-center justify-center"
                  aria-label={`Add ${group} size`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
