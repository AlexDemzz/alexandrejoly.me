import { Composition, Still } from "remotion";

import { CarbonFlow, FILM_FRAMES, FPS, HEIGHT, WIDTH } from "./carbon-flow";
import { OG, OgCard } from "./og-card";

export const RemotionRoot = () => (
  <>
    <Composition
      component={CarbonFlow}
      defaultProps={{ theme: "light" as const }}
      durationInFrames={FILM_FRAMES}
      fps={FPS}
      height={HEIGHT}
      id="CarbonFlow"
      width={WIDTH}
    />
    <Composition
      component={CarbonFlow}
      defaultProps={{ theme: "dark" as const }}
      durationInFrames={FILM_FRAMES}
      fps={FPS}
      height={HEIGHT}
      id="CarbonFlowDark"
      width={WIDTH}
    />
    <Still component={OgCard} height={OG.height} id="OgCard" width={OG.width} />
  </>
);
