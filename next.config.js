/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Allow using `POSTHOG_KEY` (as requested) while still exposing it to the browser.
   * Next.js only exposes env vars prefixed with `NEXT_PUBLIC_` by default.
   */
  env: {
    // Public client-side vars for Supabase (safe to expose: URL + anon key).
    SUPABASE_URL: process.env.SUPABASE_URL ?? "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? "",
    // PostHog key mapping (POSTHOG_KEY -> NEXT_PUBLIC_POSTHOG_KEY)
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.POSTHOG_KEY ?? ""
  }
};

module.exports = nextConfig;

