"use client";

import { motion } from "framer-motion";

interface BarChartProps {
  data: { label: string; value: number }[];
  maxBars?: number;
}

export default function BarChart({ data, maxBars = 10 }: BarChartProps) {
  const bars = data.slice(0, maxBars);
  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  if (bars.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-nino-800/20 text-sm font-[var(--font-display)]">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {bars.map((bar, i) => (
        <div key={bar.label} className="flex items-center gap-3">
          <span className="text-xs text-nino-800/40 font-[var(--font-display)] w-24 truncate text-right">
            {bar.label}
          </span>
          <div className="flex-1 h-7 bg-nino-100/30 rounded-lg overflow-hidden">
            <motion.div
              className="h-full rounded-lg"
              style={{ background: "oklch(0.58 0.20 240)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(bar.value / maxValue) * 100}%` }}
              transition={{ delay: i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-xs font-[var(--font-display)] font-semibold text-nino-950 w-10 text-right">
            {bar.value}
          </span>
        </div>
      ))}
    </div>
  );
}
