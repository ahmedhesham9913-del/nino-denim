"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { CURRENCY } from "@/lib/delivery-zones";
import type { CartItem } from "@/lib/types";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SIGNATURE_EASE = [0.16, 1, 0.3, 1] as const;

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: SIGNATURE_EASE }}
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-white rounded-l-2xl shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: SIGNATURE_EASE }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-nino-200/40">
              <h2 className="font-[var(--font-display)] text-lg font-bold tracking-[0.15em] text-nino-950">
                YOUR BAG
              </h2>
              <button
                onClick={onClose}
                aria-label="Close bag"
                className="p-2 rounded-full hover:bg-nino-100/60 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-nino-950"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-nino-300"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p className="font-[var(--font-display)] text-sm tracking-[0.15em] text-nino-400">
                  Your bag is empty
                </p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="font-[var(--font-display)] text-xs tracking-[0.2em] font-semibold text-nino-950 border border-nino-950 rounded-full px-8 py-3 hover:bg-nino-950 hover:text-white transition-colors duration-300"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.map((item: CartItem) => (
                    <motion.div
                      key={`${item.productId}-${item.color}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.3, ease: SIGNATURE_EASE }}
                      className="flex gap-4"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-nino-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-[var(--font-display)] text-sm font-semibold text-nino-950 tracking-wide truncate">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.productId, item.color, item.size)}
                            aria-label={`Remove ${item.name}`}
                            className="p-1 rounded-full hover:bg-nino-100/60 transition-colors flex-shrink-0"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-nino-400"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          {item.colorHex && (
                            <span className="inline-flex items-center gap-1 font-[var(--font-display)] text-[10px] tracking-[0.1em] font-medium text-nino-500 bg-nino-100 rounded-full px-2.5 py-0.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.colorHex }} />
                              {item.color}
                            </span>
                          )}
                          <span className="font-[var(--font-display)] text-[10px] tracking-[0.1em] font-medium text-nino-500 bg-nino-100 rounded-full px-2.5 py-0.5">
                            {item.size}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.color,
                                  item.size,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Decrease quantity"
                              className="w-6 h-6 rounded-full border border-nino-200 flex items-center justify-center text-nino-500 hover:border-nino-400 transition-colors text-xs"
                            >
                              -
                            </button>
                            <span className="font-[var(--font-display)] text-xs font-semibold text-nino-950 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.color,
                                  item.size,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Increase quantity"
                              className="w-6 h-6 rounded-full border border-nino-200 flex items-center justify-center text-nino-500 hover:border-nino-400 transition-colors text-xs"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-[var(--font-display)] text-sm font-bold text-nino-950">
                            {item.price * item.quantity} {CURRENCY}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-nino-200/40 px-6 py-5 space-y-4">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="font-[var(--font-display)] text-xs tracking-[0.15em] text-nino-500 font-medium">
                      SUBTOTAL
                    </span>
                    <span className="font-[var(--font-display)] text-base font-bold text-nino-950">
                      {totalPrice()} {CURRENCY}
                    </span>
                  </div>

                  {/* View Cart */}
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="block w-full text-center font-[var(--font-display)] text-xs tracking-[0.2em] font-semibold text-nino-950 border border-nino-950 rounded-full py-3.5 hover:bg-nino-950 hover:text-white transition-colors duration-300"
                  >
                    VIEW CART
                  </Link>

                  {/* Checkout */}
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full text-center font-[var(--font-display)] text-xs tracking-[0.2em] font-semibold text-white bg-nino-950 rounded-full py-3.5 hover:bg-nino-800 transition-colors duration-300"
                  >
                    CHECKOUT
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
