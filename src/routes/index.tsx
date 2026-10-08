import { Link, createFileRoute } from "@tanstack/react-router";
import { phones } from "~/data/phones";
import { sortPhones, type CatalogSearch } from "~/lib/catalog";
import { PhoneCard } from "~/components/PhoneCard";
import { PhoneVisual } from "~/components/PhoneVisual";
import { SearchBox } from "~/components/SearchBox";
import { InsightsSection } from "~/components/InsightsSection";
import { SponsoredCard } from "~/components/SponsoredCard";
import { getHomeOffer } from "~/data/sponsored";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "phone.ba — AI poređenje cijena telefona u BiH",
      },
      {
        name: "description",
        content:
          "Usporedi cijene telefona u BiH na jednom mjestu — BH Telecom, HT Eronet, m:tel i lokalne trgovine. AI preporuke, cijene u KM, servisi i oprema.",
      },
      { property: "og:url", content: "https://phone.ba/" },
      {
        property: "og:title",
        content: "phone.ba — AI poređenje cijena telefona u BiH",
      },
      {
        property: "og:description",
        content:
          "Usporedi cijene telefona u BiH na jednom mjestu — BH Telecom, HT Eronet, m:tel i lokalne trgovine. AI preporuke, cijene u KM.",
      },
      { name: "twitter:url", content: "https://phone.ba/" },
    ],
    links: [{ rel: "canonical", href: "https://phone.ba/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "phone.ba",
          alternateName: "AI agregator cijena telefona u BiH",
          url: "https://phone.ba/",
          inLanguage: "bs",
          publisher: {
            "@type": "Organization",
            name: "phone.ba",
            url: "https://phone.ba/",
            logo: { "@type": "ImageObject", url: "https://phone.ba/logo-512.png" },
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "phone.ba",
          url: "https://phone.ba/",
          email: "hello@phone.ba",
          address: { "@type": "PostalAddress", addressCountry: "BA" },
          contactPoint: {
            "@type": "ContactPoint",
            email: "hello@phone.ba",
            contactType: "customer support",
            availableLanguage: ["bs"],
          },
        }),
      },
    ],
  }),
  component: Home,
});

const QUICK_CHIPS: { label: string; search: Partial<CatalogSearch> }[] = [
  { label: "Do 400 KM", search: { budzet: "ispod_400" } },
  { label: "Najbolja kamera", search: { funkcija: "najbolja_kamera" } },
  { label: "Najbolja baterija", search: { funkcija: "najbolja_baterija" } },
  { label: "Najbolji gaming", search: { funkcija: "najbolji_gaming" } },
  { label: "Premium", search: { budzet: "premium" } },
];

function Home() {
  const popularni = sortPhones(phones, "popularno").slice(0, 4);
  // Sponzorisana ponuda — samo ako postoji aktivna "home" ponuda
  const homeOffer = getHomeOffer();

  return (
    <main>
      {/* ---------------------------------------------------------- */}
      {/* HERO                                                       */}
      {/* ---------------------------------------------------------- */}
      <section
        aria-labelledby="hero-naslov"
        className="container-site pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          {/* Tekst + pretraga */}
          <div className="animate-fade-up">
            <p className="pill pill-green mb-5 gap-2 !py-1.5 !pl-2 pr-3">
              <span
                aria-hidden
                className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500/25"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
              </span>
              AI pomoćnik za kupovinu telefona
            </p>

            <h1
              id="hero-naslov"
              className="max-w-2xl text-[34px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[52px]"
            >
              Pronađi idealan telefon i{" "}
              <span className="text-gradient">najbolju cijenu u BiH</span>
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-base">
              Usporedi ponude BH Telecom, HT Eronet, m:tel i lokalnih
              trgovina — sve cijene na jednom mjestu, u KM, bez skrivenih
              troškova.
            </p>

            {/* AI pretraga */}
            <div className="mt-7 max-w-xl">
              <label
                htmlFor="ai-search-input"
                className="sr-only"
              >
                Pretraži telefone po budžetu, namjeni ili brendu
              </label>
              <SearchBox />
            </div>

            {/* Brze filtre */}
            <div
              role="group"
              aria-label="Brzi filtri"
              className="mt-4 flex max-w-xl flex-wrap gap-2"
            >
              {QUICK_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  to="/telefoni"
                  search={chip.search}
                  className="chip"
                >
                  {chip.label === "Premium" && (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3 w-3 text-warn-400"
                    >
                      <path d="m12 2 2.6 5.9L21 8.5l-4.5 4.2 1.2 6.3L12 16l-5.7 3 1.2-6.3L3 8.5l6.4-.6L12 2z" />
                    </svg>
                  )}
                  {chip.label}
                </Link>
              ))}
            </div>

            {/* Trust traka */}
            <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <dt className="sr-only">Broj modela</dt>
                <dd className="text-xl font-extrabold text-white">
                  {phones.length}
                </dd>
                <dd className="text-[12px] text-slate-500">modela u katalogu</dd>
              </div>
              <div>
                <dt className="sr-only">Prodavači</dt>
                <dd className="text-xl font-extrabold text-white">7+</dd>
                <dd className="text-[12px] text-slate-500">telekoma i trgovina</dd>
              </div>
              <div>
                <dt className="sr-only">Cijene</dt>
                <dd className="text-xl font-extrabold text-white">KM</dd>
                <dd className="text-[12px] text-slate-500">cijene u markama</dd>
              </div>
            </dl>
          </div>

          {/* Hero vizual */}
          <div
            aria-hidden
            className="relative mx-auto hidden h-[430px] w-full max-w-md sm:block lg:h-[480px]"
          >
            {/* Glow pozadina */}
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[90px]" />

            {/* Glavni telefon */}
            <div className="animate-float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <PhoneVisual brand="Apple" size="lg" />
                <span className="pill pill-green absolute -right-10 top-6 rotate-6 !text-[11px]">
                  ↓ 7% ove sedmice
                </span>
              </div>
            </div>

            {/* Telefon sa strane */}
            <div className="animate-float-slow absolute bottom-8 left-2 rotate-[-8deg] opacity-90">
              <PhoneVisual brand="Samsung" size="sm" />
            </div>
            <div className="animate-float absolute bottom-14 right-2 rotate-[8deg] opacity-90 [animation-delay:1.4s]">
              <PhoneVisual brand="Xiaomi" size="sm" />
            </div>

            {/* Plutajuća cijena */}
            <div className="absolute right-4 top-8 rotate-3 animate-float-slow [animation-delay:0.8s]">
              <span className="surface-card block rounded-xl px-3.5 py-2 text-[13px] font-bold text-accent-400">
                od 1.999 KM
              </span>
            </div>
            <div className="absolute left-0 top-24 -rotate-3 animate-float [animation-delay:2s]">
              <span className="surface-card block rounded-xl px-3.5 py-2 text-[12px] font-semibold text-slate-300">
                ⚡ {phones.length} modela
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sponzorisana ponuda — odmah ispod hero zone */}
      {homeOffer && (
        <div className="container-site pb-16 lg:pb-24">
          <SponsoredCard offer={homeOffer} />
        </div>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Najpopularniji modeli                                       */}
      {/* ---------------------------------------------------------- */}
      <section
        aria-labelledby="popularni-naslov"
        className="container-site pb-16 lg:pb-24"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="pill pill-blue mb-2">U trendu</p>
            <h2
              id="popularni-naslov"
              className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
            >
              Najtraženiji modeli
            </h2>
            <p className="mt-1 text-[13.5px] text-slate-500">
              Najpopularniji telefoni na tržištu BiH — demo cijene za lansiranje.
            </p>
          </div>
          <Link to="/telefoni" className="btn-ghost btn-sm">
            Svi telefoni
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularni.map((phone) => (
            <PhoneCard key={phone.slug} phone={phone} />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Smart Insights — trendovi cijena (Faza 2A)                  */}
      {/* ---------------------------------------------------------- */}
      <InsightsSection />

      {/* ---------------------------------------------------------- */}
      {/* CTA traka                                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="container-site pb-16 lg:pb-24">
        <div className="surface-card relative overflow-hidden px-6 py-10 text-center sm:px-12 sm:py-14">
          <div
            aria-hidden
            className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-500/15 blur-[80px]"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-accent-500/12 blur-[80px]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Nisi siguran koji telefon ti odgovara?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-slate-400">
              Naš AI savjetnik ti kroz 3 pitanja preporučuje najbolja 3
              modela za tvoj budžet. Dugme je u donjem desnom uglu — ili
              istraži katalog i uporedi cijene.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/telefoni" className="btn-primary btn-md">
                Pregledaj telefone
              </Link>
              <Link to="/telefoni" search={{ budzet: "ispod_400" }} className="btn-ghost btn-md">
                Pronađi do 400 KM
              </Link>
            </div>
            <p className="mt-5 text-[11.5px] text-slate-600">
              Preporuke AI savjetnika su demo vodič zasnovan na katalogu —
              cijene s OLX.ba su stvarni poslovni oglasi, a ponude telekoma i
              trgovina su demo podaci.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}