# BruinLease (MVP)

UCLA-focused student summer subleasing marketplace.

## Tech stack
- Next.js (Pages Router) + Tailwind
- Supabase (Postgres) for data
- PostHog for analytics
- OpenAI API for listing generation
- Vercel for deployment

## Local setup
1. Install Node.js (LTS) and npm.
2. In this folder:

```bash
npm install
cp .env.example .env.local
npm run dev
```

3. Create the Supabase table by running the SQL in `supabase/schema.sql` in the Supabase SQL editor.

## Environment variables
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `POSTHOG_KEY` (recommended; automatically mapped to `NEXT_PUBLIC_POSTHOG_KEY`)
- `NEXT_PUBLIC_POSTHOG_KEY` (optional alternative)
- `NEXT_PUBLIC_POSTHOG_HOST` (optional; defaults to `https://us.i.posthog.com`)

## Project structure
- `pages/`: routes (homepage feed, listing detail, post listing, API routes)
- `components/`: UI building blocks
- `lib/`: Supabase client, analytics helpers, shared types
- `supabase/`: SQL schema for the `listings` table

