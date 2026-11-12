/**
 * phone.ba — STVARNE cijene s OLX.ba (poslovni oglasi, verificirana arhiva).
 *
 * GENERISANO — ne mijenjati ručno. Ponovo generiši nakon ponovnog skrejpa:
 *   python3 /home/team/shared/olx-export/regenerate_olx_prices_ts.py \
 *     /home/team/shared/olx-export/olx_models_refresh.json
 * Izvor: /home/team/shared/olx-export/olx_models_refresh.json (api.olx.ba/search)
 * (uvoz 2026-11-12). Rezultat: 15 modela sa stvarnim cijenama.
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
 * poslovni oglasi (user_type shop) sa OLX.ba, preuzeti 2026-11-12.
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
export const OLX_SCRAPE_DATE = "2026-11-12";

/** Stvarne OLX cijene po modelu — samo modeli sa pogodcima. */
export const olxPrices: PhoneOlxPrices[] = [
  {
    slug: "iphone-15-pro",
    modelLabel: "iPhone 15 Pro",
    minPrice: 650,
    count: 8,
    offers: [
      {
        naziv: "Apple iPhone 15 Pro 256GB **Polovan**",
        grad: "Sarajevo - Stari Grad",
        cijena_km: 650,
        link: "https://olx.ba/artikal/81040310",
        datum: "2026-11-12",
      },
      {
        naziv: "iPhone 15 PRO 128GB//100%",
        grad: "Teslić",
        cijena_km: 700,
        link: "https://olx.ba/artikal/80726250",
        datum: "2026-11-12",
      },
      {
        naziv: "Apple iPhone 15 Pro 128GB **Polovan**",
        grad: "Sarajevo - Stari Grad",
        cijena_km: 770,
        link: "https://olx.ba/artikal/81039849",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 15 PRO | 256GB BLUE | 78 BAT",
        grad: "Novi Travnik",
        cijena_km: 799,
        link: "https://olx.ba/artikal/80646071",
        datum: "2026-11-12",
      },
      {
        naziv: "iPhone 15 Pro 256GB - Zdravlje bat. 88%",
        grad: "Živinice",
        cijena_km: 850,
        link: "https://olx.ba/artikal/81062954",
        datum: "2026-11-12",
      },
      {
        naziv: "Apple iPhone 15 Pro 128gb (ne radi face ID )",
        grad: "Banja Luka",
        cijena_km: 850,
        link: "https://olx.ba/artikal/77978785",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 15 PRO | 128GB BLUE | TOP STANJE",
        grad: "Novi Travnik",
        cijena_km: 850,
        link: "https://olx.ba/artikal/80728368",
        datum: "2026-11-12",
      },
      {
        naziv: "APPLE IPHONE 15 PRO 256GB 78% SA GARANCIJOM",
        grad: "Ilidža",
        cijena_km: 850,
        link: "https://olx.ba/artikal/80118310",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "iphone-15",
    modelLabel: "iPhone 15",
    minPrice: 550,
    count: 8,
    offers: [
      {
        naziv: "Iphone 15",
        grad: "Tuzla",
        cijena_km: 550,
        link: "https://olx.ba/artikal/81065587",
        datum: "2026-11-12",
      },
      {
        naziv: "iPhone 15 BAT 100% +KUTIJA *KAO NOVO* [14 16]",
        grad: "Sarajevo - Novo Sarajevo",
        cijena_km: 599.9,
        link: "https://olx.ba/artikal/80993581",
        datum: "2026-11-12",
      },
      {
        naziv: "iPhone 15 128GB Pink Baterija 74%",
        grad: "Banja Luka",
        cijena_km: 650,
        link: "https://olx.ba/artikal/80550791",
        datum: "2026-11-12",
      },
      {
        naziv: "APPLE IPHONE 15 128GB BLACK KUTIJA",
        grad: "Sarajevo - Centar",
        cijena_km: 670,
        link: "https://olx.ba/artikal/71881697",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 15 | 128GB BLACK | ODLICAN",
        grad: "Novi Travnik",
        cijena_km: 680,
        link: "https://olx.ba/artikal/80534369",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 15 | 128GB BLACK | ODLICAN",
        grad: "Novi Travnik",
        cijena_km: 690,
        link: "https://olx.ba/artikal/80407704",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 15 128GB NA RATE",
        grad: "Prijedor",
        cijena_km: 699,
        link: "https://olx.ba/artikal/80709551",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 15 128GB STANJE 9/10 OČUVAN GARANCIJA AKCIJA",
        grad: "Nevesinje",
        cijena_km: 699,
        link: "https://olx.ba/artikal/76721709",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "iphone-14",
    modelLabel: "iPhone 14",
    minPrice: 400,
    count: 8,
    offers: [
      {
        naziv: "Iphone 14 128 GB",
        grad: "Bijeljina",
        cijena_km: 400,
        link: "https://olx.ba/artikal/80716754",
        datum: "2026-11-12",
      },
      {
        naziv: "Iphone 14",
        grad: "Tuzla",
        cijena_km: 450,
        link: "https://olx.ba/artikal/76577316",
        datum: "2026-11-12",
      },
      {
        naziv: "Iphone 14 128 GB 83% baterija",
        grad: "Bileća",
        cijena_km: 480,
        link: "https://olx.ba/artikal/80916807",
        datum: "2026-11-12",
      },
      {
        naziv: "Apple iPhone 14 128GB **Polovan**",
        grad: "Sarajevo - Stari Grad",
        cijena_km: 480,
        link: "https://olx.ba/artikal/81038686",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 14 128GB ZDRAVLJE BATERIJE 83% SVE RADI",
        grad: "Ljubuški",
        cijena_km: 499,
        link: "https://olx.ba/artikal/80147835",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 14 128GB ZDRAVLJE BATERIJE 86% SVE ORIGINALNO I RADI",
        grad: "Ljubuški",
        cijena_km: 500,
        link: "https://olx.ba/artikal/79188706",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 14 128GB ZDRAVLJE BATERIJE 86% SVE ORIGINALNO I RADI",
        grad: "Ljubuški",
        cijena_km: 515,
        link: "https://olx.ba/artikal/79303234",
        datum: "2026-11-12",
      },
      {
        naziv: "APPLE IPHONE 14 128GB STARLIGHT ODLICAN",
        grad: "Sarajevo - Novo Sarajevo",
        cijena_km: 520,
        link: "https://olx.ba/artikal/73731326",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "iphone-13",
    modelLabel: "iPhone 13",
    minPrice: 350,
    count: 8,
    offers: [
      {
        naziv: "iPhone 13 | 128GB | Midnight",
        grad: "Velika Kladuša",
        cijena_km: 350,
        link: "https://olx.ba/artikal/80764372",
        datum: "2026-11-12",
      },
      {
        naziv: "IPhone 13 128 GB Blue > Povoljno <",
        grad: "Tuzla",
        cijena_km: 379,
        link: "https://olx.ba/artikal/79818007",
        datum: "2026-11-12",
      },
      {
        naziv: "iPhone 13 128GB Starlight 81%",
        grad: "Banja Luka",
        cijena_km: 380,
        link: "https://olx.ba/artikal/79239982",
        datum: "2026-11-12",
      },
      {
        naziv: "iPhone 13 128GB Midnight - Baterija 80%",
        grad: "Banja Luka",
        cijena_km: 390,
        link: "https://olx.ba/artikal/78422090",
        datum: "2026-11-12",
      },
      {
        naziv: "Iphone 13 128GB - EXTRA STANJE, GARANCIJA",
        grad: "Tuzla",
        cijena_km: 390,
        link: "https://olx.ba/artikal/79317007",
        datum: "2026-11-12",
      },
      {
        naziv: "IPHONE 13 | 128GB MIDNIGHT | 77% BATERIJA | ODLICAN",
        grad: "Novi Travnik",
        cijena_km: 399,
        link: "https://olx.ba/artikal/80774858",
        datum: "2026-11-12",
      },
      {
        naziv: "iPhone 13 128GB 79% Kao Nov",
        grad: "Bijeljina",
        cijena_km: 410,
        link: "https://olx.ba/artikal/80841525",
        datum: "2026-11-12",
      },
      {
        naziv: "Iphone 13 128GB 100% baterija - EXTRA PONUDA, GARANCIJA",
        grad: "Tuzla",
        cijena_km: 420,
        link: "https://olx.ba/artikal/80424779",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "samsung-galaxy-s24",
    modelLabel: "Samsung Galaxy S24",
    minPrice: 599,
    count: 8,
    offers: [
      {
        naziv: "SAMSUNG GALAXY S24 KAO NOV 128GB 3M GAR",
        grad: "Mostar",
        cijena_km: 599,
        link: "https://olx.ba/artikal/81050191",
        datum: "2026-11-12",
      },
      {
        naziv: "SAMSUNG GALAXY S24 8/128GB KAO NOV 3M GAR",
        grad: "Mostar",
        cijena_km: 599,
        link: "https://olx.ba/artikal/80656677",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S24 | 128/8GB | Onyx Black",
        grad: "Velika Kladuša",
        cijena_km: 600,
        link: "https://olx.ba/artikal/79762938",
        datum: "2026-11-12",
      },
      {
        naziv: "SAMSUNG GALAXY S24 MARBLE GRAY | DUOS",
        grad: "Derventa",
        cijena_km: 630,
        link: "https://olx.ba/artikal/80836795",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S24 8/256GB 97% Baterija",
        grad: "Sarajevo - Centar",
        cijena_km: 640,
        link: "https://olx.ba/artikal/79686259",
        datum: "2026-11-12",
      },
      {
        naziv: "SAMSUNG mobitel Galaxy S24 128/8GB Marble Gray ***KAO NOV***",
        grad: "Ilidža",
        cijena_km: 649,
        link: "https://olx.ba/artikal/81113189",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S24 8/256 GB",
        grad: "Mostar",
        cijena_km: 650,
        link: "https://olx.ba/artikal/80636868",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S24 256 GB",
        grad: "Fojnica",
        cijena_km: 670,
        link: "https://olx.ba/artikal/78561502",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "samsung-galaxy-s23-fe",
    modelLabel: "Samsung Galaxy S23 FE",
    minPrice: 750,
    count: 8,
    offers: [
      {
        naziv: "SAMSUNG GALAXY S23 FE 8/128 VAKUM NOVO! GARANCIJA! S23fe Graphite",
        grad: "Sarajevo - Centar",
        cijena_km: 750,
        link: "https://olx.ba/artikal/63005061",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S23 FE 8/128 NOVO! MINT GARANCIJA 128GB S23fe",
        grad: "Sarajevo - Centar",
        cijena_km: 750,
        link: "https://olx.ba/artikal/62566633",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Studio Samsung Galaxy S23 FE 8/128GB",
        grad: "Živinice",
        cijena_km: 849,
        link: "https://olx.ba/artikal/80085129",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S23 FE 8/128GB",
        grad: "Sarajevo - Centar",
        cijena_km: 849,
        link: "https://olx.ba/artikal/80295592",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S23 FE 8/128GB",
        grad: "Zenica",
        cijena_km: 849,
        link: "https://olx.ba/artikal/80318415",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S23 FE 8/128GB",
        grad: "Mostar",
        cijena_km: 849,
        link: "https://olx.ba/artikal/80296346",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S23 FE 8/128GB",
        grad: "Brčko",
        cijena_km: 849,
        link: "https://olx.ba/artikal/80295013",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy S23 FE 128GB (8GB RAM)",
        grad: "Sarajevo - Centar",
        cijena_km: 850,
        link: "https://olx.ba/artikal/58053453",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "samsung-galaxy-a55",
    modelLabel: "Samsung Galaxy A55",
    minPrice: 280,
    count: 8,
    offers: [
      {
        naziv: "SAMSUNG GALAXY A55 5G | 256/8GB BLACK | ODLICAN",
        grad: "Novi Travnik",
        cijena_km: 280,
        link: "https://olx.ba/artikal/81068782",
        datum: "2026-11-12",
      },
      {
        naziv: "SAMSUNG GALAXY A55 5G 8/128GB GARANCIJA NA RATE",
        grad: "Prijedor",
        cijena_km: 299,
        link: "https://olx.ba/artikal/80427761",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A55 5G",
        grad: "Teslić",
        cijena_km: 350,
        link: "https://olx.ba/artikal/81102092",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A55 | 256/12GB",
        grad: "Velika Kladuša",
        cijena_km: 400,
        link: "https://olx.ba/artikal/80197691",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung  Galaxy A55 5G 128GB 8GB Navy Black",
        grad: "Zenica",
        cijena_km: 520,
        link: "https://olx.ba/artikal/77548617",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A55 5G 128GB/8GB",
        grad: "Maglaj",
        cijena_km: 580,
        link: "https://olx.ba/artikal/60455562",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A55 5G 12/256GB",
        grad: "Sarajevo - Centar",
        cijena_km: 590,
        link: "https://olx.ba/artikal/60022147",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A55 5G 8/128 NOVO! LILA GARANCIJA! Lilac",
        grad: "Sarajevo - Centar",
        cijena_km: 590,
        link: "https://olx.ba/artikal/63352983",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "samsung-galaxy-a54",
    modelLabel: "Samsung Galaxy A54",
    minPrice: 199,
    count: 8,
    offers: [
      {
        naziv: "Samsung Galaxy A54 8/128GB",
        grad: "Sarajevo - Centar",
        cijena_km: 199,
        link: "https://olx.ba/artikal/80694653",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A54 5G 256/8 GB * odlican*",
        grad: "Živinice",
        cijena_km: 240,
        link: "https://olx.ba/artikal/81085855",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A54 5G | 8/128 | Odlicno stanje",
        grad: "Živinice",
        cijena_km: 249,
        link: "https://olx.ba/artikal/80899403",
        datum: "2026-11-12",
      },
      {
        naziv: "SAMSUNG GALAXY A54 5G 8/128GB NA RATE",
        grad: "Prijedor",
        cijena_km: 250,
        link: "https://olx.ba/artikal/80429486",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A54 8/128 ODLIČNO STANJE",
        grad: "Tuzla",
        cijena_km: 250,
        link: "https://olx.ba/artikal/79364554",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A54 | 128/8GB",
        grad: "Velika Kladuša",
        cijena_km: 250,
        link: "https://olx.ba/artikal/80895805",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A54  8GB/128GB TOP STANJE",
        grad: "Tuzla",
        cijena_km: 255,
        link: "https://olx.ba/artikal/79364173",
        datum: "2026-11-12",
      },
      {
        naziv: "Samsung Galaxy A54 5G 8GB 128GB Odlican Dual Sim",
        grad: "Banja Luka",
        cijena_km: 259,
        link: "https://olx.ba/artikal/79582238",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "xiaomi-14",
    modelLabel: "Xiaomi 14",
    minPrice: 1200,
    count: 5,
    offers: [
      {
        naziv: "Xiaomi 14 5G Dual Sim 12GB RAM 512GB Novo 12/512",
        grad: "Bijeljina",
        cijena_km: 1200,
        link: "https://olx.ba/artikal/66828796",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi 14 512GB (12GB RAM)",
        grad: "Sarajevo - Centar",
        cijena_km: 1260,
        link: "https://olx.ba/artikal/59547942",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi 14 12/512GB",
        grad: "Sarajevo - Centar",
        cijena_km: 1655,
        link: "https://olx.ba/artikal/59800118",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Xiaomi Xiaomi 14 12+512, Black",
        grad: "Sarajevo - Novo Sarajevo",
        cijena_km: 1929.9,
        link: "https://olx.ba/artikal/73949565",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi 14 5G 12/512GB",
        grad: "Živinice",
        cijena_km: 1949,
        link: "https://olx.ba/artikal/59746229",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "xiaomi-redmi-note-13-pro",
    modelLabel: "Redmi Note 13 Pro",
    minPrice: 240,
    count: 8,
    offers: [
      {
        naziv: "XIAOMI REDMI NOTE 13 PRO | 256/8GB | SUPER STANJE",
        grad: "Novi Travnik",
        cijena_km: 240,
        link: "https://olx.ba/artikal/81040039",
        datum: "2026-11-12",
      },
      {
        naziv: "Redmi Note 13 pro 8/256 GB IZLOŽBENI",
        grad: "Sarajevo - Novo Sarajevo",
        cijena_km: 245,
        link: "https://olx.ba/artikal/77805988",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi Note 13 Pro | 8/256 | Odlican",
        grad: "Živinice",
        cijena_km: 249,
        link: "https://olx.ba/artikal/80954256",
        datum: "2026-11-12",
      },
      {
        naziv: "XIAOMI REDMI NOTE 13 PRO STANJE 10/10 256GB GARANCIJA",
        grad: "Nevesinje",
        cijena_km: 249.99,
        link: "https://olx.ba/artikal/76072132",
        datum: "2026-11-12",
      },
      {
        naziv: "Redmi note 13 Pro",
        grad: "Ilidža",
        cijena_km: 255,
        link: "https://olx.ba/artikal/80816780",
        datum: "2026-11-12",
      },
      {
        naziv: "Redmi Note 13 pro 4G 8/256GB IZLOZBENI novo",
        grad: "Sarajevo - Novo Sarajevo",
        cijena_km: 299,
        link: "https://olx.ba/artikal/77697724",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi Note 13 Pro 8GB 256GB Black FULL OPREMA GARANCIJA",
        grad: "Čapljina",
        cijena_km: 315,
        link: "https://olx.ba/artikal/74270740",
        datum: "2026-11-12",
      },
      {
        naziv: "REDMI NOTE 13 PRO 8/256 GB KAO NOV",
        grad: "Zenica",
        cijena_km: 349.99,
        link: "https://olx.ba/artikal/78486170",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "xiaomi-redmi-note-13",
    modelLabel: "Redmi Note 13",
    minPrice: 189,
    count: 8,
    offers: [
      {
        naziv: "Xiaomi Redmi Note 13 8GB 256GB Black Dual",
        grad: "Banja Luka",
        cijena_km: 189,
        link: "https://olx.ba/artikal/79608206",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Xiaomi redmi note 13 8/256 ice blue Top",
        grad: "Sarajevo - Novi Grad",
        cijena_km: 200,
        link: "https://olx.ba/artikal/80766516",
        datum: "2026-11-12",
      },
      {
        naziv: "Redmi Note 13",
        grad: "Tuzla",
        cijena_km: 200,
        link: "https://olx.ba/artikal/79817545",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi Note 13  Dual  128GB 6GB RAM Black EU",
        grad: "Zenica",
        cijena_km: 280,
        link: "https://olx.ba/artikal/77636860",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi Note 13 4G 256GB (8GB RAM) - AKCIJA !",
        grad: "Sarajevo - Centar",
        cijena_km: 290,
        link: "https://olx.ba/artikal/58621426",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi Note 13 4G 512GB (8GB RAM)",
        grad: "Sarajevo - Centar",
        cijena_km: 300,
        link: "https://olx.ba/artikal/63821362",
        datum: "2026-11-12",
      },
      {
        naziv: "Redmi Note 13 6 GB RAM 128 GB",
        grad: "Sarajevo - Novo Sarajevo",
        cijena_km: 309,
        link: "https://olx.ba/artikal/63940014",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi Note 13 256GB (8GB RAM) 2 GODINE GARANCIJA",
        grad: "Sarajevo - Novi Grad",
        cijena_km: 329,
        link: "https://olx.ba/artikal/63001105",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "xiaomi-redmi-13c",
    modelLabel: "Redmi 13C",
    minPrice: 150,
    count: 8,
    offers: [
      {
        naziv: "Redmi 13C",
        grad: "Bugojno",
        cijena_km: 150,
        link: "https://olx.ba/artikal/79681789",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi 13C 6/128GB",
        grad: "Sarajevo - Centar",
        cijena_km: 160,
        link: "https://olx.ba/artikal/80526029",
        datum: "2026-11-12",
      },
      {
        naziv: "Redmi 13C",
        grad: "Bugojno",
        cijena_km: 160,
        link: "https://olx.ba/artikal/75919292",
        datum: "2026-11-12",
      },
      {
        naziv: "Redmi 13C, 8/256gb",
        grad: "Bijeljina",
        cijena_km: 200,
        link: "https://olx.ba/artikal/80321363",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Xiaomi Redmi 13C Dual Sim 4GB 128GB Midnight Black",
        grad: "Brčko",
        cijena_km: 219,
        link: "https://olx.ba/artikal/76733557",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi 13C 256GB (8GB RAM)",
        grad: "Sarajevo - Centar",
        cijena_km: 229,
        link: "https://olx.ba/artikal/57477659",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Redmi 13C 128 GB ( 4 GB ) Crni 128GB 4GB",
        grad: "Sarajevo - Novi Grad",
        cijena_km: 235,
        link: "https://olx.ba/artikal/64607432",
        datum: "2026-11-12",
      },
      {
        naziv: "MOBITEL REDMI 13C DUAL SIM 4/128 GB",
        grad: "Brčko",
        cijena_km: 245,
        link: "https://olx.ba/artikal/58440370",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "xiaomi-poco-x6",
    modelLabel: "Poco X6",
    minPrice: 450,
    count: 8,
    offers: [
      {
        naziv: "Xiaomi POCO X6 5G 8 / 256 NOVO! GARANCIJA! 256GB",
        grad: "Sarajevo - Centar",
        cijena_km: 450,
        link: "https://olx.ba/artikal/60242555",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Xiaomi Poco X6 5G 12GB 256GB ,Mirror Black",
        grad: "Bijeljina",
        cijena_km: 519,
        link: "https://olx.ba/artikal/64851385",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Poco X6 5G 8GB 256GB Black ind",
        grad: "Istočno Sarajevo",
        cijena_km: 541,
        link: "https://olx.ba/artikal/79879171",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi POCO X6 5G 12/512 NOVO! GARANCIJA! 12 512",
        grad: "Sarajevo - Centar",
        cijena_km: 550,
        link: "https://olx.ba/artikal/65739508",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Poco X6 256GB (12GB RAM)",
        grad: "Sarajevo - Centar",
        cijena_km: 580,
        link: "https://olx.ba/artikal/58759123",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Poco X6 5G 12GB 256GB Black ind",
        grad: "Istočno Sarajevo",
        cijena_km: 589,
        link: "https://olx.ba/artikal/79879169",
        datum: "2026-11-12",
      },
      {
        naziv: "MOBITEL XIAOMI POCO X6 512GB ( 12GB ) 5G CRNI",
        grad: "Sarajevo - Novi Grad",
        cijena_km: 605,
        link: "https://olx.ba/artikal/64113475",
        datum: "2026-11-12",
      },
      {
        naziv: "Xiaomi Poco X6 12GB 256GB White EU",
        grad: "Istočno Sarajevo",
        cijena_km: 631,
        link: "https://olx.ba/artikal/79873284",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "honor-90",
    modelLabel: "Honor 90",
    minPrice: 300,
    count: 8,
    offers: [
      {
        naziv: "% Honor 90 8/256 savrseno ocuvan bez kutije",
        grad: "Grude",
        cijena_km: 300,
        link: "https://olx.ba/artikal/69650712",
        datum: "2026-11-12",
      },
      {
        naziv: "HONOR 90",
        grad: "Cazin",
        cijena_km: 370,
        link: "https://olx.ba/artikal/80345152",
        datum: "2026-11-12",
      },
      {
        naziv: "HONOR 90 - 12/512GB - KAO NOV - BLACK",
        grad: "Banja Luka",
        cijena_km: 380,
        link: "https://olx.ba/artikal/80299594",
        datum: "2026-11-12",
      },
      {
        naziv: "Honor 90 12/512GB 512 GB - KAO NOVO, GARANCIJA",
        grad: "Tuzla",
        cijena_km: 400,
        link: "https://olx.ba/artikal/80141538",
        datum: "2026-11-12",
      },
      {
        naziv: "HONOR 90 5G Crni + POKLON 8GB/256GB *NOVOO*Garancija*",
        grad: "Ljubuški",
        cijena_km: 498.9,
        link: "https://olx.ba/artikal/57462514",
        datum: "2026-11-12",
      },
      {
        naziv: "Honor 90 8/256 NOVO! GARANCIJA! GREEN ZELENI 256GB",
        grad: "Sarajevo - Centar",
        cijena_km: 535,
        link: "https://olx.ba/artikal/63783085",
        datum: "2026-11-12",
      },
      {
        naziv: "HONOR 90 8 / 256 GB NOVO! GARANCIJA!",
        grad: "Sarajevo - Centar",
        cijena_km: 535,
        link: "https://olx.ba/artikal/54970095",
        datum: "2026-11-12",
      },
      {
        naziv: "Honor 90 5G 12/512GB",
        grad: "Sarajevo - Centar",
        cijena_km: 595,
        link: "https://olx.ba/artikal/54856110",
        datum: "2026-11-12",
      },
    ],
  },
  {
    slug: "honor-x8b",
    modelLabel: "Honor X8b",
    minPrice: 373,
    count: 7,
    offers: [
      {
        naziv: "Mobitel Honor X8b 8GB 256GB Emerald Green",
        grad: "Zenica",
        cijena_km: 373,
        link: "https://olx.ba/artikal/78318311",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Honor X8b 8GB 256GB Emerald Green",
        grad: "Zenica",
        cijena_km: 374,
        link: "https://olx.ba/artikal/77200807",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Honor X8b 8GB 256GB Emerald Green",
        grad: "Kalesija",
        cijena_km: 389,
        link: "https://olx.ba/artikal/67145693",
        datum: "2026-11-12",
      },
      {
        naziv: "Honor X8b 256GB (8GB RAM)",
        grad: "Sarajevo - Centar",
        cijena_km: 399,
        link: "https://olx.ba/artikal/66092668",
        datum: "2026-11-12",
      },
      {
        naziv: "Telefon HONOR X8b 8+256 Emerald Green 108 MP prednja kam 5109AYCA",
        grad: "Zenica",
        cijena_km: 429,
        link: "https://olx.ba/artikal/73279627",
        datum: "2026-11-12",
      },
      {
        naziv: "Mobitel Honor X8b 8GB 256GB Emerald Green",
        grad: "Široki Brijeg",
        cijena_km: 441,
        link: "https://olx.ba/artikal/68348573",
        datum: "2026-11-12",
      },
      {
        naziv: "NA RATE Mobitel Honor X8b 8GB 256GB Emerald Green",
        grad: "Zenica",
        cijena_km: 449,
        link: "https://olx.ba/artikal/79206171",
        datum: "2026-11-12",
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
