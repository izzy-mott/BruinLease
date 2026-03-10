import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Supabase browser client.
 *
 * For an MVP marketplace, we use the Supabase anon key directly from the Next.js app.
 * Security is handled on the Supabase side via:
 * - Row Level Security (RLS)
 * - explicit policies (see `supabase/schema.sql`)
 *
 * IMPORTANT: anon key is safe to expose (it's designed for this).
 * Do NOT put service_role keys in the frontend.
 */
export const supabase = createClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

