import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";
import { ListingInsert } from "@/lib/types";
import { track } from "@/lib/analytics";

type GeneratorResult = {
  description: string;
  parsed?: Partial<Pick<ListingInsert, "price" | "bedrooms" | "bathrooms" | "location" | "lease_start" | "lease_end">>;
};

export default function PostListingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messy, setMessy] = useState("");
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState<ListingInsert>({
    price: 1200,
    bedrooms: 2,
    bathrooms: 2,
    location: "",
    lease_start: "",
    lease_end: "",
    description: "",
    contact_email: ""
  });

  const canGenerate = useMemo(() => messy.trim().length > 0 && !generating, [messy, generating]);
  const canSubmit = useMemo(() => !submitting && !!form.location && !!form.lease_start && !!form.lease_end && !!form.contact_email, [
    submitting,
    form.location,
    form.lease_start,
    form.lease_end,
    form.contact_email
  ]);

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
        ...(result.parsed?.location ? { location: result.parsed.location } : {}),
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

    const { data, error } = await supabase.from("listings").insert(form).select("id").single();

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    track("listing_created", { listing_id: data.id, price: form.price, bedrooms: form.bedrooms });
    await router.push(`/listing/${data.id}`);
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
          <div>
            <label className="block text-xs font-medium text-zinc-700">Location</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Westwood, Midvale Ave, etc."
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
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

