# BetterInsight-dev – Wiederaufnahme nach Supabase-Pause, 10.11.2026

## Identität und Trennung
- BetterInsight Supabase project: `nefgspsbamcsmrjkpnis`, `betterinsight-dev`, Region Frankfurt.
- Produktives BetInsight Supabase project: `lszlaglwlixejzytrurg` – **niemals für diese Wiederaufnahme ändern oder neu erstellen**.
- Direkter Supabase-Link: https://supabase.com/dashboard/project/nefgspsbamcsmrjkpnis
- Free-Projekt wurde am 10.11.2026 laut Benachrichtigung wegen Inaktivität pausiert.
- ChatGPT Supabase OAuth gibt derzeit nur die produktive BetInsight-Organisation frei. `get_project` und `restore_project` für BetterInsight lieferten `permission denied`. **Keine automatische Wiederaufnahme durchgeführt.**

## Verifizierte GitHub-Sicherungen
- `betinsightclub/betterinsight` → `backup/betterinsight-before-db-resume-20261110`
- `betinsightclub/profil` → `backup/betterinsight-sso-before-db-resume-20261110`
- Dies sind nur **Quellcode-Sicherungen**, keine Postgres-/Storage-Sicherungen.

## Sichere Wiederaufnahme
1. In Supabase im bestehenden Projekt `betterinsight-dev` auf **Resume project** drücken, bestätigen. **Nicht** `New project`, `Delete`, `Reset`, `Restore backup to new project` benutzen.
2. Auf Status `Healthy` / `Active` warten. Keine produktive BetInsight-Datenbank bearbeiten.
3. Read-only Inventar der Tabellen, RLS, Policies und Storage prüfen. Erwartung aus Screenshots vom 03.11.2026: `market_countries` 3 Zeilen (DE, AT, CH), `market_categories` 7, `market_listings` 0, `market_profiles` 0, `market_conversations` und `market_messages` RLS aktiviert. Diese Zahlen sind *historisch*, müssen neu geprüft werden.
4. Datenbank exportieren (Schema und Daten) und separat gesicherte Storage-Dateien/Buckets prüfen. Das ist wichtig, weil SQL-Editor-Änderungen nicht automatisch in GitHub versioniert sind.
5. Supabase-Organisation BetterInsight mit ChatGPT separat autorisieren, **ohne** die produktive BetInsight-Organisation zu entkoppeln, sofern mehrere Verbindungen unterstützt sind. Im OAuth-Bildschirm die Organisation `BetterInsight` auswählen.
6. Erst danach Datenmodell/Aufgaben für echte Inserate, Messenger und SSO fortsetzen. SSO-Staging ist bewusst nicht veröffentlicht.

## Read-only Prüfabfrage (im BetterInsight-SQL-Editor)
```sql
SELECT
  t.table_name,
  COALESCE(c.relrowsecurity,false) AS rls_enabled,
  COALESCE(s.n_live_tup,0) AS estimated_rows
FROM information_schema.tables t
LEFT JOIN pg_namespace n ON n.nspname=t.table_schema
LEFT JOIN pg_class c ON c.relnamespace=n.oid AND c.relname=t.table_name
LEFT JOIN pg_stat_user_tables s ON s.schemaname=t.table_schema AND s.relname=t.table_name
WHERE t.table_schema='public' AND t.table_type='BASE TABLE'
ORDER BY t.table_name;

SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname='public' AND tablename LIKE 'market_%'
ORDER BY tablename, policyname;

SELECT name, public, file_size_limit
FROM storage.buckets
ORDER BY name;
```
Note: `estimated_rows` is an approximate planner count, not an exact count; check actual counts for selected tables only after table existence is confirmed. The SQL above does not modify any data.

## Hosting
`https://betterinsight-test.blindenhandarbeit.workers.dev/` is a manually uploaded static Cloudflare test Worker, separate from Supabase development database. It stores only local-browser testanzeigen, not shared listings. No Cloudflare deploy has been initiated in this recovery.

## Restore window
Email reports 90 days. Supabase docs updated Sep 2026 describe a one-year platform restore window. Follow the *actual project dashboard's* explicit deadline and restore now rather than delaying.

## Final checks
- Compare table names, RLS and database counts to this inventory before any migrations.
- Reconstruct a versioned database schema only after the existing schema has been backed up.
- No changes to the BetInsight production database, wallet or tips. No automatic charges.
