"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTaxonomyItems,
  addTaxonomyItem,
  updateTaxonomyItem,
  deleteTaxonomyItem,
  type TaxonomyName,
} from "@/services/taxonomies";

interface ChipItem {
  id?: string;
  name: string;
  slug?: string;
  order?: number;
}

interface ChipEditorProps {
  taxonomy: TaxonomyName;
  itemLabel: string; // singular: "category", "style"
  withSlug?: boolean; // categories need a slug
  searchable?: boolean;
}

export default function ChipEditor({ taxonomy, itemLabel, withSlug, searchable }: ChipEditorProps) {
  const [items, setItems] = useState<ChipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await getTaxonomyItems<ChipItem>(taxonomy);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [taxonomy]);

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const data: Record<string, unknown> = { name: newName.trim(), order: items.length };
    if (withSlug) data.slug = slugify(newName);
    await addTaxonomyItem(taxonomy, data);
    setNewName("");
    setAdding(false);
    load();
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) return;
    const data: Record<string, unknown> = { name: editValue.trim() };
    if (withSlug) data.slug = slugify(editValue);
    await updateTaxonomyItem(taxonomy, id, data);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${itemLabel} "${name}"?`)) return;
    await deleteTaxonomyItem(taxonomy, id);
    load();
  };

  const filtered = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-nino-100/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {searchable && (
        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${itemLabel}s...`}
            className="w-full max-w-sm px-4 py-2 rounded-full border border-nino-200/40 text-sm font-[var(--font-body)] focus:outline-none focus:border-nino-500/50"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="group relative"
            >
              {editingId === item.id ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border-2 border-nino-500">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEdit(item.id!);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="px-2 py-1 text-sm font-[var(--font-display)] font-medium text-nino-950 bg-transparent focus:outline-none w-32"
                  />
                  <button
                    onClick={() => handleEdit(item.id!)}
                    className="w-7 h-7 rounded-full bg-nino-950 text-white flex items-center justify-center"
                    aria-label="Save"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 pl-4 pr-1 py-1 rounded-full bg-white border border-nino-200/40 hover:border-nino-300/60 transition-colors">
                  <button
                    onClick={() => { setEditingId(item.id!); setEditValue(item.name); }}
                    className="text-sm font-[var(--font-display)] font-medium text-nino-950 pr-2"
                  >
                    {item.name}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!, item.name)}
                    className="w-7 h-7 rounded-full text-nino-700/30 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                    aria-label={`Delete ${item.name}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add new chip */}
        {adding ? (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border-2 border-nino-500"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              placeholder={`New ${itemLabel}`}
              autoFocus
              className="px-2 py-1 text-sm font-[var(--font-body)] text-nino-950 bg-transparent focus:outline-none w-32"
            />
            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-full bg-nino-950 text-white flex items-center justify-center"
              aria-label="Add"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full border-2 border-dashed border-nino-300/40 hover:border-nino-500/60 hover:bg-nino-50/30 text-nino-700/40 hover:text-nino-700/70 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs font-[var(--font-display)] font-semibold tracking-wider uppercase">
              Add {itemLabel}
            </span>
          </button>
        )}
      </div>

      {searchable && filtered.length === 0 && search && (
        <p className="text-sm text-nino-800/30 mt-4 font-[var(--font-display)]">
          No {itemLabel}s match &quot;{search}&quot;
        </p>
      )}
    </div>
  );
}
