import { Link } from "@tanstack/react-router";
import {
  minGadgetPrice,
  realOfferCount,
  sortedGadgetSellers,
  type Gadget,
} from "~/data/gadgets";
import { GADGET_CATEGORY_LABELS, specChips } from "~/lib/gadgetSpecs";
import { formatKM } from "~/lib/catalog";
import { TrendBadge } from "./Badges";
import { GadgetVisual } from "./GadgetVisual";

/**
 * Kartica gadžeta — koristi se u rubrici /gadzeti i u cross-sell sekciji.
 * Cijena je STVARNA iz BH shopova; kada je najniža ponuda demo, to je
 * označeno chip-om "demo" (nikad se ne miješa sa stvarnim cijenama).
 */
export function GadgetCard({
  gadget,
  compact = false,
}: {
  gadget: Gadget;
  compact?: boolean;
}) {
  const sellers = sortedGadgetSellers(gadget);
  const cheapest = sellers[0];
  const from = minGadgetPrice(gadget);
  const isDemo = Boolean(cheapest?.demo);
  const real = realOfferCount(gadget);

  return (
    <Link
      to="/gadzet/$slug"
      params={{ slug: gadget.slug }}
      className="surface-card surface-card-hover group flex flex-col overflow-hidden p-4 focus-visible:outline-2 focus-visible:outline-brand-400"
      aria-label={`${gadget.name} — ${
        isDemo ? "demo cijena od" : "od"
      } ${formatKM(from)}. ${GADGET_CATEGORY_LABELS[gadget.category]}. Pogledaj ponude.`}
    >
      {/* Gornja traka: brend + trend */}
      <div className="flex items-center justify-between gap-2">
        <span className="pill pill-gray">{gadget.brand}</span>
        <TrendBadge trend={gadget.priceTrend} percent={gadget.trendPercent} />
      </div>

      {/* Vizual */}
      <div className="relative mx-auto my-4 flex items-center justify-center">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
          style={{ background: "rgba(45,212,191,0.28)" }}
        />
        <div className="relative transition-transform duration-300 group-hover:scale-[1.04]">
          <GadgetVisual
            category={gadget.category}
            image={gadget.image}
            name={gadget.name}
            size={compact ? "sm" : "md"}
          />
        </div>
      </div>

      {/* Naziv + tagline */}
      <h3 className="text-[15.5px] font-bold leading-snug text-white">
        {gadget.name}
      </h3>
      <p className="mt-0.5 line-clamp-2 text-[12.5px] text-slate-400">
        {gadget.tagline}
      </p>

      {/* Spec čipovi (AI-parsirana polja za tu kategoriju) */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {specChips(gadget.category, gadget.specs).map((chip) => (
          <span
            key={chip}
            className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-300"
          >
            {chip}
          </span>
        ))}
      </div>

      {/* Podnožje: cijena + ponude */}
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-3.5">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">od</p>
          <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[22px] font-extrabold leading-none text-accent-400">
            {formatKM(from)}
            {isDemo ? (
              <span className="rounded bg-white/[0.06] px-1 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-slate-400">
                demo
              </span>
            ) : (
              <span className="rounded border border-accent-500/30 bg-accent-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-400">
                stvarna
              </span>
            )}
          </p>
          <p className="mt-1.5 text-[11.5px] text-slate-500">
            {real > 0
              ? `${real} ${real === 1 ? "stvarna ponuda" : "stvarne ponude"} u BH shopovima`
              : "demo ponuda (shop bez objavljene cijene)"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[11.5px] text-slate-500">
            {sellers.length} {sellers.length === 1 ? "ponuda" : "ponude"}
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
