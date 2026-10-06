import { createFileRoute } from "@tanstack/react-router";
import {
  getInboundAttachment,
  isAuthenticated,
  json,
  missingInboxEnv,
} from "~/lib/inbox";
/** GET /api/inbox/attachment?id=<attachment_id> — preuzimanje priloga (auth). */
export const Route = createFileRoute("/api/inbox/attachment")({
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
          const att = await getInboundAttachment(id);
          if (!att) {
            return json({ ok: false, error: "Prilog nije nađen." }, 404);
          }
          const isText =
            /^text\//.test(att.content_type) ||
            att.content_type === "application/json" ||
            att.content_type === "application/xml";
          const disposition = isText ? "inline" : "attachment";
          const safeName = att.filename.replace(/[^\w.\-() ]+/g, "_");
          return new Response(new Uint8Array(att.data), {
            status: 200,
            headers: {
              "content-type": att.content_type || "application/octet-stream",
              "content-disposition": `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(att.filename)}`,
              "content-length": String(att.data.length),
              "cache-control": "private, max-age=300",
            },
          });
        } catch (err) {
          console.error(
            "[inbox] attachment failed:",
            err instanceof Error ? err.message.slice(0, 200) : "unknown",
          );
          return json({ ok: false, error: "Preuzimanje nije uspjelo." }, 500);
        }
      },
    },
  },
});