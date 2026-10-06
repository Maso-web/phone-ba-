import { createFileRoute } from "@tanstack/react-router";
import { isAuthenticated, json, listOutbound, missingInboxEnv } from "~/lib/inbox";
/** GET /api/inbox/sent — arhiva poslanih poruka (bez tijela). */
export const Route = createFileRoute("/api/inbox/sent")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        if (missingInboxEnv().length > 0) {
          return json({ ok: false, error: "Sanduče nije konfigurisano." }, 503);
        }
        if (!isAuthenticated(request)) {
          return json({ ok: false, error: "Niste prijavljeni." }, 401);
        }
        const url = new URL(request.url);
        const requested = Number(url.searchParams.get("limit") ?? "50");
        const limit = Number.isFinite(requested)
          ? Math.min(Math.max(Math.trunc(requested), 1), 100)
          : 50;
        try {
          const messages = await listOutbound(limit);
          return json({ ok: true, messages }, 200);
        } catch (err) {
          console.error(
            "[inbox] sent list failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Čitanje arhive nije uspjelo." }, 500);
        }
      },
    },
  },
});