// @vitest-environment jsdom

import { Dialog } from "@base-ui/react/dialog";
import {
  DialogDrawer,
  DialogDrawerClose,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@registry/dialog-drawer";
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

const renderOpen = (props: React.ComponentProps<typeof DialogDrawer> = {}) =>
  render(
    <DialogDrawer defaultOpen {...props}>
      <DialogDrawerTrigger
        className="shared-trigger"
        drawer={{ className: "drawer-trigger" }}
      >
        Open
      </DialogDrawerTrigger>
      <DialogDrawerContent
        className="shared-content"
        showCloseButton={false}
        drawer={{ className: "drawer-content" }}
      >
        <DialogDrawerTitle>Title</DialogDrawerTitle>
        <DialogDrawerDescription>Description</DialogDrawerDescription>
        <DialogDrawerFooter showCloseButton={false}>
          <DialogDrawerClose>Close</DialogDrawerClose>
        </DialogDrawerFooter>
      </DialogDrawerContent>
    </DialogDrawer>
  );

describe("DialogDrawer", () => {
  afterEach(cleanup);

  it("renders a Dialog at desktop width, with the shared className only", () => {
    setViewportWidth(DESKTOP_WIDTH);
    renderOpen();

    expect(querySlot("drawer-popup")).toBeNull();
    const content = getSlot("dialog-content");
    expect(content.className).toContain("shared-content");
    expect(content.className).not.toContain("drawer-content");
  });

  it("renders a Drawer below 768px, merging the shared and drawer classNames", () => {
    setViewportWidth(MOBILE_WIDTH);
    renderOpen();

    expect(querySlot("dialog-content")).toBeNull();
    const popup = getSlot("drawer-popup");
    expect(popup.className).toContain("shared-content");
    expect(popup.className).toContain("drawer-content");
    expect(getSlot("drawer-trigger").className).toBe(
      "shared-trigger drawer-trigger"
    );
  });

  it("runs the shared onOpenChange first, then the drawer one, below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    const calls: string[] = [];
    renderOpen({
      onOpenChange: (open) => calls.push(`shared:${open}`),
      drawer: { onOpenChange: (open) => calls.push(`drawer:${open}`) },
    });

    act(() => getSlot("drawer-close").click());

    expect(calls).toEqual(["shared:false", "drawer:false"]);
  });

  it("ignores the drawer onOpenChange at desktop width", () => {
    setViewportWidth(DESKTOP_WIDTH);
    const calls: string[] = [];
    renderOpen({
      onOpenChange: (open) => calls.push(`shared:${open}`),
      drawer: { onOpenChange: (open) => calls.push(`drawer:${open}`) },
    });

    act(() => getSlot("dialog-close").click());

    expect(calls).toEqual(["shared:false"]);
  });

  it("keeps an uncontrolled dialog open when the viewport crosses 768px", async () => {
    setViewportWidth(DESKTOP_WIDTH);
    render(
      <DialogDrawer>
        <DialogDrawerTrigger>Open</DialogDrawerTrigger>
        <DialogDrawerContent>
          <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
        </DialogDrawerContent>
      </DialogDrawer>
    );

    fireEvent.click(screen.getByText("Open"));
    expect(await screen.findByText("Edit profile")).toBeTruthy();
    expect(querySlot("dialog-content")).not.toBeNull();

    act(() => resizeViewport(MOBILE_WIDTH));

    expect(getSlot("drawer-title").textContent).toBe("Edit profile");
  });

  it("stays closed when the shared onOpenChange cancels the change", async () => {
    setViewportWidth(DESKTOP_WIDTH);
    render(
      <DialogDrawer onOpenChange={(_open, details) => details.cancel()}>
        <DialogDrawerTrigger>Open</DialogDrawerTrigger>
        <DialogDrawerContent>
          <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
        </DialogDrawerContent>
      </DialogDrawer>
    );

    fireEvent.click(screen.getByText("Open"));
    await act(async () => {});

    expect(querySlot("dialog-content")).toBeNull();
  });

  it("renders the Footer close button below 768px, and it closes the drawer", () => {
    setViewportWidth(MOBILE_WIDTH);
    render(
      <DialogDrawer defaultOpen>
        <DialogDrawerContent>
          <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
          <DialogDrawerFooter showCloseButton>
            <button type="submit">Save</button>
          </DialogDrawerFooter>
        </DialogDrawerContent>
      </DialogDrawer>
    );

    const footer = getSlot("drawer-footer");
    const close = screen.getByRole("button", { name: "Close" });
    expect(footer.contains(close)).toBe(true);
    expect(footer.lastElementChild).toBe(close);

    act(() => close.click());

    expect(querySlot("drawer-popup")?.dataset.open).toBeUndefined();
  });

  it("renders no Footer close button by default below 768px", () => {
    setViewportWidth(MOBILE_WIDTH);
    render(
      <DialogDrawer defaultOpen>
        <DialogDrawerContent>
          <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
          <DialogDrawerFooter>
            <button type="submit">Save</button>
          </DialogDrawerFooter>
        </DialogDrawerContent>
      </DialogDrawer>
    );

    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("opens from a detached trigger placed outside the root at desktop width", async () => {
    setViewportWidth(DESKTOP_WIDTH);
    const handle = Dialog.createHandle();
    render(
      <>
        <DialogDrawerTrigger handle={handle}>Open</DialogDrawerTrigger>
        <DialogDrawer handle={handle}>
          <DialogDrawerContent>
            <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
          </DialogDrawerContent>
        </DialogDrawer>
      </>
    );

    fireEvent.click(screen.getByText("Open"));

    expect(await screen.findByText("Edit profile")).toBeTruthy();
    expect(querySlot("dialog-content")).not.toBeNull();
  });
});
