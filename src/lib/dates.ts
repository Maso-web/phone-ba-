/**
 * phone.ba — pomoćne funkcije za datume uvoza (dijele ih OLX i shop sekcije).
 */

/** Datum "2026-09-15" → "15.9.2026." (za etiketu "uvoz …"). */
export function formatScrapeDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.${y}.`;
}
