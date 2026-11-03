import { createClient } from "@supabase/supabase-js";

// Strictly separate from the inherited UT-Marketplace Supabase client.
// Never fall back to the parent BetInsight production project or other env vars.
const expectedBetterInsightUrl = "https://nefgspsbamcsmrjkpnis.supabase.co";
const configuredUrl = process.env.NEXT_PUBLIC_BETTERINSIGHT_SUPABASE_URL?.trim();
const publishableKey = process.env.NEXT_PUBLIC_BETTERINSIGHT_SUPABASE_PUBLISHABLE_KEY?.trim();

// Closed by default: the preview only works when the exact BetterInsight-dev
// project URL and its public/publishable key are explicitly configured.
// Never use a service_role key in NEXT_PUBLIC_* variables.
export const betterInsightClient =
  configuredUrl === expectedBetterInsightUrl && publishableKey
    ? createClient(expectedBetterInsightUrl, publishableKey, {
        auth: {
          storageKey: "betterinsight-dev-auth",
          flowType: "pkce",
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            "X-Client-Info": "betterinsight-dev-web",
          },
        },
      })
    : null;
