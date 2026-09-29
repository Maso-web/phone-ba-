import type { Availability, PriceTrend } from "~/data/phones";
import { trendArrow, trendDetailLabel, trendCardLabel } from "~/lib/catalog";
import { OLX_SCRAPE_DATE } from "~/data/olx_prices";
import { SHOP_SCRAPE_DATE } from "~/data/shop_prices";
import { formatScrapeDate } from "~/lib/dates";

/* ------------------------------------------------------------------ */
/* Trend značka (kartica / detaljna stranica)                          */
/* ------------------------------------------------------------------ */

export function TrendBadge({
  trend,
  percent,
  variant = "card",
  className = "",
}: {
  trend: PriceTrend;
  percent: number;
  variant?: "card" | "detail";
  className?: string;
}) {
  const label =
    variant === "card" ? trendCardLabel(trend) : trendDetailLabel(trend);
  const tone =
    trend === "pad"
      ? "pill-green"
      : trend === "rast"
        ? "pill-amber"
        : "pill-gray";
  return (
    <span className={`pill whitespace-nowrap ${tone} ${className}`}>
      <span aria-hidden>{trendArrow(trend, percent).split(" ")[0]}</span>
      {label}
      <span className="opacity-70" aria-hidden>
        {trendArrow(trend, percent)}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Značka dostupnosti (Na stanju / Naruči / Rasprodato)                */
/* ------------------------------------------------------------------ */

const AVAILABILITY_TONE: Record<Availability, string> = {
  "Na stanju": "pill-green",
  Naruči: "pill-amber",
  Rasprodato: "pill-gray",
};

const AVAILABILITY_DOT: Record<Availability, string> = {
  "Na stanju": "bg-accent-400",
  Naruči: "bg-warn-400",
  Rasprodato: "bg-slate-500",
};

export function AvailabilityBadge({
  availability,
  className = "",
}: {
  availability: Availability;
  className?: string;
}) {
  return (
    <span className={`pill ${AVAILABILITY_TONE[availability]} ${className}`}>
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${AVAILABILITY_DOT[availability]}`}
      />
      {availability}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Značka funkcije (kamera, baterija, gaming, budžet)                  */
/* ------------------------------------------------------------------ */

export function TagPill({ label }: { label: string }) {
  return <span className="pill pill-blue">{label}</span>;
}

/* ------------------------------------------------------------------ */
/* Napomena o demo podacima                                            */
/* ------------------------------------------------------------------ */

export function DemoNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 text-[12px] leading-relaxed text-slate-500 ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-3.5 w-3.5 shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <span>
        Cijene telekoma i lokalnih trgovina su{" "}
        <strong className="font-semibold text-slate-400">
          demo podaci za lansiranje
        </strong>{" "}
        — nisu verificirane. Cijene s{" "}
        <strong className="font-semibold text-accent-400">OLX.ba</strong> su
        stvarni poslovni oglasi (uvoz {formatScrapeDate(OLX_SCRAPE_DATE)}), a
        cijene iz{" "}
        <strong className="font-semibold text-brand-300">
          BH online shopova
        </strong>{" "}
        stvarni snapshot od {formatScrapeDate(SHOP_SCRAPE_DATE)} — provjeri
        detalje na izvoru.
      </span>
    </p>
  );
}