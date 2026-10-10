/**
 * phone.ba — STVARNE cijene s OLX.ba (poslovni oglasi, verificirana arhiva).
 *
 * GENERISANO — ne mijenjati ručno. Ponovo generiši nakon ponovnog skrejpa:
 *   python3 /home/team/shared/olx-export/regenerate_olx_prices_ts.py
 * Izvor: /home/team/shared/olx-export/olx_poslovni_radnje_servisi.json
 * (uvoz 2026-10-10). Rezultat: 3 modela sa stvarnim cijenama.
 *
 * Pravila uparivanja (regex, case-insensitive, na `naziv` oglasa):
 *   slug                          model              ključni pattern
 *   ----------------------------- ------------------ --------------------------------
 *   iphone-15-pro                 iPhone 15 Pro      iphone 15 pro(?!\s*max\b)
 *   iphone-15                     iPhone 15          iphone 15(?!\s*(?:pro|plus|mini)|[\d])
 *   iphone-14                     iPhone 14          iphone 14(?!\s*(?:pro|plus|mini)|[\d])
 *   iphone-13                     iPhone 13          iphone 13(?!\s*(?:pro|plus|mini)|[\d])
 *   samsung-galaxy-s24            Samsung Galaxy S24 galaxy s24(?!\s*(?:ultra|fe)|[\d])
 *   samsung-galaxy-s23-fe         Samsung Galaxy S23 FE galaxy s23 fe\b
 *   samsung-galaxy-a55            Samsung Galaxy A55 galaxy a55(?![\d])
 *   samsung-galaxy-a54            Samsung Galaxy A54 galaxy a54(?![\d])
 *   xiaomi-14                     Xiaomi 14          xiaomi 14(?!\s*(?:t|pro|ultra)|[\d])
 *   xiaomi-redmi-note-13-pro      Redmi Note 13 Pro  redmi note 13 pro(?!\s*(?:\+|max)|[\d])
 *   xiaomi-redmi-note-13          Redmi Note 13      redmi note 13(?!\s*(?:pro|\+|max)|[\d])
 *   xiaomi-redmi-13c              Redmi 13C          redmi 13c(?![\d])
 *   xiaomi-poco-x6                Poco X6            poco x6(?!\s*(?:pro|neo)|[\d])
 *   honor-90                      Honor 90           honor 90(?![\d])
 *   honor-x9b                     Honor X9b          honor x9b(?![\d])
 *   honor-x8b                     Honor X8b          honor x8b(?![\d])
 *
 * Posebne mjere opreza (negative lookahead):
 *   - "iPhone 15" NE hvata "iPhone 15 Pro/Plus/Mini" (i obrnuto),
 *     "15 Pro" NE hvata "15 Pro Max";
 *   - "Galaxy S24" NE hvata "S24 Ultra/S24 FE";
 *   - "Xiaomi 14" NE hvata "14T/14 Pro/14 Ultra";
 *   - "Redmi Note 13" NE hvata "Note 13 Pro/Pro+/Pro Max";
 *   - "Poco X6" NE hvata "X6 Pro/X6 Neo";
 *   - X9b/X8b se hvataju samo tačno ("X9a" ne prolazi kao X9b).
 *
 * Uključeni su samo oglasi sa cijenom (cijena_km != null). Ponude su
 * sortirane rastuće po cijeni; najviše 8 po modelu. `count` = broj
 * prikazanih oglasa (oglasa sa cijenom). Cijene NISU demo — to su stvarni
 * poslovni oglasi (user_type shop) sa OLX.ba, preuzeti 2026-10-10.
 */

export interface OlxOffer {
  /** Pun naslov oglasa na OLX.ba */
  naziv: string;
  /** Grad / naselje iz oglasa */
  grad: string;
  /** Cijena u KM iz oglasa (stvarna, ne demo) */
  cijena_km: number;
  /** Link na oglas na OLX.ba */
  link: string;
  /** Datum preuzimanja oglasa (ISO) */
  datum: string;
}

export interface PhoneOlxPrices {
  /** Slug telefona iz kataloga (src/data/phones.ts) */
  slug: string;
  /** Naziv modela kakav je u katalogu, npr. "iPhone 15" */
  modelLabel: string;
  /** Najniža stvarna cijena među ponudama (KM) */
  minPrice: number;
  /** Broj prikazanih oglasa sa cijenom (najviše 8) */
  count: number;
  /** Oglasi sortirani rastuće po cijeni (najviše 8) */
  offers: OlxOffer[];
}

/** Datum preuzimanja arhive (ISO) — "uvoz 13.9.2026." u UI */
export const OLX_SCRAPE_DATE = "2026-10-10";

/** Stvarne OLX cijene po modelu — samo modeli sa pogodcima. */
export const olxPrices: PhoneOlxPrices[] = [
  {
    slug: "iphone-15-pro",
    modelLabel: "iPhone 15 Pro",
    minPrice: 1000,
    count: 1,
    offers: [
      {
        naziv: "Iphone 15 Pro 128GB 87% BH",
        grad: "Sarajevo - Centar",
        cijena_km: 1000,
        link: "https://olx.ba/artikal/79686712",
        datum: "2026-10-10",
      },
    ],
  },
  {
    slug: "iphone-15",
    modelLabel: "iPhone 15",
    minPrice: 1230,
    count: 1,
    offers: [
      {
        naziv: "APPLE IPHONE 15 128GB KUPI NA RATE 65KM",
        grad: "Sarajevo - Centar",
        cijena_km: 1230,
        link: "https://olx.ba/artikal/55446740",
        datum: "2026-10-10",
      },
    ],
  },
  {
    slug: "iphone-14",
    modelLabel: "iPhone 14",
    minPrice: 729,
    count: 1,
    offers: [
      {
        naziv: "iPhone 14  128 GB zdravlje baterije 83%",
        grad: "Sarajevo - Novo Sarajevo",
        cijena_km: 729,
        link: "https://olx.ba/artikal/73529738",
        datum: "2026-10-08",
      },
    ],
  },
];

/**
 * Vraća stvarne OLX cijene za telefonski slug ili undefined ako nema pogodaka.
 */
export function getOlxPrices(slug: string): PhoneOlxPrices | undefined {
  return olxPrices.find((p) => p.slug === slug);
}

/** Datum "2026-09-13" → "13.9.2026." (za etiketu uvoza). */
export function formatScrapeDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.${y}.`;
}
