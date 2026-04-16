"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { CURRENCY } from "@/lib/delivery-zones";
import type { CartItem } from "@/lib/types";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  const lineTotal = item.quantity * item.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 py-5 border-b border-nino-200/20"
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-nino-100/30 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-[var(--font-display)] font-semibold text-nino-950 text-sm truncate">
              {item.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              {item.colorHex && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-[var(--font-display)] font-medium text-nino-700/50 bg-nino-100/50">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.colorHex }} />
                  {item.color}
                </span>
              )}
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-[var(--font-display)] font-medium text-nino-700/50 bg-nino-100/50">
                Size {item.size}
              </span>
            </div>
          </div>

          {/* Remove */}
          <motion.button
            onClick={() => removeItem(item.productId, item.color, item.size)}
            aria-label={`Remove ${item.name}`}
            className="p-1.5 rounded-lg text-nino-700/20 hover:text-red-500 hover:bg-red-50 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Qty + Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded-lg bg-nino-100/50 text-nino-700/50 hover:bg-nino-200/50 flex items-center justify-center font-[var(--font-display)] font-bold text-sm transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              -
            </motion.button>
            <span className="w-8 text-center font-[var(--font-display)] font-semibold text-nino-950 text-sm">
              {item.quantity}
            </span>
            <motion.button
              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-lg bg-nino-100/50 text-nino-700/50 hover:bg-nino-200/50 flex items-center justify-center font-[var(--font-display)] font-bold text-sm transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              +
            </motion.button>
          </div>

          <div className="text-right">
            <div className="font-[var(--font-display)] font-bold text-nino-950 text-sm">
              {lineTotal} {CURRENCY}
            </div>
            {item.quantity > 1 && (
              <div className="text-[10px] text-nino-800/25 font-[var(--font-display)]">
                {item.price} {CURRENCY} each
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
