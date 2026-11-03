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

The `BetterInsight DB – manual check / apply` GitHub Action runs a read-only six-table/RLS connectivity check on code updates and by manual `check` dispatch. A manual `apply` requires an exact confirmation string and pending migrations in `infra/betterinsight/supabase/migrations`, then uses the project-scoped secret `BETTERINSIGHT_DATABASE_URL`. The older original root `/supabase/migrations` is never applied. The SQL in `docs/database/06_profile_rls_pending_review.sql` has NOT been applied or converted to a migration.

Use the `Session pooler` Postgres URL from this project's **Connect** panel (port 5432), not the direct IPv6 endpoint or transaction-pooler URL. Put the full percent-encoded URL in the GitHub Actions repository secret. Never commit, paste into chat, or screenshot the URL/password.

We deliberately avoid Supabase management API access tokens and only accept a database URL with project-specific user `postgres.nefgspsbamcsmrjkpnis`.

The website and original UT-Marketplace auth/message code are **not connected** to this schema yet. SSO, access policies, encryption, rate limits, and moderation must be implemented and tested separately.


## Current staging work (not public)

- `app/betterinsight/account/page.tsx`: isolated member login/signup and editable profile prototype (DACH countries); no Cloudflare deploy.
- `docs/database/06_profile_rls_pending_review.sql`: proposed RLS/column-grants for private member profiles. Needs approval, execution in BetterInsight-dev, verification with at least two test users, and then a generated migration through the Supabase CLI.
- `BetterInsight account TypeScript check (no deployment)`: targeted TypeScript validation has passed.
- The original university marketplace `users`, `banned_emails`, onboarding, messaging, and listings code remains to be adapted; it must not be treated as working with our new schema yet.
- Shared BetInsight login/SSO is **not implemented**. Different Supabase projects do not automatically share Auth sessions. Existing BetInsight users should not be instructed to register again until a secure federation/account linking strategy has been approved and tested.
- Never enable public listing or messaging write policies before ownership, reporting, abuse limits and encryption are tested.
