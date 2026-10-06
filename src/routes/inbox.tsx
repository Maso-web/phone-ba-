import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * /inbox — lično sanduče `hello@phone.ba` (samo za vlasnika).
 *
 * Zaštićeno jednom lozinkom (`INBOX_PASSWORD` u okolini): stranica sama ne
 * sadrži nikakve podatke — sve ide preko `/api/inbox/*` koji traže sesijski
 * HttpOnly cookie. Stranica je `noindex, nofollow` (i `robots.txt` je blokira).
 */
export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "phone.ba — Sanduče" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: InboxPage,
});

type MessageListItem = {
  id: string;
  from_addr: string;
  subject: string;
  received_at: string;
  replied: boolean;
  preview: string;
};

type MessageFull = MessageListItem & {
  message_id: string | null;
  to_addr: string;
  body_text: string | null;
  body_html: string | null;
};

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("bs-BA", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortSender(from: string): string {
  const named = from.match(/^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/);
  if (named && named[1].trim() !== "") return named[1].trim();
  return from.replace(/[<>]/g, "").trim();
}

function senderAddress(from: string): string {
  return (from.match(/<([^>]+)>/)?.[1] ?? from).trim();
}

async function api(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return { status: res.status, data };
}

function InboxPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [open, setOpen] = useState<MessageFull | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeText, setComposeText] = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const loadList = useCallback(async () => {
    const { status, data } = await api("/api/inbox/list");
    if (status === 401) {
      setAuthed(false);
      return false;
    }
    if (status === 200 && data.ok) {
      setAuthed(true);
      setMessages((data.messages as MessageListItem[]) ?? []);
      return true;
    }
    setError(
      typeof data.error === "string" ? data.error : "Čitanje nije uspjelo.",
    );
    return false;
  }, []);

  useEffect(() => {
    void (async () => {
      await loadList();
      setReady(true);
    })();
  }, [loadList]);

  useEffect(() => {
    if (ready && !authed) passwordRef.current?.focus();
  }, [ready, authed]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { status, data } = await api("/api/inbox/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (status === 200 && data.ok) {
      setPassword("");
      setAuthed(true);
      await loadList();
      return;
    }
    setError(typeof data.error === "string" ? data.error : "Prijava nije uspjela.");
  };

  const logout = async () => {
    await api("/api/inbox/logout", { method: "POST" });
    setAuthed(false);
    setMessages([]);
    setOpen(null);
  };

  const openMessage = async (id: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const { status, data } = await api(`/api/inbox/get?id=${encodeURIComponent(id)}`);
    setBusy(false);
    if (status === 200 && data.ok) {
      setOpen(data.message as MessageFull);
      setReplyText("");
      setShowHtml(false);
      return;
    }
    if (status === 401) {
      setAuthed(false);
      return;
    }
    setError(typeof data.error === "string" ? data.error : "Poruka nije dostupna.");
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!open) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { status, data } = await api("/api/inbox/reply", {
      method: "POST",
      body: JSON.stringify({ id: open.id, text: replyText }),
    });
    setBusy(false);
    if (status === 200 && data.ok) {
      setReplyText("");
      setNotice(`Odgovor poslan na ${String(data.to ?? "")} (Resend ID: ${String(data.id ?? "")}).`);
      setOpen({ ...open, replied: true });
      await loadList();
      return;
    }
    setError(typeof data.error === "string" ? data.error : "Slanje nije uspjelo.");
  };

  const sendNew = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { status, data } = await api("/api/inbox/send", {
      method: "POST",
      body: JSON.stringify({
        to: composeTo,
        subject: composeSubject,
        text: composeText,
      }),
    });
    setBusy(false);
    if (status === 200 && data.ok) {
      setCompose(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeText("");
      setNotice(`Poruka poslana (Resend ID: ${String(data.id ?? "")}).`);
      return;
    }
    setError(typeof data.error === "string" ? data.error : "Slanje nije uspjelo.");
  };

  if (!ready) {
    return (
      <main className="container-site py-16">
        <p className="text-sm text-slate-400">Učitavanje…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="container-site flex min-h-[70vh] items-center justify-center py-16">
        <div className="surface-card w-full max-w-md p-6 sm:p-8">
          <p className="pill pill-blue mb-4">Lično sanduče</p>
          <h1 className="text-2xl font-extrabold text-white">
            Prijava na hello@phone.ba
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Ovo je zaštićeni pretinac za poštu na <strong>hello@phone.ba</strong>.
            Unesi lozinku sandučeta.
          </p>
          <form className="mt-6 space-y-3" onSubmit={login}>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Lozinka
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              disabled={busy || password === ""}
              className="btn-primary btn-md w-full disabled:opacity-50"
            >
              {busy ? "Provjera…" : "Prijavi se"}
            </button>
          </form>
          {error ? (
            <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <p className="mt-5 text-xs text-slate-500">
            Sesija traje 12 sati. Ako lozinku izgubiš, mijenja se u postavkama
            sajta (bez uticaja na poštu).
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container-site py-10 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="pill pill-green mb-2">hello@phone.ba</p>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Sanduče
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Poruke primljene na hello@phone.ba. Odgovor ide s istog naloga i
            ostaje u istoj niti.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => {
              setCompose((v) => !v);
              setOpen(null);
              setNotice(null);
            }}
          >
            {compose ? "Zatvori" : "Nova poruka"}
          </button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => void loadList()}
          >
            Osvježi
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => void logout()}>
            Odjava
          </button>
        </div>
      </div>

      {notice ? (
        <p className="mb-4 rounded-lg border border-accent-400/30 bg-accent-400/10 px-3 py-2 text-sm text-accent-200">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {compose ? (
        <form className="surface-card mb-6 space-y-3 p-5" onSubmit={sendNew}>
          <h2 className="text-lg font-bold text-white">Nova poruka</h2>
          <input
            type="email"
            required
            value={composeTo}
            onChange={(e) => setComposeTo(e.target.value)}
            placeholder="primaoc@primjer.ba"
            className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          />
          <input
            type="text"
            required
            value={composeSubject}
            onChange={(e) => setComposeSubject(e.target.value)}
            placeholder="Predmet"
            className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          />
          <textarea
            required
            rows={6}
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            placeholder="Tekst poruke…"
            className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary btn-sm" disabled={busy}>
              {busy ? "Šaljem…" : "Pošalji"}
            </button>
            <span className="text-xs text-slate-500">
              Šalje se kao hello@phone.ba (Resend). Prilozi nisu podržani.
            </span>
          </div>
        </form>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className="surface-card overflow-hidden">
          <header className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Primljeno ({messages.length})
            </h2>
            <span className="text-xs text-slate-500">zadnjih 50</span>
          </header>
          {messages.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Još nema primljenih poruka.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {messages.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => void openMessage(m.id)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-white/5 ${
                      open?.id === m.id ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-white">
                        {shortSender(m.from_addr)}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-500">
                        {formatTime(m.received_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-sm text-slate-300">
                        {m.subject || "(bez predmeta)"}
                      </span>
                      {m.replied ? (
                        <span className="pill pill-green shrink-0">odgovoreno</span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {m.preview}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card min-h-[16rem] overflow-hidden">
          {!open ? (
            <p className="px-4 py-16 text-center text-sm text-slate-400">
              Izaberi poruku s liste da je pročitaš i odgovoriš.
            </p>
          ) : (
            <div className="flex h-full flex-col">
              <header className="border-b border-white/5 px-4 py-3">
                <h2 className="text-base font-bold text-white">
                  {open.subject || "(bez predmeta)"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {shortSender(open.from_addr)} ·{" "}
                  <span className="text-slate-500">{senderAddress(open.from_addr)}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {formatTime(open.received_at)} → {open.to_addr}
                  {open.replied ? " · odgovoreno" : ""}
                </p>
              </header>

              <div className="flex gap-2 border-b border-white/5 px-4 py-2 text-xs">
                <button
                  type="button"
                  className={`chip ${!showHtml ? "" : "opacity-60"}`}
                  aria-pressed={!showHtml}
                  onClick={() => setShowHtml(false)}
                >
                  Tekst
                </button>
                <button
                  type="button"
                  className={`chip ${showHtml ? "" : "opacity-60"}`}
                  aria-pressed={showHtml}
                  disabled={!open.body_html}
                  onClick={() => setShowHtml(true)}
                >
                  HTML
                </button>
              </div>

              <div className="max-h-[26rem] overflow-auto px-4 py-4">
                {showHtml && open.body_html ? (
                  <iframe
                    title="Sadržaj poruke"
                    sandbox=""
                    srcDoc={open.body_html}
                    className="h-[24rem] w-full rounded-lg border border-white/10 bg-white"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
                    {open.body_text ?? "Ova poruka nema tekstualni dio."}
                  </pre>
                )}
              </div>

              <form
                className="mt-auto space-y-2 border-t border-white/5 px-4 py-4"
                onSubmit={sendReply}
              >
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Odgovor na ${senderAddress(open.from_addr)}…`}
                  className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="btn-primary btn-sm"
                    disabled={busy || replyText.trim() === ""}
                  >
                    {busy ? "Šaljem…" : "Pošalji odgovor"}
                  </button>
                  <span className="text-xs text-slate-500">
                    Bez priloga · odgovor se šalje s hello@phone.ba
                  </span>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
