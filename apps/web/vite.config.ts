import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { varlockCloudflareVitePlugin } from "@varlock/cloudflare-integration";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { componentCode } from "./plugins/component-code.ts";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    varlockCloudflareVitePlugin({ viteEnvironment: { name: "ssr" } }),
    componentCode(),
    tanstackStart(),
    viteReact(),
  ],
});
