-- BetterInsight: independent member profiles (no production BetInsight impact).
-- The eventual shared BetInsight/BetterInsight sign-in needs its own
-- secure identity integration; this table alone does not provide SSO.
BEGIN;

CREATE TABLE IF NOT EXISTS public.market_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL
    CHECK (char_length(btrim(display_name)) BETWEEN 2 AND 70),
  country_code text REFERENCES public.market_countries(country_code),
  city text,
  avatar_url text,
  bio text,
  account_status text NOT NULL DEFAULT 'pending'
    CHECK (account_status IN ('pending', 'active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS market_profiles_country_idx
  ON public.market_profiles (country_code);

ALTER TABLE public.market_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles stay inaccessible through public and authenticated API roles
-- until identity flows and row-level policies have been reviewed and tested.
REVOKE ALL ON TABLE public.market_profiles FROM PUBLIC, anon, authenticated;

COMMIT;

SELECT tablename, rowsecurity AS rls_aktiv,
       (SELECT count(*) FROM public.market_profiles) AS profile
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'market_profiles';
