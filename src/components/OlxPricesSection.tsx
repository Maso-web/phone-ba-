import type { PhoneOlxPrices } from "~/data/olx_prices";
import {
  OLX_SCRAPE_DATE,
  formatScrapeDate,
} from "~/data/olx_prices";
import { formatKM } from "~/lib/catalog";

/**
 * "OLX.ba — stvarne cijene u BiH": sekcija sa stvarnim poslovnim oglasima
 * iz verificirane arhive (uvoz OLX_SCRAPE_DATE). Cijene su realne — ne demo.
 * Prikazuje se na stranici telefona kad god model ima pogotke u arhivi.
 */
export function OlxPricesSection({ data }: { data: PhoneOlxPrices }) {
  return (
    <section
      aria-labelledby="olx-cijene-naslov"
      className="mt-10 rounded-2xl border border-accent-500/20 bg-accent-500/[0.04] p-5 sm:p-6"
    >
      {/* Naslov + datum uvoza */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="olx-cijene-naslov"
          className="flex flex-wrap items-center gap-2 text-lg font-bold text-white"
        >
          <span className="rounded border border-accent-500/30 bg-accent-500/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-accent-400">
            OLX.ba
          </span>
          Stvarne cijene u BiH
        </h2>
        <p className="text-[11.5px] text-slate-500">
          uvoz {formatScrapeDate(OLX_SCRAPE_DATE)}
        </p>
      </div>
      {/* Min cijena + broj oglasa */}
      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-1">
        <p className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-medium text-slate-400">od</span>
          <span className="text-[30px] font-extrabold leading-none text-accent-400">
            {formatKM(data.minPrice)}
          </span>
        </p>
        <p className="text-[13px] font-medium text-slate-400">
          {data.count} {data.count === 1 ? "oglas" : "oglasa"}
          <span className="text-slate-500"> · poslovne radnje</span>
        </p>
      </div>
      <p className="mt-1.5 text-[12px] text-slate-500">
        Cijene poslovnih oglasa na OLX.ba — provjeri na izvoru.
      </p>
      {/* Lista oglasa (najjeftiniji prvi) */}
      <ul role="list" className="mt-4 space-y-1">
        {data.offers.map((o) => (
          <li
            key={o.link}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-white/[0.05] bg-ink-900/50 px-3.5 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="break-words text-[13.5px] font-semibold leading-snug text-white [overflow-wrap:anywhere]">
                {o.naziv}
              </p>
              <p className="mt-0.5 text-[11.5px] text-slate-500">{o.grad}</p>
            </div>
            <p className="text-[16px] font-extrabold leading-none text-accent-400">
              {formatKM(o.cijena_km)}
            </p>
            <a
              href={o.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-300 transition-colors hover:text-white"
            >
              Pogledaj
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}