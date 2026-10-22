import type { ComponentDocs } from "@/components/docs/registry-docs";

export const SECTION_IDS = {
  accessibility: "accessibility",
  api: "api-reference",
  examples: "examples",
  installation: "installation",
  usage: "usage",
} as const;

const CAMEL_BOUNDARY = /(?<before>[a-z\d])(?<after>[A-Z])/gu;
const NON_ALPHANUMERIC = /[^a-z\d]+/gu;
const EDGE_HYPHENS = /^-|-$/gu;

export const slugify = (text: string) =>
  text
    .replaceAll(CAMEL_BOUNDARY, "$<before>-$<after>")
    .toLowerCase()
    .replaceAll(NON_ALPHANUMERIC, "-")
    .replaceAll(EDGE_HYPHENS, "");

/**
 * One id per example and per API part, unique on the page: a slug that is
 * already taken gets a `-1`, `-2` suffix, as GitHub does.
 */
export const headingIds = ({ api, examples }: ComponentDocs) => {
  const taken = new Set<string>(Object.values(SECTION_IDS));
  const claim = (text: string) => {
    const base = slugify(text);
    let id = base;
    for (let suffix = 1; taken.has(id); suffix += 1) {
      id = `${base}-${suffix}`;
    }
    taken.add(id);
    return id;
  };
  return {
    examples: examples.map((example) => claim(example.title)),
    api: api.map((part) => claim(part.name)),
  };
};
