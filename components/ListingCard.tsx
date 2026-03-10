import Link from "next/link";
import { Listing } from "@/lib/types";
import { formatDate, formatMoneyUSD } from "@/lib/format";

export function ListingCard({ listing }: { listing: Listing }) {
  const hasImage = Array.isArray(listing.image_urls) && listing.image_urls.length > 0;
  const coverImage = hasImage ? listing.image_urls![0] : null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-100 transition hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
    >
      <div className="relative h-40 w-full bg-zinc-100">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={listing.location}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            Photo coming soon
          </div>
        )}
        <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 shadow-sm">
          {formatMoneyUSD(listing.price)}
          <span className="ml-1 text-[11px] font-normal text-zinc-500">/mo</span>
        </div>
        <div className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-blue-600/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-blue-50 shadow-sm">
          Summer sublease
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">{listing.location}</div>
            <div className="mt-1 text-xs text-zinc-600">
              {listing.bedrooms} bd · {listing.bathrooms} ba
            </div>
          </div>
          <div className="rounded-lg bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-600">
            Starts {formatDate(listing.lease_start)}
          </div>
        </div>

        <div className="mt-2 text-xs text-zinc-500">
          Lease through {formatDate(listing.lease_end)}
        </div>

        <div className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-700">
          {listing.description}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            View details
          </span>
          <span className="text-sm font-medium text-blue-700 opacity-0 transition group-hover:opacity-100">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}

