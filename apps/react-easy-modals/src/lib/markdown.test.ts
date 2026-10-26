import { describe, expect, it } from "vitest";

import { cleanMarkdown } from "./markdown";

describe("cleanMarkdown", () => {
  it("drops live demo tags and heading ids", () => {
    const input =
      "## The Modal Stack [#the-modal-stack]\nIntro.\n\n<StackExample />\n\n<ConfirmExemple />\n\nAfter.";
    expect(cleanMarkdown(input)).toBe("## The Modal Stack\nIntro.\n\nAfter.");
  });

  it("keeps code fences verbatim", () => {
    const input = "```tsx\n## not a heading [#x]\n<SimpleExample />\n```";
    expect(cleanMarkdown(input)).toBe(input);
  });

  it("keeps other JSX such as callouts", () => {
    const input = '<Callout type="info">Hi</Callout>';
    expect(cleanMarkdown(input)).toBe(input);
  });
});
