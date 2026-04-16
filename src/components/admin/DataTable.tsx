"use client";

import { useState, useMemo } from "react";
import { exportToCSV } from "@/lib/export";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: (v: any) => string;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, any>[];
  title?: string;
  exportable?: boolean;
  exportFilename?: string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function DataTable({
  columns,
  data,
  title,
  exportable = false,
  exportFilename = "export",
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDir]);

  const handleExport = () => {
    exportToCSV(data, exportFilename);
  };

  if (data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-nino-200/15 bg-white">
        {(title || exportable) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-nino-200/15">
            {title && (
              <span className="font-[var(--font-display)] text-sm font-semibold text-nino-950">
                {title}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-center py-16 text-nino-800/20 text-sm font-[var(--font-display)]">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-nino-200/15 bg-white overflow-hidden">
      {/* Header bar */}
      {(title || exportable) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-nino-200/15">
          {title && (
            <span className="font-[var(--font-display)] text-sm font-semibold text-nino-950">
              {title}
            </span>
          )}
          {exportable && (
            <button
              type="button"
              onClick={handleExport}
              className="text-xs font-[var(--font-display)] font-medium text-nino-600 hover:text-nino-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-nino-100/40"
            >
              Export CSV
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nino-200/15">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 font-[var(--font-display)] text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40 cursor-pointer select-none hover:text-nino-800/60 transition-colors ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-nino-500">
                        {sortDir === "asc" ? "\u2191" : "\u2193"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`border-b border-nino-200/15 last:border-b-0 transition-colors duration-100 hover:bg-nino-100/30 ${
                  rowIdx % 2 === 0 ? "bg-white" : "bg-nino-50/30"
                }`}
              >
                {columns.map((col) => {
                  const raw = row[col.key];
                  const display = col.format ? col.format(raw) : (raw ?? "\u2014");
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-sm text-nino-800 font-[var(--font-display)] ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {String(display)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
