import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  getGadget,
  minGadgetPrice,
  realOfferCount,
  sortedGadgetSellers,
  type GadgetSeller,
} from "~/data/gadgets";
import { GADGET_CATEGORY_LABELS, specRows } from "~/lib/gadgetSpecs";
import { BRAND_LABELS, BRAND_SLUGS, formatKM, trendArrow } from "~/lib/catalog";
import type { BrandSlug } from "~/data/phones";
import { TrendBadge } from "~/components/Badges";
import { GadgetIcon, GadgetVisual } from "~/components/GadgetVisual";
import { GadgetNote } from "~/components/GadgetNote";
import { GadgetCard } from "~/components/GadgetCard";
import { gadgetsByCategory } from "~/data/gadgets";

export const Route = createFileRoute("/gadzet/$slug")({
  head: ({ params }) => {
    const gadget = getGadget(params.slug);
    return {
      meta: gadget
        ? [
            {
              title: `${gadget.name} — cijene u BiH i specifikacije | phone.ba`,
            },
            {
              name: "description",
              content: `${gadget.name}: ${gadget.tagline} Uporedi cijene u KM u BH online shopovima.`,
            },
          ]
        : [{ title: "Gadžet nije pronađen | phone.ba" }],
    };
  },
  component: GadgetDetail,
  notFoundComponent: () => <GadgetNotFound />,
});

/* ------------------------------------------------------------------ */
/* 404                                                                 */
/* ------------------------------------------------------------------ */

function GadgetNotFound() {
  return (
    <main className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <GadgetIcon category="ostala_oprema" className="h-12 w-12 text-slate-600" />
      <h1 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
        Nismo pronašli taj gadžet
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        Gadžet možda nije u našem katalogu ili je link zastario. Pogledaj sve
        gadžete i opremu.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/gadzeti" search={{}} className="btn-primary btn-md">
          Svi gadžeti
        </Link>
        <Link to="/" className="btn-ghost btn-md">
          Početna
        </Link>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Detaljna stranica                                                   */
/* ------------------------------------------------------------------ */

/** Mapiranje brenda gadžeta na brend telefona (za link "uz koji telefon") */
const GADGET_BRAND_TO_PHONE: Record<string, BrandSlug> = {
  apple: "apple",
  samsung: "samsung",
  xiaomi: "xiaomi",
  redmi: "xiaomi",
  honor: "honor",
  google: "google",
  motorola: "motorola",
  oneplus: "oneplus",
  realme: "realme",
};

function GadgetDetail() {
  const { slug } = Route.useParams();
  const gadget = getGadget(slug);
  if (!gadget) throw notFound();

  const sellers = sortedGadgetSellers(gadget);
  const from = minGadgetPrice(gadget);
  const real = realOfferCount(gadget);
  const cheapest = sellers[0];
  const isDemo = Boolean(cheapest?.demo);
  const rows = specRows(gadget.category, gadget.specs);
  const phoneBrandSlug = GADGET_BRAND_TO_PHONE[gadget.brand.toLowerCase()];
  const slicno = gadgetsByCategory(gadget.category)
    .filter((g) => g.slug !== gadget.slug)
    .sort((a, b) => minGadgetPrice(a) - minGadgetPrice(b))
    .slice(0, 3);

  return (
    <main className="container-site pb-16 pt-8 lg:pb-24">
      {/* Breadcrumb */}
      <nav
        aria-label="Putanja"
        className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-500"
      >
        <Link to="/" className="transition-colors hover:text-white">
          Početna
        </Link>
        <span aria-hidden>/</span>
        <Link to="/gadzeti" search={{}} className="transition-colors hover:text-white">
          Gadžeti
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-300">{gadget.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Lijeva kolona — vizual + specifikacije */}
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill pill-gray">{gadget.brand}</span>
            <span className="pill pill-blue">
              {GADGET_CATEGORY_LABELS[gadget.category]}
            </span>
            <span className="pill pill-green">Cijene u KM</span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {gadget.name}
          </h1>
          <p className="mt-1.5 text-[15px] text-slate-400">{gadget.tagline}</p>

          {/* Hero: prava fotografija proizvoda */}
          <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-white/[0.06] bg-ink-900/50 p-5">
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{ background: "rgba(45,212,191,0.26)" }}
              />
              <div className="relative animate-float-slow">
                <GadgetVisual
                  category={gadget.category}
                  image={gadget.image}
                  name={gadget.name}
                  size="lg"
                />
              </div>
            </div>
            <div className="min-w-[200px] flex-1">
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Trend cijene (procjena)
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TrendBadge
                  trend={gadget.priceTrend}
                  percent={gadget.trendPercent}
                  variant="detail"
                />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                {gadget.priceTrend === "pad" &&
                  "Cijena ovog gadžeta je u blagom padu — dobar trenutak za kupovinu."}
                {gadget.priceTrend === "rast" &&
                  "Cijena raste — možda je pametnije sačekati novi ciklus ponuda."}
                {gadget.priceTrend === "stabilno" &&
                  "Cijena je stabilna — možeš kupiti bez žurbe."}
              </p>
              <p className="pill pill-gray mt-3 !normal-case !tracking-normal">
                {trendArrow(gadget.priceTrend, gadget.trendPercent)} u odnosu na
                prošli mjesec
              </p>
              {gadget.imageSource && (
                <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
                  Fotografija proizvoda: {gadget.imageSource}
                </p>
              )}
            </div>
          </div>

          {/* Specifikacije — polja prepoznata po kategoriji */}
          <h2 className="mt-8 flex flex-wrap items-center gap-2 text-lg font-bold text-white">
            Specifikacije
            <span className="pill pill-gray !py-0.5">
              {GADGET_CATEGORY_LABELS[gadget.category]}
            </span>
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Podaci preuzeti od prodavača i proizvođača; polja koja izvor ne
            navodi nisu prikazana.
          </p>
          {rows.length > 0 ? (
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {rows.map((r) => (
                <div
                  key={r.key}
                  className="rounded-xl border border-white/[0.06] bg-ink-900/60 p-3.5"
                >
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {r.label}
                  </dt>
                  <dd className="mt-1 text-[13.5px] font-semibold text-white">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-[13px] text-slate-500">
              Prodavač za ovaj model ne navodi specifikacije — provjeri detalje
              na stranici prodavca.
            </p>
          )}

          {/* Gdje kupiti */}
          <h2 className="mt-10 text-lg font-bold text-white">
            Gdje kupiti {gadget.name}
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {real > 0
              ? `Stvarne cijene iz ${real} ${
                  real === 1 ? "ponude" : "ponude"
                } u BH online shopovima, sortirano po cijeni.`
              : "Za ovaj model shopovi trenutno ne objavljuju cijenu — prikazana je demo ponuda."}
          </p>
          <ul className="mt-4 space-y-2.5">
            {sellers.map((seller, i) => (
              <GadgetSellerRow
                key={`${seller.name}-${seller.priceKM}-${i}`}
                seller={seller}
                isBest={i === 0}
              />
            ))}
          </ul>

          {/* Slični gadžeti */}
          {slicno.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-bold text-white">
                Slični gadžeti
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slicno.map((g) => (
                  <GadgetCard key={g.slug} gadget={g} compact />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desna kolona — cijena */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-5">
            <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isDemo ? "Demo cijena" : "Najniža stvarna cijena"}
              <span
                className={`rounded border px-1 py-px text-[8.5px] font-bold uppercase tracking-wider ${
                  isDemo
                    ? "border-white/10 bg-white/[0.06] text-slate-400"
                    : "border-accent-500/30 bg-accent-500/10 text-accent-400"
                }`}
              >
                {isDemo ? "demo" : "stvarna"}
              </span>
            </p>
            <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="text-[40px] font-extrabold leading-none text-accent-400">
                {formatKM(from)}
              </p>
              <p className="text-[13.5px] font-medium text-slate-400">
                {sellers.length === 1
                  ? "1 ponuda"
                  : `${sellers.length} ponude`}
              </p>
            </div>

            <a
              href={cheapest?.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-md mt-5 w-full"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              Kupi kod {cheapest?.name}
            </a>

            <GadgetNote className="mt-4" />

            {phoneBrandSlug && (
              <Link
                to="/telefoni"
                search={{ brend: phoneBrandSlug }}
                className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-ink-900/60 px-3.5 py-2.5 text-[12.5px] font-semibold text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                Pogledaj {BRAND_LABELS[phoneBrandSlug]} telefone
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
              </Link>
            )}
          </div>

          {/* Ostale kategorije */}
          <div className="surface-card mt-4 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ostale kategorije
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/gadzeti" search={{}} className="chip">
                Svi gadžeti
              </Link>
              {(
                [
                  "pametni_satovi",
                  "bezbicne_slusalice",
                  "ostala_oprema",
                ] as const
              )
                .filter((k) => k !== gadget.category)
                .map((k) => (
                  <Link
                    key={k}
                    to="/gadzeti"
                    search={{ kategorija: k }}
                    className="chip"
                  >
                    {GADGET_CATEGORY_LABELS[k]}
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function GadgetSellerRow({
  seller,
  isBest,
}: {
  seller: GadgetSeller;
  isBest: boolean;
}) {
  return (
    <li
      className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3.5 transition-colors duration-200 sm:flex-nowrap sm:gap-4 ${
        isBest && !seller.demo
          ? "border-accent-500/30 bg-accent-500/[0.06]"
          : "border-white/[0.07] bg-ink-900/60 hover:border-white/15 hover:bg-ink-900"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold ${
            seller.demo
              ? "bg-white/[0.06] text-slate-400"
              : isBest
                ? "bg-accent-500/15 text-accent-300"
                : "bg-brand-500/10 text-brand-300"
          }`}
        >
          {seller.name
            .replace(/[^A-Za-zČĆŽŠĐčćžšđ ]/g, "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase() || "?"}
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[14.5px] font-bold text-white">
            {seller.name}
            {seller.demo ? (
              <span className="pill pill-gray !py-0.5">demo cijena</span>
            ) : (
              isBest && <span className="pill pill-green !py-0.5">Najbolja cijena</span>
            )}
          </p>
          <p className="truncate text-[12px] text-slate-500">
            {seller.variant ?? seller.availability}
          </p>
        </div>
      </div>

      <div className="order-3 w-full pl-14 sm:order-none sm:w-auto sm:pl-0">
        {seller.demo ? (
          <span className="pill pill-gray">Cijena nije objavljena u shopu</span>
        ) : (
          <span className="pill pill-amber">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warn-400" />
            {seller.availability}
          </span>
        )}
      </div>

      <p className="min-w-[104px] text-right text-[21px] font-extrabold leading-none text-accent-400">
        {formatKM(seller.priceKM)}
      </p>

      <a
        href={seller.buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary btn-sm w-full sm:w-auto"
        aria-label={`Provjeri kod ${seller.name} za ${formatKM(seller.priceKM)}`}
      >
        {seller.demo ? "Provjeri" : "Kupi"}
      </a>
    </li>
  );
}

/** Tipovi koje ruta koristi u head() callback-u (drži TS sretnim) */
export type GadgetDetailSearch = { brend?: BrandSlug };
export const KNOWN_BRAND_SLUGS = BRAND_SLUGS;
