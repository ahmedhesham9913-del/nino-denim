"use client";

import { useState, useRef, useEffect } from "react";
import { EGYPT_GOVERNORATES } from "@/lib/constants";

interface GovernorateMultiSelectProps {
  selected: string[];
  disabled: string[];
  disabledOwnerMap?: Record<string, string>;
  onChange: (governorates: string[]) => void;
}

export default function GovernorateMultiSelect({
  selected,
  disabled,
  disabledOwnerMap = {},
  onChange,
}: GovernorateMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableGovernorates = EGYPT_GOVERNORATES.filter(
    (g) => !disabled.includes(g)
  );

  function handleToggle(gov: string) {
    if (disabled.includes(gov)) return;
    if (selected.includes(gov)) {
      onChange(selected.filter((s) => s !== gov));
    } else {
      onChange([...selected, gov]);
    }
  }

  function handleSelectAllAvailable() {
    const allAvailable = EGYPT_GOVERNORATES.filter(
      (g) => !disabled.includes(g)
    );
    onChange([...allAvailable]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-lg border border-nino-200/20 bg-nino-50/30 px-3 py-2 text-sm font-body text-nino-800 hover:bg-nino-50/60 transition-colors focus:outline-none focus:ring-2 focus:ring-nino-500/30"
      >
        <span className={selected.length === 0 ? "text-nino-400" : ""}>
          {selected.length === 0
            ? "Select governorates..."
            : `${selected.length} of ${EGYPT_GOVERNORATES.length} selected`}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-nino-200/30 bg-white shadow-lg">
          {/* Select all available button */}
          <div className="sticky top-0 bg-white border-b border-nino-200/20 p-2">
            <button
              type="button"
              onClick={handleSelectAllAvailable}
              className="w-full rounded-lg bg-nino-50 px-3 py-1.5 text-xs font-display font-semibold text-nino-700 hover:bg-nino-100 transition-colors"
            >
              Select All Available ({availableGovernorates.length})
            </button>
          </div>

          <div className="p-1">
            {EGYPT_GOVERNORATES.map((gov) => {
              const isDisabled = disabled.includes(gov);
              const isSelected = selected.includes(gov);
              const ownerZone = disabledOwnerMap[gov];

              return (
                <button
                  key={gov}
                  type="button"
                  onClick={() => handleToggle(gov)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm font-body transition-colors ${
                    isDisabled
                      ? "text-nino-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-nino-50 text-nino-950"
                      : "text-nino-700 hover:bg-nino-50/50"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      isDisabled
                        ? "border-nino-200 bg-nino-100"
                        : isSelected
                        ? "border-nino-950 bg-nino-950"
                        : "border-nino-300"
                    }`}
                  >
                    {isSelected && !isDisabled && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>

                  <span className="flex-1">{gov}</span>

                  {isDisabled && ownerZone && (
                    <span className="text-[10px] font-display text-nino-300 uppercase tracking-wider">
                      {ownerZone}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
