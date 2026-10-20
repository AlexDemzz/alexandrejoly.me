import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { REGISTRY_DOCS } from "@/components/docs/registry-docs";
import { demoSource, highlight, registrySource } from "@/lib/highlight.server";
import {
  getInstallation,
  getRegistryItem,
  isRegistryItemName,
  registryConfig,
} from "@/lib/registry";

const highlightOptional = (code: string | null) =>
  code === null ? null : highlight(code, "bash");

/** Every code block of a component page, highlighted to HTML on the server. */
export const getComponentCode = createServerFn({ method: "GET" })
  .validator((name: string) => {
    if (!isRegistryItemName(name)) {
      throw notFound();
    }
    return name;
  })
  .handler(async ({ data: name }) => {
    const docs = REGISTRY_DOCS[name];
    const installation = getInstallation(getRegistryItem(name));
    const demoFiles = [docs.demo, ...docs.examples].map(({ file }) => file);

    const [
      cli,
      cliFromUrl,
      config,
      dependencies,
      registryDependencies,
      source,
      usage,
      ...demos
    ] = await Promise.all([
      highlight(installation.cli, "bash"),
      highlight(installation.cliFromUrl, "bash"),
      highlight(registryConfig(), "json"),
      highlightOptional(installation.dependencies),
      highlightOptional(installation.registryDependencies),
      highlight(registrySource(name), "tsx"),
      highlight(docs.usage, "tsx"),
      ...demoFiles.map((file) => highlight(demoSource(file), "tsx")),
    ]);

    return {
      demos: Object.fromEntries(
        demoFiles.map((file, index) => [file, demos[index] ?? ""])
      ),
      installation: {
        cli,
        cliFromUrl,
        config,
        dependencies,
        registryDependencies,
        targetPath: installation.targetPath,
      },
      source,
      usage,
    };
  });

export type ComponentCode = Awaited<ReturnType<typeof getComponentCode>>;
