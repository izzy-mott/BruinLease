import type { NextApiRequest, NextApiResponse } from "next";
import { serverOnlyEnv } from "@/lib/env";

type Suggestion = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

type PlacesResponse = {
  suggestions: Suggestion[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<PlacesResponse | { error: string }>) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = String(req.query.q ?? "").trim();
  if (!query) {
    return res.status(200).json({ suggestions: [] });
  }

  if (!serverOnlyEnv.MAPBOX_ACCESS_TOKEN) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
    );
    url.searchParams.set("autocomplete", "true");
    url.searchParams.set("limit", "5");
    // Bias around UCLA (Westwood)
    url.searchParams.set("proximity", "-118.4452,34.0689");
    url.searchParams.set("access_token", serverOnlyEnv.MAPBOX_ACCESS_TOKEN);

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      return res.status(200).json({ suggestions: [] });
    }

    const json = (await resp.json()) as {
      features?: { id: string; place_name: string; center: [number, number] }[];
    };

    const suggestions: Suggestion[] =
      json.features?.map((f) => ({
        id: f.id,
        label: f.place_name,
        lat: f.center[1],
        lng: f.center[0]
      })) ?? [];

    return res.status(200).json({ suggestions });
  } catch {
    return res.status(200).json({ suggestions: [] });
  }
}

