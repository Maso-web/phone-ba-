/**
 * phone.ba — SEO sloj: kanonska domena, sastavljanje naslova/opisa i
 * structured podaci (BreadcrumbList, WebSite, Organization).
 *
 * Pravila (dogovoreno u planu, ne mijenjati bez odluke):
 *  - canonical je UVIJEK https://phone.ba (bez www),
 *  - NE emitujemo Product/Offer/AggregateRating — cijene u UI dijelom su
 *    demo/snapshot, pa bi takve oznake bile netačne,
 *  - FAQPage samo tamo gdje pitanja i odgovori STVARNO stoje u tekstu stranice,
 *  - svi podaci u structured podacima izvedeni su iz kataloga
 *    (src/data/phones.ts, src/data/gadgets.ts) — ništa se ne izmišlja.
 */
import { phones, type Phone } from "~/data/phones";
import type { Gadget } from "~/data/gadgets";
import { effectiveMinOf } from "~/lib/catalog";

/* ------------------------------------------------------------------ */
/* Konstante brenda (NAP podaci)                                       */
/* ------------------------------------------------------------------ */

export const SITE_URL = "https://phone.ba";
export const SITE_NAME = "phone.ba";
export const CONTACT_EMAIL = "hello@phone.ba";
export const CONTACT_PHONE = "+387 60 315 8020";
/** Jedina slika brenda koja stvarno postoji na sajtu (200). */
export const SITE_IMAGE = `${SITE_URL}/og-slika.png`;

/* ------------------------------------------------------------------ */
/* Pomoćne funkcije                                                    */
/* ------------------------------------------------------------------ */

/** Skraćuje tekst na `max` znakova, na granici riječi, bez "…" ako nije trebalo. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export interface Crumb {
  name: string;
  /** Putanja bez domena, npr. "/telefoni" — izostavi za posljednju stavku. */
  path?: string;
}

/** BreadcrumbList JSON-LD iz niza stavki (Početna → … → stranica). */
export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: `${SITE_URL}${c.path}` } : {}),
    })),
  };
}

/** WebSite + SearchAction (pretraga kataloga ide preko /telefoni?pretraga=). */
export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "AI agregator cijena telefona u BiH",
  url: `${SITE_URL}/`,
  inLanguage: "bs",
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: SITE_IMAGE },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/telefoni?pretraga={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/** Organization sa NAP podacima (ime, e-mail, telefon, zemlja). */
export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: SITE_IMAGE },
  image: SITE_IMAGE,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE,
  address: {
    "@type": "PostalAddress",
    addressCountry: "BA",
  },
  areaServed: {
    "@type": "Country",
    name: "Bosna i Hercegovina",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      contactType: "customer support",
      availableLanguage: ["bs"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Meta za stranice modela i gadžeta                                   */
/* ------------------------------------------------------------------ */

/** Naslov stranice modela — ≤ 60 znakova, ime modela + "cijena" + KM. */
export function phoneTitle(phone: Phone): string {
  return clip(`${phone.name} — cijena i ponude u KM | ${SITE_NAME}`, 60);
}

/**
 * Opis stranice modela. Sadrži ime modela, tagline i konkretne specifikacije
 * iz kataloga (baterija, RAM) — sve provjerljivo na istoj stranici.
 */
export function phoneDescription(phone: Phone): string {
  return clip(
    `${phone.name} (${phone.brand}): ${phone.tagline} Uporedi cijene u KM u BiH, specifikacije (${phone.specs.battery} baterija, ${phone.specs.ram} RAM) i vidi gdje ga kupiti.`,
    158,
  );
}

/** Naslov stranice gadžeta — ≤ 60 znakova. */
export function gadgetTitle(gadget: Gadget): string {
  return clip(`${gadget.name} — cijena u KM u BiH | ${SITE_NAME}`, 60);
}

/** Opis stranice gadžeta — ime, tagline i kategorija iz podataka. */
export function gadgetDescription(gadget: Gadget): string {
  return clip(
    `${gadget.name}: ${gadget.tagline} Pregled cijena u KM iz BH online shopova i telekom ponuda, specifikacije i dostupnost na jednom mjestu.`,
    158,
  );
}

/* ------------------------------------------------------------------ */
/* Slični modeli (interni linkovi sa stranice modela)                  */
/* ------------------------------------------------------------------ */

/**
 * 4–6 relevantnih modela za stranicu modela: prvo isti brend po blizini
 * cijene, pa susjedi u cjenovnom prstenu cijelog kataloga (po cijeni
 * najbliži modeli ispod i iznad). Prsten garantuje da svaki model dobije
 * interne linkove sa drugih stranica — nijedna stranica ne ostaje siroče.
 */
export function relatedPhones(phone: Phone, count = 6): Phone[] {
  const cijena = effectiveMinOf(phone);
  const ostali = phones.filter((p) => p.slug !== phone.slug);
  const blizina = (p: Phone) => Math.abs(effectiveMinOf(p) - cijena);

  const istiBrend = ostali
    .filter((p) => p.brandSlug === phone.brandSlug)
    .sort((a, b) => blizina(a) - blizina(b))
    .slice(0, 2);

  // Cjenovni prsten: svi modeli sortirani po cijeni, pa susjedi ±1..±3
  const prsten = [...phones].sort((a, b) => effectiveMinOf(a) - effectiveMinOf(b));
  const idx = prsten.findIndex((p) => p.slug === phone.slug);
  const susjedi: Phone[] = [];
  for (let korak = 1; korak <= 3; korak++) {
    for (const smjer of [1, -1]) {
      const p = prsten[(idx + smjer * korak + prsten.length) % prsten.length];
      if (p && p.slug !== phone.slug) susjedi.push(p);
    }
  }

  const rezultat: Phone[] = [];
  for (const p of [...istiBrend, ...susjedi.sort((a, b) => blizina(a) - blizina(b))]) {
    if (rezultat.length >= count) break;
    if (!rezultat.some((r) => r.slug === p.slug)) rezultat.push(p);
  }
  // Dopuna ako je katalog manji od traženog broja
  for (const p of ostali.sort((a, b) => blizina(a) - blizina(b))) {
    if (rezultat.length >= count) break;
    if (!rezultat.some((r) => r.slug === p.slug)) rezultat.push(p);
  }
  return rezultat;
}
