import type { AppProps } from "next/app";
import "@/styles/globals.css";
import posthog from "posthog-js";
import { useEffect } from "react";
import { publicEnv } from "@/lib/env";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize PostHog client-side only.
    if (!publicEnv.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (posthog.__loaded) return;

    posthog.init(publicEnv.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: publicEnv.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false
    });
  }, []);

  return <Component {...pageProps} />;
}

