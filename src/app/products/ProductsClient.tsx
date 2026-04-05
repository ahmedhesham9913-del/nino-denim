"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
} from "framer-motion";
import {
  products as allProducts,
  allStyles,
  allColors,
  type Product,
} from "@/lib/products";
import Footer from "@/components/Footer";

/* ───── Types ───── */
type Category = "All" | Product["category"];
type SortOption = "newest" | "price-asc" | "price-desc" | "popular";
type ViewMode = "grid-3" | "grid-4" | "grid-2";

const categories: Category[] = ["All", "Men", "Women", "Kids", "Unisex"];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "popular", label: "Most Popular" },
];

/* ───── Main Component ───── */
export default function ProductsClient() {
  const [category, setCategory] = useState<Category>("All");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(200);
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid-3");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    let result = allProducts;
    if (category !== "All") result = result.filter((p) => p.category === category);
    if (selectedStyles.length) result = result.filter((p) => selectedStyles.includes(p.style));
    if (selectedColors.length) result = result.filter((p) => p.colors.some((c) => selectedColors.includes(c.name)));
    if (selectedSizes.length) result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    result = result.filter((p) => p.price <= priceMax);
    return result;
  }, [category, selectedStyles, selectedColors, selectedSizes, priceMax]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "price-asc": return arr.sort((a, b) => a.price - b.price);
      case "price-desc": return arr.sort((a, b) => b.price - a.price);
      case "popular": return arr.sort((a, b) => b.reviews - a.reviews);
      default: return arr;
    }
  }, [filtered, sort]);

  const activeFilterCount =
    (category !== "All" ? 1 : 0) +
    selectedStyles.length +
    selectedColors.length +
    selectedSizes.length +
    (priceMax < 200 ? 1 : 0);

  const clearAll = useCallback(() => {
    setCategory("All");
    setSelectedStyles([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceMax(200);
  }, []);

  const toggleInArray = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const availableSizes = useMemo(() => {
    const pool = category === "All" ? allProducts : allProducts.filter((p) => p.category === category);
    return [...new Set(pool.flatMap((p) => p.sizes))].sort((a, b) => {
      const numA = parseInt(a), numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      const order = ["XS", "S", "M", "L", "XL", "XXL"];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [category]);

  const gridCols = {
    "grid-2": "grid-cols-1 sm:grid-cols-2",
    "grid-3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "grid-4": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  /* ── Sidebar filter content ── */
  const filterContent = (
    <div className="space-y-7">
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-[var(--font-display)] font-medium tracking-[0.1em] transition-all duration-300 ${
                category === cat
                  ? "bg-nino-950 text-white shadow-md shadow-nino-900/10"
                  : "bg-nino-100/50 text-nino-700/50 hover:bg-nino-200/50 hover:text-nino-800"
              }`}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <div className="flex flex-wrap gap-2">
          {allStyles.map((style) => (
            <motion.button
              key={style}
              onClick={() => toggleInArray(selectedStyles, style, setSelectedStyles)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-[var(--font-display)] font-medium tracking-wider transition-all duration-300 ${
                selectedStyles.includes(style)
                  ? "bg-nino-600 text-white shadow-md shadow-nino-600/15"
                  : "bg-transparent text-nino-700/35 border border-nino-300/25 hover:border-nino-400/40 hover:text-nino-700/60"
              }`}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {style}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-3">
          {allColors.map((color) => (
            <motion.button
              key={color.name}
              aria-label={`Filter by ${color.name}`}
              onClick={() => toggleInArray(selectedColors, color.name, setSelectedColors)}
              className="flex flex-col items-center gap-1.5 group"
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                  selectedColors.includes(color.name)
                    ? "border-nino-600 scale-110 ring-2 ring-nino-500/20"
                    : "border-nino-300/30 group-hover:border-nino-400/50"
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <span className={`text-[9px] font-[var(--font-display)] tracking-wider transition-colors ${
                selectedColors.includes(color.name) ? "text-nino-800" : "text-nino-700/25"
              }`}>
                {color.name}
              </span>
            </motion.button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <motion.button
              key={size}
              onClick={() => toggleInArray(selectedSizes, size, setSelectedSizes)}
              className={`w-11 h-11 rounded-xl text-xs font-[var(--font-display)] font-semibold transition-all duration-300 ${
                selectedSizes.includes(size)
                  ? "bg-nino-950 text-white shadow-md shadow-nino-900/10"
                  : "bg-nino-100/40 text-nino-700/35 hover:bg-nino-200/50 hover:text-nino-700/60"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={`Price — up to $${priceMax}`}>
        <div className="px-1">
          <input
            type="range"
            min={30}
            max={200}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full accent-nino-600 cursor-pointer"
            aria-label="Maximum price"
          />
          <div className="flex justify-between text-[10px] text-nino-700/20 font-[var(--font-display)] mt-1">
            <span>$30</span>
            <span>$200</span>
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Page background — subtle cream, not pure white */}
      <div className="min-h-screen" style={{ background: "oklch(0.97 0.006 250)" }}>
        {/* Page Header */}
        <header className="pt-28 pb-8 px-6">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              className="flex items-center gap-2 mb-6 text-xs font-[var(--font-display)] text-nino-700/25"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="hover:text-nino-700/50 transition-colors" data-cursor-hover>Home</Link>
              <span>/</span>
              <span className="text-nino-800/50">Shop All</span>
            </motion.div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="font-[var(--font-display)] text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-nino-950 leading-[1]">
                  Shop <span className="text-gradient">All</span>
                </h1>
                <p className="text-nino-800/25 text-sm mt-2 font-[var(--font-display)]">
                  {sorted.length} product{sorted.length !== 1 ? "s" : ""}
                </p>
              </motion.div>

              {/* Top Controls */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {/* Mobile filter toggle */}
                <button
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-nino-300/25 bg-white text-xs font-[var(--font-display)] font-medium text-nino-800/50 shadow-sm shadow-nino-900/[0.02]"
                  onClick={() => setMobileFilters(true)}
                  data-cursor-hover
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-nino-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="appearance-none pl-4 pr-8 py-2.5 rounded-xl border border-nino-300/25 bg-white text-xs font-[var(--font-display)] font-medium text-nino-800/50 cursor-pointer focus:outline-none focus:border-nino-400/50 shadow-sm shadow-nino-900/[0.02]"
                    aria-label="Sort products"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-nino-700/25" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </div>

                {/* View toggle */}
                <div className="hidden md:flex items-center border border-nino-300/25 rounded-xl overflow-hidden bg-white shadow-sm shadow-nino-900/[0.02]">
                  {([
                    ["grid-2", "M4 5h16M4 12h16M4 19h16"],
                    ["grid-3", "M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4z"],
                    ["grid-4", "M3 3h3.5v3.5H3zM8.75 3h3.5v3.5h-3.5zM14.5 3H18v3.5h-3.5zM3 8.75h3.5v3.5H3zM8.75 8.75h3.5v3.5h-3.5zM14.5 8.75H18v3.5h-3.5z"],
                  ] as [ViewMode, string][]).map(([mode, path]) => (
                    <button
                      key={mode}
                      aria-label={`${mode} view`}
                      onClick={() => setViewMode(mode)}
                      className={`p-2.5 transition-colors ${viewMode === mode ? "bg-nino-100/60 text-nino-800" : "text-nino-700/20 hover:text-nino-700/40"}`}
                      data-cursor-hover
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={path}/></svg>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Active filters */}
            <AnimatePresence mode="popLayout">
              {activeFilterCount > 0 && (
                <motion.div
                  className="flex flex-wrap items-center gap-2 mt-5"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {category !== "All" && <FilterPill label={category} onRemove={() => setCategory("All")} />}
                  {selectedStyles.map((s) => <FilterPill key={s} label={s} onRemove={() => setSelectedStyles((p) => p.filter((v) => v !== s))} />)}
                  {selectedColors.map((c) => <FilterPill key={c} label={c} onRemove={() => setSelectedColors((p) => p.filter((v) => v !== c))} />)}
                  {selectedSizes.map((s) => <FilterPill key={`sz-${s}`} label={`Size ${s}`} onRemove={() => setSelectedSizes((p) => p.filter((v) => v !== s))} />)}
                  {priceMax < 200 && <FilterPill label={`Under $${priceMax}`} onRemove={() => setPriceMax(200)} />}
                  <motion.button
                    onClick={clearAll}
                    className="text-[11px] font-[var(--font-display)] font-medium text-nino-600 hover:text-nino-800 transition-colors ml-1"
                    whileTap={{ scale: 0.95 }}
                    data-cursor-hover
                  >
                    Clear all
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main content */}
        <div className="max-w-[1600px] mx-auto px-6 pb-24">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <motion.aside
              className="hidden lg:block flex-shrink-0 sticky top-24 self-start"
              animate={{ width: filtersOpen ? 280 : 0, opacity: filtersOpen ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-[280px] pr-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-[var(--font-display)] text-sm font-semibold text-nino-950 tracking-[0.15em]">
                    FILTERS
                    {activeFilterCount > 0 && (
                      <span className="ml-2 inline-flex w-5 h-5 rounded-full bg-nino-600 text-white text-[10px] font-bold items-center justify-center align-middle">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    aria-label="Hide filters"
                    className="p-1.5 rounded-lg hover:bg-nino-100/50 text-nino-700/25 hover:text-nino-700/50 transition-colors"
                    data-cursor-hover
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                </div>
                {filterContent}
              </div>
            </motion.aside>

            {/* Show filters button */}
            {!filtersOpen && (
              <motion.button
                className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-white border border-nino-300/25 shadow-lg shadow-nino-900/5 text-nino-700/35 hover:text-nino-800 transition-colors"
                onClick={() => setFiltersOpen(true)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                data-cursor-hover
                aria-label="Show filters"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </motion.button>
            )}

            {/* Product Grid */}
            <div className="flex-1 min-w-0" ref={gridRef}>
              <LayoutGroup>
                <motion.div className={`grid gap-5 ${gridCols[viewMode]}`} layout>
                  <AnimatePresence mode="popLayout">
                    {sorted.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} viewMode={viewMode} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>

              {sorted.length === 0 && (
                <motion.div
                  className="flex flex-col items-center justify-center py-32 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-nino-100/40 flex items-center justify-center mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-nino-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <h3 className="font-[var(--font-display)] text-xl font-semibold text-nino-950 mb-2">No matches found</h3>
                  <p className="text-sm text-nino-800/25 mb-6 max-w-xs">Try adjusting your filters to see more results.</p>
                  <button
                    onClick={clearAll}
                    className="px-6 py-2.5 rounded-full bg-nino-950 text-white text-sm font-[var(--font-display)] font-medium tracking-wider"
                    data-cursor-hover
                  >
                    CLEAR FILTERS
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFilters && (
          <>
            <motion.div
              className="fixed inset-0 bg-nino-950/25 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilters(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="sticky top-0 bg-white z-10 px-6 pt-4 pb-3 border-b border-nino-200/15">
                <div className="w-10 h-1 rounded-full bg-nino-300/30 mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <span className="font-[var(--font-display)] text-base font-semibold text-nino-950">Filters</span>
                  <button onClick={() => setMobileFilters(false)} className="p-2 text-nino-700/35" data-cursor-hover aria-label="Close filters">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-6">{filterContent}</div>
              <div className="sticky bottom-0 bg-white border-t border-nino-200/15 px-6 py-4 flex gap-3">
                <button
                  onClick={clearAll}
                  className="flex-1 py-3 rounded-xl border border-nino-300/25 text-sm font-[var(--font-display)] font-medium text-nino-700/50"
                  data-cursor-hover
                >
                  Clear all
                </button>
                <button
                  onClick={() => setMobileFilters(false)}
                  className="flex-1 py-3 rounded-xl bg-nino-950 text-white text-sm font-[var(--font-display)] font-semibold tracking-wider"
                  data-cursor-hover
                >
                  SHOW {sorted.length} RESULTS
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───── Filter Section ───── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
        data-cursor-hover
      >
        <span className="text-[11px] font-[var(--font-display)] font-semibold tracking-[0.2em] text-nino-800/40 group-hover:text-nino-800/60 transition-colors">
          {title.toUpperCase()}
        </span>
        <motion.svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-nino-700/15"
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <path d="m6 9 6 6 6-6"/>
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───── Filter Pill ───── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.button
      onClick={onRemove}
      className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-nino-100/50 text-nino-700/50 text-[11px] font-[var(--font-display)] font-medium hover:bg-nino-200/50 transition-colors"
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      data-cursor-hover
    >
      {label}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </motion.button>
  );
}

/* ───── Product Card ───── */
function ProductCard({ product, index, viewMode }: { product: Product; index: number; viewMode: ViewMode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.4 },
        y: { duration: 0.5, delay: Math.min(index * 0.03, 0.3) },
      }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cursor-hover
    >
      {/* Card with cream background and subtle border */}
      <div className="rounded-2xl overflow-hidden bg-white border border-nino-200/20 shadow-sm shadow-nino-900/[0.03] transition-shadow duration-500 group-hover:shadow-lg group-hover:shadow-nino-900/[0.06]">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeee8]">
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes={viewMode === "grid-4" ? "25vw" : viewMode === "grid-3" ? "33vw" : "50vw"}
              className="object-cover"
            />
          </motion.div>

          {/* Tag */}
          {product.tag && (
            <div className={`absolute top-3.5 left-3.5 px-3 py-1.5 rounded-full text-[10px] font-[var(--font-display)] font-bold tracking-[0.1em] ${
              product.tag === "Sale"
                ? "bg-red-500 text-white"
                : product.tag === "New"
                ? "bg-nino-600 text-white"
                : product.tag === "Limited"
                ? "bg-nino-950 text-white"
                : "bg-white text-nino-800 border border-nino-200/40"
            }`}>
              {product.tag.toUpperCase()}
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && !product.tag && (
            <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-[var(--font-display)] font-bold">
              -{discount}%
            </div>
          )}

          {/* Quick actions */}
          <motion.div
            className="absolute inset-x-0 bottom-0 p-4"
            style={{ background: "linear-gradient(to top, oklch(0.10 0.03 260 / 0.55) 0%, transparent 100%)" }}
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex gap-2">
              <motion.button
                className="flex-1 py-2.5 rounded-xl text-[11px] font-[var(--font-display)] font-semibold tracking-wider text-white bg-nino-600 hover:bg-nino-700 transition-colors"
                whileTap={{ scale: 0.96 }}
              >
                ADD TO CART
              </motion.button>
              <motion.button
                aria-label="Add to wishlist"
                className="py-2.5 px-3.5 rounded-xl border border-white/25 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                whileTap={{ scale: 0.96 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Shine sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)" }}
            animate={{ x: isHovered ? "100%" : "-100%" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] text-nino-700/25 tracking-[0.15em] font-[var(--font-display)] mb-0.5 truncate">
                {product.category.toUpperCase()} &middot; {product.style.toUpperCase()}
              </p>
              <h3 className="font-[var(--font-display)] font-semibold text-nino-950 text-sm truncate">
                {product.name}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`font-[var(--font-display)] font-bold text-sm ${discount > 0 ? "text-red-600" : "text-nino-800"}`}>
                ${product.price}
              </span>
              {discount > 0 && (
                <span className="block text-[10px] text-nino-800/20 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Color dots */}
          <div className="flex gap-1.5 mt-3">
            {product.colors.map((color, ci) => (
              <button
                key={ci}
                aria-label={`Select ${color.name}`}
                onClick={() => setSelectedColor(ci)}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  selectedColor === ci ? "ring-2 ring-nino-500/25 ring-offset-1" : ""
                }`}
                style={{ backgroundColor: color.hex, border: "1px solid oklch(0.82 0.02 240)" }}
              />
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="11" height="11" viewBox="0 0 24 24" fill={star <= Math.round(product.rating) ? "oklch(0.68 0.17 80)" : "none"} stroke="oklch(0.68 0.17 80)" strokeWidth="2">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-nino-800/18 font-[var(--font-display)]">
              ({product.reviews})
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
