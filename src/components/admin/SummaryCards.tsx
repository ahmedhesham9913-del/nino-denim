"use client";

import { motion } from "framer-motion";

interface SummaryCardsProps {
  data: {
    ordersToday: number;
    revenueToday: number;
    viewsToday: number;
    conversionRate: number;
  } | null;
  loading: boolean;
}

const cards = [
  { key: "ordersToday", label: "Orders Today", format: (v: number) => String(v), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "revenueToday", label: "Revenue Today", format: (v: number) => `${v.toLocaleString()} EGP`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "viewsToday", label: "Views Today", format: (v: number) => String(v), icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  { key: "conversionRate", label: "Conversion Rate", format: (v: number) => `${v}%`, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
];

export default function SummaryCards({ data, loading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          className="bg-white rounded-xl border border-nino-200/20 p-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-nino-100/50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-nino-600">
                <path d={card.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[11px] tracking-[0.1em] text-nino-800/35 font-[var(--font-display)] font-medium">
              {card.label.toUpperCase()}
            </span>
          </div>
          {loading || !data ? (
            <div className="h-8 w-24 bg-nino-100/50 rounded animate-pulse" />
          ) : (
            <div className="font-[var(--font-display)] text-2xl font-bold text-nino-950">
              {card.format(data[card.key as keyof typeof data])}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
