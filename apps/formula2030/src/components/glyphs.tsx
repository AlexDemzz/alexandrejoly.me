import {
  IconAlertTriangle,
  IconArmchair,
  IconBolt,
  IconBulb,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconLock,
  IconRefresh,
  IconShoe,
  IconSpeakerphone,
  IconUser,
  IconWiper,
  IconWiperWash,
} from "@tabler/icons-react";

/** Tabler icons at the 1.5px stroke the components are drawn with. */
const GLYPH = { "aria-hidden": true, size: 20, stroke: 1.5 } as const;

export const CopyGlyph = () => <IconCopy {...GLYPH} />;

export const CheckGlyph = () => <IconCheck {...GLYPH} />;

export const LockGlyph = () => <IconLock {...GLYPH} />;

export const BoostGlyph = () => <IconBolt {...GLYPH} />;

export const HornGlyph = () => <IconSpeakerphone {...GLYPH} />;

export const BeamGlyph = () => <IconBulb {...GLYPH} />;

export const PreviousGlyph = () => <IconChevronLeft {...GLYPH} />;

export const NextGlyph = () => <IconChevronRight {...GLYPH} />;

export const DefrostGlyph = () => <IconWiperWash {...GLYPH} />;

export const RecirculateGlyph = () => <IconRefresh {...GLYPH} />;

export const SeatGlyph = () => <IconArmchair {...GLYPH} />;

export const HazardGlyph = () => <IconAlertTriangle {...GLYPH} />;

export const FaceGlyph = () => <IconUser {...GLYPH} />;

export const FeetGlyph = () => <IconShoe {...GLYPH} />;

export const ScreenGlyph = () => <IconWiper {...GLYPH} />;
