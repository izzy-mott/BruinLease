import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { ListingCard } from "@/components/ListingCard";
import { FiltersBar, FiltersState } from "@/components/FiltersBar";
import { supabase } from "@/lib/supabaseClient";
import { Listing } from "@/lib/types";
import { track } from "@/lib/analytics";

function buildListingsQuery(filters: FiltersState) {
  let query = supabase.from("listings").select("*").order("created_at", { ascending: false });

  if (typeof filters.minPrice === "number") query = query.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") query = query.lte("price", filters.maxPrice);
  if (typeof filters.bedrooms === "number") query = query.gte("bedrooms", filters.bedrooms);
  if (filters.leaseStart) query = query.gte("lease_start", filters.leaseStart);

  return query;
}

export default function HomePage() {
  const [filters, setFilters] = useState<FiltersState>({});
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await buildListingsQuery(filters);

    if (error) {
      setError(error.message);
      setListings([]);
      setLoading(false);
      return;
    }

    setListings((data ?? []) as Listing[]);
    setLoading(false);

    track("search_performed", {
      filters,
      results_count: (data ?? []).length
    });
  }, [filters]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  return (
    <Layout>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Summer Sublease Marketplace</h1>
          <p className="mt-1 text-sm text-zinc-600">
            UCLA-focused listings for Westwood and nearby. Use filters to narrow results.
          </p>
        </div>
        <div className="text-sm text-zinc-600">{activeFilterCount ? `${activeFilterCount} filters` : "All listings"}</div>
      </div>

      <div className="mt-5">
        <FiltersBar value={filters} onChange={setFilters} onSearch={fetchListings} />
      </div>

      <div className="mt-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : loading ? (
          <div className="text-sm text-zinc-600">Loading listings…</div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700">
            No listings matched your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

