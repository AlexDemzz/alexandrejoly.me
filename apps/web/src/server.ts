import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { env } from "cloudflare:workers";

import { agentResponse, withVaryAccept } from "@/lib/agent-response";
import { movedRedirect } from "@/lib/moved";
import { registryFetch } from "@/lib/registry-fetch";
import { trailingSlashRedirect } from "@/lib/trailing-slash";

export default createServerEntry({
  fetch: async (request, opts) =>
    movedRedirect(request) ??
    trailingSlashRedirect(request) ??
    (await registryFetch(request, {
      assets: env.ASSETS,
      counter: env.REGISTRY_FETCHES,
    })) ??
    (await agentResponse(request)) ??
    withVaryAccept(await handler.fetch(request, opts)),
});
