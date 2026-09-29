/**
 * phone.ba — GADŽETI 3B: ponude OPERATORA (BH Telecom, HT Eronet)
 * =============================================================
 * Stvarne, javno objavljene cijene sa stranica operatera (snapshot 19.9.2026.),
 * skrejpane polited pristupom (1 desktop UA, ≥ 2,5 s razmak) i arhivirane u
 * /home/team/shared/gadgets-export/operatori/ (bht_details.json, hter_raw.json,
 * SOURCES.md). Nema demo cijena — svaka ponuda nosi URL izvora.
 *
 * VAŽNO o cijenama BH Telecoma (mojwebshop.bhtelecom.ba):
 *   • Kategorija-kartice prikazuju SAMO cijenu uz tarifu (npr. 0/1 KM odmah +
 *     11,88 KM/mj × 24). Ovdje se koristi P U N A  C I J E N A  B E Z  U G O V O R A
 *     ("Cijena (KM)" iz tabele na stranici proizvoda) — jedina uporediva sa
 *     cijenama shopova. Povoljnija cijena uz 24-mjesečni ugovor postoji, ali
 *     traži pretplatu, pa nije uporediva i zato se ne prikazuje kao cijena.
 *   • Zato je u `variant` uvijek naznačeno "bez ugovora".
 * HT Eronet (hteronet.ba) objavljuje cijene samo za DODATNU OPREMU; satovi i
 * slušalice su isključivo "uz pretplatu" (na tim stranicama nema cijena) — pa
 * HT Eronet figuriše kao prodavač opreme, a ne satova/slušalica.
 * m:tel (mtel.ba) NEMA javno objavljene cijene bez ugovora: njihov webshop i
 * API vraćaju cijenu 0 KM uz mjesečne rate vezane za tarifu, a kategorije
 * satova/slušalica/opreme se učitavaju bez cijena — zato m:tel nije uvršten
 * (vidi SOURCES.md).
 */
import type { Gadget, GadgetSeller } from "./gadgets";

/** Gadžet bez normalizovanih specifikacija (isto kao RawGadget u gadgets.ts) */
type RawOperatorGadget = Omit<Gadget, "specs">;

const BHT = "mojwebshop.bhtelecom.ba";
const BHT_DATE = "19.9.2026.";

/**
 * Dodatni prodavači (operatori) po slug-u POSTOJEĆEG gadžeta.
 * Cijene su pune cijene bez ugovora gdje je operator takvu objavio.
 */
export const OPERATOR_SELLERS: Record<string, GadgetSeller[]> = {
  "apple-watch-se-3": [
    {
      name: "BH Telecom",
      priceKM: 699.4,
      availability: "Provjeri kod prodavca",
      buyUrl:
        "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Pametnisat_506061_Starlight_VARIATION_BHTWSHGa_AqHjCSgQAAAGeNvxKrrc3&CategoryName=konzoleioprema&CatalogID=uredjaji",
      variant: "40 mm, Starlight, GPS — bez ugovora",
    },
  ],
  "apple-watch-series-11": [
    {
      name: "BH Telecom",
      priceKM: 1181.95,
      availability: "Provjeri kod prodavca",
      buyUrl:
        "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Pametnisat_506066_RoseGo_VARIATION_BHTWSHLU7AqHjCET4AAAGeeSpKrrdT&CategoryName=konzoleioprema&CatalogID=uredjaji",
      variant: "42 mm, Rose Gold, GPS — bez ugovora",
    },
  ],
  "samsung-galaxy-watch8-classic": [
    {
      name: "BH Telecom",
      priceKM: 749.9,
      availability: "Provjeri kod prodavca",
      buyUrl:
        "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Pametnisat_505601_Black_VARIATION_BHTWSHcpfAqHjCrusAAAGf3ydR0cVO&CategoryName=konzoleioprema&CatalogID=uredjaji",
      variant: "BT, crni — bez ugovora",
    },
  ],
  "samsung-galaxy-buds-4": [
    {
      name: "BH Telecom",
      priceKM: 349,
      availability: "Provjeri kod prodavca",
      buyUrl:
        "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Slusalice_505942_NONE_VARIATION_BHTWSHu.PAqHjCkF0AAAGc6sCtTsO1&CategoryName=konzoleioprema&CatalogID=uredjaji",
      variant: "crne, bez punjača — bez ugovora",
    },
  ],
  "xiaomi-redmi-watch-5-active": [
    {
      name: "HT Eronet",
      priceKM: 99,
      availability: "Provjeri kod prodavca",
      buyUrl:
        "https://www.hteronet.ba/privatni-korisnici/xiaomi-pg306?rpid=cGFnZXM6MTky",
      variant: "Xiaomi dodatna oprema (katalog HT Eronet)",
    },
  ],
};

/**
 * NOVI gadžeti iz ponude operatera (kategorije u kojima operatori imaju jaku
 * ponudu). Cijena = puna cijena bez ugovora (BH Telecom) ili objavljena cijena
 * opreme (HT Eronet). Specifikacije su prepisane iz tabela operatera i prolaze
 * kroz `normalizeSpecs` — što parser ne prepozna, ne prikazuje se.
 */
export const OPERATOR_GADGETS: RawOperatorGadget[] = [
  /* ---------------- Pametni satovi ---------------- */
  {
    slug: "apple-watch-ultra-3",
    name: "Apple Watch Ultra 3 (49 mm)",
    brand: "Apple",
    category: "pametni_satovi",
    image: "/images/gadgets/apple-watch-ultra-3.jpg",
    imageSource: `BH Telecom — ${BHT} stranica proizvoda (Watch Ultra 3 49mm Natural Titanium)`,
    tagline:
      "Titanijumsko kućište, do 42 sata rada i 3000 nita — Apple sat za ekstremne uslove.",
    rawSpecs: {
      batteryLife: "do 42 sata normalnog rada",
      display: "LTPO3 OLED Always-On Retina, 3000 nita",
      gps: "L1 GPS; podržava LTE",
      size: "49 mm",
      caseMaterial: "Titanijum",
    },
    sellers: [
      {
        name: "BH Telecom",
        priceKM: 2510.65,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Pametnisat_506086_NatTi_VARIATION_BHTWSH0NvAqHjCQvwAAAGeFLw6qbsL&CategoryName=konzoleioprema&CatalogID=uredjaji",
        variant: "49 mm, Natural Titanium, Milanese Loop — bez ugovora",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "samsung-galaxy-watch-ultra-2025",
    name: "Samsung Galaxy Watch Ultra 2025 (LTE, 47 mm)",
    brand: "Samsung",
    category: "pametni_satovi",
    image: "/images/gadgets/samsung-galaxy-watch-ultra-2025.jpg",
    imageSource: `BH Telecom — ${BHT} stranica proizvoda (Watch Ultra 2025 LTE Titanium Gray)`,
    tagline:
      "Rugged Galaxy sat s LTE vezom, Super AMOLED ekranom i baterijom 590 mAh.",
    rawSpecs: {
      display: "Super AMOLED, Full Color Always-On Display",
      gps: "GPS (L1+L5) / Glonass / Beidou / Galileo",
      caseMaterial: "Titanijum",
      capacityMah: "590 mAh",
    },
    sellers: [
      {
        name: "BH Telecom",
        priceKM: 990.9,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Pametnisat_505604_TitaniumGray_VARIATION_BHTWSHuDfAqHjCbOEAAAGfexBR0cVl&CategoryName=konzoleioprema&CatalogID=uredjaji",
        variant: "47 mm, Titanium Gray, LTE — bez ugovora",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "garmin-venu-4",
    name: "Garmin Venu 4 (45 mm)",
    brand: "Garmin",
    category: "pametni_satovi",
    image: "/images/gadgets/garmin-venu-4.jpg",
    imageSource: `BH Telecom — ${BHT} stranica proizvoda (Venu 4 45mm Black Slate)`,
    tagline:
      "AMOLED Garmin s baterijom do 10 dana i radom i s iPhoneom i s Androidom.",
    rawSpecs: {
      batteryLife:
        "pametni sat do 10 dana (do 4 dana uz uvijek uključen displej); GPS način do 20-25 sati",
      compatibility: "iPhone, Android",
      display: "AMOLED, 1,4\"",
      size: "45 mm",
      gps: "GNSS",
    },
    sellers: [
      {
        name: "BH Telecom",
        priceKM: 1077.65,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Pametnisat_506078_Black_VARIATION_BHTWSHavHAqHjC7PwAAAGe9EzgabYr&CategoryName=konzoleioprema&CatalogID=uredjaji",
        variant: "45 mm, Black Slate — bez ugovora",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "xiaomi-redmi-watch-4",
    name: "Xiaomi Redmi Watch 4",
    brand: "Xiaomi",
    category: "pametni_satovi",
    image: "/images/gadgets/xiaomi-redmi-watch-4.jpg",
    imageSource: `BH Telecom — ${BHT} stranica proizvoda (Redmi Watch 4 Obsidian Black)`,
    tagline: "Pristupačan AMOLED sat s baterijom do 20 dana.",
    rawSpecs: {
      batteryLife: "do 20 dana (bez Always-On displeja)",
      display: "AMOLED, 1,97\"",
    },
    sellers: [
      {
        name: "BH Telecom",
        priceKM: 205.35,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Pametnisat_505496_ObsidianBlack_VARIATION_BHTWSHhWjAqHjCu94AAAGWob.45ckE&CategoryName=konzoleioprema&CatalogID=uredjaji",
        variant: "Obsidian Black — bez ugovora",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  /* ---------------- Bežične slušalice ---------------- */
  {
    slug: "soundcore-space-one-pro",
    name: "Anker Soundcore Space One Pro",
    brand: "Anker",
    category: "bezbicne_slusalice",
    image: "/images/gadgets/soundcore-space-one-pro.jpg",
    imageSource: `BH Telecom — ${BHT} stranica proizvoda (Soundcore Headset Space One Pro)`,
    tagline: "Naglavne Soundcore slušalice s ANC 3.0 i do 40 sati rada.",
    rawSpecs: {
      anc: "Active noise canceling ANC 3.0, 4 mikrofona",
      batteryBuds: "do 40 h (350 mAh)",
      bluetooth: "Bluetooth 5.3",
    },
    sellers: [
      {
        name: "BH Telecom",
        priceKM: 374.95,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Slusalice_506170_White_VARIATION_BHTWSH.0DAqHjCuqIAAAGfo0RMM9Z0&CategoryName=konzoleioprema&CatalogID=uredjaji",
        variant: "bijele",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  /* ---------------- Ostala oprema ---------------- */
  {
    slug: "xiaomi-punjac-33w",
    name: "Xiaomi punjač 33 W (USB-A + USB-C)",
    brand: "Xiaomi",
    category: "ostala_oprema",
    image: "/images/gadgets/xiaomi-punjac-33w.jpg",
    imageSource: `BH Telecom — ${BHT} stranica proizvoda (Mi 33W Wall Charger Type-A + Type-C)`,
    tagline: "Xiaomi punjač 33 W s USB-A i USB-C izlazom.",
    rawSpecs: {
      outputW: "33 W",
      ports: "1 × USB-A, 1 × USB-C",
    },
    sellers: [
      {
        name: "BH Telecom",
        priceKM: 36,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mojwebshop.bhtelecom.ba/ViewProduct-Start?SKU=Punjac_504947_NONE_VARIATION_BHTWSHRf7AqHjC_VMAAAGSdNS1lEgV&CategoryName=konzoleioprema&CatalogID=uredjaji",
        variant: "EU, bez kabla — bez ugovora",
      },
      {
        name: "HT Eronet",
        priceKM: 37,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://www.hteronet.ba/privatni-korisnici/xiaomi-pg306?rpid=cGFnZXM6MTky",
        variant: "33W Punjač Type C, A (katalog HT Eronet)",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
];

/** Izvor i datum snapshota operator ponuda (za napomenu u UI/izvještajima) */
export const OPERATOR_PRICE_SOURCES = {
  "BH Telecom": `${BHT} — pune cijene bez ugovora, snapshot ${BHT_DATE}`,
  "HT Eronet": `hteronet.ba — dodatna oprema, snapshot ${BHT_DATE}`,
} as const;
