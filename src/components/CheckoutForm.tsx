"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { placeOrder } from "@/services/orders";
import { getZones } from "@/services/delivery-zones";
import { stripHtml, sanitizePhone, sanitizeAddress } from "@/lib/sanitize";
import type { Customer, DeliveryZone } from "@/lib/types";
import StepIndicator from "@/components/StepIndicator";
import LocationStep, { type LocationData } from "@/components/LocationStep";
import CustomerForm from "@/components/CustomerForm";
import DeliverySelector from "@/components/DeliverySelector";
import OrderReview from "@/components/OrderReview";

const STEPS_GPS = ["Location", "Information", "Review"];
const STEPS_MANUAL = ["Information", "Delivery", "Review"];
const SIGNATURE_EASE = [0.16, 1, 0.3, 1] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function CheckoutForm() {
  const router = useRouter();
  const { trackCheckoutStarted, trackOrderCreated } = useAnalytics();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [gpsMode, setGpsMode] = useState(true); // true = GPS flow, false = manual
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [customerData, setCustomerData] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
  });
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch zones for auto-resolution
  useEffect(() => {
    getZones()
      .then((z) => setZones(z.map((zone) => ({ name: zone.name, fee: zone.fee, governorates: zone.governorates }))))
      .catch(() => {});
    // Track checkout started
    if (items.length > 0) {
      trackCheckoutStarted(items.length, items.reduce((s, i) => s + i.price * i.quantity, 0));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
    setError(null);
  }, [step]);

  // Resolve zone from governorate name
  function resolveZone(governorate: string): DeliveryZone | null {
    for (const zone of zones) {
      if (zone.governorates?.some((g) => g.toLowerCase() === governorate.toLowerCase())) {
        return zone;
      }
    }
    // Fuzzy match: check if governorate contains or is contained in zone governorates
    for (const zone of zones) {
      if (zone.governorates?.some((g) =>
        g.toLowerCase().includes(governorate.toLowerCase()) ||
        governorate.toLowerCase().includes(g.toLowerCase())
      )) {
        return zone;
      }
    }
    return null;
  }

  /* GPS Flow - Step 1: Location confirmed */
  function handleLocationConfirm(data: LocationData) {
    setLocationData(data);
    setCustomerData((prev) => ({
      ...prev,
      address: data.address,
      location: { lat: data.lat, lng: data.lng, governorate: data.governorate },
    }));
    // Auto-resolve delivery zone from governorate
    const zone = resolveZone(data.governorate);
    if (zone) {
      setSelectedZone(zone);
    }
    goTo(2); // → Customer info
  }

  /* GPS skipped → switch to manual flow */
  function handleSkipGps() {
    setGpsMode(false);
    setStep(1); // reset to step 1 which is now CustomerForm
    setDirection(1);
  }

  /* Step: Customer info submitted */
  function handleCustomerSubmit(data: { name: string; phone: string; address: string }) {
    setCustomerData((prev) => ({ ...prev, ...data }));
    if (gpsMode && selectedZone) {
      // GPS mode: zone already resolved, go to review
      goTo(3);
    } else {
      // Manual mode: go to delivery selector
      goTo(2);
    }
  }

  /* Manual flow - Delivery zone selected */
  function handleZoneSelect(zone: DeliveryZone) {
    setSelectedZone(zone);
  }

  function handleDeliveryContinue() {
    if (selectedZone) goTo(3);
  }

  /* Place order */
  async function handlePlaceOrder() {
    if (!selectedZone) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const sanitizedCustomer: Customer = {
        name: stripHtml(customerData.name),
        phone: sanitizePhone(customerData.phone),
        address: sanitizeAddress(customerData.address),
        location: customerData.location,
      };

      const result = await placeOrder({
        items,
        customer: sanitizedCustomer,
        deliveryZone: selectedZone,
        location: locationData ? { lat: locationData.lat, lng: locationData.lng } : undefined,
        notes: orderNotes.trim() || undefined,
      });

      if (result.success) {
        trackOrderCreated(result.orderId, selectedZone.fee + items.reduce((s, i) => s + i.price * i.quantity, 0), items.length);
        clearCart();
        router.push(`/order/${result.orderId}`);
      } else if (result.unavailableItems && result.unavailableItems.length > 0) {
        setError(
          `The following items are no longer available: ${result.unavailableItems.join(", ")}. Please update your cart and try again.`
        );
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = gpsMode ? STEPS_GPS : STEPS_MANUAL;

  // Map visual step to content
  // GPS mode:  Step 1=Location, Step 2=CustomerForm, Step 3=Review
  // Manual:    Step 1=CustomerForm, Step 2=DeliverySelector, Step 3=Review

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-8">
        <StepIndicator currentStep={step} steps={steps} />
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* GPS Mode: Step 1 = Location */}
          {gpsMode && step === 1 && (
            <motion.div
              key="gps-location"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: SIGNATURE_EASE }}
            >
              <LocationStep
                onConfirm={handleLocationConfirm}
                onSkip={handleSkipGps}
              />
            </motion.div>
          )}

          {/* GPS Mode: Step 2 = Customer Form / Manual Mode: Step 1 = Customer Form */}
          {((gpsMode && step === 2) || (!gpsMode && step === 1)) && (
            <motion.div
              key="customer-form"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: SIGNATURE_EASE }}
            >
              <CustomerForm
                initialData={{
                  name: customerData.name,
                  phone: customerData.phone,
                  address: customerData.address,
                }}
                onSubmit={handleCustomerSubmit}
                onBack={gpsMode ? () => goTo(1) : undefined}
              />
              {/* Show auto-detected zone info in GPS mode */}
              {gpsMode && selectedZone && locationData && (
                <motion.div
                  className="mt-5 p-4 rounded-xl bg-green-50 border border-green-200/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-sm font-[var(--font-display)] font-semibold text-green-800">
                      Delivery auto-detected
                    </span>
                  </div>
                  <p className="text-xs text-green-700/70 font-[var(--font-body)]">
                    {locationData.governorate} — {selectedZone.name} zone ({selectedZone.fee} EGP)
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Manual Mode: Step 2 = Delivery Selector */}
          {!gpsMode && step === 2 && (
            <motion.div
              key="delivery-selector"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: SIGNATURE_EASE }}
            >
              <DeliverySelector
                selectedZone={selectedZone}
                onSelect={handleZoneSelect}
                onContinue={handleDeliveryContinue}
                onBack={() => goTo(1)}
              />
            </motion.div>
          )}

          {/* Step 3 = Review (both modes) */}
          {step === 3 && selectedZone && (
            <motion.div
              key="order-review"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: SIGNATURE_EASE }}
            >
              <OrderReview
                customer={customerData}
                deliveryZone={selectedZone}
                items={items}
                notes={orderNotes}
                onNotesChange={setOrderNotes}
                onPlaceOrder={handlePlaceOrder}
                onBack={() => goTo(2)}
                isSubmitting={isSubmitting}
                error={error}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
