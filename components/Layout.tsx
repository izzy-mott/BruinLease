import Link from "next/link";
import { PropsWithChildren } from "react";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            BruinLease
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="rounded px-2 py-1 hover:bg-zinc-100">
              Browse
            </Link>
            <Link
              href="/post"
              className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
            >
              Post Listing
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

