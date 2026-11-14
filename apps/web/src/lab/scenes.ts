import { createDusk } from "./dusk";
import type { Scene, SceneApi } from "./engine";
import type { ExperimentSlug } from "./experiments";
import { createFire } from "./fire";
import { createMoon } from "./moon";
import { createStorm } from "./storm";
import { createTerrain } from "./terrain";
import { createTorus } from "./torus";
import { createWarp } from "./warp";
import { createWillow } from "./willow";

interface Stage {
  /** How the pointer looks over the canvas. */
  cursor: string;
  setup: (api: SceneApi) => Scene;
}

const GRAB = "cursor-grab active:cursor-grabbing";

export const STAGES: Record<ExperimentSlug, Stage> = {
  dusk: { cursor: GRAB, setup: createDusk },
  fire: { cursor: "cursor-pointer", setup: createFire },
  moon: { cursor: "cursor-ew-resize", setup: createMoon },
  storm: {
    cursor: "cursor-crosshair",
    setup: createStorm,
  },
  terrain: { cursor: GRAB, setup: createTerrain },
  torus: { cursor: GRAB, setup: createTorus },
  warp: {
    cursor: GRAB,
    setup: createWarp,
  },
  willow: { cursor: GRAB, setup: createWillow },
};
