// @vitest-environment jsdom

import {
  PopoverDrawer,
  PopoverDrawerContent,
  PopoverDrawerFooter,
  PopoverDrawerHeader,
  PopoverDrawerTitle,
  PopoverDrawerTrigger,
} from "@registry/popover-drawer";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { getSlot, querySlot } from "@/test/slot";
import {
  DESKTOP_WIDTH,
  MOBILE_WIDTH,
  resizeViewport,
  setViewportWidth,
} from "@/test/viewport";

const renderOpen = () =>
  render(
    <PopoverDrawer defaultOpen>
      <PopoverDrawerTrigger>Open</PopoverDrawerTrigger>
      <PopoverDrawerContent
        side="top"
        align="start"
        className="w-80"
        drawer={{ className: "max-h-[80dvh]" }}
      >
        <PopoverDrawerHeader className="header">
          <PopoverDrawerTitle>Title</PopoverDrawerTitle>
        </PopoverDrawerHeader>
        <PopoverDrawerFooter className="footer">
          <button type="button">Apply</button>
        </PopoverDrawerFooter>
      </PopoverDrawerContent>
    </PopoverDrawer>
  );

describe("PopoverDrawer", () => {
  afterEach(cleanup);

  it("renders the Popover with the shared className at desktop width", () => {
    setViewportWidth(DESKTOP_WIDTH);
    renderOpen();

    expect(querySlot("drawer-popup")).toBeNull();
    const content = getSlot("popover-content");
    expect(content.className).toContain("w-80");
    expect(content.className).not.toContain("max-h-[80dvh]");
    expect(getSlot("popover-footer").className).toContain("footer");
  });

  it("puts the shared className on the content box, not the drawer, below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    renderOpen();

    const popup = getSlot("drawer-popup");
    expect(popup.className).toContain("max-h-[80dvh]");
    expect(popup.className).not.toContain("w-80");

    const body = getSlot("popover-drawer-body");
    expect(body.className).toContain("w-80");
    expect(popup.contains(body)).toBe(true);
    expect(body.contains(querySlot("drawer-header"))).toBe(true);
    expect(body.contains(querySlot("drawer-footer"))).toBe(true);
  });

  it("drops the anchor positioning props below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    renderOpen();

    const popup = getSlot("drawer-popup");
    expect(popup.hasAttribute("side")).toBe(false);
    expect(popup.hasAttribute("align")).toBe(false);
  });

  it("keeps an uncontrolled popover open when the viewport crosses 768px", async () => {
    setViewportWidth(DESKTOP_WIDTH);
    render(
      <PopoverDrawer>
        <PopoverDrawerTrigger>Open</PopoverDrawerTrigger>
        <PopoverDrawerContent>
          <PopoverDrawerTitle>Filters</PopoverDrawerTitle>
        </PopoverDrawerContent>
      </PopoverDrawer>
    );

    fireEvent.click(screen.getByText("Open"));
    expect(await screen.findByText("Filters")).toBeTruthy();
    expect(querySlot("popover-content")).not.toBeNull();

    act(() => resizeViewport(MOBILE_WIDTH));

    expect(querySlot("drawer-popup")).not.toBeNull();
    expect(getSlot("drawer-title").textContent).toBe("Filters");
  });
});
