export const LAB_PATH = "lab";

/** What a lab card says about its experiment; the scenes live in `scenes.ts`. */
export interface Experiment {
  /** The live formula under the canvas, in plain Unicode. */
  formula: string;
  /** The gesture to try, shown at the top of the card. */
  hint: string;
  name: string;
  slug: ExperimentSlug;
}

export type ExperimentSlug =
  | "dusk"
  | "fire"
  | "moon"
  | "storm"
  | "terrain"
  | "torus"
  | "warp"
  | "willow";

export const EXPERIMENTS: readonly Experiment[] = [
  {
    formula: "L = n · ℓ · x′ = K·x / (d + z)",
    hint: "Drag to turn it, fling to spin it",
    name: "Torus",
    slug: "torus",
  },
  {
    formula: "I = max(0, n · ŝ) · day + glow(d)",
    hint: "Drag the sun across the sky",
    name: "Dusk",
    slug: "dusk",
  },
  {
    formula: "h(x,y) ← h(x±1, y+1) − cool·ξ",
    hint: "Press and hold to stoke the fire",
    name: "Fire",
    slug: "fire",
  },
  {
    formula: "row = horizon + (cam − h(x,z)) / z · k",
    hint: "Drag to fly over the range",
    name: "Terrain",
    slug: "terrain",
  },
  {
    formula: "I = a · mix(n·ŝ, 2μ₀ / (μ₀ + μ), 0.65)",
    hint: "Drag sideways to turn the phase",
    name: "Moon",
    slug: "moon",
  },
  {
    formula: "I = shade·(1 + k·f) + c·f · f = e^(−t/τ)",
    hint: "Press to strike, move to lean the wind",
    name: "Storm",
    slug: "storm",
  },
  {
    formula: "θ(h) = θ₀·(h/H)^0.8 · θ̈ = −kθ − cθ̇",
    hint: "Grab the crown, bend it and let go",
    name: "Willow",
    slug: "willow",
  },
  {
    formula: "|t·d − κt²·b| = R · I = tone·e^(−t/λ)",
    hint: "Drag to steer, let go to recentre",
    name: "Warp",
    slug: "warp",
  },
];
