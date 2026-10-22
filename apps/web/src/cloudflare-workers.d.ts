declare module "cloudflare:workers" {
  /** Keeps the Worker alive after the response until `promise` settles. */
  export const waitUntil: (promise: Promise<unknown>) => void;
}
