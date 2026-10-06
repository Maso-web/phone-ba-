/**
 * Server-only pomoćnici za lično sanduče `hello@phone.ba`.
 *
 * Protok: Resend INBOUND (webhook `email.received`) → `/api/inbound` → Neon
 * tabela `inbound_email` → zaštićena stranica `/inbox` (+ `/api/inbox/*`) gdje se
 * poruke čitaju i na njih odgovara preko Resend API-ja (From: hello@phone.ba,
 * `In-Reply-To` = originalni Message-ID, da nit ostane cijela).
 *
 * Sigurnosna pravila (ne kršiti):
 *  - nikad ne logujemo tijelo poruke, samo metapodatke/obilježja,
 *  - `INBOX_PASSWORD` je jedina lozinka; sesija je HttpOnly potpisan cookie (12 h),
 *  - webhook se prihvata samo uz ispravan svix potpis (RESEND_WEBHOOK_SECRET),
 *  - sve greške se vraćaju bez tehničkih detalja prema klijentu.
 */
import crypto from "node:crypto";
import { sql } from "~/db";

export const SESSION_COOKIE = "pb_inbox_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

const RESEND_BASE = "https://api.resend.com";
export const INBOX_ADDRESS = "hello@phone.ba";
const MAIL_FROM = `phone.ba <${INBOX_ADDRESS}>`;

/** Koje env varijable rutama trebaju (bez vrijednosti — samo imena). */
export function missingInboxEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.INBOX_PASSWORD?.trim()) missing.push("INBOX_PASSWORD");
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  return missing;
}

export function missingInboundEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.INBOX_PASSWORD?.trim()) missing.push("INBOX_PASSWORD");
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  if (!process.env.RESEND_WEBHOOK_SECRET?.trim())
    missing.push("RESEND_WEBHOOK_SECRET");
  return missing;
}

export function json(body: unknown, status: number, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(headers ?? {}),
    },
  });
}

/* ------------------------------------------------------------------ *
 * Neon (tabela inbound_email)
 * ------------------------------------------------------------------ */

export type InboundEmail = {
  id: string;
  message_id: string | null;
  from_addr: string;
  to_addr: string;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  received_at: string;
  replied: boolean;
};

let schemaReady: Promise<void> | null = null;

/**
 * Tabela se pravi jednom (idempotentno) pri prvom zahtjevu — tako nije potreban
 * nijedan ručni korak u bazi, a ponovni pozivi su jeftini.
 */
export function ensureInboxSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`
        create table if not exists inbound_email (
          id text primary key,
          message_id text,
          from_addr text not null default '',
          to_addr text not null default '',
          subject text not null default '',
          body_text text,
          body_html text,
          received_at timestamptz not null default now(),
          replied boolean not null default false
        )`;
      await db`
        create index if not exists inbound_email_received_at_idx
          on inbound_email (received_at desc)`;
      await db`
        create table if not exists inbound_attachment (
          id text primary key,
          email_id text not null,
          filename text not null default '',
          content_type text not null default '',
          size_bytes bigint not null default 0,
          data bytea not null,
          created_at timestamptz not null default now()
        )`;
      await db`
        create index if not exists inbound_attachment_email_idx
          on inbound_attachment (email_id)`;
      await db`
        create table if not exists outbound_email (
          id text primary key,
          to_addr text not null default '',
          subject text not null default '',
          body_text text,
          body_html text,
          attachment_count integer not null default 0,
          sent_at timestamptz not null default now()
        )`;
      await db`
        create index if not exists outbound_email_sent_at_idx
          on outbound_email (sent_at desc)`;
      await db`
        create table if not exists mail_template (
          id text primary key,
          name text not null default '',
          description text not null default '',
          html text not null
        )`;
      for (const [id, name, description, html] of TEMPLATE_SEED) {
        await db`
          insert into mail_template (id, name, description, html)
          values (${id}, ${name}, ${description}, ${html})
          on conflict (id) do nothing`;
      }
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function insertInbound(row: {
  id: string;
  messageId: string | null;
  from: string;
  to: string;
  subject: string;
  text: string | null;
  html: string | null;
  receivedAt: string | null;
}): Promise<boolean> {
  await ensureInboxSchema();
  const db = sql();
  const received = row.receivedAt ? new Date(row.receivedAt) : new Date();
  const receivedAt = Number.isNaN(received.getTime())
    ? new Date().toISOString()
    : received.toISOString();
  const inserted = await db`
    insert into inbound_email
      (id, message_id, from_addr, to_addr, subject, body_text, body_html, received_at)
    values
      (${row.id}, ${row.messageId}, ${row.from}, ${row.to}, ${row.subject},
       ${row.text}, ${row.html}, ${receivedAt})
    on conflict (id) do nothing
    returning id`;
  return inserted.length > 0;
}

export async function listInbound(limit = 50): Promise<
  Array<
    Pick<
      InboundEmail,
      "id" | "from_addr" | "subject" | "received_at" | "replied"
    > & { preview: string }
  >
> {
  await ensureInboxSchema();
  const db = sql();
  const rows = await db`
    select id, from_addr, subject, received_at, replied,
           left(coalesce(body_text, ''), 180) as preview
      from inbound_email
     order by received_at desc
     limit ${limit}`;
  return rows as never;
}

export async function getInbound(id: string): Promise<InboundEmail | null> {
  await ensureInboxSchema();
  const db = sql();
  const rows = await db`
    select id, message_id, from_addr, to_addr, subject,
           body_text, body_html, received_at, replied
      from inbound_email
     where id = ${id}
     limit 1`;
  return (rows[0] as InboundEmail | undefined) ?? null;
}

export async function markReplied(id: string): Promise<void> {
  await ensureInboxSchema();
  const db = sql();
  await db`update inbound_email set replied = true where id = ${id}`;
}

/* ------------------------------------------------------------------ *
 * Resend API
 * ------------------------------------------------------------------ */

function resendKey(): string {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return key;
}

/** Puni sadržaj primljene poruke (tijelo je van webhook payloada). */
export async function fetchReceivedEmail(emailId: string): Promise<{
  text: string | null;
  html: string | null;
  subject: string | null;
  from: string | null;
  to: string | null;
  messageId: string | null;
  createdAt: string | null;
  attachments: ReceivedAttachment[];
}> {
  const res = await fetch(`${RESEND_BASE}/emails/receiving/${emailId}`, {
    headers: { Authorization: `Bearer ${resendKey()}` },
  });
  if (!res.ok) {
    throw new Error(`Resend receiving fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const asString = (v: unknown): string | null =>
    typeof v === "string" && v !== "" ? v : null;
  const to = data.to;
  const rawAtts = (data.attachments ??
    data.attachements ??
    []) as Array<Record<string, unknown>>;
  const attachments: ReceivedAttachment[] = Array.isArray(rawAtts)
    ? rawAtts
        .filter((a) => a && typeof a === "object")
        .map((a) => {
          const content = asString(a.content) ?? asString(a.data) ?? "";
          return {
            filename: asString(a.filename) ?? "prilog",
            contentBase64: content,
            contentType:
              asString(a.content_type) ?? asString(a.contentType) ?? null,
          };
        })
        .filter((a) => a.contentBase64 !== "")
    : [];
  return {
    text: asString(data.text) ?? asString(data.text_body) ?? null,
    html: asString(data.html) ?? asString(data.html_body) ?? null,
    subject: asString(data.subject),
    from: asString(data.from),
    to: Array.isArray(to) ? to.join(", ") : asString(to) ?? null,
    messageId: asString(data.message_id) ?? asString(data.messageId) ?? null,
    createdAt: asString(data.created_at) ?? asString(data.createdAt) ?? null,
    attachments,
  };
}
/** Slanje preko Resend API-ja (isto kao `hello@phone.ba` u newsletteru). */
export async function sendViaResend(input: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string | null;
  inReplyTo?: string | null;
  attachments?: AttachInput[];
}): Promise<string> {
  const headers: Record<string, string> = {};
  if (input.inReplyTo) {
    headers["In-Reply-To"] = input.inReplyTo;
    headers["References"] = input.inReplyTo;
  }
  const payload: Record<string, unknown> = {
    from: MAIL_FROM,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    text: input.text,
  };
  if (input.html) payload.html = input.html;
  if (Object.keys(headers).length > 0) payload.headers = headers;
  if (input.attachments && input.attachments.length > 0) {
    payload.attachments = input.attachments.map((a) => ({
      filename: a.filename,
      content: a.contentBase64,
      ...(a.contentType ? { content_type: a.contentType } : {}),
    }));
  }
  const res = await fetch(`${RESEND_BASE}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status}`);
  }
  const data = (await res.json()) as { id?: string };
  return data.id ?? "";
}

/* ------------------------------------------------------------------ *
 * Svix potpis webhooka (Resend koristi svix shemu)
 * ------------------------------------------------------------------ */

export function verifyResendWebhook(
  rawBody: string,
  request: Request,
): { ok: true } | { ok: false; reason: string } {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return { ok: false, reason: "no_secret" };
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    return { ok: false, reason: "missing_headers" };
  }
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) {
    return { ok: false, reason: "stale_timestamp" };
  }
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest();
  for (const part of signature.split(" ")) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    const candidate = Buffer.from(value, "base64");
    if (
      candidate.length === expected.length &&
      crypto.timingSafeEqual(candidate, expected)
    ) {
      return { ok: true };
    }
  }
  return { ok: false, reason: "bad_signature" };
}

/* ------------------------------------------------------------------ *
 * Sesija (jedna lozinka, potpisan HttpOnly cookie)
 * ------------------------------------------------------------------ */

function sessionKey(): Buffer {
  const password = process.env.INBOX_PASSWORD ?? "";
  return crypto
    .createHash("sha256")
    .update(`phoneba-inbox-v1|${password}`)
    .digest();
}

export function passwordMatches(input: string): boolean {
  const password = process.env.INBOX_PASSWORD ?? "";
  if (password === "") return false;
  const a = crypto.createHash("sha256").update(input, "utf8").digest();
  const b = crypto.createHash("sha256").update(password, "utf8").digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const sig = crypto
    .createHmac("sha256", sessionKey())
    .update(String(exp))
    .digest("base64url");
  return `${exp}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const [rawExp, sig] = token.split(".");
  const exp = Number(rawExp);
  if (!Number.isFinite(exp) || !sig) return false;
  if (Date.now() > exp) return false;
  const expected = crypto
    .createHmac("sha256", sessionKey())
    .update(String(exp))
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAuthenticated(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`),
  );
  if (!match) return false;
  return verifySessionToken(decodeURIComponent(match[1]));
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function expiredCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/* ------------------------------------------------------------------ *
 * Rate limit (u memoriji instance — dovoljno za jednu lozinku)
 * ------------------------------------------------------------------ */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function registerLoginAttempt(ip: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  if (attempts.size > 500) {
    for (const [key, times] of attempts) {
      if (times.every((t) => now - t > WINDOW_MS)) attempts.delete(key);
    }
  }
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    const retryAfterSec = Math.ceil(
      (WINDOW_MS - (now - recent[0])) / 1000,
    );
    return { allowed: false, retryAfterSec };
  }
  recent.push(now);
  attempts.set(ip, recent);
  return { allowed: true, retryAfterSec: 0 };
}

export function resetLoginAttempts(ip: string): void {
  attempts.delete(ip);
}

/* ------------------------------------------------------------------ *
 * Ulazna validacija
 * ------------------------------------------------------------------ */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
/* ================================================================== *
 * v2 — prilozi, predlošci, arhiva poslanog, više primaoca
 * ================================================================== */
export type AttachInput = {
  filename: string;
  contentType?: string;
  contentBase64: string;
};
export type ReceivedAttachment = {
  filename: string;
  contentBase64: string;
  contentType: string | null;
};
export type InboundAttachmentRow = {
  id: string;
  email_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
};
export type OutboundRow = {
  id: string;
  to_addr: string;
  subject: string;
  sent_at: string;
  attachment_count: number;
};
export const MAX_RECIPIENTS = 20;
// Vercel serverless tijelo ~4,5 MB; base64 dodaje +33% → pošteno 3 MB ukupno.
export const MAX_ATTACH_BYTES = 3 * 1024 * 1024;
export const MAX_ATTACH_TOTAL = 3 * 1024 * 1024;
const ATTACH_ALLOWLIST = new Set([
  "pdf", "docx", "doc", "xls", "xlsx", "ppt", "pptx", "odt", "rtf",
  "txt", "csv", "md", "png", "jpg", "jpeg", "gif", "webp", "zip",
]);
export function attachAllowed(filename: string): boolean {
  const m = /\.([A-Za-z0-9]+)$/.exec(filename);
  return m ? ATTACH_ALLOWLIST.has(m[1].toLowerCase()) : false;
}
const SIGNATURE_HTML = `<p style="color:#1f2328;margin:22px 0 0;">S poštovanjem,<br/><b>Mahmut Kuldija</b><br/><span style="color:#8a7340;font-size:12px;">Founder &amp; Managing Director | MSc in Digital Media Marketing</span><br/><span style="color:#23272e;font-size:13px;">phone.ba &nbsp;|&nbsp; cryptocurrency.ba<br/>E: hello@phone.ba &nbsp;|&nbsp; ceo@cryptocurrency.ba<br/>M: +387 60 315 80 20<br/>W: www.phone.ba &nbsp;|&nbsp; www.cryptocurrency.ba<br/>A: Sarajevo, Bosnia and Herzegovina</span></p>`;
const TEMPLATE_MEMORANDUM = `<!doctype html><html lang="bs"><body style="margin:0;background:#eef2f6;font-family:Calibri,'Segoe UI',Arial,sans-serif;color:#1f2328;"><div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-top:4px solid #2563eb;">
<div style="padding:22px 28px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;gap:12px;">
<div><div style="font-size:22px;font-weight:bold;color:#0f172a;">phone<span style="color:#16a34a;">.ba</span></div><div style="font-size:10px;color:#64748b;letter-spacing:1.5px;">AI SMARTPHONE AGGREGATOR &mdash; BIH</div></div>
<div style="text-align:right;font-size:11px;color:#334155;"><b style="color:#94a3b8;letter-spacing:1.5px;">KONTAKT</b><br/>phone.ba, Sarajevo<br/>E: hello@phone.ba &nbsp;M: +387 60 315 80 20<br/>W: www.phone.ba</div></div>
<div style="height:4px;background:linear-gradient(90deg,#2563eb 0%,#16a34a 100%);"></div>
<div style="padding:26px 30px 10px;"><h1 style="margin:0 0 6px;font-size:19px;color:#0f172a;">{{PREDMET}}</h1><div style="width:90px;height:3px;border-radius:99px;background:linear-gradient(90deg,#2563eb,#16a34a);margin:0 0 18px;"></div>{{TEKST}}{{POTPIS}}</div>
<div style="padding:12px 28px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#64748b;">phone.ba &middot; hello@phone.ba &middot; +387 60 315 80 20</div>
</div></body></html>`;
const TEMPLATE_POSLOVNA = `<!doctype html><html lang="bs"><body style="margin:0;background:#f8fafc;font-family:Calibri,'Segoe UI',Arial,sans-serif;color:#1f2328;"><div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-top:4px solid #2563eb;">
<div style="padding:20px 28px;border-bottom:1px solid #e2e8f0;"><span style="font-size:19px;font-weight:bold;color:#0f172a;">phone<span style="color:#16a34a;">.ba</span></span> <span style="font-size:11px;color:#64748b;">&middot; hello@phone.ba</span></div>
<div style="padding:24px 28px 8px;"><h1 style="margin:0 0 6px;font-size:17px;color:#0f172a;">{{PREDMET}}</h1><div style="width:70px;height:3px;border-radius:99px;background:linear-gradient(90deg,#2563eb,#16a34a);margin:0 0 16px;"></div>{{TEKST}}{{POTPIS}}</div>
<div style="padding:10px 28px;border-top:1px solid #eef2f6;font-size:11px;color:#64748b;">phone.ba &middot; hello@phone.ba &middot; +387 60 315 80 20</div>
</div></body></html>`;
const TEMPLATE_BLANKO = `<!doctype html><html lang="bs"><body style="margin:0;font-family:Calibri,'Segoe UI',Arial,sans-serif;color:#1f2328;"><div style="max-width:600px;margin:0 auto;padding:8px 0;"><h1 style="margin:0 0 14px;font-size:17px;color:#0f172a;">{{PREDMET}}</h1>{{TEKST}}{{POTPIS}}</div></body></html>`;
export const TEMPLATE_SEED: Array<[string, string, string, string]> = [
  ["memorandum", "Memorandum (dopis sa zaglavljem)", "Poslovno pismo s brendiranim zaglavljem i potpisom", TEMPLATE_MEMORANDUM],
  ["poslovna", "Poslovna poruka", "Kratka uredna poruka s potpisom", TEMPLATE_POSLOVNA],
  ["blanko", "Bez zaglavlja", "Običan tekst sa potpisom", TEMPLATE_BLANKO],
];
export function buildEmailHtml(
  base: string,
  subject: string,
  text: string,
): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = esc(text)
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="font-size:14px;line-height:1.65;color:#1f2328;margin:0 0 12px;">${p.replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
  return base
    .replace("{{PREDMET}}", esc(subject))
    .replace("{{TEKST}}", paragraphs)
    .replace("{{POTPIS}}", SIGNATURE_HTML);
}
export function simpleEmailHtml(text: string): string {
  return buildEmailHtml(TEMPLATE_BLANKO, "", text);
}
export async function getTemplateHtml(
  templateId: string,
): Promise<string | null> {
  await ensureInboxSchema();
  const db = sql();
  const rows = await db`
    select html from mail_template where id = ${templateId} limit 1`;
  return (rows[0] as { html?: string } | undefined)?.html ?? null;
}
export async function listTemplates(): Promise<
  Array<{ id: string; name: string; description: string }>
> {
  await ensureInboxSchema();
  const db = sql();
  return (await db`
    select id, name, description from mail_template order by id`) as never;
}
export async function composeHtml(opts: {
  templateId?: string | null;
  html?: string | null;
  subject: string;
  text: string;
}): Promise<string> {
  if (opts.html && opts.html.trim() !== "") return opts.html;
  const base =
    (opts.templateId ? await getTemplateHtml(opts.templateId) : null) ??
    TEMPLATE_POSLOVNA;
  return buildEmailHtml(base, opts.subject, opts.text);
}
export function splitRecipients(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
}
export function validateRecipients(
  raw: string,
): { ok: true; list: string[] } | { ok: false; error: string } {
  const list = splitRecipients(raw);
  if (list.length === 0)
    return { ok: false, error: "Navedite bar jednu adresu primaoca." };
  if (list.length > MAX_RECIPIENTS)
    return { ok: false, error: `Najviše ${MAX_RECIPIENTS} adresa u jednoj poruci.` };
  for (const addr of list) {
    if (!EMAIL_RE.test(addr))
      return { ok: false, error: `Adresa "${addr}" nije ispravna.` };
  }
  return { ok: true, list };
}
export function validateAttachments(
  atts: unknown,
): { ok: true; list: AttachInput[] } | { ok: false; error: string } {
  if (!Array.isArray(atts) || atts.length === 0) return { ok: true, list: [] };
  const list: AttachInput[] = [];
  let total = 0;
  for (const a of atts) {
    const obj = a as Record<string, unknown>;
    const filename =
      typeof obj.filename === "string" ? obj.filename.trim() : "";
    const contentBase64 =
      typeof obj.contentBase64 === "string" ? obj.contentBase64 : "";
    if (filename === "" || contentBase64 === "")
      return { ok: false, error: "Neispravan prilog u zahtjevu." };
    if (!attachAllowed(filename))
      return {
        ok: false,
        error: `Vrsta fajla "${filename}" nije dozvoljena (PDF, Office, slike, ZIP...).`,
      };
    const bytes = Math.floor((contentBase64.length * 3) / 4);
    if (bytes > MAX_ATTACH_BYTES)
      return { ok: false, error: `Fajl "${filename}" je veći od 3 MB.` };
    total += bytes;
    if (total > MAX_ATTACH_TOTAL)
      return { ok: false, error: "Prilozi ukupno prelaze 3 MB." };
    list.push({
      filename,
      contentBase64,
      contentType:
        typeof obj.contentType === "string" ? obj.contentType : undefined,
    });
  }
  return { ok: true, list };
}
export async function storeInboundAttachments(
  emailId: string,
  atts: ReceivedAttachment[],
): Promise<number> {
  if (atts.length === 0) return 0;
  await ensureInboxSchema();
  const db = sql();
  let saved = 0;
  let total = 0;
  for (const a of atts) {
    const buf = Buffer.from(a.contentBase64, "base64");
    if (buf.length === 0 || buf.length > MAX_ATTACH_BYTES) continue;
    total += buf.length;
    if (total > MAX_ATTACH_TOTAL) continue;
    try {
      const id = crypto.randomUUID();
      await db`
        insert into inbound_attachment (id, email_id, filename, content_type, size_bytes, data)
        values (${id}, ${emailId}, ${a.filename}, ${a.contentType ?? ""}, ${buf.length}, ${buf})
        on conflict (id) do nothing`;
      saved++;
    } catch {
      // Pojedinačni prilog ne smije srušiti cijelu poruku.
    }
  }
  return saved;
}
export async function listInboundAttachments(
  emailId: string,
): Promise<InboundAttachmentRow[]> {
  await ensureInboxSchema();
  const db = sql();
  return (await db`
    select id, email_id, filename, content_type, size_bytes
      from inbound_attachment
     where email_id = ${emailId}
     order by filename`) as never;
}
export async function getInboundAttachment(
  id: string,
): Promise<(InboundAttachmentRow & { data: Buffer }) | null> {
  await ensureInboxSchema();
  const db = sql();
  const rows = await db`
    select id, email_id, filename, content_type, size_bytes, data
      from inbound_attachment
     where id = ${id}
     limit 1`;
  return (rows[0] as (InboundAttachmentRow & { data: Buffer }) | undefined) ??
    null;
}
export async function insertOutbound(row: {
  id: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachmentCount: number;
}): Promise<void> {
  await ensureInboxSchema();
  const db = sql();
  await db`
    insert into outbound_email (id, to_addr, subject, body_text, body_html, attachment_count)
    values (${row.id}, ${row.to}, ${row.subject}, ${row.text}, ${row.html}, ${row.attachmentCount})
    on conflict (id) do nothing`;
}
export async function listOutbound(limit = 50): Promise<OutboundRow[]> {
  await ensureInboxSchema();
  const db = sql();
  return (await db`
    select id, to_addr, subject, sent_at, attachment_count
      from outbound_email
     order by sent_at desc
     limit ${limit}`) as never;
}
