"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ColorsEditor from "@/components/admin/catalog/ColorsEditor";
import ChipEditor from "@/components/admin/catalog/ChipEditor";
import TagsEditor from "@/components/admin/catalog/TagsEditor";
import SizesEditor from "@/components/admin/catalog/SizesEditor";
import PaymentMethodsEditor from "@/components/admin/catalog/PaymentMethodsEditor";

type Tab =
  | "colors"
  | "categories"
  | "tags"
  | "sizes"
  | "payment_methods"
  | "styles";

const TABS: { key: Tab; label: string; icon: string; desc: string }[] = [
  {
    key: "colors",
    label: "Colors",
    desc: "Product color palette",
    icon: "M12 22a10 10 0 1 1 10-10c0 1.66-1.34 3-3 3h-1.5a1.5 1.5 0 0 0-1.5 1.5v1.5c0 1.66-1.34 3-3 3H12z",
  },
  {
    key: "categories",
    label: "Categories",
    desc: "Product categories",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  },
  {
    key: "tags",
    label: "Tags",
    desc: "Promotional badges",
    icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  },
  {
    key: "sizes",
    label: "Sizes",
    desc: "Size options per category",
    icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  },
  {
    key: "payment_methods",
    label: "Payment",
    desc: "Accepted payment methods",
    icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22",
  },
  {
    key: "styles",
    label: "Styles",
    desc: "Jeans cuts and fits",
    icon: "M16 11V7a4 4 0 0 0-8 0v4 M5 9h14l1 12H4L5 9z",
  },
];

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<Tab>("colors");

  const renderEditor = () => {
    switch (activeTab) {
      case "colors": return <ColorsEditor />;
      case "categories": return <ChipEditor taxonomy="categories" itemLabel="category" withSlug />;
      case "tags": return <TagsEditor />;
      case "sizes": return <SizesEditor />;
      case "payment_methods": return <PaymentMethodsEditor />;
      case "styles": return <ChipEditor taxonomy="styles" itemLabel="style" searchable />;
    }
  };

  const activeTabData = TABS.find((t) => t.key === activeTab)!;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-2xl font-bold text-nino-950 mb-2">
          Catalog Manager
        </h1>
        <p className="text-sm text-nino-800/40 font-[var(--font-display)]">
          Manage all product attributes — colors, categories, tags, sizes, payment methods, and styles
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 mb-8 p-2 rounded-2xl bg-white border border-nino-200/30">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-[var(--font-display)] text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeTab === tab.key
                ? "text-white"
                : "text-nino-700/50 hover:text-nino-950 hover:bg-nino-50/50"
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="active-catalog-tab"
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
          <h2 className="font-[var(--font-display)] text-lg font-bold text-nino-950">
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
            {renderEditor()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
