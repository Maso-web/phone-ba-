import { useState } from "react";
import { phones } from "~/data/phones";
import {
  formatKM,
  minPriceOf,
  sortPhones,
  trendArrow,
} from "~/lib/catalog";
import { DemoNote, TrendBadge } from "./Badges";
import { PriceChart, Sparkline } from "./PriceChart";

/*
 * Smart Insights — trendovi cijena (Faza 2A).
 * - Dijeli podatke sa katalogom: priceHistory (na data layeru),
 *   minPriceOf/formatKM/trendArrow i TrendBadge (na lib/komponentama).
 * - Čisti SVG grafikoni (PriceChart + Sparkline), bez biblioteka.
 */

/** Top modeli po popularnosti — tabovi za grafikon (4–5 komada) */
const CHART_PHONES = sortPhones(phones, "popularno").slice(0, 5);

/** Top 6 modela — mini "trend lista" sa sparkline-ovima */
const TREND_LIST = sortPhones(phones, "popularno").slice(0, 6);

export function InsightsSection() {
  const [selectedSlug, setSelectedSlug] = useState(CHART_PHONES[0].slug);
  const selected = CHART_PHONES.find((p) => p.slug === selectedSlug) ?? CHART_PHONES[0];

  return (
    <section
      aria-labelledby="insights-naslov"
      className="container-site pb-16 lg:pb-24"
    >
      {/* Zaglavlje sekcije */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pill pill-blue mb-2">Smart Insights</p>
          <h2
            id="insights-naslov"
            className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          >
            Trendovi cijena
          </h2>
          <p className="mt-1 text-[13.5px] text-slate-500">
            Prati kretanje cijena i kupi u pravo vrijeme.
          </p>
        </div>
        <span className="pill pill-green">6 mjeseci · cijene u KM</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        {/* ------------------------------------------------------ */}
        {/* Grafikon + presuda                                     */}
        {/* ------------------------------------------------------ */}
        <div className="min-w-0 surface-card p-5 sm:p-6">
          {/* Naziv + brend */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {selected.name}
              </h3>
              <p className="mt-0.5 text-[12.5px] text-slate-500">
                {selected.tagline}
              </p>
            </div>
            <span className="pill pill-gray">{selected.brand}</span>
          </div>

          {/* Tabovi za promjenu telefona */}
          <div
            role="group"
            aria-label="Izaberi telefon za grafikon cijena"
            className="mt-4 flex gap-1.5 overflow-x-auto pb-1"
          >
            {CHART_PHONES.map((p) => {
              const active = p.slug === selected.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedSlug(p.slug)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand-400 ${
                    active
                      ? "border-accent-500/40 bg-accent-500/15 text-accent-300 shadow-[0_0_0_1px_rgba(34,197,94,0.25)]"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.09] hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Grafikon */}
          <div className="mt-4">
            <PriceChart key={selected.slug} history={selected.priceHistory} />
          </div>

          {/* Presuda + najniža cijena */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.06] pt-4">
            <TrendBadge
              trend={selected.priceTrend}
              percent={selected.trendPercent}
              variant="detail"
            />
            <span className="text-[13px] text-slate-400">
              Najniža cijena:{" "}
              <strong className="font-bold text-accent-400">
                {formatKM(minPriceOf(selected))}
              </strong>
            </span>
            <span className="text-[12px] text-slate-500">
              {trendArrow(selected.priceTrend, selected.trendPercent)} u 6 mjeseci
            </span>
          </div>

          <DemoNote className="mt-4" />
        </div>

        {/* ------------------------------------------------------ */}
        {/* Trend lista (sparkline + značka)                       */}
        {/* ------------------------------------------------------ */}
        <aside
          aria-label="Lista trendova cijena po modelima"
          className="min-w-0 surface-card p-5"
        >
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Trend lista
          </h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Posljednjih 6 mjeseci · klikni za grafikon
          </p>

          <ul className="mt-3.5 space-y-1">
            {TREND_LIST.map((p) => {
              const active = p.slug === selected.slug;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedSlug(p.slug)}
                    aria-label={`${p.name} — prikaži grafikon cijena`}
                    className={`w-full rounded-xl border p-2.5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand-400 ${
                      active
                        ? "border-brand-500/35 bg-brand-500/[0.09]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <span
                          className={`block truncate text-[13px] font-semibold ${
                            active ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {p.name}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-slate-500">
                          od {formatKM(minPriceOf(p))}
                        </span>
                      </div>
                      <Sparkline history={p.priceHistory} trend={p.priceTrend} />
                    </div>
                    <div className="mt-1.5">
                      <TrendBadge
                        trend={p.priceTrend}
                        percent={p.trendPercent}
                        variant="detail"
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}