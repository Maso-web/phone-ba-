import {
  SHOP_SCRAPE_DATE,
  type PhoneShopPrices,
  type ShopOffer,
} from "~/data/shop_prices";
import { formatKM } from "~/lib/catalog";
import { formatScrapeDate } from "~/lib/dates";

/**
 * "Cijene u online shopovima — stvarne cijene u BiH": sekcija sa stvarnim
 * cijenama iz 5 BH web-prodavnica (snapshot SHOP_SCRAPE_DATE). Cijene su
 * realne — ne demo. Prikazuje se na stranici telefona kad model ima pogotke.
 */

const SOLD_OUT = "rasprodato";

/** Red je rasprodat ako shop tako kaže — takva cijena nije "od" cijena. */
function isSoldOut(offer: ShopOffer): boolean {
  return (offer.dostupnost ?? "").trim().toLowerCase() === SOLD_OUT;
}

/** Ton značke dostupnosti (shop vraća slobodan tekst). */
function availabilityTone(d: string): string {
  const s = d.trim().toLowerCase();
  if (s === SOLD_OUT) return "pill-gray";
  if (s.includes("posljednji") || s.includes("narudžb") || s.includes("naruc"))
    return "pill-amber";
  return "pill-green";
}

export function ShopPricesSection({ data }: { data: PhoneShopPrices }) {
  const soldOutOnly = data.availableCount === 0;
  return (
    <section
      aria-labelledby="shop-cijene-naslov"
      className="mt-6 rounded-2xl border border-brand-500/20 bg-brand-500/[0.04] p-5 sm:p-6"
    >
      {/* Naslov + datum uvoza */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="shop-cijene-naslov"
          className="flex flex-wrap items-center gap-2 text-lg font-bold text-white"
        >
          <span className="rounded border border-brand-500/30 bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-300">
            Online shopovi
          </span>
          Cijene u online shopovima — stvarne cijene u BiH
        </h2>
        <p className="text-[11.5px] text-slate-500">
          uvoz {formatScrapeDate(SHOP_SCRAPE_DATE)}
        </p>
      </div>

      {/* Min cijena + broj ponuda */}
      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-1">
        {data.minPrice !== null ? (
          <p className="flex items-baseline gap-1.5">
            <span className="text-[13px] font-medium text-slate-400">od</span>
            <span className="text-[30px] font-extrabold leading-none text-accent-400">
              {formatKM(data.minPrice)}
            </span>
          </p>
        ) : (
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-[15px] font-bold leading-none text-slate-300">
              Trenutno rasprodato
            </span>
            <span className="text-[12.5px] text-slate-500">
              (najniža zabilježena cijena {formatKM(data.minListedPrice)})
            </span>
          </p>
        )}
        <p className="text-[13px] font-medium text-slate-400">
          {data.count} {data.count === 1 ? "ponuda" : "ponude"}
          <span className="text-slate-500"> · iz {data.sources.length} shopa</span>
        </p>
      </div>
      <p className="mt-1.5 text-[12px] text-slate-500">
        Cijene iz online shopova — provjeri na izvoru.
        {soldOutOnly &&
          " Sve prikazane ponude su trenutno rasprodato, pa cijene nisu ušle u najnižu cijenu na kartici."}
      </p>

      {/* Lista ponuda (najjeftinija prva) */}
      <ul role="list" className="mt-4 space-y-1">
        {data.offers.map((o) => {
          const soldOut = isSoldOut(o);
          return (
            <li
              key={o.url}
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-white/[0.05] bg-ink-900/50 px-3.5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    {o.shop}
                  </span>
                  {o.dostupnost ? (
                    <span className={`pill ${availabilityTone(o.dostupnost)}`}>
                      {o.dostupnost}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 break-words text-[13.5px] font-semibold leading-snug text-white [overflow-wrap:anywhere]">
                  {o.naziv}
                </p>
              </div>
              <p
                className={`text-[16px] font-extrabold leading-none ${
                  soldOut ? "text-slate-500" : "text-accent-400"
                }`}
              >
                {formatKM(o.cijena_km)}
              </p>
              <a
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-300 transition-colors hover:text-white"
                aria-label={`Pogledaj ${o.naziv} u shopu ${o.shop} — ${formatKM(o.cijena_km)}`}
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
          );
        })}
      </ul>

      <p className="mt-3 text-[11.5px] text-slate-500">
        Snapshot {formatScrapeDate(SHOP_SCRAPE_DATE)} · prodavnice:{" "}
        {data.sources.join(", ")}
      </p>
    </section>
  );
}
