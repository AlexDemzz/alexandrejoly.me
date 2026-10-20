import { describe, expect, it } from "vitest";

import registry from "../../registry.json";
import { REGISTRY_ITEM_NAMES, getInstallation } from "./registry";
import type { RegistryItem } from "./registry";

const item: RegistryItem = {
  description: "",
  files: [],
  name: "onboarding",
  title: "Onboarding",
};

describe("REGISTRY_ITEM_NAMES", () => {
  it("lists every registry.json item, in its order", () => {
    expect(registry.items.map(({ name }) => name)).toEqual([
      ...REGISTRY_ITEM_NAMES,
    ]);
  });
});

describe("getInstallation", () => {
  it("installs through the namespace", () => {
    expect(getInstallation(item).cli).toBe(
      "pnpm dlx shadcn@latest add @alexandrejoly/onboarding"
    );
  });

  it("lists npm packages and shadcn primitives as one command each", () => {
    const installation = getInstallation({
      ...item,
      dependencies: ["motion", "class-variance-authority"],
      registryDependencies: ["button", "progress"],
    });

    expect(installation.dependencies).toBe(
      "pnpm add motion class-variance-authority"
    );
    expect(installation.registryDependencies).toBe(
      "pnpm dlx shadcn@latest add button progress"
    );
  });

  it("skips the dependency steps an item does not need", () => {
    const installation = getInstallation({
      ...item,
      dependencies: [],
      registryDependencies: [],
    });

    expect(installation.dependencies).toBeNull();
    expect(installation.registryDependencies).toBeNull();
  });
});
