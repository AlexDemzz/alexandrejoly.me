// Rewrites the @portfolio/ui imports of every built item in public/r to the
// stock shadcn aliases `shadcn add` maps to the user's own paths. Items whose
// source lives in packages/ui (symlinked from registry/) import it as a
// workspace package; installs must read like any other registry item:
// packages first, then a blank line, then the aliased imports.
// Run after `shadcn build`.
import { readFile, readdir, writeFile } from "node:fs/promises";

const OUTPUT_DIR = new URL("../public/r/", import.meta.url);
const PACKAGE = "@portfolio/ui/";
const ALIASES = [
  ["@portfolio/ui/components/", "@/components/ui/"],
  ["@portfolio/ui/hooks/", "@/hooks/"],
  ["@portfolio/ui/lib/", "@/lib/"],
];
const SPECIFIER = /from "(?<specifier>[^"]+)";$/u;

const toAlias = (specifier) => {
  const alias = ALIASES.find(([from]) => specifier.startsWith(from));
  if (!alias) {
    throw new Error(`No shadcn alias for ${specifier}`);
  }
  return alias[1] + specifier.slice(alias[0].length);
};

/** Splits the leading imports into whole statements and the code after. */
const splitImports = (lines) => {
  const statements = [];
  let index = 0;
  while (index < lines.length && lines[index].startsWith("import ")) {
    const start = index;
    while (!SPECIFIER.test(lines[index])) {
      index += 1;
      if (index === lines.length) {
        throw new Error(`Unterminated import: ${lines[start]}`);
      }
    }
    index += 1;
    statements.push(lines.slice(start, index));
  }
  return { rest: lines.slice(index), statements };
};

const toConsumerSource = (content) => {
  const lines = content.split("\n");
  const head = [];
  while (lines.length > 0 && !lines[0].startsWith("import ")) {
    head.push(lines.shift());
  }
  const { statements, rest } = splitImports(lines);
  const packages = [];
  const aliased = [];
  for (const statement of statements) {
    const last = statement.length - 1;
    const { specifier } = SPECIFIER.exec(statement[last]).groups;
    if (specifier.startsWith(PACKAGE)) {
      aliased.push([
        ...statement.slice(0, last),
        statement[last].replace(specifier, toAlias(specifier)),
      ]);
    } else {
      packages.push(statement);
    }
  }
  const groups = [packages, aliased]
    .filter((group) => group.length > 0)
    .map((group) => group.flat().join("\n"));
  const source = [...head, groups.join("\n\n"), ...rest].join("\n");
  if (source.includes(PACKAGE)) {
    throw new Error(`${PACKAGE} is still referenced outside the imports`);
  }
  return source;
};

const rewriteItem = async (file) => {
  const url = new URL(file, OUTPUT_DIR);
  const item = JSON.parse(await readFile(url, "utf-8"));
  const sources = (item.files ?? []).filter(({ content }) =>
    content?.includes(PACKAGE)
  );
  if (sources.length === 0) {
    return;
  }
  for (const source of sources) {
    source.content = toConsumerSource(source.content);
  }
  await writeFile(url, JSON.stringify(item, null, 2));
};

const outputs = await readdir(OUTPUT_DIR);
const items = outputs.filter(
  (file) => file.endsWith(".json") && file !== "registry.json"
);
await Promise.all(items.map(rewriteItem));
