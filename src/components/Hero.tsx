"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";

const cards = [
  { src: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80", alt: "Signature denim", name: "Signature Denim" },
  { src: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Classic straight", name: "Classic Straight" },
  { src: "https://images.pexels.com/photos/17745134/pexels-photo-17745134.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Slim fit pro", name: "Slim Fit Pro" },
  { src: "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "High rise sculpt", name: "High Rise Sculpt" },
  { src: "https://images.pexels.com/photos/6786614/pexels-photo-6786614.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Relaxed taper", name: "Relaxed Taper" },
  { src: "https://images.pexels.com/photos/17630811/pexels-photo-17630811.jpeg?auto=compress&cs=tinysrgb&w=600", alt: "Bootcut revival", name: "Bootcut Revival" },
  { src: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&q=80", alt: "Cargo wide leg", name: "Cargo Wide Leg" },
];

// Desktop: large radial explosion
const desktopRadial = [
  { angle: 0, distance: 280, rotation: -12 },
  { angle: 51, distance: 310, rotation: 8 },
  { angle: 103, distance: 270, rotation: -18 },
  { angle: 154, distance: 300, rotation: 14 },
  { angle: 206, distance: 290, rotation: -8 },
  { angle: 257, distance: 320, rotation: 20 },
  { angle: 309, distance: 260, rotation: -15 },
];

// Mobile: tighter radial explosion (fits small screens)
const mobileRadial = [
  { angle: 0, distance: 130, rotation: -10 },
  { angle: 51, distance: 145, rotation: 7 },
  { angle: 103, distance: 125, rotation: -14 },
  { angle: 154, distance: 140, rotation: 12 },
  { angle: 206, distance: 135, rotation: -6 },
  { angle: 257, distance: 150, rotation: 16 },
  { angle: 309, distance: 120, rotation: -12 },
];

// Desktop stacked positions
const stackPositions = [
  { x: 0, y: 0, rotation: -4, scale: 1 },
  { x: 8, y: -12, rotation: -1.5, scale: 0.97 },
  { x: 16, y: -24, rotation: 2, scale: 0.94 },
  { x: 22, y: -36, rotation: -0.5, scale: 0.91 },
  { x: 12, y: -48, rotation: 3, scale: 0.88 },
  { x: 4, y: -58, rotation: -2.5, scale: 0.85 },
  { x: 18, y: -68, rotation: 1, scale: 0.82 },
];

// Mobile stacked (tighter)
const mobileStackPositions = [
  { x: 0, y: 0, rotation: -3, scale: 1 },
  { x: 5, y: -8, rotation: -1, scale: 0.97 },
  { x: 10, y: -16, rotation: 1.5, scale: 0.94 },
  { x: 14, y: -24, rotation: -0.5, scale: 0.91 },
  { x: 8, y: -32, rotation: 2, scale: 0.88 },
  { x: 3, y: -40, rotation: -2, scale: 0.85 },
  { x: 12, y: -48, rotation: 0.5, scale: 0.82 },
];

// Phases: explode → collapse → final (text + stack on desktop, text + carousel on mobile)
type Phase = "initial" | "explode" | "collapse" | "final";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function getRadialXY(angle: number, distance: number) {
  return {
    x: Math.cos((angle * Math.PI) / 180) * distance,
    y: Math.sin((angle * Math.PI) / 180) * distance,
  };
}

// ─── Explosion Cards (shared, works on both mobile & desktop) ────────
function ExplosionCards({
  phase,
  isMobile,
}: {
  phase: Phase;
  isMobile: boolean;
}) {
  const radials = isMobile ? mobileRadial : desktopRadial;
  const stacks = isMobile ? mobileStackPositions : stackPositions;
  const containerSize = isMobile
    ? { width: "220px", height: "290px" }
    : { width: "clamp(280px, 30vw, 400px)", height: "clamp(360px, 40vw, 520px)" };

  return (
    <motion.div className="relative" style={containerSize}>
      {cards.map((card, i) => {
        const radial = radials[i];
        const { x: radX, y: radY } = getRadialXY(radial.angle, radial.distance);
        const stack = stacks[i];

        return (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/30"
            style={{ zIndex: cards.length - i }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 0 }}
            animate={
              phase === "initial"
                ? { x: 0, y: 0, scale: 0, rotate: 0, opacity: 0 }
                : phase === "explode"
                ? {
                    x: radX,
                    y: radY,
                    scale: isMobile ? 0.45 : 0.55,
                    rotate: radial.rotation,
                    opacity: 1,
                  }
                : {
                    x: stack.x,
                    y: stack.y,
                    scale: stack.scale,
                    rotate: stack.rotation,
                    opacity: 1,
                  }
            }
            transition={
              phase === "explode"
                ? { duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }
                : {
                    duration: 0.8,
                    delay: (cards.length - 1 - i) * 0.04,
                    ease: [0.33, 1, 0.68, 1],
                  }
            }
          >
            <Image
              src={card.src}
              alt={card.alt}
              fill
              sizes={isMobile ? "220px" : "30vw"}
              className="object-cover"
              priority={i < 3}
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.03_250/0.4)] to-transparent" />
          </motion.div>
        );
      })}

      {/* Stack label — desktop only in final */}
      {!isMobile && (
        <AnimatePresence>
          {phase === "final" && (
            <motion.div
              className="absolute -bottom-14 left-0 right-0 z-20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.35em] text-white/30 font-[var(--font-display)]">
                    SIGNATURE COLLECTION
                  </div>
                  <div className="text-lg font-[var(--font-display)] font-bold text-white/80">
                    7 Styles
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {["#2563eb", "#1e293b", "#78716c", "#1c1917"].map((c) => (
                    <div
                      key={c}
                      className="w-4 h-4 rounded-full border-2 border-[oklch(0.13_0.03_250)]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

// ─── Mobile Swipeable Carousel ───────────────────────────────────────
function MobileCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const CARD_W = 240;
  const GAP = 14;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      setDragging(false);
      const threshold = 40;
      if (info.offset.x < -threshold && activeIndex < cards.length - 1) {
        setActiveIndex((p) => p + 1);
      } else if (info.offset.x > threshold && activeIndex > 0) {
        setActiveIndex((p) => p - 1);
      }
    },
    [activeIndex]
  );

  const dragX = -(activeIndex * (CARD_W + GAP));

  return (
    <motion.div
      className="w-full mt-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Carousel viewport */}
      <div className="overflow-hidden mx-auto" style={{ maxWidth: CARD_W + 32 }}>
        <motion.div
          className="flex"
          style={{ gap: GAP }}
          animate={{ x: dragX }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => setDragging(true)}
          onDragEnd={handleDragEnd}
        >
          {cards.map((card, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={i}
                className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                style={{ width: CARD_W }}
                animate={{
                  scale: isActive ? 1 : 0.88,
                  opacity: isActive ? 1 : 0.35,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="240px"
                    className="object-cover pointer-events-none"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.03_250/0.65)] to-transparent" />

                  <AnimatePresence>
                    {isActive && !dragging && (
                      <motion.div
                        className="absolute bottom-4 left-4 right-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="text-[9px] tracking-[0.3em] text-white/40 font-[var(--font-display)]">
                          {String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                        </div>
                        <div className="text-base font-[var(--font-display)] font-bold text-white mt-0.5">
                          {card.name}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {cards.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className="p-1"
            onClick={() => setActiveIndex(i)}
          >
            <motion.div
              className="rounded-full"
              animate={{
                width: i === activeIndex ? 18 : 5,
                height: 5,
                backgroundColor:
                  i === activeIndex
                    ? "oklch(0.58 0.20 240)"
                    : "oklch(0.58 0.20 240 / 0.2)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Text Content Block ──────────────────────────────────────────────
function HeroText({ show, compact }: { show: boolean; compact?: boolean }) {
  return (
    <>
      {/* Kicker */}
      <AnimatePresence>
        {show && (
          <motion.div
            className={`flex items-center gap-3 ${compact ? "mb-4" : "mb-6 lg:mb-8"}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="h-[2px] bg-nino-400/50"
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            />
            <span className="text-nino-400/70 text-[10px] lg:text-[11px] tracking-[0.4em] font-[var(--font-display)] font-medium">
              PREMIUM DENIM — SPRING 2026
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heading */}
      <div className={`overflow-hidden ${compact ? "mb-0.5" : "mb-1 lg:mb-3"}`}>
        <AnimatePresence>
          {show && (
            <motion.h1
              className={`font-[var(--font-display)] font-black text-white leading-[0.88] tracking-tight ${
                compact
                  ? "text-[clamp(3rem,13vw,5rem)]"
                  : "text-[clamp(3.5rem,14vw,9rem)]"
              }`}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            >
              NINO
            </motion.h1>
          )}
        </AnimatePresence>
      </div>
      <div className={`overflow-hidden ${compact ? "mb-4" : "mb-5 lg:mb-8"}`}>
        <AnimatePresence>
          {show && (
            <motion.h1
              className={`font-[var(--font-display)] font-black leading-[0.88] tracking-tight ${
                compact
                  ? "text-[clamp(3rem,13vw,5rem)]"
                  : "text-[clamp(3.5rem,14vw,9rem)]"
              }`}
              style={{ color: "oklch(0.62 0.14 240)" }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              JEANS
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Subtext */}
      <AnimatePresence>
        {show && (
          <motion.p
            className={`text-white/30 leading-relaxed max-w-md font-light ${
              compact ? "text-sm mb-5" : "text-sm lg:text-base mb-7 lg:mb-10"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Crafted for those who refuse to blend in. Premium denim that moves
            with you — from city streets to rooftop sunsets.
          </motion.p>
        )}
      </AnimatePresence>

      {/* CTA */}
      <AnimatePresence>
        {show && (
          <motion.div
            className={`flex flex-wrap gap-3 ${compact ? "mb-6" : "mb-8 lg:mb-12"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.a
              href="/products"
              data-cursor-hover
              className="px-7 py-3.5 lg:px-8 lg:py-4 rounded-full font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white"
              style={{ background: "oklch(0.48 0.16 240)" }}
              whileHover={{ scale: 1.04, boxShadow: "0 8px 30px oklch(0.48 0.16 240 / 0.3)" }}
              whileTap={{ scale: 0.97 }}
            >
              SHOP NOW
            </motion.a>
            <motion.a
              href="#collection"
              data-cursor-hover
              className="px-7 py-3.5 lg:px-8 lg:py-4 rounded-full border border-white/12 font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white/40 hover:text-white/70 hover:border-white/25 transition-all duration-500"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              COLLECTION
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <AnimatePresence>
        {show && (
          <motion.div className="flex gap-8 lg:gap-10">
            {[
              { value: "50K+", label: "Customers" },
              { value: "200+", label: "Styles" },
              { value: "4.9", label: "Rating" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div className="text-lg lg:text-xl font-[var(--font-display)] font-bold text-white leading-tight">
                  {stat.value}
                </div>
                <div className="text-[9px] lg:text-[10px] text-white/20 tracking-[0.15em] mt-0.5 font-[var(--font-display)]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Hero ───────────────────────────────────────────────────────
export default function Hero() {
  const [phase, setPhase] = useState<Phase>("initial");
  const isMobile = useIsMobile();

  // Same animation sequence on both mobile and desktop
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("explode"), 200));
    timers.push(setTimeout(() => setPhase("collapse"), 1800));
    timers.push(setTimeout(() => setPhase("final"), 3000));
    return () => timers.forEach(clearTimeout);
  }, []);

  const showText = phase === "final" || phase === "collapse";

  return (
    <section
      className="relative min-h-dvh lg:min-h-[110vh] flex items-center overflow-hidden"
      style={{ background: "oklch(0.13 0.03 250)" }}
    >
      {/* ── Background — lightweight CSS gradient, no SVG morphing ── */}
      <div className="absolute inset-0 hero-bg" />

      {/* ── Main content ── */}
      <div className="relative z-10 w-full">
        {isMobile ? (
          /* ── MOBILE LAYOUT ──
             During explode/collapse: centered explosion animation
             During final: brand text + swipeable carousel below */
          <div className="w-full px-5 pt-24 pb-16">
            {/* Explosion plays centered, then fades out when final */}
            <AnimatePresence>
              {phase !== "final" && (
                <motion.div
                  className="flex items-center justify-center"
                  style={{ minHeight: "60vh" }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ExplosionCards phase={phase} isMobile={true} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* After explosion: text + carousel */}
            <AnimatePresence>
              {phase === "final" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <HeroText show={true} compact />
                  <MobileCarousel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ── DESKTOP LAYOUT ──
             Cards left (explosion → stack), text right */
          <div className="max-w-[1400px] mx-auto px-6 min-h-[80vh] flex items-center">
            <div className="w-full grid grid-cols-12 gap-6 items-center">
              <div className="col-span-5 relative flex items-center justify-center">
                <ExplosionCards phase={phase} isMobile={false} />
              </div>
              <div className="col-span-7 relative">
                <HeroText show={showText} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
        initial={{ opacity: 0 }}
        animate={phase === "final" ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-[9px] tracking-[0.4em] text-white/18 font-[var(--font-display)]">SCROLL</span>
        <motion.div
          className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent"
          animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-warm-white z-20 pointer-events-none" />
    </section>
  );
}
