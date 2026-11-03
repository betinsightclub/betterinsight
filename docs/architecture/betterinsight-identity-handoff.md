# BetterInsight member identity and single sign-on — staging decision record

Status: DESIGN ONLY. No production changes, no deployed endpoints, and no
credentials in this repository.

## Verified facts (2026-11-03)

- Existing BetInsight membership is **not primarily** based on Supabase Auth
  accounts. The linked production Supabase project currently has only two
  `auth.users` records, while the member/network product uses different access.
- The BetInsight account page in `betinsightclub/profil/konto/index.html`
  supports registered-email access links and a protected dashboard session.
  `assets/app-session.js` manages browser-side legacy session identifiers,
  with explicit warning that server APIs must still authenticate every request.
- A one-time handoff already exists **for BetInsight Network only**:
  `profil/assets/premium-network-handoff.js` and
  `betinsight-network/handoff/index.html`. The receiving side obtains a
  BetInsight dashboard UUID. **Do not duplicate that response format for the
  independent BetterInsight marketplace.**
- BetterInsight-dev has a separate Supabase project
  `nefgspsbamcsmrjkpnis`. Its table `market_profiles.id` references
  **BetterInsight-dev** `auth.users(id)`, and the draft owner-only RLS policies
  use that Supabase project's `auth.uid()`. A BetInsight dashboard token or
  member UUID does **not** satisfy these conditions automatically.
- A standalone experimental signup page exists at
  `/betterinsight/account`, but is deliberately disabled without
  `NEXT_PUBLIC_BETTERINSIGHT_SUPABASE_URL` and
  `NEXT_PUBLIC_BETTERINSIGHT_SUPABASE_PUBLISHABLE_KEY`. It must not be
  publicly launched before the identity decision.
- No changes may be made to BetInsight production code, user login, or
  session handling without separate explicit approval.

## Business requirement

One human membership, no forced second registration for existing BetInsight
members. BetterInsight must also accept genuinely new visitors who do not have
BetInsight accounts. The public marketplace and country browsing must work
without registration; posting and messaging require verified user identity.

## Proposed secure flow for existing BetInsight members

1. User visits an authenticated section of BetInsight and chooses
   **Open BetterInsight**.
2. **BetInsight's server** validates its own existing session and issues a
   cryptographically random, hashed-at-rest, **single-use**, audience-scoped
   handoff code (target BetterInsight only), max lifetime 60 seconds. Apply
   per-user/IP rate limits and a state value bound to the initiating browser.
3. Browser navigates to BetterInsight callback with **only the one-time code**.
   The permanent dashboard token and profile UUID must never travel in the
   URL or be exposed to BetterInsight JavaScript.
4. BetterInsight **server** redeems the code over authenticated server-to-server
   HTTPS, atomically marks it consumed and receives only a stable verified
   identity reference and minimal claims (e.g. internal ID, email verification
   status). Never trust unverified email matching to link accounts.
5. BetterInsight creates or looks up a local marketplace identity mapping.
   Account/session provisioning must follow a chosen, audited strategy:
   - **Option A:** use BetInsight as a proper OAuth/OIDC identity provider and
     BetterInsight's separate Supabase Auth as an OIDC relying party. This is
     standards-based but requires implementing OAuth/OIDC on the original
     account system first. Supabase's OAuth server alone does not magically
     turn dashboard-token accounts into Supabase Auth users.
   - **Option B:** use a BetterInsight server-managed HttpOnly session backed by
     a separate identity mapping, with **server-enforced** authorization on
     every marketplace request. This requires designing RLS/service boundaries
     carefully and decoupling external member IDs from `auth.users`.
   - **Option C:** provision a local BetterInsight Supabase Auth identity
     through a reviewed, server-only authenticated bridge, without asking the
     member to choose a new password. This must be evaluated against the
     current Supabase Auth APIs, token-exchange guarantees and recovery rules;
     no generic admin token or temporary password may be exposed to the browser.
6. On success, set an independent BetterInsight session in a
   `Secure`, `HttpOnly`, `SameSite=Lax` cookie and clean the callback URL;
   rotate/revoke sessions and handle logout/account suspension coherently.
7. All listing/messenger actions verify the marketplace session and the owner
   of each record. Never infer authority from client-supplied member IDs.

## Security acceptance tests before launch

- Code expires, is invalid after first redemption, and cannot be reused or
  redeemed by another browser/audience.
- CSRF protection and open-redirect defenses work.
- No permanent BetInsight dashboard token/UUID is sent to BetterInsight or
  exposed in URL, browser storage, analytics or logs.
- User A cannot read, change or message as User B.
- Suspended users are blocked even with a previously issued token.
- Existing BetInsight members never require a new password or duplicate
  registration; new members can sign up to BetterInsight independently.
- DE/AT/CH country scope is server-validated for listings; more countries can
  be activated without redefining identities.
- No unrestricted public access to `market_profiles`, `market_messages` or
  `market_conversations`.
- The legacy Network handoff remains unchanged until separate approval.

## Immediate implementation gate

Do **not** apply `docs/database/06_profile_rls_pending_review.sql` as the
final identity model yet: it assumes every marketplace identity is backed by
`auth.users` in BetterInsight-dev. Confirm an identity/session strategy
first, then adapt the profile schema and policies and test two distinct users.

External documentation reviewed:
- https://supabase.com/docs/guides/auth/oauth-server
- https://supabase.com/docs/guides/auth/custom-oauth-providers
- https://supabase.com/docs/guides/auth/third-party/custom-oidc
- https://supabase.com/docs/guides/database/postgres/row-level-security
