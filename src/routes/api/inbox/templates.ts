import { createFileRoute } from "@tanstack/react-router";
import { isAuthenticated, json, listTemplates, missingInboxEnv } from "~/lib/inbox";
/** GET /api/inbox/templates — dostupni predlošci poruka. */
export const Route = createFileRoute("/api/inbox/templates")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        if (missingInboxEnv().length > 0) {
          return json({ ok: false, error: "Sanduče nije konfigurisano." }, 503);
        }
        if (!isAuthenticated(request)) {
          return json({ ok: false, error: "Niste prijavljeni." }, 401);
        }
        try {
          const templates = await listTemplates();
          return json({ ok: true, templates }, 200);
        } catch (err) {
          console.error(
            "[inbox] templates failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Čitanje predložaka nije uspjelo." }, 500);
        }
      },
    },
  },
});