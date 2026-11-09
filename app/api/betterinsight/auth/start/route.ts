import { NextRequest, NextResponse } from "next/server";
import { isTrustedAuthorizeUrl, newState, safeAppOrigin, SSO_STATE_COOKIE } from "../../../../lib/betterInsightSsoCore";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const origin = safeAppOrigin(req.url, process.env.BETTERINSIGHT_PUBLIC_ORIGIN);
  const authorize = process.env.BETTERINSIGHT_SSO_AUTHORIZE_URL;
  if (process.env.BETTERINSIGHT_SSO_ENABLED !== "true" || !origin || !isTrustedAuthorizeUrl(authorize)) {
    return NextResponse.json({ error: "BETTERINSIGHT_SSO_NOT_CONFIGURED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const state = newState();
  const destination = new URL(authorize!);
  destination.searchParams.set("client_id", "betterinsight");
  destination.searchParams.set("response_type", "code");
  destination.searchParams.set("state", state);
  destination.searchParams.set("redirect_uri", origin + "/api/betterinsight/auth/callback");
  const out = NextResponse.redirect(destination, { status: 302 });
  out.headers.set("Cache-Control", "no-store");
  out.headers.set("Referrer-Policy", "no-referrer");
  out.cookies.set(SSO_STATE_COOKIE, state, {
    path: "/", secure: true, httpOnly: true, sameSite: "lax", maxAge: 180
  });
  return out;
}
