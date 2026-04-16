"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEnabledShippingCompanies } from "@/services/shipping-companies";
import type { ShippingCompany } from "@/lib/types";

interface ShippingCompanyModalProps {
  open: boolean;
  onConfirm: (companyName: string) => void;
  onCancel: () => void;
}

export default function ShippingCompanyModal({
  open,
  onConfirm,
  onCancel,
}: ShippingCompanyModalProps) {
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected("");
    getEnabledShippingCompanies()
      .then((data) => setCompanies(data))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl border border-nino-200/30 w-full max-w-md mx-4 overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-6">
              <h3 className="font-display text-lg font-bold text-nino-950 mb-1">
                Select Shipping Company
              </h3>
              <p className="text-sm font-body text-nino-800/40 mb-5">
                Choose a shipping company for this order
              </p>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse h-12 bg-nino-100/50 rounded-xl"
                    />
                  ))}
                </div>
              ) : companies.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="font-body text-sm text-nino-400">
                    No shipping companies configured
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {companies.map((company) => {
                    const isSelected = selected === company.name;
                    return (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => setSelected(company.name)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                          isSelected
                            ? "border-nino-500 bg-nino-50/50"
                            : "border-nino-200/30 hover:border-nino-200/60"
                        }`}
                      >
                        {/* Radio indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? "border-nino-500"
                              : "border-nino-300"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              className="w-2.5 h-2.5 rounded-full bg-nino-500"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.15 }}
                            />
                          )}
                        </div>
                        <span className="font-display text-sm font-medium text-nino-950">
                          {company.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-nino-200/20 bg-nino-50/30">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-nino-200/20 px-4 py-2 text-xs font-display font-semibold text-nino-800/60 hover:bg-nino-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selected) onConfirm(selected);
                }}
                disabled={!selected}
                className="rounded-lg bg-nino-950 px-5 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-nino-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
