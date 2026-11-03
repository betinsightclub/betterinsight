"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// Temporary country-first marketplace preview. No invented ads or live data.
// Public categories and listing queries will be wired only after audited RLS
// grants on the isolated BetterInsight-dev database are applied.
type Country = "DE" | "AT" | "CH";
type Category =
  | "sport_freizeit"
  | "fahrzeuge_boote"
  | "technik"
  | "haus_wohnen"
  | "mode"
  | "dienstleistungen"
  | "verschiedenes";

const countries: { code: Country; name: string; currency: string }[] = [
  { code: "DE", name: "Deutschland", currency: "EUR" },
  { code: "AT", name: "Österreich", currency: "EUR" },
  { code: "CH", name: "Schweiz", currency: "CHF" },
];

const categories: { code: Category; name: string; detail: string; symbol: string }[] = [
  { code: "sport_freizeit", name: "Sport & Freizeit", detail: "Fahrräder, Fitness, Outdoor und mehr", symbol: "⚽" },
  { code: "fahrzeuge_boote", name: "Fahrzeuge & Boote", detail: "Auto, Motorrad, Boot und Zubehör", symbol: "⛵" },
  { code: "technik", name: "Technik & Elektronik", detail: "Handys, Computer und Unterhaltung", symbol: "💻" },
  { code: "haus_wohnen", name: "Haus & Wohnen", detail: "Möbel, Einrichtung und Garten", symbol: "🏠" },
  { code: "mode", name: "Mode & Accessoires", detail: "Kleidung, Taschen und Schuhe", symbol: "👟" },
  { code: "dienstleistungen", name: "Dienstleistungen", detail: "Private und gewerbliche Angebote", symbol: "🛠️" },
  { code: "verschiedenes", name: "Verschiedenes", detail: "Weitere erlaubte Angebote und Links", symbol: "📦" },
];

export default function BetterInsightMarketplacePreview() {
  const [countryCode, setCountryCode] = useState<Country>("DE");
  const [categoryCode, setCategoryCode] = useState<Category | null>(null);
  const selectedCountry = useMemo(
    () => countries.find((item) => item.code === countryCode)!,
    [countryCode]
  );
  const selectedCategory = useMemo(
    () => categories.find((item) => item.code === categoryCode) ?? null,
    [categoryCode]
  );

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/betterinsight" className="text-2xl font-black tracking-tight text-[#172e57]">
            better<span className="text-[#1971ce]">Insight</span>
            <span className="ml-1 text-sm font-normal text-slate-500">.club</span>
          </Link>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            Vorschau – noch nicht veröffentlicht
          </span>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#112d58] via-[#174b8c] to-[#116b97] px-5 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-sky-200">
            Part of the BetInsight Family
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            Post. Discover. Connect.
          </h1>
          <p className="mt-4 text-xl font-medium text-blue-100">The Global Community Marketplace</p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-100">
            Privat oder gewerblich: Entdecke Angebote, gebrauchte Gegenstände,
            Dienstleistungen und erlaubte externe Links aus deiner Region.
            Anbieter und Interessenten regeln Kauf, Bezahlung und Lieferung selbst.
          </p>
          <p className="mt-6 text-xs font-semibold text-blue-100">
            Kostenlose Basis · geplanter werbefreier Premium-Zugang · kostenloser Messenger
          </p>
        </div>
      </section>

      <section aria-labelledby="countries-heading" className="mx-auto max-w-6xl px-5 py-9">
        <div className="mb-5">
          <h2 id="countries-heading" className="text-2xl font-bold">Zuerst dein Land auswählen</h2>
          <p className="mt-2 text-slate-600">
            Anzeigen werden von Anfang an nach Ländern getrennt. Wir starten im deutschsprachigen Raum.
          </p>
        </div>
        <div role="group" aria-label="Land wählen" className="grid gap-3 sm:grid-cols-3">
          {countries.map((item) => (
            <button
              type="button"
              key={item.code}
              onClick={() => {
                setCountryCode(item.code);
                setCategoryCode(null);
              }}
              aria-pressed={countryCode === item.code}
              className={`rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${countryCode === item.code
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white"
              }`}
            >
              <span className="block text-lg font-bold">{item.name}</span>
              <span className="mt-1 block text-sm text-slate-600">{item.code} · {item.currency}</span>
              <span className={`mt-3 block text-xs font-semibold ${countryCode === item.code ? "text-blue-700" : "text-slate-500"}`}>
                {countryCode === item.code ? "Ausgewählt ✓" : "Land auswählen"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="mx-auto max-w-6xl px-5 pb-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="categories-heading" className="text-2xl font-bold">Rubriken in {selectedCountry.name}</h2>
            <p className="mt-1 text-sm text-slate-600">Sieben übersichtliche Hauptkategorien statt hunderter leerer Rubriken.</p>
          </div>
          {selectedCategory && (
            <button type="button" onClick={() => setCategoryCode(null)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Alle Kategorien
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <button key={item.code} type="button"
              onClick={() => setCategoryCode(item.code === categoryCode ? null : item.code)}
              aria-pressed={categoryCode === item.code}
              className={`flex min-h-[130px] gap-4 rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${categoryCode === item.code
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-white"
              }`}>
              <span aria-hidden="true" className="text-3xl">{item.symbol}</span>
              <span>
                <span className="block text-base font-bold">{item.name}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{item.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="listings-heading" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Anzeigenvorschau · {countryCode}</p>
          <h2 id="listings-heading" className="mt-2 text-2xl font-bold">
            {selectedCategory ? selectedCategory.name : "Alle Kategorien"} in {selectedCountry.name}
          </h2>
          <div className="mt-7 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold">Noch keine Anzeigen veröffentlicht</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Diese Entwicklungsansicht zeigt absichtlich keine erfundenen Angebote.
              Die Live-Anzeigen erscheinen hier erst nach sicherer Freigabe der Datenbank
              und des Anbieterzugangs.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Aktive Ansicht: {selectedCountry.name} · {selectedCategory?.name ?? "Alle Rubriken"} · {selectedCountry.currency}
            </p>
          </div>
          <p className="mt-6 text-sm text-slate-600">
            Später können Mitglieder hier Inserate aufgeben und direkt über den kostenlosen Messenger Kontakt aufnehmen.
            Der Marktplatz übernimmt keine Bezahlung oder Lieferung.
          </p>
        </div>
      </section>
    </main>
  );
}
