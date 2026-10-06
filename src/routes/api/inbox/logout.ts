import { createFileRoute } from "@tanstack/react-router";
import { expiredCookie, json } from "~/lib/inbox";

/** POST /api/inbox/logout — briše sesijski cookie. */
export const Route = createFileRoute("/api/inbox/logout")({
  server: {
    handlers: {
      POST: async () =>
        json({ ok: true }, 200, { "set-cookie": expiredCookie() }),
    },
  },
});
