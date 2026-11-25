import { expect, it } from "vitest";

import { movedRedirect } from "./moved";

const request = (path: string) =>
  new Request(new URL(path, "https://alexandrejoly.me"));

const location = (path: string) =>
  movedRedirect(request(path))?.headers.get("location");

it("permanently redirects the Toast page to its place under Literal UI", () => {
  const response = movedRedirect(request("/lab/toast"));

  expect(response?.status).toBe(301);
  expect(response?.headers.get("location")).toBe(
    "https://alexandrejoly.me/lab/literal-ui/toast"
  );
});

it("redirects the Markdown twin to the new twin", () => {
  expect(location("/lab/toast.md")).toBe(
    "https://alexandrejoly.me/lab/literal-ui/toast.md"
  );
});

it("reaches the new page in one hop from a trailing slash, keeping the query", () => {
  expect(location("/lab/toast/?tab=code")).toBe(
    "https://alexandrejoly.me/lab/literal-ui/toast?tab=code"
  );
});

it.each([
  ["toaster", "literal-ui/toast"],
  ["toast", "literal-ui/toast"],
  ["carousel", "literal-ui/carousel"],
])(
  "permanently redirects the %s registry item to %s in one hop, so the install command shared before still works",
  (before, after) => {
    const response = movedRedirect(request(`/r/${before}.json`));

    expect(response?.status).toBe(301);
    expect(response?.headers.get("location")).toBe(
      `https://alexandrejoly.me/r/${after}.json`
    );
    expect(movedRedirect(request(`/r/${after}.json`))).toBeUndefined();
  }
);

it("leaves the new address and its neighbours alone", () => {
  expect(movedRedirect(request("/lab/literal-ui/toast"))).toBeUndefined();
  expect(movedRedirect(request("/lab/toaster"))).toBeUndefined();
  expect(movedRedirect(request("/lab"))).toBeUndefined();
});
