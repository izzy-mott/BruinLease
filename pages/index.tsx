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
      <div className="flex flex-col gap-6">
        <section className="flex flex-col items-start justify-between gap-4 border-b border-dashed border-zinc-200 pb-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
              Summer Sublease Marketplace
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 md:text-[15px]">
              Discover UCLA-focused summer subleases in Westwood and nearby neighborhoods. Use flexible
              filters to quickly zero in on the right place for your dates and budget.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{activeFilterCount ? `${activeFilterCount} active filter${activeFilterCount > 1 ? "s" : ""}` : "Showing all listings"}</span>
          </div>
        </section>

        <section>
          <FiltersBar value={filters} onChange={setFilters} onSearch={fetchListings} />
        </section>

        <section aria-live="polite" className="mt-2">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
              <span>Loading listings…</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-center">
              <div className="text-sm font-medium text-zinc-900">No listings match your filters yet</div>
              <p className="mt-2 max-w-md text-sm text-zinc-600">
                Try widening your price range, selecting &quot;Any&quot; bedrooms, or adjusting the lease
                start date to see more options.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                onClick={() => setFilters({})}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

