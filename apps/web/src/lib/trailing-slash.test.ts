import { expect, it } from "vitest";

import { trailingSlashRedirect } from "./trailing-slash";

const request = (path: string) =>
  new Request(new URL(path, "https://alexandrejoly.me"));

it("permanently redirects a trailing slash away, keeping the query", () => {
  const response = trailingSlashRedirect(request("/components/hint/?tab=code"));

  expect(response?.status).toBe(308);
  expect(response?.headers.get("location")).toBe(
    "https://alexandrejoly.me/components/hint?tab=code"
  );
});

it("strips every trailing slash in one hop", () => {
  expect(
    trailingSlashRedirect(request("/about//"))?.headers.get("location")
  ).toBe("https://alexandrejoly.me/about");
});

it("leaves the home page and slashless paths alone", () => {
  expect(trailingSlashRedirect(request("/"))).toBeUndefined();
  expect(trailingSlashRedirect(request("/about"))).toBeUndefined();
});
