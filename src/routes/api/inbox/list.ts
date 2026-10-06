import { createFileRoute } from "@tanstack/react-router";
import { isAuthenticated, json, listInbound, missingInboxEnv } from "~/lib/inbox";

/**
 * GET /api/inbox/list?limit=50 — lista primljenih poruka (bez tijela).
 * 401 bez važeće sesije, 503 ako env nije postavljen.
 */
export const Route = createFileRoute("/api/inbox/list")({
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
          const messages = await listInbound(limit);
          return json({ ok: true, messages }, 200);
        } catch (err) {
          console.error(
            "[inbox] list failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Čitanje liste nije uspjelo." }, 500);
        }
      },
    },
  },
});
