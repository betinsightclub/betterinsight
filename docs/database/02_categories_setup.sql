-- BetterInsight: compact initial categories for DE / AT / CH.
-- This does not expose a public API or touch user/listing/message tables.
BEGIN;

CREATE TABLE IF NOT EXISTS public.market_categories (
  category_code text PRIMARY KEY
    CHECK (category_code ~ '^[a-z][a-z0-9_]*$'),
  label_de text NOT NULL,
  display_order integer NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.market_categories ENABLE ROW LEVEL SECURITY;

-- No public permissions until a read-only policy is reviewed.
REVOKE ALL ON TABLE public.market_categories FROM PUBLIC, anon, authenticated;

INSERT INTO public.market_categories (category_code, label_de, display_order)
VALUES
  ('sport_freizeit', 'Sport & Freizeit', 1),
  ('fahrzeuge_boote', 'Fahrzeuge & Boote', 2),
  ('technik', 'Technik & Elektronik', 3),
  ('haus_wohnen', 'Haus & Wohnen', 4),
  ('mode', 'Mode & Accessoires', 5),
  ('dienstleistungen', 'Dienstleistungen', 6),
  ('verschiedenes', 'Verschiedenes', 7)
ON CONFLICT (category_code) DO NOTHING;

COMMIT;

SELECT category_code, label_de, display_order, is_active
FROM public.market_categories
ORDER BY display_order;
