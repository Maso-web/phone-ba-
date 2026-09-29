import { Link } from "@tanstack/react-router";
import type { Phone } from "~/data/phones";
import { formatKM, minPriceOf } from "~/lib/catalog";
import { getOlxPrices } from "~/data/olx_prices";
import { getShopPrices } from "~/data/shop_prices";
import { PhoneVisual } from "./PhoneVisual";
import { TrendBadge } from "./Badges";

/** Kartica telefona — koristi se u katalogu i na početnoj stranici. */
export function PhoneCard({ phone }: { phone: Phone }) {
  const from = minPriceOf(phone);
  const olx = getOlxPrices(phone.slug);
  const shop = getShopPrices(phone.slug);
  // Rasprodati shop artikli ne nose "od" cijenu (vidi effectiveMinOf)
  const shopFrom = shop && shop.minPrice !== null ? shop.minPrice : null;
  return (
    <Link
      to="/telefon/$slug"
      params={{ slug: phone.slug }}
      className="surface-card surface-card-hover group flex flex-col overflow-hidden p-4 focus-visible:outline-2 focus-visible:outline-brand-400"
      aria-label={`${phone.name} — od ${formatKM(from)} (demo)${
        olx
          ? `. Stvarna OLX cijena od ${formatKM(olx.minPrice)} (${olx.count} ${
              olx.count === 1 ? "oglas" : "oglasa"
            }).`
          : ""
      }${
        shopFrom !== null
          ? ` Stvarna cijena u online shopovima od ${formatKM(shopFrom)} (${
              shop!.count
            } ${shop!.count === 1 ? "ponuda" : "ponude"} iz ${
              shop!.sources.length
            } ${shop!.sources.length === 1 ? "shopa" : "shopova"}).`
          : ""
      } Pogledaj ponude.`}
    >
      {/* Gornja traka: brend + trend */}
      <div className="flex items-center justify-between gap-2">
        <span className="pill pill-gray">{phone.brand}</span>
        <TrendBadge trend={phone.priceTrend} percent={phone.trendPercent} />
      </div>

      {/* Vizual */}
      <div className="relative mx-auto my-4 h-44 w-full">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-90"
          style={{
            background:
              phone.brand === "Apple"
                ? "rgba(99,143,255,0.35)"
                : phone.brand === "Samsung"
                  ? "rgba(140,110,255,0.32)"
                  : phone.brand === "Xiaomi"
                    ? "rgba(255,158,64,0.30)"
                    : "rgba(45,212,191,0.30)",
          }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-[1.04]">
          <PhoneVisual brand={phone.brand} size="md" image={phone.image} name={phone.name} />
        </div>
      </div>

      {/* Naziv + tagline */}
      <h3 className="text-[15.5px] font-bold leading-snug text-white">
        {phone.name}
      </h3>
      <p className="mt-0.5 line-clamp-1 text-[12.5px] text-slate-400">
        {phone.tagline}
      </p>

      {/* Spec čipovi */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[
          phone.specs.storage,
          phone.specs.battery,
          phone.specs.camera.split(" ")[0],
        ]
          // "—" = shop ne navodi taj podatak (vidi src/data/phones.ts) — ne prikazuj prazno polje
          .filter((spec) => spec && spec !== "—")
          .map((spec) => (
          <span
            key={spec}
            className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-300"
          >
            {spec}
          </span>
        ))}
      </div>

      {/* Podnožje: cijena + ponude */}
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-3.5">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">od</p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[22px] font-extrabold leading-none text-accent-400">
            {formatKM(from)}
            <span className="rounded bg-white/[0.06] px-1 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-slate-400">
              demo
            </span>
          </p>
          {olx && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13.5px] font-extrabold leading-none text-accent-300">
              <span className="rounded border border-accent-500/30 bg-accent-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-400">
                OLX
              </span>
              od {formatKM(olx.minPrice)}
              <span className="font-medium text-slate-500">
                · {olx.count} {olx.count === 1 ? "oglas" : "oglasa"}
              </span>
            </p>
          )}
          {shopFrom !== null && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13.5px] font-extrabold leading-none text-accent-300">
              <span className="rounded border border-brand-500/30 bg-brand-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-300">
                SHOP
              </span>
              od {formatKM(shopFrom)}
              <span className="font-medium text-slate-500">
                · {shop!.count} {shop!.count === 1 ? "ponuda" : "ponude"}
              </span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[11.5px] text-slate-500">
            {phone.sellers.length} ponuda
          </span>
          <span className="flex items-center gap-1 text-[12.5px] font-semibold text-brand-300 transition-colors group-hover:text-white">
            Ponude
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}