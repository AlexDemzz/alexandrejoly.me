import { describe, expect, it } from "vitest";

import { agentResponse } from "./agent-responses";

const pages: Record<string, string> = {
  "/": "# responsivecn\n",
  "/docs/dialog-drawer": "# DialogDrawer\n",
};

const resolve = (path: string) => Promise.resolve(pages[path]);

const get = (path: string, accept?: string): Request =>
  new Request(`https://responsivecn.alexandrejoly.me${path}`, {
    headers: accept ? { accept } : {},
  });

describe("agentResponse", () => {
  it("answers Accept: text/markdown with the page's Markdown at its own URL", async () => {
    const response = await agentResponse(get("/", "text/markdown"), resolve);
    expect(response?.status).toBe(200);
    expect(response?.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(response?.headers.get("vary")).toBe("Accept");
    expect(await response?.text()).toBe("# responsivecn\n");
  });

  it("serves the .md twin and points search engines at the HTML page", async () => {
    const response = await agentResponse(
      get("/docs/dialog-drawer.md"),
      resolve
    );
    expect(response?.status).toBe(200);
    expect(await response?.text()).toBe("# DialogDrawer\n");
    expect(response?.headers.get("link")).toBe(
      '<https://responsivecn.alexandrejoly.me/docs/dialog-drawer>; rel="canonical"'
    );
  });

  it("returns a Markdown 404 that leads back to llms.txt", async () => {
    const response = await agentResponse(
      get("/docs/missing", "text/markdown"),
      resolve
    );
    expect(response?.status).toBe(404);
    expect(await response?.text()).toContain(
      "https://responsivecn.alexandrejoly.me/llms.txt"
    );
  });

  it("leaves browser requests to the app", async () => {
    expect(
      await agentResponse(get("/", "text/html,*/*;q=0.8"), resolve)
    ).toBeUndefined();
  });
});
