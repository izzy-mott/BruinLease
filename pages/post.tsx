import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";
import { ListingInsert } from "@/lib/types";
import { track } from "@/lib/analytics";

type GeneratorResult = {
  description: string;
  parsed?: Partial<Pick<ListingInsert, "price" | "bedrooms" | "bathrooms" | "address" | "lease_start" | "lease_end">>;
};

type AddressSuggestion = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

export default function PostListingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messy, setMessy] = useState("");
  const [generating, setGenerating] = useState(false);

  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState<ListingInsert>({
    user_id: null,
    address: "",
    lat: null,
    lng: null,
    price: 1200,
    bedrooms: 2,
    bathrooms: 2,
    lease_start: "",
    lease_end: "",
    description: "",
    contact_email: "",
    image_urls: null
  });

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const canGenerate = useMemo(() => messy.trim().length > 0 && !generating, [messy, generating]);
  const canSubmit = useMemo(
    () =>
      !submitting &&
      !uploadingImages &&
      !!form.address &&
      !!form.lease_start &&
      !!form.lease_end &&
      !!form.contact_email,
    [submitting, uploadingImages, form.address, form.lease_start, form.lease_end, form.contact_email]
  );

  useEffect(() => {
    if (!form.address || form.address.trim().length < 3) {
      setAddressSuggestions([]);
      setAddressLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setAddressLoading(true);
        const res = await fetch(`/api/places?q=${encodeURIComponent(form.address)}`, {
          signal: controller.signal
        });
        if (!res.ok) {
          setAddressSuggestions([]);
          setAddressLoading(false);
          return;
        }
        const json = (await res.json()) as { suggestions: AddressSuggestion[] };
        setAddressSuggestions(json.suggestions ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setAddressSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAddressLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [form.address]);

  async function onGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-listing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messy })
      });
      const json = (await res.json()) as { result?: GeneratorResult; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to generate listing.");

      const result = json.result!;

      setForm((prev) => ({
        ...prev,
        description: result.description || prev.description,
        ...(result.parsed?.price ? { price: result.parsed.price } : {}),
        ...(typeof result.parsed?.bedrooms === "number" ? { bedrooms: result.parsed.bedrooms } : {}),
        ...(typeof result.parsed?.bathrooms === "number" ? { bathrooms: result.parsed.bathrooms } : {}),
        ...(result.parsed?.address ? { address: result.parsed.address } : {}),
        ...(result.parsed?.lease_start ? { lease_start: result.parsed.lease_start } : {}),
        ...(result.parsed?.lease_end ? { lease_end: result.parsed.lease_end } : {})
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate listing.");
    } finally {
      setGenerating(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      let lat: number | null = null;
      let lng: number | null = null;

      if (selectedCoords) {
        lat = selectedCoords.lat;
        lng = selectedCoords.lng;
      }

      let imageUrls: string[] | undefined;

      if (files && files.length > 0) {
        setUploadingImages(true);

        const uploads = await Promise.all(
          Array.from(files).map(async (file) => {
            const fileExt = file.name.split(".").pop() || "jpg";
            const path = `listing-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file, {
              cacheControl: "3600",
              upsert: false
            });
            if (uploadError) throw uploadError;
            const {
              data: { publicUrl }
            } = supabase.storage.from("listing-images").getPublicUrl(path);
            return publicUrl;
          })
        );

        imageUrls = uploads;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      const payload: ListingInsert = {
        ...form,
        ...(imageUrls ? { image_urls: imageUrls } : {}),
        ...(lat !== null && lng !== null ? { lat, lng } : {}),
        ...(user?.id ? { user_id: user.id } : {})
      };

      const { data, error } = await supabase.from("listings").insert(payload).select("id").single();

      if (error) {
        throw error;
      }

      track("listing_created", { listing_id: data.id, price: form.price, bedrooms: form.bedrooms });
      await router.push(`/listing/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing.");
      setSubmitting(false);
      setUploadingImages(false);
      return;
    }

  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold tracking-tight">Post a Listing</h1>
      <p className="mt-1 text-sm text-zinc-600">Fill out the form or paste a messy summary and let AI clean it up.</p>

      {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold">AI listing generator</div>
        <p className="mt-1 text-xs text-zinc-600">Example: “2 bed near Westwood $1200 June to Aug”</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <textarea
            className="min-h-[44px] w-full resize-y rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Paste messy description…"
            value={messy}
            onChange={(e) => setMessy(e.target.value)}
          />
          <button
            type="button"
            className="h-11 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!canGenerate}
            onClick={onGenerate}
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-700">Price (per month)</label>
            <input
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-zinc-700">Address</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Street, building, or address near UCLA"
              value={form.address}
              onChange={(e) => {
                setSelectedCoords(null);
                setForm({ ...form, address: e.target.value });
              }}
            />
            {addressLoading && (
              <div className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
            )}
            {addressSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg">
                {addressSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-xs text-zinc-800 hover:bg-zinc-50"
                    onClick={() => {
                      setForm({ ...form, address: s.label });
                      setSelectedCoords({ lat: s.lat, lng: s.lng });
                      setAddressSuggestions([]);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">Bedrooms</label>
            <input
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">Bathrooms</label>
            <input
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">Lease start</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={form.lease_start}
              onChange={(e) => setForm({ ...form, lease_start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">Lease end</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              value={form.lease_end}
              onChange={(e) => setForm({ ...form, lease_end: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">Description</label>
            <textarea
              className="mt-1 min-h-[140px] w-full resize-y rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="What should renters know?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">Contact email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="you@ucla.edu"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">Listing photos</label>
            <p className="mt-1 text-xs text-zinc-500">
              Add one or more photos of the space (JPEG or PNG). First image will be used as the cover.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-2 block w-full text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200"
              onChange={(e) => setFiles(e.target.files)}
            />
            {files && files.length > 0 ? (
              <div className="mt-2 text-xs text-zinc-600">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!canSubmit}
          >
            {submitting ? "Submitting…" : "Create listing"}
          </button>
        </div>
      </form>
    </Layout>
  );
}

