import { createFileRoute } from "@tanstack/react-router";
import {
  EMAIL_RE,
  isAuthenticated,
  json,
  missingInboxEnv,
  sendViaResend,
} from "~/lib/inbox";

/** Kratka HTML verzija teksta (bez vanjskih resursa). */
function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!doctype html><html lang="bs"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;line-height:1.6"><p style="white-space:pre-line">${escaped}</p><p style="color:#64748b;font-size:13px">— tim phone.ba<br /><a href="mailto:hello@phone.ba">hello@phone.ba</a></p></body></html>`;
}

/**
 * POST /api/inbox/send — nova poruka (bez odgovaranja na postojeću).
 * Tijelo: { to: string, subject: string, text: string }
 */
export const Route = createFileRoute("/api/inbox/send")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (missingInboxEnv().length > 0) {
          return json({ ok: false, error: "Sanduče nije konfigurisano." }, 503);
        }
        if (!isAuthenticated(request)) {
          return json({ ok: false, error: "Niste prijavljeni." }, 401);
        }

        let payload: { to?: unknown; subject?: unknown; text?: unknown };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return json({ ok: false, error: "Neispravan JSON." }, 400);
        }
        const to = typeof payload.to === "string" ? payload.to.trim() : "";
        const subject =
          typeof payload.subject === "string" ? payload.subject.trim() : "";
        const text = typeof payload.text === "string" ? payload.text.trim() : "";
        if (!EMAIL_RE.test(to)) {
          return json({ ok: false, error: "Adresa primaoca nije ispravna." }, 400);
        }
        if (subject === "") {
          return json({ ok: false, error: "Predmet je obavezan." }, 400);
        }
        if (text === "") {
          return json({ ok: false, error: "Tekst poruke je obavezan." }, 400);
        }

        try {
          const resendId = await sendViaResend({
            to,
            subject,
            text,
            html: textToHtml(text),
          });
          console.log("[inbox] new message sent");
          return json({ ok: true, id: resendId, to, subject }, 200);
        } catch (err) {
          console.error(
            "[inbox] send failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Slanje poruke nije uspjelo." }, 502);
        }
      },
    },
  },
});
