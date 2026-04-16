"use client";

import { motion } from "framer-motion";

interface FunnelChartProps {
  stages: { stage: string; count: number; percentage: number }[];
}

const stageColors = [
  "oklch(0.58 0.20 240)",
  "oklch(0.55 0.18 240)",
  "oklch(0.50 0.16 240)",
  "oklch(0.45 0.14 240)",
];

export default function FunnelChart({ stages }: FunnelChartProps) {
  if (stages.length === 0 || stages.every((s) => s.count === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-nino-800/20 text-sm font-[var(--font-display)]">
        No conversion data yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => (
        <div key={stage.stage}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-nino-800/50 font-[var(--font-display)]">
              {stage.stage}
            </span>
            <span className="text-xs font-[var(--font-display)] font-semibold text-nino-950">
              {stage.count.toLocaleString()} ({stage.percentage}%)
            </span>
          </div>
          <div className="h-8 bg-nino-100/30 rounded-lg overflow-hidden">
            <motion.div
              className="h-full rounded-lg"
              style={{ background: stageColors[i] ?? stageColors[stageColors.length - 1] }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(stage.percentage, 2)}%` }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
