"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const looks = [
  {
    id: 1,
    title: "The Commuter",
    subtitle: "City to rooftop, no costume change.",
    image:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200",
    details: ["Slim Fit Pro — Midnight", "Organic stretch denim", "32\" inseam"],
  },
  {
    id: 2,
    title: "After Hours",
    subtitle: "When the office lights go off and the city turns on.",
    image:
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1200",
    details: ["High Rise Sculpt — Onyx", "Sculpted silhouette", "Tapered ankle"],
  },
  {
    id: 3,
    title: "Weekend Raw",
    subtitle: "Unstructured days deserve unstructured denim.",
    image:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1200",
    details: ["Relaxed Taper — Stone", "Washed organic cotton", "Relaxed through hip"],
  },
  {
    id: 4,
    title: "Studio Session",
    subtitle: "For the ones who make things happen.",
    image:
      "https://images.pexels.com/photos/2887766/pexels-photo-2887766.jpeg?auto=compress&cs=tinysrgb&w=1200",
    details: ["Classic Straight — Indigo", "Raw selvedge denim", "Straight leg"],
  },
];

function LookCard({
  look,
  index,
}: {
  look: (typeof looks)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-15%" });

  // Alternate layout: odd cards push right, even push left
  const isOdd = index % 2 !== 0;

  return (
    <motion.div
      ref={cardRef}
      className={`grid grid-cols-12 gap-4 md:gap-0 items-center ${
        isOdd ? "md:direction-rtl" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image side — spans 7 cols */}
      <motion.div
        className={`col-span-12 md:col-span-7 relative ${
          isOdd ? "md:col-start-6" : "md:col-start-1"
        }`}
        style={{ direction: "ltr" }}
        initial={{ opacity: 0, x: isOdd ? 120 : -120 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <div className="relative overflow-hidden rounded-sm group" data-cursor-hover>
          {/* Editorial crop — cinematic ratio */}
          <div className="aspect-[16/10] relative overflow-hidden">
            <Image
              src={look.image}
              alt={look.title}
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
            {/* Film grain overlay */}
            <div
              className="absolute inset-0 mix-blend-overlay opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />
          </div>

          {/* Issue number — editorial marker */}
          <div className="absolute top-5 left-6 z-10">
            <span className="font-[var(--font-display)] text-[11px] tracking-[0.35em] text-white/50 font-medium">
              LOOK {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Bottom gradient for text legibility */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Outfit details — appear on hover */}
          <motion.div
            className="absolute bottom-6 left-6 right-6 z-10"
            initial={false}
          >
            <div className="flex flex-wrap gap-2">
              {look.details.map((detail, di) => (
                <motion.span
                  key={di}
                  className="px-3 py-1.5 text-[10px] tracking-[0.2em] text-white/80 font-[var(--font-display)] border border-white/15 backdrop-blur-md bg-white/5 rounded-sm"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + di * 0.08 }}
                >
                  {detail}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Text side — spans 5 cols, offset inward */}
      <motion.div
        className={`col-span-12 md:col-span-5 ${
          isOdd
            ? "md:col-start-1 md:row-start-1 md:pr-16 md:text-right"
            : "md:col-start-8 md:pl-16"
        }`}
        style={{ direction: "ltr" }}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      >
        {/* Oversized index */}
        <span
          className={`font-[var(--font-display)] text-[clamp(6rem,12vw,10rem)] font-black leading-none text-nino-950/[0.04] block ${
            isOdd ? "md:text-right" : ""
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="-mt-12 md:-mt-16 relative z-10">
          <h3 className="font-[var(--font-display)] text-[clamp(1.8rem,4vw,3rem)] font-bold text-nino-950 leading-[1.1] mb-3">
            {look.title}
          </h3>
          <p className="text-nino-800/35 text-base leading-relaxed max-w-sm">
            {look.subtitle}
          </p>

          <motion.a
            href="/products"
            data-cursor-hover
            className={`inline-flex items-center gap-3 mt-6 text-[12px] tracking-[0.25em] font-[var(--font-display)] font-semibold text-nino-600 hover:text-nino-800 transition-colors group/link ${
              isOdd ? "md:flex-row-reverse" : ""
            }`}
            whileHover={{ x: isOdd ? -4 : 4 }}
          >
            SHOP THIS LOOK
            <span className="w-8 h-[1px] bg-nino-500/40 group-hover/link:w-12 transition-all duration-500" />
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EditorialLookbook() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgTextX = useTransform(scrollYProgress, [0, 1], [100, -200]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-44 overflow-hidden bg-warm-white"
    >
      {/* Sliding background text */}
      <motion.div
        className="absolute top-[15%] whitespace-nowrap pointer-events-none select-none"
        style={{ x: bgTextX }}
      >
        <span className="text-[clamp(8rem,20vw,16rem)] font-[var(--font-display)] font-black text-nino-950/[0.015] tracking-tighter leading-none">
          LOOKBOOK &mdash; SS26 &mdash; LOOKBOOK &mdash; SS26
        </span>
      </motion.div>

      {/* Section header — editorial magazine style */}
      <div className="max-w-[1400px] mx-auto px-6 mb-24 md:mb-32">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-8">
            {/* Kicker */}
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="h-[1px] bg-nino-500/25"
                initial={{ width: 0 }}
                animate={headerInView ? { width: 60 } : {}}
                transition={{ duration: 1 }}
              />
              <span className="text-nino-700/35 text-[11px] tracking-[0.5em] font-[var(--font-display)] font-medium">
                THE LOOKBOOK
              </span>
            </motion.div>

            {/* Title — stacked lines with different weights */}
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: 100 }}
                animate={headerInView ? { y: 0 } : {}}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <h2 className="font-[var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-bold text-nino-950 leading-[0.92]">
                  Styled for
                </h2>
              </motion.div>
            </div>
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: 100 }}
                animate={headerInView ? { y: 0 } : {}}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08,
                }}
              >
                <h2 className="font-[var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-light text-nino-950/60 leading-[0.92] italic">
                  real life.
                </h2>
              </motion.div>
            </div>
          </div>

          {/* Right — editorial blurb */}
          <motion.div
            className="col-span-12 md:col-span-4 md:self-end md:pb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-nino-800/30 text-sm leading-relaxed max-w-xs md:ml-auto">
              Four looks. Four moments in a day that matters. Each styled around
              a single pair of Nino Jeans — because the right denim carries you
              from morning meeting to midnight.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Look cards — alternating asymmetric layout */}
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col gap-24 md:gap-36">
        {looks.map((look, i) => (
          <LookCard key={look.id} look={look} index={i} />
        ))}
      </div>
    </section>
  );
}
