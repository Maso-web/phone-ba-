import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
/**
 * /inbox — lično sanduče `hello@phone.ba` (samo za vlasnika).
 *
 * Zaštićeno jednom lozinkom (`INBOX_PASSWORD` u okolini): stranica sama ne
 * sadrži nikakve podatke — sve ide preko `/api/inbox/*` koji traže sesijski
 * HttpOnly cookie. Stranica je `noindex, nofollow` (i `robots.txt` je blokira).
 *
 * v2: slanje s prilozima (do 3 MB ukupno), predlošci (memorandum / poslovna /
 * blanko / vlastiti HTML), slanje na više adresa, arhiva poslanog, preuzimanje
 * priloga iz primljenih poruka.
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
type AttachmentRow = {
  id: string;
  email_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
};
type OutboundRow = {
  id: string;
  to_addr: string;
  subject: string;
  sent_at: string;
  attachment_count: number;
};
type TemplateItem = { id: string; name: string; description: string };
type PickedFile = {
  filename: string;
  contentType: string;
  contentBase64: string;
  size: number;
};
const ALLOWED_EXT = new Set([
  "pdf", "docx", "doc", "xls", "xlsx", "ppt", "pptx", "odt", "rtf",
  "txt", "csv", "md", "png", "jpg", "jpeg", "gif", "webp", "zip",
]);
const MAX_FILE = 3 * 1024 * 1024; // 3 MB po fajlu
const MAX_TOTAL = 3 * 1024 * 1024; // 3 MB ukupno
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
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function shortSender(from: string): string {
  const named = from.match(/^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/);
  if (named && named[1].trim() !== "") return named[1].trim();
  return from.replace(/[<>]/g, "").trim();
}
function senderAddress(from: string): string {
  return (from.match(/<([^>]+)>/)?.[1] ?? from).trim();
}
function extOf(name: string): string {
  const m = /\.([A-Za-z0-9]+)$/.exec(name);
  return m ? m[1].toLowerCase() : "";
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
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}
function InboxPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"in" | "out">("in");
  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [sent, setSent] = useState<OutboundRow[]>([]);
  const [open, setOpen] = useState<MessageFull | null>(null);
  const [openAtts, setOpenAtts] = useState<AttachmentRow[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [showHtml, setShowHtml] = useState(false);
  // Nova poruka
  const [compose, setCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeText, setComposeText] = useState("");
  const [composeTemplate, setComposeTemplate] = useState("poslovna");
  const [composeHtmlMode, setComposeHtmlMode] = useState(false);
  const [composeHtmlText, setComposeHtmlText] = useState("");
  const [composeFiles, setComposeFiles] = useState<PickedFile[]>([]);
  const composeFileRef = useRef<HTMLInputElement | null>(null);
  // Odgovor
  const [replyText, setReplyText] = useState("");
  const [replyTemplate, setReplyTemplate] = useState("poslovna");
  const [replyFiles, setReplyFiles] = useState<PickedFile[]>([]);
  const replyFileRef = useRef<HTMLInputElement | null>(null);
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
  const loadSent = useCallback(async () => {
    if (!authed) return;
    const { status, data } = await api("/api/inbox/sent");
    if (status === 200 && data.ok) {
      setSent((data.messages as OutboundRow[]) ?? []);
    }
  }, [authed]);
  const loadTemplates = useCallback(async () => {
    if (!authed) return;
    const { status, data } = await api("/api/inbox/templates");
    if (status === 200 && data.ok) {
      setTemplates((data.templates as TemplateItem[]) ?? []);
    }
  }, [authed]);
  useEffect(() => {
    void (async () => {
      await loadList();
      setReady(true);
    })();
  }, [loadList]);
  useEffect(() => {
    if (ready && authed) {
      void loadSent();
      void loadTemplates();
    }
  }, [ready, authed, loadSent, loadTemplates]);
  useEffect(() => {
    if (ready && !authed) passwordRef.current?.focus();
  }, [ready, authed]);

  const resetCompose = () => {
    setComposeTo("");
    setComposeSubject("");
    setComposeText("");
    setComposeTemplate("poslovna");
    setComposeHtmlMode(false);
    setComposeHtmlText("");
    setComposeFiles([]);
  };
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
    setSent([]);
    setOpen(null);
    setOpenAtts([]);
  };
  const openMessage = async (id: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const { status, data } = await api(
      `/api/inbox/get?id=${encodeURIComponent(id)}`,
    );
    setBusy(false);
    if (status === 200 && data.ok) {
      setOpen(data.message as MessageFull);
      setOpenAtts((data.attachments as AttachmentRow[]) ?? []);
      setReplyText("");
      setReplyFiles([]);
      setReplyTemplate("poslovna");
      setShowHtml(false);
      return;
    }
    setError(typeof data.error === "string" ? data.error : "Čitanje nije uspjelo.");
  };
  const pickFiles = async (
    files: FileList | null,
    target: "compose" | "reply",
  ) => {
    if (!files || files.length === 0) return;
    const picked: PickedFile[] = [];
    const current = target === "compose" ? composeFiles : replyFiles;
    let total = current.reduce((sum, f) => sum + f.size, 0);
    for (const file of Array.from(files)) {
      const ext = extOf(file.name);
      if (!ALLOWED_EXT.has(ext)) {
        setError(
          `Vrsta fajla "${file.name}" nije dozvoljena (PDF, Office, slike, ZIP...).`,
        );
        continue;
      }
      if (file.size > MAX_FILE) {
        setError(`Fajl "${file.name}" je veći od 3 MB.`);
        continue;
      }
      total += file.size;
      if (total > MAX_TOTAL) {
        setError("Prilozi ukupno prelaze 3 MB.");
        break;
      }
      const contentBase64 = await readFileAsBase64(file);
      picked.push({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        contentBase64,
        size: file.size,
      });
    }
    if (picked.length === 0) return;
    if (target === "compose") {
      setComposeFiles((prev) => [...prev, ...picked]);
    } else {
      setReplyFiles((prev) => [...prev, ...picked]);
    }
  };
  const removeFile = (target: "compose" | "reply", index: number) => {
    if (target === "compose") {
      setComposeFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setReplyFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };
  const sendCompose = async (event: React.FormEvent) => {
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
        templateId: composeHtmlMode ? null : composeTemplate,
        html: composeHtmlMode ? composeHtmlText : null,
        attachments: composeFiles.map((f) => ({
          filename: f.filename,
          contentType: f.contentType,
          contentBase64: f.contentBase64,
        })),
      }),
    });
    setBusy(false);
    if (status === 200 && data.ok) {
      setCompose(false);
      resetCompose();
      setNotice("Poruka je poslana.");
      void loadSent();
      void loadList();
      return;
    }
    setError(typeof data.error === "string" ? data.error : "Slanje nije uspjelo.");
  };
  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!open) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { status, data } = await api("/api/inbox/reply", {
      method: "POST",
      body: JSON.stringify({
        id: open.id,
        text: replyText,
        templateId: replyTemplate,
        attachments: replyFiles.map((f) => ({
          filename: f.filename,
          contentType: f.contentType,
          contentBase64: f.contentBase64,
        })),
      }),
    });
    setBusy(false);
    if (status === 200 && data.ok) {
      setReplyText("");
      setReplyFiles([]);
      setNotice("Odgovor je poslan.");
      void loadSent();
      void loadList();
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
            Ovo je Vaš zaštićeni pretinac za poštu na{" "}
            <strong>hello@phone.ba</strong>. Unesite lozinku sandučeta.
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
            Sesija traje 12 sati. Lozinka se čuva u postavkama sajta.
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
            Primljene poruke, odgovori s prilozima, predlošci i arhiva poslanog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => {
              setCompose((v) => !v);
              setOpen(null);
              setOpenAtts([]);
              setNotice(null);
            }}
          >
            {compose ? "Zatvori pisanje" : "✍ Nova poruka"}
          </button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => {
              void loadList();
              void loadSent();
              setNotice("Osvježeno.");
            }}
          >
            Osvježi
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={logout}>
            Odjava
          </button>
        </div>
      </div>
      {notice ? (
        <p className="mb-4 rounded-lg border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-200">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {compose ? (
        <form
          className="surface-card mb-6 space-y-4 p-5 sm:p-6"
          onSubmit={sendCompose}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Nova poruka</h2>
            <span className="text-xs text-slate-500">
              Šalje se s hello@phone.ba
            </span>
          </div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Za (adrese odvojite zarezom)
            <input
              type="text"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              placeholder="ime@firma.ba, druga@adresa.ba"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Predmet
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Predmet poruke"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
            />
          </label>
          <div className="flex flex-wrap items-end gap-4">
            <label className="block flex-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Predložak izgleda
              <select
                value={composeTemplate}
                onChange={(e) => setComposeTemplate(e.target.value)}
                disabled={composeHtmlMode}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400 disabled:opacity-50"
              >
                {templates.length === 0 ? (
                  <option value="poslovna">Poslovna poruka</option>
                ) : (
                  templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="flex items-center gap-2 pb-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={composeHtmlMode}
                onChange={(e) => setComposeHtmlMode(e.target.checked)}
                className="h-4 w-4 accent-brand-400"
              />
              Vlastiti HTML izgled
            </label>
          </div>
          {composeHtmlMode ? (
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              HTML tijela poruke
              <textarea
                rows={7}
                value={composeHtmlText}
                onChange={(e) => setComposeHtmlText(e.target.value)}
                spellCheck={false}
                placeholder={"<!doctype html>…"}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 font-mono text-xs text-white outline-none focus:border-brand-400"
              />
            </label>
          ) : (
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tekst poruke
              <textarea
                rows={8}
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                placeholder="Sadržaj poruke…"
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
              />
            </label>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Prilozi (do 3 MB po fajlu, ukupno 3 MB)
            </p>
            <input
              ref={composeFileRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.xls,.xlsx,.ppt,.pptx,.odt,.rtf,.txt,.csv,.md,.png,.jpg,.jpeg,.gif,.webp,.zip"
              onChange={(e) => {
                void pickFiles(e.target.files, "compose");
                e.target.value = "";
              }}
              className="mt-2 block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-300 hover:file:bg-brand-500/30"
            />
            {composeFiles.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {composeFiles.map((f, i) => (
                  <li
                    key={`${f.filename}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-ink-900 px-3 py-1.5 text-xs text-slate-300"
                  >
                    <span className="truncate">
                      📎 {f.filename}{" "}
                      <span className="text-slate-500">({formatSize(f.size)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile("compose", i)}
                      className="shrink-0 text-red-300 hover:text-red-200"
                    >
                      Ukloni
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="btn-primary btn-md"
              disabled={
                busy ||
                composeTo.trim() === "" ||
                composeSubject.trim() === "" ||
                (composeText.trim() === "" &&
                  !(composeHtmlMode && composeHtmlText.trim() !== ""))
              }
            >
              {busy ? "Šaljem…" : "Pošalji"}
            </button>
            <button
              type="button"
              className="btn-ghost btn-md"
              onClick={() => {
                setCompose(false);
                resetCompose();
              }}
            >
              Odustani
            </button>
          </div>
        </form>
      ) : null}

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`chip ${tab === "in" ? "" : "opacity-60"}`}
          onClick={() => {
            setTab("in");
            setCompose(false);
          }}
        >
          Primljeno ({messages.length})
        </button>
        <button
          type="button"
          className={`chip ${tab === "out" ? "" : "opacity-60"}`}
          onClick={() => {
            setTab("out");
            setCompose(false);
            void loadSent();
          }}
        >
          Poslano ({sent.length})
        </button>
      </div>

      {tab === "out" ? (
        <section className="surface-card overflow-hidden">
          {sent.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-slate-400">
              Još nema poslanih poruka.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {sent.map((m) => (
                <li key={m.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">
                      {m.subject || "(bez predmeta)"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTime(m.sent_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    → {m.to_addr}
                    {m.attachment_count > 0 ? (
                      <span className="ml-2 text-slate-500">
                        📎 {m.attachment_count}
                      </span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section className="surface-card overflow-hidden">
            {messages.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-slate-400">
                Nema poruka. Pišite na hello@phone.ba.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {messages.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-white/5"
                      onClick={() => void openMessage(m.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">
                          {shortSender(m.from_addr)}
                        </span>
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatTime(m.received_at)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="truncate text-sm text-slate-300">
                          {m.subject || "(bez predmeta)"}
                        </span>
                        {m.replied ? (
                          <span className="pill pill-green shrink-0">
                            odgovoreno
                          </span>
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
                Izaberite poruku s liste da je pročitate i odgovorite.
              </p>
            ) : (
              <div className="flex h-full flex-col">
                <header className="border-b border-white/5 px-4 py-3">
                  <h2 className="text-base font-bold text-white">
                    {open.subject || "(bez predmeta)"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {shortSender(open.from_addr)} ·{" "}
                    <span className="text-slate-500">
                      {senderAddress(open.from_addr)}
                    </span>
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
                {openAtts.length > 0 ? (
                  <div className="border-b border-white/5 px-4 py-2">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Prilozi
                    </p>
                    <ul className="space-y-1">
                      {openAtts.map((a) => (
                        <li key={a.id}>
                          <a
                            href={`/api/inbox/attachment?id=${encodeURIComponent(a.id)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-ink-900 px-3 py-1.5 text-xs text-slate-300 hover:border-brand-400/40"
                          >
                            <span className="truncate">📎 {a.filename}</span>
                            <span className="shrink-0 text-slate-500">
                              {formatSize(a.size_bytes)} · preuzmi
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="max-h-[22rem] overflow-auto px-4 py-4">
                  {showHtml && open.body_html ? (
                    <iframe
                      title="Sadržaj poruke"
                      sandbox=""
                      srcDoc={open.body_html}
                      className="h-[20rem] w-full rounded-lg border border-white/10 bg-white"
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
                    <select
                      value={replyTemplate}
                      onChange={(e) => setReplyTemplate(e.target.value)}
                      className="rounded-lg border border-white/10 bg-ink-900 px-2 py-1.5 text-xs text-white outline-none focus:border-brand-400"
                    >
                      {templates.length === 0 ? (
                        <option value="poslovna">Poslovna poruka</option>
                      ) : (
                        templates
                          .filter((t) => t.id !== "memorandum")
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))
                      )}
                    </select>
                    <input
                      ref={replyFileRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.xls,.xlsx,.ppt,.pptx,.odt,.rtf,.txt,.csv,.md,.png,.jpg,.jpeg,.gif,.webp,.zip"
                      onChange={(e) => {
                        void pickFiles(e.target.files, "reply");
                        e.target.value = "";
                      }}
                      className="block max-w-[12rem] text-[11px] text-slate-400 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-2 file:py-1 file:text-[11px] file:font-semibold file:text-brand-300"
                    />
                    {replyFiles.length > 0 ? (
                      <span className="text-[11px] text-slate-400">
                        {replyFiles.length} prilog(a) ·{" "}
                        {formatSize(
                          replyFiles.reduce((s, f) => s + f.size, 0),
                        )}
                        <button
                          type="button"
                          className="ml-1 text-red-300 hover:text-red-200"
                          onClick={() => setReplyFiles([])}
                        >
                          ukloni
                        </button>
                      </span>
                    ) : null}
                    <button
                      type="submit"
                      className="btn-primary btn-sm"
                      disabled={busy || replyText.trim() === ""}
                    >
                      {busy ? "Šaljem…" : "Pošalji odgovor"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}