import posthog from "posthog-js";

export type AnalyticsEvent = "listing_viewed" | "listing_created" | "search_performed";

/**
 * PostHog tracking helper.
 * - PostHog is initialized in `pages/_app.tsx` (client-side only).
 * - This function is safe to call anywhere in client code; it no-ops if PostHog isn't ready.
 */
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

