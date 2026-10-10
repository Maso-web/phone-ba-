import { Link, createFileRoute } from "@tanstack/react-router";
import { phones, type Phone } from "~/data/phones";
import { SHOP_SCRAPE_DATE } from "~/data/shop_prices";
import { effectiveMinOf, formatKM, hasRealPrice } from "~/lib/catalog";
import { PhoneCard } from "~/components/PhoneCard";

export const Route = createFileRoute("/vodic/budzet-telefoni")({
  head: () => ({
    meta: [
      {
        title:
          "Budžet telefoni — najbolji jeftini telefoni u BiH (stvarne cijene) | phone.ba",
      },
      {
        name: "description",
        content:
          "Koji jeftini telefon kupiti u BiH 2026? Najbolji budžetski modeli iz našeg kataloga — Redmi 15, POCO M7, Moto G05 — sa stvarnim cijenama u KM iz BH online shopova i savjetima prije kupovine.",
      },
      { property: "og:url", content: "https://phone.ba/vodic/budzet-telefoni" },
      {
        property: "og:title",
        content:
          "Budžet telefoni — najbolji jeftini telefoni u BiH (stvarne cijene) | phone.ba",
      },
      {
        property: "og:description",
        content:
          "Najbolji budžetski modeli sa stvarnim cijenama u KM iz BH online shopova i savjetima prije kupovine.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://phone.ba/vodic/budzet-telefoni" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Budžet telefoni u BiH — katalog",
          description:
            "Telefoni ispod 400 KM iz kataloga phone.ba sa stvarnim cijenama iz BH online shopova.",
          itemListElement: phones
            .filter((p) => hasRealPrice(p) && effectiveMinOf(p) < 400)
            .sort((a, b) => effectiveMinOf(a) - effectiveMinOf(b))
            .map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.name,
              url: `https://phone.ba/telefon/${p.slug}`,
            })),
        }),
      },
    ],
  }),
  component: BudzetTelefoni,
});

function BudzetTelefoni() {
  /** Budžet modeli sa stvarnom cijenom — samo istiniti podaci. */
  const budzet: Phone[] = phones
    .filter((p) => hasRealPrice(p) && effectiveMinOf(p) < 400)
    .sort((a, b) => effectiveMinOf(a) - effectiveMinOf(b));

  const najjeftiniji = budzet[0] ? effectiveMinOf(budzet[0]) : null;

  return (
    <main className="container-site pb-16 pt-10 lg:pb-24 lg:pt-14">
      {/* Zaglavlje */}
      <div className="animate-fade-up">
        <p className="pill pill-green mb-3">Vodič za kupovinu</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Budžet telefoni — najbolji jeftini telefoni u BiH
        </h1>
        <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-slate-400">
          Dobar telefon ne mora koštati bogatstvo. U ovom vodiču izdvajamo
          modele iz našeg kataloga koji se u BiH stvarno prodaju, s
          najpovoljnijim cijenama ispod 400 KM — cijene su aktuelne iz BH
          online shopova (snapshot {formatScrapeDate(SHOP_SCRAPE_DATE)}).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill pill-blue">{budzet.length} modela ispod 400 KM</span>
          {najjeftiniji !== null && (
            <span className="pill pill-green">
              Najjeftiniji od {formatKM(najjeftiniji)}
            </span>
          )}
          <span className="pill pill-gray">Savjeti prije kupovine uključeni</span>
        </div>
      </div>

      {/* Edukativni savjeti */}
      <section className="mt-9">
        <h2 className="text-xl font-bold text-white">
          Na šta paziti kod budžetskog telefona
        </h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">
          Kod jeftinijih telefona proizvođači najčešće štede na tri stvari:
          kameri, ekranu i brzini punjenja. Evo šta je najvažnije provjeriti
          prije kupovine.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Savjet
            ikona="🔋"
            naslov="Baterija od 5000+ mAh"
            tekst="Budžetski telefon najčešće kupujemo za dugotrajnu upotrebu. Baterija od 5000 mAh i više znači dan-dva rada bez punjača; modeli s 7000 mAh (Redmi 15, POCO M7) idu i dalje."
          />
          <Savjet
            ikona="🧠"
            naslov="6 GB RAM-a kao minimum"
            tekst="Današnje aplikacije i sistem troše više memorije nego prije. 6 GB RAM-a je preporuka za ugodan rad; 4 GB je dovoljno samo za osnovno korištenje."
          />
          <Savjet
            ikona="📷"
            naslov="Kamere od 50 MP su standard"
            tekst="Kamera od 50 MP danas je pravilo i u najjeftinijoj klasi. Prije kupovine provjeri da li podržava noćni način i snimanje videa — to govori više od broja megapiksela."
          />
          <Savjet
            ikona="🖥️"
            naslov="Ekran od 90–120 Hz čini razliku"
            tekst="Viša frekvencija osvježavanja ekrana čini listanje ugodnijim i bez ulaženja u skuplju klasu. 90–144 Hz u budžetskom segmentu je odličan znak."
          />
          <Savjet
            ikona="📶"
            naslov="Provjeri dostupnost i garanciju u BiH"
            tekst="Kupuj od provjerenih BH prodavnica s domaćom garancijom. Jeftinija ponuda s uvoza može koštati više ako nastane problem s garancijom."
          />
          <Savjet
            ikona="🔁"
            naslov="Ažuriranja sistema"
            tekst="Jeftiniji modeli dobijaju manje ažuriranja. Ako ti je važna dugovječnost, provjeri koliko godina softverske podrške proizvođač obećava."
          />
        </div>
      </section>

      {/* Top budžet modeli */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">
          Naša lista budžet telefona
        </h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">
          Modeli sortirani po najnižoj stvarnoj cijeni u BH shopovima — bez
          izmišljenih popusta, samo aktuelne ponude.
        </p>
        {budzet.length === 0 ? (
          <div className="surface-card mt-5 px-6 py-14 text-center">
            <p className="text-[13.5px] text-slate-400">
              Lista se priprema — pogledaj cijeli katalog.
            </p>
            <Link to="/telefoni" className="btn-primary btn-md mt-5">
              Katalog telefona
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {budzet.map((p) => (
              <PhoneCard key={p.slug} phone={p} />
            ))}
          </div>
        )}
      </section>

      {/* Kako smo birali */}
      <section className="surface-card mt-10 p-5 sm:p-6">
        <h2 className="text-[15.5px] font-bold text-white">
          Odakle su cijene i kako biramo preporuke?
        </h2>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
          Katalog sadrži modele koji se stvarno prodaju u Bosni i
          Hercegovini. Cijene se prikupljaju automatski iz BH online
          prodavnica (snapshot {formatScrapeDate(SHOP_SCRAPE_DATE)}), a na
          stranici svakog modela vidiš i tačan broj ponuda i prodavnicu s
          najnižom cijenom. Preporuke se zasnivaju na odnosu cijene i
          karakteristika — nikakve sponzorisane pozicije ne utiču na
          rangiranje u ovom vodiču.
        </p>
      </section>

      {/* Cross-sell */}
      <section className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-[15.5px] font-bold text-white">
            Spreman/a za više izbora?
          </h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Pogledaj preporuke po kategorijama ili cijeli katalog s 50+
            modela i AI savjetnikom.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/vodic/najbolji-telefoni-2026" className="btn-ghost btn-md">
            Najbolji telefoni 2026
          </Link>
          <Link to="/telefoni" className="btn-primary btn-md">
            Katalog telefona
          </Link>
        </div>
      </section>
    </main>
  );
}

function formatScrapeDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}.`;
}

function Savjet({
  ikona,
  naslov,
  tekst,
}: {
  ikona: string;
  naslov: string;
  tekst: string;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          {ikona}
        </span>
        <h3 className="text-[14.5px] font-bold text-white">{naslov}</h3>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">
        {tekst}
      </p>
    </div>
  );
}