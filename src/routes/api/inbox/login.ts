import { createFileRoute } from "@tanstack/react-router";
import {
  clientIp,
  createSessionToken,
  json,
  missingInboxEnv,
  passwordMatches,
  registerLoginAttempt,
  resetLoginAttempts,
  sessionCookie,
} from "~/lib/inbox";

/**
 * POST /api/inbox/login — prijava u lično sanduče (jedna lozinka: INBOX_PASSWORD).
 *
 * Tijelo: { password: string }
 * 200 { ok: true } + HttpOnly `pb_inbox_session` cookie (12 h)
 * 401 { ok: false, error: "Pogrešna lozinka." }
 * 429 { ok: false, error: "Previše pokušaja…", retryAfterSec }
 * 503 — INBOX_PASSWORD/DATABASE_URL nisu postavljeni u okolini.
 *
 * Lozinka i njeno poređenje se nikad ne loguju. Najviše 5 pokušaja / 15 min po IP-u.
 */
export const Route = createFileRoute("/api/inbox/login")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const missing = missingInboxEnv();
        if (missing.length > 0) {
          console.error("[inbox] not configured, missing:", missing.join(","));
          return json({ ok: false, error: "Sanduče nije konfigurisano." }, 503);
        }

        const ip = clientIp(request);
        const limit = registerLoginAttempt(ip);
        if (!limit.allowed) {
          return json(
            {
              ok: false,
              error: "Previše pokušaja. Pokušaj ponovo kasnije.",
              retryAfterSec: limit.retryAfterSec,
            },
            429,
            { "retry-after": String(limit.retryAfterSec) },
          );
        }

        let payload: { password?: unknown };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return json({ ok: false, error: "Neispravan JSON." }, 400);
        }
        if (typeof payload.password !== "string" || payload.password === "") {
          return json({ ok: false, error: "Lozinka je obavezna." }, 400);
        }

        if (!passwordMatches(payload.password)) {
          console.error("[inbox] failed login attempt");
          return json({ ok: false, error: "Pogrešna lozinka." }, 401);
        }

        resetLoginAttempts(ip);
        console.log("[inbox] successful login");
        return json({ ok: true }, 200, {
          "set-cookie": sessionCookie(createSessionToken()),
        });
      },
    },
  },
});
