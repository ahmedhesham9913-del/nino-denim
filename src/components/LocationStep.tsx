"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  governorate: string;
}

interface LocationStepProps {
  onConfirm: (data: LocationData) => void;
  onSkip: () => void;
}

type Status = "requesting" | "detecting" | "success" | "denied" | "error";

async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; governorate: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&zoom=18`,
    { headers: { "User-Agent": "NinoJeans/1.0" } }
  );
  const data = await res.json();

  const addr = data.address || {};
  const parts = [addr.road, addr.suburb, addr.city || addr.town || addr.village].filter(Boolean);
  const address = parts.join(", ") || data.display_name || "";
  const governorate = addr.state || addr.governorate || addr.city || "";

  return { address, governorate };
}

export default function LocationStep({ onConfirm, onSkip }: LocationStepProps) {
  const [status, setStatus] = useState<Status>("requesting");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    setStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const { address, governorate } = await reverseGeocode(lat, lng);
          setLocationData({ lat, lng, address, governorate });
          setStatus("success");
        } catch {
          setLocationData({ lat, lng, address: "", governorate: "" });
          setStatus("success");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("error");
          setErrorMsg("Could not detect your location");
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Detecting */}
      {(status === "requesting" || status === "detecting") && (
        <div className="text-center py-12">
          <motion.div
            className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-nino-200/40 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-nino-600">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </motion.div>
          <h3 className="font-[var(--font-display)] text-lg font-semibold text-nino-950 mb-2">
            Detecting your location...
          </h3>
          <p className="text-sm text-nino-800/40">
            Please allow location access when prompted
          </p>
        </div>
      )}

      {/* Success */}
      {status === "success" && locationData && (
        <div>
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-[var(--font-display)] text-lg font-semibold text-nino-950">
              Location Detected
            </h3>
          </div>

          <div className="rounded-xl border border-nino-200/40 bg-white p-5 space-y-4">
            {/* Address */}
            {locationData.address && (
              <div>
                <span className="text-[10px] tracking-[0.2em] text-nino-800/35 font-[var(--font-display)] font-semibold uppercase block mb-1">
                  Address
                </span>
                <p className="text-sm text-nino-950 font-[var(--font-body)]">
                  {locationData.address}
                </p>
              </div>
            )}

            {/* Governorate */}
            {locationData.governorate && (
              <div>
                <span className="text-[10px] tracking-[0.2em] text-nino-800/35 font-[var(--font-display)] font-semibold uppercase block mb-1">
                  Governorate
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-nino-100/50 text-sm font-[var(--font-display)] font-medium text-nino-700">
                  {locationData.governorate}
                </span>
              </div>
            )}

            {/* Coordinates */}
            <div>
              <span className="text-[10px] tracking-[0.2em] text-nino-800/35 font-[var(--font-display)] font-semibold uppercase block mb-1">
                Coordinates
              </span>
              <p className="text-xs text-nino-800/30 font-[var(--font-body)]">
                {locationData.lat.toFixed(6)}, {locationData.lng.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-5">
            <button
              type="button"
              onClick={() => onConfirm(locationData)}
              className="w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-white bg-nino-950 rounded-full py-3.5 hover:bg-nino-800 transition-colors duration-300"
            >
              CONFIRM LOCATION
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-nino-500 hover:text-nino-950 transition-colors duration-300 py-2"
            >
              ENTER ADDRESS MANUALLY
            </button>
          </div>
        </div>
      )}

      {/* Denied / Error */}
      {(status === "denied" || status === "error") && (
        <div className="text-center py-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="font-[var(--font-display)] text-lg font-semibold text-nino-950 mb-2">
            {status === "denied" ? "Location Access Denied" : "Location Error"}
          </h3>
          <p className="text-sm text-nino-800/40 mb-6 max-w-xs mx-auto">
            {status === "denied"
              ? "You can still enter your address manually in the next step."
              : errorMsg || "Something went wrong detecting your location."}
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="px-8 py-3.5 font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-white bg-nino-950 rounded-full hover:bg-nino-800 transition-colors"
          >
            ENTER ADDRESS MANUALLY
          </button>
        </div>
      )}
    </motion.div>
  );
}
