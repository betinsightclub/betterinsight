"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

// Development-only BetterInsight account entry point.
// Do NOT link this to the live marketplace or deploy before:
// - pending profile RLS is reviewed and applied to BetterInsight-dev;
// - auth redirect URL, email confirmation and abuse protection are tested;
// - BetInsight shared identity/SSO is decided.
type Profile = {
  display_name: string;
  country_code: string | null;
  city: string | null;
  account_status: "pending" | "active" | "suspended";
};

export default function BetterInsightAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [working, setWorking] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("DE");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<Profile["account_status"] | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setNotice("Die Anmeldung konnte noch nicht überprüft werden.");
      setUser(data.user ?? null);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    void supabase
      .from("market_profiles")
      .select("display_name,country_code,city,account_status")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setNotice("Die Profilfreigabe in der Entwicklungsdatenbank steht noch aus.");
          return;
        }
        if (data) {
          const profile = data as Profile;
          setDisplayName(profile.display_name);
          setCountry(profile.country_code ?? "DE");
          setCity(profile.city ?? "");
          setStatus(profile.account_status);
        }
      });
    return () => { cancelled = true; };
  }, [user]);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setNotice("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin + "/betterinsight/account",
          },
        });
        if (error) throw error;
        if (data.session) {
          setNotice("Anmeldung erstellt. Bitte vervollständige dein Profil.");
          setUser(data.user);
        } else {
          setNotice("Bitte prüfe dein E-Mail-Postfach und bestätige deine Anmeldung.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setUser(data.user);
        setNotice("Anmeldung erfolgreich.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Anmeldung nicht möglich.");
    } finally {
      setWorking(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setWorking(true);
    setNotice("");
    try {
      const { error } = await supabase
        .from("market_profiles")
        .upsert({
          id: user.id,
          display_name: displayName.trim(),
          country_code: country,
          city: city.trim() || null,
        }, { onConflict: "id" });
      if (error) throw error;
      setNotice("Dein Profil wurde gespeichert.");
      setStatus((old) => old ?? "pending");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden.");
    } finally {
      setWorking(false);
    }
  }

  async function signOut() {
    setWorking(true);
    const { error } = await supabase.auth.signOut();
    if (error) setNotice(error.message);
    else {
      setUser(null);
      setNotice("Du bist abgemeldet.");
    }
    setWorking(false);
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12 text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">
        BetterInsight · Entwicklungsansicht
      </p>
      <h1 className="mt-2 text-3xl font-bold">Post. Discover. Connect.</h1>
      <p className="mt-3 text-slate-600">
        Dein persönliches Konto im internationalen Community-Marktplatz.
      </p>

      <section className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>Bereits BetInsight-Mitglied?</strong> Die gemeinsame Anmeldung
        wird separat vorbereitet. Bitte dafür noch kein zweites Konto anlegen.
        Diese Seite ist noch nicht veröffentlicht.
      </section>

      {notice && <p aria-live="polite" className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">{notice}</p>}

      {checking ? (
        <p className="mt-8">Anmeldung wird geprüft …</p>
      ) : user ? (
        <section className="mt-8 rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Mein Profil</h2>
            <button type="button" onClick={signOut} disabled={working} className="text-sm underline">Abmelden</button>
          </div>
          <p className="mt-2 break-all text-sm text-slate-600">{user.email}</p>
          <p className="mt-2 text-sm text-slate-600">
            Kontostatus: <strong>{status === "active" ? "Aktiv" : status === "suspended" ? "Gesperrt" : "In Vorbereitung"}</strong>
          </p>
          <form className="mt-6 space-y-4" onSubmit={saveProfile}>
            <label className="block text-sm font-semibold">
              Anzeigename
              <input required minLength={2} maxLength={70} value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
            </label>
            <label className="block text-sm font-semibold">
              Land
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-3">
                <option value="DE">Deutschland</option>
                <option value="AT">Österreich</option>
                <option value="CH">Schweiz</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Stadt (optional)
              <input maxLength={120} value={city} onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
            </label>
            <button type="submit" disabled={working}
              className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50">
              {working ? "Bitte warten …" : "Profil speichern"}
            </button>
          </form>
        </section>
      ) : (
        <section className="mt-8 rounded-xl border border-slate-200 p-6">
          <div className="flex gap-3">
            <button type="button" onClick={() => setMode("signin")} aria-pressed={mode === "signin"}
              className="rounded-lg border border-slate-300 px-4 py-2 aria-pressed:bg-indigo-100">Anmelden</button>
            <button type="button" onClick={() => setMode("signup")} aria-pressed={mode === "signup"}
              className="rounded-lg border border-slate-300 px-4 py-2 aria-pressed:bg-indigo-100">Registrieren</button>
          </div>
          <form className="mt-6 space-y-4" onSubmit={submitCredentials}>
            <label className="block text-sm font-semibold">
              E-Mail-Adresse
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
            </label>
            <label className="block text-sm font-semibold">
              Passwort
              <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-3" />
            </label>
            <button type="submit" disabled={working}
              className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50">
              {working ? "Bitte warten …" : mode === "signup" ? "Konto erstellen" : "Anmelden"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
