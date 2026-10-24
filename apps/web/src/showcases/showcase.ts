import type { ComponentType } from "react";

/** A point in the viewport, as fractions of its width and height. */
export type ViewportPoint = readonly [x: number, y: number];

/**
 * One beat of the script that `bin/record-showcase` in the posts repo plays:
 * it moves the real mouse along a human path and types on the real keyboard,
 * so hover, focus and click reach the scene as they would from a hand.
 * Selectors are Playwright's; name a control by its role and accessible name,
 * `role=button[name="Pause"]`, so a restyle never breaks the script.
 */
export type ShowcaseStep =
  /** Move onto the element the selector matches, then press and release. */
  | { click: string }
  /** Move onto the element the selector matches and stay there. */
  | { hover: string }
  /** Press and release a key, named as Playwright names it: `Tab`, `Enter`. */
  | { press: string }
  /** Move to a point, such as out of the way of the component. */
  | { moveTo: ViewportPoint }
  /** Keep the cursor still, in milliseconds. */
  | { rest: number };

/** A screen recording of a component: what the page shows and what the cursor does. */
export interface Showcase {
  Scene: ComponentType;
  /** Where the cursor sits when the recording starts. */
  start: ViewportPoint;
  steps: readonly ShowcaseStep[];
  /** In CSS pixels; the recorder scales it to 1920 pixels wide. */
  viewport?: { height: number; width: number };
}
