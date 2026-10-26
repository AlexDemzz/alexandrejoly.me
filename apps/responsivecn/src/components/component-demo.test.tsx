import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ComponentDemo,
  ComponentDemoCode,
  ComponentDemoRender,
} from "./component-demo";

const CODE = 'import { DialogDrawer } from "@/components/ui/dialog-drawer"';

const setup = () =>
  render(
    <ComponentDemo>
      <ComponentDemoRender>
        <button type="button">Edit profile</button>
      </ComponentDemoRender>
      <ComponentDemoCode>
        <pre>{CODE}</pre>
      </ComponentDemoCode>
    </ComponentDemo>
  );

const codeRegion = (container: HTMLElement) => {
  const region = container.querySelector<HTMLElement>(
    '[data-slot="component-demo-code"]'
  );
  if (!region) {
    throw new Error("ComponentDemoCode did not render its code region");
  }
  return region;
};

describe("ComponentDemo", () => {
  afterEach(cleanup);

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn<() => Promise<void>>().mockResolvedValue(),
      },
    });
  });

  it("renders the preview child", () => {
    setup();
    expect(screen.getByRole("button", { name: "Edit profile" })).toBeTruthy();
  });

  it("keeps the code in the DOM but hidden until expanded", () => {
    const { container } = setup();
    const region = codeRegion(container);

    // Present (so it can be copied) but collapsed.
    expect(region.textContent).toContain(CODE);
    expect(region.hidden).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /expand code/iu }));
    expect(region.hidden).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: /collapse code/iu }));
    expect(region.hidden).toBe(true);
  });

  it("copies the full code text to the clipboard while still collapsed", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /copy code/iu }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(CODE);
  });

  it("exposes copy and expand as accessible, labeled buttons", () => {
    setup();
    const copy = screen.getByRole("button", { name: /copy code/iu });
    const expand = screen.getByRole("button", { name: /expand code/iu });
    expect(copy.tagName).toBe("BUTTON");
    expect(expand.getAttribute("aria-expanded")).toBe("false");
  });
});
