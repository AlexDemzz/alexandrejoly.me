import { useCurrentFrame } from "remotion";

import { mix, settle, travel } from "../motion";
import { CarbonWindow } from "../ui/carbon-window";
import { MenuBar, Stage } from "../ui/screen";

export const LIBRARY_FRAMES = 270;

const REVEAL = 16;
const SCROLL_FROM = 150;
const SCROLL_TO = 215;
const SCROLL_BY = 170;

/** The Meeting that just ended opens: its participants, then the Transcript. */
export const LibraryScene = () => {
  const frame = useCurrentFrame();
  const enter = settle(frame, 0, 18);

  return (
    <Stage>
      <MenuBar live={false} />
      <div
        style={{
          inset: 0,
          opacity: enter,
          position: "absolute",
          transform: `scale(${mix(0.97, 1, enter)})`,
        }}
      >
        <CarbonWindow
          frame={frame}
          reveal={REVEAL}
          scroll={SCROLL_BY * travel(frame, SCROLL_FROM, SCROLL_TO)}
        />
      </div>
    </Stage>
  );
};
