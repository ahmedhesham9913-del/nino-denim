"use client";

import { motion } from "framer-motion";
import type { VariantSize } from "@/lib/types";

interface SizeSelectorProps {
  sizes: VariantSize[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div>
      <span className="text-[11px] tracking-[0.2em] text-nino-800/35 font-[var(--font-display)] font-semibold block mb-3">
        SIZE
      </span>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const count = size.stock;
          const isOut = count === 0;
          const isSelected = selectedSize === size.value;

          return (
            <motion.button
              key={size.value}
              onClick={() => !isOut && onSelect(size.value)}
              disabled={isOut}
              aria-label={`Size ${size.value}${isOut ? " — sold out" : ""}`}
              className={`relative min-w-[48px] h-[48px] rounded-xl font-[var(--font-display)] text-sm font-semibold transition-all duration-300 ${
                isOut
                  ? "bg-nino-100/30 text-nino-800/15 cursor-not-allowed line-through"
                  : isSelected
                  ? "bg-nino-950 text-white shadow-md shadow-nino-900/10"
                  : "bg-nino-100/50 text-nino-700/50 hover:bg-nino-200/50 hover:text-nino-800"
              }`}
              whileTap={isOut ? undefined : { scale: 0.93 }}
            >
              {size.value}
              {!isOut && count <= 5 && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-nino-500/60 font-[var(--font-display)] whitespace-nowrap">
                  {count} left
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
