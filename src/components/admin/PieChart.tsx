"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PieChartDatum {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartDatum[];
  size?: number;
}

export default function PieChart({ data, size = 200 }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-nino-800/20 text-sm font-[var(--font-display)]">
        No data
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const radius = size / 2 - 10;
  const strokeWidth = radius * 0.4;
  const circumference = 2 * Math.PI * radius;

  // Build segments
  let cumulativeOffset = 0;
  const segments = data.map((d) => {
    const fraction = d.value / total;
    const dashLength = fraction * circumference;
    const gap = circumference - dashLength;
    const offset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return { ...d, fraction, dashLength, gap, offset };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {segments.map((seg, i) => (
          <motion.circle
            key={seg.label}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={hoveredIndex === i ? strokeWidth + 6 : strokeWidth}
            strokeDasharray={`${seg.dashLength} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
            style={{ cursor: "pointer", transition: "stroke-width 0.2s ease" }}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${seg.dashLength} ${seg.gap}` }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1}
          />
        ))}

        {/* Center label on hover */}
        {hoveredIndex !== null && (
          <>
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              className="fill-nino-950"
              fontSize={14}
              fontWeight="700"
              fontFamily="var(--font-display)"
            >
              {segments[hoveredIndex].value.toLocaleString()}
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              className="fill-nino-800/50"
              fontSize={10}
              fontFamily="var(--font-display)"
            >
              {Math.round(segments[hoveredIndex].fraction * 100)}%
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-nino-800/60 font-[var(--font-display)]">
              {seg.label}
            </span>
            <span className="text-xs font-[var(--font-display)] font-semibold text-nino-950">
              {seg.value.toLocaleString()}
            </span>
            <span className="text-[10px] text-nino-800/30 font-[var(--font-display)]">
              {Math.round(seg.fraction * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
