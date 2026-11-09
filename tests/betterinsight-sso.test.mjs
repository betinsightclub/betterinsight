import test from "node:test";
import assert from "node:assert/strict";
import {
  newState, sameState, isValidCode, isValidState, safeAppOrigin,
  isTrustedAuthorizeUrl, isTrustedExchangeUrl, parseTrustedExchange,
  signLocalSession, verifyLocalSession
} from "../app/lib/betterInsightSsoCore.ts";

const user = "b6b62976-3fc1-4567-8c4a-74c795f3c501";
const goodSecret = "test-session-secret-only-please-never-deploy-this-key-01";

test("state is unpredictable and exact-match only", () => {
  const a = newState(), b = newState();
  assert.ok(isValidState(a));
  assert.ok(isValidState(b));
  assert.notEqual(a, b);
  assert.ok(sameState(a, a));
  assert.equal(sameState(a, b), false);
  assert.equal(sameState(a, undefined), false);
  assert.equal(sameState(a, "untrusted"), false);
});

test("codes reject short, URL-like and oversized untrusted strings", () => {
  assert.ok(isValidCode("a".repeat(32)));
  assert.equal(isValidCode("a".repeat(31)), false);
  assert.equal(isValidCode("a".repeat(129)), false);
  assert.equal(isValidCode("https://bad.example/redirect"), false);
  assert.equal(isValidCode(undefined), false);
});

test("public origin must exactly match the configured HTTPS domain", () => {
  const origin = "https://betterinsight-test.example.org";
  assert.equal(safeAppOrigin(origin + "/api/betterinsight/auth/start", origin), origin);
  assert.equal(safeAppOrigin("https://evil.example", origin), null);
  assert.equal(safeAppOrigin("http://betterinsight-test.example.org", origin), null);
  assert.equal(safeAppOrigin(origin + ".evil.org", origin), null);
  assert.equal(safeAppOrigin(origin, "https://betterinsight-test.example.org.attacker.net"), null);
});

test("issuer endpoints are allowlisted and cannot be attacker-controlled", () => {
  assert.ok(isTrustedAuthorizeUrl("https://app.betinsight.club/konto/"));
  assert.equal(isTrustedAuthorizeUrl("https://app.betinsight.club.evil.com/"), false);
  assert.equal(isTrustedAuthorizeUrl("http://app.betinsight.club/konto/"), false);
  assert.ok(isTrustedExchangeUrl("https://lszlaglwlixejzytrurg.supabase.co/functions/v1/betterinsight-sso-exchange"));
  assert.equal(isTrustedExchangeUrl("https://other.supabase.co/functions/v1/betterinsight-sso-exchange"), false);
});

test("exchange only trusts minimal audience-bound identity with no permanent tokens", () => {
  const ok = {success:true, audience:"betterinsight", user_id:user};
  assert.equal(parseTrustedExchange(ok), user);
  assert.equal(parseTrustedExchange({...ok, audience:"network"}), null);
  assert.equal(parseTrustedExchange({...ok, dashboard_token:"secret"}), null);
  assert.equal(parseTrustedExchange({...ok, access_token:"secret"}), null);
  assert.equal(parseTrustedExchange({...ok, refresh_token:"secret"}), null);
  assert.equal(parseTrustedExchange({...ok, user_id:"not-a-uuid"}), null);
});

test("signed session accepts only unexpired HMAC with matching issuer and secret", async () => {
  const now = Date.UTC(2026,10,9,20,0,0);
  const signed = await signLocalSession(user, goodSecret, now);
  assert.equal(await verifyLocalSession(signed, goodSecret, now + 1000), user);
  assert.equal(await verifyLocalSession(signed, "another-secret-at-least-32-characters-long", now), null);
  assert.equal(await verifyLocalSession(signed + "a", goodSecret, now), null);
  assert.equal(await verifyLocalSession(signed, goodSecret, now + 901000), null);
  assert.equal(await verifyLocalSession(signed, goodSecret, now - 901000), null);
  await assert.rejects(signLocalSession(user, "short", now), /secret/);
  await assert.rejects(signLocalSession("bad-user", goodSecret, now), /invalid user/);
});
