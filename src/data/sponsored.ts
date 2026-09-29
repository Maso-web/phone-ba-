/**
 * phone.ba — sponzorisane ponude (DEMO / SEED podaci za lansiranje).
 *
 * Zaseban modul od organskih ponuda (sellers u phones.ts) — sponzorisane
 * ponude se NIKAD ne miješaju u liste prodavača niti u rangiranje cijena.
 * Svaka kartica uvijek nosi jasnu oznaku "Sponzorisana ponuda" i demo
 * microcopy, jer su ovi podaci primjeri za lansiranje — živi partnerski
 * ugovori dolaze naknadno.
 *
 * Invarijante:
 *  - regularPriceKM UVJEK veći od promoPriceKM
 *  - phoneSlug (kada je postavljen) mora odgovarati postojećem slug-u u phones.ts
 *  - samo ponude sa active === true se prikazuju
 */

import { phones } from "./phones";

export type SponsoredPosition = "phone_page" | "home" | "catalog_banner";

export interface SponsoredOffer {
  id: string;
  /** Puni naziv prodavača, npr. "TehnoMarket.ba" */
  storeName: string;
  /** Kratki naziv za logo, npr. "TehnoMarket" */
  logoText: string;
  /** Inicijali za avatar (npr. "TM") */
  initials: string;
  /** Kratki naslov ponude na Bosanskom */
  dealTitle: string;
  /** Opcionalno — kada je postavljen mora odgovarati slug-u u phones.ts */
  phoneSlug?: string;
  /** Akcijska cijena u KM */
  promoPriceKM: number;
  /** Redovna cijena (precrtana) — uvijek veća od promoPriceKM */
  regularPriceKM: number;
  /** Oznaka popusta, npr. "Popust 15%" */
  badgeText: string;
  /** Tekst CTA dugmeta, npr. "Pogledaj ponudu" */
  ctaLabel: string;
  /** Plausibilan https link ka prodavaču */
  ctaUrl: string;
  /** Aktivan samo ako je true — inače se ponuda ne prikazuje nigdje */
  active: boolean;
  /** Gdje se ponuda prikazuje */
  position: SponsoredPosition;
}

/* ------------------------------------------------------------------ */
/* Demo ponude — 7 primjera po pozicijama                              */
/* ------------------------------------------------------------------ */

export const sponsoredOffers: SponsoredOffer[] = [
  /* ------------------------- phone_page (2) ------------------------ */
  {
    id: "sp-01",
    storeName: "TehnoMarket.ba",
    logoText: "TehnoMarket",
    initials: "TM",
    dealTitle: "iPhone 15 128 GB — akcijska cijena",
    phoneSlug: "iphone-15",
    promoPriceKM: 1899,
    regularPriceKM: 2199,
    badgeText: "Popust 14%",
    ctaLabel: "Pogledaj ponudu",
    ctaUrl: "https://www.tehnomarket.ba/telefoni",
    active: true,
    position: "phone_page",
  },
  {
    id: "sp-02",
    storeName: "HT Eronet d.d. Mostar",
    logoText: "HT Eronet",
    initials: "HT",
    dealTitle: "Galaxy S24 256 GB — uz potpis ugovora",
    phoneSlug: "samsung-galaxy-s24",
    promoPriceKM: 1299,
    regularPriceKM: 1499,
    badgeText: "Popust 13%",
    ctaLabel: "Pogledaj ponudu",
    ctaUrl: "https://www.hteronet.ba/telefoni",
    active: true,
    position: "phone_page",
  },

  /* ----------------------------- home (2) -------------------------- */
  {
    id: "sp-03",
    storeName: "Ananas.ba",
    logoText: "Ananas",
    initials: "AN",
    dealTitle: "iPhone 13 — dostava isti dan za Sarajevo",
    promoPriceKM: 999,
    regularPriceKM: 1149,
    badgeText: "Popust 13%",
    ctaLabel: "Pogledaj ponudu",
    ctaUrl: "https://www.ananas.ba/telefoni",
    active: true,
    position: "home",
  },
  {
    id: "sp-04",
    storeName: "m:tel a.d. Banja Luka",
    logoText: "m:tel",
    initials: "m:",
    dealTitle: "Galaxy A55 — bonus 20 GB uz pretplatu",
    promoPriceKM: 599,
    regularPriceKM: 719,
    badgeText: "Popust 17%",
    ctaLabel: "Pogledaj ponudu",
    ctaUrl: "https://www.mtel.ba/telefoni",
    active: true,
    position: "home",
  },

  /* ------------------------ catalog_banner (3) --------------------- */
  {
    id: "sp-05",
    storeName: "BH Telecom d.d. Sarajevo",
    logoText: "BH Telecom",
    initials: "BH",
    dealTitle: "iPhone 15 uz BH Telecom pretplatu",
    promoPriceKM: 1899,
    regularPriceKM: 2149,
    badgeText: "Popust 12%",
    ctaLabel: "Pogledaj ponudu",
    ctaUrl: "https://www.bhtelecom.ba/telefoni",
    active: true,
    position: "catalog_banner",
  },
  {
    id: "sp-06",
    storeName: "EmmeZeta.ba",
    logoText: "EmmeZeta",
    initials: "EZ",
    dealTitle: "Redmi Note 13 Pro — akcijska sedmica",
    promoPriceKM: 489,
    regularPriceKM: 579,
    badgeText: "Popust 16%",
    ctaLabel: "Pogledaj ponudu",
    ctaUrl: "https://www.emmezeta.ba/telefoni",
    active: true,
    position: "catalog_banner",
  },
  {
    id: "sp-07",
    storeName: "Šićko.ba",
    logoText: "Šićko",
    initials: "ŠK",
    dealTitle: "Honor X9b — poklon dodatna baterija",
    promoPriceKM: 429,
    regularPriceKM: 499,
    badgeText: "Popust 14%",
    ctaLabel: "Pogledaj ponudu",
    ctaUrl: "https://www.sicko.ba/telefoni",
    active: false, // neaktivan — dokaz da se filtriraju neaktivne ponude
    position: "catalog_banner",
  },
];

/* ------------------------------------------------------------------ */
/* Selektori — aktivne ponude po poziciji (nikada prazna mjesta)        */
/* ------------------------------------------------------------------ */

/** Sve aktivne ponude za datu poziciju */
export function activeSponsoredOffers(
  position: SponsoredPosition,
): SponsoredOffer[] {
  return sponsoredOffers.filter((o) => o.active && o.position === position);
}

/**
 * Ponuda za stranicu telefona: prva aktivna "phone_page" ponuda vezana za
 * dati telefon (phoneSlug === slug); ako je nema, pad na prvu aktivnu
 * "phone_page" ponudu; ako ni te nema → undefined (ne prikazuj ništa).
 */
export function getPhonePageOffer(
  slug: string,
): SponsoredOffer | undefined {
  const active = activeSponsoredOffers("phone_page");
  return active.find((o) => o.phoneSlug === slug) ?? active[0];
}

/** Prva aktivna "home" ponuda (ili undefined) */
export function getHomeOffer(): SponsoredOffer | undefined {
  return activeSponsoredOffers("home")[0];
}

/** Prva aktivna "catalog_banner" ponuda (ili undefined) */
export function getCatalogBannerOffer(): SponsoredOffer | undefined {
  return activeSponsoredOffers("catalog_banner")[0];
}

/* ------------------------------------------------------------------ */
/* Dev-time provjera invarijanti (samo u developmentu)                 */
/* ------------------------------------------------------------------ */

if (import.meta.env.DEV) {
  const slugs = new Set(phones.map((p) => p.slug));
  for (const o of sponsoredOffers) {
    if (o.regularPriceKM <= o.promoPriceKM) {
      console.warn(
        `[sponsored] ${o.id}: regularPriceKM (${o.regularPriceKM}) mora biti veći od promoPriceKM (${o.promoPriceKM})`,
      );
    }
    if (o.phoneSlug && !slugs.has(o.phoneSlug)) {
      console.warn(
        `[sponsored] ${o.id}: phoneSlug "${o.phoneSlug}" ne postoji u phones.ts`,
      );
    }
  }
}