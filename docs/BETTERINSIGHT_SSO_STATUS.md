# BetterInsight ↔ BetInsight SSO — staging status (2026-11-09)

**Not production ready.** This work is deliberately fail-closed, not deployed and not connected to the existing Cloudflare static Worker. No existing BetInsight login, wallet, tip or TIME CLASH functionality has been changed.

## Existing working concept

The old BetInsight Network handoff is **not reusable as-is**: it is audience-specific and may deliver a dashboard access token when redeemed. Do not share permanent dashboard access with BetterInsight.

Current BetInsight account access is linked to hashed dashboard credentials in `betinsight_profile_read_shadow`. The actual `user_id` is a **9-character opaque text member ID**, not a Supabase Auth UUID. All 76 records checked on 2026-11-09 have a 64-char SHA-256 dashboard credential hash.

## Changes made in this development branch

- `app/lib/betterInsightSsoCore.ts`: strict issuer URL checks, one-use code format, anti-CSRF state, minimal identity contract and signed 15-minute HttpOnly session.
- `app/api/betterinsight/auth/{start,callback,session,logout}/route.ts`: disabled by default, no tokens in browser storage, no wallet access and no write permissions.
- `app/betterinsight/components/BetterInsightAccountBar.tsx`: sticky membership bar, never invents Units / Clash Tokens / Clash Points.
- `tests/betterinsight-sso.test.mjs`: negative tests for origin confusion, code manipulation, invalid audience, permanent token leakage, signature tampering and expiry.
- `.github/workflows/betterinsight-sso-check.yml`: no-deploy CI.

## BetInsight source-side staging

Separate source branch: `betinsightclub/profil:dev/betterinsight-sso-20261109`
- `betterinsight-connect/index.html`: source-domain consent/issue page (no dashboard credential in URL).
- `konto/index.html`: only in source staging branch, allows the safe `next=betterinsight` return.
- `docs/betterinsight-sso/SCHEMA_STAGING_ONLY.sql`: one-use SHA-256 code hashes; RLS and no anon grants; atomic redeem.
- `docs/betterinsight-sso/ISSUE_EDGE_STAGING_ONLY.ts`: issue short-lived code only after source-domain dashboard access verification.
- `docs/betterinsight-sso/EXCHANGE_EDGE_STAGING_ONLY.ts`: server-only secret authentication, strict audience/redirect and atomic redemption.

These source files are **not** active Edge Functions and the SQL has **not** been executed.

## Configuration required (server secrets, never NEXT_PUBLIC)

BETTERINSIGHT_SSO_ENABLED=true  # only after end-to-end security tests!
BETTERINSIGHT_PUBLIC_ORIGIN=https://<actual-dynamic-betterinsight-host>
BETTERINSIGHT_SSO_AUTHORIZE_URL=https://app.betinsight.club/betterinsight-connect/
BETTERINSIGHT_SSO_EXCHANGE_URL=https://lszlaglwlixejzytrurg.supabase.co/functions/v1/betterinsight-sso-exchange
BETTERINSIGHT_SSO_CLIENT_SECRET=<unique 32+ char random server secret shared with source Edge Function>
BETTERINSIGHT_SSO_COOKIE_SECRET=<different 32+ char random server secret>
BETTERINSIGHT_SSO_CALLBACK_URL=https://<actual-dynamic-betterinsight-host>/api/betterinsight/auth/callback  # source backend only

**No actual secrets are committed.** Never send these secrets via chat.

## Blocking requirements before enabling

1. The current BetterInsight test URL is a **manually uploaded static Cloudflare Worker**. Next.js API routes are NOT served from it. Deploy a separate dynamic staging app/Worker with route support first, maintaining the current working demo as a rollback.
2. Review and apply source SQL and Edge Functions **only after** testing the privileges, origin checks, owner lookup and one-time atomic redemption. Use a separate test environment if possible. Do not modify or overwrite the existing Network handoff.
3. Configure the real callback and SSO secrets server-side; verify precise HTTPS host allowlists.
4. End-to-end tests on both domains: first login, already logged-in, no token, expired code, code replay, bad audience, bad callback, forged state, logout, different browser, mobile, session expiry.
5. Only then flip the feature flag. Until then the UI must visibly say connection unavailable.
6. Current BetterInsight Supabase project `nefgspsbamcsmrjkpnis` is not visible through this chat's Supabase connector. Link/authorize that organization separately for marketplace DB migrations.
7. Do not grant classified-ad write access or spend Units based on this display-only session until the BetterInsight data authorization and wallet server-side checks are designed and tested. Units remain in the existing BetInsight wallet.

## Scope

A shared **identity** is the first milestone. A live readonly balance endpoint, safe listing writes, moderation, and Unit deductions are separate later milestones. Never create a second wallet or separate unit currency.
