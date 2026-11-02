-- BetterInsight: first independent market reference table.
-- Run only in the new betterinsight-dev Supabase project.
-- No user, message or listing tables are changed.
BEGIN;

CREATE TABLE IF NOT EXISTS public.market_countries (
    country_code text PRIMARY KEY CHECK (country_code ~ '^[A-Z]{2}$'),
    country_name_de text NOT NULL,
    currency_code text NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
    default_language text NOT NULL DEFAULT 'de',
    launch_status text NOT NULL DEFAULT 'planned'
      CHECK (launch_status IN ('planned', 'live', 'paused')),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.market_countries ENABLE ROW LEVEL SECURITY;

-- Keep new market configuration private until the application's
-- read-only country API has been designed and audited.
REVOKE ALL ON TABLE public.market_countries FROM PUBLIC, anon, authenticated;

INSERT INTO public.market_countries (country_code, country_name_de, currency_code)
VALUES
    ('DE', 'Deutschland', 'EUR'),
    ('AT', 'Österreich', 'EUR'),
    ('CH', 'Schweiz', 'CHF')
ON CONFLICT (country_code) DO NOTHING;

COMMIT;

SELECT country_code, country_name_de, currency_code, launch_status
FROM public.market_countries
ORDER BY country_code;
