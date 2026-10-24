import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { agentResponse, withVaryAccept } from "@/lib/agent-response";
import { trailingSlashRedirect } from "@/lib/trailing-slash";

export default createServerEntry({
  fetch: async (request, opts) =>
    trailingSlashRedirect(request) ??
    (await agentResponse(request)) ??
    withVaryAccept(await handler.fetch(request, opts)),
});
