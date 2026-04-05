"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  colors: string[];
  tag?: string;
  image: string;
  featured?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "Classic Straight",
    category: "Men's Denim",
    price: 79,
    originalPrice: 110,
    colors: ["#2563eb", "#1e293b", "#78716c"],
    tag: "BESTSELLER",
    image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: true,
  },
  {
    id: 2,
    name: "Slim Fit Pro",
    category: "Men's Denim",
    price: 89,
    originalPrice: 129,
    colors: ["#1e293b", "#2563eb", "#0f172a"],
    tag: "NEW",
    image: "https://images.pexels.com/photos/17745134/pexels-photo-17745134.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    name: "High Rise Sculpt",
    category: "Women's Denim",
    price: 95,
    originalPrice: 135,
    colors: ["#2563eb", "#0f172a", "#475569"],
    image: "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 4,
    name: "Relaxed Taper",
    category: "Unisex Denim",
    price: 85,
    originalPrice: 120,
    colors: ["#78716c", "#1e293b", "#2563eb"],
    tag: "TRENDING",
    image: "https://images.pexels.com/photos/6786614/pexels-photo-6786614.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 5,
    name: "Bootcut Revival",
    category: "Women's Denim",
    price: 92,
    originalPrice: 125,
    colors: ["#0f172a", "#2563eb", "#78716c"],
    image: "https://images.pexels.com/photos/17630811/pexels-photo-17630811.jpeg?auto=compress&cs=tinysrgb&w=800",
    featured: true,
  },
  {
    id: 6,
    name: "Cargo Wide Leg",
    category: "Men's Denim",
    price: 105,
    originalPrice: 150,
    colors: ["#2563eb", "#475569", "#1e293b"],
    tag: "LIMITED",
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80",
  },
];

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

  const isFeatured = product.featured;

  return (
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
        className="preserve-3d relative rounded-2xl overflow-hidden h-full"
        animate={{
          rotateY: mousePos.x * (isFeatured ? 5 : 8),
          rotateX: -mousePos.y * (isFeatured ? 5 : 8),
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        data-cursor-hover
      >
        {/* Image */}
        <div className={`relative overflow-hidden bg-[#f2f2f2] ${isFeatured ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes={isFeatured ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              className="object-cover"
            />
          </motion.div>

          {/* Tag */}
          {product.tag && (
            <motion.div
              className={`absolute top-5 left-5 px-4 py-2 rounded-full font-bold tracking-[0.15em] bg-white/90 text-nino-700 backdrop-blur-sm border border-nino-200/30 ${isFeatured ? "text-xs" : "text-[10px]"}`}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + 0.5, type: "spring" }}
            >
              {product.tag}
            </motion.div>
          )}

          {/* Oversized product index number — featured cards only */}
          {isFeatured && (
            <div className="absolute top-4 right-6 font-[var(--font-display)] text-[8rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
              {String(product.id).padStart(2, "0")}
            </div>
          )}

          {/* Quick actions */}
          <motion.div
            className="absolute inset-0 flex items-end p-5"
            style={{ background: "linear-gradient(to top, oklch(0.12 0.04 260 / 0.55) 0%, transparent 50%)" }}
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full flex gap-2">
              <motion.button
                className={`flex-1 rounded-xl font-[var(--font-display)] font-semibold tracking-wider text-white bg-nino-600/90 backdrop-blur-sm ${isFeatured ? "py-4 text-sm" : "py-3 text-xs"}`}
                initial={{ y: 25 }}
                animate={{ y: isHovered ? 0 : 25 }}
                transition={{ delay: 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.96 }}
              >
                ADD TO CART
              </motion.button>
              <motion.button
                aria-label="Add to wishlist"
                className={`rounded-xl border border-white/25 text-white bg-white/10 backdrop-blur-sm ${isFeatured ? "py-4 px-5" : "py-3 px-4"}`}
                initial={{ y: 25 }}
                animate={{ y: isHovered ? 0 : 25 }}
                transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.96 }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Shine sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)" }}
            animate={{ x: isHovered ? "100%" : "-100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* Card info */}
        <div className={`bg-white ${isFeatured ? "p-6" : "p-5"}`}>
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
              <div className={`font-[var(--font-display)] font-bold text-nino-600 ${isFeatured ? "text-2xl" : "text-lg"}`}>
                ${product.price}
              </div>
              <div className="text-xs text-nino-800/20 line-through">
                ${product.originalPrice}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-4">
            {product.colors.map((color, ci) => (
              <motion.div
                key={ci}
                className={`rounded-full cursor-pointer border ${isFeatured ? "w-5 h-5" : "w-4 h-4"}`}
                style={{
                  backgroundColor: color,
                  borderColor: ci === 0 ? "oklch(0.58 0.20 240 / 0.5)" : "oklch(0.88 0.02 240)",
                }}
                whileHover={{ scale: 1.4 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: "-100px" });

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
            href="#"
            data-cursor-hover
            className="text-sm font-[var(--font-display)] font-medium tracking-[0.15em] text-nino-600 hover:text-nino-800 transition-colors flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            VIEW ALL
            <motion.span
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.a>
        </div>
      </div>

      {/* Mixed-size grid — featured cards span 2 cols */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-auto">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {/* Bottom separator */}
      <div className="max-w-[1400px] mx-auto mt-28">
        <div className="h-[1px] bg-nino-200/30" />
      </div>
    </section>
  );
}
