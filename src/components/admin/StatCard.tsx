"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatCard({
  label,
  value,
  trend,
  icon,
  prefix = "",
  suffix = "",
}: StatCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      className="bg-white rounded-xl border border-nino-200/20 p-5 flex flex-col justify-between min-h-[120px]"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top row: icon + label */}
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-nino-100/50 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-nino-600"
            >
              <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <span className="text-[11px] tracking-[0.1em] text-nino-800/35 font-[var(--font-display)] font-medium uppercase">
          {label}
        </span>
      </div>

      {/* Value + Trend */}
      <div className="flex items-end justify-between gap-2">
        <div className="font-[var(--font-display)] text-2xl font-bold text-nino-950">
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-[var(--font-display)] font-semibold ${
              trendPositive ? "text-green-600" : ""
            }${trendNegative ? "text-red-500" : ""}`}
          >
            {trendPositive && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2.5v7M6 2.5l3 3M6 2.5l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {trendNegative && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 9.5v-7M6 9.5l3-3M6 9.5l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </motion.div>
  );
}
