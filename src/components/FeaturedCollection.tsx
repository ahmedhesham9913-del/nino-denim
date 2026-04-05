"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const collections = [
  {
    name: "Street Heritage",
    pieces: 24,
    season: "Spring '26",
    image: "https://images.pexels.com/photos/18591712/pexels-photo-18591712.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Urban Edge",
    pieces: 18,
    season: "Spring '26",
    image: "https://images.pexels.com/photos/8991032/pexels-photo-8991032.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Raw Selvedge",
    pieces: 12,
    season: "Limited",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
  },
  {
    name: "Vintage Wash",
    pieces: 20,
    season: "Core",
    image: "https://images.pexels.com/photos/9502500/pexels-photo-9502500.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Dark Indigo",
    pieces: 16,
    season: "Year-Round",
    image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
  },
];

export default function FeaturedCollection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: "-80px" });


  return (
    <section
      id="collection"
      ref={sectionRef}
      className="relative py-36 overflow-hidden"
      style={{ background: "oklch(0.13 0.03 250)" }}
    >
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-warm-white to-transparent z-10 pointer-events-none" />

      {/* Giant sliding background text */}
      <div
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none select-none"
      >
        <span className="text-[clamp(10rem,25vw,20rem)] font-[var(--font-display)] font-black text-white/[0.015] tracking-tighter leading-none">
          COLLECTIONS &mdash; COLLECTIONS &mdash; COLLECTIONS
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mb-16 relative z-10">
        <motion.div className="flex items-center gap-4 mb-5">
          <motion.div
            className="h-[2px] bg-white/12"
            initial={{ width: 0 }}
            animate={titleInView ? { width: 60 } : {}}
            transition={{ duration: 0.8 }}
          />
          <motion.span
            className="text-white/25 text-xs tracking-[0.4em] font-[var(--font-display)] font-medium"
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            COLLECTIONS
          </motion.span>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h2
            className="font-[var(--font-display)] text-[clamp(3rem,7vw,5.5rem)] font-bold text-white leading-[1]"
            initial={{ y: 100 }}
            animate={titleInView ? { y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Explore <span className="text-gradient-light">Collections</span>
          </motion.h2>
        </div>
      </div>

      {/* Horizontal scroll with numbered cards */}
      <div
        className="flex gap-5 overflow-x-auto px-6 pb-6 snap-x snap-mandatory relative z-10"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: "max(1.5rem, calc((100vw - 1400px) / 2 + 1.5rem))",
        }}
      >
        {collections.map((col, i) => (
          <motion.div
            key={col.name}
            className="flex-shrink-0 w-[320px] md:w-[380px] snap-start group"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            data-cursor-hover
          >
            <div className="relative rounded-2xl overflow-hidden">
              <motion.div
                className="aspect-[3/4] relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 320px, 380px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.03_250/0.85)] via-[oklch(0.08_0.03_250/0.2)] to-transparent" />

                {/* OVERSIZED collection number */}
                <div className="absolute top-3 right-5 font-[var(--font-display)] text-[7rem] md:text-[9rem] font-black text-white/[0.05] leading-none select-none pointer-events-none">
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Season tag */}
                <div className="absolute top-5 left-5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 bg-white/8">
                  <span className="text-[10px] text-white/70 tracking-[0.2em] font-[var(--font-display)] font-medium">
                    {col.season.toUpperCase()}
                  </span>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-[var(--font-display)] text-2xl font-bold text-white mb-1">
                    {col.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/35">{col.pieces} pieces</p>
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/8 backdrop-blur-sm"
                      whileHover={{ scale: 1.15, backgroundColor: "rgba(59,130,246,0.5)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subtle divider — next section is also dark */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/[0.04] z-10" />
    </section>
  );
}
