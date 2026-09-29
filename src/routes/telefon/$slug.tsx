import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { phones, type Seller } from "~/data/phones";
import {
  formatKM,
  minPriceOf,
  sortedSellers,
  trendArrow,
  trendDetailLabel,
  TAG_LABELS,
} from "~/lib/catalog";
import { PhoneVisual } from "~/components/PhoneVisual";
import { AvailabilityBadge, DemoNote, TagPill, TrendBadge } from "~/components/Badges";
import { SponsoredCard } from "~/components/SponsoredCard";
import { OlxPricesSection } from "~/components/OlxPricesSection";
import { CompatibleGadgets } from "~/components/CompatibleGadgets";
import { ShopPricesSection } from "~/components/ShopPricesSection";
import { getOlxPrices } from "~/data/olx_prices";
import { getShopPrices } from "~/data/shop_prices";
import { getPhonePageOffer } from "~/data/sponsored";

export const Route = createFileRoute("/telefon/$slug")({
  head: ({ params }) => {
    const phone = phones.find((p) => p.slug === params.slug);
    return {
      meta: phone
        ? [
            {
              title: `${phone.name} — cijene i uporedba ponuda | phone.ba`,
            },
            {
              name: "description",
              content: `${phone.name}: uporedi cijene kod BH Telecom, HT Eronet, m:tel i lokalnih trgovina. ${phone.tagline} Cijene u KM.`,
            },
          ]
        : [{ title: "Telefon nije pronađen | phone.ba" }],
    };
  },
  component: PhoneDetail,
  notFoundComponent: () => <PhoneNotFound />,
});

/* ------------------------------------------------------------------ */
/* 404                                                                */
/* ------------------------------------------------------------------ */

function PhoneNotFound() {
  return (
    <main className="container-site flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl" aria-hidden>
        📵
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
        Nismo pronašli taj telefon
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        Model možda nije u našem katalogu ili je link zastario. Pogledaj sve
        dostupne telefone.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/telefoni" className="btn-primary btn-md">
          Svi telefoni
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

const SPECS_META: { key: keyof PhoneSpec; label: string }[] = [
  { key: "storage", label: "Memorija" },
  { key: "ram", label: "RAM" },
  { key: "battery", label: "Baterija" },
  { key: "display", label: "Ekran" },
  { key: "camera", label: "Kamera" },
  { key: "chipset", label: "Čip" },
];

// Tip za ključeve specifikacija (lokalno, da SPECS_META ostane tipovan)
type PhoneSpec = (typeof phones)[number]["specs"];

function PhoneDetail() {
  const { slug } = Route.useParams();
  const phone = phones.find((p) => p.slug === slug);
  if (!phone) throw notFound();

  const sellers = sortedSellers(phone);
  const from = minPriceOf(phone);
  const best = sellers[0];
  // Sponzorisana ponuda (odvojena od organskih ponuda — nikad u rangiranju)
  const sponsoredOffer = getPhonePageOffer(phone.slug);
  // Stvarne OLX.ba cijene iz verificirane arhive (undefined = nema pogodaka)
  const olx = getOlxPrices(phone.slug);
  // Stvarne cijene iz BH online shopova (snapshot 15.9.2026.)
  const shop = getShopPrices(phone.slug);
  const trendTone =
    phone.priceTrend === "pad"
      ? "pill-green"
      : phone.priceTrend === "rast"
        ? "pill-amber"
        : "pill-gray";

  return (
    <main className="container-site pb-16 pt-8 lg:pb-24">
      {/* Breadcrumb */}
      <nav aria-label="Putanja" className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-500">
        <Link to="/" className="transition-colors hover:text-white">
          Početna
        </Link>
        <span aria-hidden>/</span>
        <Link to="/telefoni" className="transition-colors hover:text-white">
          Telefoni
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-300">{phone.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Lijeva kolona — telefon + specifikacije */}
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill pill-gray">{phone.brand}</span>
            {phone.tags.map((tag) => (
              <TagPill key={tag} label={TAG_LABELS[tag]} />
            ))}
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {phone.name}
          </h1>
          <p className="mt-1.5 text-[15px] text-slate-400">{phone.tagline}</p>

          {/* Vizual + trend */}
          <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-white/[0.06] bg-ink-900/50 p-5">
            <div className="relative">
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    phone.brand === "Apple"
                      ? "rgba(99,143,255,0.3)"
                      : phone.brand === "Samsung"
                        ? "rgba(140,110,255,0.28)"
                        : phone.brand === "Xiaomi"
                          ? "rgba(255,158,64,0.26)"
                          : "rgba(45,212,191,0.26)",
                }}
              />
              <div className="relative animate-float-slow">
                <PhoneVisual
                  brand={phone.brand}
                  size="lg"
                  image={phone.image}
                  name={phone.name}
                />
              </div>
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Trend cijene
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TrendBadge
                  trend={phone.priceTrend}
                  percent={phone.trendPercent}
                  variant="detail"
                />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                {phone.priceTrend === "pad" &&
                  "Cijena ovog modela je u padu — idealan trenutak za kupovinu."}
                {phone.priceTrend === "rast" &&
                  "Cijena raste — možda je pametnije sačekati pad ili potražiti alternativu."}
                {phone.priceTrend === "stabilno" &&
                  "Cijena je stabilna — možeš kupiti bez žurbe."}
              </p>
              <p className="pill pill-gray mt-3 !normal-case !tracking-normal">
                {trendArrow(phone.priceTrend, phone.trendPercent)} u odnosu na
                prošli mjesec
              </p>
            </div>
          </div>

          {/* Specifikacije */}
          <h2 className="mt-8 text-lg font-bold text-white">
            Ključne specifikacije
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SPECS_META.map(({ key, label }) => (
              <div
                key={key}
                className="rounded-xl border border-white/[0.06] bg-ink-900/60 p-3.5"
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 text-[13.5px] font-semibold text-white">
                  {phone.specs[key]}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Desna kolona — cijena + ponude */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Najpovoljnija cijena
              <span className="rounded bg-white/[0.06] px-1 py-px text-[8.5px] font-bold uppercase tracking-wider text-slate-400">
                demo
              </span>
            </p>
            <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="text-[40px] font-extrabold leading-none text-accent-400">
                {formatKM(from)}
              </p>
              <p className="text-[13.5px] font-medium text-slate-400">
                kod {sellers.length} prodavača
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`pill ${trendTone}`}>
                {trendDetailLabel(phone.priceTrend)}
              </span>
              <span className="pill pill-gray">
                {trendArrow(phone.priceTrend, phone.trendPercent)}
              </span>
            </div>

            <a
              href={best?.buyUrl}
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
              Kupi po najboljoj cijeni
            </a>

            <DemoNote className="mt-4" />
          </div>

          {/* Sponzorisana ponuda — između cjenovne kartice i liste prodavača */}
          {sponsoredOffer && (
            <div className="mt-4">
              <SponsoredCard offer={sponsoredOffer} />
            </div>
          )}
        </aside>
      </div>

      {/* Stvarne cijene — OLX.ba pa online shopovi, iznad demo ponuda telekoma */}
      {olx && <OlxPricesSection data={olx} />}
      {shop && <ShopPricesSection data={shop} />}
      {(!olx || !shop) && (
        <p className="mt-6 text-[12.5px] text-slate-500">
          {!olx && !shop
            ? "Stvarne cijene (OLX.ba i online shopovi) za ovaj model uskoro."
            : !olx
              ? "Stvarne OLX cijene za ovaj model uskoro."
              : "Cijene u online shopovima za ovaj model uskoro."}
        </p>
      )}
      {/* Sve ponude (demo) */}
      <section aria-labelledby="ponude-naslov" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="ponude-naslov"
            className="flex flex-wrap items-center gap-2 text-lg font-bold text-white"
          >
            Sve ponude za {phone.name}
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              demo
            </span>
          </h2>
          <p className="text-[12px] text-slate-500">
            Sortirano po cijeni — najpovoljnija prva
          </p>
        </div>

        <ul className="mt-4 space-y-2.5">
          {sellers.map((seller, i) => (
            <SellerRow key={seller.id} seller={seller} isBest={i === 0} />
          ))}
        </ul>
      </section>

      {/* Cross-selling: gadžeti koji odgovaraju brendu telefona */}
      <CompatibleGadgets phone={phone} />
    </main>
  );
}

function SellerRow({ seller, isBest }: { seller: Seller; isBest: boolean }) {
  return (
    <li
      className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3.5 transition-colors duration-200 sm:flex-nowrap sm:gap-4 ${
        isBest
          ? "border-accent-500/30 bg-accent-500/[0.06]"
          : "border-white/[0.07] bg-ink-900/60 hover:border-white/15 hover:bg-ink-900"
      }`}
    >
      {/* Logo + naziv */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold ${
            isBest
              ? "bg-accent-500/15 text-accent-300"
              : "bg-brand-500/10 text-brand-300"
          }`}
        >
          {seller.initials}
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[14.5px] font-bold text-white">
            {seller.logoText}
            {isBest && (
              <span className="pill pill-green !py-0.5">Najbolja cijena</span>
            )}
          </p>
          <p className="truncate text-[12px] text-slate-500">{seller.name}</p>
        </div>
      </div>

      {/* Dostupnost */}
      <div className="order-3 w-full pl-14 sm:order-none sm:w-auto sm:pl-0">
        <AvailabilityBadge availability={seller.availability} />
      </div>

      {/* Cijena */}
      <p className="min-w-[104px] text-right text-[21px] font-extrabold leading-none text-accent-400">
        {formatKM(seller.priceKM)}
      </p>

      {/* Kupi */}
      <a
        href={seller.buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary btn-sm w-full sm:w-auto"
        aria-label={`Kupi kod ${seller.logoText} za ${formatKM(seller.priceKM)}`}
      >
        Kupi
      </a>
    </li>
  );
}