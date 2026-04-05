"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden"
      style={{ background: "oklch(0.96 0.008 250)" }}
    >
      {/* Subtle background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "oklch(0.78 0.12 240 / 0.08)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          className="flex items-center justify-center gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-[1px] bg-nino-500/20"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ duration: 0.8 }}
          />
          <span className="text-nino-700/35 text-xs tracking-[0.4em] font-[var(--font-display)]">
            STAY UPDATED
          </span>
          <motion.div
            className="h-[1px] bg-nino-500/20"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ duration: 0.8 }}
          />
        </motion.div>

        <div className="overflow-hidden mb-6">
          <motion.h2
            className="font-[var(--font-display)] text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-nino-950 leading-[1]"
            initial={{ y: 60 }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Join the <span className="text-gradient">Nino</span> Family
          </motion.h2>
        </div>

        <motion.p
          className="text-nino-800/35 mb-10 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          Get exclusive drops, early access to sales, and 15% off your first order.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="relative max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {!submitted ? (
            <div className="relative group">
              <input
                type="email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-6 py-4 pr-36 rounded-full bg-white border border-nino-200/50 text-nino-950 placeholder:text-nino-800/25 focus:outline-none focus:border-nino-400/50 focus:ring-2 focus:ring-nino-500/10 transition-all shadow-sm shadow-nino-900/[0.03] font-[var(--font-body)]"
                required
              />
              <motion.button
                type="submit"
                data-cursor-hover
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full font-[var(--font-display)] text-sm font-semibold tracking-wider text-white bg-nino-600 hover:bg-nino-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                JOIN
              </motion.button>
            </div>
          ) : (
            <motion.div
              className="py-4 px-6 rounded-full border border-nino-300/30 text-nino-700 font-[var(--font-display)] tracking-wider bg-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              Welcome to the family! Check your inbox.
            </motion.div>
          )}
        </motion.form>
      </div>
    </section>
  );
}
