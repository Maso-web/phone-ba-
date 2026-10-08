import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CITIES, CITY_LABELS, OLX_SCRAPE_DATE, services } from "~/data/services";
import type { CitySlug, ServiceType } from "~/data/services";
import { formatKM } from "~/lib/catalog";

export const Route = createFileRoute("/servisi")({
  validateSearch: (search) => normalizeServicesSearch(search),
  head: () => ({
    meta: [
      { title: "Servisi i Oprema — imenik u tvom gradu | phone.ba" },
      {
        name: "description",
        content:
          "Imenik servisa za popravku telefona i prodavnica opreme iz cijele Bosne i Hercegovine — stvarni poslovni oglasi sa OLX.ba na jednom mjestu.",
      },
      { property: "og:url", content: "https://phone.ba/servisi" },
      { property: "og:title", content: "Servisi i Oprema — imenik u tvom gradu | phone.ba" },
      {
        property: "og:description",
        content:
          "Imenik servisa za popravku telefona i prodavnica opreme iz cijele Bosne i Hercegovine — stvarni poslovni oglasi sa OLX.ba na jednom mjestu.",
      },
    ],
    links: [{ rel: "canonical", href: "https://phone.ba/servisi" }],
  }),
  component: Servisi,
});

/* ------------------------- konfiguracija ------------------------- */

interface ServicesSearch {
  grad?: CitySlug;
  tip?: ServiceType;
}

const GRAD_VALUES: readonly CitySlug[] = [
  "sarajevo",
  "banja_luka",
  "mostar",
  "tuzla",
  "zenica",
  "ostalo",
];
const TIP_VALUES: readonly ServiceType[] = ["servis", "oprema"];

/** Normalizuje nepoznate search parametre iz URL-a u ServicesSearch. */
function normalizeServicesSearch(search: Record<string, unknown>): ServicesSearch {
  const en = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
    typeof v === "string" && (allowed as readonly string[]).includes(v)
      ? (v as T)
      : undefined;
  return {
    grad: en(search.grad, GRAD_VALUES),
    tip: en(search.tip, TIP_VALUES),
  };
}

/** "2026-09-13" -> "13.9.2026." */
function formatDatum(iso: string): string {
  const [god, mj, dan] = iso.split("-");
  if (!god || !mj || !dan) return iso;
  return `${Number(dan)}.${Number(mj)}.${god}.`;
}

/* ---------------------------- ikonice ---------------------------- */

function WrenchIcon({ className = "h-3 w-3" }: { className?: string }) {
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
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function HeadphonesIcon({ className = "h-3 w-3" }: { className?: string }) {
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
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-slate-500"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------------------------- stranica --------------------------- */

function Servisi() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const aktivniFiltri: { key: keyof ServicesSearch; label: string }[] = [];
  if (search.grad) {
    aktivniFiltri.push({ key: "grad", label: CITY_LABELS[search.grad] });
  }
  if (search.tip) {
    aktivniFiltri.push({
      key: "tip",
      label: search.tip === "servis" ? "Servisi" : "Oprema",
    });
  }

  const rezultati = services.filter(
    (s) =>
      (!search.grad || s.city === search.grad) &&
      (!search.tip || s.type === search.tip),
  );

  const updateSearch = (patch: Partial<ServicesSearch>) => {
    void navigate({
      to: "/servisi",
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  const toggleChip = <K extends keyof ServicesSearch>(
    key: K,
    value: NonNullable<ServicesSearch[K]>,
  ) => {
    updateSearch({ [key]: search[key] === value ? undefined : value } as Partial<
      ServicesSearch
    >);
  };

  const ocistiSve = () => {
    void navigate({ to: "/servisi", search: {} });
  };

  return (
    <main className="container-site pb-16 pt-10 lg:pb-24 lg:pt-14">
      {/* Zaglavlje */}
      <div className="animate-fade-up">
        <p className="pill pill-blue mb-3">Imenik</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Servisi i Oprema
        </h1>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-slate-400">
          Stvarni poslovni oglasi za popravku telefona i prodaju opreme — iz
          cijele BiH na jednom mjestu.
        </p>
        <p className="mt-3 flex max-w-xl items-start gap-2 text-[12px] leading-relaxed text-slate-500">
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
            Imenik prikazuje{" "}
            <strong className="font-semibold text-slate-400">
              stvarne poslovne oglase sa OLX.ba
            </strong>{" "}
            (uvoz {OLX_SCRAPE_DATE}). Oglasi nisu verificirani — provjera
            podataka i dodatni izvori dolaze uskoro.
          </span>
        </p>
      </div>

      {/* Filteri */}
      <div className="surface-card mt-7 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Grad
          </span>
          <button
            type="button"
            aria-pressed={!search.grad}
            onClick={() => updateSearch({ grad: undefined })}
            className="chip"
          >
            Sve
          </button>
          {CITIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={search.grad === c.slug}
              onClick={() => toggleChip("grad", c.slug)}
              className="chip"
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3.5">
          <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tip
          </span>
          <button
            type="button"
            aria-pressed={!search.tip}
            onClick={() => updateSearch({ tip: undefined })}
            className="chip"
          >
            Sve
          </button>
          <button
            type="button"
            aria-pressed={search.tip === "servis"}
            onClick={() => toggleChip("tip", "servis")}
            className="chip"
          >
            Servisi
          </button>
          <button
            type="button"
            aria-pressed={search.tip === "oprema"}
            onClick={() => toggleChip("tip", "oprema")}
            className="chip"
          >
            Oprema
          </button>
        </div>

        {/* Aktivni filteri */}
        {aktivniFiltri.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
            <span className="text-[12px] font-medium text-slate-500">
              Aktivni filteri:
            </span>
            {aktivniFiltri.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => updateSearch({ [f.key]: undefined } as Partial<ServicesSearch>)}
                className="pill pill-green hover:border-accent-500/50 hover:text-accent-300"
                aria-label={`Ukloni filter ${f.label}`}
              >
                {f.label}
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  className="h-3 w-3"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            ))}
            <button
              type="button"
              onClick={ocistiSve}
              className="text-[12.5px] font-semibold text-brand-300 transition-colors hover:text-white"
            >
              Očisti sve
            </button>
          </div>
        )}
      </div>

      {/* Rezultati */}
      <div className="mt-7 flex items-center justify-between">
        <p className="text-[13px] text-slate-400">
          <strong className="font-bold text-white">{rezultati.length}</strong>{" "}
          {rezultati.length === 1 ? "zapis" : "zapisa"}
          {aktivniFiltri.length > 0 && " pronađeno"}
        </p>
        <p className="hidden text-[12px] text-slate-600 sm:block">
          {services.length} oglasa · OLX.ba
        </p>
      </div>

      {rezultati.length === 0 ? (
        <div className="surface-card mt-5 px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden>
            🔧
          </p>
          <h2 className="mt-4 text-xl font-bold text-white">
            Nema rezultata za ove filtere
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-400">
            Probaj promijeniti grad ili tip — možda ono što tražiš postoji u
            obližnjem gradu.
          </p>
          <button type="button" onClick={ocistiSve} className="btn-primary btn-md mt-6">
            Očisti filtere
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rezultati.map((s) => (
            <article
              key={s.id}
              className="surface-card surface-card-hover group flex flex-col p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={
                    s.type === "servis" ? "pill pill-blue" : "pill pill-green"
                  }
                >
                  {s.type === "servis" ? <WrenchIcon /> : <HeadphonesIcon />}
                  {s.type === "servis" ? "Servis" : "Oprema"}
                </span>
                <span className="pill pill-gray !text-[9.5px]">
                  {s.source === "olx.ba" ? "OLX.ba" : s.source}
                </span>
              </div>

              <h3 className="mt-4 break-words text-[15.5px] font-bold leading-snug text-white [overflow-wrap:anywhere]">
                {s.name}
              </h3>

              <div className="mt-3 space-y-1.5 text-[12.5px] text-slate-400">
                <p className="flex items-start gap-2">
                  <PinIcon />
                  {s.address && (
                    <>
                      <span>{s.address}</span>
                      <span className="text-slate-500">·</span>
                    </>
                  )}
                  <span className="font-medium text-slate-300">
                    {s.cityRaw}
                  </span>
                </p>
                {s.phone && (
                  <p className="flex items-center gap-2">
                    <PhoneIcon />
                    <a
                      href={`tel:${s.phone.replace(/\s/g, "")}`}
                      className="font-semibold text-brand-300 transition-colors hover:text-white"
                    >
                      {s.phone}
                    </a>
                  </p>
                )}
                {s.email && (
                  <p className="flex items-center gap-2">
                    <MailIcon />
                    <a
                      href={`mailto:${s.email}`}
                      className="font-semibold text-accent-400/90 transition-colors hover:text-accent-400"
                    >
                      {s.email}
                    </a>
                  </p>
                )}
                {s.workingHours && (
                  <p className="flex items-center gap-2">
                    <ClockIcon />
                    <span>{s.workingHours}</span>
                  </p>
                )}
                {s.price_km != null && (
                  <p className="flex items-center gap-2">
                    <TagIcon />
                    <span className="text-[15px] font-bold text-accent-400">
                      {formatKM(s.price_km)}
                    </span>
                  </p>
                )}
              </div>

              <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
                {s.description}
              </p>

              <div className="mt-auto border-t border-white/[0.06] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-300 transition-colors hover:text-white"
                  >
                    Pogledaj na OLX
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  </a>
                  <span className="text-[11px] text-slate-500">
                    Podatak od {formatDatum(s.scrapedAt)}
                  </span>
                </div>
                <a
                  href="mailto:partner@phone.ba"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-300 transition-colors hover:text-white"
                >
                  Postani partner
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
                </a>
                <p className="mt-1 text-[11px] text-slate-600">
                  Prijave partnera otvaramo uskoro
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}