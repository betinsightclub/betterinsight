import { NextRequest, NextResponse } from "next/server";
import { safeAppOrigin, SSO_COOKIE, verifyLocalSession } from "../../../../lib/betterInsightSsoCore";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const origin = safeAppOrigin(req.url, process.env.BETTERINSIGHT_PUBLIC_ORIGIN);
  const secret = process.env.BETTERINSIGHT_SSO_COOKIE_SECRET || "";
  const enabled = process.env.BETTERINSIGHT_SSO_ENABLED === "true" && !!origin;
  const subject = enabled && secret.length >= 32
    ? await verifyLocalSession(req.cookies.get(SSO_COOKIE)?.value, secret) : null;
  // No balance or profile data until the signed source read endpoint is ready.
  // Never use this display-only session as permission to write listings or spend Units.
  return NextResponse.json({
    enabled, connected: !!subject,
    units: null, clash_tokens: null, clash_points: null,
    wallet_connected: false
  }, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
