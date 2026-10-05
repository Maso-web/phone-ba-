/**
 * phone.ba — klijentska analitika (Umami).
 *
 * Jedan, bezbijedni ulaz za poslovne događaje. Pravila:
 *  - radi samo u browseru (`typeof window !== "undefined"`)
 *  - tracker (umami.js) je async — ako još nije spreman, događaj se tiho preskače
 *  - NIKAD ne baca grešku i ne loguje u konzolu: analitika ne smije slomiti sajt
 *  - Umami tracker sam filtrira hostove preko data-hostname (dev/preview se ne mjere)
 *
 * Skripta se ubacuje u `src/routes/__root.tsx` (<head>).
 */

/** Vrijednosti događaja — Umami prima string/broj/bool po ključu. */
export type TrackPayload = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Pošalji poslovni događaj u Umami (bezopasno ako tracker nije tu).
 * @param event ime događaja, npr. "shop_offer_click"
 * @param data  payload (model, shop, priceKM, …) — opcionalno
 */
export function track(event: string, data?: TrackPayload): void {
  if (typeof window === "undefined") return;
  try {
    const umami = window.umami;
    if (!umami || typeof umami.track !== "function") return;
    umami.track(event, data);
  } catch {
    /* analitika nikad ne smije slomiti sajt */
  }
}
