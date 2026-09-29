/**
 * phone.ba — cross-selling: kompatibilni gadžeti uz telefon.
 *
 * Logika je izvedena iz podataka, bez ručnog unosa po modelu:
 *   1) telefon nosi `brandSlug` (apple, samsung, xiaomi, honor, …),
 *   2) gadžet nosi `brand` ("Apple", "Samsung", "Xiaomi", "Redmi", "Honor", …),
 *   3) PHONE_GADGET_RULES mapira brend telefona na brendove gadžeta i prioritet
 *      kategorija; rezultat se sortira po prioritetu kategorije, pa po cijeni.
 *
 * Brendovi bez pravila (npr. Google, OnePlus, Realme, Motorola) NE dobijaju
 * sekciju — bolje ništa nego pogrešna preporuka.
 */
import type { BrandSlug, Phone } from "~/data/phones";
import { gadgets, minGadgetPrice, type Gadget, type GadgetCategory } from "~/data/gadgets";

export interface GadgetRule {
  /** Brendovi gadžeta koji se smatraju kompatibilnim */
  gadgetBrands: string[];
  /** Redoslijed kategorija po prioritetu prikaza */
  categories: GadgetCategory[];
  /** Najviše gadžeta u sekciji */
  max: number;
  /** Kratko objašnjenje zašto (prikazuje se u sekciji) */
  note: string;
}

export const PHONE_GADGET_RULES: Partial<Record<BrandSlug, GadgetRule>> = {
  apple: {
    gadgetBrands: ["Apple"],
    categories: ["pametni_satovi", "bezbicne_slusalice", "ostala_oprema"],
    max: 4,
    note: "Apple Watch i AirPods se najlakše povezuju s iPhone-om (isti Apple ID, automatsko uparivanje).",
  },
  samsung: {
    gadgetBrands: ["Samsung"],
    categories: ["pametni_satovi", "bezbicne_slusalice", "ostala_oprema"],
    max: 4,
    note: "Galaxy Watch i Galaxy Buds se automatski uparuju s Galaxy telefonom (Samsung Wearable).",
  },
  xiaomi: {
    gadgetBrands: ["Xiaomi", "Redmi"],
    categories: ["pametni_satovi", "bezbicne_slusalice", "ostala_oprema"],
    max: 4,
    note: "Redmi/Xiaomi satovi, narukvice i slušalice rade kroz Mi Fitness aplikaciju.",
  },
  honor: {
    gadgetBrands: ["Honor"],
    categories: ["pametni_satovi", "bezbicne_slusalice", "ostala_oprema"],
    max: 4,
    note: "Honor oprema je predviđena za Honor telefone (Health aplikacija, brzo punjenje).",
  },
};

/** Pravilo za brend telefona (undefined = brend nema gadgeta u katalogu) */
export function gadgetRuleFor(brandSlug: BrandSlug): GadgetRule | undefined {
  return PHONE_GADGET_RULES[brandSlug];
}

/**
 * Kompatibilni gadžeti za telefon: filtrira po brendovima iz pravila,
 * sortira po prioritetu kategorije pa po najnižoj cijeni i ograničava broj.
 * Vraća prazan niz kada za brend nema pravila (sekcija se tada ne prikazuje).
 */
export function compatibleGadgets(phone: Phone): Gadget[] {
  const rule = gadgetRuleFor(phone.brandSlug);
  if (!rule) return [];
  const brands = new Set(rule.gadgetBrands.map((b) => b.toLowerCase()));
  const priority = (g: Gadget) => {
    const i = rule.categories.indexOf(g.category);
    return i === -1 ? rule.categories.length : i;
  };
  return gadgets
    .filter((g) => brands.has(g.brand.toLowerCase()))
    .sort(
      (a, b) =>
        priority(a) - priority(b) ||
        minGadgetPrice(a) - minGadgetPrice(b) ||
        a.name.localeCompare(b.name, "bs"),
    )
    .slice(0, rule.max);
}

/** Naslov + objašnjenje sekcije (za UI) */
export function compatibleGadgetsHeading(phone: Phone): string {
  return `Kompatibilni gadžeti za ${phone.brand}`;
}
