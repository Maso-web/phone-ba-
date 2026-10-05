import type { SponsoredOffer } from "~/data/sponsored";
import { formatKM } from "~/lib/catalog";
import { track } from "~/lib/analytics";

/**
 * Sponzorisana ponuda — premium kartica jasno odvojena od organskih
 * ponuda (topli amber ton, "Sponzorisana ponuda" labela, demo microcopy).
 * Nikada se ne miješa u liste prodavača niti u rangiranje cijena.
 */

/* Megafon (reklama) ikona — inline SVG */
function MegaphoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

/* CTA dugme — svjesno drugačije od organskog "Kupi" (topli outline) */
function SponsorCta({ offer }: { offer: SponsoredOffer }) {
  return (
    <a
      href={offer.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        /* Poslovni događaj: klik na sponzorisanu ponudu */
        track("sponsored_click", {
          sponsor: offer.logoText,
          name: offer.dealTitle,
          position: offer.position,
        })
      }
      aria-label={`${offer.ctaLabel} — ${offer.logoText} (sponzorisana ponuda)`}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-warn-500/30 bg-warn-500/10 px-4 py-2 text-[13px] font-bold text-warn-300 transition-all duration-200 hover:border-warn-500/60 hover:bg-warn-500/15 hover:text-warn-200"
    >
      {offer.ctaLabel}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
  );
}

export function SponsoredCard({
  offer,
  compact = false,
}: {
  offer: SponsoredOffer;
  compact?: boolean;
}) {
  const usteda = offer.regularPriceKM - offer.promoPriceKM;

  /* ------------------------- kompaktni baner ------------------------ */
  if (compact) {
    return (
      <div
        data-sponsored={offer.id}
        className="relative flex flex-wrap items-center gap-x-4 gap-y-2 overflow-hidden rounded-2xl border border-warn-500/20 bg-gradient-to-r from-warn-500/[0.07] via-ink-900/75 to-ink-900/85 px-4 py-3 sm:flex-nowrap"
      >
        <div
          aria-hidden
          className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-warn-500/10 blur-2xl"
        />
        <div className="relative min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-warn-400/90">
            <MegaphoneIcon className="h-3 w-3" />
            Sponzorisana ponuda
          </p>
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warn-500/15 text-[9px] font-extrabold text-warn-300"
            >
              {offer.initials}
            </span>
            <span className="truncate text-[13.5px] font-bold text-white">
              {offer.logoText} — {offer.dealTitle}
            </span>
            <span className="pill pill-amber">{offer.badgeText}</span>
          </div>
        </div>
        <div className="relative flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-[17px] font-extrabold leading-none text-accent-400">
            {formatKM(offer.promoPriceKM)}
          </span>
          <span className="text-[12px] font-medium text-slate-500 line-through">
            {formatKM(offer.regularPriceKM)}
          </span>
        </div>
        <div className="relative flex flex-wrap items-center gap-2 sm:gap-3">
          <SponsorCta offer={offer} />
          <span className="text-[10px] leading-tight text-slate-600">
            Demo primjer — sponzorisana ponuda uskoro uživo
          </span>
        </div>
      </div>
    );
  }

  /* ------------------------- puna kartica --------------------------- */
  return (
    <div
      data-sponsored={offer.id}
      className="relative overflow-hidden rounded-2xl border border-warn-500/20 bg-gradient-to-b from-warn-500/[0.07] via-ink-900/70 to-ink-900/85 p-4 shadow-[0_0_44px_-18px_rgba(245,158,11,0.35)]"
    >
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-warn-500/10 blur-2xl"
      />
      <div className="relative">
        {/* Labela */}
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-warn-400">
          <MegaphoneIcon className="h-3.5 w-3.5" />
          Sponzorisana ponuda
        </p>

        {/* Prodavač */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warn-500/15 text-[10px] font-extrabold text-warn-300"
          >
            {offer.initials}
          </span>
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold leading-tight text-white">
              {offer.logoText}
            </p>
            <p className="truncate text-[11px] leading-tight text-slate-500">
              {offer.storeName}
            </p>
          </div>
        </div>

        {/* Naslov ponude */}
        <p className="mt-3 text-[14.5px] font-bold leading-snug text-white">
          {offer.dealTitle}
        </p>

        {/* Cijene */}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="text-[26px] font-extrabold leading-none text-accent-400">
            {formatKM(offer.promoPriceKM)}
          </span>
          <span className="text-[13px] font-medium text-slate-500 line-through">
            {formatKM(offer.regularPriceKM)}
          </span>
        </div>
        <p className="mt-1.5 text-[11.5px] font-semibold text-accent-500">
          Uštedi {formatKM(usteda)} — {offer.badgeText}
        </p>

        {/* CTA */}
        <div className="mt-4">
          <SponsorCta offer={offer} />
        </div>

        {/* Demo microcopy — poštenje prema korisniku */}
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] leading-relaxed text-slate-600">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3 shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Demo primjer — sponzorisana ponuda uskoro uživo
        </p>
      </div>
    </div>
  );
}