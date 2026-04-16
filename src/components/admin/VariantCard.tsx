"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { VariantSize } from "@/lib/types";
import type { ColorItem, SizeItem } from "@/services/taxonomies";

export interface VariantFormData {
  colorId: string;
  colorName: string;
  colorHex: string;
  images: (File | string)[];
  sizes: VariantSize[];
}

interface VariantCardProps {
  variant: VariantFormData;
  availableColors: ColorItem[];
  availableSizes: SizeItem[];
  assignedImages?: (File | string)[];
  onChange: (updated: VariantFormData) => void;
  onDelete: () => void;
  collapsed?: boolean;
  onToggleCollapse: () => void;
}

export default function VariantCard({
  variant,
  availableColors,
  availableSizes,
  assignedImages = [],
  onChange,
  onDelete,
  collapsed = false,
  onToggleCollapse,
}: VariantCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalStock = variant.sizes.reduce((sum, s) => sum + s.stock, 0);

  function handleColorChange(colorId: string) {
    const color = availableColors.find((c) => c.id === colorId);
    if (!color) return;
    onChange({
      ...variant,
      colorId: color.id ?? "",
      colorName: color.name,
      colorHex: color.hex,
    });
  }

  function handleSizeToggle(sizeValue: string) {
    const existing = variant.sizes.find((s) => s.value === sizeValue);
    if (existing) {
      // Remove size
      onChange({
        ...variant,
        sizes: variant.sizes.filter((s) => s.value !== sizeValue),
      });
    } else {
      // Add size with default stock 0
      onChange({
        ...variant,
        sizes: [...variant.sizes, { value: sizeValue, stock: 0 }],
      });
    }
  }

  function handleStockChange(sizeValue: string, stock: number) {
    onChange({
      ...variant,
      sizes: variant.sizes.map((s) =>
        s.value === sizeValue ? { ...s, stock: Math.max(0, stock) } : s
      ),
    });
  }

  return (
    <div
      className="rounded-xl border border-nino-200/20 bg-white overflow-hidden"
      style={{ borderLeft: `4px solid ${variant.colorHex || "#d1d5db"}` }}
    >
      {/* Header bar */}
      <div
        onClick={onToggleCollapse}
        className="flex items-center justify-between px-4 py-3 bg-nino-50/40 cursor-pointer select-none hover:bg-nino-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full border border-nino-200/30 shrink-0"
            style={{ backgroundColor: variant.colorHex || "#d1d5db" }}
          />
          <span className="font-display text-sm font-semibold text-nino-950">
            {variant.colorName || "Select Color"}
          </span>
          <span className="text-xs font-body text-nino-800/40">
            {totalStock} in stock &middot; {assignedImages.length} image{assignedImages.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Collapse chevron */}
          <motion.svg
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-nino-800/40"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirmDelete) {
                onDelete();
              } else {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 3000);
              }
            }}
            className={`ml-1 p-1 rounded transition-colors ${
              confirmDelete
                ? "text-red-600 bg-red-50 hover:bg-red-100"
                : "text-nino-800/30 hover:text-red-500 hover:bg-red-50"
            }`}
            title={confirmDelete ? "Click again to confirm" : "Delete variant"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-5 border-t border-nino-200/15">
              {/* Color selector */}
              <div>
                <label className="block text-sm font-medium text-nino-950 font-display mb-1">
                  Color
                </label>
                <select
                  value={variant.colorId}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 font-body text-sm focus:border-nino-500 focus:ring-1 focus:ring-nino-500 outline-none transition-colors"
                >
                  <option value="">Select a color...</option>
                  {availableColors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Images (read-only) */}
              <div>
                <label className="block text-sm font-medium text-nino-950 font-display mb-1">
                  Assigned Images
                </label>
                {assignedImages.length === 0 ? (
                  <p className="text-sm text-nino-400 font-body">
                    No images assigned. Use the Product Images section above to assign images to this color.
                  </p>
                ) : (
                  <div>
                    <p className="text-xs text-nino-800/40 font-body mb-2">
                      {assignedImages.length} image{assignedImages.length !== 1 ? "s" : ""} assigned
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {assignedImages.map((img, i) => {
                        const src =
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img);
                        return (
                          <div
                            key={i}
                            className="relative w-10 h-10 rounded-lg overflow-hidden border border-nino-200/30 bg-nino-100/30"
                          >
                            <Image
                              src={src}
                              alt={`Assigned image ${i + 1}`}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized={typeof img !== "string"}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Size-Stock grid */}
              <div>
                <label className="block text-sm font-medium text-nino-950 font-display mb-2">
                  Sizes & Stock
                </label>
                {availableSizes.length === 0 ? (
                  <p className="text-sm text-nino-400 font-body">
                    Select a category first to see available sizes.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sizeItem) => {
                      const active = variant.sizes.find(
                        (s) => s.value === sizeItem.value
                      );
                      return (
                        <div key={sizeItem.id} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSizeToggle(sizeItem.value)}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-body transition-colors ${
                              active
                                ? "bg-nino-950 text-white border-nino-950"
                                : "bg-white text-gray-500 border-gray-300 hover:border-nino-400"
                            }`}
                          >
                            {sizeItem.value}
                          </button>
                          {active && (
                            <input
                              type="number"
                              min={0}
                              value={active.stock}
                              onChange={(e) =>
                                handleStockChange(
                                  sizeItem.value,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 rounded-md border border-nino-200/30 bg-nino-50/30 px-2 py-1.5 text-sm font-body text-nino-800 text-center focus:outline-none focus:ring-2 focus:ring-nino-500/30"
                              placeholder="Qty"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
