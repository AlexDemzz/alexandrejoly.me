import { isPairSlug } from "@/components/create/pairs";

const LEGACY_BASE_PREFIXES = new Set(["base", "radix"]);

// The docs used to have one page per base (/docs/base/<slug>, /docs/radix/<slug>).
// One base-agnostic page per pair replaced them; returns the new splat for an
// old URL, or undefined when the path is not a legacy one.
export const legacyDocsRedirect = (slugs: string[]): string | undefined => {
  const [prefix = "", ...rest] = slugs;
  if (!LEGACY_BASE_PREFIXES.has(prefix)) {
    return undefined;
  }
  if (rest.length === 0) {
    return "";
  }
  if (rest.length === 1 && isPairSlug(rest[0])) {
    return rest[0];
  }
  return undefined;
};
