import { DeviceMobileIcon, MonitorIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@portfolio/ui/components/toggle-group";
import {
  DialogDrawer,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@registry/dialog-drawer";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { Showcase } from "@/showcases/showcase";

// The responsivecn playground's trick: the component renders in an iframe
// whose own window is the canvas width, so its use-mobile hook swaps at 768px
// as the canvas resizes. The iframe loads this same showcase page, which
// `?canvas` turns into the component alone.
const SRC = "/showcase/responsivecn-launch?canvas=1";
const DESKTOP_WIDTH = 880;
const MOBILE_WIDTH = 375;
const DESKTOP = 'role=button[name="Desktop"]';
const MOBILE = 'role=button[name="Mobile"]';
const NAME_FIELD =
  'iframe >> internal:control=enter-frame >> role=textbox[name="Name"]';

const morph = (update: () => void) => {
  if (!("startViewTransition" in document)) {
    update();
    return;
  }
  // Styled in index.css, as the playground's is in its styles.css.
  document.startViewTransition({
    types: ["showcase-viewport"],
    update: () => flushSync(update),
  });
};

type Advance = (ms: number) => void;
type RecordedWindow = Window & { advanceAnimations?: Advance };

// The demo the responsivecn playground opens for Dialog → Drawer
// (apps/responsivecn/src/components/previews/dialog-drawer-preview.tsx),
// already open.
const Canvas = () => {
  // Held above the swap, so a name typed in the Drawer is still there in the
  // Dialog: an uncontrolled input would remount at its default.
  const [name, setName] = useState("Jordan Lee");
  return (
    <DialogDrawer defaultOpen>
      <DialogDrawerTrigger render={<Button variant="outline" />}>
        Edit profile
      </DialogDrawerTrigger>
      <DialogDrawerContent
        className="sm:max-w-sm"
        drawer={{ className: "sm:max-w-none" }}
      >
        <DialogDrawerHeader>
          <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
          <DialogDrawerDescription>
            Change the name shown on your profile.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <form className="grid gap-4 p-4 md:p-0">
          <label
            className="grid gap-1.5 text-sm font-medium"
            htmlFor="showcase-name"
          >
            Name
            <input
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm font-normal outline-none"
              id="showcase-name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
        </form>
        <DialogDrawerFooter showCloseButton />
      </DialogDrawerContent>
    </DialogDrawer>
  );
};

const Playground = () => {
  const [width, setWidth] = useState(DESKTOP_WIDTH);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The recorder steps this page's animations one video frame at a time; the
  // iframe's run on its own clock unless they take the same steps.
  useEffect(() => {
    const page = window as RecordedWindow;
    const advance = page.advanceAnimations;
    if (!advance) {
      return;
    }
    page.advanceAnimations = (ms) => {
      advance(ms);
      (
        frameRef.current?.contentWindow as RecordedWindow | null
      )?.advanceAnimations?.(ms);
    };
    return () => {
      page.advanceAnimations = advance;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup
        onValueChange={([value]) => {
          if (value) {
            morph(() => setWidth(Number(value)));
          }
        }}
        value={[String(width)]}
        variant="outline"
      >
        <ToggleGroupItem aria-label="Desktop" value={String(DESKTOP_WIDTH)}>
          <MonitorIcon aria-hidden />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Mobile" value={String(MOBILE_WIDTH)}>
          <DeviceMobileIcon aria-hidden />
        </ToggleGroupItem>
      </ToggleGroup>
      <div
        className="bg-background h-110 w-(--frame-width) overflow-clip rounded-2xl border [view-transition-name:showcase-frame]"
        style={{ "--frame-width": `${width + 2}px` } as React.CSSProperties}
      >
        {/* The cursor stays on this page: over the iframe, its own copy of the
            recorder's cursor would draw a second one. */}
        {/* oxlint-disable-next-line react/iframe-missing-sandbox -- this page's own route, and the parent must reach its animations */}
        <iframe
          className="pointer-events-none size-full border-0"
          ref={frameRef}
          src={SRC}
          title="Dialog → Drawer live preview"
        />
      </div>
    </div>
  );
};

const Scene = () => {
  const { canvas } = useSearch({ strict: false }) as { canvas?: unknown };
  return canvas ? <Canvas /> : <Playground />;
};

export const responsivecnLaunch: Showcase = {
  Scene,
  start: [0.62, 0.12],
  steps: [
    { rest: 300 },
    { moveTo: [0.58, 0.08] },
    { click: MOBILE },
    { moveTo: [0.6, 0.6] },
    // Tab leaves the toggle for the canvas, where the Drawer's trap puts
    // focus on the Name field, its text selected.
    { press: "Tab" },
    { moveTo: [0.62, 0.66] },
    { press: "ArrowRight" },
    { moveTo: [0.64, 0.72] },
    { press: "Backspace" },
    { press: "Backspace" },
    { press: "i" },
    { moveTo: [0.6, 0.5] },
    { moveTo: [0.56, 0.2] },
    { click: DESKTOP },
    { moveTo: [0.66, 0.5] },
    { zoomIn: NAME_FIELD, scale: 2.2 },
    { moveTo: [0.6, 0.56] },
    { zoomOut: true },
    { moveTo: [0.66, 0.3] },
    { click: MOBILE },
    { moveTo: [0.6, 0.62] },
    { moveTo: [0.66, 0.78] },
    { moveTo: [0.78, 0.5] },
    { moveTo: [0.72, 0.3] },
  ],
};
