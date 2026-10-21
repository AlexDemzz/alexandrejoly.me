import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { agentResponse, withVaryAccept } from "@/lib/agent-response";

export default createServerEntry({
  fetch: async (request) =>
    agentResponse(request) ?? withVaryAccept(await handler.fetch(request)),
});
