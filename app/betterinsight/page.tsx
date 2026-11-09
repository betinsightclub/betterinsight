"use client";

import { useState } from "react";
import Link from "next/link";
import BetterInsightAccountBar from "./components/BetterInsightAccountBar";

// BetterInsight marketplace staging only: 8 languages inherited from BetInsight's
// assets/i18n/locales/manifest.json plus one international aggregate view.
// No deployment, no production data queries, and no invented listings.
// Language is the PRIMARY discovery dimension; countries are OPTIONAL metadata.
type LanguageCode = "INT" | "de" | "en" | "es" | "pt" | "it" | "fr" | "nl" | "zh-tw";
type Category =
  | "sport_freizeit"
  | "fahrzeuge_boote"
  | "technik"
  | "haus_wohnen"
  | "mode"
  | "dienstleistungen"
  | "verschiedenes";

const languages: { code: LanguageCode; name: string; flag: string }[] = [
  { code: "INT", name: "International", flag: "🌐" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "zh-tw", name: "繁體中文", flag: "🇹🇼" },
];

const countries = [
  { code: "", name: "Alle Länder" },
  { code: "DE", name: "Deutschland" },
  { code: "AT", name: "Österreich" },
  { code: "CH", name: "Schweiz" },
  { code: "US", name: "USA" },
  { code: "GB", name: "Vereinigtes Königreich" },
  { code: "BR", name: "Brasilien" },
  { code: "FR", name: "Frankreich" },
  { code: "IT", name: "Italien" },
  { code: "ES", name: "Spanien" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Niederlande" },
] as const;

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
  const [language, setLanguage] = useState<LanguageCode>("INT");
  const [countryFilter, setCountryFilter] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [categoryCode, setCategoryCode] = useState<Category | null>(null);
  const activeLanguage = languages.find((item) => item.code === language) ?? languages[0];
  const selectedCategory = categories.find((item) => item.code === categoryCode) ?? null;

  return (
    <main className="min-h-screen bg-[#f5f9fc] text-[#0a3152]">
      <BetterInsightAccountBar />
      <header className="border-b border-[#d3e2ed] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/betterinsight" className="text-2xl font-black tracking-tight text-[#0a3152]">
            better<span className="text-[#1680d7]">Insight</span>
            <span className="ml-1 text-sm font-normal text-[#37627c]">.club</span>
          </Link>
          <span className="rounded-full border border-[#cee1ee] px-3 py-1 text-xs font-semibold text-[#22516f]">
            Vorschau – noch nicht veröffentlicht
          </span>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#eaf7ff] via-white to-[#eefbe5] px-5 py-14 text-[#0a3152]">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-[#286b9d]">
            Part of the BetInsight Family
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            Post. Discover. <span className="text-[#1680d7]">Connect.</span>
          </h1>
          <p className="mt-4 text-xl font-bold text-[#174d74]">The Global Community Marketplace</p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#325b75]">
            Entdecke Angebote nach Sprache statt in vielen leeren Ländermärkten.
            Land und Währung bleiben zusätzliche Angaben, aber keine eigenen Marktplätze.
          </p>
          <p className="mt-6 text-xs font-bold text-[#245776]">
            8 Sprachen + International · 7 Kategorien · Kostenloser Messenger geplant
          </p>
        </div>
      </section>

      <section aria-labelledby="language-heading" className="mx-auto max-w-6xl px-5 py-9">
        <h2 id="language-heading" className="text-2xl font-bold">International oder eine der acht Sprachen</h2>
        <p className="mt-2 text-sm text-[#4d6376]">
          Eine Anzeige darf mehreren Sprachen zugeordnet werden. Unter International erscheint sie nur einmal.
        </p>
        <div role="group" aria-label="Angebote nach Sprache wählen" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((item) => (
            <button
              type="button"
              key={item.code}
              onClick={() => setLanguage(item.code)}
              aria-pressed={language === item.code}
              className={"flex items-center gap-3 rounded-2xl border-2 p-4 text-left shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1680d7] " + (
                language === item.code
                  ? "border-[#1680d7] bg-[#e7f6ff]"
                  : "border-[#d3e2ed] bg-white"
              )}
            >
              <span aria-hidden="true" className="text-2xl">{item.flag}</span>
              <span className="text-base font-extrabold text-[#0a3152]">{item.name}</span>
              {language === item.code && <span className="ml-auto text-lg font-extrabold text-[#318025]">✓</span>}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="rounded-xl border border-[#d1dfeb] bg-white p-4 text-sm font-bold text-[#0a3152]">
            Land zusätzlich filtern (optional)
            <select
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-[#cbddea] bg-[#f8fcff] p-3 text-[#0a3152]"
            >
              {countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label className="rounded-xl border border-[#d1dfeb] bg-white p-4 text-sm font-bold text-[#0a3152]">
            Bevorzugte Währung für neue Anzeigen
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-[#cbddea] bg-[#f8fcff] p-3 text-[#0a3152]"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="CHF">CHF</option>
              <option value="GBP">GBP (£)</option>
              <option value="BRL">BRL (R$)</option>
            </select>
          </label>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="mx-auto max-w-6xl px-5 pb-12">
        <h2 id="categories-heading" className="text-2xl font-bold">Alle Kategorien · {activeLanguage.name}</h2>
        <p className="mt-2 text-sm text-[#4d6376]">Sieben Hauptkategorien statt hunderter leerer Unterrubriken.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <button key={item.code} type="button"
              onClick={() => setCategoryCode(item.code === categoryCode ? null : item.code)}
              aria-pressed={categoryCode === item.code}
              className={"flex min-h-[130px] gap-4 rounded-2xl border-2 p-5 text-left shadow-sm transition hover:shadow-md " + (
                categoryCode === item.code ? "border-[#1680d7] bg-[#e7f6ff]" : "border-[#d3e2ed] bg-white"
              )}>
              <span aria-hidden="true" className="text-3xl">{item.symbol}</span>
              <span>
                <span className="block text-base font-bold text-[#0a3152]">{item.name}</span>
                <span className="mt-1 block text-sm leading-6 text-[#4d6376]">{item.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="listings-heading" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-2xl border border-[#d3e2ed] bg-white p-7 shadow-sm md:p-10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1474b8]">Anzeigenvorschau · {activeLanguage.name}</p>
          <h2 id="listings-heading" className="mt-2 text-2xl font-bold">
            {selectedCategory ? selectedCategory.name : "Alle Rubriken"} · {activeLanguage.name}
          </h2>
          <div className="mt-7 rounded-xl border border-dashed border-[#bcd3e4] bg-[#f5f9fc] px-6 py-12 text-center">
            <p className="text-lg font-bold">Noch keine Anzeigen veröffentlicht</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#4d6376]">
              Keine erfundenen Angebote. Die Live-Daten kommen erst nach geprüfter Datenbankfreigabe.
              Diese Ansicht dient vorerst dazu, Sprachen, Kategorien und Länderfilter zu testen.
            </p>
            <p className="mt-4 text-xs font-semibold text-[#305b73]">
              Auswahl: {activeLanguage.name} · {selectedCategory?.name ?? "Alle Rubriken"}
              {countryFilter ? " · " + (countries.find((item) => item.code === countryFilter)?.name ?? "") : " · Alle Länder"} · {currency}
            </p>
          </div>
          <p className="mt-6 text-sm text-[#4d6376]">
            Anzeigen können künftig mehrere Sprachen haben, ohne dupliziert zu werden. Bezahlung und Lieferung
            regeln Käufer und Verkäufer eigenständig; der Messenger bleibt kostenlos.
          </p>
        </div>
      </section>
    </main>
  );
}
