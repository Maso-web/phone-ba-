import { useId } from "react";
import type { PriceTrend } from "~/data/phones";
import { formatKM } from "~/lib/catalog";

/** Mjeseci (Bosanski) za grafikon — posljednjih 6 mjeseci */
export const PRICE_MONTHS = ["Sij", "Velj", "Ožu", "Tra", "Svi", "Lip"];

const kmCompact = new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ */
/* Linijski grafikon cijena — čisti SVG, bez biblioteka I eksternih    */
/* resursa. Prikazuje priceHistory (6 mjeseci) jednog telefona.        */
/* ------------------------------------------------------------------ */

export function PriceChart({
  history,
  months = PRICE_MONTHS,
}: {
  history: number[];
  months?: string[];
}) {
  const gradId = useId();

  // Koordinate primjerene za responzivni SVG (viewBox, w-full h-auto)
  const W = 560;
  const H = 220;
  const PT = 16; // padding top (labeli)
  const PB = 30; // padding bottom (mjeseci)
  const PL = 44; // padding left (skala cijena)
  const PR = 10;

  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = max - min || 1;
  const lo = min - span * 0.18;
  const hi = max + span * 0.18;
  const range = hi - lo || 1;

  const x = (i: number) => PL + (i * (W - PL - PR)) / (history.length - 1);
  const y = (v: number) => PT + ((hi - v) / range) * (H - PT - PB);

  const pts = history.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const line = pts.join(" ");
  const area = `M ${pts[0]} L ${pts.slice(1).join(" L ")} L ${x(
    history.length - 1,
  ).toFixed(1)},${H - PB} L ${x(0).toFixed(1)},${H - PB} Z`;

  const gridValues = [hi, (hi + lo) / 2, lo];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Grafikon kretanja cijena — ${months.join(", ")}. Cijene od ${kmCompact.format(Math.round(lo))} do ${kmCompact.format(Math.round(hi))} KM.`}
    >
      <defs>
        <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gradId}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand-300)" />
          <stop offset="100%" stopColor="var(--color-accent-400)" />
        </linearGradient>
      </defs>

      {/* Horizontalna mreža + skala cijena */}
      {gridValues.map((gv) => {
        const gy = y(gv);
        return (
          <g key={gv}>
            <line
              x1={PL}
              x2={W - PR}
              y1={gy}
              y2={gy}
              stroke="rgba(255,255,255,0.07)"
              strokeDasharray="3 5"
            />
            <text
              x={PL - 6}
              y={gy + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="rgba(148,163,184,0.75)"
            >
              {kmCompact.format(Math.round(gv))}
            </text>
          </g>
        );
      })}

      {/* Površina ispod krive */}
      <path d={area} fill={`url(#${gradId}-area)`} className="transition-opacity duration-300" />

      {/* Kriva cijene */}
      <polyline
        points={line}
        fill="none"
        stroke={`url(#${gradId}-line)`}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="line-draw"
      />

      {/* Tačke sa tooltip-om */}
      {history.map((v, i) => {
        const isLast = i === history.length - 1;
        return (
          <g key={`${i}-${v}`}>
            <circle
              cx={x(i)}
              cy={y(v)}
              r={isLast ? 5 : 3.2}
              fill={isLast ? "var(--color-accent-400)" : "var(--color-ink-900)"}
              stroke={
                isLast ? "var(--color-accent-400)" : "var(--color-brand-300)"
              }
              strokeWidth={isLast ? 2 : 1.6}
              className={isLast ? "animate-pulse-soft" : undefined}
            >
              <title>
                {`${months[i]}: ${formatKM(v)}`}
              </title>
            </circle>
          </g>
        );
      })}

      {/* Oznake mjeseci */}
      {months.map((m, i) => (
        <text
          key={m}
          x={x(i)}
          y={H - 8}
          textAnchor="middle"
          fontSize="11"
          fontWeight={i === months.length - 1 ? 700 : 500}
          fill={
            i === months.length - 1
              ? "var(--color-accent-400)"
              : "rgba(148,163,184,0.85)"
          }
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mini sparkline za "Trend listu" (5–6 px visine, čisti SVG)          */
/* ------------------------------------------------------------------ */

export function Sparkline({
  history,
  trend,
  className = "",
}: {
  history: number[];
  trend: PriceTrend;
  className?: string;
}) {
  const color =
    trend === "pad"
      ? "var(--color-accent-400)"
      : trend === "rast"
        ? "var(--color-warn-400)"
        : "rgba(148,163,184,0.9)";

  const min = Math.min(...history);
  const max = Math.max(...history);
  const r = max - min || 1;
  const pts = history.map(
    (v, i) => `${((i * 100) / (history.length - 1)).toFixed(1)},${(28 - ((v - min) / r) * 22).toFixed(1)}`,
  );

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={`h-1.5 w-16 shrink-0 ${className}`}
      role="img"
      aria-label="Mini grafikon trenda cijene"
      focusable="false"
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}