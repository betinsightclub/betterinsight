# BetterInsight: isolated Supabase migration workspace

**Target:** BetterInsight organization's `betterinsight-dev` project (Frankfurt), ref `nefgspsbamcsmrjkpnis`.

## Baseline already created manually in SQL Editor

The following scripts were already applied successfully on 2026-11-03 and are **documentation only**. Do NOT copy them into `supabase/migrations` or run them twice:

- `docs/database/01_dach_markets_setup.sql`
- `docs/database/02_categories_setup.sql`
- `docs/database/03_market_listings_setup.sql`
- `docs/database/04_messenger_foundation.sql`
- `docs/database/05_member_profiles_setup.sql`

Existing six tables: `market_countries`, `market_categories`, `market_listings`, `market_conversations`, `market_messages`, and `market_profiles`. All have RLS enabled; API access for users is not ready.

**Never run the fork's original `/supabase/migrations`**; those belong to the university marketplace.

## Future changes

Create new timestamped migrations under **this directory only**: `infra/betterinsight/supabase/migrations/`. Review migrations before application.

The `BetterInsight DB – manual check / apply` GitHub Action runs only when explicitly requested. The default `check` operation uses Supabase CLI's `db push --dry-run` and changes nothing. `apply` requires a typed confirmation; it applies pending migration(s) only to the isolated project's database using the repository secret `BETTERINSIGHT_DATABASE_URL`.

Use the `Session pooler` Postgres URL from this project's **Connect** panel (port 5432), not the direct IPv6 endpoint or transaction-pooler URL. Put the full percent-encoded URL in the GitHub Actions repository secret. Never commit, paste into chat, or screenshot the URL/password.

We deliberately avoid Supabase management API access tokens and only accept a database URL with project-specific user `postgres.nefgspsbamcsmrjkpnis`.

The website and original UT-Marketplace auth/message code are **not connected** to this schema yet. SSO, access policies, encryption, rate limits, and moderation must be implemented and tested separately.
