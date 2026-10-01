import { createFileRoute } from "@tanstack/react-router";
import { missingSmtpEnv, sendEmail } from "~/lib/email";

/**
 * POST /api/newsletter — prijava na phone.ba newsletter.
 *
 * Tijelo zahtjeva (JSON): { email: string, name?: string }
 * Uspjeh:  200 { ok: true }  (pretplatnik dobija potvrdu s hello@phone.ba)
 * Greška:  400 { ok: false, error: "…" }  — neispravan email/JSON
 *          503 { ok: false, error: "SMTP nije konfigurisan" } — nema SMTP env
 *          502 { ok: false, error: "…", detail: "…" } — SMTP je konfigurisan, ali slanje
 *              nije prošlo; `detail` nosi tehnički opis greške (SMTP kod), BEZ kredencijala
 *
 * Napomena: za sada NEMA pohrane pretplatnika (send-only plumbing) — email se
 * samo šalje; lista se kasnije povezuje na bazu.
 */

/** Jednostavna validacija oblika email adrese (dovoljna za ovu namjenu). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/** Ukloni vrijednost SMTP lozinke ako se (neočekivano) nađe u tekstu greške. */
function redact(text: string): string {
  const secret = process.env.SMTP_PASS?.trim();
  return secret && secret.length >= 3
    ? text.split(secret).join("[redacted]")
    : text;
}

/**
 * Tehnički opis greške za dijagnostiku (nodemailer obično nosi SMTP kod:
 * ECONNREFUSED / ETIMEDOUT / ENOTFOUND / EAUTH "535 Authentication failed"…).
 * Nikad ne uključuje kredencijale; dužina je ograničena.
 */
function errorDetail(err: unknown): string {
  let detail: string;
  if (err instanceof Error) {
    const code = (err as { code?: unknown }).code;
    detail =
      typeof code === "string" && code !== "" && !err.message.includes(code)
        ? `${err.message} (code=${code})`
        : err.message;
  } else {
    detail = String(err);
  }
  return redact(detail).slice(0, 400);
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** Kratka bosanska potvrda prijave (koristi se za svakog novog pretplatnika). */
function confirmationHtml(name?: string): string {
  const pozdrav = name ? `Zdravo ${name},` : "Zdravo,";
  return `<!doctype html>
<html lang="bs">
  <body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;line-height:1.6">
    <p>${pozdrav}</p>
    <p>Hvala za prijavu na <strong>phone.ba</strong> newsletter.</p>
    <p>
      Povremeno ćemo ti poslati najbolje cijene telefona u Bosni i Hercegovini,
      nove modele i provjere vrijednosti za kupovinu — bez spama.
    </p>
    <p>
      Ako se nisi ti prijavio/la, slobodno odgovori na ovaj email ili piši na
      <a href="mailto:hello@phone.ba">hello@phone.ba</a> i odmah ćemo te izbrisati s liste.
    </p>
    <p>Srdačan pozdrav,<br />tim phone.ba<br /><a href="mailto:hello@phone.ba">hello@phone.ba</a></p>
  </body>
</html>`;
}

export const Route = createFileRoute("/api/newsletter")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, error: "Neispravan JSON." }, 400);
        }

        if (typeof payload !== "object" || payload === null) {
          return json({ ok: false, error: "Nedostaje tijelo zahtjeva." }, 400);
        }

        const { email, name } = payload as { email?: unknown; name?: unknown };

        if (typeof email !== "string" || email.trim() === "") {
          return json({ ok: false, error: "Email je obavezan." }, 400);
        }
        const to = email.trim();
        if (!EMAIL_RE.test(to)) {
          return json({ ok: false, error: "Email adresa nije ispravna." }, 400);
        }
        const displayName =
          typeof name === "string" && name.trim() !== ""
            ? name.trim()
            : undefined;

        // Bez SMTP kredencijala ne rušimo rutu — vraćamo uredan 503.
        if (missingSmtpEnv().length > 0) {
          return json({ ok: false, error: "SMTP nije konfigurisan" }, 503);
        }

        try {
          await sendEmail({
            to,
            subject: "Potvrda prijave na phone.ba newsletter",
            html: confirmationHtml(displayName),
          });
        } catch (err) {
          const detail = errorDetail(err);
          console.error("[newsletter] SMTP send failed:", err);
          console.error("[newsletter] SMTP send detail:", detail);
          return json(
            {
              ok: false,
              error:
                "Slanje potvrde trenutno nije moguće. Pokušaj ponovo kasnije.",
              detail,
            },
            502,
          );
        }

        return json({ ok: true }, 200);
      },
    },
  },
});
