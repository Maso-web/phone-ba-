import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  phones,
  type AttributeTag,
  type BrandSlug,
  type Phone,
  type PriceBand,
} from "~/data/phones";
import {
  filterPhones,
  formatKM,
  minPriceOf,
  normalize,
  sortPhones,
  type FilterOptions,
} from "~/lib/catalog";
import { track } from "~/lib/analytics";
import { PhoneVisual } from "./PhoneVisual";

/**
 * AI savjetnik — plutajući chat widget (isključivo client-side).
 *
 * Svjesno NIJE LLM: riječ je o determinističkom, pravilima vođenom
 * vodiču koji kroz 3 pitanja (budžet → namjena → brend) filtrira
 * postojeći katalog telefona ponovnom upotrebom filterPhones/sortPhones
 * iz src/lib/catalog.ts. Bez backenda, bez eksternih AI API-ja, bez
 * čuvanja podataka (sve stanje je u React state-u).
 */

/* ------------------------- Tipovi ------------------------- */

type Step = "budzet" | "namjena" | "brend" | "done";

/** Odgovor na budžet: cjenovni razred (čip) ili slobodan tekst ("do 500 KM") */
type BudgetAnswer = { kind: "band"; band: PriceBand } | { kind: "text"; q: string };
/** Namjena: atribut iz kataloga ili "Svakodnevna upotreba" (= bez filtera) */
type UseAnswer = AttributeTag | "svakodnevna";
type BrandAnswer = BrandSlug | "nije_bitno";

interface Answers {
  budzet?: BudgetAnswer;
  namjena?: UseAnswer;
  brend?: BrandAnswer;
}

interface QuickReply {
  label: string;
  value: string;
}

interface Recommendation {
  phones: Phone[];
  note?: string;
}

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  /** običan tekst, tekst + brzi odgovori, ili preporuke */
  kind: "text" | "chips" | "results";
  text: string;
  chips?: QuickReply[];
  result?: Recommendation;
}

/* ------------------------- Brzi odgovori ------------------------- */

const BUDZET_CHIPS: QuickReply[] = [
  { label: "Do 400 KM", value: "ispod_400" },
  { label: "400 – 800 KM", value: "400_800" },
  { label: "1000+ KM", value: "premium" },
  { label: "Nije bitno", value: "nije_bitno" },
];

const NAMJENA_CHIPS: QuickReply[] = [
  { label: "📷 Kamera", value: "najbolja_kamera" },
  { label: "🔋 Baterija", value: "najbolja_baterija" },
  { label: "🎮 Gaming", value: "najbolji_gaming" },
  { label: "📱 Svakodnevna upotreba", value: "svakodnevna" },
];

const BREND_CHIPS: QuickReply[] = [
  { label: "iPhone", value: "apple" },
  { label: "Samsung", value: "samsung" },
  { label: "Xiaomi", value: "xiaomi" },
  { label: "Honor", value: "honor" },
  { label: "Motorola", value: "motorola" },
  { label: "Realme", value: "realme" },
  { label: "OnePlus", value: "oneplus" },
  { label: "Google", value: "google" },
  { label: "Nije bitno", value: "nije_bitno" },
];

const ALL_CHIPS = [...BUDZET_CHIPS, ...NAMJENA_CHIPS, ...BREND_CHIPS];

const PLACEHOLDERS: Record<Step, string> = {
  budzet: "npr. do 500 KM",
  namjena: "npr. kamera ili baterija",
  brend: "npr. Samsung",
  done: "",
};

const INPUT_LABELS: Record<Step, string> = {
  budzet: "Upiši svoj budžet",
  namjena: "Upiši namjenu telefona",
  brend: "Upiši željeni brend",
  done: "",
};

/* ------------------------- Parsiranje slobodnog teksta ------------------------- */

function parseBudzetText(raw: string): BudgetAnswer | "nije_bitno" {
  const t = normalize(raw.trim());
  if (!t) return "nije_bitno";
  if (/(nije bitno|svejedno|bilo koji|ne znam|kakav god)/.test(t)) return "nije_bitno";
  if (/(premium|1000|hiljadu|iznad 800|vise od 800)/.test(t)) {
    return { kind: "band", band: "premium" };
  }
  if (/(ispod 400|do 400|budzet|jeftin|najjeftiniji)/.test(t)) {
    return { kind: "band", band: "ispod_400" };
  }
  if (/\d/.test(t)) {
    // "do 500 KM" / "od 400 do 600" — razumije postojeći parser iz catalog.ts
    return { kind: "text", q: raw };
  }
  return "nije_bitno";
}

function parseNamjenaText(raw: string): UseAnswer {
  const t = normalize(raw.trim());
  if (/kamer|foto|slik|portret/.test(t)) return "najbolja_kamera";
  if (/baterij|traj|punj/.test(t)) return "najbolja_baterija";
  if (/gaming|igr|gejming|igrica|publg|fortnite/.test(t)) return "najbolji_gaming";
  return "svakodnevna";
}

function parseBrendText(raw: string): BrandAnswer {
  const t = normalize(raw.trim());
  if (/(nije bitno|svejedno|bilo koji|ne znam)/.test(t)) return "nije_bitno";
  if (/iphone|apple/.test(t)) return "apple";
  if (/samsung|galaxy/.test(t)) return "samsung";
  if (/xiaomi|redmi|poco/.test(t)) return "xiaomi";
  if (/honor/.test(t)) return "honor";
  if (/motorola|\bmoto\b/.test(t)) return "motorola";
  if (/realme/.test(t)) return "realme";
  if (/oneplus|one plus/.test(t)) return "oneplus";
  if (/google|pixel/.test(t)) return "google";
  return "nije_bitno";
}

/* ------------------------- Preporuke (reuse kataloga) ------------------------- */

/**
 * Filtrira katalog odgovorima korisnika — ponovna upotreba postojećih
 * filterPhones/sortPhones (bez dupliranja logike pretrage).
 * - budžet čip → priceBand; budžet tekst → q (parser "do/od N KM")
 * - namjena → funkcija/atribut; "svakodnevna" ne filtrira
 * - brend → brand filter
 * Ako nema pogotka, vraća najpopularnije modele sa iskrenom napomenom.
 */
function recommend(answers: Answers): Recommendation {
  const opts: FilterOptions = {};
  if (answers.budzet?.kind === "band") opts.budzet = answers.budzet.band;
  else if (answers.budzet?.kind === "text") opts.q = answers.budzet.q;
  if (answers.namjena !== undefined && answers.namjena !== "svakodnevna") {
    opts.funkcija = answers.namjena;
  }
  if (answers.brend && answers.brend !== "nije_bitno") {
    opts.brend = answers.brend;
  }

  const matched = sortPhones(filterPhones(opts), "popularno");
  const top = matched.slice(0, 3);

  if (top.length === 3) return { phones: top };
  if (top.length === 0) {
    return {
      phones: sortPhones(phones, "popularno").slice(0, 3),
      note: "Nismo našli tačan spoj tvojih želja — evo najtraženijih modela na phone.ba.",
    };
  }
  const seen = new Set(top.map((p) => p.slug));
  const fill = sortPhones(phones, "popularno")
    .filter((p) => !seen.has(p.slug))
    .slice(0, 3 - top.length);
  return {
    phones: [...top, ...fill],
    note: "Bilo je manje od 3 tačna pogotka — dodali smo najtraženije modele iz kataloga.",
  };
}

/* ------------------------- Tekstovi pitanja ------------------------- */

function greetingMsg(id: number): ChatMessage {
  return {
    id,
    from: "bot",
    kind: "chips",
    text: "Zdravo! 👋 Ja sam AI savjetnik. Pomoći ću ti pronaći idealan telefon. Koliki ti je budžet?",
    chips: BUDZET_CHIPS,
  };
}

function questionMsg(step: Step, id: number): ChatMessage {
  if (step === "namjena") {
    return {
      id,
      from: "bot",
      kind: "chips",
      text: "Super, upisano! 👌 Za koju namjenu ti telefon najviše treba?",
      chips: NAMJENA_CHIPS,
    };
  }
  return {
    id,
    from: "bot",
    kind: "chips",
    text: "Još jedno pitanje: imaš li preferenciju brenda?",
    chips: BREND_CHIPS,
  };
}

function resultsMsg(rec: Recommendation, id: number): ChatMessage {
  return {
    id,
    from: "bot",
    kind: "results",
    text: "Evo modela koji najbolje odgovaraju tvojim željama:",
    result: rec,
  };
}

/* ------------------------- Widget ------------------------- */

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [greetingMsg(1)]);
  const [step, setStep] = useState<Step>("budzet");
  const [answers, setAnswers] = useState<Answers>({});
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  /** Brojač poruka — lokalni u widgetu da id-jevi budu stabilni i client-side */
  const idCounter = useRef(1);
  /** Generacija razgovora — poništava zastarjele timeoute nakon restarta */
  const generation = useRef(0);

  const nextId = () => ++idCounter.current;

  /* Auto-scroll na dno pri novim porukama */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking, open]);

  /* Fokus na input po otvaranju; Escape zatvara panel */
  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /**
   * Bot odgovara nakon kratke pauze "Razmišljam…" — čisto vizuelni efekat,
   * logika ostaje deterministička i trenutna.
   */
  const botSays = (build: () => ChatMessage) => {
    const gen = generation.current;
    setThinking(true);
    window.setTimeout(() => {
      if (gen !== generation.current) return; // restartovan razgovor
      setThinking(false);
      setMessages((prev) => [...prev, build()]);
    }, 480);
  };

  const restart = () => {
    generation.current += 1;
    setThinking(false);
    setAnswers({});
    setStep("budzet");
    setInput("");
    setMessages([greetingMsg(nextId())]);
  };

  const pushUserMsg = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), from: "user", kind: "text", text }]);
  };

  /* ------------------ Koraci razgovora ------------------ */

  const applyBudget = (b: BudgetAnswer | "nije_bitno") => {
    setAnswers((prev) => ({
      ...prev,
      budzet: b === "nije_bitno" ? undefined : b,
    }));
    setStep("namjena");
    botSays(() => questionMsg("namjena", nextId()));
  };

  const applyNamjena = (u: UseAnswer) => {
    setAnswers((prev) => ({ ...prev, namjena: u }));
    setStep("brend");
    botSays(() => questionMsg("brend", nextId()));
  };

  const applyBrend = (br: BrandAnswer) => {
    const done: Answers = { ...answers, brend: br };
    setAnswers(done);
    setStep("done");
    const rec = recommend(done);
    /* Poslovni događaj: savjetnik je dao preporuku (odgovori + koji modeli) */
    track("ai_advisor_recommendation", {
      budget:
        done.budzet === undefined
          ? "nije_bitno"
          : done.budzet.kind === "band"
            ? done.budzet.band
            : done.budzet.q,
      purpose: done.namjena ?? "svakodnevna",
      brand: br,
      results: rec.phones.map((p) => p.slug).join(","),
    });
    botSays(() => resultsMsg(rec, nextId()));
  };

  /* Klik na brzi odgovor (čip) */
  const onChip = (value: string) => {
    const label = ALL_CHIPS.find((c) => c.value === value)?.label ?? value;
    pushUserMsg(label);
    routeAnswer(value);
  };

  /* Slanje slobodnog teksta (Enter ili dugme) */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw || step === "done") return;
    pushUserMsg(raw);
    setInput("");
    if (step === "budzet") applyBudget(parseBudzetText(raw));
    else if (step === "namjena") applyNamjena(parseNamjenaText(raw));
    else if (step === "brend") applyBrend(parseBrendText(raw));
  };

  /* Usmjerava odgovor čipa prema trenutnom koraku */
  const routeAnswer = (value: string) => {
    if (step === "budzet") {
      const band = value as PriceBand | "nije_bitno";
      applyBudget(band === "nije_bitno" ? "nije_bitno" : { kind: "band", band });
      return;
    }
    if (step === "namjena") {
      const tag = value as UseAnswer;
      applyNamjena(
        tag === "najbolja_kamera" ||
          tag === "najbolja_baterija" ||
          tag === "najbolji_gaming" ||
          tag === "svakodnevna"
          ? tag
          : parseNamjenaText(value),
      );
      return;
    }
    if (step === "brend") {
      applyBrend(value === "nije_bitno" ? "nije_bitno" : (value as BrandSlug));
    }
  };

  return (
    <>
      {/* -------------------------------------------------------- */}
      {/* Launcher dugme                                          */}
      {/* -------------------------------------------------------- */}
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => {
            /* Poslovni događaj: otvaranje AI savjetnika */
            track("ai_advisor_opened");
            setOpen(true);
          }}
          aria-label="Otvori AI savjetnika — preporuke telefona kroz 3 pitanja"
          className="group fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 shadow-[0_10px_34px_-8px_rgba(62,123,250,0.75),0_0_0_1px_rgba(255,255,255,0.12)] transition-all duration-200 hover:scale-105 hover:shadow-[0_14px_40px_-8px_rgba(34,197,94,0.7),0_0_0_1px_rgba(255,255,255,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 active:scale-95"
        >
          <span
            aria-hidden
            className="absolute inset-0 -z-10 animate-pulse-soft rounded-full bg-brand-500/40 blur-lg group-hover:bg-accent-500/40"
          />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-white"
          >
            <path d="M12 3v2M12 19v2M5 7l1.7 1M18.3 16l1.7 1M3 12h2M19 12h2M7.7 6.7 6 5M18.3 17.3 20 19M7.7 17.3 6 19M18.3 6.7 20 5" />
            <circle cx="12" cy="12" r="3.4" />
          </svg>
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-xl border border-white/10 bg-ink-800/95 px-3 py-1.5 text-[12px] font-medium text-slate-200 opacity-0 shadow-xl backdrop-blur transition-opacity duration-200 group-hover:opacity-100 sm:block">
            AI savjetnik — pitaj za preporuku
          </span>
        </button>
      )}

      {/* -------------------------------------------------------- */}
      {/* Chat panel                                              */}
      {/* -------------------------------------------------------- */}
      {open && (
        <div
          role="dialog"
          aria-label="AI savjetnik — chat za preporuke telefona"
          className="fixed bottom-4 right-4 z-[70] flex h-[min(600px,calc(100dvh-5.5rem))] w-[min(calc(100vw-2rem),400px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-900/90 shadow-[0_40px_90px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(62,123,250,0.12)] backdrop-blur-2xl animate-fade-up"
        >
          {/* Zaglavlje */}
          <div className="flex items-center gap-3 border-b border-white/[0.07] bg-ink-850/80 px-4 py-3.5">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="#05080d"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <path d="M12 4v1.5M12 18.5V20M5.5 8l1.3.8M17.2 15.2l1.3.8M3.5 12H5M19 12h1.5M7.2 7.2 5.9 5.9M16.8 16.8l1.3 1.3" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900 bg-accent-400"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold leading-tight text-white">
                AI savjetnik
              </p>
              <p className="text-[11.5px] text-slate-500">
                Demo vodič kroz katalog · bez čuvanja podataka
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label="Zatvori AI savjetnika"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.1] hover:text-white focus-visible:outline-2 focus-visible:outline-brand-400"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* Poruke */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} onChip={onChip} />
            ))}

            {thinking && (
              <div className="flex items-center gap-2 text-[12.5px] text-slate-400">
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-brand-400 border-t-transparent" />
                Razmišljam…
              </div>
            )}

            {step === "done" && !thinking && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={restart}
                  className="btn-ghost btn-sm"
                >
                  ↺ Počni ispočetka
                </button>
              </div>
            )}
          </div>

          {/* Unos */}
          {step === "done" ? (
            <div className="border-t border-white/[0.07] bg-ink-850/70 px-4 py-3">
              <p className="text-center text-[11px] leading-relaxed text-slate-500">
                Preporuke su demo vodič zasnovan na katalogu phone.ba — cijene
                s OLX.ba su stvarni oglasi; ponude telekoma i trgovina su demo.
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-white/[0.07] bg-ink-850/70 px-3 py-2.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label={INPUT_LABELS[step]}
                placeholder={PLACEHOLDERS[step]}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-800/90 px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                aria-label="Pošalji odgovor"
                disabled={!input.trim()}
                className="btn-primary btn-sm shrink-0 !px-3.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M5 12h13M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

/* ------------------------- Mjehurić poruke ------------------------- */

function MessageBubble({
  msg,
  onChip,
}: {
  msg: ChatMessage;
  onChip: (value: string) => void;
}) {
  if (msg.from === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600/90 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white shadow-lg">
          {msg.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-[10px] font-black text-ink-950"
      >
        AI
      </span>
      <div className="min-w-0 max-w-[88%]">
        <div className="rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.06] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-200">
          {msg.text}
        </div>

        {/* Brzi odgovori */}
        {msg.kind === "chips" && msg.chips && (
          <div
            className="mt-2 flex flex-wrap gap-1.5"
            role="group"
            aria-label="Brzi odgovori"
          >
            {msg.chips.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onChip(c.value)}
                className="chat-chip"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Preporuke */}
        {msg.kind === "results" && msg.result && (
          <div className="mt-2.5 space-y-2">
            {msg.result.note && (
              <p className="rounded-xl border border-warn-500/20 bg-warn-500/[0.07] px-3 py-2 text-[12px] leading-relaxed text-warn-300/90">
                ℹ️ {msg.result.note}
              </p>
            )}
            {msg.result.phones.map((p) => (
              <div
                key={p.slug}
                className="rounded-2xl border border-white/10 bg-ink-800/80 p-3 transition-colors duration-150 hover:border-brand-500/30"
              >
                <div className="flex items-center gap-3">
                  <PhoneVisual
                    brand={p.brand}
                    size="xs"
                    image={p.image}
                    name={p.name}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-white">
                      {p.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {[
                        p.specs.storage,
                        p.specs.battery,
                        p.specs.camera.split(" ")[0],
                      ].map((spec) => (
                        <span
                          key={spec}
                          className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] font-medium text-slate-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2">
                  <p className="text-[13.5px] text-slate-400">
                    od{" "}
                    <strong className="font-extrabold text-accent-400">
                      {formatKM(minPriceOf(p))}
                    </strong>
                  </p>
                  <Link
                    to="/telefon/$slug"
                    params={{ slug: p.slug }}
                    className="btn-ghost !h-8 !px-3 !rounded-lg !text-[12px]"
                  >
                    Pogledaj
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}