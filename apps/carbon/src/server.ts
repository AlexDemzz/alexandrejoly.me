import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { env } from "cloudflare:workers";

import { releaseResponse } from "@/lib/releases";

export default createServerEntry({
  fetch: async (request, opts) =>
    (await releaseResponse(request, env.RELEASES)) ??
    (await handler.fetch(request, opts)),
});
