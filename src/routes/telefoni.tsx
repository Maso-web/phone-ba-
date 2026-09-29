import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BAND_LABELS,
  BRAND_LABELS,
  BRAND_SLUGS,
  SORT_OPTIONS,
  TAG_LABELS,
  getCatalogPhones,
  normalizeCatalogSearch,
  type CatalogSearch,
  type SortKey,
} from "~/lib/catalog";
import type { AttributeTag, BrandSlug, PriceBand } from "~/data/phones";
import { PhoneCard } from "~/components/PhoneCard";
import { DemoNote } from "~/components/Badges";
import { SponsoredCard } from "~/components/SponsoredCard";
import { getCatalogBannerOffer } from "~/data/sponsored";

export const Route = createFileRoute("/telefoni")({
  validateSearch: (search) => normalizeCatalogSearch(search),
  head: () => ({
    meta: [
      { title: "Svi telefoni — uporedi cijene u KM | phone.ba" },
      {
        name: "description",
        content:
          "Usporedi cijene telefona u BiH kod BH Telecom, HT Eronet, m:tel i lokalnih trgovina. Filtriraj po budžetu, brendu i ključnoj funkciji.",
      },
    ],
  }),
  component: Telefoni,
});

/* ------------------------- konfiguracija ------------------------- */

const BUDZET_FILTERS: PriceBand[] = ["ispod_400", "400_800", "premium"];
const FUNKCIJA_FILTERS: AttributeTag[] = [
  "najbolja_kamera",
  "najbolja_baterija",
  "najbolji_gaming",
];

/* ---------------------------- stranica --------------------------- */

function Telefoni() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const aktivniFiltri: { key: keyof CatalogSearch; label: string }[] = [];
  if (search.budzet) {
    aktivniFiltri.push({ key: "budzet", label: BAND_LABELS[search.budzet] });
  }
  if (search.brend) {
    aktivniFiltri.push({ key: "brend", label: BRAND_LABELS[search.brend] });
  }
  if (search.funkcija) {
    aktivniFiltri.push({ key: "funkcija", label: TAG_LABELS[search.funkcija] });
  }
  if (search.pretraga) {
    aktivniFiltri.push({ key: "pretraga", label: `"${search.pretraga}"` });
  }

  const sort = search.sort ?? "popularno";
  const rezultati = getCatalogPhones(
    {
      q: search.pretraga,
      budzet: search.budzet,
      brend: search.brend,
      funkcija: search.funkcija,
    },
    sort,
  );
  // Sponzorisani baner iznad mreže — samo ako postoji aktivna ponuda
  const bannerOffer = getCatalogBannerOffer();

  const updateSearch = (patch: Partial<CatalogSearch>) => {
    void navigate({
      to: "/telefoni",
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  const toggleChip = <K extends keyof CatalogSearch>(
    key: K,
    value: NonNullable<CatalogSearch[K]>,
  ) => {
    updateSearch({ [key]: search[key] === value ? undefined : value } as Partial<
      CatalogSearch
    >);
  };

  const ocistiSve = () => {
    void navigate({ to: "/telefoni", search: {} });
  };

  return (
    <main className="container-site pb-16 pt-10 lg:pb-24 lg:pt-14">
      {/* Zaglavlje */}
      <div className="animate-fade-up">
        <p className="pill pill-blue mb-3">Katalog</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Svi telefoni
        </h1>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-slate-400">
          Usporedi cijene kod svih većih prodavača u BiH i pronađi najbolju
          ponudu — u KM, ažurirano za tvoj budžet.
        </p>
        <DemoNote className="mt-3 max-w-xl" />
      </div>

      {/* Traka filtera */}
      <div className="surface-card mt-7 p-4 sm:p-5">
        {/* Pretraga */}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="katalog-pretraga" className="sr-only">
            Pretraži telefone
          </label>
          <div className="relative min-w-[200px] flex-1">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="katalog-pretraga"
              type="search"
              value={search.pretraga ?? ""}
              onChange={(e) =>
                updateSearch({ pretraga: e.target.value || undefined })
              }
              placeholder="Pretraži po nazivu, budžetu, kameri…"
              className="h-10 w-full rounded-xl border border-white/10 bg-ink-800 pl-10 pr-3 text-[13.5px] text-white placeholder:text-slate-500 transition-colors duration-200 hover:border-white/25 focus:border-brand-500/50 focus:outline-none"
            />
          </div>
          <label htmlFor="katalog-sort" className="sr-only">
            Sortiranje
          </label>
          <select
            id="katalog-sort"
            value={sort}
            onChange={(e) => updateSearch({ sort: e.target.value as SortKey })}
            className="select-dark"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter grupe */}
        <div className="mt-4 space-y-3.5 border-t border-white/[0.06] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Budžet
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Budžet">
              {BUDZET_FILTERS.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={search.budzet === b}
                  onClick={() => toggleChip("budzet", b)}
                  className="chip"
                >
                  {BAND_LABELS[b]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Brend
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Brend">
              {BRAND_SLUGS.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={search.brend === b}
                  onClick={() => toggleChip("brend", b as BrandSlug)}
                  className="chip"
                >
                  {BRAND_LABELS[b]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Funkcija
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Funkcija">
              {FUNKCIJA_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={search.funkcija === f}
                  onClick={() => toggleChip("funkcija", f as AttributeTag)}
                  className="chip"
                >
                  {TAG_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
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
                onClick={() =>
                  updateSearch({ [f.key]: undefined } as Partial<CatalogSearch>)
                }
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
          {rezultati.length === 1 ? "telefon" : "telefona"}
          {aktivniFiltri.length > 0 && " pronađeno"}
        </p>
        <p className="hidden text-[12px] text-slate-600 sm:block">
          Sortirano:{" "}
          {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Najpopularniji"}
        </p>
      </div>

      {rezultati.length === 0 ? (
        <div className="surface-card mt-5 px-6 py-16 text-center">
          <p className="text-4xl" aria-hidden>
            📱
          </p>
          <h2 className="mt-4 text-xl font-bold text-white">
            Nema rezultata za tvoju pretragu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-slate-400">
            Probaj promijeniti filtere ili povećati budžet — možda tvoj idealni
            telefon čeka za koji razred više.
          </p>
          <button type="button" onClick={ocistiSve} className="btn-primary btn-md mt-6">
            Očisti filtere
          </button>
        </div>
      ) : (
        <>
          {/* Sponzorisani baner — iznad mreže rezultata (kompaktan) */}
          {bannerOffer && (
            <div className="mt-5">
              <SponsoredCard offer={bannerOffer} compact />
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rezultati.map((phone) => (
              <PhoneCard key={phone.slug} phone={phone} />
            ))}
          </div>
        </>
      )}

      {/* Napomena o partnerima */}
      <p className="mt-10 text-center text-[12px] text-slate-600">
        Imaš trgovinu?{" "}
        <a href="mailto:hello@phone.ba" className="font-semibold text-brand-300 hover:text-white">
          Javi se
        </a>{" "}
        za sponzorisanu ponudu i partnerstvo.
      </p>
    </main>
  );
}