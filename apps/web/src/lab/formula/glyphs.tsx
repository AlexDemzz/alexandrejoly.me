import {
  IconArmchair,
  IconArrowDown,
  IconArrowUp,
  IconArrowUpRight,
  IconCar,
  IconMinus,
  IconTruck,
  IconVolume,
  IconVolumeOff,
  IconWiper,
  IconWiperWash,
} from "@tabler/icons-react";

import geminiMark from "@/media/gemini.svg";

/** Tabler icons on the panel's 24px grid, at its 1.5px stroke. */
const GLYPH = {
  "aria-hidden": true,
  "data-formula-glyph": "",
  size: 24,
  stroke: 1.5,
} as const;

export const SeatHeatGlyph = () => <IconArmchair {...GLYPH} />;

export const DefrostGlyph = () => <IconWiperWash {...GLYPH} />;

export const WiperGlyph = () => <IconWiper {...GLYPH} />;

export const SpeakerGlyph = ({ muted }: { muted: boolean }) =>
  muted ? <IconVolumeOff {...GLYPH} /> : <IconVolume {...GLYPH} />;

export const CarGlyph = () => <IconCar {...GLYPH} />;

export const TruckGlyph = () => <IconTruck {...GLYPH} />;

export const ArrowUpGlyph = () => <IconArrowUp {...GLYPH} />;

export const ArrowDownGlyph = () => <IconArrowDown {...GLYPH} />;

// The engraved marks are drawn larger than the icons, at the same 1.5px line:
// Tabler's stroke is in 24px-grid units, so it shrinks as the size grows.
const engraved = (size: number) => ({
  ...GLYPH,
  size,
  stroke: (1.5 * 24) / size,
});

export const EngravedLineGlyph = () => <IconMinus {...engraved(40)} />;

export const EngravedArrowGlyph = () => <IconArrowUpRight {...engraved(34)} />;

/** The Gemini mark, the one multicoloured element on the panel. */
export const SparkleGlyph = () => (
  <img alt="" data-formula-sparkle height={20} src={geminiMark} width={20} />
);
