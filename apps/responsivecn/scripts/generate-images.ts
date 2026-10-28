// Renders the favicon set, the web manifest and one Open Graph image per
// indexable page into public/. Runs on prebuild under plain Node (type
// stripping), so it imports app modules by relative path with their `.ts`
// extension.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import satori from "satori";

import { parseFrontmatter } from "../src/lib/frontmatter.ts";
import { markSvg } from "../src/lib/mark.ts";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  homeSeo,
  ogImagePath,
} from "../src/lib/seo.ts";
import { appName } from "../src/lib/shared.ts";
import { themeColor } from "./theme-colors.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const DOCS_DIR = path.join(ROOT, "content/docs");

const BACKGROUND = themeColor("background", "light");
const FOREGROUND = themeColor("foreground", "light");
const MUTED = themeColor("muted-foreground", "light");

const DARK_FOREGROUND = themeColor("foreground", "dark");

const FAVICON_STYLE = `<style>.mark{fill:${FOREGROUND}}@media (prefers-color-scheme:dark){.mark{fill:${DARK_FOREGROUND}}}</style>`;

const renderPng = (svg: string, width: number): Buffer =>
  new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();

// An ICO file may hold PNG data as-is: one 6-byte header, one 16-byte entry.
const icoFromPng = (png: Buffer, size: number): Buffer => {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(header.length, 18);
  return Buffer.concat([header, png]);
};

const writeIcons = async (): Promise<void> => {
  await writeFile(
    path.join(PUBLIC_DIR, "favicon.svg"),
    `${markSvg({ color: FOREGROUND, style: FAVICON_STYLE })}\n`
  );
  const favicon = renderPng(markSvg({ color: FOREGROUND }), 32);
  await writeFile(
    path.join(PUBLIC_DIR, "favicon.ico"),
    icoFromPng(favicon, 32)
  );
  // iOS rounds the touch icon itself, so the modal fills it edge to edge.
  await writeFile(
    path.join(PUBLIC_DIR, "apple-touch-icon.png"),
    renderPng(
      markSvg({ color: FOREGROUND, background: BACKGROUND, fullBleed: true }),
      180
    )
  );
  // Also the maskable icon: padded into the safe zone.
  const padded = markSvg({
    color: FOREGROUND,
    background: BACKGROUND,
    padded: true,
  });
  await Promise.all(
    Object.entries({ "icon-192.png": 192, "icon-512.png": 512 }).map(
      ([file, size]) =>
        writeFile(path.join(PUBLIC_DIR, file), renderPng(padded, size))
    )
  );
};

const writeManifest = async (): Promise<void> => {
  const manifest = {
    name: appName,
    short_name: appName,
    description:
      "Responsive shadcn/ui overlays: a Dialog on desktop, a Drawer on a phone.",
    start_url: "/",
    display: "standalone",
    background_color: BACKGROUND,
    theme_color: BACKGROUND,
    icons: [
      { src: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
      {
        src: "/icon-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  };
  await writeFile(
    path.join(PUBLIC_DIR, "manifest.webmanifest"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
};

interface OgPage {
  path: string;
  title: string;
  description: string;
}

const h = (
  type: string,
  style: CSSProperties,
  children?: ReactNode,
  props: Record<string, unknown> = {}
): ReactElement => ({ type, key: null, props: { style, children, ...props } });

const markImage = (size: number): ReactElement => {
  const src = `data:image/svg+xml;base64,${Buffer.from(markSvg({ color: FOREGROUND })).toString("base64")}`;
  return h("img", { width: size, height: size }, undefined, {
    src,
    width: size,
    height: size,
  });
};

// The alexandrejoly.me card: media, then title and description, signed at
// the bottom. Light colour scheme, 80px of padding.
const ogCard = (page: OgPage): ReactElement =>
  h(
    "div",
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      // Satori sizes boxes content-box, so the padding would push the
      // signature off the canvas.
      boxSizing: "border-box",
      padding: 80,
      backgroundColor: BACKGROUND,
      color: FOREGROUND,
      fontFamily: "Inter",
    },
    [
      h("div", { display: "flex", flexDirection: "column", gap: 32 }, [
        markImage(128),
        h(
          "div",
          { display: "flex", flexDirection: "column", gap: 16, maxWidth: 960 },
          [
            h(
              "div",
              {
                fontSize: 60,
                fontWeight: 600,
                letterSpacing: -1.5,
                lineHeight: 1.1,
              },
              page.title
            ),
            h(
              "div",
              { fontSize: 30, color: MUTED, lineHeight: 1.375 },
              page.description
            ),
          ]
        ),
      ]),
      h("div", { display: "flex", alignItems: "center", gap: 20 }, [
        markImage(36),
        h("div", { fontSize: 30, fontWeight: 600, lineHeight: 1 }, appName),
      ]),
    ]
  );

const mdxFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => path.join(entry.parentPath, entry.name));
};

const ogPages = async (): Promise<OgPage[]> => {
  const files = await mdxFiles(DOCS_DIR);
  const docs = await Promise.all(
    files.map(async (file) => {
      const slug = path
        .relative(DOCS_DIR, file)
        .replace(/\.mdx$/u, "")
        .replace(/(?<start>^|\/)index$/u, "");
      const { title, description } = parseFrontmatter(
        await readFile(file, "utf-8")
      );
      return {
        path: slug ? `/docs/${slug}` : "/docs",
        title,
        description,
      };
    })
  );
  return [
    {
      path: homeSeo.path,
      title: "Responsive shadcn/ui overlays",
      description: homeSeo.description,
    },
    ...docs,
  ];
};

const loadFonts = () => {
  const weights = [400, 500, 600] as const;
  return Promise.all(
    weights.map(async (weight) => ({
      name: "Inter",
      weight,
      style: "normal" as const,
      data: await readFile(
        fileURLToPath(
          import.meta.resolve(
            `@fontsource/inter/files/inter-latin-${weight}-normal.woff`
          )
        )
      ),
    }))
  );
};

const writeOgImage = async (
  page: OgPage,
  fonts: Awaited<ReturnType<typeof loadFonts>>
): Promise<void> => {
  const svg = await satori(ogCard(page), {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts,
  });
  const file = path.join(PUBLIC_DIR, ogImagePath(page.path));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, renderPng(svg, OG_IMAGE_WIDTH));
};

const writeOgImages = async (): Promise<void> => {
  const [fonts, pages] = await Promise.all([loadFonts(), ogPages()]);
  await Promise.all(pages.map((page) => writeOgImage(page, fonts)));
};

await writeIcons();
await writeManifest();
await writeOgImages();
