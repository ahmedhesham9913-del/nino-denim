"use client";

import { motion } from "framer-motion";

export default function Marquee() {
  const items = [
    "PREMIUM DENIM",
    "HANDCRAFTED",
    "SUSTAINABLE",
    "NINO JEANS",
    "SINCE 2024",
    "FREE SHIPPING",
  ];

  const repeated = [...items, ...items, ...items];

  return (
    <div className="relative py-8 overflow-hidden bg-warm-white border-y border-nino-200/20">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-warm-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-warm-white to-transparent z-10" />

      <motion.div
        className="flex items-center gap-12 whitespace-nowrap"
        animate={{ x: [0, "-33.33%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="font-[var(--font-display)] text-[clamp(1rem,2.5vw,1.5rem)] tracking-[0.25em] text-nino-900/30 font-bold uppercase flex items-center gap-12"
          >
            {item}
            <span className="w-2 h-2 rounded-full bg-nino-500/30 inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
