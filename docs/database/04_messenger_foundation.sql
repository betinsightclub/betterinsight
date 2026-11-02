-- BetterInsight - messenger data foundation.
-- ONLY run on the BetterInsight-dev project, never the live BetInsight project.
-- No API access/policies yet; cryptography and user authorization need separate tests.
BEGIN;

CREATE TABLE IF NOT EXISTS public.market_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.market_listings(id) ON DELETE RESTRICT,
  participant_1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  participant_2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  CONSTRAINT market_conversations_order CHECK (participant_1_id < participant_2_id),
  CONSTRAINT market_conversations_unique UNIQUE NULLS NOT DISTINCT
    (listing_id, participant_1_id, participant_2_id)
);

CREATE TABLE IF NOT EXISTS public.market_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.market_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  receiver_ciphertext text NOT NULL CHECK (length(receiver_ciphertext) > 0),
  sender_ciphertext text NOT NULL CHECK (length(sender_ciphertext) > 0),
  encryption_version smallint NOT NULL DEFAULT 1 CHECK (encryption_version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS market_conversations_p1_idx
  ON public.market_conversations (participant_1_id, created_at DESC);
CREATE INDEX IF NOT EXISTS market_conversations_p2_idx
  ON public.market_conversations (participant_2_id, created_at DESC);
CREATE INDEX IF NOT EXISTS market_messages_thread_idx
  ON public.market_messages (conversation_id, created_at DESC);

ALTER TABLE public.market_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.market_conversations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.market_messages FROM PUBLIC, anon, authenticated;

COMMIT;

SELECT tablename, rowsecurity AS rls_aktiv
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('market_conversations', 'market_messages')
ORDER BY tablename;
