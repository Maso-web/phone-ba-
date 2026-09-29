import { Link } from "@tanstack/react-router";
import type { Phone } from "~/data/phones";
import { minGadgetPrice } from "~/data/gadgets";
import { compatibleGadgets, gadgetRuleFor } from "~/lib/crossSell";
import { formatKM } from "~/lib/catalog";
import { GADGET_CATEGORY_LABELS } from "~/lib/gadgetSpecs";
import { GadgetIcon } from "./GadgetVisual";

/**
 * Cross-selling sekcija na stranici telefona: "Kompatibilni gadžeti".
 *
 * Sadržaj se izvodi automatski iz brenda telefona (vidi src/lib/crossSell.ts) —
 * kada brend nema gadžeta u katalogu, sekcija se ne prikazuje.
 */
export function CompatibleGadgets({ phone }: { phone: Phone }) {
  const compatible = compatibleGadgets(phone);
  if (compatible.length === 0) return null;
  const rule = gadgetRuleFor(phone.brandSlug);

  return (
    <section aria-labelledby="kompatibilni-gadzeti" className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="kompatibilni-gadzeti"
          className="flex flex-wrap items-center gap-2 text-lg font-bold text-white"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4.5 w-4.5 text-accent-400"
          >
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
          Kompatibilni gadžeti
          <span className="pill pill-blue">{phone.brand}</span>
        </h2>
        <Link
          to="/gadzeti"
          className="text-[12.5px] font-semibold text-brand-300 transition-colors hover:text-white"
        >
          Svi gadžeti →
        </Link>
      </div>

      {rule && (
        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-slate-400">
          {rule.note}{" "}
          <span className="text-slate-500">
            Prikazujemo {compatible.length}{" "}
            {compatible.length === 1 ? "gadžet" : "gadžeta"} brenda{" "}
            {rule.gadgetBrands.join(" / ")} iz naše rubrike gadžeta.
          </span>
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {compatible.map((gadget) => (
          <Link
            key={gadget.slug}
            to="/gadzet/$slug"
            params={{ slug: gadget.slug }}
            className="surface-card surface-card-hover group flex items-center gap-3 p-3 focus-visible:outline-2 focus-visible:outline-brand-400"
            aria-label={`${gadget.name} — od ${formatKM(minGadgetPrice(gadget))}`}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03]">
              {gadget.image ? (
                <img
                  src={gadget.image}
                  alt={gadget.name}
                  loading="lazy"
                  decoding="async"
                  className="max-h-14 max-w-14 object-contain"
                />
              ) : (
                <GadgetIcon category={gadget.category} className="h-7 w-7 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <GadgetIcon
                  category={gadget.category}
                  className="h-3.5 w-3.5 text-slate-500"
                />
                {GADGET_CATEGORY_LABELS[gadget.category]}
              </p>
              <h3 className="mt-0.5 line-clamp-2 text-[13.5px] font-bold leading-snug text-white">
                {gadget.name}
              </h3>
              <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
                <span className="text-[15px] font-extrabold text-accent-400">
                  od {formatKM(minGadgetPrice(gadget))}
                </span>
                {gadget.sellers[0]?.demo && (
                  <span className="rounded bg-white/[0.06] px-1 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-slate-400">
                    demo
                  </span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
