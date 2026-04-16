"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getTaxonomyItems,
  type CategoryItem,
  type StyleItem,
  type TagItem,
} from "@/services/taxonomies";

interface ProductFilters {
  search: string;
  category: string;
  style: string;
  tag: string;
  stockStatus: string;
}

interface ProductFilterBarProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export default function ProductFilterBar({ filters, onChange }: ProductFilterBarProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [styles, setStyles] = useState<StyleItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    async function loadTaxonomies() {
      const [cats, stls, tgs] = await Promise.all([
        getTaxonomyItems<CategoryItem>("categories"),
        getTaxonomyItems<StyleItem>("styles"),
        getTaxonomyItems<TagItem>("tags"),
      ]);
      setCategories(cats);
      setStyles(stls);
      setTags(tgs);
    }
    loadTaxonomies();
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange({ ...filters, search: value });
      }, 300);
    },
    [filters, onChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(key: keyof ProductFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function handleClear() {
    setSearchInput("");
    onChange({ search: "", category: "", style: "", tag: "", stockStatus: "" });
  }

  const selectClass =
    "rounded-lg border border-nino-200/20 bg-white px-3 py-2 font-body text-sm text-nino-800 outline-none transition-colors focus:border-nino-400 focus:ring-2 focus:ring-nino-500/20";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-nino-200/15 bg-white p-4">
      {/* Search */}
      <div className="flex flex-col gap-1">
        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/40">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={`${selectClass} min-w-[180px]`}
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/40">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className={selectClass}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id ?? c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Style */}
      <div className="flex flex-col gap-1">
        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/40">
          Style
        </label>
        <select
          value={filters.style}
          onChange={(e) => handleChange("style", e.target.value)}
          className={selectClass}
        >
          <option value="">All Styles</option>
          {styles.map((s) => (
            <option key={s.id ?? s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tag */}
      <div className="flex flex-col gap-1">
        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/40">
          Tag
        </label>
        <select
          value={filters.tag}
          onChange={(e) => handleChange("tag", e.target.value)}
          className={selectClass}
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t.id ?? t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Status */}
      <div className="flex flex-col gap-1">
        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/40">
          Stock Status
        </label>
        <select
          value={filters.stockStatus}
          onChange={(e) => handleChange("stockStatus", e.target.value)}
          className={selectClass}
        >
          <option value="">All</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Clear */}
      <button
        onClick={handleClear}
        className="rounded-lg border border-nino-200/20 bg-nino-50 px-4 py-2 font-body text-sm font-medium text-nino-600 transition-colors hover:bg-nino-100 hover:text-nino-800"
      >
        Clear
      </button>
    </div>
  );
}
