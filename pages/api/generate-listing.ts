import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getOpenAIClient } from "@/api/openai";

/**
 * OpenAI-powered listing generator (server-side).
 * - Receives a messy, informal snippet from the user.
 * - Returns a clean description + best-effort parsed fields.
 *
 * This keeps your OpenAI API key on the server (never in the browser).
 */

const requestSchema = z.object({
  messy: z.string().min(1).max(2000)
});

const responseSchema = z.object({
  description: z.string().min(1),
  parsed: z
    .object({
      price: z.number().int().positive().optional(),
      bedrooms: z.number().int().nonnegative().optional(),
      bathrooms: z.number().int().nonnegative().optional(),
      address: z.string().min(1).optional(),
      lease_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      lease_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    })
    .optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsedReq = requestSchema.safeParse(req.body);
  if (!parsedReq.success) return res.status(400).json({ error: parsedReq.error.message });

  let client;
  try {
    client = getOpenAIClient();
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : "OPENAI_API_KEY is not set" });
  }

  try {
    const prompt = [
      "You are helping students post sublease listings for UCLA (Westwood).",
      "Convert the user's messy text into a clean listing description.",
      "Also attempt to parse structured fields if present.",
      "",
      "Return ONLY valid JSON with this shape:",
      JSON.stringify(
        {
          description: "string (clean, readable, 3-8 sentences)",
          parsed: {
            price: "optional integer monthly USD",
            bedrooms: "optional integer (0 for studio allowed)",
            bathrooms: "optional integer",
            address: "optional text",
            lease_start: "optional YYYY-MM-DD",
            lease_end: "optional YYYY-MM-DD"
          }
        },
        null,
        2
      ),
      "",
      "User input:",
      parsedReq.data.messy
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Return only JSON. No markdown. No extra keys." },
        { role: "user", content: prompt }
      ]
    });

    const text = completion.choices[0]?.message?.content ?? "";
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "AI returned non-JSON output. Try again." });
    }

    const parsed = responseSchema.safeParse(json);
    if (!parsed.success) return res.status(502).json({ error: "AI returned invalid JSON schema. Try again." });

    return res.status(200).json({ result: parsed.data });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Unexpected error" });
  }
}

