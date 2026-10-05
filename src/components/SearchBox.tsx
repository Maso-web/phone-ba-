import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  filterPhones,
  formatKM,
  minPriceOf,
  sortPhones,
} from "~/lib/catalog";
import { PhoneVisual } from "./PhoneVisual";
import { track } from "~/lib/analytics";

/**
 * Velika AI pretraga iz hero sekcije.
 * - filtrira katalog uživo dok se kuca (client-side, bez backenda)
 * - Enter ili "Traži" → /telefoni?pretraga=...
 * - prazno polje → prikazuje najpopularnije modele
 */
export function SearchBox({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const filtered = filterPhones({ q: query });
    return sortPhones(filtered, "popularno").slice(0, 5);
  }, [query]);

  const goToCatalog = (q: string) => {
    setOpen(false);
    const trimmed = q.trim();
    /* Poslovni događaj: korisnik je pokrenuo pretragu (hero AI pretraga) */
    track("search_used", {
      source: "hero",
      filters: trimmed ? "pretraga" : "najpopularniji",
      firstFilter: trimmed || "najpopularniji",
    });
    void navigate({
      to: "/telefoni",
      search: (prev) => ({ ...prev, pretraga: trimmed || undefined }),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToCatalog(query);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-controls="ai-search-results"
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/85 py-1.5 pl-4 pr-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-200 focus-within:border-brand-500/60 focus-within:shadow-[0_0_0_4px_rgba(62,123,250,0.16),0_24px_60px_-24px_rgba(0,0,0,0.9)]"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-brand-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label="AI pretraga telefona — upiši budžet, namjenu ili brend"
          aria-autocomplete="list"
          placeholder="Tražim telefon do 600 KM sa odličnom baterijom i kamerom"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Odgoda da omogući klik na stavke unutar rezultata
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white placeholder:text-slate-500 focus:outline-none sm:text-base"
        />
        <button
          type="button"
          onClick={() => goToCatalog(query)}
          className="btn-primary btn-sm hidden shrink-0 sm:inline-flex"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Traži
        </button>
        <button
          type="button"
          onClick={() => goToCatalog(query)}
          aria-label="Pokreni pretragu"
          className="btn-primary btn-sm inline-flex !px-3 sm:hidden"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </div>

      {/* Rezultati uživo */}
      {open && (
        <ul
          id="ai-search-results"
          role="listbox"
          aria-label="Rezultati pretrage telefona"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-hidden overflow-y-auto rounded-2xl border border-white/10 bg-ink-900/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <li className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {query.trim()
              ? `Rezultati za "${query.trim()}"`
              : "Najpopularniji modeli"}
          </li>

          {results.length === 0 ? (
            <li className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-300">
                Nema rezultata za tvoju pretragu 😕
              </p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                Probaj "do 500 KM", "kamera" ili "baterija".
              </p>
              <button
                type="button"
                onClick={() => goToCatalog(query)}
                onMouseDown={(e) => e.preventDefault()}
                className="btn-ghost btn-sm mt-4"
              >
                Prikaži sve telefone
              </button>
            </li>
          ) : (
            results.map((phone) => (
              <li key={phone.slug} role="option" aria-selected={false}>
                <Link
                  to="/telefon/$slug"
                  params={{ slug: phone.slug }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-white/[0.06]"
                >
                  <PhoneVisual
                    brand={phone.brand}
                    size="xs"
                    image={phone.image}
                    name={phone.name}
                    className="shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-white">
                      {phone.name}
                    </span>
                    <span className="block truncate text-[12px] text-slate-500">
                      {phone.tagline}
                    </span>
                  </span>
                  <span className="shrink-0 text-[14.5px] font-bold text-accent-400">
                    od {formatKM(minPriceOf(phone))}
                  </span>
                </Link>
              </li>
            ))
          )}

          {results.length > 0 && (
            <li className="border-t border-white/[0.06] px-4 py-2.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToCatalog(query)}
                className="text-[13px] font-semibold text-brand-300 transition-colors hover:text-white"
              >
                Prikaži sve telefone →
              </button>
              <p className="mt-1 text-[11px] text-slate-600">
                Cijene s OLX.ba su stvarni oglasi — ponude telekoma i trgovina
                su demo.
              </p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}