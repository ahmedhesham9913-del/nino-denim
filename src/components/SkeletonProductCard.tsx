"use client";

import { motion } from "framer-motion";

export default function SkeletonProductCard({ featured }: { featured?: boolean }) {
  return (
    <div className={`rounded-2xl overflow-hidden bg-white border border-nino-200/20 ${featured ? "sm:col-span-2 sm:row-span-2" : ""}`}>
      <div className={`bg-nino-100/40 animate-pulse ${featured ? "aspect-[4/5]" : "aspect-[3/4]"}`} />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2 flex-1">
            <motion.div className="h-2.5 w-16 bg-nino-100/60 rounded-full" />
            <motion.div className="h-4 w-28 bg-nino-100/60 rounded-full" />
          </div>
          <motion.div className="h-5 w-12 bg-nino-100/60 rounded-full" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <motion.div key={i} className="w-3.5 h-3.5 rounded-full bg-nino-100/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
