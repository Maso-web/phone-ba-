import { Link } from "@tanstack/react-router";
import type { CatalogSearch } from "~/lib/catalog";

/**
 * Popularne pretrage — 8 linkova ka filterima kataloga koji stvarno postoje
 * (budžet, funkcija, brend), plus prečice ka katalogu, vodičima, imeniku
 * servisa i opremi. Bez izmišljenih fraza: svaki link vodi na filter koji
 * katalog zaista podržava (vidi src/lib/catalog.ts).
 */
const PRETRAGE: { label: string; search: Partial<CatalogSearch> }[] = [
  { label: "Telefoni do 400 KM", search: { budzet: "ispod_400" } },
  { label: "Telefoni 400–800 KM", search: { budzet: "400_800" } },
  { label: "Premium telefoni (1000+ KM)", search: { budzet: "premium" } },
  { label: "Najbolja kamera", search: { funkcija: "najbolja_kamera" } },
  { label: "Najbolja baterija", search: { funkcija: "najbolja_baterija" } },
  { label: "Gaming telefoni", search: { funkcija: "najbolji_gaming" } },
  { label: "iPhone cijene", search: { brend: "apple" } },
  { label: "Samsung cijene", search: { brend: "samsung" } },
];

export function PopularSearches() {
  return (
    <section
      aria-labelledby="popularne-pretrage-naslov"
      className="container-site pb-16 lg:pb-24"
    >
      <p className="pill pill-blue mb-2">Pretrage</p>
      <h2
        id="popularne-pretrage-naslov"
        className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
      >
        Popularne pretrage
      </h2>
      <p className="mt-1 text-[13.5px] text-slate-500">
        Najčešći filteri po kojima kupci u BiH traže telefon — cijene su u KM,
        iz BH online shopova i OLX.ba oglasa gdje postoje.
      </p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {PRETRAGE.map((p) => (
          <li key={p.label}>
            <Link to="/telefoni" search={p.search} className="chip">
              {p.label}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
        <li>
          <Link to="/telefoni" search={{}} className="text-brand-300 transition-colors hover:text-white">
            Katalog telefona
          </Link>
        </li>
        <li>
          <Link
            to="/vodic/budzet-telefoni"
            className="text-brand-300 transition-colors hover:text-white"
          >
            Najbolji telefon do 400 KM (vodič)
          </Link>
        </li>
        <li>
          <Link
            to="/vodic/najbolji-telefoni-2026"
            className="text-brand-300 transition-colors hover:text-white"
          >
            Najbolji telefoni 2026 (vodič)
          </Link>
        </li>
        <li>
          <Link to="/servisi" search={{}} className="text-brand-300 transition-colors hover:text-white">
            Servisi po gradovima
          </Link>
        </li>
        <li>
          <Link to="/gadzeti" search={{}} className="text-brand-300 transition-colors hover:text-white">
            Gadžeti i oprema
          </Link>
        </li>
      </ul>
    </section>
  );
}
