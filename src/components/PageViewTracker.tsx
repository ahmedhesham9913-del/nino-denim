"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/supabase";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith("/admin")) return;

    let sessionId = "";
    if (typeof window !== "undefined") {
      sessionId = sessionStorage.getItem("nino_session_id") || "";
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("nino_session_id", sessionId);
      }
    }

    trackEvent({
      event_type: "page_view",
      session_id: sessionId,
      metadata: { path: pathname },
    });
  }, [pathname]);

  return null;
}
