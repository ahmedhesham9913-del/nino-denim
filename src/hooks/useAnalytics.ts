"use client";

import { useCallback, useRef } from "react";
import { trackEvent } from "@/lib/supabase";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("nino_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("nino_session_id", id);
  }
  return id;
}

export function useAnalytics() {
  const sessionId = useRef<string>("");

  if (typeof window !== "undefined" && !sessionId.current) {
    sessionId.current = getSessionId();
  }

  const trackProductView = useCallback(
    (productId: string, source?: string) => {
      trackEvent({
        event_type: "product_view",
        product_id: productId,
        session_id: sessionId.current,
        metadata: source ? { source } : undefined,
      });
    },
    []
  );

  const trackAddToCart = useCallback(
    (productId: string, color: string, size: string, price: number) => {
      trackEvent({
        event_type: "add_to_cart",
        product_id: productId,
        session_id: sessionId.current,
        metadata: { color, size, price },
      });
    },
    []
  );

  const trackCheckoutStarted = useCallback(
    (itemCount: number, subtotal: number) => {
      trackEvent({
        event_type: "checkout_started",
        session_id: sessionId.current,
        metadata: { item_count: itemCount, subtotal },
      });
    },
    []
  );

  const trackOrderCreated = useCallback(
    (orderId: string, total: number, itemCount: number) => {
      trackEvent({
        event_type: "order_created",
        session_id: sessionId.current,
        metadata: { order_id: orderId, total, item_count: itemCount },
      });
    },
    []
  );

  const trackFilterApplied = useCallback(
    (filters: Record<string, unknown>) => {
      trackEvent({
        event_type: "filter_applied",
        session_id: sessionId.current,
        metadata: filters,
      });
    },
    []
  );

  return {
    trackProductView,
    trackAddToCart,
    trackCheckoutStarted,
    trackOrderCreated,
    trackFilterApplied,
  };
}
