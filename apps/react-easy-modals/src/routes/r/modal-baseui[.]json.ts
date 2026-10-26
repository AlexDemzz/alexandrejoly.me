import { createFileRoute } from "@tanstack/react-router";

import { BASE_UI_MODAL_URL } from "@/lib/registry";

export const Route = createFileRoute("/r/modal-baseui.json")({
  server: {
    handlers: {
      GET: () => Response.redirect(BASE_UI_MODAL_URL, 308),
    },
  },
});
