"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const footerLinks = [
  { title: "SHOP", links: ["Men", "Women", "Kids", "New Arrivals", "Sale"] },
  { title: "COMPANY", links: ["About Us", "Sustainability", "Careers", "Press"] },
  { title: "HELP", links: ["Size Guide", "Shipping", "Returns", "Contact Us"] },
];

const socials = [
  { name: "Instagram", icon: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z" },
  { name: "Twitter", icon: "M22.46 6c-.77.35-1.6.58-2.46.69a4.28 4.28 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.29 3.9A12.14 12.14 0 013.16 4.86a4.28 4.28 0 001.32 5.71 4.24 4.24 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.19 4.3 4.3 0 01-1.93.07 4.28 4.28 0 004 2.97A8.58 8.58 0 012 19.54a12.1 12.1 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2l-.01-.56A8.72 8.72 0 0022.46 6z" },
  { name: "TikTok", icon: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.89 2.89 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.8.1V9.4a6.33 6.33 0 00-.8-.05A6.34 6.34 0 003.14 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.77 1.52V7.44a4.85 4.85 0 01-1-.75z" },
];

export default function Footer() {
  return (
    <footer
      className="relative pt-20 pb-8 px-6"
      style={{ background: "oklch(0.13 0.03 250)" }}
    >
      {/* Top fade from newsletter */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, oklch(0.96 0.008 250), oklch(0.13 0.03 250))" }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16 pt-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                <Image src="/logo.jpeg" alt="Nino Jeans" fill sizes="40px" className="object-cover" />
              </div>
              <div>
                <span className="font-[var(--font-display)] text-lg font-bold tracking-wider text-white block leading-tight">
                  NINO JEANS
                </span>
                <span className="text-[9px] tracking-[0.3em] text-white/25">PREMIUM DENIM</span>
              </div>
            </motion.div>

            <motion.p
              className="text-white/25 max-w-xs leading-relaxed text-sm mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Crafted for those who refuse to blend in. Premium denim that
              moves with you, from the first wear to the last adventure.
            </motion.p>

            <div className="flex gap-3">
              {socials.map((social, i) => (
                <motion.a
                  key={social.name}
                  href="#"
                  aria-label={`Follow us on ${social.name}`}
                  data-cursor-hover
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <svg aria-hidden="true" width="16" height="16" fill="currentColor" className="text-white/40" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col, ci) => (
            <div key={col.title}>
              <motion.h4
                className="font-[var(--font-display)] text-xs font-semibold tracking-[0.3em] text-white/30 mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.1 }}
              >
                {col.title}
              </motion.h4>
              <ul className="space-y-3">
                {col.links.map((link, li) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: ci * 0.1 + li * 0.05 }}
                  >
                    <a
                      href="#"
                      data-cursor-hover
                      className="text-sm text-white/20 hover:text-white/60 transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <motion.div
          className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-white/15 font-[var(--font-display)]">
            &copy; 2026 Nino Jeans. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                data-cursor-hover
                className="text-xs text-white/15 hover:text-white/40 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
