"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const models = [
  { src: "/model-1.png", alt: "Model in denim — look 1" },
  { src: "/model-2.png", alt: "Model in denim — look 2" },
  { src: "/model-3.png", alt: "Model in denim — look 3" },
];

const featuredProducts = [
  {
    name: "Slim Fit Pro",
    price: "$89",
    desc: "Our most versatile slim fit. Crafted from premium organic stretch denim with a modern tapered leg.",
    image: "https://images.pexels.com/photos/17745134/pexels-photo-17745134.jpeg?auto=compress&cs=tinysrgb&w=800",
    pairWith: [
      { name: "Denim Jacket", image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=200" },
      { name: "Canvas Belt", image: "https://images.pexels.com/photos/6786614/pexels-photo-6786614.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
  },
  {
    name: "High Rise Sculpt",
    price: "$95",
    desc: "Sculpted silhouette with a high-rise waist that flatters every body type. Tapered ankle with raw hem.",
    image: "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=800",
    pairWith: [
      { name: "Cropped Tee", image: "https://images.pexels.com/photos/17630811/pexels-photo-17630811.jpeg?auto=compress&cs=tinysrgb&w=200" },
      { name: "Sneakers", image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
  },
  {
    name: "Classic Straight",
    price: "$79",
    desc: "The timeless straight leg. Relaxed through the hip with a clean straight cut. Our bestseller.",
    image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800",
    pairWith: [
      { name: "Henley Shirt", image: "https://images.pexels.com/photos/6786614/pexels-photo-6786614.jpeg?auto=compress&cs=tinysrgb&w=200" },
      { name: "Boots", image: "https://images.pexels.com/photos/17745134/pexels-photo-17745134.jpeg?auto=compress&cs=tinysrgb&w=200" },
    ],
  },
];

// ─── 3D Tilt Product Card (matches main ProductCards style) ──────────
function TiltProductCard({ product, index, onSelect }: {
  product: typeof featuredProducts[0]; index: number; onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="perspective-1000"
      initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      onClick={onSelect}
    >
      <motion.div
        className="preserve-3d relative rounded-2xl overflow-hidden bg-white cursor-pointer"
        animate={{ rotateY: mousePos.x * 8, rotateX: -mousePos.y * 8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Image — shifts up on hover */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[oklch(0.96_0.005_240)]">
          <motion.div
            className="absolute inset-0"
            animate={{ y: isHovered ? -30 : 0, scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover"
            />
          </motion.div>

          {/* Shine sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)" }}
            animate={{ x: isHovered ? "100%" : "-100%" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        </div>

        {/* Info */}
        <div className="px-5 pt-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] text-nino-800/25 tracking-[0.15em] font-[var(--font-display)] mb-1">
                {product.name === "Slim Fit Pro" ? "MEN'S DENIM" : product.name === "High Rise Sculpt" ? "WOMEN'S DENIM" : "UNISEX DENIM"}
              </p>
              <h4 className="font-[var(--font-display)] text-base font-semibold text-nino-950">
                {product.name}
              </h4>
            </div>
            <div className="text-right">
              <div className="font-[var(--font-display)] text-lg font-bold text-nino-600">{product.price}</div>
            </div>
          </div>

          {/* Expandable details */}
          <div
            className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ gridTemplateRows: isHovered ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="pt-4 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] tracking-[0.2em] text-nino-800/30 font-[var(--font-display)] font-semibold">COLOR</span>
                  <div className="flex gap-2">
                    {["#2563eb", "#1e293b", "#78716c"].map((c, ci) => (
                      <div key={ci} className={`w-5 h-5 rounded-full border-2 cursor-pointer ${ci === 0 ? "border-nino-500/50" : "border-nino-200/60"}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl font-[var(--font-display)] text-xs font-semibold tracking-[0.12em] text-white bg-nino-950 hover:bg-nino-800 active:scale-[0.98] transition-all duration-200">
                  VIEW DETAILS
                </button>
              </div>
            </div>
          </div>

          {/* Default bottom */}
          <div
            className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ gridTemplateRows: isHovered ? "0fr" : "1fr" }}
          >
            <div className="overflow-hidden">
              <div className="flex gap-2 pb-5">
                {["#2563eb", "#1e293b", "#78716c"].map((c, ci) => (
                  <div key={ci} className="w-4 h-4 rounded-full border" style={{ backgroundColor: c, borderColor: ci === 0 ? "oklch(0.58 0.20 240 / 0.5)" : "oklch(0.88 0.02 240)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Section 1: Hero — model walks through/behind the heading text ──
function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent((p) => (p + 1) % models.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: "oklch(0.965 0.008 240)" }}>
      <div className="relative max-w-[1400px] mx-auto px-6 min-h-screen flex items-center">

        {/* ── LAYER 1 (back): Heading text ── */}
        <div className="relative z-10 w-full">
          <motion.p
            className="text-[10px] tracking-[0.5em] text-nino-600/40 font-[var(--font-display)] font-medium mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            SPRING / SUMMER 2026
          </motion.p>

          <motion.h2
            className="font-[var(--font-display)] text-[clamp(3.5rem,10vw,8rem)] font-bold text-nino-950 leading-[0.88] mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Premium
            <br />
            <span className="text-nino-950/30 font-light">Denim</span>
            <br />
            Collection
          </motion.h2>

          <motion.p
            className="text-nino-800/30 text-sm leading-relaxed max-w-xs mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Crafted for the modern generation. Every pair tells a story of dedication, comfort, and style.
          </motion.p>

          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <a
              href="/products"
              className="inline-block px-8 py-3.5 rounded-full font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white"
              style={{ background: "oklch(0.48 0.16 240)" }}
            >
              EXPLORE
            </a>

            {/* Dots inline */}
            <div className="flex gap-2">
              {models.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} aria-label={`Model ${i + 1}`} className="p-0.5">
                  <div className="rounded-full transition-all duration-300" style={{
                    width: i === current ? 22 : 7, height: 7,
                    backgroundColor: i === current ? "oklch(0.48 0.16 240)" : "oklch(0.48 0.16 240 / 0.2)",
                  }} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── LAYER 2 (front): Model — 3D walk-through animation ── */}
        <div
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          style={{ perspective: "1200px" }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current}
              className="absolute bottom-0 right-[10%] lg:right-[15%] h-[88vh] w-[50vw] max-w-[550px]"
              // Enters from the right, small & rotated (far away) → walks toward camera → settles center
              initial={{
                x: "60%",
                scale: 0.7,
                rotateY: -25,
                opacity: 0,
              }}
              animate={{
                x: "0%",
                scale: 1,
                rotateY: 0,
                opacity: 1,
              }}
              // Exits walking past to the left, growing slightly (passing camera)
              exit={{
                x: "-80%",
                scale: 1.1,
                rotateY: 15,
                opacity: 0,
              }}
              transition={{
                duration: 1.4,
                ease: [0.25, 1, 0.5, 1],
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Image
                src={models[current].src}
                alt={models[current].alt}
                fill
                sizes="(max-width: 1024px) 70vw, 50vw"
                className="object-contain object-bottom drop-shadow-2xl"
                priority
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Model name label ── */}
        <div className="absolute bottom-8 right-8 z-30">
          <AnimatePresence mode="wait">
            <motion.span
              key={current}
              className="text-[10px] tracking-[0.3em] text-nino-800/20 font-[var(--font-display)] font-medium"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              LOOK {String(current + 1).padStart(2, "0")} / {String(models.length).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: Product cards ───────────────────────────────────────
function ProductCardsSection({ onSelect }: { onSelect: (i: number) => void }) {
  return (
    <section className="py-28 px-6" style={{ background: "oklch(0.965 0.008 240)" }}>
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] tracking-[0.5em] text-nino-600/40 font-[var(--font-display)] font-medium mb-3">
            CURATED FOR YOU
          </p>
          <h3 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-bold text-nino-950 leading-[1.1]">
            Hottest Picks Of
            <br />
            The Season
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {featuredProducts.map((product, i) => (
            <TiltProductCard key={product.name} product={product} index={i} onSelect={() => onSelect(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Product detail ──────────────────────────────────────
function ProductDetailSection({ activeProduct, onSelect }: { activeProduct: number; onSelect: (i: number) => void }) {
  const product = featuredProducts[activeProduct];

  return (
    <section className="py-28 px-6" style={{ background: "oklch(0.965 0.008 240)" }}>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left: Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-bold text-nino-950 leading-[1.05] mb-4">
                {product.name}
              </h3>
              <p className="text-nino-800/35 text-sm leading-relaxed max-w-md mb-6">
                {product.desc}
              </p>

              <div className="flex items-center gap-6 mb-8">
                <span className="font-[var(--font-display)] text-3xl font-black text-nino-950">
                  {product.price}
                </span>
                <a
                  href="/products"
                  className="px-7 py-3 rounded-full font-[var(--font-display)] text-xs font-semibold tracking-[0.15em] text-white"
                  style={{ background: "oklch(0.48 0.16 240)" }}
                >
                  ADD TO BAG
                </a>
              </div>

              {/* Pair with */}
              <p className="text-[10px] tracking-[0.3em] text-nino-800/25 font-[var(--font-display)] font-medium mb-3">
                PAIR IT WITH
              </p>
              <div className="flex gap-3">
                {product.pairWith.map((item) => (
                  <div key={item.name}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-nino-100/40 relative">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <p className="text-[9px] text-nino-800/25 font-[var(--font-display)] mt-1.5 text-center">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Product selector */}
          <div className="flex gap-2 mt-8">
            {featuredProducts.map((p, i) => (
              <button key={i} onClick={() => onSelect(i)} aria-label={p.name} className="p-0.5">
                <div className="rounded-full transition-all duration-300" style={{
                  width: i === activeProduct ? 22 : 7, height: 7,
                  backgroundColor: i === activeProduct ? "oklch(0.48 0.16 240)" : "oklch(0.78 0.06 240)",
                }} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right: Large image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct}
              className="relative aspect-[3/4] max-h-[75vh] rounded-3xl overflow-hidden bg-nino-100/30"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main: 3 simple stacked sections ────────────────────────────────
export default function EditorialLookbook() {
  const [activeProduct, setActiveProduct] = useState(0);

  return (
    <>
      <HeroSection />
      <ProductCardsSection onSelect={setActiveProduct} />
      <ProductDetailSection activeProduct={activeProduct} onSelect={setActiveProduct} />
    </>
  );
}
