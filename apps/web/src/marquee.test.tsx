// @vitest-environment jsdom

import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueePause,
  MarqueeViewport,
} from "@registry/marquee";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

const TWO_LINKS = ["#one", "#two"];

const Links = ({ hrefs = TWO_LINKS }: { hrefs?: string[] }) => (
  <Marquee>
    <MarqueeViewport>
      <MarqueeContent>
        {hrefs.map((href) => (
          <MarqueeItem key={href}>
            <a href={href}>{href}</a>
          </MarqueeItem>
        ))}
      </MarqueeContent>
    </MarqueeViewport>
  </Marquee>
);

const parse = (html: string) => {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container;
};

describe("Marquee clone", () => {
  it("leaves the server HTML with an inert clone hidden from screen readers", () => {
    const [copy, clone] = parse(renderToString(<Links />)).querySelectorAll(
      "[data-slot=marquee-copy]"
    );

    expect(clone.hasAttribute("inert")).toBe(true);
    expect(clone.getAttribute("aria-hidden")).toBe("true");
    expect(copy.hasAttribute("inert")).toBe(false);
    expect(copy.hasAttribute("aria-hidden")).toBe(false);
  });

  it("lets the pointer reach the clone once mounted, while Tab skips it", () => {
    const { container } = render(<Links />);
    const [copy, clone] = container.querySelectorAll(
      "[data-slot=marquee-copy]"
    );

    expect(clone.hasAttribute("inert")).toBe(false);
    expect(
      [...clone.querySelectorAll("a")].map((link) => link.tabIndex)
    ).toEqual([-1, -1]);
    expect(
      [...copy.querySelectorAll("a")].map((link) =>
        link.hasAttribute("tabindex")
      )
    ).toEqual([false, false]);
  });

  it("keeps Tab off links added to the clone after mount", async () => {
    const { container, rerender } = render(<Links />);
    rerender(<Links hrefs={[...TWO_LINKS, "#three"]} />);
    const [, clone] = container.querySelectorAll("[data-slot=marquee-copy]");

    await waitFor(() =>
      expect(
        clone.querySelector<HTMLAnchorElement>("a[href='#three']")?.tabIndex
      ).toBe(-1)
    );
  });
});

describe("MarqueePause", () => {
  it("names the action a press takes next", () => {
    render(
      <Marquee>
        <MarqueePause />
      </Marquee>
    );

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();
  });

  it("starts paused with defaultPaused", () => {
    render(
      <Marquee defaultPaused>
        <MarqueePause />
      </Marquee>
    );

    expect(screen.getByRole("button", { name: "Play" })).toBeDefined();
  });

  it("reports a press to a controlled marquee and follows its prop", () => {
    const onPausedChange = vi.fn();
    render(
      <Marquee onPausedChange={onPausedChange} paused={false}>
        <MarqueePause />
      </Marquee>
    );

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));

    expect(onPausedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Pause" })).toBeDefined();
  });
});
