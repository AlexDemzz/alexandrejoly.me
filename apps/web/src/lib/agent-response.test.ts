import { describe, expect, it } from "vitest";

import { agentResponse, withVaryAccept } from "./agent-response";

const request = (path: string, init: RequestInit = {}) =>
  new Request(new URL(path, "https://alexandrejoly.me"), init);

const markdownRequest = (path: string, method = "GET") =>
  request(path, { headers: { accept: "text/markdown" }, method });

describe("agentResponse", () => {
  it("answers Markdown requests for the home page with Markdown", async () => {
    const response = await agentResponse(markdownRequest("/"));

    expect(response?.status).toBe(200);
    expect(response?.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(response?.headers.get("vary")).toBe("Accept");
    expect(await response?.text()).toMatch(/^# Alexandre Joly\n/u);
  });

  it("leaves HTML requests to the app", async () => {
    expect(
      await agentResponse(request("/", { headers: { accept: "text/html" } }))
    ).toBeUndefined();
    expect(await agentResponse(request("/about"))).toBeUndefined();
  });

  it("serves a page's Markdown twin at its .md path, whatever Accept says", async () => {
    const response = await agentResponse(request("/components/hint.md"));

    expect(response?.status).toBe(200);
    expect(await response?.text()).toMatch(/^# Hint\n/u);
  });

  it("answers unknown paths with a Markdown 404 that points somewhere useful", async () => {
    const response = await agentResponse(markdownRequest("/does-not-exist"));
    const body = (await response?.text()) ?? "";

    expect(response?.status).toBe(404);
    expect(response?.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(body).toContain("`/does-not-exist`");
    expect(body).toContain("(https://alexandrejoly.me/llms.txt)");
  });

  it("treats unknown component names as missing", async () => {
    const response = await agentResponse(markdownRequest("/components/nope"));

    expect(response?.status).toBe(404);
  });

  it("serves llms.txt as plain text", async () => {
    const response = await agentResponse(request("/llms.txt"));

    expect(response?.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(await response?.text()).toContain("## When to use this site");
  });

  it("sends headers without a body for HEAD", async () => {
    const response = await agentResponse(markdownRequest("/", "HEAD"));

    expect(response?.status).toBe(200);
    expect(await response?.text()).toBe("");
  });

  it("leaves writes and server functions to the app", async () => {
    expect(await agentResponse(markdownRequest("/", "POST"))).toBeUndefined();
    expect(
      await agentResponse(markdownRequest("/_serverFn/abc"))
    ).toBeUndefined();
  });
});

describe("withVaryAccept", () => {
  it("adds Accept to an existing Vary", () => {
    const response = withVaryAccept(
      new Response("<html></html>", {
        headers: {
          "content-type": "text/html; charset=utf-8",
          vary: "Accept-Encoding",
        },
      })
    );

    expect(response.headers.get("vary")).toBe("Accept-Encoding, Accept");
  });

  it("marks refusals as Accept-dependent too", () => {
    const response = withVaryAccept(Response.json({}, { status: 406 }));

    expect(response.headers.get("vary")).toBe("Accept");
  });
});
