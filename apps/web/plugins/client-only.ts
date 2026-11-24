import type { Plugin } from "vite";

// The toaster loads its three.js scene and its embedded model, textures and
// sounds from effects, so only ever in the browser. The server build still
// bundles every dynamic import: an empty module stands in for each there, so
// neither three nor about a megabyte of base64 ships in the Worker.
const CLIENT_ONLY =
  /\/registry\/toaster\/toaster-(?:crumb|environment|model|poster|scene|sound-engine|sound-samples)\.ts$/u;

export const clientOnly = (): Plugin => ({
  enforce: "pre",
  load(id) {
    if (this.environment.config.consumer === "client") {
      return null;
    }
    return CLIENT_ONLY.test(id) ? "export {};" : null;
  },
  name: "client-only",
});
