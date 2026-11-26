import type { Plugin } from "vite";

// The toast, the carousel and the radio load their three.js scene and their embedded
// model, textures and sounds from effects, so only ever in the browser. The
// server build still bundles every dynamic import: an empty module stands in
// for each there, so neither three nor about a megabyte of base64 a piece
// ships in the Worker.
const CLIENT_ONLY =
  /\/registry\/(?:toast\/toast-(?:crumb|environment|model|poster|scene|sound-engine|sound-samples)|carousel\/carousel-(?:environment|model|poster|poster-dim|scene|sound-engine|sound-samples)|radio\/radio-(?:environment|model|poster|poster-bands|scene|sound-engine|sound-samples))\.ts$/u;

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
