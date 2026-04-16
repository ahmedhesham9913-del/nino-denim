"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ProductGallery from "./ProductGallery";
import SizeSelector from "./SizeSelector";
import AddToCartButton from "./AddToCartButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/types";
import Link from "next/link";

export default function ProductDetailClient({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const firstVariant = variants[0] ?? null;

  const [selectedColor, setSelectedColor] = useState<string>(firstVariant?.colorName ?? "");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { trackProductView } = useAnalytics();
  const addItem = useCartStore((s) => s.addItem);

  // Current variant based on selected color
  const currentVariant = useMemo(
    () => variants.find((v) => v.colorName === selectedColor) ?? firstVariant,
    [variants, selectedColor, firstVariant]
  );

  // Total stock across ALL variants
  const totalStock = useMemo(
    () => variants.reduce((sum, v) => sum + v.sizes.reduce((s, sz) => s + sz.stock, 0), 0),
    [variants]
  );
  const isSoldOut = totalStock === 0;

  // Conditional pricing: only show discount when tag is "Sale"
  const isSale = product.tag === "Sale";
  const discount = isSale && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  // Bidirectional filter: when a size is selected, determine which colors have stock for that size
  const colorsWithSelectedSize = useMemo(() => {
    if (!selectedSize) return null; // no filtering when no size selected
    const set = new Set<string>();
    for (const v of variants) {
      const sizeEntry = v.sizes.find((s) => s.value === selectedSize);
      if (sizeEntry && sizeEntry.stock > 0) {
        set.add(v.colorName);
      }
    }
    return set;
  }, [variants, selectedSize]);

  useEffect(() => {
    if (product.id) {
      trackProductView(product.id, "detail");
    }
  }, [product.id, trackProductView]);

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedSize(null); // reset size when color changes
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-6" style={{ background: "oklch(0.97 0.006 250)" }}>
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <motion.div
          className="flex items-center gap-2 mb-8 text-xs font-[var(--font-display)] text-nino-700/25"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="hover:text-nino-700/50 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-nino-700/50 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-nino-800/50">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Gallery — 7 cols */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductGallery
              mainImage={product.mainImage}
              allVariantImages={variants.flatMap((v) => v.images)}
              selectedColorImages={currentVariant?.images ?? []}
              productName={product.name}
            />
          </motion.div>

          {/* Info — 5 cols */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {/* Category & style badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] tracking-[0.3em] text-nino-600/40 font-[var(--font-display)] font-medium">
                {product.category.toUpperCase()} &middot; {product.style.toUpperCase()}
              </span>
              {product.tag && (
                <span className="px-3 py-1 rounded-full text-[10px] font-[var(--font-display)] font-bold tracking-[0.1em] bg-nino-600 text-white">
                  {product.tag.toUpperCase()}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3rem)] font-bold text-nino-950 leading-[1.05] mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className={`font-[var(--font-display)] text-3xl font-black ${discount > 0 ? "text-red-600" : "text-nino-950"}`}>
                ${product.price}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-nino-800/25 line-through font-[var(--font-display)]">
                    ${product.originalPrice}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-xs font-[var(--font-display)] font-bold">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(product.rating) ? "oklch(0.68 0.17 80)" : "none"}
                    stroke="oklch(0.68 0.17 80)"
                    strokeWidth="2"
                  >
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-nino-800/30 font-[var(--font-display)]">
                {product.rating.toFixed(1)} ({product.reviews} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-nino-800/50 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Color swatches */}
            {variants.length > 0 && (
              <div className="mb-6">
                <span className="text-[11px] tracking-[0.2em] text-nino-800/35 font-[var(--font-display)] font-semibold block mb-3">
                  COLOR — {selectedColor}
                </span>
                <div className="flex gap-3">
                  {variants.map((variant) => {
                    const isActive = variant.colorName === selectedColor;
                    // Bidirectional: dim colors that don't carry the selected size
                    const isDimmed = colorsWithSelectedSize !== null && !colorsWithSelectedSize.has(variant.colorName);

                    return (
                      <motion.button
                        key={variant.colorId}
                        onClick={() => handleColorSelect(variant.colorName)}
                        aria-label={`Select color ${variant.colorName}`}
                        className="flex flex-col items-center gap-1.5"
                        whileTap={{ scale: 0.92 }}
                      >
                        <div
                          className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                            isActive
                              ? "border-nino-600 ring-2 ring-nino-500/25 scale-110"
                              : isDimmed
                              ? "border-nino-300/20 opacity-30"
                              : "border-nino-300/30 hover:border-nino-400/50"
                          }`}
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        <span className={`text-[9px] font-[var(--font-display)] transition-colors ${
                          isActive ? "text-nino-800" : isDimmed ? "text-nino-700/15" : "text-nino-700/25"
                        }`}>
                          {variant.colorName}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector — shows sizes from the selected variant */}
            {currentVariant && (
              <div className="mb-10">
                <SizeSelector
                  sizes={currentVariant.sizes}
                  selectedSize={selectedSize}
                  onSelect={setSelectedSize}
                />
              </div>
            )}

            {/* Add to cart */}
            <AddToCartButton
              disabled={isSoldOut || (!isSoldOut && selectedSize === null)}
              onAdd={() => {
                if (!product.id || !selectedSize || !currentVariant) return;
                addItem({
                  productId: product.id,
                  name: product.name,
                  image: currentVariant.images[0] || product.mainImage,
                  size: selectedSize,
                  color: currentVariant.colorName,
                  colorHex: currentVariant.colorHex,
                  price: product.price,
                });
              }}
            />

            {isSoldOut && (
              <p className="text-center text-sm text-red-500/60 font-[var(--font-display)] mt-3">
                This product is currently sold out.
              </p>
            )}

            {!isSoldOut && !selectedSize && (
              <p className="text-center text-[11px] text-nino-800/20 font-[var(--font-display)] mt-3">
                Select a size to add to cart
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
