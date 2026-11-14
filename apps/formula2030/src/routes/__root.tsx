import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { NotFound } from "@/components/not-found";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  THEME_COLOR,
  absoluteUrl,
} from "@/lib/site";

import appCss from "@/styles/app.css?url";

const OG_IMAGE = absoluteUrl("/og.png");

const RootComponent = () => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      <Outlet />
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      { href: `${SITE_URL}/`, rel: "canonical" },
    ],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: SITE_TITLE },
      { content: SITE_DESCRIPTION, name: "description" },
      { content: THEME_COLOR, name: "theme-color" },
      { content: "light", name: "color-scheme" },
      { content: SITE_NAME, property: "og:site_name" },
      { content: "website", property: "og:type" },
      { content: `${SITE_URL}/`, property: "og:url" },
      { content: SITE_TITLE, property: "og:title" },
      { content: SITE_DESCRIPTION, property: "og:description" },
      { content: OG_IMAGE, property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      {
        content: "The Formula 2030 panel: black glass, tonal bands and tiles",
        property: "og:image:alt",
      },
      { content: "summary_large_image", name: "twitter:card" },
      { content: SITE_TITLE, name: "twitter:title" },
      { content: SITE_DESCRIPTION, name: "twitter:description" },
      { content: OG_IMAGE, name: "twitter:image" },
    ],
  }),
  notFoundComponent: NotFound,
});
