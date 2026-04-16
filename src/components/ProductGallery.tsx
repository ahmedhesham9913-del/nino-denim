"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

interface ProductGalleryProps {
  mainImage: string;
  allVariantImages: string[];    // ALL variant images combined
  selectedColorImages: string[]; // images for selected color only (empty = show all)
  productName: string;
}

export default function ProductGallery({
  mainImage,
  allVariantImages,
  selectedColorImages,
  productName,
}: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Show filtered images when a color is selected, otherwise all
  const images = useMemo(() => {
    if (selectedColorImages.length > 0) {
      // Color selected: color images first, main image last
      return [...selectedColorImages, mainImage].filter(Boolean);
    }
    // No color selected: main image first, then all variant images
    return [mainImage, ...allVariantImages].filter(Boolean);
  }, [mainImage, allVariantImages, selectedColorImages]);

  // Detect mobile on mount
  useEffect(() => {
    if (window.innerWidth < 1024) setIsMobile(true);
  }, []);

  // Reset to index 0 when displayed images change
  useEffect(() => {
    setCurrent(0);
  }, [selectedColorImages]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 50) {
        if (info.offset.x < 0 && current < images.length - 1) {
          setCurrent((p) => p + 1);
        } else if (info.offset.x > 0 && current > 0) {
          setCurrent((p) => p - 1);
        }
      }
    },
    [current, images.length]
  );

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-2xl bg-nino-100/40 flex items-center justify-center">
        <span className="text-nino-800/20 text-sm font-[var(--font-display)]">No images</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[oklch(0.96_0.005_240)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current}-${images[current]}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={isMobile ? handleDragEnd : undefined}
          >
            <Image
              src={images[current]}
              alt={`${productName} — image ${current + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
              priority={current === 0}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Mobile indicators */}
        {isMobile && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`View image ${i + 1}`}
                className="p-0.5"
              >
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 20 : 6,
                    height: 6,
                    backgroundColor: i === current ? "oklch(0.48 0.16 240)" : "oklch(0.85 0.04 240)",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop thumbnails */}
      {!isMobile && images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <motion.button
              key={`${i}-${img}`}
              onClick={() => setCurrent(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${
                i === current
                  ? "ring-2 ring-nino-500/50 ring-offset-2"
                  : "opacity-50 hover:opacity-80"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
