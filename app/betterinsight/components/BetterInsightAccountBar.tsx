"use client";

import { useEffect, useState } from "react";

type SessionStatus = {
  enabled: boolean; connected: boolean; wallet_connected: boolean;
  units: number | null; clash_tokens: number | null; clash_points: number | null;
};

const empty: SessionStatus = {
  enabled: false, connected: false, wallet_connected: false,
  units: null, clash_tokens: null, clash_points: null
};

export default function BetterInsightAccountBar() {
  const [status, setStatus] = useState<SessionStatus>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/betterinsight/auth/session", { cache: "no-store", credentials: "same-origin", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("session_unavailable");
        return response.json();
      })
      .then((body: SessionStatus) => setStatus(body))
      .catch(() => setStatus(empty))
      .finally(() => setLoaded(true));
    return () => controller.abort();
  }, []);

  async function disconnect() {
    try {
      const res = await fetch("/api/betterinsight/auth/logout", { method: "POST", credentials: "same-origin" });
      if (res.ok) setStatus(empty);
    } catch { /* user remains on site; never fake a successful sign-out */ }
  }

  const count = (n: number | null) => n === null ? "—" : n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
  const display = [
    { title: "Gesamte verfügbare Units", value: count(status.wallet_connected ? status.units : null), color: "text-amber-400" },
    { title: "⚡ CLASH TOKEN", value: count(status.wallet_connected ? status.clash_tokens : null), color: "text-sky-300" },
    { title: "🏆 CLASH POINTS", value: count(status.wallet_connected ? status.clash_points : null), color: "text-amber-400" },
  ];

  return (
    <aside aria-label="Gemeinsames Mitgliedskonto" className="sticky top-0 z-50 border-b border-[#2b6073] bg-[#062d3e] p-3 shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <div className="min-w-[140px] flex-1 text-xs text-white">
          <div className="font-bold">Gemeinsames Mitgliedskonto</div>
          <div className="mt-1 text-[#b5d7e6]">
            {!loaded ? "Verbindung prüfen…" :
              status.connected ? "Mit BetInsight verbunden" : "Noch nicht verbunden"}
          </div>
        </div>
        <div className="grid min-w-[275px] flex-[3] grid-cols-3 gap-2">
          {display.map(item => (
            <div key={item.title} className="rounded-xl border border-[#14546b] bg-[#002233] px-2 py-2 text-center">
              <div className="text-[10px] font-bold leading-4 text-[#bfdfed]">{item.title}</div>
              <div className={"mt-1 text-xl font-black " + item.color}>{item.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {status.connected ? (
            <button type="button" onClick={disconnect} className="rounded-lg border border-[#77abb9] px-3 py-2 text-xs font-bold text-white">Abmelden</button>
          ) : status.enabled ? (
            <a href="/api/betterinsight/auth/start" className="rounded-lg bg-[#8ccf36] px-3 py-2 text-xs font-bold text-[#062d3e]">
              Mit BetInsight verbinden
            </a>
          ) : (
            <a href="https://app.betinsight.club/konto/" rel="noopener noreferrer"
               className="rounded-lg bg-[#8ccf36] px-3 py-2 text-xs font-bold text-[#062d3e]">
              Bei BetInsight anmelden
            </a>
          )}
        </div>
      </div>
      {!status.enabled && loaded && (
        <p className="mx-auto mt-2 max-w-6xl text-[11px] text-[#bfdfed]">
          Die automatische Kontoverknüpfung ist noch in Vorbereitung. Hier werden bis zur echten Wallet-Anbindung keine Zahlen angezeigt.
        </p>
      )}
    </aside>
  );
}
