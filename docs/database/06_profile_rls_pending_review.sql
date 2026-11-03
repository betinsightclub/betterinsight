-- BetterInsight-dev ONLY: staged for review. Not yet applied.
-- Gives authenticated BetterInsight users access only to their own profile.
-- No grants to change account_status; moderators manage verification separately.
-- Never execute on BetInsight's production Supabase project.
BEGIN;

ALTER TABLE public.market_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_countries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.market_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.market_countries FROM PUBLIC, anon, authenticated;

-- Public country names are reference data; no public profile disclosure.
GRANT SELECT ON TABLE public.market_countries TO anon, authenticated;
DROP POLICY IF EXISTS "market_countries_public_read" ON public.market_countries;
CREATE POLICY "market_countries_public_read"
  ON public.market_countries FOR SELECT TO anon, authenticated
  USING (launch_status IN ('planned', 'live'));

-- Only the signed-in member may see their profile (including account status).
GRANT SELECT ON TABLE public.market_profiles TO authenticated;
GRANT INSERT (id, display_name, country_code, city)
  ON TABLE public.market_profiles TO authenticated;
GRANT UPDATE (display_name, country_code, city, bio, avatar_url)
  ON TABLE public.market_profiles TO authenticated;

DROP POLICY IF EXISTS "market_profiles_read_own" ON public.market_profiles;
CREATE POLICY "market_profiles_read_own"
  ON public.market_profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "market_profiles_insert_own" ON public.market_profiles;
CREATE POLICY "market_profiles_insert_own"
  ON public.market_profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "market_profiles_update_own" ON public.market_profiles;
CREATE POLICY "market_profiles_update_own"
  ON public.market_profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

COMMIT;

-- Manual review checklist:
-- 1) Supabase project ref MUST be nefgspsbamcsmrjkpnis.
-- 2) Verify anon cannot SELECT market_profiles.
-- 3) Verify authenticated user A cannot read/update profile of B.
-- 4) Verify neither A nor B can change account_status.
-- 5) Verify confirmed user can INSERT and UPDATE only their own profile.
-- 6) Only after review generate an actual migration with Supabase CLI.
