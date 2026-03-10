import OpenAI from "openai";
import { serverOnlyEnv } from "@/lib/env";

/**
 * Server-only OpenAI client factory.
 * Keeping it here avoids accidentally importing OpenAI (and env access)
 * into browser bundles.
 */
export function getOpenAIClient() {
  if (!serverOnlyEnv.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: serverOnlyEnv.OPENAI_API_KEY });
}

