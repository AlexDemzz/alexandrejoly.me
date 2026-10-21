import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { AnyRouteMatch } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { NotFound } from "@/components/not-found";
import { SITE } from "@/content";

import appCss from "../index.css?url";

// The router flags the root match `_notFound` when it renders the boundary:
// an unmatched path, or a `notFound()` that bubbled up to the root.
const isNotFoundMatch = (match: AnyRouteMatch) =>
  match.status === "notFound" || match._notFound === true;

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
      {/* Outside `head()`: TanStack keeps a single meta per `name`. */}
      <meta
        content="#fcfbf9"
        media="(prefers-color-scheme: light)"
        name="theme-color"
      />
      <meta
        content="#0f0e0d"
        media="(prefers-color-scheme: dark)"
        name="theme-color"
      />
    </head>
    <body>
      {children}
      <Scripts />
    </body>
  </html>
);

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
);

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
  head: ({ matches }) => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: "/favicon.ico", rel: "icon", sizes: "48x48" },
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      { href: "/apple-touch-icon.png", rel: "apple-touch-icon" },
    ],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      ...(matches.some(isNotFoundMatch)
        ? [
            { title: `Page not found – ${SITE.name}` },
            { content: "noindex", name: "robots" },
          ]
        : [{ title: SITE.name }]),
    ],
  }),
});
