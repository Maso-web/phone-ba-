/**
 * phone.ba — katalog telefona (DEMO / SEED podaci za lansiranje).
 *
 * Ovi podaci su namjerno strukturirani tako da ih Faza 2 (AI chatbot,
 * smart insights, trend grafikon, sponzorisane ponude) može direktno
 * koristiti bez izmjena šeme:
 *  - svaki telefon ima priceTrend + trendPercent (za insights/grafikon)
 *  - svaki prodavač ima buyUrl (za "Kupi" dugme i partner integraciju)
 *  - sellers su običan niz (za sponzorisane/listane ponude u Fazi 2)
 *  - priceBand omogućava filtere po budžetu
 *
 * VAŽNO: cijene su realistične, ali NEVERIFICIRANE demo vrijednosti.
 * Živa agregacija i provjera cijena dolaze nakon lansiranja.
 *
 * Faza 2A: svakom telefonu se dodaje priceHistory (6 mjeseci) preko
 * makeHistory() — posljednja tačka uvijek jednaka trenutnoj najnižoj ponudi.
 */

export type Brand =
  | "Apple"
  | "Samsung"
  | "Xiaomi"
  | "Honor"
  | "Motorola"
  | "Realme"
  | "OnePlus"
  | "Google";
export type BrandSlug =
  | "apple"
  | "samsung"
  | "xiaomi"
  | "honor"
  | "motorola"
  | "realme"
  | "oneplus"
  | "google";

/** Ključne funkcije / atributi telefona */
export type AttributeTag =
  | "najbolja_kamera"
  | "najbolja_baterija"
  | "najbolji_gaming"
  | "budzet";

/** Cjenovni razredi (na osnovu najpovoljnije ponude) */
export type PriceBand = "ispod_400" | "400_800" | "premium";

/** Trend cijene */
export type PriceTrend = "pad" | "stabilno" | "rast";

/** Dostupnost kod prodavača */
export type Availability = "Na stanju" | "Naruči" | "Rasprodato";

export interface Seller {
  id: string;
  /** Puni naziv prodavača, npr. "BH Telecom d.d. Sarajevo" */
  name: string;
  /** Kratki naziv za logo, npr. "BH Telecom" */
  logoText: string;
  /** Inicijali za avatar (npr. "BH") */
  initials: string;
  priceKM: number;
  availability: Availability;
  buyUrl: string;
}

export interface Phone {
  slug: string;
  brand: Brand;
  brandSlug: BrandSlug;
  name: string;
  /**
   * Stvarna, lokalna fotografija tog modela (public/images/<slug>.jpg).
   * Postoji samo kada imamo pravu fotografiju modela; kada polje nema,
   * PhoneVisual prikazuje CSS mockup kao privremeni fallback.
   */
  image?: string;
  /** Kratki opis u Bosanskom */
  tagline: string;
  /** Ključne specifikacije — jednostruki stringovi sa Bosanskim oznakama */
  specs: {
    storage: string;
    ram: string;
    battery: string;
    display: string;
    camera: string;
    chipset: string;
  };
  /** Jedan ili više atributa (kamera, baterija, gaming, budžet) */
  tags: AttributeTag[];
  priceBand: PriceBand;
  priceTrend: PriceTrend;
  /** Procentualna promjena cijene u odnosu na prošli period (negativno = pad) */
  trendPercent: number;
  /** Popularnost 1–100 (za sort "Najpopularniji") */
  popularity: number;
  sellers: Seller[];
  /**
   * Historija cijena (KM) za posljednjih 6 mjeseci — tačno 6 vrijednosti.
   * Posljednja tačka je UVJEK jednaka trenutnoj najnižoj ponudi
   * (minPriceOf), a ranije tačke prate smjer priceTrend-a.
   */
  priceHistory: number[];
}

/* ------------------------------------------------------------------ */
/* Prodavači (telekomi + lokalne trgovine)                             */
/* ------------------------------------------------------------------ */

type SellerId =
  | "bhtelecom"
  | "hteronet"
  | "mtel"
  | "tehnomarket"
  | "ananas"
  | "emmezeta"
  | "sicko";

const SELLER_POOL: Record<
  SellerId,
  {
    name: string;
    logoText: string;
    initials: string;
    url: string;
    /** Fiksni odmak od bazne cijene (KM) — mali, realističan raspon */
    delta: number;
    availability: Availability;
  }
> = {
  bhtelecom: {
    name: "BH Telecom d.d. Sarajevo",
    logoText: "BH Telecom",
    initials: "BH",
    url: "https://www.bhtelecom.ba/telefoni",
    delta: 0,
    availability: "Na stanju",
  },
  hteronet: {
    name: "HT Eronet d.d. Mostar",
    logoText: "HT Eronet",
    initials: "HT",
    url: "https://www.hteronet.ba/telefoni",
    delta: 12,
    availability: "Naruči",
  },
  mtel: {
    name: "m:tel a.d. Banja Luka",
    logoText: "m:tel",
    initials: "m:",
    url: "https://www.mtel.ba/telefoni",
    delta: 6,
    availability: "Naruči",
  },
  tehnomarket: {
    name: "TehnoMarket.ba",
    logoText: "TehnoMarket",
    initials: "TM",
    url: "https://www.tehnomarket.ba/telefoni",
    delta: -15,
    availability: "Na stanju",
  },
  ananas: {
    name: "Ananas.ba",
    logoText: "Ananas",
    initials: "AN",
    url: "https://www.ananas.ba/telefoni",
    delta: -8,
    availability: "Na stanju",
  },
  emmezeta: {
    name: "EmmeZeta.ba",
    logoText: "EmmeZeta",
    initials: "EZ",
    url: "https://www.emmezeta.ba/telefoni",
    delta: 29,
    availability: "Naruči",
  },
  sicko: {
    name: "Šićko.ba",
    logoText: "Šićko",
    initials: "ŠK",
    url: "https://www.sicko.ba/telefoni",
    delta: 37,
    availability: "Rasprodato",
  },
};

/**
 * Generiše listu prodavača za telefon.
 * @param basePrice referentna (srednja) cijena u KM — od nje se računaju sve ponude
 * @param ids koje prodavače uključiti (4–6 po telefonu)
 * @param overrides opcionalno presretanje dostupnosti po prodavaču
 */
function sellersFor(
  basePrice: number,
  ids: SellerId[],
  overrides: Partial<Record<SellerId, Availability>> = {},
): Seller[] {
  return ids.map((id) => {
    const def = SELLER_POOL[id];
    return {
      id,
      name: def.name,
      logoText: def.logoText,
      initials: def.initials,
      priceKM: basePrice + def.delta,
      availability: overrides[id] ?? def.availability,
      buyUrl: def.url,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Telefoni — 46 modela, 8 brendova, relevantni za BiH tržište           */
/* ------------------------------------------------------------------ */

const RAW_PHONES: Omit<Phone, "priceHistory">[] = [
  /* ------------------------------ APPLE ------------------------------ */
  {
    slug: "iphone-15-pro",
    image: "/images/iphone-15-pro.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 15 Pro",
    tagline: "Pro kamera i performanse bez kompromisa.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "3274 mAh",
      display: '6,1" OLED 120 Hz',
      camera: "48 MP + 12 MP + 12 MP",
      chipset: "A17 Pro",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "premium",
    priceTrend: "rast",
    trendPercent: 4,
    popularity: 92,
    sellers: sellersFor(2564, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },
  {
    slug: "iphone-15",
    image: "/images/iphone-15.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 15",
    tagline: "Najtraženiji iPhone sa Dynamic Island ekranom.",
    specs: {
      storage: "128 GB",
      ram: "6 GB",
      battery: "3349 mAh",
      display: '6,1" OLED',
      camera: "48 MP + 12 MP",
      chipset: "A16 Bionic",
    },
    tags: ["najbolja_kamera"],
    priceBand: "premium",
    priceTrend: "stabilno",
    trendPercent: -1,
    popularity: 98,
    sellers: sellersFor(1994, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },
  {
    slug: "iphone-14",
    image: "/images/iphone-14.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 14",
    tagline: "Provjeren flagship koji i dalje vrijedi svake marke.",
    specs: {
      storage: "128 GB",
      ram: "6 GB",
      battery: "3279 mAh",
      display: '6,1" OLED',
      camera: "12 MP + 12 MP",
      chipset: "A15 Bionic",
    },
    tags: ["najbolja_kamera"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -7,
    popularity: 89,
    sellers: sellersFor(1464, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
    ]),
  },
  {
    slug: "iphone-13",
    image: "/images/iphone-13.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 13",
    tagline: "Klasični iPhone po najpovoljnijoj cijeni.",
    specs: {
      storage: "128 GB",
      ram: "4 GB",
      battery: "3240 mAh",
      display: '6,1" OLED',
      camera: "12 MP + 12 MP",
      chipset: "A15 Bionic",
    },
    tags: ["najbolja_kamera", "budzet"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -9,
    popularity: 81,
    sellers: sellersFor(1064, [
      "bhtelecom",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },

  /* ----------------------------- SAMSUNG ----------------------------- */
  {
    slug: "samsung-galaxy-s24",
    image: "/images/samsung-galaxy-s24.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy S24",
    tagline: "Kompaktni flagship sa AI funkcijama.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "4000 mAh",
      display: '6,2" AMOLED 120 Hz',
      camera: "50 MP + 12 MP + 10 MP",
      chipset: "Exynos 2400",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "premium",
    priceTrend: "stabilno",
    trendPercent: -3,
    popularity: 94,
    sellers: sellersFor(1364, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },
  {
    slug: "samsung-galaxy-s23-fe",
    image: "/images/samsung-galaxy-s23-fe.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy S23 FE",
    tagline: "Flagship kamera po srednjoj cijeni.",
    specs: {
      storage: "128 GB",
      ram: "8 GB",
      battery: "4500 mAh",
      display: '6,4" AMOLED 120 Hz',
      camera: "50 MP + 12 MP + 8 MP",
      chipset: "Exynos 2200",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -8,
    popularity: 87,
    sellers: sellersFor(784, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
    ]),
  },
  {
    slug: "samsung-galaxy-a55",
    image: "/images/samsung-galaxy-a55.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy A55",
    tagline: "Svjež srednji rang sa odličnim ekranom i baterijom.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5000 mAh",
      display: '6,6" AMOLED 120 Hz',
      camera: "50 MP + 12 MP + 5 MP",
      chipset: "Exynos 1480",
    },
    tags: ["najbolja_kamera"],
    priceBand: "400_800",
    priceTrend: "stabilno",
    trendPercent: -2,
    popularity: 90,
    sellers: sellersFor(634, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },
  {
    slug: "samsung-galaxy-a54",
    image: "/images/samsung-galaxy-a54.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy A54",
    tagline: "Pouzdani srednji rang sa odličnom kamerom.",
    specs: {
      storage: "128 GB",
      ram: "8 GB",
      battery: "5000 mAh",
      display: '6,4" AMOLED 120 Hz',
      camera: "50 MP + 12 MP + 5 MP",
      chipset: "Exynos 1380",
    },
    tags: ["najbolja_kamera"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -5,
    popularity: 82,
    sellers: sellersFor(484, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
    ]),
  },

  /* ------------------------------ XIAOMI ----------------------------- */
  {
    slug: "xiaomi-14",
    image: "/images/xiaomi-14.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Xiaomi 14",
    tagline: "Leica kamera i vrhunske performanse u džepu.",
    specs: {
      storage: "256 GB",
      ram: "12 GB",
      battery: "4610 mAh",
      display: '6,36" AMOLED 120 Hz',
      camera: "50 MP + 50 MP + 50 MP",
      chipset: "Snapdragon 8 Gen 3",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "premium",
    priceTrend: "rast",
    trendPercent: 2,
    popularity: 85,
    sellers: sellersFor(1144, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },
  {
    slug: "xiaomi-redmi-note-13-pro",
    image: "/images/xiaomi-redmi-note-13-pro.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi Note 13 Pro",
    tagline: "Kamera od 200 MP u srednjem rangu.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5100 mAh",
      display: '6,67" AMOLED 120 Hz',
      camera: "200 MP + 8 MP + 2 MP",
      chipset: "Snapdragon 7s Gen 2",
    },
    tags: ["najbolja_kamera", "najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "stabilno",
    trendPercent: 1,
    popularity: 88,
    sellers: sellersFor(554, [
      "bhtelecom",
      "hteronet",
      "mtel",
      "tehnomarket",
      "ananas",
    ]),
  },
  {
    slug: "xiaomi-redmi-note-13",
    image: "/images/xiaomi-redmi-note-13.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi Note 13",
    tagline: "Najbolji omjer cijene i kvalitete.",
    specs: {
      storage: "128 GB",
      ram: "8 GB",
      battery: "5000 mAh",
      display: '6,67" AMOLED 120 Hz',
      camera: "108 MP + 8 MP + 2 MP",
      chipset: "Snapdragon 685",
    },
    tags: ["najbolja_baterija", "budzet"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -4,
    popularity: 80,
    sellers: sellersFor(344, [
      "bhtelecom",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },
  {
    slug: "xiaomi-redmi-13c",
    image: "/images/xiaomi-redmi-13c.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi 13C",
    tagline: "Najpovoljniji pametni telefon za svakodnevnicu.",
    specs: {
      storage: "128 GB",
      ram: "4 GB",
      battery: "5000 mAh",
      display: '6,74" LCD 90 Hz',
      camera: "50 MP + 2 MP",
      chipset: "Helio G85",
    },
    tags: ["budzet", "najbolja_baterija"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -6,
    popularity: 86,
    sellers: sellersFor(234, [
      "bhtelecom",
      "mtel",
      "tehnomarket",
      "ananas",
    ]),
  },
  {
    slug: "xiaomi-poco-x6",
    image: "/images/xiaomi-poco-x6.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Poco X6",
    tagline: "Gaming snaga po budžetskoj cijeni.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5100 mAh",
      display: '6,67" AMOLED 120 Hz',
      camera: "64 MP + 8 MP + 2 MP",
      chipset: "Snapdragon 7s Gen 2",
    },
    tags: ["najbolji_gaming", "budzet"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -5,
    popularity: 84,
    sellers: sellersFor(514, [
      "bhtelecom",
      "mtel",
      "tehnomarket",
      "ananas",
      "hteronet",
    ]),
  },

  /* ------------------------------ HONOR ------------------------------ */
  {
    slug: "honor-90",
    image: "/images/honor-90.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor 90",
    tagline: "Elegantan dizajn i kamera od 200 MP.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5000 mAh",
      display: '6,7" AMOLED 120 Hz',
      camera: "200 MP + 12 MP + 2 MP",
      chipset: "Snapdragon 7 Gen 1",
    },
    tags: ["najbolja_kamera"],
    priceBand: "400_800",
    priceTrend: "rast",
    trendPercent: 3,
    popularity: 78,
    sellers: sellersFor(674, [
      "bhtelecom",
      "mtel",
      "tehnomarket",
      "ananas",
      "emmezeta",
    ]),
  },
  {
    slug: "honor-x9b",
    image: "/images/honor-x9b.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor X9b",
    tagline: "Baterija koja traje dva dana.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5800 mAh",
      display: '6,78" AMOLED 120 Hz',
      camera: "108 MP + 5 MP + 2 MP",
      chipset: "Snapdragon 6 Gen 1",
    },
    tags: ["najbolja_baterija", "budzet"],
    priceBand: "400_800",
    priceTrend: "stabilno",
    trendPercent: 0,
    popularity: 83,
    sellers: sellersFor(464, [
      "bhtelecom",
      "mtel",
      "tehnomarket",
      "ananas",
      "hteronet",
    ]),
  },
  {
    slug: "honor-x8b",
    image: "/images/honor-x8b.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor X8b",
    tagline: "Lagan i tanak telefon sa velikim ekranom.",
    specs: {
      storage: "128 GB",
      ram: "8 GB",
      battery: "4500 mAh",
      display: '6,7" AMOLED 90 Hz',
      camera: "108 MP + 5 MP + 2 MP",
      chipset: "Snapdragon 680",
    },
    tags: ["budzet", "najbolja_baterija"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -3,
    popularity: 79,
    sellers: sellersFor(364, [
      "bhtelecom",
      "mtel",
      "tehnomarket",
      "ananas",
    ]),
  },
  /* --------- SHOPOVI 2B — novi modeli iz BH online shopova --------- */
  /*  Stvarne cijene ovih modela dolaze iz src/data/shop_prices.ts      */
  /*  (snapshot 15.9.2026.); sellers ispod su DEMO ponude kao i kod     */
  /*  ostalih modela — demo minimum prati stvarnu najnižu shop cijenu.  */
  /* ------------------------------ APPLE ------------------------------ */
  {
    slug: "iphone-17-pro",
    image: "/images/iphone-17-pro.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 17 Pro",
    tagline: "Pro kamera sa tri 48 MP senzora i A19 Pro čipom.",
    specs: {
      storage: "256 GB",
      ram: "12 GB",
      battery: "3988 mAh",
      display: "6,3\" LTPO OLED 120 Hz",
      camera: "48 MP + 48 MP + 48 MP",
      chipset: "A19 Pro",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -4,
    popularity: 97,
    sellers: sellersFor(2714, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas", "emmezeta"]),
  },
  {
    slug: "iphone-17",
    image: "/images/iphone-17.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 17",
    tagline: "Najnoviji iPhone sa 120 Hz ekranom i A19 čipom.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "3692 mAh",
      display: "6,3\" LTPO OLED 120 Hz",
      camera: "48 MP + 12 MP",
      chipset: "A19",
    },
    tags: ["najbolja_kamera"],
    priceBand: "premium",
    priceTrend: "stabilno",
    trendPercent: -2,
    popularity: 99,
    sellers: sellersFor(2040, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas", "emmezeta"]),
  },
  {
    slug: "iphone-16",
    image: "/images/iphone-16.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 16",
    tagline: "A18 čip i kamera od 48 MP po popularnoj cijeni.",
    specs: {
      storage: "128 GB",
      ram: "8 GB",
      battery: "3561 mAh",
      display: "6,1\" OLED",
      camera: "48 MP + 12 MP",
      chipset: "A18",
    },
    tags: ["najbolja_kamera"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -6,
    popularity: 94,
    sellers: sellersFor(1804, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "iphone-17e",
    image: "/images/iphone-17e.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone 17e",
    tagline: "Pristupačniji Apple model sa A19 čipom.",
    specs: {
      storage: "256 GB",
      ram: "—",
      battery: "—",
      display: "6,1\" OLED",
      camera: "48 MP",
      chipset: "A19",
    },
    tags: ["najbolja_kamera", "budzet"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -3,
    popularity: 85,
    sellers: sellersFor(1465, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "iphone-air",
    image: "/images/iphone-air.jpg",
    brand: "Apple",
    brandSlug: "apple",
    name: "iPhone Air",
    tagline: "Najtanji iPhone sa A19 Pro čipom.",
    specs: {
      storage: "256 GB",
      ram: "—",
      battery: "—",
      display: "6,5\" OLED 120 Hz",
      camera: "48 MP",
      chipset: "A19 Pro",
    },
    tags: ["najbolja_kamera"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -5,
    popularity: 88,
    sellers: sellersFor(2614, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  /* ------------------------------ SAMSUNG ------------------------------ */
  {
    slug: "samsung-galaxy-s26-ultra",
    image: "/images/samsung-galaxy-s26-ultra.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy S26 Ultra",
    tagline: "Vrhunski Galaxy sa 200 MP kamerom i S Pen olovkom.",
    specs: {
      storage: "256 GB",
      ram: "12 GB",
      battery: "5000 mAh",
      display: "6,9\" Dynamic AMOLED 2X 120 Hz",
      camera: "200 MP + 50 MP + 50 MP + 10 MP",
      chipset: "Snapdragon 8 Elite Gen 5",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "premium",
    priceTrend: "rast",
    trendPercent: 3,
    popularity: 95,
    sellers: sellersFor(2214, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas", "emmezeta"]),
  },
  {
    slug: "samsung-galaxy-s26",
    image: "/images/samsung-galaxy-s26.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy S26",
    tagline: "Kompaktni flagship sa Exynos 2600 čipom.",
    specs: {
      storage: "256 GB",
      ram: "12 GB",
      battery: "4300 mAh",
      display: "6,3\" Dynamic AMOLED 2X 120 Hz",
      camera: "50 MP + 12 MP + 10 MP",
      chipset: "Exynos 2600",
    },
    tags: ["najbolja_kamera"],
    priceBand: "premium",
    priceTrend: "stabilno",
    trendPercent: 1,
    popularity: 93,
    sellers: sellersFor(1814, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "samsung-galaxy-s25-ultra",
    image: "/images/samsung-galaxy-s25-ultra.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy S25 Ultra",
    tagline: "Prošlogodišnji vrhunski Galaxy — sada povoljnije.",
    specs: {
      storage: "256 GB",
      ram: "12 GB",
      battery: "5000 mAh",
      display: "6,9\" Dynamic AMOLED 2X 120 Hz",
      camera: "200 MP + 50 MP + 50 MP + 10 MP",
      chipset: "Snapdragon 8 Elite for Galaxy",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -8,
    popularity: 91,
    sellers: sellersFor(1814, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas", "emmezeta"]),
  },
  {
    slug: "samsung-galaxy-a57",
    image: "/images/samsung-galaxy-a57.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy A57",
    tagline: "Srednji rang sa Super AMOLED+ ekranom i 50 MP kamerom.",
    specs: {
      storage: "128 GB",
      ram: "8 GB",
      battery: "5000 mAh",
      display: "6,7\" Super AMOLED+ 120 Hz",
      camera: "50 MP + 12 MP",
      chipset: "Exynos 1680",
    },
    tags: ["najbolja_kamera", "najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -4,
    popularity: 84,
    sellers: sellersFor(774, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "samsung-galaxy-a37",
    image: "/images/samsung-galaxy-a37.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy A37",
    tagline: "Odličan ekran i kamera u srednjoj klasi.",
    specs: {
      storage: "128 GB",
      ram: "6 GB",
      battery: "5000 mAh",
      display: "6,7\" Super AMOLED 120 Hz",
      camera: "50 MP + 12 MP",
      chipset: "Exynos 1480",
    },
    tags: ["najbolja_kamera"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -6,
    popularity: 82,
    sellers: sellersFor(634, ["bhtelecom", "mtel", "tehnomarket", "ananas", "hteronet"]),
  },
  {
    slug: "samsung-galaxy-a27",
    image: "/images/samsung-galaxy-a27.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy A27",
    tagline: "Solidan srednji rang sa AMOLED ekranom.",
    specs: {
      storage: "128 GB",
      ram: "6 GB",
      battery: "5000 mAh",
      display: "6,7\" Super AMOLED 120 Hz",
      camera: "50 MP + 12 MP",
      chipset: "Snapdragon 6 Gen 3",
    },
    tags: ["najbolja_kamera", "budzet"],
    priceBand: "400_800",
    priceTrend: "stabilno",
    trendPercent: -1,
    popularity: 76,
    sellers: sellersFor(465, ["bhtelecom", "mtel", "tehnomarket", "ananas", "emmezeta"]),
  },
  {
    slug: "samsung-galaxy-a17",
    image: "/images/samsung-galaxy-a17.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy A17",
    tagline: "Povoljan Samsung sa velikom baterijom.",
    specs: {
      storage: "128 GB",
      ram: "4 GB",
      battery: "5000 mAh",
      display: "6,7\" Super AMOLED 90 Hz",
      camera: "50 MP + 13 MP",
      chipset: "Helio G99",
    },
    tags: ["budzet", "najbolja_baterija"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -3,
    popularity: 80,
    sellers: sellersFor(314, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "samsung-galaxy-a07",
    image: "/images/samsung-galaxy-a07.jpg",
    brand: "Samsung",
    brandSlug: "samsung",
    name: "Samsung Galaxy A07",
    tagline: "Najjeftiniji Samsung za svakodnevne potrebe.",
    specs: {
      storage: "128 GB",
      ram: "4 GB",
      battery: "5000 mAh",
      display: "6,7\" PLS LCD 90 Hz",
      camera: "50 MP + 8 MP",
      chipset: "Helio G99",
    },
    tags: ["budzet"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -2,
    popularity: 72,
    sellers: sellersFor(244, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  /* ------------------------------ XIAOMI ------------------------------ */
  {
    slug: "xiaomi-redmi-note-15",
    image: "/images/xiaomi-redmi-note-15.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi Note 15",
    tagline: "Veliki AMOLED i baterija od 6000 mAh po budžetskoj cijeni.",
    specs: {
      storage: "128 GB",
      ram: "6 GB",
      battery: "6000 mAh",
      display: "6,77\" AMOLED 120 Hz",
      camera: "108 MP + 20 MP",
      chipset: "Helio G100 Ultra",
    },
    tags: ["budzet", "najbolja_baterija"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -5,
    popularity: 90,
    sellers: sellersFor(355, ["bhtelecom", "mtel", "tehnomarket", "ananas", "hteronet"]),
  },
  {
    slug: "xiaomi-redmi-note-15-pro",
    image: "/images/xiaomi-redmi-note-15-pro.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi Note 15 Pro",
    tagline: "Kamera od 200 MP i baterija od 6500 mAh.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "6500 mAh",
      display: "6,77\" AMOLED 120 Hz",
      camera: "200 MP + 32 MP",
      chipset: "Helio G200 Ultra",
    },
    tags: ["najbolja_kamera", "najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -3,
    popularity: 87,
    sellers: sellersFor(574, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "xiaomi-redmi-note-14",
    image: "/images/xiaomi-redmi-note-14.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi Note 14",
    tagline: "Provjereni bestseller sa AMOLED ekranom.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5500 mAh",
      display: "6,67\" AMOLED 120 Hz",
      camera: "108 MP + 20 MP",
      chipset: "Helio G99 Ultra",
    },
    tags: ["najbolja_baterija", "budzet"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -7,
    popularity: 83,
    sellers: sellersFor(375, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "xiaomi-redmi-17",
    image: "/images/xiaomi-redmi-17.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi 17",
    tagline: "Baterija od 7500 mAh za dvodnevno korištenje.",
    specs: {
      storage: "128 GB",
      ram: "4 GB",
      battery: "7500 mAh",
      display: "6,9\" IPS LCD 120 Hz",
      camera: "50 MP + 8 MP",
      chipset: "Helio G91 Ultra",
    },
    tags: ["najbolja_baterija", "budzet"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -2,
    popularity: 78,
    sellers: sellersFor(364, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "xiaomi-redmi-15c",
    image: "/images/xiaomi-redmi-15c.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Redmi 15C",
    tagline: "Najjeftiniji Redmi sa velikom baterijom.",
    specs: {
      storage: "128 GB",
      ram: "4 GB",
      battery: "6000 mAh",
      display: "6,9\" IPS LCD 120 Hz",
      camera: "50 MP + 8 MP",
      chipset: "Helio G81 Ultra",
    },
    tags: ["budzet", "najbolja_baterija"],
    priceBand: "ispod_400",
    priceTrend: "pad",
    trendPercent: -4,
    popularity: 74,
    sellers: sellersFor(184, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "xiaomi-17t",
    image: "/images/xiaomi-17t.jpg",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    name: "Xiaomi 17T",
    tagline: "Leica trostruka kamera i 6500 mAh u srednjem rangu.",
    specs: {
      storage: "256 GB",
      ram: "12 GB",
      battery: "6500 mAh",
      display: "6,59\" AMOLED 120 Hz",
      camera: "50 MP + 50 MP + 12 MP",
      chipset: "Dimensity 8500 Ultra",
    },
    tags: ["najbolja_kamera", "najbolja_baterija"],
    priceBand: "premium",
    priceTrend: "stabilno",
    trendPercent: 0,
    popularity: 86,
    sellers: sellersFor(1347, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas", "emmezeta"]),
  },
  /* ------------------------------ HONOR ------------------------------ */
  {
    slug: "honor-600",
    image: "/images/honor-600.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor 600",
    tagline: "Kamera od 200 MP i baterija od 6398 mAh.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "6398 mAh",
      display: "6,57\" AMOLED 120 Hz",
      camera: "200 MP + 12 MP",
      chipset: "Snapdragon 7 Gen 4",
    },
    tags: ["najbolja_kamera", "najbolja_baterija"],
    priceBand: "premium",
    priceTrend: "stabilno",
    trendPercent: -2,
    popularity: 85,
    sellers: sellersFor(1014, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "honor-600-pro",
    image: "/images/honor-600-pro.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor 600 Pro",
    tagline: "Snapdragon 8 Elite i kamera od 200 MP.",
    specs: {
      storage: "512 GB",
      ram: "12 GB",
      battery: "6400 mAh",
      display: "6,57\" AMOLED 120 Hz",
      camera: "200 MP + 50 MP + 12 MP",
      chipset: "Snapdragon 8 Elite",
    },
    tags: ["najbolja_kamera", "najbolji_gaming"],
    priceBand: "premium",
    priceTrend: "rast",
    trendPercent: 2,
    popularity: 79,
    sellers: sellersFor(1424, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "honor-600-lite",
    image: "/images/honor-600-lite.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor 600 Lite",
    tagline: "Lagan model sa baterijom od 6520 mAh.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "6520 mAh",
      display: "6,6\" AMOLED 120 Hz",
      camera: "108 MP + 5 MP",
      chipset: "Dimensity 7100 Elite",
    },
    tags: ["najbolja_baterija", "budzet"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -3,
    popularity: 77,
    sellers: sellersFor(580, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "honor-magic8-lite",
    image: "/images/honor-magic8-lite.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor Magic8 Lite",
    tagline: "Baterija od 7500 mAh u Magic seriji.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "7500 mAh",
      display: "6,79\" AMOLED 120 Hz",
      camera: "108 MP + 16 MP",
      chipset: "Snapdragon 6 Gen 4",
    },
    tags: ["najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -2,
    popularity: 75,
    sellers: sellersFor(585, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "honor-x7d",
    image: "/images/honor-x7d.jpg",
    brand: "Honor",
    brandSlug: "honor",
    name: "Honor X7d",
    tagline: "Povoljan Honor sa baterijom od 6500 mAh.",
    specs: {
      storage: "128 GB",
      ram: "6 GB",
      battery: "6500 mAh",
      display: "6,77\" TFT LCD 120 Hz",
      camera: "50 MP + 5 MP",
      chipset: "Snapdragon 6s Gen 3",
    },
    tags: ["budzet", "najbolja_baterija"],
    priceBand: "ispod_400",
    priceTrend: "stabilno",
    trendPercent: 0,
    popularity: 70,
    sellers: sellersFor(294, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  /* ------------------------------ MOTOROLA ------------------------------ */
  {
    slug: "motorola-edge-60",
    image: "/images/motorola-edge-60.jpg",
    brand: "Motorola",
    brandSlug: "motorola",
    name: "Motorola Edge 60",
    tagline: "Zakrivljeni P-OLED ekran i uredan Motorola softver.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5200 mAh",
      display: "6,67\" P-OLED 120 Hz",
      camera: "50 MP + 50 MP + 10 MP",
      chipset: "Dimensity 7300",
    },
    tags: ["najbolja_kamera", "najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -3,
    popularity: 73,
    sellers: sellersFor(714, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "motorola-moto-g86",
    image: "/images/motorola-moto-g86.jpg",
    brand: "Motorola",
    brandSlug: "motorola",
    name: "Motorola Moto G86",
    tagline: "Solidna srednja klasa sa P-OLED ekranom.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5200 mAh",
      display: "6,67\" P-OLED 120 Hz",
      camera: "50 MP",
      chipset: "Dimensity 7300",
    },
    tags: ["budzet", "najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "stabilno",
    trendPercent: -1,
    popularity: 71,
    sellers: sellersFor(514, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  /* ------------------------------ REALME ------------------------------ */
  {
    slug: "realme-16-pro",
    image: "/images/realme-16-pro.jpg",
    brand: "Realme",
    brandSlug: "realme",
    name: "Realme 16 Pro",
    tagline: "Kamera od 200 MP i AMOLED ekran od 144 Hz.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "6500 mAh",
      display: "6,78\" AMOLED 144 Hz",
      camera: "200 MP + 8 MP",
      chipset: "Dimensity 7300 Max",
    },
    tags: ["najbolja_kamera", "najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "pad",
    trendPercent: -2,
    popularity: 72,
    sellers: sellersFor(814, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  /* ------------------------------ ONEPLUS ------------------------------ */
  {
    slug: "oneplus-nord-ce-5",
    image: "/images/oneplus-nord-ce-5.jpg",
    brand: "OnePlus",
    brandSlug: "oneplus",
    name: "OnePlus Nord CE 5",
    tagline: "Fluid AMOLED i brzo punjenje po pristupačnoj cijeni.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5200 mAh",
      display: "6,77\" Fluid AMOLED 120 Hz",
      camera: "50 MP + 8 MP",
      chipset: "Dimensity 8350 Apex",
    },
    tags: ["najbolji_gaming", "najbolja_baterija"],
    priceBand: "400_800",
    priceTrend: "stabilno",
    trendPercent: 0,
    popularity: 74,
    sellers: sellersFor(714, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
  {
    slug: "oneplus-nord-5",
    image: "/images/oneplus-nord-5.jpg",
    brand: "OnePlus",
    brandSlug: "oneplus",
    name: "OnePlus Nord 5",
    tagline: "Snapdragon 8s Gen 3 i ekran od 144 Hz.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5200 mAh",
      display: "6,83\" Swift AMOLED 144 Hz",
      camera: "50 MP + 50 MP",
      chipset: "Snapdragon 8s Gen 3",
    },
    tags: ["najbolji_gaming", "najbolja_kamera"],
    priceBand: "400_800",
    priceTrend: "rast",
    trendPercent: 2,
    popularity: 76,
    sellers: sellersFor(844, ["bhtelecom", "hteronet", "mtel", "tehnomarket", "ananas"]),
  },
  /* ------------------------------ GOOGLE ------------------------------ */
  {
    slug: "google-pixel-10a",
    image: "/images/google-pixel-10a.jpg",
    brand: "Google",
    brandSlug: "google",
    name: "Google Pixel 10a",
    tagline: "Čisti Android, Tensor čip i najbolja Google kamera u klasi.",
    specs: {
      storage: "256 GB",
      ram: "8 GB",
      battery: "5100 mAh",
      display: "6,3\" Actua pOLED 120 Hz",
      camera: "48 MP + 13 MP",
      chipset: "Tensor G4",
    },
    tags: ["najbolja_kamera"],
    priceBand: "premium",
    priceTrend: "pad",
    trendPercent: -4,
    popularity: 78,
    sellers: sellersFor(1165, ["bhtelecom", "mtel", "tehnomarket", "ananas"]),
  },
];

/* ------------------------------------------------------------------ */
/* Historija cijena (Faza 2A — Smart Insights)                         */
/* ------------------------------------------------------------------ */

/**
 * Generiše 6 mjesečnih cijena (KM) iz postojećih podataka telefona.
 * - zadnja tačka === trenutna najniža ponuda (dosljednost sa sellers)
 * - ranije tačke su realistične i prate smjer priceTrend-a:
 *   pad → cijena je opadala (start viši), rast → cijena je rasla,
 *   stabilno → blago kolebanje oko trenutne cijene
 * - bez nasumičnosti (deterministički) — vrijednosti su ponovljive
 */
function makeHistory(phone: Pick<Phone, "sellers" | "priceTrend" | "trendPercent">): number[] {
  const min = phone.sellers.reduce((lo, s) => (s.priceKM < lo ? s.priceKM : lo), Infinity);
  const pct = Math.abs(phone.trendPercent);
  const start =
    phone.priceTrend === "pad"
      ? min * (1 + pct / 100) // prije 6 mjeseci bilo skuplje za pct%
      : phone.priceTrend === "rast"
        ? min * (1 - pct / 100) // prije 6 mjeseci bilo jeftinije za pct%
        : min * (1 - phone.trendPercent / 200); // stabilno — blago odstupanje u pravcu pct

  // Deterministički "šum" po mjesecima (‰) da kriva ne bude prava linija
  const noise = [0.4, -0.7, 0.5, -0.4, 0.6, 0];
  const pts: number[] = [];
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const eased = t * t; // pad/rast se ubrzava posljednjih mjeseci (realistično)
    const v = start * (1 - eased) + min * eased;
    pts.push(Math.max(0, Math.round(v * (1 + noise[i] / 100))));
  }
  pts[5] = min; // posljednja tačka = trenutna najniža ponuda
  return pts;
}

/** Katalog telefona sa izračunatom historijom cijena za Smart Insights. */
export const phones: Phone[] = RAW_PHONES.map((p) => ({
  ...p,
  priceHistory: makeHistory(p),
}));