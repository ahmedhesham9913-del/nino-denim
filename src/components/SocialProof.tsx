"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Maren K.",
    role: "Creative Director, Berlin",
    text: "I've worn a lot of premium denim. Nino is the first brand where I forgot I was wearing jeans — they just became part of me. The Slim Fit Pro is genuinely flawless.",
    rating: 5,
    product: "Slim Fit Pro",
    featured: true,
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    name: "Jordan T.",
    role: "Architect, NYC",
    text: "The selvedge detail is incredible. Three months in and the fade pattern is already looking like vintage.",
    rating: 5,
    product: "Classic Straight",
    avatar:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    name: "Aisha R.",
    role: "Product Designer, London",
    text: "Finally, a high-rise that actually sculpts without squeezing. I bought two more pairs within a week.",
    rating: 5,
    product: "High Rise Sculpt",
    avatar:
      "https://images.pexels.com/photos/3756985/pexels-photo-3756985.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 4,
    name: "Tomás G.",
    role: "Photographer, Lisbon",
    text: "The relaxed taper gives me that effortless look without looking sloppy. Perfect for long shoot days.",
    rating: 5,
    product: "Relaxed Taper",
    avatar:
      "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

const ugcImages = [
  {
    src: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600",
    handle: "@marenkstudio",
  },
  {
    src: "https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=600",
    handle: "@jordanarch",
  },
  {
    src: "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=600",
    handle: "@aisha.wears",
  },
  {
    src: "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=600",
    handle: "@tomas.shoots",
  },
  {
    src: "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=600",
    handle: "@stylebyline",
  },
  {
    src: "https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=600",
    handle: "@ninojeans",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="oklch(0.58 0.20 240)"
          className="text-nino-500"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function SocialProof() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ugcY = useTransform(scrollYProgress, [0.5, 1], [0, -40]);

  const featured = testimonials.find((t) => t.featured)!;
  const others = testimonials.filter((t) => !t.featured);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-44 overflow-hidden bg-warm-white"
    >
      {/* Section header */}
      <div className="max-w-[1400px] mx-auto px-6 mb-20 md:mb-28">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-8">
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
            >
              <motion.div
                className="h-[1px] bg-nino-500/25"
                initial={{ width: 0 }}
                animate={headerInView ? { width: 60 } : {}}
                transition={{ duration: 1 }}
              />
              <span className="text-nino-700/35 text-[11px] tracking-[0.5em] font-[var(--font-display)] font-medium">
                VOICES
              </span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                className="font-[var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-bold text-nino-950 leading-[0.92]"
                initial={{ y: 100 }}
                animate={headerInView ? { y: 0 } : {}}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                Worn by
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                className="font-[var(--font-display)] text-[clamp(3rem,8vw,6rem)] font-light text-nino-950/50 leading-[0.92] italic"
                initial={{ y: 100 }}
                animate={headerInView ? { y: 0 } : {}}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08,
                }}
              >
                real people.
              </motion.h2>
            </div>
          </div>

          {/* Aggregate rating */}
          <motion.div
            className="col-span-12 md:col-span-3 md:col-start-10 md:self-end"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-baseline gap-2 mt-6 md:mt-0 md:justify-end">
              <span className="font-[var(--font-display)] text-5xl font-black text-nino-950">
                4.9
              </span>
              <span className="text-nino-800/25 text-sm font-[var(--font-display)]">
                / 5
              </span>
            </div>
            <div className="md:text-right mt-1">
              <span className="text-[11px] tracking-[0.2em] text-nino-700/30 font-[var(--font-display)]">
                FROM 2,400+ REVIEWS
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials — asymmetric layout */}
      <div className="max-w-[1400px] mx-auto px-6 mb-28 md:mb-36">
        <div className="grid grid-cols-12 gap-6">
          {/* Featured testimonial — large, spans 7 cols */}
          <motion.div
            className="col-span-12 md:col-span-7 relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative p-8 md:p-12 border border-nino-200/40 bg-white/60 rounded-sm">
              {/* Large quote mark */}
              <div className="absolute top-6 right-8 font-[var(--font-display)] text-[8rem] leading-none text-nino-200/20 select-none pointer-events-none">
                &ldquo;
              </div>

              <div className="relative z-10">
                <StarRating count={featured.rating} />

                <blockquote className="font-[var(--font-display)] text-[clamp(1.3rem,3vw,2rem)] font-medium text-nino-950 leading-[1.35] mt-6 mb-8 max-w-2xl">
                  &ldquo;{featured.text}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={featured.avatar}
                      alt={featured.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-[var(--font-display)] font-semibold text-nino-950 text-sm">
                      {featured.name}
                    </div>
                    <div className="text-[11px] text-nino-800/30 tracking-wider font-[var(--font-display)]">
                      {featured.role}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] tracking-[0.2em] text-nino-600 font-[var(--font-display)] font-medium px-3 py-1.5 border border-nino-200/50 rounded-sm">
                      {featured.product.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Smaller testimonials — stacked in 5 cols */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-5">
            {others.map((t, i) => (
              <motion.div
                key={t.id}
                className="relative p-6 border border-nino-200/30 bg-white/40 rounded-sm"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <StarRating count={t.rating} />

                <p className="text-nino-950/70 text-sm leading-relaxed mt-3 mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-[var(--font-display)] font-semibold text-nino-950 text-[13px]">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-nino-800/25 tracking-wider">
                      {t.role}
                    </div>
                  </div>
                  <span className="ml-auto text-[9px] tracking-[0.15em] text-nino-500/60 font-[var(--font-display)]">
                    {t.product.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram-style UGC gallery */}
      <motion.div style={{ y: ugcY }}>
        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-nino-700/35 text-[11px] tracking-[0.4em] font-[var(--font-display)] font-medium">
              @NINOJEANS
            </span>
            <div className="h-[1px] flex-1 bg-nino-200/30" />
            <span className="text-nino-800/20 text-[11px] tracking-[0.2em] font-[var(--font-display)]">
              TAGGED BY YOU
            </span>
          </motion.div>
        </div>

        {/* Full-bleed image strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {ugcImages.map((img, i) => (
            <motion.div
              key={i}
              className="relative aspect-square overflow-hidden group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: i * 0.06,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              data-cursor-hover
            >
              <Image
                src={img.src}
                alt={`Styled by ${img.handle}`}
                fill
                sizes="(max-width: 768px) 33vw, 16.6vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
              />
              {/* Hover overlay with handle */}
              <div className="absolute inset-0 bg-[oklch(0.12_0.04_260/0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-[11px] tracking-[0.15em] font-[var(--font-display)] font-medium">
                  {img.handle}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
