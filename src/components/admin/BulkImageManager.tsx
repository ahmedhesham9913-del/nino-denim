"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface ImageAssignment {
  src: File | string; // File for new uploads, URL string for existing
  assignedTo: "main" | "unassigned" | string; // "main", variant colorName, or "unassigned"
}

interface BulkImageManagerProps {
  images: ImageAssignment[];
  onChange: (images: ImageAssignment[]) => void;
  variantColors: { colorName: string; colorHex: string }[];
}

function getPreview(item: ImageAssignment): string {
  if (typeof item.src === "string") return item.src;
  return URL.createObjectURL(item.src);
}

function getBadgeStyle(assignedTo: string, variantColors: { colorName: string; colorHex: string }[]) {
  if (assignedTo === "main") return { bg: "bg-nino-950", text: "text-white", label: "MAIN" };
  if (assignedTo === "unassigned") return { bg: "bg-yellow-100", text: "text-yellow-800", label: "UNASSIGNED" };
  const variant = variantColors.find((v) => v.colorName === assignedTo);
  return {
    bg: "bg-white border border-nino-200/50",
    text: "text-nino-950",
    label: assignedTo,
    hex: variant?.colorHex,
  };
}

export default function BulkImageManager({ images, onChange, variantColors }: BulkImageManagerProps) {
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newImages: ImageAssignment[] = Array.from(files).map((f) => ({
      src: f,
      assignedTo: "unassigned",
    }));
    onChange([...images, ...newImages]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleAssign = (index: number, target: string) => {
    const updated = [...images];
    // If assigning to "main", unassign the current main first
    if (target === "main") {
      updated.forEach((img, i) => {
        if (img.assignedTo === "main" && i !== index) {
          updated[i] = { ...img, assignedTo: "unassigned" };
        }
      });
    }
    updated[index] = { ...updated[index], assignedTo: target };
    onChange(updated);
    setDropdownOpen(null);
  };

  const assignOptions = [
    { key: "main", label: "Set as Main Image", icon: "⭐" },
    ...variantColors.map((v) => ({
      key: v.colorName,
      label: v.colorName,
      hex: v.colorHex,
    })),
    { key: "unassigned", label: "Unassign", icon: "✕" },
  ];

  return (
    <div>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 ${
          isDragging
            ? "border-nino-500 bg-nino-50/50"
            : "border-nino-300/40 hover:border-nino-400/60 hover:bg-nino-50/20"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-nino-400 mb-3">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-nino-700/50 font-[var(--font-display)]">
          Drop all product images here or <span className="text-nino-600 font-semibold">click to browse</span>
        </p>
        <p className="text-[10px] text-nino-700/30 font-[var(--font-display)] mt-1">
          Upload all images first, then assign each to Main or a color variant
        </p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {images.map((img, index) => {
              const badge = getBadgeStyle(img.assignedTo, variantColors);
              const preview = getPreview(img);

              return (
                <motion.div
                  key={`${index}-${typeof img.src === "string" ? img.src : img.src.name}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  {/* Image thumbnail */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-nino-100/30 border border-nino-200/30">
                    <Image
                      src={preview}
                      alt={`Product image ${index + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover"
                      unoptimized={typeof img.src !== "string"}
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                      aria-label="Remove image"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Assignment badge */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(dropdownOpen === index ? null : index)}
                    className={`mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-[var(--font-display)] font-bold tracking-wider ${badge.bg} ${badge.text} transition-all hover:opacity-80`}
                  >
                    {"hex" in badge && badge.hex && (
                      <span className="w-3 h-3 rounded-full inline-block border border-white/30" style={{ backgroundColor: badge.hex }} />
                    )}
                    {badge.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-auto">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Assign modal — fixed center overlay */}
      <AnimatePresence>
        {dropdownOpen !== null && images[dropdownOpen] && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDropdownOpen(null)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 bg-white border border-nino-200/40 rounded-2xl shadow-2xl shadow-nino-900/15 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-4 py-3 border-b border-nino-200/20">
                <p className="text-[11px] tracking-[0.15em] text-nino-800/40 font-[var(--font-display)] font-semibold uppercase">
                  Assign Image To
                </p>
              </div>
              <div className="py-1">
                {assignOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => handleAssign(dropdownOpen, opt.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-[var(--font-display)] transition-colors hover:bg-nino-50 ${
                      images[dropdownOpen].assignedTo === opt.key ? "bg-nino-100/50 font-bold" : "text-nino-800/70"
                    }`}
                  >
                    {"hex" in opt && opt.hex ? (
                      <span className="w-5 h-5 rounded-full border border-nino-200/50" style={{ backgroundColor: opt.hex }} />
                    ) : (
                      <span className="w-5 text-center text-base">{"icon" in opt ? opt.icon : ""}</span>
                    )}
                    {opt.label}
                    {images[dropdownOpen].assignedTo === opt.key && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-auto text-nino-600">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Summary */}
      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-[var(--font-display)] text-nino-800/40 tracking-wider">
          <span>{images.length} images total</span>
          <span>&middot;</span>
          <span>{images.filter((i) => i.assignedTo === "main").length} main</span>
          {variantColors.map((v) => (
            <span key={v.colorName}>
              &middot; {images.filter((i) => i.assignedTo === v.colorName).length} {v.colorName}
            </span>
          ))}
          {images.some((i) => i.assignedTo === "unassigned") && (
            <span className="text-yellow-600">
              &middot; {images.filter((i) => i.assignedTo === "unassigned").length} unassigned
            </span>
          )}
        </div>
      )}
    </div>
  );
}
