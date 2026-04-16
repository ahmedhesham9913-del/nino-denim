"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface LineChartProps {
  data: { date: string; value: number }[];
  label: string;
}

export default function LineChart({ data, label }: LineChartProps) {
  const { points, path, areaPath, maxValue, width, height } = useMemo(() => {
    const w = 600;
    const h = 200;
    const padX = 40;
    const padY = 20;

    if (data.length === 0) return { points: [], path: "", areaPath: "", maxValue: 0, width: w, height: h };

    const max = Math.max(...data.map((d) => d.value), 1);
    const stepX = (w - padX * 2) / Math.max(data.length - 1, 1);

    const pts = data.map((d, i) => ({
      x: padX + i * stepX,
      y: padY + (1 - d.value / max) * (h - padY * 2),
      ...d,
    }));

    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = linePath + ` L ${pts[pts.length - 1].x} ${h - padY} L ${pts[0].x} ${h - padY} Z`;

    return { points: pts, path: linePath, areaPath: area, maxValue: max, width: w, height: h };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-nino-800/20 text-sm font-[var(--font-display)]">
        No {label.toLowerCase()} data yet
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[400px]">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={40}
            x2={width - 40}
            y1={20 + pct * (height - 40)}
            y2={20 + pct * (height - 40)}
            stroke="oklch(0.90 0.02 240)"
            strokeWidth={0.5}
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((pct) => (
          <text
            key={pct}
            x={35}
            y={20 + pct * (height - 40) + 4}
            textAnchor="end"
            className="fill-nino-800/20"
            fontSize={9}
            fontFamily="var(--font-display)"
          >
            {Math.round(maxValue * (1 - pct))}
          </text>
        ))}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="oklch(0.58 0.20 240 / 0.08)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Line */}
        <motion.path
          d={path}
          fill="none"
          stroke="oklch(0.58 0.20 240)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="white"
            stroke="oklch(0.58 0.20 240)"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.03, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}
