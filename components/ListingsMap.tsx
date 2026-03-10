import { useEffect, useRef } from "react";
import { Listing } from "@/lib/types";
import { publicEnv } from "@/lib/env";

type Props = {
  listings: Listing[];
};

export function ListingsMap({ listings }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;
    if (!publicEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return;

    let cancelled = false;

    void (async () => {
      const mapboxgl = (await import("mapbox-gl")).default as any;
      mapboxgl.accessToken = publicEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      const withCoords = listings.filter(
        (l) => typeof l.lat === "number" && typeof l.lng === "number"
      );

      const defaultCenter: [number, number] = [-118.4452, 34.0689]; // UCLA
      const center: [number, number] =
        withCoords.length > 0
          ? [withCoords[0].lng as number, withCoords[0].lat as number]
          : defaultCenter;

      if (!containerRef.current || cancelled) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center,
        zoom: 13
      });

      mapRef.current = map;

      withCoords.forEach((listing) => {
        if (typeof listing.lat !== "number" || typeof listing.lng !== "number") return;
        const el = document.createElement("button");
        el.type = "button";
        el.className =
          "rounded-full bg-blue-600 shadow-md border border-white w-3 h-3 md:w-3.5 md:h-3.5";
        el.onclick = () => {
          window.location.href = `/listing/${listing.id}`;
        };
        new mapboxgl.Marker(el).setLngLat([listing.lng, listing.lat]).addTo(map);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [listings]);

  const hasAnyCoords = listings.some(
    (l) => typeof l.lat === "number" && typeof l.lng === "number"
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-600">
        <span>Listings near UCLA</span>
        {!publicEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
          <span className="text-[11px] text-zinc-400">Map not configured</span>
        )}
      </div>
      <div
        ref={containerRef}
        className={`h-64 w-full rounded-b-2xl bg-zinc-100 md:h-80 ${
          !hasAnyCoords ? "flex items-center justify-center text-xs text-zinc-500" : ""
        }`}
      >
        {!hasAnyCoords && "Listings with valid map locations will appear here."}
      </div>
    </section>
  );
}

