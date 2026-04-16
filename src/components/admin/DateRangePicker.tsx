"use client";

import { useMemo } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getPresetRange(preset: string): [string, string] {
  const today = new Date();
  const end = formatDate(today);

  switch (preset) {
    case "today":
      return [end, end];
    case "7days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return [formatDate(start), end];
    }
    case "30days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return [formatDate(start), end];
    }
    case "month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return [formatDate(start), end];
    }
    default:
      return [end, end];
  }
}

const presets = [
  { key: "today", label: "Today" },
  { key: "7days", label: "7 Days" },
  { key: "30days", label: "30 Days" },
  { key: "month", label: "This Month" },
] as const;

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const activePreset = useMemo(() => {
    for (const preset of presets) {
      const [pStart, pEnd] = getPresetRange(preset.key);
      if (pStart === startDate && pEnd === endDate) {
        return preset.key;
      }
    }
    return null;
  }, [startDate, endDate]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Preset buttons */}
      <div className="flex gap-1.5">
        {presets.map((preset) => {
          const isActive = activePreset === preset.key;
          return (
            <button
              key={preset.key}
              onClick={() => {
                const [start, end] = getPresetRange(preset.key);
                onChange(start, end);
              }}
              className={`rounded-lg px-3 py-1.5 font-body text-[13px] font-medium transition-colors duration-100 ${
                isActive
                  ? "bg-nino-950 text-white"
                  : "bg-nino-100/50 text-nino-600 hover:bg-nino-200/50 hover:text-nino-800"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="hidden h-6 w-px bg-nino-200/30 sm:block" />

      {/* Date inputs */}
      <div className="flex items-center gap-2">
        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-500">
          From
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="rounded-lg border border-nino-200/30 bg-white px-2.5 py-1.5 font-body text-[13px] text-nino-800 outline-none transition-colors focus:border-nino-400"
        />

        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-500">
          To
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="rounded-lg border border-nino-200/30 bg-white px-2.5 py-1.5 font-body text-[13px] text-nino-800 outline-none transition-colors focus:border-nino-400"
        />
      </div>
    </div>
  );
}
