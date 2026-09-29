import type { Brand } from "~/data/phones";

/**
 * Vizual telefona.
 * - Kada model ima `image` (stvarna, lokalna fotografija modela iz public/images/),
 *   renderuje se <img> u kvadratnom okviru (object-cover, zaobljeni uglovi,
 *   konzistentno sa dark temom).
 * - Kada nema fotografije, ostaje postojeći CSS mockup (privremeni fallback).
 */
const PALETTES: Record<
  Brand,
  {
    frameA: string;
    frameB: string;
    screenA: string;
    screenB: string;
    glow: string;
    accent: string;
    label: string;
  }
> = {
  Apple: {
    frameA: "#3d4653",
    frameB: "#14181e",
    screenA: "#0b1322",
    screenB: "#27406e",
    glow: "rgba(99,143,255,0.5)",
    accent: "#9db8ff",
    label: "iPhone",
  },
  Samsung: {
    frameA: "#232c3c",
    frameB: "#0b0f15",
    screenA: "#0a1024",
    screenB: "#4a2a6b",
    glow: "rgba(140,110,255,0.45)",
    accent: "#b7a2ff",
    label: "Galaxy",
  },
  Xiaomi: {
    frameA: "#7a4a12",
    frameB: "#1d1003",
    screenA: "#191208",
    screenB: "#5a3a10",
    glow: "rgba(255,158,64,0.42)",
    accent: "#ffc266",
    label: "Xiaomi",
  },
  Honor: {
    frameA: "#0f4c47",
    frameB: "#051f1d",
    screenA: "#05272b",
    screenB: "#1d6a63",
    glow: "rgba(45,212,191,0.4)",
    accent: "#7ff3e0",
    label: "HONOR",
  },
  Motorola: {
    frameA: "#1f3b6d",
    frameB: "#0a1226",
    screenA: "#081026",
    screenB: "#1c3a7a",
    glow: "rgba(96,140,255,0.42)",
    accent: "#9cc0ff",
    label: "moto",
  },
  Realme: {
    frameA: "#6b1230",
    frameB: "#1b0410",
    screenA: "#1d0714",
    screenB: "#7a1636",
    glow: "rgba(255,86,140,0.4)",
    accent: "#ffa8c4",
    label: "realme",
  },
  OnePlus: {
    frameA: "#7a2a12",
    frameB: "#1a0703",
    screenA: "#1c0805",
    screenB: "#8a2a10",
    glow: "rgba(255,110,64,0.42)",
    accent: "#ffb499",
    label: "OnePlus",
  },
  Google: {
    frameA: "#2c3e50",
    frameB: "#0b1220",
    screenA: "#081524",
    screenB: "#1f4f6d",
    glow: "rgba(120,190,255,0.4)",
    accent: "#b9e2ff",
    label: "Pixel",
  },
};

type SizeKey = "xs" | "sm" | "md" | "lg";
const WIDTHS: Record<SizeKey, number> = { xs: 84, sm: 108, md: 148, lg: 204 };

export function PhoneVisual({
  brand,
  size = "md",
  className = "",
  image,
  name,
}: {
  brand: Brand;
  size?: SizeKey;
  className?: string;
  /** Lokalna fotografija modela (public/images/<slug>.jpg) — kada postoji, koristi se umjesto mockupa */
  image?: string;
  /** Naziv modela za alt/aria — obavezan kada se prikazuje fotografija */
  name?: string;
}) {
  const p = PALETTES[brand];
  const w = WIDTHS[size];
  const h = Math.round(w * 1.95);
  const island = brand === "Apple";

  // --- Stvarna fotografija modela (kada postoji) ---
  if (image) {
    return (
      <div
        className={`relative select-none ${className}`}
        style={{ width: w, height: w }}
        role="img"
        aria-label={name ? `${name} — fotografija` : `${brand} telefon`}
      >
        <img
          src={image}
          alt={name ?? `${brand} telefon`}
          loading={size === "lg" ? "eager" : "lazy"}
          className="h-full w-full rounded-[16%] object-cover shadow-[0_14px_42px_-14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.07]"
        />
      </div>
    );
  }

  // --- CSS mockup (privremeni fallback za modele bez fotografije) ---
  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width: w, height: h }}
      role="img"
      aria-label={`${brand} telefon — ilustracija`}
    >
      {/* Okvir */}
      <div
        className="absolute inset-0 rounded-[13%]"
        style={{
          background: `linear-gradient(180deg, ${p.frameA}, ${p.frameB})`,
          boxShadow: `0 14px 42px -14px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.14)`,
        }}
      />
      {/* Bočni tasteri */}
      <div
        className="absolute top-[18%] -left-[3px] h-[9%] w-[3px] rounded-l"
        style={{ background: p.frameA }}
      />
      <div
        className="absolute top-[32%] -left-[3px] h-[14%] w-[3px] rounded-l"
        style={{ background: p.frameA }}
      />
      {/* Ekran */}
      <div
        className="absolute"
        style={{
          inset: "3.5%",
          borderRadius: "10% / 10%",
          background: `linear-gradient(160deg, ${p.screenA}, ${p.screenB})`,
          boxShadow: "inset 0 0 26px rgba(0,0,0,0.6)",
        }}
      >
        {/* Dynamic Island / bušena kamera */}
        {island ? (
          <div
            className="absolute left-1/2 top-[3%] h-[4.5%] w-[34%] -translate-x-1/2 rounded-full"
            style={{ background: "#05070c", boxShadow: "inset 0 0 4px rgba(0,0,0,0.9)" }}
          />
        ) : (
          <div
            className="absolute left-1/2 top-[4%] h-[3.5%] w-[7%] -translate-x-1/2 rounded-full"
            style={{ background: "#05070c" }}
          />
        )}
        {/* Vrijeme */}
        <div
          className="absolute left-[7%] top-[4.5%] font-semibold text-white/85"
          style={{ fontSize: w * 0.062 }}
        >
          9:41
        </div>
        {/* Baterija */}
        <div
          className="absolute right-[7%] top-[6%] h-[7px] w-[13px] rounded-[2px] border border-white/40 px-[1.5px] py-[1px]"
          style={{ fontSize: 0 }}
        >
          <div
            className="h-full w-[62%] rounded-[1px]"
            style={{ background: "rgba(255,255,255,0.85)" }}
          />
        </div>
        {/* Naziv brenda na ekranu */}
        <div
          className="absolute left-0 right-0 text-center font-bold uppercase tracking-[0.18em]"
          style={{ top: "68%", color: p.accent, fontSize: w * 0.07, opacity: 0.92 }}
        >
          {p.label}
        </div>
        {/* Home indikator */}
        <div
          className="absolute bottom-[3%] left-1/2 h-[3px] w-[26%] -translate-x-1/2 rounded-full"
          style={{ background: "rgba(255,255,255,0.6)" }}
        />
      </div>
    </div>
  );
}