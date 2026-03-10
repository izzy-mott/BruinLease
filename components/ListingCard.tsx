import Link from "next/link";
import { Listing } from "@/lib/types";
import { formatDate, formatMoneyUSD } from "@/lib/format";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{formatMoneyUSD(listing.price)}/mo</div>
          <div className="mt-1 text-sm text-zinc-700">
            {listing.bedrooms} bd · {listing.bathrooms} ba
          </div>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Summer sublease
        </div>
      </div>

      <div className="mt-3 text-sm font-medium text-zinc-900">{listing.location}</div>
      <div className="mt-1 text-xs text-zinc-600">
        {formatDate(listing.lease_start)} → {formatDate(listing.lease_end)}
      </div>

      <div className="mt-3 max-h-10 overflow-hidden text-sm text-zinc-700">{listing.description}</div>

      <div className="mt-4 text-sm font-medium text-blue-700 opacity-0 transition group-hover:opacity-100">
        View details →
      </div>
    </Link>
  );
}

