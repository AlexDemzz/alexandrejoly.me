import { describe, expect, it } from "vitest";

import { canonicalUrl, markdownUrl, ogImagePath, pageHead } from "./seo";

const metaContent = (
  head: ReturnType<typeof pageHead>,
  key: string
): string | undefined => {
  const tag = head.meta.find(
    (meta) => meta.name === key || meta.property === key
  );
  return tag?.content;
};

describe("canonicalUrl", () => {
  it("puts the path on the production origin without a trailing slash", () => {
    expect(canonicalUrl("/docs/dialog-drawer/")).toBe(
      "https://responsivecn.alexandrejoly.me/docs/dialog-drawer"
    );
  });

  it("keeps the root as the bare origin with its slash", () => {
    expect(canonicalUrl("/")).toBe("https://responsivecn.alexandrejoly.me/");
  });
});

describe("ogImagePath", () => {
  it("gives every page its own image file", () => {
    expect(ogImagePath("/")).toBe("/og/index.png");
    expect(ogImagePath("/docs")).toBe("/og/docs.png");
    expect(ogImagePath("/docs/sheet-drawer")).toBe("/og/docs/sheet-drawer.png");
  });
});

describe("markdownUrl", () => {
  it("points at the page's .md twin", () => {
    expect(markdownUrl("/")).toBe(
      "https://responsivecn.alexandrejoly.me/index.md"
    );
    expect(markdownUrl("/docs/tooltip-popover")).toBe(
      "https://responsivecn.alexandrejoly.me/docs/tooltip-popover.md"
    );
  });
});

describe("pageHead", () => {
  const head = pageHead({
    path: "/docs/dialog-drawer",
    title: "DialogDrawer: shadcn Dialog on desktop, Drawer on mobile",
    description: "A centered Dialog at desktop that becomes a Drawer.",
    type: "article",
  });

  it("declares a self-referencing canonical that Open Graph repeats", () => {
    const canonical = head.links.find((link) => link.rel === "canonical");
    expect(canonical?.href).toBe(
      "https://responsivecn.alexandrejoly.me/docs/dialog-drawer"
    );
    expect(metaContent(head, "og:url")).toBe(canonical?.href);
  });

  it("shares the page with a large card and an absolute image URL", () => {
    expect(metaContent(head, "og:image")).toBe(
      "https://responsivecn.alexandrejoly.me/og/docs/dialog-drawer.png"
    );
    expect(metaContent(head, "twitter:card")).toBe("summary_large_image");
    expect(metaContent(head, "twitter:image")).toBe(
      metaContent(head, "og:image")
    );
    expect(metaContent(head, "og:type")).toBe("article");
  });

  it("advertises the Markdown twin", () => {
    const alternate = head.links.find(
      (link) => link.rel === "alternate" && link.type === "text/markdown"
    );
    expect(alternate?.href).toBe(
      "https://responsivecn.alexandrejoly.me/docs/dialog-drawer.md"
    );
  });

  it("serializes JSON-LD that cannot close its script tag early", () => {
    const withJsonLd = pageHead({
      path: "/",
      title: "t",
      description: "d",
      jsonLd: { "@type": "WebSite", name: "</script><script>alert(1)" },
    });
    const [script] = withJsonLd.scripts;
    expect(script.type).toBe("application/ld+json");
    expect(script.children).not.toContain("</script>");
    expect(JSON.parse(script.children)).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "</script><script>alert(1)",
    });
  });
});
