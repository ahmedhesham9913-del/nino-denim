"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: "50K+", label: "Customers Worldwide" },
  { value: "98%", label: "Organic Cotton" },
  { value: "4 Yrs", label: "Of Craftsmanship" },
  { value: "30+", label: "Countries Shipped" },
];

export default function BrandStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(sectionRef, { once: true, margin: "-100px" });


  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden bg-warm-white"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="story-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0H0v60" fill="none" stroke="oklch(0.50 0.20 240)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#story-grid)" />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left: Image — spans 7 cols, breaks upward */}
          <div
            className="lg:col-span-7 relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-nino-900/10 lg:-mt-16">
              <Image
                src="https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=1200&q=80"
                alt="Nino Jeans craftsmanship — premium denim detail"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nino-950/30 via-transparent to-transparent" />

              {/* Quality badge */}
              <motion.div
                className="absolute bottom-8 left-8 px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/20 bg-white/80 shadow-lg shadow-nino-900/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="text-[10px] text-nino-600 tracking-[0.3em] font-[var(--font-display)]">
                  CERTIFIED
                </div>
                <div className="text-lg font-[var(--font-display)] font-bold text-nino-950">
                  Premium Quality
                </div>
              </motion.div>
            </div>

            {/* Decorative accent */}
            <motion.div
              className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl border border-nino-200/40 bg-silk/60 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, type: "spring" }}
            />

            {/* Stitch accent */}
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full border-2 border-dashed border-nino-300/20" />
          </div>

          {/* Right: Content — spans 5 cols */}
          <div className="lg:col-span-5">
            <motion.div className="flex items-center gap-4 mb-6">
              <motion.div
                className="h-[1px] bg-nino-500/30"
                initial={{ width: 0 }}
                animate={titleInView ? { width: 60 } : {}}
                transition={{ duration: 0.8 }}
              />
              <motion.span
                className="text-nino-700/40 text-xs tracking-[0.4em] font-[var(--font-display)]"
                initial={{ opacity: 0 }}
                animate={titleInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
              >
                OUR STORY
              </motion.span>
            </motion.div>

            <div className="overflow-hidden mb-8">
              <motion.h2
                className="font-[var(--font-display)] text-[clamp(3rem,6vw,4.5rem)] font-bold text-nino-950 leading-[0.95]"
                initial={{ y: 80 }}
                animate={titleInView ? { y: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Denim With
                <br />
                <span className="text-gradient">A Purpose</span>
              </motion.h2>
            </div>

            <motion.p
              className="text-nino-800/50 text-lg leading-relaxed mb-6 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Every pair of Nino Jeans tells a story of dedication. From selecting
              the finest organic cotton to the final stitch, we pour our passion
              into creating denim that doesn&apos;t just look exceptional — it feels
              like a second skin.
            </motion.p>

            <motion.p
              className="text-nino-800/30 leading-relaxed mb-12 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Born from a belief that premium denim shouldn&apos;t cost the earth —
              literally. We&apos;re committed to sustainable practices, fair wages,
              and creating jeans that last a lifetime.
            </motion.p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="text-4xl font-[var(--font-display)] font-black text-nino-950 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-nino-700/35 tracking-wider font-[var(--font-display)]">
                    {stat.label}
                  </div>
                  <motion.div
                    className="h-[2px] mt-3 rounded-full origin-left"
                    style={{ background: "oklch(0.58 0.20 240 / 0.2)" }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="max-w-[1400px] mx-auto px-6 mt-8">
        <div className="h-[1px] bg-nino-200/25" />
      </div>
    </section>
  );
}
