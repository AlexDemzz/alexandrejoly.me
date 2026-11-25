import type { LinkProps } from "@tanstack/react-router";
import { lazy } from "react";
import type { ComponentType } from "react";

import { windowedPoster } from "./carousel-window";

/** What a piece's live view receives from its slot. */
export interface LiveProps {
  /** Whether the slot is hovered or focused: the piece plays its signature state while it is. */
  active: boolean;
}

/** A piece of the family: one UI SDK component built as the object it is named after. */
export interface Piece {
  /** The component's name, as the UI SDK docs title it. */
  component: string;
  /**
   * The piece itself, driven by its own controlled state (`toasting` for the
   * toaster) from the slot's `active`. Loaded on the slot's first hover or
   * focus; until then the poster stands in.
   */
  Live: ComponentType<LiveProps>;
  /** The object at rest on a transparent ground, as a data URL. Loaded in the browser only. */
  poster: () => Promise<string>;
  slug: string;
  to: LinkProps["to"];
}

/** The pieces built so far, in the order they were built. Releasing a piece adds it at the end. */
export const PIECES: readonly Piece[] = [
  {
    component: "Toast",
    Live: lazy(() => import("./toast-live")),
    poster: async () => {
      const { toastPoster } = await import("@registry/toast/toast-poster");
      return toastPoster;
    },
    slug: "toast",
    to: "/lab/literal-ui/toast",
  },
  {
    component: "Carousel",
    Live: lazy(() => import("./carousel-live")),
    poster: async () => {
      const { carouselPoster } =
        await import("@registry/carousel/carousel-poster");
      return windowedPoster(carouselPoster);
    },
    slug: "carousel",
    to: "/lab/literal-ui/carousel",
  },
];

/**
 * How many slots `/lab/literal-ui` shows, built or not. The slots past the
 * pieces stay empty and unnamed. A multiple of six, so the last row is full
 * at two columns and at three; raise it by six once the pieces fill it.
 */
export const SLOT_COUNT = 12;
