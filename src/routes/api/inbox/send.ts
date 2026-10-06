import { createFileRoute } from "@tanstack/react-router";
import {
  composeHtml,
  insertOutbound,
  isAuthenticated,
  json,
  missingInboxEnv,
  sendViaResend,
  validateAttachments,
  validateRecipients,
} from "~/lib/inbox";
/**
 * POST /api/inbox/send — nova poruka (može: više adresa, predložak,
 * vlastiti HTML, prilozi do 10 MB po fajlu / 20 MB ukupno).
 * Tijelo: { to, subject, text, templateId?, html?, attachments?[] }
 *   attachments: [{ filename, contentType?, contentBase64 }]
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
        let payload: {
          to?: unknown;
          subject?: unknown;
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
        const subject =
          typeof payload.subject === "string" ? payload.subject.trim() : "";
        const text = typeof payload.text === "string" ? payload.text.trim() : "";
        const templateId =
          typeof payload.templateId === "string" && payload.templateId !== ""
            ? payload.templateId
            : null;
        const html =
          typeof payload.html === "string" && payload.html.trim() !== ""
            ? payload.html
            : null;
        const recipients = validateRecipients(
          typeof payload.to === "string" ? payload.to : "",
        );
        if (!recipients.ok) return json({ ok: false, error: recipients.error }, 400);
        const atts = validateAttachments(payload.attachments);
        if (!atts.ok) return json({ ok: false, error: atts.error }, 400);
        if (subject === "") {
          return json({ ok: false, error: "Predmet je obavezan." }, 400);
        }
        if (text === "" && html === null) {
          return json({ ok: false, error: "Tekst poruke je obavezan." }, 400);
        }
        try {
          const bodyHtml = await composeHtml({
            templateId,
            html,
            subject,
            text,
          });
          const resendId = await sendViaResend({
            to: recipients.list,
            subject,
            text,
            html: bodyHtml,
            attachments: atts.ok ? atts.list : [],
          });
          try {
            await insertOutbound({
              id: resendId === "" ? crypto.randomUUID() : resendId,
              to: recipients.list.join(", "),
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
          console.log(
            `[inbox] sent to ${recipients.list.length} addr (atts=${atts.ok ? atts.list.length : 0})`,
          );
          return json(
            { ok: true, id: resendId, to: recipients.list, subject },
            200,
          );
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