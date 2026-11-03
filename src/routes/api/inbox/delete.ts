import { createFileRoute } from "@tanstack/react-router";
import {
  clearInbound,
  clearOutbound,
  deleteInbound,
  deleteOutbound,
  isAuthenticated,
  json,
  missingInboxEnv,
} from "~/lib/inbox";
/**
 * POST /api/inbox/delete — brisanje poruka iz sandučeta.
 * Tijelo: { box: "in" | "out", id?: string, all?: boolean }
 */
export const Route = createFileRoute("/api/inbox/delete")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (missingInboxEnv().length > 0) {
          return json({ ok: false, error: "Sanduče nije konfigurisano." }, 503);
        }
        if (!isAuthenticated(request)) {
          return json({ ok: false, error: "Niste prijavljeni." }, 401);
        }
        let payload: { box?: unknown; id?: unknown; all?: unknown };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return json({ ok: false, error: "Neispravan JSON." }, 400);
        }
        const box = payload.box === "out" ? "out" : "in";
        const all = payload.all === true;
        const id = typeof payload.id === "string" ? payload.id.trim() : "";
        if (!all && !/^[A-Za-z0-9-]{8,64}$/.test(id)) {
          return json({ ok: false, error: "Neispravan ID poruke." }, 400);
        }
        try {
          if (all) {
            if (box === "out") await clearOutbound();
            else await clearInbound();
          } else if (box === "out") {
            await deleteOutbound(id);
          } else {
            await deleteInbound(id);
          }
          return json({ ok: true }, 200);
        } catch {
          return json({ ok: false, error: "Brisanje nije uspjelo." }, 500);
        }
      },
    },
  },
});
