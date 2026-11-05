import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import { cn } from "@portfolio/ui/lib/utils";

// DESIGN.md › Site › Components › Meter: 2px ticks on a 5px pitch, drawn in
// `currentColor` so the track and the fill share one gradient and line up.
const TICKS =
  "bg-[repeating-linear-gradient(to_right,currentColor_0_2px,transparent_2px_5px)]";

function Meter({ className, ...props }: MeterPrimitive.Root.Props) {
  return (
    <MeterPrimitive.Root
      className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-2", className)}
      data-slot="meter"
      {...props}
    />
  );
}

function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      className={cn("text-foreground font-book", className)}
      data-slot="meter-label"
      {...props}
    />
  );
}

function MeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      className={cn("text-muted-foreground ms-auto tabular-nums", className)}
      data-slot="meter-value"
      {...props}
    />
  );
}

function MeterTrack({ className, ...props }: MeterPrimitive.Track.Props) {
  return (
    <MeterPrimitive.Track
      className={cn(
        "text-border relative h-3 w-full overflow-hidden",
        TICKS,
        className
      )}
      data-slot="meter-track"
      {...props}
    />
  );
}

// The fill keeps its first tick lit, so a near-zero reading still reads as
// running.
function MeterIndicator({
  className,
  ...props
}: MeterPrimitive.Indicator.Props) {
  return (
    <MeterPrimitive.Indicator
      className={cn("text-foreground block h-full min-w-0.5", TICKS, className)}
      data-slot="meter-indicator"
      {...props}
    />
  );
}

export { Meter, MeterLabel, MeterValue, MeterTrack, MeterIndicator };
