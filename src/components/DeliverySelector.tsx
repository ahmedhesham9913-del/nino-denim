"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { EGYPT_GOVERNORATES } from "@/lib/constants";
import { CURRENCY } from "@/lib/delivery-zones";
import { getZones } from "@/services/delivery-zones";
import type { DeliveryZone } from "@/lib/types";

interface DeliverySelectorProps {
  selectedZone: DeliveryZone | null;
  onSelect: (zone: DeliveryZone) => void;
  onContinue: () => void;
  onBack: () => void;
}

const SIGNATURE_EASE = [0.16, 1, 0.3, 1] as const;

export default function DeliverySelector({
  selectedZone,
  onSelect,
  onContinue,
  onBack,
}: DeliverySelectorProps) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");

  useEffect(() => {
    getZones()
      .then((firestoreZones) => {
        if (firestoreZones.length > 0) {
          setZones(
            firestoreZones.map((z) => ({
              name: z.name,
              fee: z.fee,
              governorates: z.governorates ?? [],
            }))
          );
        }
      })
      .catch(() => {
        // Fallback silently
      })
      .finally(() => setZonesLoading(false));
  }, []);

  // Build a governorate -> zone lookup map
  const governorateZoneMap = useMemo(() => {
    const map: Record<string, DeliveryZone> = {};
    for (const zone of zones) {
      if (zone.governorates) {
        for (const gov of zone.governorates) {
          map[gov] = zone;
        }
      }
    }
    return map;
  }, [zones]);

  // Governorates that have a zone assigned
  const availableGovernorates = useMemo(() => {
    return EGYPT_GOVERNORATES.filter((g) => g in governorateZoneMap);
  }, [governorateZoneMap]);

  function handleGovernorateChange(gov: string) {
    setSelectedGovernorate(gov);
    const zone = governorateZoneMap[gov];
    if (zone) {
      onSelect(zone);
    }
  }

  const resolvedZone = selectedGovernorate
    ? governorateZoneMap[selectedGovernorate] ?? null
    : null;

  const isZoneSelected = resolvedZone !== null;

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h3 className="font-[var(--font-display)] text-sm font-medium tracking-wide text-nino-950 mb-4">
          Select your governorate
        </h3>

        {zonesLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-nino-100/50 rounded-xl" />
          </div>
        ) : availableGovernorates.length === 0 ? (
          <p className="text-sm font-body text-nino-400 py-4 text-center">
            No delivery zones configured yet.
          </p>
        ) : (
          <div className="relative">
            <select
              value={selectedGovernorate}
              onChange={(e) => handleGovernorateChange(e.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-nino-200/30 bg-white px-5 py-4 text-sm font-[var(--font-display)] font-medium text-nino-950 focus:border-nino-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="">Select your governorate...</option>
              {availableGovernorates.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-nino-400"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Resolved zone info */}
      {isZoneSelected && resolvedZone && (
        <motion.div
          className="bg-nino-50/50 rounded-xl px-5 py-3 space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: SIGNATURE_EASE }}
        >
          <div className="flex items-center justify-between">
            <span className="font-[var(--font-display)] text-xs tracking-[0.1em] text-nino-500 font-medium">
              ZONE
            </span>
            <span className="font-[var(--font-display)] text-sm font-semibold text-nino-950">
              {resolvedZone.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-[var(--font-display)] text-xs tracking-[0.1em] text-nino-500 font-medium">
              DELIVERY FEE
            </span>
            <span className="font-[var(--font-display)] text-base font-bold text-nino-950">
              {resolvedZone.fee} {CURRENCY}
            </span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={!isZoneSelected}
          className={`
            w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold rounded-full py-3.5
            transition-colors duration-300
            ${
              isZoneSelected
                ? "bg-nino-950 text-white hover:bg-nino-800"
                : "bg-nino-200 text-nino-400 cursor-not-allowed"
            }
          `}
        >
          CONTINUE
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-nino-500 hover:text-nino-950 transition-colors duration-300 py-2"
        >
          BACK
        </button>
      </div>
    </motion.div>
  );
}
