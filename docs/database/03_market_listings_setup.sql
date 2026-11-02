-- BetterInsight: first secure advertisement table (not publicly accessible yet).
-- Intended ONLY for betterinsight-dev, never for the existing BetInsight database.
BEGIN;

CREATE TABLE IF NOT EXISTS public.market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  country_code text NOT NULL REFERENCES public.market_countries(country_code),
  category_code text NOT NULL REFERENCES public.market_categories(category_code),
  listing_type text NOT NULL
    CHECK (listing_type IN ('item', 'service', 'external_link')),
  seller_type text NOT NULL
    CHECK (seller_type IN ('private', 'business')),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 5 AND 140),
  description text,
  item_condition text
    CHECK (item_condition IN ('new', 'like_new', 'used', 'needs_repair')),
  price numeric(12,2) CHECK (price >= 0),
  external_url text CHECK (external_url ~* '^https://[^[:space:]]+$'),
  city text,
  postal_code text,
  images text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'sold', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  CHECK (listing_type <> 'external_link' OR external_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS market_listings_discovery_idx
  ON public.market_listings (country_code, status, created_at DESC);
CREATE INDEX IF NOT EXISTS market_listings_category_idx
  ON public.market_listings (category_code, status);
CREATE INDEX IF NOT EXISTS market_listings_seller_idx
  ON public.market_listings (seller_id, created_at DESC);

ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Until user onboarding, moderation and RLS policies are reviewed,
-- allow no anonymous or authenticated access to this new table.
REVOKE ALL ON TABLE public.market_listings FROM PUBLIC, anon, authenticated;

COMMIT;

SELECT tablename, rowsecurity AS rls_aktiv,
       (SELECT COUNT(*) FROM public.market_listings) AS anzeigen
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'market_listings';
