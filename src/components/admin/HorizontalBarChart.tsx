"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface HorizontalBarDatum {
  label: string;
  value: number;
  color?: string;
  icon?: ReactNode;
}

interface HorizontalBarChartProps {
  data: HorizontalBarDatum[];
  maxBars?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

const DEFAULT_COLOR = "oklch(0.58 0.20 240)"; // nino-500

export default function HorizontalBarChart({
  data,
  maxBars = 10,
  valuePrefix = "",
  valueSuffix = "",
}: HorizontalBarChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, maxBars);
  const maxValue = Math.max(...sorted.map((b) => b.value), 1);

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-nino-800/20 text-sm font-[var(--font-display)]">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sorted.map((bar, i) => (
        <div key={bar.label} className="flex items-center gap-3">
          {/* Icon + Label */}
          <div className="flex items-center gap-2 w-28 shrink-0">
            {bar.icon && (
              <span className="text-nino-600 shrink-0">{bar.icon}</span>
            )}
            <span className="text-xs text-nino-800/40 font-[var(--font-display)] truncate text-right flex-1">
              {bar.label}
            </span>
          </div>

          {/* Bar */}
          <div className="flex-1 h-7 bg-nino-100/30 rounded-lg overflow-hidden">
            <motion.div
              className="h-full rounded-lg"
              style={{ background: bar.color ?? DEFAULT_COLOR }}
              initial={{ width: 0 }}
              animate={{ width: `${(bar.value / maxValue) * 100}%` }}
              transition={{
                delay: i * 0.04,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </div>

          {/* Value */}
          <span className="text-xs font-[var(--font-display)] font-semibold text-nino-950 w-20 text-right shrink-0">
            {valuePrefix}{bar.value.toLocaleString()}{valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}
