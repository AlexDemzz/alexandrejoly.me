import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

describe("ComponentDemo", () => {
  afterEach(cleanup);

  it("opens on the preview", () => {
    setup();
    expect(screen.getByRole("button", { name: "Edit profile" })).toBeTruthy();
    expect(screen.queryByText(CODE)).toBeNull();
  });

  it("swaps the preview for the code on the Code tab", () => {
    setup();
    fireEvent.click(screen.getByRole("tab", { name: "Code" }));
    expect(screen.getByText(CODE)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Edit profile" })).toBeNull();
  });
});
