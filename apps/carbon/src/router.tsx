import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { NotFound } from "@/components/not-found";

import { routeTree } from "./routeTree.gen";

export const getRouter = () =>
  createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
