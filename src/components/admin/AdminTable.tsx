"use client";

import { type ReactNode } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AdminTableColumn<T = any> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface AdminTableProps<T = any> {
  columns: AdminTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    hasMore: boolean;
    onNext: () => void;
    onPrev: () => void;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function SkeletonRow({ columns }: { columns: AdminTableColumn[] }) {
  return (
    <tr className="animate-pulse">
      {columns.map((col) => (
        <td
          key={col.key}
          className="px-4 py-3.5"
          style={col.width ? { width: col.width } : undefined}
        >
          <div className="h-4 rounded bg-nino-200/30" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  onRowClick,
  pagination,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto rounded-xl border border-nino-200/15 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nino-200/15">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-xl border border-nino-200/15 bg-white py-16">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-3 text-nino-300/50"
        >
          <rect
            x="6"
            y="6"
            width="28"
            height="28"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6 14h28"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M14 20h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M14 25h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p className="font-body text-sm text-nino-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-nino-200/15 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-nino-200/15">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={`border-b border-nino-200/15 transition-colors duration-100 last:border-b-0 ${
                rowIdx % 2 === 0 ? "bg-white" : "bg-nino-50/30"
              } ${
                onRowClick
                  ? "cursor-pointer hover:bg-nino-100/30"
                  : "hover:bg-nino-100/30"
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3.5 font-body text-sm text-nino-800"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.render
                    ? col.render(item)
                    : ((item as Record<string, unknown>)[col.key] as ReactNode) ?? "\u2014"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-nino-200/15 px-4 py-3">
          <button
            onClick={pagination.onPrev}
            disabled={pagination.page <= 1}
            className="font-body text-[13px] font-medium text-nino-600 transition-colors hover:text-nino-800 disabled:text-nino-300"
          >
            Previous
          </button>
          <span className="font-body text-[12px] text-nino-400">
            Page {pagination.page}
          </span>
          <button
            onClick={pagination.onNext}
            disabled={!pagination.hasMore}
            className="font-body text-[13px] font-medium text-nino-600 transition-colors hover:text-nino-800 disabled:text-nino-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
