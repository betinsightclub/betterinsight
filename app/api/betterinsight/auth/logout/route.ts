import { NextRequest, NextResponse } from "next/server";
import { SSO_COOKIE, SSO_STATE_COOKIE, safeAppOrigin } from "../../../../lib/betterInsightSsoCore";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const origin = safeAppOrigin(req.url, process.env.BETTERINSIGHT_PUBLIC_ORIGIN);
  if (!origin || req.headers.get("origin") !== origin) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const result = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  result.cookies.delete(SSO_COOKIE);
  result.cookies.delete(SSO_STATE_COOKIE);
  return result;
}
