"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const stages = [
  {
    num: "01",
    title: "Source",
    accent: "Raw Cotton",
    body: "Hand-selected organic cotton from trusted farms. No shortcuts, no synthetics — just the foundation of exceptional denim.",
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=900&q=80",
    stat: "98%",
    statLabel: "Organic",
  },
  {
    num: "02",
    title: "Weave",
    accent: "Selvedge Loom",
    body: "Woven slowly on narrow shuttle looms that produce a tighter, more durable fabric with the iconic selvedge edge.",
    image:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80",
    stat: "14oz",
    statLabel: "Weight",
  },
  {
    num: "03",
    title: "Dye",
    accent: "Indigo Dip",
    body: "Each bolt is rope-dyed through indigo vats — six passes for that deep, rich color that fades beautifully over years of wear.",
    image:
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=900&q=80",
    stat: "6x",
    statLabel: "Dipped",
  },
  {
    num: "04",
    title: "Finish",
    accent: "Final Stitch",
    body: "Cut, sewn, and finished by skilled artisans. Every seam reinforced, every detail considered. Built to last a lifetime.",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&q=80",
    stat: "200+",
    statLabel: "Stitches/in",
  },
];

function Stage({
  stage,
  index,
}: {
  stage: (typeof stages)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative">
      {/* Connecting line between stages */}
      {index < stages.length - 1 && (
        <motion.div
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full w-[1px] h-24 origin-top"
          style={{ background: "linear-gradient(to bottom, oklch(0.45 0.14 240 / 0.25), transparent)" }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        />
      )}

      <div
        className={`grid grid-cols-12 gap-6 md:gap-0 items-center ${
          isEven ? "" : "md:direction-rtl"
        }`}
      >
        {/* Image column */}
        <motion.div
          className={`col-span-12 md:col-span-6 ${
            isEven ? "md:col-start-1" : "md:col-start-7"
          }`}
          style={{ direction: "ltr" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="relative overflow-hidden rounded-sm group" data-cursor-hover>
            <div className="aspect-[4/5] relative">
              <Image
                src={stage.image}
                alt={stage.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
              {/* Color overlay — indigo tint */}
              <div className="absolute inset-0 bg-[oklch(0.18_0.08_250/0.25)] mix-blend-multiply" />
            </div>

            {/* Stage number watermark */}
            <div className="absolute bottom-4 right-6 font-[var(--font-display)] text-[8rem] md:text-[12rem] font-black text-white/[0.06] leading-none select-none pointer-events-none">
              {stage.num}
            </div>

            {/* Stat chip */}
            <motion.div
              className={`absolute top-6 ${isEven ? "right-6" : "left-6"} px-4 py-3 backdrop-blur-xl border border-white/15 bg-white/8`}
              initial={{ opacity: 0, y: -20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            >
              <div className="text-2xl font-[var(--font-display)] font-black text-white leading-none">
                {stage.stat}
              </div>
              <div className="text-[9px] tracking-[0.25em] text-white/50 font-[var(--font-display)] mt-1">
                {stage.statLabel.toUpperCase()}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Text column */}
        <motion.div
          className={`col-span-12 md:col-span-5 ${
            isEven
              ? "md:col-start-8 md:pl-8"
              : "md:col-start-1 md:row-start-1 md:pr-8 md:text-right"
          }`}
          style={{ direction: "ltr" }}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          {/* Step label */}
          <div
            className={`flex items-center gap-3 mb-6 ${
              isEven ? "" : "md:justify-end"
            }`}
          >
            <span className="font-[var(--font-display)] text-[13px] font-bold tracking-[0.3em] text-nino-400">
              {stage.num}
            </span>
            <div className="h-[1px] w-10 bg-nino-400/30" />
            <span className="text-[10px] tracking-[0.3em] text-white/30 font-[var(--font-display)]">
              {stage.accent.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <div className="overflow-hidden mb-5">
            <motion.h3
              className="font-[var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1]"
              initial={{ y: 80 }}
              animate={inView ? { y: 0 } : {}}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.4,
              }}
            >
              {stage.title}
            </motion.h3>
          </div>

          <p
            className={`text-white/30 text-base leading-relaxed max-w-sm ${
              isEven ? "" : "md:ml-auto"
            }`}
          >
            {stage.body}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function DenimJourney() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-80px" });


  return (
    <section
      ref={sectionRef}
      className="relative py-36 md:py-48 overflow-hidden"
      style={{ background: "oklch(0.13 0.03 250)" }}
    >
      {/* Top — no fade, previous section is also dark */}

      {/* Sliding background text */}
      <div
        className="absolute top-[12%] whitespace-nowrap pointer-events-none select-none"
      >
        <span className="text-[clamp(8rem,22vw,18rem)] font-[var(--font-display)] font-black text-white/[0.012] tracking-tighter leading-none">
          CRAFT &mdash; PROCESS &mdash; CRAFT &mdash; PROCESS
        </span>
      </div>

      {/* Section header */}
      <div className="max-w-[1400px] mx-auto px-6 mb-28 md:mb-40 relative z-10">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-7">
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
            >
              <motion.div
                className="h-[2px] bg-nino-400/30"
                initial={{ width: 0 }}
                animate={headerInView ? { width: 60 } : {}}
                transition={{ duration: 1 }}
              />
              <span className="text-white/20 text-[11px] tracking-[0.5em] font-[var(--font-display)] font-medium">
                THE PROCESS
              </span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                className="font-[var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-bold text-white leading-[0.92]"
                initial={{ y: 100 }}
                animate={headerInView ? { y: 0 } : {}}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                From fiber
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                className="font-[var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.92]"
                initial={{ y: 100 }}
                animate={headerInView ? { y: 0 } : {}}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08,
                }}
              >
                <span className="text-gradient-light">to forever.</span>
              </motion.h2>
            </div>
          </div>

          <motion.div
            className="col-span-12 md:col-span-4 md:col-start-9 md:self-end"
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white/20 text-sm leading-relaxed max-w-xs md:ml-auto mt-6 md:mt-0">
              Every pair of Nino Jeans passes through four stages of meticulous
              craft. No mass production. No compromise. Just denim, done right.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Journey stages */}
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col gap-28 md:gap-40 relative z-10">
        {stages.map((stage, i) => (
          <Stage key={stage.num} stage={stage} index={i} />
        ))}
      </div>

      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-warm-white z-10 pointer-events-none" />
    </section>
  );
}
