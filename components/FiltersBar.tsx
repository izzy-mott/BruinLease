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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-zinc-700">Min price</label>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="e.g. 900"
            value={value.minPrice ?? ""}
            onChange={(e) => onChange({ ...value, minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">Max price</label>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="e.g. 1800"
            value={value.maxPrice ?? ""}
            onChange={(e) => onChange({ ...value, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">Bedrooms</label>
          <select
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            value={value.bedrooms ?? ""}
            onChange={(e) => onChange({ ...value, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
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
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            value={value.leaseStart ?? ""}
            onChange={(e) => onChange({ ...value, leaseStart: e.target.value || undefined })}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
          onClick={() => {
            onChange({});
            onSearch();
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={onSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
}

