import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    // The Cloudflare plugin must run before tanstackStart() so the SSR
    // environment is built for workerd.
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    mdx(),
    devtools(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
      pages: [
        { path: "/sitemap.xml" },
        { path: "/llms.txt" },
        { path: "/llms-full.txt" },
      ],
    }),
    viteReact(),
  ],
});

export default config;
