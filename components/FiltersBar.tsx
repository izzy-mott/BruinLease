import { useMemo } from "react";

export type FiltersState = {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  leaseStart?: string; // YYYY-MM-DD
};

export function FiltersBar({
  value,
  onChange,
  onSearch
}: {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  onSearch: () => void;
}) {
  const bedroomsOptions = useMemo(() => [0, 1, 2, 3, 4], []);

  return (
    <section
      aria-label="Filter listings"
      className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm shadow-zinc-100 backdrop-blur-sm md:p-5"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Filters</div>
        <div className="hidden text-xs text-zinc-500 md:block">
          Tune price, bedrooms, and lease start to narrow results.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700">Monthly rent (min)</label>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="From e.g. 900"
            value={value.minPrice ?? ""}
            onChange={(e) =>
              onChange({ ...value, minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">Monthly rent (max)</label>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Up to e.g. 1,800"
            value={value.maxPrice ?? ""}
            onChange={(e) =>
              onChange({ ...value, maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">Bedrooms</label>
          <select
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={value.bedrooms ?? ""}
            onChange={(e) =>
              onChange({ ...value, bedrooms: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Any</option>
            {bedroomsOptions.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Studio" : `${n}+`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">Lease start (on/after)</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            value={value.leaseStart ?? ""}
            onChange={(e) => onChange({ ...value, leaseStart: e.target.value || undefined })}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border-t border-dashed border-zinc-200 pt-4 text-sm md:flex-row md:items-center">
        <div className="text-xs text-zinc-500 md:text-[13px]">
          Tip: Start broad, then add more filters if you see too many results.
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            onClick={() => {
              onChange({});
              onSearch();
            }}
          >
            Clear all
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            onClick={onSearch}
          >
            Search listings
          </button>
        </div>
      </div>
    </section>
  );
}

