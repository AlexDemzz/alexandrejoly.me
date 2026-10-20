import { describe, expect, it } from "vitest";

import { getInstallation, registryConfig } from "./registry";

const item = {
  description: "",
  files: [],
  name: "onboarding",
  title: "Onboarding",
};

describe("getInstallation", () => {
  it("installs through the namespace or straight from the item URL", () => {
    const installation = getInstallation(item);

    expect(installation.cli).toBe(
      "pnpm dlx shadcn@latest add @alexandrejoly/onboarding"
    );
    expect(installation.cliFromUrl).toBe(
      "pnpm dlx shadcn@latest add https://alexandrejoly.me/r/onboarding.json"
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

describe("registryConfig", () => {
  it("maps the namespace to the item URL template", () => {
    expect(JSON.parse(registryConfig())).toEqual({
      registries: {
        "@alexandrejoly": "https://alexandrejoly.me/r/{name}.json",
      },
    });
  });
});
