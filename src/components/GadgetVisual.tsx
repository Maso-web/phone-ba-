import type { GadgetCategory } from "~/data/gadgets";

/**
 * Vizual gadžeta.
 *
 * Prioritet: PRAVA fotografija proizvoda (`public/images/gadgets/<slug>.jpg`,
 * og:image iz BH shopa). Kada slike nema, prikazuje se IKONICA KATEGORIJE
 * (sat / slušalica / power bank) — nikada lažni CSS render uređaja.
 */
export function GadgetVisual({
  category,
  image,
  name,
  size = "md",
}: {
  category: GadgetCategory;
  image?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "lg"
      ? "h-52 w-44 sm:h-60 sm:w-52"
      : size === "sm"
        ? "h-24 w-24"
        : "h-40 w-36";
  const iconSize = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-8 w-8" : "h-11 w-11";

  if (image) {
    return (
      <div className={`${box} flex items-center justify-center`}>
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        />
      </div>
    );
  }

  return (
    <div
      className={`${box} flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03]`}
      role="img"
      aria-label={`${name} — nema fotografije, ikonica kategorije`}
    >
      <GadgetIcon category={category} className={iconSize} />
      <span className="px-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
        bez fotografije
      </span>
    </div>
  );
}

/** Ikonica kategorije (koristi se i u vizualu i u filterima) */
export function GadgetIcon({
  category,
  className = "h-5 w-5",
}: {
  category: GadgetCategory;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  if (category === "pametni_satovi") {
    return (
      <svg {...common}>
        <rect x="6.5" y="6" width="11" height="12" rx="3.5" />
        <path d="M9.5 6V3.5h5V6M9.5 18v2.5h5V18" />
        <path d="M12 11v2.5l1.6 1" />
      </svg>
    );
  }
  if (category === "bezbicne_slusalice") {
    return (
      <svg {...common}>
        <path d="M6 14v-2a6 6 0 0 1 12 0v2" />
        <rect x="3.5" y="13" width="4" height="6.5" rx="2" />
        <rect x="16.5" y="13" width="4" height="6.5" rx="2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4" y="7" width="16" height="10" rx="2.5" />
      <path d="M9 12h3M10.5 10.5v3" />
      <path d="M16.5 11.5h.01M16.5 13.5h.01" />
    </svg>
  );
}
