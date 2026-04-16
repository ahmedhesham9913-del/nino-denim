"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AddToCartProps {
  disabled: boolean;
  onAdd: () => void;
}

export default function AddToCartButton({ disabled, onAdd }: AddToCartProps) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (disabled || added) return;
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full py-4 rounded-xl font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] transition-all duration-300 ${
        disabled
          ? "bg-nino-200/50 text-nino-400 cursor-not-allowed"
          : added
          ? "bg-green-600 text-white"
          : "bg-nino-950 text-white hover:bg-nino-800"
      }`}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      {disabled ? "SOLD OUT" : added ? "ADDED!" : "ADD TO CART"}
    </motion.button>
  );
}
