import Link from "next/link";
import { PropsWithChildren } from "react";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
              BL
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight md:text-lg">BruinLease</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Summer subleases
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Browse
            </Link>
            <Link
              href="/post"
              className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            >
              Post listing
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
}

