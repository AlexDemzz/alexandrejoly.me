import { FORWARD, FRAME, REVERSE } from "@registry/carousel/carousel-frame";
import { FRAME as SLOT_FRAME } from "@registry/toast/toast-frame";

// The pieces share one scale, so the slot shows the projector through the
// toaster's own frame: as large as the toaster beside it. That frame stands on
// the foot of the projector's, centred on its body, midway between its two
// keys. The picture on the wall falls outside it.
const BODY_CENTRE = (REVERSE.x + REVERSE.w / 2 + FORWARD.x + FORWARD.w / 2) / 2;

/** What the slot shows of the projector's frame, in that frame's pixels. */
export const CAROUSEL_WINDOW = {
  h: SLOT_FRAME.height,
  w: SLOT_FRAME.width,
  x: BODY_CENTRE - SLOT_FRAME.width / 2,
  y: FRAME.height - SLOT_FRAME.height,
} as const;

const decoded = async (source: string) => {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image;
};

/** What a slot shows of a piece's frame, in that frame's pixels. It may reach past the frame. */
export interface SlotWindow {
  h: number;
  w: number;
  x: number;
  y: number;
}

/** A piece's poster as its slot's window shows it, so it stands where the live piece will. */
export const cutToWindow = async (
  poster: string,
  frameWidth: number,
  slot: SlotWindow
) => {
  const image = await decoded(poster);
  const scale = image.naturalWidth / frameWidth;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(slot.w * scale);
  canvas.height = Math.round(slot.h * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    return poster;
  }
  context.drawImage(image, -slot.x * scale, -slot.y * scale);
  return canvas.toDataURL("image/webp");
};

/** The item's poster, cut down to the slot's window, so it stands where the live piece will. */
export const windowedPoster = (poster: string) =>
  cutToWindow(poster, FRAME.width, CAROUSEL_WINDOW);
