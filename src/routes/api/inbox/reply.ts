import { createFileRoute } from "@tanstack/react-router";
import {
  EMAIL_RE,
  getInbound,
  isAuthenticated,
  json,
  markReplied,
  missingInboxEnv,
  sendViaResend,
} from "~/lib/inbox";

/** Kratka HTML verzija teksta odgovora (bez ijednog vanjskog resursa). */
function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!doctype html><html lang="bs"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;line-height:1.6"><p style="white-space:pre-line">${escaped}</p><p style="color:#64748b;font-size:13px">— tim phone.ba<br /><a href="mailto:hello@phone.ba">hello@phone.ba</a></p></body></html>`;
}

/**
 * POST /api/inbox/reply — odgovor na primljenu poruku.
 * Tijelo: { id: string, text: string }
 * Šalje preko Resend API-ja sa `From: hello@phone.ba` i `In-Reply-To: <message_id>`
 * (nit ostaje cijela), pa u bazi označi `replied = true`.
 */
export const Route = createFileRoute("/api/inbox/reply")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (missingInboxEnv().length > 0) {
          return json({ ok: false, error: "Sanduče nije konfigurisano." }, 503);
        }
        if (!isAuthenticated(request)) {
          return json({ ok: false, error: "Niste prijavljeni." }, 401);
        }

        let payload: { id?: unknown; text?: unknown };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return json({ ok: false, error: "Neispravan JSON." }, 400);
        }
        const id = typeof payload.id === "string" ? payload.id : "";
        const text = typeof payload.text === "string" ? payload.text.trim() : "";
        if (id === "") return json({ ok: false, error: "Nedostaje id." }, 400);
        if (text === "") {
          return json({ ok: false, error: "Tekst odgovora je obavezan." }, 400);
        }

        try {
          const message = await getInbound(id);
          if (!message) {
            return json({ ok: false, error: "Poruka nije nađena." }, 404);
          }
          const to = (message.from_addr.match(/<([^>]+)>/)?.[1] ?? message.from_addr)
            .trim()
            .toLowerCase();
          if (!EMAIL_RE.test(to)) {
            return json(
              { ok: false, error: "Adresa pošiljaoca nije ispravna." },
              400,
            );
          }
          const subject = /^re:/i.test(message.subject)
            ? message.subject
            : `Re: ${message.subject}`.trim();

          const resendId = await sendViaResend({
            to,
            subject,
            text,
            html: textToHtml(text),
            inReplyTo: message.message_id,
          });
          await markReplied(id);
          console.log("[inbox] reply sent");
          return json({ ok: true, id: resendId, to, subject }, 200);
        } catch (err) {
          console.error(
            "[inbox] reply failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Slanje odgovora nije uspjelo." }, 502);
        }
      },
    },
  },
});
