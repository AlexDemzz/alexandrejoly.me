import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import RouteError from "./components/route-error";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    // Home keys its scroll by path, so a Link back to it lands where the
    // reader left off instead of at the top.
    getScrollRestorationKey: (location) =>
      location.pathname === "/"
        ? location.pathname
        : (location.state.__TSR_key ?? location.href),
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    context: {},
    // No pending UI: without a pending component the current page stays up
    // until the next one has loaded.
    defaultErrorComponent: RouteError,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
