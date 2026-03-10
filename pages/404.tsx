import Link from "next/link";
import { Layout } from "@/components/Layout";

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="text-lg font-semibold">Page not found</div>
        <p className="mt-2 text-sm text-zinc-600">Try returning to the marketplace feed.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
          ← Back to home
        </Link>
      </div>
    </Layout>
  );
}

