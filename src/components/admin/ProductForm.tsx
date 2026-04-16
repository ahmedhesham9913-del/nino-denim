"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, ProductVariant } from "@/lib/types";
import BulkImageManager, { type ImageAssignment } from "@/components/admin/BulkImageManager";
import VariantCard, { type VariantFormData } from "@/components/admin/VariantCard";
import {
  getTaxonomyItems,
  type ColorItem,
  type CategoryItem,
  type TagItem,
  type SizeItem,
  type StyleItem,
} from "@/services/taxonomies";

// ─── Form state types ─────────────────────────────────────────────

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  style: string;
  tag: string;
  variants: VariantFormData[];
  rating: number;
  reviews: number;
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Omit<Product, "id" | "created_at">) => Promise<void>;
  onCancel: () => void;
}

// ─── Section collapse helper ──────────────────────────────────────

function SectionHeader({
  title,
  open,
  onToggle,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg bg-nino-50/50 px-4 py-3 transition-colors hover:bg-nino-50/80"
    >
      <span className="font-display text-sm font-semibold text-nino-950 uppercase tracking-wide">
        {title}
      </span>
      <motion.svg
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="text-nino-800/40"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  // Taxonomy data
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [styles, setStyles] = useState<StyleItem[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    style: "",
    tag: "",
    variants: [],
    rating: 0,
    reviews: 0,
  });

  // Centralized image assignments
  const [imageAssignments, setImageAssignments] = useState<ImageAssignment[]>([]);

  // Section collapse state
  const [sections, setSections] = useState({
    basic: true,
    images: true,
    variants: true,
  });

  // Variant collapse state (per-variant)
  const [collapsedVariants, setCollapsedVariants] = useState<Record<number, boolean>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ─── Load taxonomies ──────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function loadTaxonomies() {
      setTaxonomyLoading(true);
      try {
        const [colorsData, categoriesData, tagsData, sizesData, stylesData] =
          await Promise.all([
            getTaxonomyItems<ColorItem>("colors"),
            getTaxonomyItems<CategoryItem>("categories"),
            getTaxonomyItems<TagItem>("tags"),
            getTaxonomyItems<SizeItem>("sizes"),
            getTaxonomyItems<StyleItem>("styles"),
          ]);
        if (cancelled) return;
        setColors(colorsData);
        setCategories(categoriesData);
        setTags(tagsData);
        setSizes(sizesData);
        setStyles(stylesData);
      } catch (err) {
        console.error("Failed to load taxonomies:", err);
      } finally {
        if (!cancelled) setTaxonomyLoading(false);
      }
    }
    loadTaxonomies();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Populate form in edit mode ───────────────────────────────

  useEffect(() => {
    if (!product) return;
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      style: product.style,
      tag: product.tag ?? "",
      variants: (product.variants ?? []).map((v: ProductVariant) => ({
        colorId: v.colorId,
        colorName: v.colorName,
        colorHex: v.colorHex,
        images: [...v.images],
        sizes: v.sizes.map((s) => ({ ...s })),
      })),
      rating: product.rating,
      reviews: product.reviews,
    });

    // Build imageAssignments from existing product data
    const assignments: ImageAssignment[] = [];
    if (product.mainImage) {
      assignments.push({ src: product.mainImage, assignedTo: "main" });
    }
    for (const v of product.variants ?? []) {
      for (const img of v.images) {
        assignments.push({ src: img, assignedTo: v.colorName });
      }
    }
    setImageAssignments(assignments);
  }, [product]);

  // ─── Derived: filtered sizes by category ──────────────────────

  const getFilteredSizes = useCallback((): SizeItem[] => {
    if (!formData.category) return sizes;
    // Find the category name to match against size groups
    const selectedCategory = categories.find(
      (c) => c.id === formData.category || c.name === formData.category || c.slug === formData.category
    );
    if (!selectedCategory) return sizes;
    return sizes.filter(
      (s) => s.group === selectedCategory.name || s.group === "Unisex"
    );
  }, [formData.category, categories, sizes]);

  // ─── Selected tag name for conditional rendering ──────────────

  const selectedTagName = tags.find(
    (t) => t.id === formData.tag || t.name === formData.tag
  )?.name ?? formData.tag;

  // ─── Validation ───────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!imageAssignments.some((i) => i.assignedTo === "main")) {
      newErrors.images = "A main image is required";
    }
    if (formData.variants.length === 0) {
      newErrors.variants = "Add at least one color variant";
    } else {
      const hasNoSizes = formData.variants.some((v) => v.sizes.length === 0);
      if (hasNoSizes) {
        newErrors.variants = "Each variant must have at least 1 size";
      }
      const hasNoImages = formData.variants.some(
        (v) => !imageAssignments.some((i) => i.assignedTo === v.colorName)
      );
      if (hasNoImages) {
        newErrors.variants = "Each variant must have at least 1 image assigned";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Variant management ───────────────────────────────────────

  function handleAddVariant() {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          colorId: "",
          colorName: "",
          colorHex: "#d1d5db",
          images: [],
          sizes: [],
        },
      ],
    }));
  }

  function handleVariantChange(index: number, updated: VariantFormData) {
    const oldColorName = formData.variants[index]?.colorName;
    const newColorName = updated.colorName;

    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = updated;
      return { ...prev, variants: newVariants };
    });

    // When color name changes, update image assignments from old to new
    if (oldColorName && newColorName && oldColorName !== newColorName) {
      setImageAssignments((prev) =>
        prev.map((img) =>
          img.assignedTo === oldColorName
            ? { ...img, assignedTo: newColorName }
            : img
        )
      );
    }
  }

  function handleVariantDelete(index: number) {
    const deletedColorName = formData.variants[index]?.colorName;

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

    // Set deleted variant's images back to unassigned
    if (deletedColorName) {
      setImageAssignments((prev) =>
        prev.map((img) =>
          img.assignedTo === deletedColorName
            ? { ...img, assignedTo: "unassigned" }
            : img
        )
      );
    }

    // Clean up collapsed state
    setCollapsedVariants((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  function toggleVariantCollapse(index: number) {
    setCollapsedVariants((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  // ─── Upload helper ────────────────────────────────────────────

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Image upload failed");
    const { url } = await res.json();
    return url;
  }

  // ─── Submit ───────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // Upload main image from assignments
      let mainImageUrl = "";
      const mainAssignment = imageAssignments.find((i) => i.assignedTo === "main");
      if (mainAssignment) {
        if (typeof mainAssignment.src === "string") {
          mainImageUrl = mainAssignment.src;
        } else {
          mainImageUrl = await uploadImage(mainAssignment.src);
        }
      }

      // Build variant data with images from assignments
      const variantsData: ProductVariant[] = [];
      for (const variant of formData.variants) {
        const variantAssignments = imageAssignments.filter(
          (i) => i.assignedTo === variant.colorName
        );
        const imageUrls: string[] = [];
        for (const assignment of variantAssignments) {
          if (typeof assignment.src === "string") {
            imageUrls.push(assignment.src);
          } else {
            const url = await uploadImage(assignment.src);
            imageUrls.push(url);
          }
        }
        variantsData.push({
          colorId: variant.colorId,
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          images: imageUrls,
          sizes: variant.sizes.map((s) => ({ value: s.value, stock: s.stock })),
        });
      }

      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        originalPrice: formData.originalPrice,
        mainImage: mainImageUrl,
        variants: variantsData,
        category: formData.category,
        style: formData.style,
        tag: formData.tag || undefined,
        rating: formData.rating,
        reviews: formData.reviews,
      });
    } catch (err) {
      console.error("Failed to save product:", err);
      setErrors({ form: err instanceof Error ? err.message : "Failed to save product" });
    } finally {
      setSaving(false);
    }
  }

  // ─── Style constants ──────────────────────────────────────────

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 font-body text-sm focus:border-nino-500 focus:ring-1 focus:ring-nino-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-nino-950 font-display mb-1";
  const errorClass = "text-red-500 text-xs mt-1";

  // ─── Loading state ────────────────────────────────────────────

  if (taxonomyLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-nino-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────

  const filteredSizes = getFilteredSizes();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.form && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      {/* ─── Section 1: Basic Info ─────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          title="Basic Info"
          open={sections.basic}
          onToggle={() => setSections((s) => ({ ...s, basic: !s.basic }))}
        />
        <AnimatePresence initial={false}>
          {sections.basic && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 px-1 pt-1 pb-2">
                {/* Name */}
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={inputClass}
                    placeholder="Product name"
                  />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className={inputClass}
                    rows={3}
                    placeholder="Product description"
                  />
                </div>

                {/* Category & Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Style</label>
                    <select
                      value={formData.style}
                      onChange={(e) => setFormData((prev) => ({ ...prev, style: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select style...</option>
                      {styles.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tag */}
                <div>
                  <label className={labelClass}>Tag</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">None</option>
                    {tags.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price (EGP)</label>
                    <input
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className={inputClass}
                      min={0}
                      step={1}
                      placeholder="0"
                    />
                    {errors.price && <p className={errorClass}>{errors.price}</p>}
                  </div>
                  {/* Original Price: only when tag is "Sale" */}
                  {selectedTagName === "Sale" && (
                    <div>
                      <label className={labelClass}>Original Price (EGP)</label>
                      <input
                        type="number"
                        value={formData.originalPrice || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, originalPrice: Number(e.target.value) }))
                        }
                        className={inputClass}
                        min={0}
                        step={1}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                {/* Rating & Reviews */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Rating</label>
                    <input
                      type="number"
                      value={formData.rating || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rating: Math.min(5, Math.max(0, Number(e.target.value))),
                        }))
                      }
                      className={inputClass}
                      min={0}
                      max={5}
                      step={0.1}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Reviews</label>
                    <input
                      type="number"
                      value={formData.reviews || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, reviews: Number(e.target.value) }))
                      }
                      className={inputClass}
                      min={0}
                      step={1}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Section 2: Product Images ──────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          title="Product Images"
          open={sections.images}
          onToggle={() => setSections((s) => ({ ...s, images: !s.images }))}
        />
        <AnimatePresence initial={false}>
          {sections.images && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-1 pt-1 pb-2">
                <p className="text-xs font-body text-nino-800/40 mb-2">
                  Upload all product images, then assign each to Main or a color variant.
                </p>
                <BulkImageManager
                  images={imageAssignments}
                  onChange={setImageAssignments}
                  variantColors={formData.variants.map((v) => ({
                    colorName: v.colorName,
                    colorHex: v.colorHex,
                  }))}
                />
                {errors.images && <p className={errorClass}>{errors.images}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Section 3: Color Variants ─────────────────────────── */}
      <div className="space-y-4">
        <SectionHeader
          title="Color Variants"
          open={sections.variants}
          onToggle={() => setSections((s) => ({ ...s, variants: !s.variants }))}
        />
        <AnimatePresence initial={false}>
          {sections.variants && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-3 px-1 pt-1 pb-2">
                {errors.variants && (
                  <p className={errorClass}>{errors.variants}</p>
                )}

                {formData.variants.length === 0 && (
                  <p className="text-sm text-nino-400 font-body py-2">
                    No variants yet. Add a color variant to define sizes and stock.
                  </p>
                )}

                {formData.variants.map((variant, idx) => (
                  <VariantCard
                    key={idx}
                    variant={variant}
                    availableColors={colors}
                    availableSizes={filteredSizes}
                    assignedImages={imageAssignments
                      .filter((i) => i.assignedTo === variant.colorName)
                      .map((i) => i.src)}
                    onChange={(updated) => handleVariantChange(idx, updated)}
                    onDelete={() => handleVariantDelete(idx)}
                    collapsed={!!collapsedVariants[idx]}
                    onToggleCollapse={() => toggleVariantCollapse(idx)}
                  />
                ))}

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full rounded-lg border-2 border-dashed border-nino-300/30 px-4 py-3 text-sm font-body text-nino-600 hover:border-nino-400/50 hover:bg-nino-50/30 transition-colors"
                >
                  + Add Color Variant
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Actions ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium font-body text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-nino-950 text-white text-sm font-medium font-body hover:bg-nino-900 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
