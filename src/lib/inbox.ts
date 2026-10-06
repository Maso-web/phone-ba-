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
  return {
    text: asString(data.text) ?? asString(data.text_body) ?? null,
    html: asString(data.html) ?? asString(data.html_body) ?? null,
    subject: asString(data.subject),
    from: asString(data.from),
    to: Array.isArray(to) ? to.join(", ") : asString(to),
    messageId: asString(data.message_id),
    createdAt: asString(data.created_at),
  };
}

/** Slanje preko Resend API-ja (isto kao `hello@phone.ba` u newsletteru). */
export async function sendViaResend(input: {
  to: string;
  subject: string;
  text: string;
  html?: string | null;
  inReplyTo?: string | null;
}): Promise<string> {
  const headers: Record<string, string> = {};
  if (input.inReplyTo) {
    headers["In-Reply-To"] = input.inReplyTo;
    headers["References"] = input.inReplyTo;
  }
  const res = await fetch(`${RESEND_BASE}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
    }),
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
