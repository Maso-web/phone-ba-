import { Link, createFileRoute } from "@tanstack/react-router";
import { phones, type Phone } from "~/data/phones";
import { SHOP_SCRAPE_DATE } from "~/data/shop_prices";
import { effectiveMinOf, formatKM, hasRealPrice } from "~/lib/catalog";
import { breadcrumbLd } from "~/lib/seo";
import { PhoneCard } from "~/components/PhoneCard";

/**
 * Česta pitanja — JEDAN izvor istine: isti niz puni i vidljivi blok
 * (naslov „Česta pitanja") i FAQPage JSON-LD, pa se tekst poklapa 1:1.
 * Svaki odgovor je izveden iz sadržaja OVE stranice (savjeti, lista modela,
 * način prikupljanja cijena) — bez izmišljenih brojki.
 */
const CESTA_PITANJA: { pitanje: string; odgovor: string }[] = [
  {
    pitanje: "Koji budžet je dovoljan za pristojan telefon u BiH?",
    odgovor:
      "Ovaj vodič pokriva modele ispod 400 KM, jer se u tom rasponu u BiH već prodaju telefoni s baterijom od 5000 mAh i više i kamerom od 50 MP, a 6 GB RAM-a je naša preporuka za ugodan rad. Lista je sortirana od najniže stvarne cijene prema višoj, pa je na vrhu najjeftiniji model iz kataloga.",
  },
  {
    pitanje: "Koliko RAM memorije mi treba?",
    odgovor:
      "Preporuka je 6 GB RAM-a, jer današnje aplikacije i sistem troše više memorije nego prije. 4 GB je dovoljno samo za osnovno korištenje, pa ako telefon planiraš koristiti duže, bolje je uzeti model sa 6 GB ili više.",
  },
  {
    pitanje: "Kolika baterija je dovoljna za svakodnevnu upotrebu?",
    odgovor:
      "Baterija od 5000 mAh i više znači dan-dva rada bez punjača. U katalogu ima i modela sa 7000 mAh (Redmi 15, POCO M7), koji prema specifikacijama prodavača idu i dalje od toga.",
  },
  {
    pitanje: "Da li se isplati kupiti polovan telefon?",
    odgovor:
      "Ovaj vodič se zasniva na ponudama BH online prodavnica, gdje uz telefon ide domaća garancija. Ako razmatraš polovan uređaj, provjeri da li uz njega dobijaš garanciju — jeftinija ponuda bez garancije može koštati više ako nastane problem.",
  },
  {
    pitanje: "Koje marke su najzastupljenije do 400 KM?",
    odgovor:
      "Najviše je Xiaomi modela — Redmi 15, Redmi 15c, Redmi 17, Redmi Note 14, Redmi Note 15 i POCO M7. U listi su i Samsung Galaxy A07 i A17, Honor X7d te Motorola Moto G05, pa se može birati i kad tražiš poznatu marku.",
  },
  {
    pitanje: "Šta je najvažnije provjeriti prije kupovine?",
    odgovor:
      "Proizvođači kod jeftinijih modela najčešće štede na kameri, ekranu i brzini punjenja. Zato provjeri bateriju, RAM i frekvenciju osvježavanja ekrana, a zatim i koliko godina softverske podrške proizvođač obećava.",
  },
  {
    pitanje: "Odakle su cijene u ovom vodiču i da li su rangirane po plaćanju?",
    odgovor:
      "Cijene se prikupljaju automatski iz BH online prodavnica i nose datum snapshot-a naveden na stranici. Na stranici svakog modela vidiš tačan broj ponuda i prodavnicu s najnižom cijenom, a sponzorisane pozicije ne utiču na rangiranje u ovom vodiču.",
  },
];

export const Route = createFileRoute("/vodic/budzet-telefoni")({
  head: () => ({
    meta: [
      { title: "Najbolji jeftini telefoni u BiH — do 400 KM | phone.ba" },
      {
        name: "description",
        content:
          "Koji jeftini telefon kupiti u BiH? Modeli do 400 KM iz kataloga phone.ba sa cijenama u KM iz BH online shopova, specifikacije i savjeti prije kupovine.",
      },
      { property: "og:url", content: "https://phone.ba/vodic/budzet-telefoni" },
      {
        property: "og:title",
        content: "Najbolji jeftini telefoni u BiH — do 400 KM | phone.ba",
      },
      {
        property: "og:description",
        content:
          "Najbolji budžetski modeli sa cijenama u KM iz BH online shopova i savjetima prije kupovine.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://phone.ba/vodic/budzet-telefoni" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbLd([
            { name: "Početna", path: "/" },
            { name: "Vodiči", path: "/vodic" },
            { name: "Najbolji jeftini telefoni do 400 KM" },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: CESTA_PITANJA.map((f) => ({
            "@type": "Question",
            name: f.pitanje,
            acceptedAnswer: { "@type": "Answer", text: f.odgovor },
          })),
        }),
      },
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
      {/* Breadcrumb */}
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
        <span className="font-medium text-slate-300">
          Najbolji jeftini telefoni do 400 KM
        </span>
      </nav>

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

      {/* Česta pitanja — vidljivi tekst; FAQPage JSON-LD iz istog niza */}
      <section className="mt-10" id="cesta-pitanja">
        <h2 className="text-xl font-bold text-white">Česta pitanja</h2>
        <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">
          Kratki odgovori na ono što se najčešće pita prije kupovine telefona do
          400 KM.
        </p>
        <div className="mt-5 space-y-4">
          {CESTA_PITANJA.map((f) => (
            <div key={f.pitanje} className="surface-card p-4 sm:p-5">
              <h3 className="text-[14.5px] font-bold text-white">
                {f.pitanje}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                {f.odgovor}
              </p>
            </div>
          ))}
        </div>
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