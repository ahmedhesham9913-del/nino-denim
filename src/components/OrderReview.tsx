"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CURRENCY } from "@/lib/delivery-zones";
import type { Customer, DeliveryZone, CartItem } from "@/lib/types";

interface OrderReviewProps {
  customer: Customer;
  deliveryZone: DeliveryZone;
  items: CartItem[];
  notes: string;
  onNotesChange: (notes: string) => void;
  onPlaceOrder: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function OrderReview({
  customer,
  deliveryZone,
  items,
  notes,
  onNotesChange,
  onPlaceOrder,
  onBack,
  isSubmitting,
  error,
}: OrderReviewProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = subtotal + deliveryZone.fee;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Customer Info */}
      <div className="bg-nino-50/40 rounded-xl p-4">
        <h4 className="font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-nino-500 mb-3">
          DELIVERY INFORMATION
        </h4>
        <div className="space-y-1.5 font-[var(--font-body)] text-sm text-nino-950">
          <p className="font-medium">{customer.name}</p>
          <p className="text-nino-600">{customer.phone}</p>
          <p className="text-nino-600">{customer.address}</p>
        </div>
      </div>

      {/* Items */}
      <div>
        <h4 className="font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-nino-500 mb-3">
          ORDER ITEMS
        </h4>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-3"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-nino-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-display)] text-sm font-medium text-nino-950 truncate">
                  {item.name}
                </p>
                <p className="font-[var(--font-body)] text-xs text-nino-500">
                  Size: {item.size} &middot; Qty: {item.quantity}
                </p>
              </div>
              <span className="font-[var(--font-display)] text-sm font-bold text-nino-950 flex-shrink-0">
                {item.price * item.quantity} {CURRENCY}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-nino-200/40 pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-[var(--font-body)] text-sm text-nino-500">Subtotal</span>
          <span className="font-[var(--font-display)] text-sm font-medium text-nino-950">
            {subtotal} {CURRENCY}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-[var(--font-body)] text-sm text-nino-500">
            Delivery ({deliveryZone.name})
          </span>
          <span className="font-[var(--font-display)] text-sm font-medium text-nino-950">
            {deliveryZone.fee} {CURRENCY}
          </span>
        </div>
        <div className="border-t border-nino-200/40 pt-3 flex items-center justify-between">
          <span className="font-[var(--font-display)] text-base font-bold tracking-wide text-nino-950">
            Total
          </span>
          <span className="font-[var(--font-display)] text-xl font-bold text-nino-950">
            {grandTotal} {CURRENCY}
          </span>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-nino-50/40 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-nino-100 flex items-center justify-center flex-shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-nino-600"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M2 10h20" />
            <path d="M6 14h4" />
          </svg>
        </div>
        <div>
          <p className="font-[var(--font-display)] text-sm font-medium text-nino-950">
            Cash on Delivery
          </p>
          <p className="font-[var(--font-body)] text-xs text-nino-500">
            Pay when you receive your order
          </p>
        </div>
      </div>

      {/* Order Notes */}
      <div>
        <label className="block font-[var(--font-display)] text-sm font-medium tracking-wide text-nino-950 mb-1.5">
          Order Notes <span className="text-nino-400 text-xs">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Any special instructions for your order..."
          rows={3}
          className="w-full font-[var(--font-body)] text-sm text-nino-950 bg-white border border-nino-200/50 rounded-xl px-4 py-3 outline-none transition-colors duration-200 placeholder:text-nino-300 focus:border-nino-500 resize-none"
        />
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-[var(--font-body)] text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className={`
            w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold rounded-full py-3.5
            transition-colors duration-300
            ${isSubmitting
              ? "bg-nino-400 text-white cursor-not-allowed"
              : "bg-nino-950 text-white hover:bg-nino-800"
            }
          `}
        >
          {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full font-[var(--font-display)] text-xs tracking-[0.15em] font-semibold text-nino-500 hover:text-nino-950 transition-colors duration-300 py-2 disabled:opacity-50"
        >
          BACK
        </button>
      </div>
    </motion.div>
  );
}
