declare module "cloudflare:workers" {
  interface KVNamespace {
    get: <Value>(key: string, type: "json") => Promise<Value | null>;
    put: (key: string, value: string) => Promise<void>;
  }

  /** Bindings declared in `wrangler.jsonc`. */
  export const env: {
    CONTRIBUTIONS: KVNamespace;
  };

  /** Keeps the Worker alive after the response until `promise` settles. */
  export const waitUntil: (promise: Promise<unknown>) => void;
}
