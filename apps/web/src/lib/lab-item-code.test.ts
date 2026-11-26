import { expect, it } from "vitest";

import registry from "../../registry.json";
import { getLabItemCode } from "./component-code";
import { LAB_ITEM_NAMES, labRegistryName } from "./registry";
import type { LabItemName } from "./registry";

const UI_IMPORT = /from "(?<path>@\/components\/ui\/[^"]+)"/gu;
const SOURCE_EXTENSION = /\.tsx?$/u;

/** The import paths of the files `shadcn add` writes for a lab item. */
const installedModules = (name: LabItemName) => {
  const item = registry.items.find(
    (candidate) => candidate.name === labRegistryName(name)
  );
  return (item?.files ?? []).flatMap((file) => {
    const target = "target" in file ? file.target : undefined;
    return typeof target === "string" && SOURCE_EXTENSION.test(target)
      ? [
          target
            .replace("@ui/", "@/components/ui/")
            .replace(SOURCE_EXTENSION, ""),
        ]
      : [];
  });
};

it.each(LAB_ITEM_NAMES)(
  "imports %s in its demos and usage from where the install writes it",
  async (name) => {
    const code = await getLabItemCode(name);
    const snippets = [
      code.usage.imports.code,
      ...Object.values(code.demos).map((demo) => demo.code),
    ];
    // Shadcn primitives such as button come from the reader's own project.
    const imported = snippets
      .flatMap((snippet) =>
        [...snippet.matchAll(UI_IMPORT)].map((match) => match.groups?.path)
      )
      .filter((path) => path?.includes(`/${name}/`));

    expect(imported.length).toBeGreaterThan(0);
    for (const path of imported) {
      expect(installedModules(name)).toContain(path);
    }
  }
);
