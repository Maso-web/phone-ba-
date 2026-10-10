import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { phones, type Phone } from "~/data/phones";
import { SHOP_SCRAPE_DATE } from "~/data/shop_prices";
import { effectiveMinOf, formatKM, hasRealPrice } from "~/lib/catalog";
import { PhoneCard } from "~/components/PhoneCard";

export const Route = createFileRoute("/vodic/najbolji-telefoni-2026")({
  head: () => ({
    meta: [
      {
        title:
          "Najbolji telefoni 2026 — preporuke po kategorijama u BiH | phone.ba",
      },
      {
        name: "description",
        content:
          "Najbolji telefoni 2026. godine po kategorijama: flagship, sklopivi, kamera, gaming, baterija i budžet — iz kataloga phone.ba, sa stvarnim cijenama u KM iz BH online shopova.",
      },
      {
        property: "og:url",
        content: "https://phone.ba/vodic/najbolji-telefoni-2026",
      },
      {
        property: "og:title",
        content:
          "Najbolji telefoni 2026 — preporuke po kategorijama u BiH | phone.ba",
      },
      {
        property: "og:description",
        content:
          "Preporuke po kategorijama sa stvarnim cijenama u KM iz BH online shopova — flagship, sklopivi, kamera, gaming, baterija i budžet.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://phone.ba/vodic/najbolji-telefoni-2026" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Odakle su cijene na phone.ba?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Cijene su stvarne ponude iz BH online prodavnica (Mobitech, fonTELe, Univerzalno, IQ Mobile, Digital City) i OLX.ba oglasa, prikupljene automatski. Datum posljednjeg unosa (snapshot-a) naveden je na svakoj stranici modela.",
              },
            },
            {
              "@type": "Question",
              name: "Koji budžetski telefon ima najbolju bateriju?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "U našem katalogu to su Redmi 15 i POCO M7 s baterijom od 7000 mAh (prema specifikacijama prodavača), oba dostupna ispod 400 KM.",
              },
            },
            {
              "@type": "Question",
              name: "Koliko košta pristojan novi telefon u BiH?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Prema stvarnim cijenama iz našeg kataloga: solidan budžetski telefon je već dostupan od oko 275 KM (Redmi 15), srednja klasa s AMOLED ekranom od oko 514 KM (Moto G86), a flagshipovi i gaming uređaji kreću od oko 1165–1249 KM.",
              },
            },
            {
              "@type": "Question",
              name: "Da li su sklopivi (foldable) telefoni dostupni u BiH?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Da. Samsung Galaxy Z Fold 8 (od 3999 KM) i Z Flip 8 (od 2799 KM) već se prodaju u BH trgovinama (fonTELe, Mobitech), prema aktuelnom snapshot-u cijena.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: NajboljiTelefoni2026,
});

function NajboljiTelefoni2026() {
  /** Helper: modeli sa stvarnom cijenom, sortirani po cijeni. */
  const withPrice = (lista: Phone[]) =>
    lista
      .filter((p) => hasRealPrice(p))
      .sort((a, b) => effectiveMinOf(a) - effectiveMinOf(b));

  const flagship = withPrice(
    phones.filter((p) => p.priceBand === "premium"),
  ).slice(0, 4);

  const sklopivi = withPrice(
    phones.filter((p) =>
      ["samsung-galaxy-z-fold-8", "samsung-galaxy-z-flip-8"].includes(p.slug),
    ),
  );

  const kamera = withPrice(
    phones.filter((p) => p.tags.includes("najbolja_kamera")),
  ).slice(0, 3);

  const gaming = withPrice(
    phones.filter((p) => p.tags.includes("najbolji_gaming")),
  ).slice(0, 3);

  const baterija = withPrice(
    phones.filter((p) => p.tags.includes("najbolja_baterija")),
  ).slice(0, 3);

  const budzet = withPrice(
    phones.filter((p) => effectiveMinOf(p) < 400),
  ).slice(0, 3);

  return (
    <main className="container-site pb-16 pt-10 lg:pb-24 lg:pt-14">
      {/* Zaglavlje */}
      <div className="animate-fade-up">
        <p className="pill pill-green mb-3">Vodič za kupovinu · 2026</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Najbolji telefoni 2026
        </h1>
        <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-slate-400">
          Preporuke po kategorijama na osnovu našeg kataloga telefona koji se
          stvarno prodaju u BiH — sa stvarnim cijenama iz BH online shopova
          (snapshot {formatScrapeDate(SHOP_SCRAPE_DATE)}). Bez plaćenih mjesta:
          svaka preporuka se zasniva na odnosu cijene i karakteristika.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill pill-blue">6 kategorija</span>
          <span className="pill pill-green">Stvarne cijene u KM</span>
          <span className="pill pill-gray">Ažurirano {formatScrapeDate(SHOP_SCRAPE_DATE)}</span>
        </div>
      </div>

      <Sekcija
        id="flagship"
        naslov="Najbolji flagship telefoni 2026"
        opis="Vrhunske performanse i najnovije kamere. Preporučujemo premium modele s najpovoljnijim stvarnim cijenama u katalogu."
      >
        {flagship.map((p) => (
          <PhoneCard key={p.slug} phone={p} />
        ))}
      </Sekcija>

      <Sekcija
        id="sklopivi"
        naslov="Najbolji sklopivi (foldable) telefoni"
        opis="Sklopivi flagshipovi s velikim ekranom za multitasking — dostupni u BH trgovinama prema aktuelnim ponudama."
      >
        {sklopivi.map((p) => (
          <PhoneCard key={p.slug} phone={p} />
        ))}
      </Sekcija>

      <Sekcija
        id="kamera"
        naslov="Najbolja kamera u klasi"
        opis="Modeli s oznakom „najbolja kamera“ u našem katalogu — odlične kamere po najboljoj cijeni, od srednje do premium klase."
      >
        {kamera.map((p) => (
          <PhoneCard key={p.slug} phone={p} />
        ))}
      </Sekcija>

      <Sekcija
        id="gaming"
        naslov="Najbolji gaming telefoni"
        opis="Brzi procesori, visoka frekvencija ekrana i velika baterija — modeli koje izdvajamo za igranje i zahtjevne aplikacije."
      >
        {gaming.map((p) => (
          <PhoneCard key={p.slug} phone={p} />
        ))}
      </Sekcija>

      <Sekcija
        id="baterija"
        naslov="Najbolja baterija"
        opis="Modeli s najvećom baterijom u katalogu — do dva dana rada bez punjača, uključujući i budžetsku klasu."
      >
        {baterija.map((p) => (
          <PhoneCard key={p.slug} phone={p} />
        ))}
      </Sekcija>

      <Sekcija
        id="budzet"
        naslov="Najbolji budžetski telefoni"
        opis="Najpovoljniji modeli ispod 400 KM s najboljim odnosom cijene i karakteristika — idealni za prvi ili rezervni telefon."
      >
        {budzet.map((p) => (
          <PhoneCard key={p.slug} phone={p} />
        ))}
      </Sekcija>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white">Česta pitanja</h2>
        <div className="mt-5 space-y-4">
          <Faq
            p="Odakle su cijene na phone.ba?"
            o="Cijene su stvarne ponude iz BH online prodavnica (Mobitech, fonTELe, Univerzalno, IQ Mobile, Digital City) i OLX.ba oglasa, prikupljene automatski. Datum posljednjeg unosa (snapshot-a) naveden je na svakoj stranici modela."
          />
          <Faq
            p="Koji budžetski telefon ima najbolju bateriju?"
            o="U našem katalogu to su Redmi 15 i POCO M7 s baterijom od 7000 mAh (prema specifikacijama prodavača), oba dostupna ispod 400 KM."
          />
          <Faq
            p="Koliko košta pristojan novi telefon u BiH?"
            o="Prema stvarnim cijenama iz našeg kataloga: solidan budžetski telefon je dostupan od oko 275 KM (Redmi 15), srednja klasa s AMOLED ekranom od oko 514 KM (Moto G86), a flagshipovi i gaming uređaji kreću od oko 1165–1249 KM."
          />
          <Faq
            p="Da li su sklopivi (foldable) telefoni dostupni u BiH?"
            o="Da. Samsung Galaxy Z Fold 8 (od 3999 KM) i Z Flip 8 (od 2799 KM) već se prodaju u BH trgovinama (fonTELe, Mobitech), prema aktuelnom snapshot-u cijena."
          />
        </div>
      </section>

      {/* Cross-sell */}
      <section className="surface-card mt-10 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-[15.5px] font-bold text-white">
            Tražiš nešto konkretno?
          </h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Uporedi cijeli katalog ili pitaj AI savjetnika za personalizovane
            preporuke.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/vodic/budzet-telefoni" className="btn-ghost btn-md">
            Budžet telefoni
          </Link>
          <Link to="/telefoni" className="btn-primary btn-md">
            Katalog telefona
          </Link>
        </div>
      </section>
    </main>
  );
}

function Sekcija({
  id,
  naslov,
  opis,
  children,
}: {
  id: string;
  naslov: string;
  opis: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10" id={id}>
      <h2 className="text-xl font-bold text-white">{naslov}</h2>
      <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-slate-400">
        {opis}
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

function Faq({ p, o }: { p: string; o: string }) {
  return (
    <div className="surface-card p-4 sm:p-5">
      <h3 className="text-[14.5px] font-bold text-white">{p}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{o}</p>
    </div>
  );
}

function formatScrapeDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}.`;
}