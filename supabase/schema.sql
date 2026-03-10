-- BruinLease MVP schema
-- Create the `listings` table and enable RLS with simple public policies for MVP browsing + posting.
-- You can tighten these policies later (auth-required, email verification, etc.).

create extension if not exists "pgcrypto";

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  price integer not null check (price > 0),
  bedrooms integer not null check (bedrooms >= 0),
  bathrooms integer not null check (bathrooms >= 0),
  location text not null,
  lease_start date not null,
  lease_end date not null,
  description text not null,
  contact_email text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes for feed + filters
create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_price_idx on public.listings (price);
create index if not exists listings_bedrooms_idx on public.listings (bedrooms);
create index if not exists listings_lease_start_idx on public.listings (lease_start);

alter table public.listings enable row level security;

-- Public read access (marketplace browsing)
drop policy if exists "Public can read listings" on public.listings;
create policy "Public can read listings"
on public.listings
for select
to anon, authenticated
using (true);

-- Public insert access (MVP posting)
-- NOTE: For production you likely want authenticated-only + rate limits + email validation.
drop policy if exists "Public can create listings" on public.listings;
create policy "Public can create listings"
on public.listings
for insert
to anon, authenticated
with check (true);

