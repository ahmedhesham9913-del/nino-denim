"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  images: (File | string)[];
  onChange: (images: (File | string)[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 8,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Map<File, string>>(new Map());

  const atLimit = images.length >= maxImages;

  // Create object URLs for File objects and clean them up
  useEffect(() => {
    const newPreviews = new Map<File, string>();
    for (const img of images) {
      if (img instanceof File) {
        const existing = previews.get(img);
        if (existing) {
          newPreviews.set(img, existing);
        } else {
          newPreviews.set(img, URL.createObjectURL(img));
        }
      }
    }

    // Revoke old URLs that are no longer needed
    for (const [file, url] of previews) {
      if (!newPreviews.has(file)) {
        URL.revokeObjectURL(url);
      }
    }

    setPreviews(newPreviews);

    // Cleanup on unmount
    return () => {
      for (const [, url] of newPreviews) {
        URL.revokeObjectURL(url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const getPreviewUrl = (img: File | string): string => {
    if (typeof img === "string") return img;
    return previews.get(img) || "";
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      const remaining = maxImages - images.length;
      if (remaining <= 0) return;
      const toAdd = fileArray.slice(0, remaining);
      onChange([...images, ...toAdd]);
    },
    [images, maxImages, onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!atLimit) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (atLimit) return;
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !atLimit && fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors duration-150 ${
          atLimit
            ? "cursor-not-allowed border-nino-200/20 bg-nino-50/20"
            : isDragging
              ? "border-nino-500 bg-nino-50/50"
              : "border-nino-300/30 bg-white hover:border-nino-400/40 hover:bg-nino-50/30"
        }`}
      >
        {/* Cloud upload icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`mb-3 ${atLimit ? "text-nino-300/30" : "text-nino-400/60"}`}
        >
          <path
            d="M10 24c-3.3 0-6-2.7-6-6 0-2.8 1.9-5.2 4.5-5.8C9.3 9 12.3 7 16 7c4.4 0 8 3.1 8.5 7.1C27.1 14.6 29 16.9 29 19.5c0 2.8-2.2 5-5 5H10z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 16v8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13 18l3-3 3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {atLimit ? (
          <p className="font-body text-sm text-nino-400/50">
            Maximum of {maxImages} images reached
          </p>
        ) : (
          <>
            <p className="font-body text-sm text-nino-600">
              Drop images or click to browse
            </p>
            <p className="mt-1 font-body text-[11px] text-nino-400">
              {images.length} / {maxImages} images
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => {
            const src = getPreviewUrl(img);
            if (!src) return null;
            return (
              <div
                key={idx}
                className="group relative h-20 w-20 overflow-hidden rounded-lg border border-nino-200/20 bg-nino-50/30"
              >
                <Image
                  src={src}
                  alt={`Upload preview ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={img instanceof File}
                />

                {/* Overlay controls on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-nino-800 transition-colors hover:bg-red-500 hover:text-white"
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 3l6 6M9 3l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* Reorder buttons */}
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, "up");
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded bg-white/80 text-nino-700 transition-colors hover:bg-white"
                        aria-label="Move left"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M6 2L3 5l3 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, "down");
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded bg-white/80 text-nino-700 transition-colors hover:bg-white"
                        aria-label="Move right"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M4 2l3 3-3 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
