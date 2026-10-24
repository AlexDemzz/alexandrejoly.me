import { expect, it } from "vitest";

import { componentJsonLd, componentsJsonLd } from "./component-json-ld";
import { getRegistryItem } from "./registry";

it("ends its breadcrumb on the docs page it describes", () => {
  const [breadcrumb, code] = componentJsonLd(getRegistryItem("hint"))["@graph"];

  expect(breadcrumb.itemListElement.at(-1)?.item).toBe(
    "https://alexandrejoly.me/components/hint"
  );
  expect(code.url).toBe("https://alexandrejoly.me/components/hint");
});

it("passes through the components index on the way to a docs page", () => {
  const [breadcrumb] = componentJsonLd(getRegistryItem("hint"))["@graph"];

  expect(breadcrumb.itemListElement.map(({ item }) => item)).toEqual([
    "https://alexandrejoly.me/",
    "https://alexandrejoly.me/components",
    "https://alexandrejoly.me/components/hint",
  ]);
});

it("lists every docs page on the components index", () => {
  const [, page] = componentsJsonLd()["@graph"];

  expect(page.mainEntity.itemListElement.map(({ url }) => url)).toContain(
    "https://alexandrejoly.me/components/item-inset-separator"
  );
});
