import { NextRequest, NextResponse } from "next/server";
import {
  isTrustedExchangeUrl, isValidCode, sameState, parseTrustedExchange,
  safeAppOrigin, signLocalSession, SSO_COOKIE, SSO_STATE_COOKIE, SSO_SESSION_SECONDS
} from "../../../../lib/betterInsightSsoCore";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const origin = safeAppOrigin(req.url, process.env.BETTERINSIGHT_PUBLIC_ORIGIN);
  const fail = (reason: string) => {
    const r = NextResponse.redirect(origin ? origin + "/betterinsight?connect=" + reason : "https://app.betinsight.club/konto/", { status: 302 });
    r.cookies.delete(SSO_STATE_COOKIE);
    r.headers.set("Cache-Control", "no-store");
    r.headers.set("Referrer-Policy", "no-referrer");
    return r;
  };
  if (process.env.BETTERINSIGHT_SSO_ENABLED !== "true" || !origin) return fail("disabled");
  const clientSecret = process.env.BETTERINSIGHT_SSO_CLIENT_SECRET || "";
  const sessionSecret = process.env.BETTERINSIGHT_SSO_COOKIE_SECRET || "";
  const endpoint = process.env.BETTERINSIGHT_SSO_EXCHANGE_URL;
  if (clientSecret.length < 32 || sessionSecret.length < 32 || !isTrustedExchangeUrl(endpoint)) return fail("disabled");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!isValidCode(code) || !sameState(state, req.cookies.get(SSO_STATE_COOKIE)?.value)) return fail("invalid");
  try {
    const response = await fetch(endpoint!, {
      method: "POST", cache: "no-store",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + clientSecret },
      body: JSON.stringify({ code, audience: "betterinsight", redirect_uri: origin + "/api/betterinsight/auth/callback" }),
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return fail("rejected");
    const subject = parseTrustedExchange(await response.json());
    if (!subject) return fail("rejected");
    const token = await signLocalSession(subject, sessionSecret);
    const out = NextResponse.redirect(origin + "/betterinsight?connect=ok", { status: 302 });
    out.cookies.delete(SSO_STATE_COOKIE);
    out.cookies.set(SSO_COOKIE, token, {
      path: "/", httpOnly: true, secure: true, sameSite: "lax", maxAge: SSO_SESSION_SECONDS
    });
    out.headers.set("Cache-Control", "no-store");
    out.headers.set("Referrer-Policy", "no-referrer");
    return out;
  } catch { return fail("unavailable"); }
}
