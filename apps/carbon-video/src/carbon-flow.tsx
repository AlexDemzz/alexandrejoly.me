import type { ReactNode } from "react";
/*
 * The landing film, after the copper principle: title cards between short
 * scenes of the app, played inline on the page. The scenes draw the SwiftUI
 * mock (carbon/.scratch/carbon-v1/prototypes/ui-mock); swap them for footage
 * of the real app once it ships.
 */
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";

import { AGENT_FRAMES, AgentScene } from "./scenes/agent";
import { DETECT_FRAMES, DetectScene } from "./scenes/detect";
import { LIBRARY_FRAMES, LibraryScene } from "./scenes/library";
import { TitleCard } from "./scenes/title-card";
import { PALETTES, ThemeContext } from "./ui/theme";
import type { Theme } from "./ui/theme";

export const FPS = 30;
export const WIDTH = 1600;
export const HEIGHT = 900;

const CARD_FRAMES = 54;
const FADE = 8;

const SCENES: { frames: number; node: ReactNode; name: string }[] = [
  {
    frames: 66,
    name: "intro",
    node: <TitleCard text="Your meetings, transcribed on your Mac" withMark />,
  },
  {
    frames: CARD_FRAMES,
    name: "card-detect",
    node: <TitleCard text="It starts when your call does" />,
  },
  { frames: DETECT_FRAMES, name: "detect", node: <DetectScene /> },
  {
    frames: CARD_FRAMES,
    name: "card-library",
    node: <TitleCard text="Then a summary, and every word" />,
  },
  { frames: LIBRARY_FRAMES, name: "library", node: <LibraryScene /> },
  {
    frames: CARD_FRAMES,
    name: "card-agent",
    node: (
      <TitleCard text="One Markdown file per meeting, ready for your agent" />
    ),
  },
  { frames: AGENT_FRAMES, name: "agent", node: <AgentScene /> },
  {
    frames: 75,
    name: "outro",
    node: <TitleCard text="Carbon. Nothing leaves your Mac." withMark />,
  },
];

// Each scene starts where the one before it ends.
const TIMELINE = SCENES.map((scene, index) => ({
  ...scene,
  from: SCENES.slice(0, index).reduce((total, { frames }) => total + frames, 0),
}));

export const FILM_FRAMES = SCENES.reduce(
  (total, scene) => total + scene.frames,
  0
);

/** Each scene fades in from the one before it. */
const Fade = ({
  children,
  frames,
}: {
  children: ReactNode;
  frames: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FADE, frames], [0, 1, 1], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Remotion takes a composition's props as a `Record<string, unknown>`.
export interface CarbonFlowProps extends Record<string, unknown> {
  theme: Theme;
}

export const CarbonFlow = ({ theme }: CarbonFlowProps) => (
  <ThemeContext value={theme}>
    <AbsoluteFill style={{ background: PALETTES[theme].page }}>
      {TIMELINE.map((scene) => (
        <Sequence
          durationInFrames={scene.frames}
          from={scene.from}
          key={scene.name}
          name={scene.name}
        >
          <Fade frames={scene.frames}>{scene.node}</Fade>
        </Sequence>
      ))}
    </AbsoluteFill>
  </ThemeContext>
);
