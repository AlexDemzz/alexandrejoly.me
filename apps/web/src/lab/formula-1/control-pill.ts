import { cn } from "@portfolio/ui/lib/utils";

/** The muted track a pill sits in, in the controls row under the wheel. */
export const CONTROL_TRACK = "bg-muted inline-flex rounded-full p-0.75";

/** A pill toggle in that row: Race and Sound share it. */
export const CONTROL_ITEM = cn(
  "relative inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-sm font-medium whitespace-nowrap sm:px-4",
  "text-muted-foreground can-hover:hover:text-foreground",
  "data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-hairline dark:data-pressed:bg-accent",
  "ease-settle transition duration-200 motion-safe:active:scale-96",
  "focus-visible:outline-ring outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
);
