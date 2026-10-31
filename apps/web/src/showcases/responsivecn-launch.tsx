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

type Advance = (ms: number) => void;
type RecordedWindow = Window & { advanceAnimations?: Advance };

// The demo the responsivecn playground opens for Dialog → Drawer
// (apps/responsivecn/src/components/previews/dialog-drawer-preview.tsx),
// already open.
const Canvas = () => (
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
            defaultValue="Jordan Lee"
            id="showcase-name"
          />
        </label>
      </form>
      <DialogDrawerFooter showCloseButton />
    </DialogDrawerContent>
  </DialogDrawer>
);

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
            setWidth(Number(value));
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
        className="bg-background h-110 w-(--frame-width) overflow-clip rounded-2xl border transition-all duration-700 ease-in-out"
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
    { rest: 400 },
    { moveTo: [0.56, 0.18] },
    { click: MOBILE },
    { rest: 500 },
    { moveTo: [0.62, 0.55] },
    { rest: 400 },
    { moveTo: [0.6, 0.85] },
    { rest: 400 },
    { click: DESKTOP },
    { rest: 500 },
    { moveTo: [0.72, 0.4] },
    { rest: 400 },
    { click: MOBILE },
    { rest: 500 },
    { moveTo: [0.68, 0.74] },
    { rest: 400 },
    { click: DESKTOP },
    { rest: 500 },
    { moveTo: [0.8, 0.6] },
    { rest: 500 },
    { moveTo: [0.74, 0.3] },
  ],
};
