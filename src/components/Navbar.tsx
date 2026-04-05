"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "SHOP", href: "/products" },
  { label: "COLLECTIONS", href: "#collection" },
  { label: "ABOUT", href: "#story" },
  { label: "SALE", href: "/products" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Colors that flip based on scroll
  const textColor = scrolled ? "#1a1a2e" : "#ffffff";
  const subtleColor = scrolled ? "rgba(26,26,46,0.4)" : "rgba(255,255,255,0.5)";
  const activeColor = "#3b82f6";
  const iconStroke = scrolled ? "#1a1a2e" : "#ffffff";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-nino-200/30 py-3 shadow-sm shadow-nino-900/[0.04]"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            data-cursor-hover
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden">
              <Image
                src="/logo.jpeg"
                alt="Nino Jeans"
                fill
                sizes="48px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="hidden sm:block">
              <motion.span
                className="font-[var(--font-display)] text-lg font-bold tracking-wider block leading-tight transition-colors duration-500"
                style={{ color: textColor }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                NINO JEANS
              </motion.span>
              <motion.span
                className="text-[10px] tracking-[0.3em] font-light transition-colors duration-500"
                style={{ color: scrolled ? "oklch(0.50 0.20 240)" : "oklch(0.68 0.16 240)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                PREMIUM DENIM
              </motion.span>
            </div>
          </motion.a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                data-cursor-hover
                onClick={() => setActiveLink(i)}
                className="relative px-5 py-2 text-[13px] tracking-[0.2em] font-[var(--font-display)] font-medium transition-colors duration-500"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ color: activeColor }}
                style={{ color: activeLink === i ? activeColor : subtleColor }}
              >
                {link.label}
                {activeLink === i && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-nino-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <motion.button
              aria-label="Search products"
              data-cursor-hover
              className={`p-2 rounded-full transition-colors ${scrolled ? "hover:bg-nino-100/50" : "hover:bg-white/10"}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-500">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </motion.button>

            <motion.button
              aria-label="Shopping bag, 3 items"
              data-cursor-hover
              className={`relative p-2 rounded-full transition-colors ${scrolled ? "hover:bg-nino-100/50" : "hover:bg-white/10"}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-500">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-nino-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                3
              </span>
            </motion.button>

            {/* Mobile Menu */}
            <motion.button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="md:hidden p-2"
              data-cursor-hover
              onClick={() => setMobileOpen(!mobileOpen)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex flex-col gap-1.5">
                <motion.span
                  className="block w-6 h-[2px] origin-center transition-colors duration-500"
                  style={{ backgroundColor: iconStroke }}
                  animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="block w-6 h-[2px] transition-colors duration-500"
                  style={{ backgroundColor: iconStroke }}
                  animate={mobileOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block w-6 h-[2px] origin-center transition-colors duration-500"
                  style={{ backgroundColor: iconStroke }}
                  animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                data-cursor-hover
                onClick={() => { setActiveLink(i); setMobileOpen(false); }}
                className="text-3xl font-[var(--font-display)] font-bold tracking-[0.2em] text-nino-950 hover:text-nino-500 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
