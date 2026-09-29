/**
 * phone.ba — zajednička logika kataloga.
 * Koristi je i hero pretraga (Filtera uživo) i stranica /telefoni
 * i stranica /telefon/[slug]. Faza 2 (chatbot, insights) može direktno
 * pozivati filterPhones/sortPhones.
 */
import {
  phones,
  type AttributeTag,
  type BrandSlug,
  type Phone,
  type PriceBand,
  type PriceTrend,
} from "~/data/phones";
import { getOlxPrices } from "~/data/olx_prices";
import { getShopPrices } from "~/data/shop_prices";

/* ------------------------------------------------------------------ */
/* Oznake (Bosanski)                                                   */
/* ------------------------------------------------------------------ */

export const BRAND_LABELS: Record<BrandSlug, string> = {
  apple: "Apple",
  samsung: "Samsung",
  xiaomi: "Xiaomi",
  honor: "Honor",
  motorola: "Motorola",
  realme: "Realme",
  oneplus: "OnePlus",
  google: "Google",
};

export const BRAND_SLUGS: BrandSlug[] = [
  "apple",
  "samsung",
  "xiaomi",
  "honor",
  "motorola",
  "realme",
  "oneplus",
  "google",
];

export const TAG_LABELS: Record<AttributeTag, string> = {
  najbolja_kamera: "Najbolja kamera",
  najbolja_baterija: "Najbolja baterija",
  najbolji_gaming: "Najbolji gaming",
  budzet: "Budžet izbor",
};

export const BAND_LABELS: Record<PriceBand, string> = {
  ispod_400: "Ispod 400 KM",
  "400_800": "400 – 800 KM",
  premium: "Premium 1000+ KM",
};

/** Oznaka trenda za karticu u katalogu */
export function trendCardLabel(t: PriceTrend): string {
  return t === "pad"
    ? "Pravo vrijeme za kupovinu"
    : t === "stabilno"
      ? "Dobra prilika"
      : "Sačekaj pad cijene";
}

/** Oznaka trenda za stranicu uporedbe */
export function trendDetailLabel(t: PriceTrend): string {
  return t === "pad"
    ? "Pravo vrijeme za kupovinu"
    : t === "stabilno"
      ? "Stabilna cijena"
      : "Sačekaj pad cijene";
}

/** Strelica + procenat, npr. "↓ 7%" */
export function trendArrow(t: PriceTrend, pct: number): string {
  return t === "pad" ? `↓ ${Math.abs(pct)}%` : t === "rast" ? `↑ ${pct}%` : "→ 0%";
}

/* ------------------------------------------------------------------ */
/* Formatiranje cijena (KM)                                            */
/* ------------------------------------------------------------------ */

const kmFormatter = new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 0 });

/** Formatira cijenu u KM, npr. "1.999 KM" */
export function formatKM(km: number): string {
  return `${kmFormatter.format(km)} KM`;
}

/** Najpovoljnija DEMO cijena telefona (min ponuda telekoma/trgovina) */
export function minPriceOf(phone: Phone): number {
  return phone.sellers.reduce(
    (min, s) => (s.priceKM < min ? s.priceKM : min),
    phone.sellers[0]?.priceKM ?? 0,
  );
}
/**
 * Najniža STVARNA cijena telefona: najniža od stvarnih cijena (OLX.ba minimum
 * i minimum dostupnih ponuda u BH online shopovima), a ako model nema stvarnih
 * cijena — demo minimum. Ovo je istiniti minimum koji kupac može platiti, pa
 * ga koristimo za sortiranje po cijeni i za filtre budžeta ("do/od N KM").
 *
 * Rasprodati shop artikli (`minPrice === null`) NE ulaze u minimum — cijena
 * koja se ne može kupiti nije najniža dostupna cijena.
 */
export function effectiveMinOf(phone: Phone): number {
  const real: number[] = [];
  const olx = getOlxPrices(phone.slug);
  if (olx) real.push(olx.minPrice);
  const shop = getShopPrices(phone.slug);
  if (shop && shop.minPrice !== null) real.push(shop.minPrice);
  return real.length > 0 ? Math.min(...real) : minPriceOf(phone);
}

/** Da li telefon ima ijednu STVARNU (OLX/shop) cijenu u bazi. */
export function hasRealPrice(phone: Phone): boolean {
  return Boolean(getOlxPrices(phone.slug) || getShopPrices(phone.slug));
}

/**
 * Cjenovni razred iz ISTINITE najniže cijene (vidi BAND_LABELS).
 * 800–1000 KM nema svoj razred u UI, pa tu nema izvedenog razreda (undefined).
 */
export function bandOfPrice(km: number): PriceBand | undefined {
  if (km < 400) return "ispod_400";
  if (km <= 800) return "400_800";
  if (km >= 1000) return "premium";
  return undefined;
}

/**
 * Filter "Budžet" po ISTINITOJ cijeni: telefon prolazi ako mu je deklarisani
 * razred iz kataloga (demo) ili izvedeni razred iz stvarne najniže cijene
 * (OLX/shop) jednak traženom. Tako filter ne tvrdi ništa neistinito — svaki
 * rezultat je ili deklarisan u tom razredu ili se stvarno može kupiti u njemu.
 */
export function matchesBand(phone: Phone, band: PriceBand): boolean {
  if (phone.priceBand === band) return true;
  return bandOfPrice(effectiveMinOf(phone)) === band;
}

/** Ponude sortirane rastuće po cijeni */
export function sortedSellers(phone: Phone) {
  return [...phone.sellers].sort((a, b) => a.priceKM - b.priceKM);
}

/* ------------------------------------------------------------------ */
/* URL search parametri (dijele ih /, /telefoni i /telefon/[slug])     */
/* ------------------------------------------------------------------ */

export interface CatalogSearch {
  pretraga?: string;
  budzet?: PriceBand;
  brend?: BrandSlug;
  funkcija?: AttributeTag;
  sort?: SortKey;
}

const BUDZET_VALUES: readonly PriceBand[] = ["ispod_400", "400_800", "premium"];
const BREND_VALUES: readonly BrandSlug[] = [
  "apple",
  "samsung",
  "xiaomi",
  "honor",
  "motorola",
  "realme",
  "oneplus",
  "google",
];
const FUNKCIJA_VALUES: readonly AttributeTag[] = [
  "najbolja_kamera",
  "najbolja_baterija",
  "najbolji_gaming",
  "budzet",
];
const SORT_VALUES: readonly SortKey[] = ["popularno", "cijena_r", "cijena_p"];

/** Normalizuje nepoznate search parametre iz URL-a u CatalogSearch. */
export function normalizeCatalogSearch(
  search: Record<string, unknown>,
): CatalogSearch {
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : undefined;
  const en = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
    typeof v === "string" && (allowed as readonly string[]).includes(v)
      ? (v as T)
      : undefined;

  return {
    pretraga: str(search.pretraga),
    budzet: en(search.budzet, BUDZET_VALUES),
    brend: en(search.brend, BREND_VALUES),
    funkcija: en(search.funkcija, FUNKCIJA_VALUES),
    sort: en(search.sort, SORT_VALUES),
  };
}

/* ------------------------------------------------------------------ */
/* Pretraga i filteri                                                  */
/* ------------------------------------------------------------------ */

/** Uklanja dijakritike i spušta slova: "šć" → "sc", "Ć" → "c" ... */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj");
}

/** Uobičajene riječi koje ne doprinose filtriranju (Bosanski) */
const STOPWORDS = new Set([
  "do", "od", "km", "kuna", "sa", "s", "i", "ili", "a", "u", "na", "za",
  "po", "te", "ali", "se", "mi", "ti", "bi", "je", "biti", "koji", "koja",
  "koje", "koju", "jedan", "telefon", "telefona", "telefone", "model",
  "modela", "tražim", "trazim", "gledam", "želim", "zelim", "treba",
  "kupiti", "kupim", "najbolji", "najbolja", "najbolje", "odličan",
  "odlična", "odličnom", "odlican", "dobar", "dobra", "cijena", "cijene",
  "ponuda", "ponude", "bih", "bosni", "hercegovini",
]);

interface QueryContext {
  /** Riječi koje MORAJU biti u tekstu telefona (prazno = bez ključnih riječi) */
  words: string[];
  maxPrice?: number;
  minPrice?: number;
}

function phoneHaystack(phone: Phone): string {
  return normalize(
    [
      phone.name,
      phone.brand,
      phone.tagline,
      phone.specs.storage,
      phone.specs.ram,
      phone.specs.battery,
      phone.specs.display,
      phone.specs.camera,
      phone.specs.chipset,
      ...phone.tags.map((t) => TAG_LABELS[t]),
      BAND_LABELS[phone.priceBand],
    ].join(" "),
  );
}

/**
 * Parsira slobodan tekst pretrage:
 * - "do 600 KM" / "od 500" → cjenovni raspon
 * - riječi koje se nigdje ne pojavljuju (npr. "odličnom") se ignorišu
 * - preostale riječi moraju sve biti prisutne u telefonu
 */
function buildQuery(rawQuery: string): QueryContext {
  const ctx: QueryContext = { words: [] };
  const q = normalize(rawQuery.trim());
  if (!q) return ctx;

  const tokens = q.split(/\s+/);
  const words: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1] ?? "";
    const prev = tokens[i - 1] ?? "";
    const isNum = /^\d+$/.test(t);
    const nextIsNum = /^\d+$/.test(next);

    if (isNum) {
      const n = Number(t);
      if (next === "km") {
        ctx.maxPrice = n;
        i++; // preskoči "km"
      } else if (prev === "do") {
        ctx.maxPrice = n;
      } else if (prev === "od") {
        ctx.minPrice = n;
      } else {
        words.push(t);
      }
      continue;
    }
    if ((t === "do" || t === "od") && nextIsNum) {
      const n = Number(next);
      if (t === "do") ctx.maxPrice = n;
      else ctx.minPrice = n;
      i++; // preskoči broj
      continue;
    }
    if (STOPWORDS.has(t) || t === "km") continue;
    words.push(t);
  }

  // Odbaci riječi koje se ne pojavljuju ni u jednom telefonu
  // (tako "sa odličnom baterijom" ne eliminiše sve rezultate)
  ctx.words = words.filter((w) =>
    phones.some((p) => phoneHaystack(p).includes(w)),
  );
  return ctx;
}

function matchesQueryContext(phone: Phone, ctx: QueryContext): boolean {
  if (ctx.maxPrice !== undefined && effectiveMinOf(phone) > ctx.maxPrice) {
    return false;
  }
  if (ctx.minPrice !== undefined && effectiveMinOf(phone) < ctx.minPrice) {
    return false;
  }
  if (ctx.words.length === 0) return true;
  const haystack = phoneHaystack(phone);
  return ctx.words.every((w) => haystack.includes(w));
}

export interface FilterOptions {
  q?: string;
  budzet?: PriceBand;
  brend?: BrandSlug;
  funkcija?: AttributeTag;
}

/**
 * Filtrira katalog. Svi kriteriji su opcionalni i kombinuju se (AND).
 * Pretraga (q) razumije i fraze tipa "kamera do 550 km".
 */
export function filterPhones(options: FilterOptions): Phone[] {
  const ctx = buildQuery(options.q ?? "");
  return phones.filter((p) => {
    if (!matchesQueryContext(p, ctx)) return false;
    if (options.budzet && !matchesBand(p, options.budzet)) return false;
    if (options.brend && p.brandSlug !== options.brend) return false;
    if (options.funkcija && !p.tags.includes(options.funkcija)) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Sortiranje                                                          */
/* ------------------------------------------------------------------ */

export type SortKey = "popularno" | "cijena_r" | "cijena_p";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popularno", label: "Najpopularniji" },
  { value: "cijena_r", label: "Cijena rastuća" },
  { value: "cijena_p", label: "Cijena padajuća" },
];

export function sortPhones(list: Phone[], sort: SortKey): Phone[] {
  const copy = [...list];
  switch (sort) {
    case "cijena_r":
      return copy.sort((a, b) => effectiveMinOf(a) - effectiveMinOf(b));
    case "cijena_p":
      return copy.sort((a, b) => effectiveMinOf(b) - effectiveMinOf(a));
    default:
      return copy.sort((a, b) => b.popularity - a.popularity);
  }
}

/** Sortiranje za katalog: filter → sort */
export function getCatalogPhones(options: FilterOptions, sort: SortKey): Phone[] {
  return sortPhones(filterPhones(options), sort);
}