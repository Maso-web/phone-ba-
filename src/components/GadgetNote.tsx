import { GADGET_SCRAPE_DATE } from "~/data/gadgets";
import { formatScrapeDate } from "~/lib/dates";

/**
 * Napomena o porijeklu podataka u rubrici Gadžeti:
 *  * cijene iz BH online shopova su STVARNI snapshot (sa datumom),
 *  * demo ponude su jasno označene,
 *  * specifikacije su iz podataka prodavača/proizvođača (informativno),
 *  * trend cijene je PROCJENA, ne mjerenje.
 */
export function GadgetNote({ className = "" }: { className?: string }) {
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
        Cijene u rubrici Gadžeti su{" "}
        <strong className="font-semibold text-brand-300">
          stvarni snapshot iz BH online shopova
        </strong>{" "}
        (uvoz {formatScrapeDate(GADGET_SCRAPE_DATE)}, fonTELe, IQ Mobile,
        Univerzalno i Mobitech) — dostupnost provjeri kod prodavca. Ponude
        označene chip-om{" "}
        <span className="rounded bg-white/[0.06] px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          demo
        </span>{" "}
        nisu preuzete iz shopa. Specifikacije su preuzete od prodavača i
        proizvođača i informativne su, a oznaka trenda je{" "}
        <strong className="font-semibold text-slate-400">procjena</strong>, ne
        mjerenje historije cijena.
      </span>
    </p>
  );
}
