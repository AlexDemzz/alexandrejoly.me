declare module "cloudflare:workers" {
  import type { ReleasesBucket } from "@/lib/releases";

  /** Bindings declared in `wrangler.jsonc`. */
  export const env: {
    RELEASES: ReleasesBucket;
  };
}
