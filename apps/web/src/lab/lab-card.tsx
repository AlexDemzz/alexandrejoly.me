import { Heading } from "@portfolio/ui/components/heading";
import { cn } from "@portfolio/ui/lib/utils";
import { useId } from "react";

import { useGlyphCanvas } from "./engine";
import type { Experiment } from "./experiments";
import { STAGES } from "./scenes";

/** One experiment: its name and gesture, the live canvas, then its formula and readout. */
export const LabCard = ({
  experiment: { formula, hint, name, slug },
}: {
  experiment: Experiment;
}) => {
  const { cursor, setup } = STAGES[slug];
  const { canvasRef, readoutRef } = useGlyphCanvas(setup);
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      className="flex min-w-0 scroll-mt-6 flex-col rounded-2xl border"
      id={slug}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 px-5 pt-4 sm:px-6 sm:pt-5">
        <Heading id={titleId}>{name}</Heading>
        <p className="text-muted-foreground text-sm">{hint}</p>
      </header>
      <div
        // A touch that starts up or down scrolls the page; any other plays the scene.
        className={cn(
          "relative mx-5 mt-4 aspect-square touch-pan-y select-none sm:mx-6",
          cursor
        )}
      >
        <canvas
          aria-hidden
          className="absolute inset-0 size-full"
          ref={canvasRef}
        />
      </div>
      <footer className="mx-5 mt-4 flex flex-col gap-0.5 border-t border-dashed pt-3 pb-4 font-mono text-xs sm:mx-6 sm:pb-5">
        <p className="text-foreground">{formula}</p>
        <p
          aria-hidden
          className="text-muted-foreground overflow-hidden text-ellipsis whitespace-pre tabular-nums"
          ref={readoutRef}
        >
          {" "}
        </p>
      </footer>
    </article>
  );
};
