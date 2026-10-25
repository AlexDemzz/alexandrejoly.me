// @vitest-environment jsdom

import { Tooltip } from "@base-ui/react/tooltip";
import {
  TooltipPopover,
  TooltipPopoverContent,
  TooltipPopoverTrigger,
} from "@registry/tooltip-popover";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { getSlot, querySlot } from "@/test/slot";
import {
  DESKTOP_WIDTH,
  MOBILE_WIDTH,
  resizeViewport,
  setViewportWidth,
} from "@/test/viewport";

describe("TooltipPopover", () => {
  afterEach(cleanup);

  it("renders the Tooltip with the shared className at desktop width", () => {
    setViewportWidth(DESKTOP_WIDTH);
    render(
      <TooltipProvider>
        <TooltipPopover defaultOpen>
          <TooltipPopoverTrigger
            className="shared"
            popover={{ className: "mobile" }}
          >
            Info
          </TooltipPopoverTrigger>
          <TooltipPopoverContent>
            Replies within 24 hours.
          </TooltipPopoverContent>
        </TooltipPopover>
      </TooltipProvider>
    );

    expect(querySlot("popover-trigger")).toBeNull();
    expect(getSlot("tooltip-trigger").className).toBe("shared");
    expect(getSlot("tooltip-content").textContent).toContain(
      "Replies within 24 hours."
    );
  });

  it("renders the Popover with merged classNames below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    render(
      <TooltipPopover defaultOpen>
        <TooltipPopoverTrigger
          className="shared"
          popover={{ className: "mobile" }}
        >
          Info
        </TooltipPopoverTrigger>
        <TooltipPopoverContent>Replies within 24 hours.</TooltipPopoverContent>
      </TooltipPopover>
    );

    expect(querySlot("tooltip-trigger")).toBeNull();
    expect(getSlot("popover-trigger").className).toBe("shared mobile");
    expect(getSlot("popover-content").textContent).toBe(
      "Replies within 24 hours."
    );
  });

  it("keeps a disabled tooltip closed below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    const onOpenChange = vi.fn();
    render(
      <TooltipPopover disabled onOpenChange={onOpenChange}>
        <TooltipPopoverTrigger>Info</TooltipPopoverTrigger>
        <TooltipPopoverContent>Tip</TooltipPopoverContent>
      </TooltipPopover>
    );

    fireEvent.click(screen.getByText("Info"));

    expect(querySlot("popover-content")).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps the popover closed but the button enabled for a disabled trigger below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    const onClick = vi.fn();
    render(
      <TooltipPopover>
        <TooltipPopoverTrigger disabled onClick={onClick}>
          Info
        </TooltipPopoverTrigger>
        <TooltipPopoverContent>Tip</TooltipPopoverContent>
      </TooltipPopover>
    );

    const trigger = screen.getByText("Info");
    fireEvent.click(trigger);

    expect(trigger.hasAttribute("disabled")).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
    expect(querySlot("popover-content")).toBeNull();
  });

  it("gives a non-button trigger button semantics below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    render(
      <TooltipPopover>
        <TooltipPopoverTrigger render={<span />}>Info</TooltipPopoverTrigger>
        <TooltipPopoverContent>Tip</TooltipPopoverContent>
      </TooltipPopover>
    );

    const trigger = screen.getByText("Info");
    expect(trigger.tagName).toBe("SPAN");
    expect(trigger.getAttribute("role")).toBe("button");

    fireEvent.click(trigger);
    expect(querySlot("popover-content")).not.toBeNull();
  });

  it("keeps a controlled tooltip open across 768px in both directions", () => {
    setViewportWidth(DESKTOP_WIDTH);
    render(
      <TooltipProvider>
        <TooltipPopover open>
          <TooltipPopoverTrigger>Info</TooltipPopoverTrigger>
          <TooltipPopoverContent>Tip</TooltipPopoverContent>
        </TooltipPopover>
      </TooltipProvider>
    );
    expect(querySlot("tooltip-content")).not.toBeNull();

    act(() => resizeViewport(MOBILE_WIDTH));
    expect(getSlot("popover-content").textContent).toBe("Tip");

    act(() => resizeViewport(DESKTOP_WIDTH));
    expect(getSlot("tooltip-content").textContent).toContain("Tip");
  });

  it("keeps an uncontrolled popover open when the viewport crosses 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    render(
      <TooltipProvider>
        <TooltipPopover>
          <TooltipPopoverTrigger>Info</TooltipPopoverTrigger>
          <TooltipPopoverContent>Tip</TooltipPopoverContent>
        </TooltipPopover>
      </TooltipProvider>
    );

    fireEvent.click(screen.getByText("Info"));
    expect(querySlot("popover-content")).not.toBeNull();

    act(() => resizeViewport(DESKTOP_WIDTH));
    expect(getSlot("tooltip-content").textContent).toContain("Tip");
  });

  it("calls the shared onOpenChange, then the popover one, below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    const calls: string[] = [];
    render(
      <TooltipPopover
        onOpenChange={(open) => calls.push(`shared:${open}`)}
        popover={{ onOpenChange: (open) => calls.push(`popover:${open}`) }}
      >
        <TooltipPopoverTrigger>Info</TooltipPopoverTrigger>
        <TooltipPopoverContent>Tip</TooltipPopoverContent>
      </TooltipPopover>
    );

    fireEvent.click(screen.getByText("Info"));
    fireEvent.click(screen.getByText("Info"));

    expect(calls).toEqual([
      "shared:true",
      "popover:true",
      "shared:false",
      "popover:false",
    ]);
  });

  it("opens from a detached trigger placed outside the root at desktop width", () => {
    setViewportWidth(DESKTOP_WIDTH);
    const handle = Tooltip.createHandle();
    render(
      <TooltipProvider>
        <TooltipPopoverTrigger id="info" handle={handle}>
          Info
        </TooltipPopoverTrigger>
        <TooltipPopover handle={handle}>
          <TooltipPopoverContent>Tip</TooltipPopoverContent>
        </TooltipPopover>
      </TooltipProvider>
    );

    act(() => handle.open("info"));

    expect(getSlot("tooltip-content").textContent).toContain("Tip");
  });
});
