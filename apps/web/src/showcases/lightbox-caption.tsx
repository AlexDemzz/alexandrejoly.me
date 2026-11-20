import { LightboxCaptions } from "@/components/demos/lightbox-captions";
import type { Showcase } from "@/showcases/showcase";

const FIRST = 'role=link[name="Misty hills"]';
const NEXT = 'role=button[name="Next slide"]';
const PREVIOUS = 'role=button[name="Previous slide"]';
const CLOSE = 'role=button[name="Close"]';

// The docs' captions demo: the open photo's caption sits right under it.
const Scene = () => (
  <div className="grid h-dvh w-dvw place-items-center">
    <LightboxCaptions />
  </div>
);

export const lightboxCaption: Showcase = {
  Scene,
  start: [0.3, 0.85],
  steps: [
    { click: FIRST },
    { rest: 600 },
    { moveTo: [0.62, 0.93] },
    { rest: 400 },
    { click: NEXT },
    { rest: 600 },
    { moveTo: [0.6, 0.9] },
    { rest: 400 },
    { click: NEXT },
    { rest: 600 },
    { moveTo: [0.4, 0.93] },
    { rest: 400 },
    { click: PREVIOUS },
    { rest: 600 },
    { click: CLOSE },
    { rest: 600 },
    { moveTo: [0.8, 0.85] },
  ],
};
