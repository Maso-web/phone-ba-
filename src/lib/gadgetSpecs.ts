/**
 * phone.ba — šabloni i parseri specifikacija gadžeta (AI prepoznavanje).
 *
 * Ideja: podaci iz shopova/proizvođača dolaze kao SLOBODAN TEKST
 * ("Do 18 h", "5 ATM", "IP68", "Bluetooth 5.3", "20000 mAh",
 * "aktivno poništavanje buke"). Ovaj modul ih deterministički prepoznaje i
 * normalizuje u strukturirana polja, pa UI ne mora znati ništa o formatu
 * izvora. Svaka kategorija ima svoj šablon polja (SPEC_TEMPLATES) — polja
 * koja nisu prepoznata se jednostavno ne prikazuju (nikad se ne izmišljaju).
 */

/** Podkategorije gadžeta */
export type GadgetCategory =
  | "pametni_satovi"
  | "bezbicne_slusalice"
  | "ostala_oprema";

export const GADGET_CATEGORIES: GadgetCategory[] = [
  "pametni_satovi",
  "bezbicne_slusalice",
  "ostala_oprema",
];

export const GADGET_CATEGORY_LABELS: Record<GadgetCategory, string> = {
  pametni_satovi: "Pametni satovi",
  bezbicne_slusalice: "Bežične slušalice",
  ostala_oprema: "Ostala oprema",
};

/** Vrijednost jedne specifikacije nakon normalizacije */
export type SpecValue = string | number | boolean;

export interface SpecFieldDef {
  key: string;
  label: string;
}

/**
 * Šabloni polja po kategoriji — redoslijed je i redoslijed prikaza u tabeli.
 * Ključevi su zajednički unutar kategorije (npr. `batteryLife` za satove,
 * `batteryWithCase` za slušalice).
 */
export const SPEC_TEMPLATES: Record<GadgetCategory, SpecFieldDef[]> = {
  pametni_satovi: [
    { key: "batteryLife", label: "Trajanje baterije" },
    { key: "compatibility", label: "Kompatibilnost" },
    { key: "waterResistance", label: "Vodootpornost" },
    { key: "gps", label: "GPS" },
    { key: "display", label: "Ekran" },
    { key: "size", label: "Veličina kućišta" },
    { key: "caseMaterial", label: "Materijal kućišta" },
  ],
  bezbicne_slusalice: [
    { key: "anc", label: "Aktivno poništavanje buke" },
    { key: "batteryWithCase", label: "Baterija s kutijicom" },
    { key: "batteryBuds", label: "Baterija u slušalicama" },
    { key: "bluetooth", label: "Bluetooth" },
    { key: "waterResistance", label: "Vodootpornost" },
    { key: "charging", label: "Punjenje" },
    { key: "fit", label: "Tip nošenja" },
  ],
  ostala_oprema: [
    { key: "capacityMah", label: "Kapacitet" },
    { key: "outputW", label: "Izlazna snaga" },
    { key: "ports", label: "Portovi" },
    { key: "charging", label: "Punjenje" },
    { key: "batteryLife", label: "Trajanje baterije" },
    { key: "compatibility", label: "Kompatibilnost" },
    { key: "waterResistance", label: "Vodootpornost" },
  ],
};

/** Labela za bilo koji ključ (i onaj koji nije u šablonu kategorije) */
export const SPEC_LABELS: Record<string, string> = Object.values(
  SPEC_TEMPLATES,
).reduce<Record<string, string>>((acc, fields) => {
  for (const f of fields) acc[f.key] = f.label;
  return acc;
}, {});

/* ------------------------------------------------------------------ */
/* PARSERI — prepoznavanje uzoraka u slobodnom tekstu                  */
/* ------------------------------------------------------------------ */

const DAYS_RX = /(\d{1,3}(?:[.,]\d)?)\s*(?:dana|dan\b)/i;
const HOURS_RX = /(\d{1,3}(?:[.,]\d)?)\s*(?:h\b|sati|sata|sat\b)/i;

/** "7,5" / "7.5" → "7,5" (bosanski decimalni zarez u prikazu) */
function numBs(raw: string): string {
  return raw.replace(".", ",");
}
const ATM_RX = /(\d{1,2})\s*ATM/i;
const IP_RX = /\bIP\s?(\d{2})\b/i;
const BT_RX = /Bluetooth\s*(?:verzija\s*)?(\d(?:\.\d)?)/i;
const MAH_RX = /([\d][\d.,]*)\s*m\s?Ah/i;
const WATT_RX = /(\d{1,3})\s*W\b/i;
const ANC_RX = /\bANC\b|aktivno poništavanje buke|aktivna redukcija buke|noise cancel/i;
const ANC_NEG_RX = /bez\s+(?:ANC|aktivnog)|nema\s+ANC/i;
const GPS_RX = /\bGPS\b/i;
const GPS_NEG_RX = /bez\s+GPS|nema\s+GPS/i;

function tidy(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** "Do 18 h" / "18h" / "do 14 dana" → "Do 18 h" / "Do 14 dana" */
export function parseBatteryLife(raw?: string): string | undefined {
  if (!raw) return undefined;
  const t = tidy(raw);
  const d = DAYS_RX.exec(t);
  if (d) return `Do ${numBs(d[1])} dana`;
  const h = HOURS_RX.exec(t);
  if (h) return `Do ${numBs(h[1])} h`;
  return t || undefined;
}

/** Kao parseBatteryLife, ali za vrijednost "s kutijicom" (slušalice) */
export function parseBatteryWithCase(raw?: string): string | undefined {
  const base = parseBatteryLife(raw);
  if (!base) return undefined;
  return `${base} (s kutijicom)`;
}

/** "5 ATM" / "5atm" / "IP68" / "ip 67" → normalizovano */
export function parseWaterResistance(raw?: string): string | undefined {
  if (!raw) return undefined;
  const t = tidy(raw);
  const atm = ATM_RX.exec(t);
  if (atm) return `${Number(atm[1])} ATM`;
  const ip = IP_RX.exec(t);
  if (ip) return `IP${ip[1]}`;
  return t || undefined;
}

/** "Bluetooth 5.3" / "BT 5.3" → "5.3" */
export function parseBluetooth(raw?: string): string | undefined {
  if (!raw) return undefined;
  const t = tidy(raw);
  const m = BT_RX.exec(t) ?? /(\d\.\d)\s*(?:BLE|BT)\b/i.exec(t);
  return m ? m[1] : undefined;
}

/** Prepoznaje da/ne iz teksta ("Da", "Ne", "ANC", "bez ANC") */
export function parseFlag(raw?: string, negative?: RegExp): boolean | undefined {
  if (!raw) return undefined;
  const t = tidy(raw);
  if (negative && negative.test(t)) return false;
  if (/^(da|yes|ima)\b/i.test(t)) return true;
  if (/^(ne|no|nema)\b/i.test(t)) return false;
  return undefined;
}

/** Aktivno poništavanje buke: "Da (ANC)" ili "Ne" */
export function parseAnc(raw?: string): boolean | undefined {
  if (!raw) return undefined;
  const t = tidy(raw);
  if (ANC_NEG_RX.test(t)) return false;
  if (ANC_RX.test(t)) return true;
  return parseFlag(t);
}

/** GPS: "Da" / "Ne" / npr. "Da — GPS + GLONASS" */
export function parseGps(raw?: string): string | undefined {
  if (!raw) return undefined;
  const t = tidy(raw);
  if (GPS_NEG_RX.test(t)) return "Ne";
  if (GPS_RX.test(t)) {
    const extra = /GLONASS|Galileo|dvofrekventni|dual-?band|L1|L5/i.exec(t);
    return extra ? `Da (${extra[0]})` : "Da";
  }
  return parseFlag(t) === true ? "Da" : parseFlag(t) === false ? "Ne" : undefined;
}

/** "20000 mAh" / "20.000 mAh" → 20000 */
export function parseCapacityMah(raw?: string): number | undefined {
  if (!raw) return undefined;
  const m = MAH_RX.exec(tidy(raw));
  if (!m) return undefined;
  const digits = m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** "65 W" / "PD 30W" → 65 (najveća snaga u tekstu) */
export function parseOutputW(raw?: string): number | undefined {
  if (!raw) return undefined;
  const all = [...tidy(raw).matchAll(new RegExp(WATT_RX.source, "gi"))]
    .map((m) => Number(m[1]))
    .filter((n) => n > 0 && n <= 400);
  return all.length ? Math.max(...all) : undefined;
}

/** "iOS / Android" iz pomenutih platformi */
export function parseCompatibility(raw?: string): string | undefined {
  if (!raw) return undefined;
  const t = tidy(raw);
  const ios = /\biOS\b|iPhone/i.test(t);
  const android = /\bAndroid\b/i.test(t);
  if (ios && android) return "iOS / Android";
  if (ios) return "iOS";
  if (android) return "Android";
  return undefined;
}

/** Mapa ključ → parser; ključevi koji nisu ovdje ostaju kakvi jesu (tekst) */
const RAW_PARSERS: Record<string, (raw: string) => SpecValue | undefined> = {
  batteryLife: parseBatteryLife,
  batteryWithCase: parseBatteryWithCase,
  batteryBuds: parseBatteryLife,
  waterResistance: parseWaterResistance,
  bluetooth: parseBluetooth,
  anc: parseAnc,
  gps: parseGps,
  capacityMah: parseCapacityMah,
  outputW: parseOutputW,
  compatibility: parseCompatibility,
};

/**
 * Normalizuje sirove (tekstualne) specifikacije u strukturirana polja.
 * Neprepoznate vrijednosti se preskaču — bolje bez podatka nego pogrešan.
 */
export function normalizeSpecs(
  _category: GadgetCategory,
  raw: Record<string, string | undefined>,
): Record<string, SpecValue> {
  const out: Record<string, SpecValue> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null || tidy(String(value)) === "")
      continue;
    const parser = RAW_PARSERS[key];
    const parsed = parser ? parser(String(value)) : tidy(String(value));
    if (parsed === undefined) continue;
    out[key] = parsed;
  }
  return out;
}

/** Prikaz vrijednosti specifikacije (bosanski) */
export function formatSpecValue(v: SpecValue): string {
  if (typeof v === "boolean") return v ? "Da" : "Ne";
  if (typeof v === "number") {
    if (v >= 1000) return `${new Intl.NumberFormat("bs-BA").format(v)}`;
    return String(v);
  }
  return v;
}

/** Jedinica koja se dodaje uz broj, po ključu polja */
const SPEC_UNITS: Record<string, string> = {
  capacityMah: "mAh",
  outputW: "W",
  bluetooth: "", // već je "5.3"
};

/** Redovi za tabelu specifikacija — samo polja koja stvarno postoje */
export function specRows(
  category: GadgetCategory,
  specs: Record<string, SpecValue>,
): { key: string; label: string; value: string }[] {
  const template = SPEC_TEMPLATES[category];
  const seen = new Set(template.map((f) => f.key));
  const rows = template
    .filter((f) => specs[f.key] !== undefined)
    .map((f) => ({
      key: f.key,
      label: f.label,
      value:
        formatSpecValue(specs[f.key]) + (SPEC_UNITS[f.key] ? ` ${SPEC_UNITS[f.key]}` : ""),
    }));
  // dodatna polja van šablona (npr. `ports`) — prikaži ih na kraju
  for (const [key, value] of Object.entries(specs)) {
    if (seen.has(key)) continue;
    rows.push({
      key,
      label: SPEC_LABELS[key] ?? key,
      value: formatSpecValue(value) + (SPEC_UNITS[key] ? ` ${SPEC_UNITS[key]}` : ""),
    });
  }
  return rows;
}

/** Kratke oznake za karticu u mreži (2-3 najkorisnija polja po kategoriji) */
export function specChips(
  category: GadgetCategory,
  specs: Record<string, SpecValue>,
): string[] {
  const order: Record<GadgetCategory, string[]> = {
    pametni_satovi: ["batteryLife", "waterResistance", "compatibility"],
    bezbicne_slusalice: ["anc", "batteryWithCase", "bluetooth"],
    ostala_oprema: ["capacityMah", "outputW", "batteryLife"],
  };
  return order[category]
    .filter((k) => specs[k] !== undefined)
    .map(
      (k) =>
        formatSpecValue(specs[k]) + (SPEC_UNITS[k] ? ` ${SPEC_UNITS[k]}` : ""),
    );
}
