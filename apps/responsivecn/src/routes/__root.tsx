import { DocsProvider } from "@portfolio/docs-theme/provider";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { appName } from "@/lib/shared";

import appCss from "../styles.css?url";

const RootDocument = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <HeadContent />
    </head>
    <body className="flex min-h-svh flex-col">
      <DocsProvider>{children}</DocsProvider>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "color-scheme",
        content: "light dark",
      },
      { property: "og:site_name", content: appName },
      { property: "og:locale", content: "en_US" },
      { name: "is-agentic-site-type", content: "content" },
      { title: appName },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>Page not found</h1>
      <p>
        This page doesn’t exist or has moved. Go to the{" "}
        <Link to="/" className="link-text">
          home page
        </Link>{" "}
        or{" "}
        <Link to="/docs/$" params={{ _splat: "" }} className="link-text">
          read the docs
        </Link>
        .
      </p>
    </main>
  ),
  shellComponent: RootDocument,
});
