import { createFileRoute } from "@tanstack/react-router";
import {
  getInbound,
  isAuthenticated,
  json,
  listInboundAttachments,
  missingInboxEnv,
} from "~/lib/inbox";
/** GET /api/inbox/get?id=<email_id> — jedna poruka sa tijelom i prilozima. */
export const Route = createFileRoute("/api/inbox/get")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        if (missingInboxEnv().length > 0) {
          return json({ ok: false, error: "Sanduče nije konfigurisano." }, 503);
        }
        if (!isAuthenticated(request)) {
          return json({ ok: false, error: "Niste prijavljeni." }, 401);
        }
        const id = new URL(request.url).searchParams.get("id") ?? "";
        if (id === "") {
          return json({ ok: false, error: "Nedostaje id." }, 400);
        }
        try {
          const message = await getInbound(id);
          if (!message) {
            return json({ ok: false, error: "Poruka nije nađena." }, 404);
          }
          const attachments = await listInboundAttachments(id);
          return json({ ok: true, message, attachments }, 200);
        } catch (err) {
          console.error(
            "[inbox] get failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Čitanje poruke nije uspjelo." }, 500);
        }
      },
    },
  },
});