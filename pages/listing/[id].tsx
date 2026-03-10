import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";
import { Listing } from "@/lib/types";
import { formatDate, formatMoneyUSD } from "@/lib/format";
import { track } from "@/lib/analytics";

export default function ListingDetailPage({ listing }: { listing: Listing | null }) {
  const router = useRouter();
  const [canDelete, setCanDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!listing) return;
    track("listing_viewed", { listing_id: listing.id, price: listing.price, bedrooms: listing.bedrooms });
  }, [listing]);

  useEffect(() => {
    if (!listing) return;
    let cancelled = false;
    void (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!cancelled) {
        setCanDelete(!!user?.id && user.id === listing.user_id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listing]);

  async function handleDelete() {
    if (!listing) return;
    if (!window.confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase.from("listings").delete().eq("id", listing.id);
    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
      return;
    }
    await router.push("/");
  }

  if (!listing) {
    return (
      <Layout>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="text-lg font-semibold">Listing not found</div>
          <p className="mt-2 text-sm text-zinc-600">It may have been removed.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
            ← Back to marketplace
          </Link>
        </div>
      </Layout>
    );
  }

  const mailto = `mailto:${encodeURIComponent(listing.contact_email)}?subject=${encodeURIComponent(
    "BruinLease Sublease Inquiry"
  )}&body=${encodeURIComponent(`Hi! I'm interested in your listing at ${listing.address}.\n\nIs it still available?`)}`;

  return (
    <Layout>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-600">Listing</div>
          <h1 className="text-2xl font-semibold tracking-tight">{listing.address}</h1>
          <div className="mt-2 text-sm text-zinc-700">
            {listing.bedrooms} bd · {listing.bathrooms} ba · {formatMoneyUSD(listing.price)}/mo
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            {formatDate(listing.lease_start)} → {formatDate(listing.lease_end)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete listing"}
            </button>
          )}
          <a
            href={mailto}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Contact Poster
          </a>
        </div>
      </div>

      {deleteError ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {deleteError}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {Array.isArray(listing.image_urls) && listing.image_urls.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.image_urls[0]}
                alt={listing.address}
                className="h-64 w-full object-cover md:h-80"
              />
            </div>
          ) : null}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold">Description</div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{listing.description}</p>
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold">Contact</div>
            <div className="mt-2 text-sm text-zinc-700">{listing.contact_email}</div>
            <a href={mailto} className="mt-4 inline-flex w-full justify-center rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50">
              Email
            </a>
          </div>
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold">Lease dates</div>
            <div className="mt-2 text-sm text-zinc-700">
              <div>
                <span className="text-zinc-500">Start:</span> {formatDate(listing.lease_start)}
              </div>
              <div className="mt-1">
                <span className="text-zinc-500">End:</span> {formatDate(listing.lease_end)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = String(ctx.params?.id ?? "");

  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();

  if (error) {
    return { props: { listing: null } };
  }

  return { props: { listing: (data ?? null) as Listing | null } };
};

