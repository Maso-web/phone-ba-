import { createFileRoute } from "@tanstack/react-router";
import {
  isAuthenticated,
  json,
  missingInboxEnv,
  outboundStatuses,
} from "~/lib/inbox";
/** GET /api/inbox/sent-status?limit=20 — status dostave za poslane poruke. */
export const Route = createFileRoute("/api/inbox/sent-status")({
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
        const ids = (url.searchParams.get("ids") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => /^[A-Za-z0-9-]{8,64}$/.test(s));
        if (ids.length === 0) return json({ ok: true, statuses: {} }, 200);
        try {
          const statuses = await outboundStatuses(ids);
          return json({ ok: true, statuses }, 200);
        } catch {
          return json({ ok: true, statuses: {} }, 200);
        }
      },
    },
  },
});
