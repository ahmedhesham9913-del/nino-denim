"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import type { Product } from "@/lib/types";
import SkeletonProductCard from "./SkeletonProductCard";

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const isFeatured = index === 0 || index === 4;
  const tiltStrength = isFeatured ? 5 : 8;

  // Use mainImage; fall back to first variant image for old-schema products
  const mainImage = product.mainImage
    ?? product.variants?.[0]?.images?.[0]
    ?? "";

  // Derive colors from variants (new schema) with graceful fallback
  const colors = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({ name: v.colorName, hex: v.colorHex }));
    }
    return [];
  }, [product.variants]);

  // Derive sizes from variants
  const sizes = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      const seen = new Set<string>();
      const result: string[] = [];
      for (const v of product.variants) {
        for (const s of v.sizes) {
          if (!seen.has(s.value)) {
            seen.add(s.value);
            result.push(s.value);
          }
        }
      }
      return result;
    }
    return [];
  }, [product.variants]);

  // Conditional discount: only show when tag === "Sale"
  const isSale = product.tag === "Sale";
  const discount = isSale && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={product.id ? `/product/${product.id}` : "#"}>
    <motion.div
      ref={cardRef}
      className={`perspective-1000 group ${isFeatured ? "sm:col-span-2 sm:row-span-2" : ""}`}
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        delay: index * 0.08,
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="preserve-3d relative rounded-2xl overflow-hidden bg-white h-full"
        animate={{
          rotateY: mousePos.x * tiltStrength,
          rotateX: -mousePos.y * tiltStrength,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* ── Image area ── */}
        <div className={`relative overflow-hidden bg-[oklch(0.96_0.005_240)] ${isFeatured ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
          {/* Image — shifts UP on hover */}
          <motion.div
            className="absolute inset-0"
            animate={{
              y: isHovered ? (isFeatured ? -40 : -30) : 0,
              scale: isHovered ? 1.04 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes={isFeatured ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              className="object-cover"
            />
          </motion.div>

          {/* Tag */}
          {product.tag && (
            <motion.div
              className={`absolute top-5 left-5 z-10 px-4 py-2 rounded-full font-bold tracking-[0.15em] bg-white/90 text-nino-700 border border-nino-200/30 ${isFeatured ? "text-xs" : "text-[10px]"}`}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + 0.5, type: "spring" }}
            >
              {product.tag}
            </motion.div>
          )}

          {/* Oversized index — featured only */}
          {isFeatured && (
            <div className="absolute top-4 right-6 font-[var(--font-display)] text-[8rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
              {String(product.id).padStart(2, "0")}
            </div>
          )}

          {/* Shine sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)" }}
            animate={{ x: isHovered ? "100%" : "-100%" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        </div>

        {/* ── Info section — always visible ── */}
        <div className={`bg-white relative z-10 ${isFeatured ? "px-6 pt-5" : "px-5 pt-4"}`}>
          {/* Name + price row */}
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-nino-800/25 tracking-[0.15em] font-[var(--font-display)] mb-1 ${isFeatured ? "text-xs" : "text-[11px]"}`}>
                {product.category.toUpperCase()}
              </p>
              <h3 className={`font-[var(--font-display)] font-semibold text-nino-950 ${isFeatured ? "text-xl" : "text-base"}`}>
                {product.name}
              </h3>
            </div>
            <div className="text-right">
              <div className={`font-[var(--font-display)] font-bold ${discount > 0 ? "text-red-600" : "text-nino-600"} ${isFeatured ? "text-2xl" : "text-lg"}`}>
                ${product.price}
              </div>
              {discount > 0 && (
                <div className="text-xs text-nino-800/20 line-through">
                  ${product.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* ── Expandable details — revealed on hover ── */}
          <div
            className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ gridTemplateRows: isHovered ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className={`${isFeatured ? "pt-5 pb-6" : "pt-4 pb-5"}`}>
                {/* Sizes */}
                {sizes.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] tracking-[0.2em] text-nino-800/30 font-[var(--font-display)] font-semibold">
                      SIZE
                    </span>
                    <div className="flex gap-1.5">
                      {sizes.map((size, si) => (
                        <button
                          key={size}
                          className={`min-w-[32px] h-[30px] rounded-lg text-[11px] font-[var(--font-display)] font-semibold transition-colors duration-200 ${
                            si === 0
                              ? "bg-nino-950 text-white"
                              : "bg-nino-100/60 text-nino-800/50 hover:bg-nino-200/60 hover:text-nino-800/80"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {colors.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] tracking-[0.2em] text-nino-800/30 font-[var(--font-display)] font-semibold">
                      COLOR
                    </span>
                    <div className="flex gap-2">
                      {colors.map((color, ci) => (
                        <div
                          key={color.name}
                          className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-transform duration-200 hover:scale-125 ${
                            ci === 0 ? "border-nino-500/50 scale-110" : "border-nino-200/60"
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Buy button */}
                <button
                  className={`w-full rounded-xl font-[var(--font-display)] font-semibold tracking-[0.12em] text-white bg-nino-950 hover:bg-nino-800 active:scale-[0.98] transition-all duration-200 ${
                    isFeatured ? "py-3.5 text-sm" : "py-3 text-xs"
                  }`}
                >
                  BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* ── Default bottom padding when NOT hovered ── */}
          <div
            className="transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] grid"
            style={{ gridTemplateRows: isHovered ? "0fr" : "1fr" }}
          >
            <div className="overflow-hidden">
              <div className="flex gap-2.5 pb-5">
                {colors.map((color, ci) => (
                  <div
                    key={color.name}
                    className={`rounded-full border ${isFeatured ? "w-5 h-5" : "w-4 h-4"}`}
                    style={{
                      backgroundColor: color.hex,
                      borderColor: ci === 0 ? "oklch(0.58 0.20 240 / 0.5)" : "oklch(0.88 0.02 240)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </Link>
  );
}

export default function ProductCards({ products: propProducts }: { products?: Product[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const displayProducts = propProducts && propProducts.length > 0 ? propProducts : [];

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative py-32 px-6 bg-warm-white"
    >
      <div className="max-w-[1400px] mx-auto mb-20">
        <motion.div className="flex items-center gap-4 mb-5">
          <motion.div
            className="h-[2px] bg-nino-500/30"
            initial={{ width: 0 }}
            animate={titleInView ? { width: 60 } : {}}
            transition={{ duration: 0.8 }}
          />
          <motion.span
            className="text-nino-700/35 text-xs tracking-[0.4em] font-[var(--font-display)] font-medium"
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            OUR COLLECTION
          </motion.span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="overflow-hidden">
            <motion.h2
              className="font-[var(--font-display)] text-[clamp(3rem,7vw,5.5rem)] font-bold text-nino-950 leading-[1]"
              initial={{ y: 100 }}
              animate={titleInView ? { y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              Featured <span className="text-gradient">Denim</span>
            </motion.h2>
          </div>

          <motion.a
            href="/products"
            className="text-sm font-[var(--font-display)] font-medium tracking-[0.15em] text-nino-600 hover:text-nino-800 transition-colors flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            VIEW ALL
            <span className="inline-block">→</span>
          </motion.a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-auto">
        {displayProducts.length > 0
          ? displayProducts.map((product, i) => (
              <ProductCard key={product.id ?? i} product={product} index={i} />
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <SkeletonProductCard key={i} featured={i === 0 || i === 4} />
            ))}
      </div>

      <div className="max-w-[1400px] mx-auto mt-28">
        <div className="h-[1px] bg-nino-200/30" />
      </div>
    </section>
  );
}
