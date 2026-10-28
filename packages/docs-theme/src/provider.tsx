import { RootProvider } from "fumadocs-ui/provider/tanstack";
import type { RootProviderProps } from "fumadocs-ui/provider/tanstack";

// Dark follows the system through the stylesheet, so next-themes stays off:
// no `.dark` class, no toggle, no hotkey.
const DocsProvider = (props: Omit<RootProviderProps, "theme">) => (
  <RootProvider {...props} theme={{ enabled: false }} />
);

export { DocsProvider };
