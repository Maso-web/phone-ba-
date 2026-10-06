import { createFileRoute } from "@tanstack/react-router";
import {
  fetchReceivedEmail,
  insertInbound,
  json,
  missingInboundEnv,
  storeInboundAttachments,
  verifyResendWebhook,
  type ReceivedAttachment,
} from "~/lib/inbox";

/**
 * POST /api/inbound — Resend INBOUND webhook za `email.received`.
 *
 * Tok: Resend pošalje samo metapodatke → mi potpis provjerimo (svix,
 * `RESEND_WEBHOOK_SECRET`, RAW tijelo) → puni sadržaj dohvatimo preko
 * `GET /v1/emails/receiving/{email_id}` → upišemo u Neon `inbound_email`.
 *
 * Kodovi: 200 = primljeno (ili već viđeno / nije naš event),
 *         400 = neispravan JSON/payload,
 *         401 = potpis nije ispravan,
 *         500 = privremena greška u bazi (Resend će pokušati ponovo),
 *         503 = INBOX_PASSWORD / DATABASE_URL / RESEND_WEBHOOK_SECRET nisu postavljeni.
 *
 * Tijelo poruke se NIKAD ne loguje — u log ide samo kratko obilježje događaja.
 */
export const Route = createFileRoute("/api/inbound")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const missing = missingInboundEnv();
        if (missing.length > 0) {
          console.error("[inbound] not configured, missing:", missing.join(","));
          return json({ ok: false, error: "Inbound nije konfigurisan." }, 503);
        }

        let rawBody: string;
        try {
          rawBody = await request.text();
        } catch {
          return json({ ok: false, error: "Neispravno tijelo zahtjeva." }, 400);
        }

        const signature = verifyResendWebhook(rawBody, request);
        if (!signature.ok) {
          console.error("[inbound] rejected: signature", signature.reason);
          return json({ ok: false, error: "Neispravan potpis." }, 401);
        }

        let payload: {
          type?: unknown;
          data?: Record<string, unknown>;
        };
        try {
          payload = JSON.parse(rawBody) as typeof payload;
        } catch {
          return json({ ok: false, error: "Neispravan JSON." }, 400);
        }

        if (payload.type !== "email.received") {
          // Ostale evente (npr. delivery) ne obrađujemo, ali ih potvrdimo.
          return json({ ok: true, ignored: String(payload.type ?? "") }, 200);
        }

        const data = payload.data ?? {};
        const asString = (value: unknown): string | null =>
          typeof value === "string" && value !== "" ? value : null;
        const emailId = asString(data.email_id) ?? asString(data.id);
        if (!emailId) {
          return json({ ok: false, error: "Nedostaje email_id." }, 400);
        }

        const toRaw = data.to;
        const to = Array.isArray(toRaw)
          ? toRaw.filter((v): v is string => typeof v === "string").join(", ")
          : (asString(toRaw) ?? "");

        // Tijelo nije u webhook payloadu — dohvati ga preko Resend API-ja.
        // Ako dohvat ne uspije, poruku ipak pamtimo (metapodaci bez tijela).
        let text: string | null = null;
        let html: string | null = null;
        let subject = asString(data.subject) ?? "";
        let from = asString(data.from) ?? "";
        let messageId = asString(data.message_id);
        let receivedAt = asString(data.created_at);
        let fullAttachments: ReceivedAttachment[] = [];
        try {
          const full = await fetchReceivedEmail(emailId);
          text = full.text;
          html = full.html;
          subject = full.subject ?? subject;
          from = full.from ?? from;
          messageId = full.messageId ?? messageId;
          receivedAt = full.createdAt ?? receivedAt;
          fullAttachments = full.attachments;
        } catch (err) {
          const status = err instanceof Error ? err.message : "unknown";
          console.error("[inbound] body fetch failed:", status);
        }

        try {
          const inserted = await insertInbound({
            id: emailId,
            messageId,
            from,
            to,
            subject,
            text,
            html,
            receivedAt,
          });
          let attachmentCount = 0;
          try {
            attachmentCount = await storeInboundAttachments(
              emailId,
              fullAttachments,
            );
          } catch (err) {
            console.error(
              "[inbound] attachment store failed:",
              err instanceof Error ? err.message.slice(0, 200) : "unknown",
            );
          }
          console.log(
            `[inbound] ${inserted ? "stored" : "duplicate"} message (text=${text !== null} html=${html !== null} atts=${attachmentCount})`,
          );
          return json({ ok: true, stored: inserted }, 200);
        } catch (err) {
          // Bez tijela u logu — samo tip greške.
          console.error(
            "[inbound] db insert failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Pohrana nije uspjela." }, 500);
        }
      },
    },
  },
});
