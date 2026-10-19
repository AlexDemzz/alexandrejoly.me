import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SITE } from "@/content";

import appCss from "../index.css?url";

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
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
    ],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: SITE.name },
    ],
  }),
});
