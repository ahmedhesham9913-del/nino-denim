"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import CartItemRow from "@/components/CartItemRow";
import Footer from "@/components/Footer";
import { CURRENCY } from "@/lib/delivery-zones";

export default function CartPage() {
  const { items, totalItems, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Your Cart | NINO JEANS";
  }, []);

  if (!mounted) return null;

  const isEmpty = items.length === 0;

  return (
    <>
      <div className="min-h-screen pt-28 pb-16 px-6" style={{ background: "oklch(0.97 0.006 250)" }}>
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 mb-6 text-xs font-[var(--font-display)] text-nino-700/25">
              <Link href="/" className="hover:text-nino-700/50 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-nino-800/50">Cart</span>
            </div>

            <h1 className="font-[var(--font-display)] text-[clamp(2.5rem,6vw,4rem)] font-bold text-nino-950 leading-[1] mb-2">
              Your <span className="text-gradient">Cart</span>
            </h1>
            {!isEmpty && (
              <p className="text-nino-800/25 text-sm font-[var(--font-display)] mb-10">
                {totalItems()} item{totalItems() !== 1 ? "s" : ""}
              </p>
            )}
          </motion.div>

          {isEmpty ? (
            /* Empty state */
            <motion.div
              className="flex flex-col items-center justify-center py-24 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-24 h-24 rounded-2xl bg-nino-100/40 flex items-center justify-center mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-nino-400">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h2 className="font-[var(--font-display)] text-2xl font-bold text-nino-950 mb-2">
                Your cart is empty
              </h2>
              <p className="text-nino-800/30 mb-8 max-w-sm">
                Looks like you haven&apos;t added any denim to your collection yet.
              </p>
              <Link
                href="/products"
                className="px-8 py-3.5 rounded-full font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white"
                style={{ background: "oklch(0.48 0.16 240)" }}
              >
                CONTINUE SHOPPING
              </Link>
            </motion.div>
          ) : (
            /* Cart content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Items list */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItemRow key={`${item.productId}-${item.size}`} item={item} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="sticky top-28 p-6 rounded-2xl border border-nino-200/30 bg-white/60">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-nino-800/40 mb-6">
                    ORDER SUMMARY
                  </h3>

                  <div className="flex justify-between mb-3 text-sm">
                    <span className="text-nino-800/40">Subtotal ({totalItems()} items)</span>
                    <span className="font-[var(--font-display)] font-semibold text-nino-950">
                      {totalPrice()} {CURRENCY}
                    </span>
                  </div>

                  <div className="flex justify-between mb-6 text-sm">
                    <span className="text-nino-800/40">Delivery</span>
                    <span className="text-nino-800/30 text-xs">Calculated at checkout</span>
                  </div>

                  <div className="h-[1px] bg-nino-200/30 mb-6" />

                  <div className="flex justify-between mb-8">
                    <span className="font-[var(--font-display)] font-semibold text-nino-950">Total</span>
                    <span className="font-[var(--font-display)] text-xl font-bold text-nino-950">
                      {totalPrice()} {CURRENCY}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full py-4 rounded-xl font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white text-center bg-nino-950 hover:bg-nino-800 transition-colors"
                  >
                    PROCEED TO CHECKOUT
                  </Link>

                  <Link
                    href="/products"
                    className="block w-full py-3 mt-3 rounded-xl font-[var(--font-display)] text-xs font-medium tracking-[0.15em] text-nino-700/40 text-center border border-nino-200/30 hover:border-nino-300/50 transition-colors"
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
