import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { AnalyticsEvent } from "./types";

export const supabase = createClient(
  env.supabase.url,
  env.supabase.anonKey
);

/**
 * Fire-and-forget analytics event tracking.
 * Logs errors to console but never throws — analytics
 * MUST NOT block the user experience.
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const { error } = await supabase.from("events").insert({
      event_type: event.event_type,
      user_id: event.user_id ?? null,
      product_id: event.product_id ?? null,
      metadata: event.metadata ?? {},
      session_id: event.session_id ?? null,
    });

    if (error) {
      console.error("[analytics] Failed to track event:", error.message);
    }
  } catch (err) {
    console.error(
      "[analytics] Unexpected error:",
      err instanceof Error ? err.message : err
    );
  }
}
