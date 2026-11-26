import { FRAME } from "@registry/radio/radio-frame";
import { FRAME as SLOT_FRAME } from "@registry/toast/toast-frame";

import { cutToWindow } from "./carousel-window";
import type { SlotWindow } from "./carousel-window";

// Where each piece's camera sees the point of the counter under its middle,
// in its own frame's pixels (`scene.json`'s camera, the origin projected).
const TOASTER_FOOT = { x: 900, y: 1384.5 };
const RADIO_FOOT = { x: 770, y: 863.4 };

/**
 * What the slot shows of the radio's frame, in that frame's pixels. The pieces
 * share one scale, so the slot shows the radio through the toaster's own
 * frame, standing on the same spot of the counter: the radio's frame is the
 * smaller one, and the window reaches past it on every side.
 */
export const RADIO_WINDOW: SlotWindow = {
  h: SLOT_FRAME.height,
  w: SLOT_FRAME.width,
  x: RADIO_FOOT.x - TOASTER_FOOT.x,
  y: RADIO_FOOT.y - TOASTER_FOOT.y,
};

/** The item's poster in the slot's window, so it stands where the live piece will. */
export const windowedRadioPoster = (poster: string) =>
  cutToWindow(poster, FRAME.width, RADIO_WINDOW);
