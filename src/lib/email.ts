import nodemailer from "nodemailer";
import type { SentMessageInfo, Transporter } from "nodemailer";

/**
 * phone.ba — slanje službene pošte (memorandumi, newsletter) preko cPanel SMTP
 * servera vlasnika. Sav sadržaj se šalje s adrese `SMTP_FROM` (default
 * hello@phone.ba).
 *
 * Kredencijali se NIKAD ne hardkodiraju — čitaju se iz okoline, koja ih dobija
 * preko Settings → Secrets (vrijede i u radnoj i u živoj verziji sajta):
 *
 *   SMTP_HOST    npr. mail.phone.ba
 *   SMTP_PORT    465 (SSL) ili 587 (STARTTLS)
 *   SMTP_SECURE  "true" za 465, "false" za 587
 *   SMTP_USER    hello@phone.ba
 *   SMTP_PASS    lozinka mailboxa
 *   SMTP_FROM    hello@phone.ba (opcionalno; default = SMTP_USER/hello@phone.ba)
 *
 * Modul je server-only (koristi se iz `src/routes/api/*` ili server funkcija) i
 * ne baca grešku pri učitavanju: ako varijable nisu postavljene, greška se
 * javlja tek pri stvarnom slanju, a `missingSmtpEnv()` omogućava ruti da to
 * provjeri unaprijed i vrati uredan odgovor.
 *
 * NAPOMENA: dok SMTP_PASS nije postavljen, slanje nije moguće — kod je spreman,
 * ali se pošta ne šalje (nema dummy kredencijala u repou).
 */

/** Varijable bez kojih slanje nije moguće. */
const REQUIRED_ENV = ["SMTP_HOST", "SMTP_PASS"] as const;

/** Pročitaj env varijablu kao trimmed string (prazan string = nije postavljena). */
function env(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Vraća listu obaveznih SMTP varijabli koje nisu postavljene (prazna = OK). */
export function missingSmtpEnv(): string[] {
  return REQUIRED_ENV.filter((name) => env(name) === undefined);
}

/** True ako su sve obavezne SMTP varijable postavljene. */
export function smtpIsConfigured(): boolean {
  return missingSmtpEnv().length === 0;
}

/** Adresa pošiljaoca — `SMTP_FROM`, inače `SMTP_USER`, inače hello@phone.ba. */
export function smtpFrom(): string {
  return env("SMTP_FROM") ?? env("SMTP_USER") ?? "hello@phone.ba";
}

/**
 * Greška s jasnom porukom koja imenuje varijablu koja nedostaje. Vraća `null`
 * ako je konfiguracija potpuna.
 */
export function smtpConfigError(): Error | null {
  const missing = missingSmtpEnv();
  if (missing.length === 0) return null;
  return new Error(
    `SMTP nije konfigurisan — nije postavljena env varijabla: ${missing.join(", ")}.`
  );
}

let cached: { key: string; transport: Transporter } | null = null;

/** Keširani transporter (ponovo se gradi samo ako se konfiguracija promijeni). */
function getTransporter(): Transporter {
  const error = smtpConfigError();
  if (error) throw error;

  const host = env("SMTP_HOST") as string;
  const pass = env("SMTP_PASS") as string;
  const user = env("SMTP_USER") ?? "hello@phone.ba";
  const secure = (env("SMTP_SECURE") ?? "").toLowerCase() === "true";
  const portRaw = env("SMTP_PORT");
  const port = portRaw ? Number(portRaw) : secure ? 465 : 587;
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`SMTP_PORT nije ispravan broj porta: "${portRaw}".`);
  }

  const key = `${host}:${port}:${secure}:${user}`;
  if (cached && cached.key === key) return cached.transport;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure, // true = implicit TLS (465); false = STARTTLS (587)
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  cached = { key, transport };
  return transport;
}

/** Osnovni plain-text fallback iz HTML-a (za klijente bez HTML podrške). */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type EmailInput = {
  /** Jedan primalac ili lista primalaca. */
  to: string | string[];
  subject: string;
  html: string;
  /** Opcionalno; ako se izostavi, izvodi se iz HTML-a. */
  text?: string;
};

export type NewsletterInput = Omit<EmailInput, "text">;

/**
 * Pošalji jedan email (memorandum, obavještenje, potvrda prijave…).
 * Odbija se s jasnom greškom ako `SMTP_HOST` ili `SMTP_PASS` nisu postavljeni;
 * u protivnom se razrješava s nodemailer `info` objektom.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailInput): Promise<SentMessageInfo> {
  const transport = getTransporter();
  const from = smtpFrom();
  return transport.sendMail({
    from: `phone.ba <${from}>`,
    to,
    subject,
    html,
    text: text ?? htmlToText(html),
  });
}

/**
 * Pošalji newsletter/bilten. Isti transporter kao `sendEmail`, uz
 * `List-Unsubscribe` zaglavlje (jednostavan izlaz za pretplatnike).
 */
export async function sendNewsletter({
  to,
  subject,
  html,
}: NewsletterInput): Promise<SentMessageInfo> {
  const transport = getTransporter();
  const from = smtpFrom();
  return transport.sendMail({
    from: `phone.ba <${from}>`,
    to,
    subject,
    html,
    text: htmlToText(html),
    headers: {
      "List-Unsubscribe": `<mailto:${from}?subject=odjava>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
