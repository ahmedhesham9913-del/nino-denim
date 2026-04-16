"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getZones,
  addZone,
  updateZone,
  deleteZone,
  type FirestoreDeliveryZone,
} from "@/services/delivery-zones";
import ZoneEditor from "@/components/admin/ZoneEditor";
import ShippingCompanyEditor from "@/components/admin/ShippingCompanyEditor";

type Tab = "zones" | "companies";

const TABS: { key: Tab; label: string; icon: string; desc: string }[] = [
  {
    key: "zones",
    label: "Delivery Zones",
    desc: "Manage zones, fees, and governorate assignments",
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  },
  {
    key: "companies",
    label: "Shipping Companies",
    desc: "Manage shipping providers and per-governorate costs",
    icon: "M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  },
];

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("zones");
  const [zones, setZones] = useState<FirestoreDeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getZones();
      setZones(data);
    } catch (err) {
      console.error("Failed to fetch delivery zones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  async function handleAdd(zone: {
    name: string;
    fee: number;
    governorates?: string[];
  }) {
    await addZone(zone);
    await fetchZones();
  }

  async function handleEdit(
    id: string,
    data: { name?: string; fee?: number; governorates?: string[] }
  ) {
    await updateZone(id, data);
    await fetchZones();
  }

  async function handleDelete(id: string) {
    await deleteZone(id);
    await fetchZones();
  }

  const activeTabData = TABS.find((t) => t.key === activeTab)!;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-nino-950 mb-2">
          Delivery &amp; Shipping
        </h1>
        <p className="font-body text-sm text-nino-800/40 mt-1">
          Manage delivery zones, governorate assignments, and shipping companies
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 mb-8 p-2 rounded-2xl bg-white border border-nino-200/30">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeTab === tab.key
                ? "text-white"
                : "text-nino-700/50 hover:text-nino-950 hover:bg-nino-50/50"
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="active-delivery-tab"
                className="absolute inset-0 rounded-xl bg-nino-950"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <path d={tab.icon} />
            </svg>
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="bg-white rounded-2xl border border-nino-200/30 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-nino-950">
            {activeTabData.label}
          </h2>
          <p className="text-sm text-nino-800/40 mt-1">
            {activeTabData.desc}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === "zones" ? (
              loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl border border-nino-200/20 bg-white p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-16 bg-nino-100/50 rounded" />
                          <div className="h-9 bg-nino-100/50 rounded-lg" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-16 bg-nino-100/50 rounded" />
                          <div className="h-9 bg-nino-100/50 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ZoneEditor
                  zones={zones}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )
            ) : (
              <ShippingCompanyEditor />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
