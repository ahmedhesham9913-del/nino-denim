"use client";

import DateRangePicker from "@/components/admin/DateRangePicker";

interface OrderFilters {
  search: string;
  startDate: string;
  endDate: string;
}

interface OrderFilterBarProps {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
}

export default function OrderFilterBar({ filters, onChange }: OrderFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-nino-200/15 bg-white p-4">
      {/* Search */}
      <div className="flex flex-col gap-1">
        <label className="font-display text-[11px] font-medium uppercase tracking-[0.1em] text-nino-800/40">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by ID, name, phone, product..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="rounded-lg border border-nino-200/20 bg-white px-3 py-2 font-body text-sm text-nino-800 outline-none transition-colors focus:border-nino-400 focus:ring-2 focus:ring-nino-500/20 max-w-md"
        />
      </div>

      {/* Date Range */}
      <DateRangePicker
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChange={(start, end) => onChange({ ...filters, startDate: start, endDate: end })}
      />
    </div>
  );
}
