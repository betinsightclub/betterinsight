// BetterInsight SSO security primitives. This module never receives BetInsight's
// permanent dashboard credential. Only a trusted issuer may redeem short-lived
// one-use codes and return a minimal, audience-bound subject.
export const SSO_AUDIENCE = "betterinsight";
export const SSO_COOKIE = "__Host-betterinsight_sso";
export const SSO_STATE_COOKIE = "__Host-betterinsight_state";
export const SSO_SESSION_SECONDS = 15 * 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE = /^[a-zA-Z0-9_-]{32,128}$/;
const STATE = /^[a-zA-Z0-9_-]{40,100}$/;
const te = new TextEncoder();
const td = new TextDecoder();

function encode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid encoding");
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
async function keyFor(secret: string) {
  if (!secret || te.encode(secret).length < 32) throw new Error("SSO secret missing or too short");
  return crypto.subtle.importKey("raw", te.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export function isValidCode(value: unknown): value is string {
  return typeof value === "string" && CODE.test(value);
}
export function isValidState(value: unknown): value is string {
  return typeof value === "string" && STATE.test(value);
}
export function isValidSubject(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
export function newState(): string {
  return encode(crypto.getRandomValues(new Uint8Array(32)));
}
export function sameState(a: unknown, b: unknown): boolean {
  if (!isValidState(a) || !isValidState(b)) return false;
  const x = te.encode(a), y = te.encode(b);
  if (x.length !== y.length) return false;
  let mismatch = 0;
  for (let i = 0; i < x.length; i++) mismatch |= x[i] ^ y[i];
  return mismatch === 0;
}
export function safeAppOrigin(requestUrl: string, configuredOrigin: string | undefined): string | null {
  try {
    const actual = new URL(requestUrl);
    const configured = new URL(configuredOrigin || "");
    if (actual.protocol !== "https:" || configured.protocol !== "https:") return null;
    if (configured.origin !== actual.origin || configured.pathname !== "/") return null;
    if (configured.search || configured.hash) return null;
    return configured.origin;
  } catch { return null; }
}
export function isTrustedAuthorizeUrl(value: string | undefined): boolean {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" && url.hostname === "app.betinsight.club"
      && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}
export function isTrustedExchangeUrl(value: string | undefined): boolean {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:"
      && url.hostname === "lszlaglwlixejzytrurg.supabase.co"
      && url.pathname === "/functions/v1/betterinsight-sso-exchange"
      && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}
export function parseTrustedExchange(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const obj = body as Record<string, unknown>;
  // Never consume permanent dashboard tokens or Supabase refresh tokens here.
  if ("dashboard_token" in obj || "refresh_token" in obj || "access_token" in obj) return null;
  return obj.success === true && obj.audience === SSO_AUDIENCE && isValidSubject(obj.user_id)
    ? obj.user_id : null;
}
export async function signLocalSession(subject: string, secret: string, now = Date.now()): Promise<string> {
  if (!isValidSubject(subject)) throw new Error("invalid user");
  const key = await keyFor(secret);
  const payload = {
    sub: subject, iss: "betterinsight-sso", aud: SSO_AUDIENCE,
    exp: Math.floor(now / 1000) + SSO_SESSION_SECONDS, jti: crypto.randomUUID()
  };
  const body = encode(te.encode(JSON.stringify(payload)));
  const message = "v1." + body;
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(message));
  return message + "." + encode(new Uint8Array(sig));
}
export async function verifyLocalSession(token: unknown, secret: string, now = Date.now()): Promise<string | null> {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  try {
    const key = await keyFor(secret);
    const valid = await crypto.subtle.verify(
      "HMAC", key, decode(parts[2]), te.encode(parts[0] + "." + parts[1])
    );
    if (!valid) return null;
    const data = JSON.parse(td.decode(decode(parts[1])));
    if (data.iss !== "betterinsight-sso" || data.aud !== SSO_AUDIENCE
      || !isValidSubject(data.sub) || !Number.isInteger(data.exp)
      || data.exp <= Math.floor(now / 1000) || data.exp > Math.floor(now / 1000) + SSO_SESSION_SECONDS
      || !isValidSubject(data.jti)) return null;
    return data.sub;
  } catch { return null; }
}
