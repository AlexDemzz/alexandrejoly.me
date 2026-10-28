// Reads the two frontmatter fields every docs page sets. Shared with
// scripts/generate-images.ts, which runs under plain Node without the MDX
// pipeline.
export interface DocsFrontmatter {
  title: string;
  description: string;
}

const FRONTMATTER = /^---\r?\n(?<block>[\s\S]*?)\r?\n---/u;

const field = (block: string, name: string): string => {
  const match = new RegExp(`^${name}:\\s*(?<value>.+)$`, "mu").exec(block);
  const value = match?.groups?.value;
  if (!value) {
    throw new Error(`Frontmatter is missing "${name}"`);
  }
  return value
    .trim()
    .replace(/^(?<quote>["'])(?<text>.*)\k<quote>$/u, "$<text>");
};

export const parseFrontmatter = (source: string): DocsFrontmatter => {
  const block = FRONTMATTER.exec(source)?.groups?.block;
  if (block === undefined) {
    throw new Error("Page has no frontmatter block");
  }
  return {
    title: field(block, "title"),
    description: field(block, "description"),
  };
};
