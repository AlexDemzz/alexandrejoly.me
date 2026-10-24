import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

// A registry file names its icon in each library shadcn supports, and
// `shadcn add` swaps this placeholder for the one in the user's `iconLibrary`.
// The site itself renders the Phosphor icon.
const PHOSPHOR_ICONS = { PauseIcon, PlayIcon };

export const IconPlaceholder = ({
  hugeicons: _hugeicons,
  lucide: _lucide,
  phosphor,
  remixicon: _remixicon,
  tabler: _tabler,
  ...props
}: IconProps & {
  hugeicons: string;
  lucide: string;
  phosphor: keyof typeof PHOSPHOR_ICONS;
  remixicon: string;
  tabler: string;
}) => {
  const Icon = PHOSPHOR_ICONS[phosphor];
  return <Icon {...props} />;
};
