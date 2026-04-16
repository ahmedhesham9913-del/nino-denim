"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTaxonomyItems,
  addTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type TagItem,
} from "@/services/taxonomies";

export default function TagsEditor() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState({ name: "", color: "#2563eb" });
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", color: "#2563eb" });

  const load = async () => {
    setLoading(true);
    const data = await getTaxonomyItems<TagItem>("tags");
    setTags(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newItem.name.trim()) return;
    await addTaxonomyItem("tags", { ...newItem, order: tags.length });
    setNewItem({ name: "", color: "#2563eb" });
    setAdding(false);
    load();
  };

  const handleEdit = async (id: string) => {
    if (!editValue.name.trim()) return;
    await updateTaxonomyItem("tags", id, editValue);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    await deleteTaxonomyItem("tags", id);
    load();
  };

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-28 rounded-full bg-nino-100/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <AnimatePresence mode="popLayout">
        {tags.map((tag) => (
          <motion.div
            key={tag.id}
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="group relative"
          >
            {editingId === tag.id ? (
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border-2 border-nino-500">
                <input
                  type="color"
                  value={editValue.color}
                  onChange={(e) => setEditValue({ ...editValue, color: e.target.value })}
                  className="w-9 h-9 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={editValue.name}
                  onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit(tag.id!)}
                  autoFocus
                  className="px-2 py-1 text-sm font-[var(--font-display)] font-bold text-nino-950 bg-transparent focus:outline-none w-28"
                />
                <button
                  onClick={() => handleEdit(tag.id!)}
                  className="w-9 h-9 rounded-lg bg-nino-950 text-white flex items-center justify-center"
                  aria-label="Save"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={() => { setEditingId(tag.id!); setEditValue({ name: tag.name, color: tag.color }); }}
                  className="px-5 py-2.5 rounded-l-full font-[var(--font-display)] font-bold text-xs tracking-[0.15em] text-white uppercase transition-transform hover:scale-105"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </button>
                <button
                  onClick={() => handleDelete(tag.id!, tag.name)}
                  className="h-[38px] w-9 rounded-r-full bg-white border border-l-0 border-nino-200/40 text-nino-700/30 hover:text-red-500 hover:border-red-200 transition-colors flex items-center justify-center"
                  aria-label={`Delete ${tag.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add new */}
      {adding ? (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-2 rounded-2xl bg-white border-2 border-nino-500"
        >
          <input
            type="color"
            value={newItem.color}
            onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
            className="w-9 h-9 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Tag name"
            autoFocus
            className="px-2 py-1 text-sm font-[var(--font-body)] text-nino-950 bg-transparent focus:outline-none w-28"
          />
          <button
            onClick={handleAdd}
            className="w-9 h-9 rounded-lg bg-nino-950 text-white flex items-center justify-center"
            aria-label="Add"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
          <button
            onClick={() => { setAdding(false); setNewItem({ name: "", color: "#2563eb" }); }}
            className="w-9 h-9 rounded-lg border border-nino-200/40 text-nino-700/40 flex items-center justify-center"
            aria-label="Cancel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-dashed border-nino-300/40 hover:border-nino-500/60 hover:bg-nino-50/30 text-nino-700/40 hover:text-nino-700/70 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-xs font-[var(--font-display)] font-semibold tracking-[0.15em] uppercase">
            Add Tag
          </span>
        </button>
      )}
    </div>
  );
}
