/**
 * phone.ba — GADŽETI (pametni satovi, bežične slušalice i ostala oprema).
 *
 * Cijene: STVARNI snapshot cijena iz BH online shopova (fonTELe, IQ Mobile,
 * Univerzalno, Mobitech) — isti izvori kao za telefone. Skrejpano polited
 * pristupom (1 desktop UA, ≥ 2,5 s razmak) i arhivirano u
 * /home/team/shared/gadgets-export/ (gadgets_raw.json, gadget_pages.json).
 *
 * Gdje shop nije imao cijenu (Honor Choice Watch 2i je u shopu bez cijene),
 * ponuda je označena `demo: true` sa realističnom cijenom — UI je uvijek
 * vizuelno označava i nikad je ne miješa sa stvarnim cijenama.
 *
 * `rawSpecs` su Sirovi tekstovi kakve navode shop/proizvođač ("do 18 sati",
 * "IP57", "Bluetooth 5.3", "20.000 mAh"); `normalizeSpecs` ih pretvara u
 * strukturirana polja (vidi src/lib/gadgetSpecs.ts) — polja koja nisu
 * prepoznata se ne prikazuju.
 *
 * Trend cijene (`priceTrend`, `trendPercent`) je PROCJENA na osnovu prodajne
 * pozicije modela u katalogu (nije mjerenje stvarnih cijena kroz vrijeme).
 */
import type { Availability, PriceTrend } from "~/data/phones";
import { OPERATOR_GADGETS, OPERATOR_SELLERS } from "~/data/gadgetsOperators";
import {
  normalizeSpecs,
  type GadgetCategory,
  type SpecValue,
} from "~/lib/gadgetSpecs";

export type { GadgetCategory } from "~/lib/gadgetSpecs";

/** Dostupnost kod prodavca + "Provjeri kod prodavca" kada je nepoznata */
export type GadgetAvailability =
  | Availability
  | "Provjeri kod prodavca";

export interface GadgetSeller {
  /** Naziv prodavca / izvora ponude */
  name: string;
  /** Cijena u KM; za `demo: true` ponude to je DEMO cijena */
  priceKM: number;
  availability: GadgetAvailability;
  buyUrl: string;
  /** true = cijena je demo (nije preuzeta iz shopa) */
  demo?: boolean;
  /** Kratka oznaka verzije/boje koju shop navodi (npr. "40 mm, Starlight") */
  variant?: string;
}

export interface Gadget {
  slug: string;
  name: string;
  /** Brend kao što ga kupac prepoznaje (koristi se i za cross-selling) */
  brand: string;
  category: GadgetCategory;
  /**
   * Prava fotografija proizvoda (public/images/gadgets/<slug>.jpg), iz
   * og:image stranice proizvoda u BH shopu (izvor u SOURCES.md). Kada polja
   * nema, UI prikazuje ikonicu kategorije — nikad lažni CSS telefon.
   */
  image?: string;
  /** Odakle je slika (shop + URL) */
  imageSource?: string;
  tagline: string;
  /** Sirovi tekstovi specifikacija iz izvora */
  rawSpecs: Record<string, string>;
  /** Normalizovane specifikacije (parsirane iz rawSpecs) */
  specs: Record<string, SpecValue>;
  sellers: GadgetSeller[];
  priceTrend: PriceTrend;
  trendPercent: number;
}

/** Datum skrejpa gadžeta (snapshot cijena) — dijeli ga GadgetNote */
export const GADGET_SCRAPE_DATE = "2026-09-16";

type RawGadget = Omit<Gadget, "specs">;

const RAW: RawGadget[] = [
  /* ---------------- Pametni satovi ---------------- */
  {
    slug: "apple-watch-se-3",
    name: "Apple Watch SE 3 (GPS)",
    brand: "Apple",
    category: "pametni_satovi",
    image: "/images/gadgets/apple-watch-se-3.jpg",
    imageSource: "fonTELe — stranica proizvoda (Apple Watch SE 3 GPS 40mm)",
    tagline:
      "Najpovoljniji Apple sat — zdravlje, treninzi i Apple Pay uz iPhone.",
    rawSpecs: {
      batteryLife: "do 18 sati uz standardnu upotrebu",
      compatibility: "iOS",
      waterResistance: "5 ATM (vodootporan do 50 m)",
      gps: "GPS",
      display: "Retina Always-On OLED, 324 × 394 px, 1000 nita",
      size: "40 / 44 mm",
      caseMaterial: "Aluminij (Ion-X staklo)",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 528,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/apple-watch-se-3-40mm-starlightstarlight-sm/7941",
        variant: "40 mm, Starlight, S/M",
      },
      {
        name: "IQ Mobile",
        priceKM: 589,
        availability: "Provjeri kod prodavca",
        buyUrl: "https://iqmobile.ba/shop/satovi/apple-watch-se-3-gps/",
        variant: "GPS, 40 mm",
      },
      {
        name: "fonTELe",
        priceKM: 594,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/apple-watch-se-3-44mm-starlightstarlight-sm/7937",
        variant: "44 mm, Starlight, S/M",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "apple-watch-series-11",
    name: "Apple Watch Series 11 (GPS)",
    brand: "Apple",
    category: "pametni_satovi",
    image: "/images/gadgets/apple-watch-series-11.jpg",
    imageSource:
      "fonTELe — stranica proizvoda (Apple Watch Series 11 GPS 42mm)",
    tagline:
      "Always-On Retina OLED do 2000 nita i baterija do 24 h — nova generacija.",
    rawSpecs: {
      batteryLife: "do 24 h normalne upotrebe, do 38 h u Low Power režimu",
      compatibility: "iOS",
      waterResistance: "5 ATM (vodootporan do 50 m)",
      gps: "GPS, GLONASS, Galileo, QZSS, BeiDou",
      display: "Always-On Retina OLED, 374 × 446 px, 2000 nita",
      size: "42 / 46 mm",
      caseMaterial: "Aluminij",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 887,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/apple-watch-series-11-42mm-rose-goldlight-blush-sm/7954",
        variant: "42 mm, Rose Gold, S/M",
      },
      {
        name: "fonTELe",
        priceKM: 943,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/apple-watch-series-11-46mm-jet-blackblack-ml/7946",
        variant: "46 mm, Jet Black, M/L",
      },
      {
        name: "IQ Mobile",
        priceKM: 979,
        availability: "Provjeri kod prodavca",
        buyUrl: "https://iqmobile.ba/shop/satovi/apple-watch-s11-gps/",
        variant: "GPS",
      },
      {
        name: "Mobitech",
        priceKM: 1000,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/pametni-satovi/satovi-apple/apple-watch-series-11-46-mm-jet-black-sb-s-m-gps/",
        variant: "46 mm, Jet Black, S/M",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "samsung-galaxy-watch8-classic",
    name: "Samsung Galaxy Watch8 Classic (46 mm, BT)",
    brand: "Samsung",
    category: "pametni_satovi",
    image: "/images/gadgets/samsung-galaxy-watch8-classic.jpg",
    imageSource:
      "Univerzalno — stranica proizvoda (Samsung Galaxy Watch8 Classic 46mm BT Black)",
    tagline:
      "Klasik dizajn s rotirajućim prstenom, Super AMOLED i 5 ATM otpornost.",
    rawSpecs: {
      waterResistance: "5 ATM",
      bluetooth: "Bluetooth 5.3",
      gps: "Ugrađeni GPS i satelitski sistemi",
      display: '1,34" Super AMOLED (480 × 336 px, 2000 nita, 60 Hz)',
      size: "46 mm",
      capacityMah: "445 mAh",
    },
    sellers: [
      {
        name: "Univerzalno",
        priceKM: 639,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://www.univerzalno.com/bs/samsung-galaxy-watch8-classic-46mm-bt-black",
        variant: "46 mm BT, crni",
      },
      {
        name: "Univerzalno",
        priceKM: 639,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://www.univerzalno.com/bs/samsung-galaxy-watch8-classic-46mm-bt-white-56234",
        variant: "46 mm BT, bijeli",
      },
      {
        name: "fonTELe",
        priceKM: 639,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/samsung-pametni-sat-galaxy-watch-8-classic-bt-crni/7675",
        variant: "BT, crni",
      },
    ],
    priceTrend: "pad",
    trendPercent: 4,
  },
  {
    slug: "samsung-galaxy-watch9",
    name: "Samsung Galaxy Watch9 (BT)",
    brand: "Samsung",
    category: "pametni_satovi",
    image: "/images/gadgets/samsung-galaxy-watch9.jpg",
    imageSource:
      "Mobitech — stranica proizvoda (Samsung Galaxy Watch 9 40mm BT Graphite)",
    tagline:
      "Wear OS sat s do 40 sati baterije, GPS-om i 32 GB memorije.",
    rawSpecs: {
      batteryLife: "do 40 sati bez Always-On ekrana (do 30 sati sa AOD)",
      waterResistance: "5 ATM",
      bluetooth: "Bluetooth 6.0",
      gps: "GPS, GLONASS, Galileo, BeiDou, QZSS",
      display: '1,3" Super AMOLED, 438 × 438 px',
      size: "40 / 44 mm",
      capacityMah: "390 mAh",
    },
    sellers: [
      {
        name: "Mobitech",
        priceKM: 750,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/pametni-satovi/satovi-samsung/samsung-galaxy-watch-9-40mm-bt-sm-l340-graphite/",
        variant: "40 mm, Graphite",
      },
      {
        name: "Mobitech",
        priceKM: 800,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/pametni-satovi/satovi-samsung/samsung-galaxy-watch-9-44mm-bt-sm-l350-graphite/",
        variant: "44 mm, Graphite",
      },
      {
        name: "Mobitech",
        priceKM: 800,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/pametni-satovi/satovi-samsung/samsung-galaxy-watch-9-44mm-bt-sm-l350-silver/",
        variant: "44 mm, Silver",
      },
      {
        name: "fonTELe",
        priceKM: 799.2,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/samsung-galaxy-watch9-40mm-bt-graphite/9212",
        variant: "40 mm, Graphite",
      },
      {
        name: "fonTELe",
        priceKM: 849.6,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/samsung-galaxy-watch9-44mm-bt-graphite/9215",
        variant: "44 mm, Graphite",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "xiaomi-redmi-watch-5-active",
    name: "Xiaomi Redmi Watch 5 Active",
    brand: "Xiaomi",
    category: "pametni_satovi",
    image: "/images/gadgets/xiaomi-redmi-watch-5-active.jpg",
    imageSource:
      "Mobitech — stranica proizvoda (Xiaomi Redmi Watch 5 Active Midnight Black)",
    tagline:
      'Veleprodajni hit: 2,0" ekran i do 20 dana baterije za ispod 80 KM.',
    rawSpecs: {
      batteryLife: "do 20 dana (do 18 dana uz tipične aktivnosti)",
      display: '2,0"',
      capacityMah: "470 mAh",
      charging: "Magnetsko punjenje",
    },
    sellers: [
      {
        name: "Mobitech",
        priceKM: 75,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/pametni-satovi/satovi-xiaomi/xiaomi-redmi-watch-5-active-midnight-black/",
        variant: "Midnight Black",
      },
      {
        name: "Univerzalno",
        priceKM: 75,
        availability: "Provjeri kod prodavca",
        buyUrl: "https://www.univerzalno.com/bs/redmi-watch-5-active-silver",
        variant: "Silver",
      },
      {
        name: "fonTELe",
        priceKM: 79,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/xiaomi-pametni-sat-redmi-watch-5-active-crni/6558",
        variant: "Crni",
      },
    ],
    priceTrend: "pad",
    trendPercent: 6,
  },
  {
    slug: "honor-choice-watch-2i",
    name: "Honor Choice InfoWear Watch 2i",
    brand: "Honor",
    category: "pametni_satovi",
    image: "/images/gadgets/honor-choice-watch-2i.jpg",
    imageSource: "IQ Mobile — stranica proizvoda (Honor Choice InfoWear Watch 2i)",
    tagline:
      '1,85" AMOLED, IP68 i do 14 dana baterije — uz Honor telefone.',
    rawSpecs: {
      batteryLife: "Do 14 dana tipičnog korištenja",
      compatibility: "Android i iOS",
      waterResistance: "IP68 i 1 ATM",
      display: '1,85" AMOLED, 390 × 450 px',
      capacityMah: "330 mAh",
      charging: "Magnetsko punjenje",
    },
    sellers: [
      {
        name: "Honor (demo ponuda)",
        priceKM: 129,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://iqmobile.ba/shop/satovi/honor-choice-infowear-watch-2i/",
        demo: true,
        variant: "Black (shop trenutno bez cijene)",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },

  /* ---------------- Bežične slušalice ---------------- */
  {
    slug: "apple-airpods-pro-3",
    name: "Apple AirPods Pro 3 (MagSafe, USB-C)",
    brand: "Apple",
    category: "bezbicne_slusalice",
    image: "/images/gadgets/apple-airpods-pro-3.jpg",
    imageSource:
      "IQ Mobile — stranica proizvoda (Apple AirPods Pro3 with MagSafe Case)",
    tagline:
      "ANC, IP57 i mjerenje pulsa — do 8 h rada, do 24 h s kutijicom.",
    rawSpecs: {
      anc: "Active Noise Cancellation",
      batteryBuds: "do 8 h s ANC",
      batteryWithCase: "do 24 h s ANC",
      bluetooth: "Bluetooth 5.3",
      waterResistance: "IP57 (slušalice i kućište)",
      charging: "MagSafe, Qi, USB-C i Apple Watch punjač",
      fit: "In-ear (nastavci XXS–L)",
    },
    sellers: [
      {
        name: "IQ Mobile",
        priceKM: 569,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://iqmobile.ba/shop/slusalice/apple-airpods-pro3-with-magsafe-case-usb-c/",
        variant: "USB-C, MagSafe kućište",
      },
      {
        name: "Mobitech",
        priceKM: 670,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/dodatna-oprema/slusalice/apple-airpods-pro3-with-magsafe-case-usb-c-2025/",
        variant: "2025, MagSafe",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "apple-airpods-4",
    name: "Apple AirPods 4 (ANC, USB-C)",
    brand: "Apple",
    category: "bezbicne_slusalice",
    image: "/images/gadgets/apple-airpods-4.jpg",
    imageSource:
      "IQ Mobile — stranica proizvoda (Apple AirPods 4 USB-C with Active Noise Cancellation)",
    tagline:
      "AirPods 4 s aktivnim poništavanjem buke, IP54 i Apple H2 čipom.",
    rawSpecs: {
      anc: "Active Noise Cancellation",
      batteryBuds: "do 4 h s ANC",
      batteryWithCase: "do 20 h s ANC",
      bluetooth: "Bluetooth 5.3",
      waterResistance: "IP54 (slušalice i kućište)",
      charging: "USB-C kućište, Qi i Apple Watch punjač",
      fit: "In-ear (open-fit)",
    },
    sellers: [
      {
        name: "IQ Mobile",
        priceKM: 460,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://iqmobile.ba/shop/slusalice/apple-airpods-4-usb-c-with-active-noise-cancellation/",
        variant: "USB-C, ANC",
      },
    ],
    priceTrend: "pad",
    trendPercent: 3,
  },
  {
    slug: "samsung-galaxy-buds-4",
    name: "Samsung Galaxy Buds 4",
    brand: "Samsung",
    category: "bezbicne_slusalice",
    image: "/images/gadgets/samsung-galaxy-buds-4.jpg",
    imageSource:
      "fonTELe — stranica proizvoda (Samsung Galaxy Buds4 Bijela)",
    tagline:
      "Bluetooth 6.1, ANC i do 30 h s kutijicom — uz Galaxy telefone.",
    rawSpecs: {
      anc: "ANC (aktivno poništavanje buke)",
      batteryBuds: "do 6 h bez ANC",
      batteryWithCase: "ukupno do 30 h",
      bluetooth: "Bluetooth 6.1 (LE Audio Ready)",
      waterResistance: "IP54",
      charging: "USB-C",
      fit: "In-ear",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 349,
        availability: "Provjeri kod prodavca",
        buyUrl: "https://fontele.ba/proizvod/samsung-galaxy-buds-4-bijela/8617",
        variant: "Bijela",
      },
      {
        name: "fonTELe",
        priceKM: 349,
        availability: "Provjeri kod prodavca",
        buyUrl: "https://fontele.ba/proizvod/samsung-galaxy-buds-4-crna/8616",
        variant: "Crna",
      },
    ],
    priceTrend: "pad",
    trendPercent: 5,
  },
  {
    slug: "xiaomi-redmi-buds-6",
    name: "Xiaomi Redmi Buds 6",
    brand: "Xiaomi",
    category: "bezbicne_slusalice",
    image: "/images/gadgets/xiaomi-redmi-buds-6.jpg",
    imageSource:
      "Mobitech — stranica proizvoda (Slušalice Redmi Buds 6 Cloud White)",
    tagline: "ANC do 49 dB, Bluetooth 5.4 i do 42 h s kutijicom.",
    rawSpecs: {
      anc: "aktivno poništavanje buke do 49 dB",
      batteryBuds: "do 10 sati",
      batteryWithCase: "do 42 sata",
      bluetooth: "Bluetooth 5.4",
      waterResistance: "IP54",
      charging: "USB-C, brzo punjenje (10 min = 4 h slušanja)",
      fit: "In-ear",
    },
    sellers: [
      {
        name: "Mobitech",
        priceKM: 130,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/dodatna-oprema/slusalice/slusalice-redmi-buds-6-cloud-white/",
        variant: "Cloud White",
      },
      {
        name: "Mobitech",
        priceKM: 130,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/dodatna-oprema/slusalice/slusalice-redmi-buds-6-coral-green/",
        variant: "Coral Green",
      },
      {
        name: "Mobitech",
        priceKM: 130,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/dodatna-oprema/slusalice/slusalice-redmi-buds-6-night-black/",
        variant: "Night Black",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "xiaomi-redmi-buds-6-play",
    name: "Xiaomi Redmi Buds 6 Play",
    brand: "Xiaomi",
    category: "bezbicne_slusalice",
    image: "/images/gadgets/xiaomi-redmi-buds-6-play.jpg",
    imageSource:
      "fonTELe — stranica proizvoda (Xiaomi bežične slušalice Redmi Buds 6 Play, Crne)",
    tagline:
      "Najpovoljnije prave TWS slušalice u katalogu — do 36 h s kutijicom.",
    rawSpecs: {
      anc: "Ne — model nema ANC",
      batteryBuds: "do 7,5 sati",
      batteryWithCase: "ukupno do 36 sati",
      bluetooth: "Bluetooth 5.4",
      charging: "USB-C (oko 60 min)",
      fit: "In-ear",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 45,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/xiaomi-bezicne-slusalice-redmi-buds-6-play-crne/7359",
        variant: "Crne",
      },
      {
        name: "Mobitech",
        priceKM: 50,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/dodatna-oprema/slusalice/slusalice-redmi-buds-6-play-black/",
        variant: "Black",
      },
      {
        name: "Mobitech",
        priceKM: 50,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/dodatna-oprema/slusalice/slusalice-redmi-buds-6-play-blue/",
        variant: "Blue",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "anker-soundcore-aerofit",
    name: "Anker Soundcore AeroFit",
    brand: "Anker",
    category: "bezbicne_slusalice",
    image: "/images/gadgets/anker-soundcore-aerofit.jpg",
    imageSource:
      "Univerzalno — stranica proizvoda (Anker Soundcore AeroFit Black)",
    tagline:
      "Open-ear slušalice za trčanje — do 11 h rada, do 42 h s kutijicom.",
    rawSpecs: {
      anc: "Ne — open-ear dizajn bez ANC",
      batteryBuds: "do 11 h",
      batteryWithCase: "do 42 h",
      fit: "Open-ear (kuka za uho)",
    },
    sellers: [
      {
        name: "Univerzalno",
        priceKM: 129,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://www.univerzalno.com/bs/anker-soundcore-bluetooth-earphones-aerofit-black",
        variant: "Black",
      },
      {
        name: "Univerzalno",
        priceKM: 129,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://www.univerzalno.com/bs/anker-soundcore-bluetooth-earphones-aerofit-grayblue",
        variant: "Gray/Blue",
      },
      {
        name: "Univerzalno",
        priceKM: 129,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://www.univerzalno.com/bs/anker-soundcore-bluetooth-earphones-aerofit-white",
        variant: "White",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },

  /* ---------------- Ostala oprema (narukvice, power bankovi, punjači) --- */
  {
    slug: "xiaomi-smart-band-10",
    name: "Xiaomi Smart Band 10",
    brand: "Xiaomi",
    category: "ostala_oprema",
    image: "/images/gadgets/xiaomi-smart-band-10.jpg",
    imageSource:
      "IQ Mobile — stranica proizvoda (Xiaomi Smart Band 10 Midnight Black)",
    tagline:
      '1,72" AMOLED, do 21 dan baterije i 150+ sportskih načina rada.',
    rawSpecs: {
      batteryLife: "Do 21 dan tipičnog korištenja",
      waterResistance: "5 ATM",
      bluetooth: "Bluetooth 5.4",
      compatibility: "Android 8.0 i noviji, iOS 14.0 i noviji",
      capacityMah: "233 mAh Li-Po",
      display: '1,72" AMOLED, 60 Hz',
    },
    sellers: [
      {
        name: "IQ Mobile",
        priceKM: 99,
        availability: "Provjeri kod prodavca",
        buyUrl: "https://iqmobile.ba/shop/satovi/xiaomi-smart-band-10/",
        variant: "Midnight Black",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "xiaomi-power-bank-20000",
    name: "Xiaomi Power Bank 20.000 mAh (33 W)",
    brand: "Xiaomi",
    category: "ostala_oprema",
    image: "/images/gadgets/xiaomi-power-bank-20000.jpg",
    imageSource:
      "fonTELe — stranica proizvoda (XIAOMI powerbank 33W integrisan kabal 20000mAh Plavi)",
    tagline: "20.000 mAh i 33 W uz integrisani USB-C kabl.",
    rawSpecs: {
      capacityMah: "20.000 mAh",
      outputW: "33 W",
      compatibility: "Android/iOS uređaji, tableti, slušalice, pametni satovi",
      charging: "USB-C (integrisani kabl)",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 69,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/xiaomi-powerbank-33w-integrisan-kabal-20000mah-plavi/7130",
        variant: "Plavi, 33 W",
      },
      {
        name: "fonTELe",
        priceKM: 69,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/xiaomi-powerbank-18w-integrisan-kabal-20000mah-siva/8858",
        variant: "Siva, 18 W",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "anker-power-bank-20k-30w",
    name: "Anker Power Bank 20.000 mAh (30 W)",
    brand: "Anker",
    category: "ostala_oprema",
    image: "/images/gadgets/anker-power-bank-20k-30w.jpg",
    imageSource:
      "fonTELe — stranica proizvoda (ANKER Power Bank (20K, 30W) Crna)",
    tagline: "20.000 mAh i 30 W — pouzdan power bank za putovanja.",
    rawSpecs: {
      capacityMah: "20.000 mAh",
      outputW: "30 W",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 75,
        availability: "Provjeri kod prodavca",
        buyUrl: "https://fontele.ba/proizvod/anker-power-bank-20k-30w-crna/9095",
        variant: "Crna",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "canyon-powerbank-16000",
    name: "Canyon Powerbank 16.000 mAh",
    brand: "Canyon",
    category: "ostala_oprema",
    image: "/images/gadgets/canyon-powerbank-16000.jpg",
    imageSource:
      "fonTELe — stranica proizvoda (CANYON Powerbank 16000 mAh Sivi)",
    tagline: "16.000 mAh — najpovoljniji veliki power bank u katalogu.",
    rawSpecs: {
      capacityMah: "16.000 mAh",
      charging: "USB-A i USB-C",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 65,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/canyon-powerbank-16000-mah-sivi/7265",
        variant: "Sivi",
      },
    ],
    priceTrend: "pad",
    trendPercent: 7,
  },
  {
    slug: "samsung-power-bank-10000",
    name: "Samsung Power Bank 10.000 mAh (25 W)",
    brand: "Samsung",
    category: "ostala_oprema",
    image: "/images/gadgets/samsung-powerbank-10000.jpg",
    imageSource:
      "fonTELe — stranica proizvoda (SAMSUNG powerbank 10.000 mAh 25W Bež)",
    tagline: "Originalni Samsung power bank s dva USB-C porta i 25 W punjenjem.",
    rawSpecs: {
      capacityMah: "10.000 mAh",
      outputW: "25 W",
      ports: "2 × USB-C",
    },
    sellers: [
      {
        name: "fonTELe",
        priceKM: 99,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://fontele.ba/proizvod/samsung-powerbank-10000-mah-25w-bez/2951",
        variant: "Bež",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
  {
    slug: "honor-punjac-100w",
    name: "Honor punjač 100 W",
    brand: "Honor",
    category: "ostala_oprema",
    image: "/images/gadgets/honor-punjac-100w.jpg",
    imageSource:
      "Mobitech — stranica proizvoda (Honor punjač 100W)",
    tagline: "Brzi Honor punjač od 100 W — telefoni, tableti i laptopi.",
    rawSpecs: {
      outputW: "100 W",
    },
    sellers: [
      {
        name: "Mobitech",
        priceKM: 89,
        availability: "Provjeri kod prodavca",
        buyUrl:
          "https://mobitech.ba/prodavnica/dodatna-oprema/punjaci/honor-punjac-100w/",
      },
    ],
    priceTrend: "stabilno",
    trendPercent: 0,
  },
];

/**
 * Katalog gadžeta sa normalizovanim specifikacijama.
 *
 * U RAW se dodaju gadžeti iz ponude OPERATORA (GADŽETI 3B, vidi
 * `gadgetsOperators.ts`), a postojećim gadžetima se pripisuju operator ponude
 * (npr. Apple Watch SE 3 dobija i ponudu BH Telecoma — stvarna cijena bez
 * ugovora, `demo` se ne postavlja).
 */
export const gadgets: Gadget[] = [...RAW, ...OPERATOR_GADGETS].map((g) => ({
  ...g,
  sellers: [...g.sellers, ...(OPERATOR_SELLERS[g.slug] ?? [])],
  specs: normalizeSpecs(g.category, g.rawSpecs),
}));

/* ------------------------------------------------------------------ */
/* Selektori                                                           */
/* ------------------------------------------------------------------ */

export function getGadget(slug: string): Gadget | undefined {
  return gadgets.find((g) => g.slug === slug);
}

export function gadgetsByCategory(category: GadgetCategory): Gadget[] {
  return gadgets.filter((g) => g.category === category);
}

/** Ponude sortirane rastuće po cijeni */
export function sortedGadgetSellers(gadget: Gadget): GadgetSeller[] {
  return [...gadget.sellers].sort((a, b) => a.priceKM - b.priceKM);
}

/** Najniža cijena gadžeta (stvarna ili demo — vidi `hasRealGadgetPrice`) */
export function minGadgetPrice(gadget: Gadget): number {
  return gadget.sellers.reduce(
    (min, s) => (s.priceKM < min ? s.priceKM : min),
    gadget.sellers[0]?.priceKM ?? 0,
  );
}

/** Da li gadžet ima ijednu STVARNU (shop) cijenu */
export function hasRealGadgetPrice(gadget: Gadget): boolean {
  return gadget.sellers.some((s) => !s.demo);
}

/** Broj stvarnih ponuda (bez demo) */
export function realOfferCount(gadget: Gadget): number {
  return gadget.sellers.filter((s) => !s.demo).length;
}

/** Svi brendovi u katalogu gadžeta (za cross-selling i filtere) */
export const GADGET_BRANDS: string[] = [
  ...new Set(gadgets.map((g) => g.brand)),
].sort((a, b) => a.localeCompare(b, "bs"));
