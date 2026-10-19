import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../index.css?url";

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
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
      { title: "Alexandre Joly" },
      {
        content:
          "Creative developer in Geneva. Building Gymup, Kwern and react-easy-modals.",
        name: "description",
      },
      {
        content: "#fcfcfc",
        media: "(prefers-color-scheme: light)",
        name: "theme-color",
      },
      {
        content: "#101010",
        media: "(prefers-color-scheme: dark)",
        name: "theme-color",
      },
    ],
  }),
});
