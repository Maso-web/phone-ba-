import { createFileRoute } from "@tanstack/react-router";
import {
  composeHtml,
  getInbound,
  insertOutbound,
  isAuthenticated,
  json,
  markReplied,
  missingInboxEnv,
  sendViaResend,
  validateAttachments,
} from "~/lib/inbox";
/**
 * POST /api/inbox/reply — odgovor na primljenu poruku.
 * Tijelo: { id, text, templateId?, html?, attachments?[] }
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
        let payload: {
          id?: unknown;
          text?: unknown;
          templateId?: unknown;
          html?: unknown;
          attachments?: unknown;
        };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return json({ ok: false, error: "Neispravan JSON." }, 400);
        }
        const id = typeof payload.id === "string" ? payload.id : "";
        const text = typeof payload.text === "string" ? payload.text.trim() : "";
        const templateId =
          typeof payload.templateId === "string" && payload.templateId !== ""
            ? payload.templateId
            : null;
        const html =
          typeof payload.html === "string" && payload.html.trim() !== ""
            ? payload.html
            : null;
        const atts = validateAttachments(payload.attachments);
        if (!atts.ok) return json({ ok: false, error: atts.error }, 400);
        if (id === "") return json({ ok: false, error: "Nedostaje id." }, 400);
        if (text === "" && html === null) {
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
          const subject = /^re:/i.test(message.subject)
            ? message.subject
            : `Re: ${message.subject}`.trim();
          const bodyHtml = await composeHtml({
            templateId,
            html,
            subject,
            text,
          });
          const resendId = await sendViaResend({
            to,
            subject,
            text,
            html: bodyHtml,
            inReplyTo: message.message_id,
            attachments: atts.ok ? atts.list : [],
          });
          try {
            await insertOutbound({
              id: resendId === "" ? crypto.randomUUID() : resendId,
              to,
              subject,
              text,
              html: bodyHtml,
              attachmentCount: atts.ok ? atts.list.length : 0,
            });
          } catch (err) {
            console.error(
              "[inbox] outbound archive failed:",
              err instanceof Error ? err.message.slice(0, 200) : "unknown",
            );
          }
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