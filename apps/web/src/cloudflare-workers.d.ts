declare module "cloudflare:workers" {
  interface KVNamespace {
    get: <Value>(key: string, type: "json") => Promise<Value | null>;
    put: (key: string, value: string) => Promise<void>;
  }

  /** Bindings declared in `wrangler.jsonc`. */
  export const env: {
    ASSETS: { fetch: (request: Request) => Promise<Response> };
    CONTRIBUTIONS: KVNamespace;
    REGISTRY_FETCHES: {
      writeDataPoint: (point: { blobs: string[]; indexes: string[] }) => void;
    };
  };

  /** Keeps the Worker alive after the response until `promise` settles. */
  export const waitUntil: (promise: Promise<unknown>) => void;
}
