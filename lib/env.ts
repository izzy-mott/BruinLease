import { z } from "zod";

/**
 * Centralized env parsing.
 * - Public envs can be used in browser code (Supabase URL + anon key, PostHog key).
 * - Server-only secrets (OpenAI) must only be referenced from API routes / server code.
 */

const publicSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional()
});

const serverOnlySchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  MAPBOX_ACCESS_TOKEN: z.string().min(1).optional()
});

export const publicEnv = publicSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST
});

export const serverOnlyEnv = serverOnlySchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN
});

