/**
 * phone.ba — registar vodiča (jedini izvor istine za hub stranicu /vodic).
 *
 * Pravila:
 *  - svaki unos mora odgovarati STVARNOJ ruti u src/routes/vodic/,
 *  - `naslov` je naslov vodiča onako kako stoji na samoj stranici (ne mijenja se),
 *  - `opis` je 1–2 rečenice izvedene iz stvarnog sadržaja vodiča — bez izmišljanja,
 *  - novi vodič se dodaje ovdje + u scripts/gen-sitemap.py (i ništa više).
 */

/** Dozvoljene putanje vodiča (tipski vezane za rute, da Link ostane tipiziran). */
export type VodicPath =
  "/vodic/najbolji-telefoni-2026" | "/vodic/budzet-telefoni";

export interface Vodic {
  slug: string;
  path: VodicPath;
  /** Naslov vodiča kakav stoji na stranici vodiča. */
  naslov: string;
  /** Kratka oznaka teme (za karticu u listi). */
  tema: string;
  /** 1–2 rečenice iz stvarnog sadržaja vodiča. */
  opis: string;
}

export const vodici: Vodic[] = [
  {
    slug: "najbolji-telefoni-2026",
    path: "/vodic/najbolji-telefoni-2026",
    naslov: "Najbolji telefoni 2026",
    tema: "Preporuke po kategorijama",
    opis: "Preporuke u šest kategorija — flagship, sklopivi, kamera, gaming, baterija i budžet — sa stvarnim cijenama u KM iz BH online shopova i čestim pitanjima.",
  },
  {
    slug: "budzet-telefoni",
    path: "/vodic/budzet-telefoni",
    naslov: "Budžet telefoni — najbolji jeftini telefoni u BiH",
    tema: "Telefoni do 400 KM",
    opis: "Modeli ispod 400 KM koji se stvarno prodaju u BiH, sortirani po najnižoj cijeni iz BH shopova, uz savjete šta provjeriti prije kupovine jeftinijeg telefona.",
  },
];
