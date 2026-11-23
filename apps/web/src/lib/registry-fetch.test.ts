import { expect, it } from "vitest";

import { registryFetch } from "./registry-fetch";

const setup = (status: number) => {
  const points: { blobs: string[]; indexes: string[] }[] = [];
  return {
    deps: {
      assets: {
        fetch: () => Promise.resolve(new Response("{}", { status })),
      },
      counter: {
        writeDataPoint: (point: (typeof points)[number]) => points.push(point),
      },
    },
    points,
  };
};

const request = (path: string, init?: RequestInit) =>
  new Request(new URL(path, "https://alexandrejoly.me"), init);

it("serves a registry item and counts it with its user agent and status", async () => {
  const { deps, points } = setup(200);

  const response = await registryFetch(
    request("/r/hint.json", { headers: { "user-agent": "shadcn" } }),
    deps
  );

  expect(response?.status).toBe(200);
  expect(points).toEqual([
    { blobs: ["hint", "shadcn", "200"], indexes: ["hint"] },
  ]);
});

it("counts nested registry files by their path under /r", async () => {
  const { deps, points } = setup(200);

  await registryFetch(request("/r/styles/new-york-v4/registry.json"), deps);

  expect(points[0]?.indexes).toEqual(["styles/new-york-v4/registry"]);
});

it("counts a missing file, then lets the app answer the 404", async () => {
  const { deps, points } = setup(404);

  const response = await registryFetch(request("/r/nope.json"), deps);

  expect(response).toBeUndefined();
  expect(points[0]?.blobs[2]).toBe("404");
});

it("ignores other paths and non-GET requests", async () => {
  const { deps, points } = setup(200);

  expect(
    await registryFetch(request("/components/hint"), deps)
  ).toBeUndefined();
  expect(await registryFetch(request("/r/hint.md"), deps)).toBeUndefined();
  expect(
    await registryFetch(request("/r/hint.json", { method: "HEAD" }), deps)
  ).toBeUndefined();
  expect(points).toEqual([]);
});
