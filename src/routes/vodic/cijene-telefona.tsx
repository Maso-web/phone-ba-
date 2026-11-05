import { Link, createFileRoute } from "@tanstack/react-router";
import { phones } from "~/data/phones";
import { effectiveMinOf, formatKM, hasRealPrice } from "~/lib/catalog";
import { OLX_SCRAPE_DATE } from "~/data/olx_prices";
import { SHOP_SCRAPE_DATE } from "~/data/shop_prices";
import { breadcrumbLd } from "~/lib/seo";

/**
 * MJESEČNI IZVJEŠTAJ CIJENA — svi brojevi se računaju iz kataloga i stvarnih
 * cijena (OLX + BH online shopovi) pri svakom buildu. Ništa nije upisano ručno,
 * pa se izvještaj sam osvježi kad se osvježe podaci o cijenama.
 * Mjesec u naslovu se također računa iz datuma provjere cijena.
 */

const MJESECI = [
  "januar",
  "februar",
  "mart",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "septembar",
  "oktobar",
  "novembar",
  "decembar",
];

function formatDatum(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}.`;
}

/** Najnoviji datum provjere cijena (OLX ili shopovi) — piše u tekstu stranice. */
const ZADNJA_PROVJERA = [OLX_SCRAPE_DATE, SHOP_SCRAPE_DATE].sort().at(-1)!;

/**
 * Mjesec izvještaja je TEKUĆI mjesec (izdanje izvještaja), a datum provjere
 * cijena je uvijek jasno napisan u tekstu — pa naslov ne tvrdi svježinu
 * podataka koju nemamo.
 */
const SADA = new Date();
const GODINA = SADA.getFullYear();
const MJESEC_NAZIV = MJESECI[SADA.getMonth()];
const NASLOV_MJESECA = `${MJESEC_NAZIV} ${GODINA}.`;

/** Modeli sa STVARNOM cijenom + ta cijena. */
const SA_CIJENOM = phones
  .filter(hasRealPrice)
  .map((phone) => ({ phone, cijena: effectiveMinOf(phone) }))
  .sort((a, b) => a.cijena - b.cijena);

const BROJEVI = SA_CIJENOM.map((x) => x.cijena);
const NAJNIZA = BROJEVI[0] ?? 0;
const NAJVISA = BROJEVI.at(-1) ?? 0;
const PROSJEK = BROJEVI.length
  ? Math.round(BROJEVI.reduce((s, n) => s + n, 0) / BROJEVI.length)
  : 0;
const MEDIJANA = BROJEVI.length
  ? BROJEVI[Math.floor(BROJEVI.length / 2)]
  : 0;

/** Najniža cijena po brendu. */
const PO_BRENDU = Array.from(
  SA_CIJENOM.reduce((map, item) => {
    const key = item.phone.brand;
    const prev = map.get(key);
    if (!prev) map.set(key, { brend: key, broj: 1, najniza: item });
    else {
      prev.broj += 1;
      if (item.cijena < prev.najniza.cijena) prev.najniza = item;
    }
    return map;
  }, new Map<string, { brend: string; broj: number; najniza: (typeof SA_CIJENOM)[number] }>()),
)
  .map(([, v]) => v)
  .sort((a, b) => a.najniza.cijena - b.najniza.cijena);

const RAZREDI = [
  { label: "do 400 KM", test: (n: number) => n < 400 },
  { label: "400–800 KM", test: (n: number) => n >= 400 && n <= 800 },
  { label: "800–1000 KM", test: (n: number) => n > 800 && n < 1000 },
  { label: "1000 KM i više", test: (n: number) => n >= 1000 },
].map((r) => ({
  label: r.label,
  broj: BROJEVI.filter(r.test).length,
}));

const NAJJEFTINIJI = SA_CIJENOM.slice(0, 10);

export const Route = createFileRoute("/vodic/cijene-telefona")({
  head: () => ({
    meta: [
      {
        title: `Cijene telefona u BiH — izvještaj ${NASLOV_MJESECA} | phone.ba`,
      },
      {
        name: "description",
        content: `Koliko stvarno koštaju telefoni u BiH ${NASLOV_MJESECA} — ${SA_CIJENOM.length} modela sa stvarnim cijenama iz BH online shopova i OLX.ba: najniža ${formatKM(NAJNIZA)}, prosječna ${formatKM(PROSJEK)}, najviša ${formatKM(NAJVISA)}.`,
      },
      { property: "og:url", content: "https://phone.ba/vodic/cijene-telefona" },
      {
        property: "og:title",
        content: `Cijene telefona u BiH — izvještaj ${NASLOV_MJESECA} | phone.ba`,
      },
      {
        property: "og:description",
        content: `Mjesečni pregled stvarnih cijena telefona u BiH: najniža, prosječna i najviša cijena, najjeftiniji modeli i cijene po brendu.`,
      },
    ],
    links: [
      { rel: "canonical", href: "https://phone.ba/vodic/cijene-telefona" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "Početna", path: "/" },
            { name: "Vodiči", path: "/vodic" },
            { name: "Cijene telefona" },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `Cijene telefona u BiH — izvještaj ${NASLOV_MJESECA}`,
          description: `Mjesečni pregled stvarnih cijena ${SA_CIJENOM.length} modela telefona u BiH iz BH online shopova i OLX.ba.`,
          inLanguage: "bs",
          datePublished: ZADNJA_PROVJERA,
          dateModified: ZADNJA_PROVJERA,
          mainEntityOfPage: "https://phone.ba/vodic/cijene-telefona",
          author: { "@type": "Organization", name: "phone.ba" },
          publisher: { "@type": "Organization", name: "phone.ba" },
        }),
      },
    ],
  }),
  component: CijeneTelefona,
});

function CijeneTelefona() {
  return (
    <main className="container-site pb-16 pt-10 lg:pb-24 lg:pt-14">
      <nav
        aria-label="Putanja"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-500"
      >
        <Link to="/" className="transition-colors hover:text-white">
          Početna
        </Link>
        <span aria-hidden>/</span>
        <Link to="/vodic" className="transition-colors hover:text-white">
          Vodiči
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-300">Cijene telefona</span>
      </nav>

      <div className="animate-fade-up">
        <p className="pill pill-green mb-3">Mjesečni izvještaj cijena</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Cijene telefona u BiH — {NASLOV_MJESECA}
        </h1>
        <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-slate-400">
          Pregled stvarnih cijena iz našeg kataloga: {SA_CIJENOM.length} modela
          ima cijenu prikupljenu iz BH online prodavnica i sa OLX.ba. Cijene
          provjeravamo {formatDatum(ZADNJA_PROVJERA)} i izvještaj obnavljamo
          svakog mjeseca — brojevi ispod se računaju iz podataka, ne prepisuju.
        </p>
      </div>

      {/* Ključni brojevi */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Broj label="Modela u katalogu" value={String(phones.length)} />
        <Broj label="Sa stvarnom cijenom" value={String(SA_CIJENOM.length)} />
        <Broj label="Najniža cijena" value={formatKM(NAJNIZA)} />
        <Broj label="Prosječna cijena" value={formatKM(PROSJEK)} />
      </section>

      <p className="mt-3 text-[12.5px] text-slate-500">
        Medijana najnižih cijena: {formatKM(MEDIJANA)} · Najviša najniža cijena
        u katalogu: {formatKM(NAJVISA)}. Cijene su u KM i odnose se na nove
        uređaje iz BH prodavnica; OLX ponude mogu uključivati i polovne
        uređaje, što je na stranici svakog modela jasno označeno.
      </p>

      {/* Najjeftiniji modeli */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">
          Najjeftiniji telefoni u BiH
        </h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">
          Deset modela s najnižom stvarnom cijenom u katalogu, od najjeftinijeg
          prema višoj.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {NAJJEFTINIJI.map((item, i) => (
            <li
              key={item.phone.slug}
              className="surface-card flex items-center justify-between gap-3 p-3.5"
            >
              <Link
                to="/telefon/$slug"
                params={{ slug: item.phone.slug }}
                className="flex min-w-0 items-center gap-3 transition-colors hover:text-white"
              >
                <span className="w-5 shrink-0 text-[12px] font-bold text-slate-500">
                  {i + 1}.
                </span>
                <span className="truncate text-[14px] font-semibold text-slate-200">
                  {item.phone.name}
                </span>
              </Link>
              <span className="shrink-0 text-[14px] font-extrabold text-accent-300">
                {formatKM(item.cijena)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cijene po brendu */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">Cijene po brendu</h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">
          Najniža stvarna cijena za svaki brend u katalogu, uz broj modela tog
          brenda koji ima prikupljenu cijenu.
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07]">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-ink-900/80 text-[12px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Brend</th>
                <th className="px-4 py-2.5 font-semibold">Modela</th>
                <th className="px-4 py-2.5 font-semibold">Najjeftiniji model</th>
                <th className="px-4 py-2.5 text-right font-semibold">Od</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {PO_BRENDU.map((row) => (
                <tr key={row.brend} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-semibold text-slate-200">
                    {row.brend}
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{row.broj}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      to="/telefon/$slug"
                      params={{ slug: row.najniza.phone.slug }}
                      className="text-slate-300 underline-offset-2 transition-colors hover:text-white hover:underline"
                    >
                      {row.najniza.phone.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-accent-300">
                    {formatKM(row.najniza.cijena)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Raspodjela */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">
          Koliko modela u kojem cjenovnom razredu
        </h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">
          Broj modela sa stvarnom cijenom po cjenovnim razredima — korisno kad
          tražiš koliko se za određeni budžet stvarno može kupiti.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RAZREDI.map((r) => (
            <Broj key={r.label} label={r.label} value={String(r.broj)} />
          ))}
        </div>
      </section>

      {/* Izvori */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">
          Izvori i datum provjere
        </h2>
        <div className="surface-card mt-4 max-w-3xl p-4 sm:p-5">
          <ul className="space-y-2 text-[13.5px] leading-relaxed text-slate-400">
            <li>
              <span className="font-semibold text-slate-200">
                BH online prodavnice:
              </span>{" "}
              Mobitech, fonTELe, Univerzalno, IQ Mobile i Digital City — snapshot
              od {formatDatum(SHOP_SCRAPE_DATE)}.
            </li>
            <li>
              <span className="font-semibold text-slate-200">OLX.ba:</span>{" "}
              arhiva poslovnih oglasa od {formatDatum(OLX_SCRAPE_DATE)}.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Telekomi:</span>{" "}
              ponude BH Telecoma, HT Eroneta i m:tela u demo dijelu kataloga su
              označene kao demo i ne ulaze u brojeve iznad.
            </li>
            <li>
              Cijene se mogu promijeniti kod prodavca između dva osvježavanja —
              mjerodavna je cijena na stranici prodavnice u trenutku kupovine.
            </li>
          </ul>
        </div>
      </section>

      {/* Interni linkovi */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">Nastavi dalje</h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link to="/telefoni" search={{}} className="btn-ghost btn-sm">
            Cijeli katalog telefona
          </Link>
          <Link to="/vodic/budzet-telefoni" className="btn-ghost btn-sm">
            Najbolji telefoni do 400 KM
          </Link>
          <Link to="/vodic/najbolji-telefoni-2026" className="btn-ghost btn-sm">
            Najbolji telefoni 2026.
          </Link>
          <Link to="/servisi" className="btn-ghost btn-sm">
            Servisi i prodavnice u BiH
          </Link>
        </div>
      </section>
    </main>
  );
}

function Broj({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}
