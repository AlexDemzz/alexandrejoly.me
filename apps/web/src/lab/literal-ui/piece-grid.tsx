import { cn } from "@portfolio/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";

import { PIECES, SLOT_COUNT } from "./pieces";
import type { Piece } from "./pieces";

const SLOT =
  "flex aspect-square min-w-0 flex-col rounded-2xl border p-3 sm:p-4";

const PosterImage = ({ load }: { load: () => Promise<string> }) => {
  const [poster, setPoster] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    const show = async () => {
      const source = await load();
      if (current) {
        setPoster(source);
      }
    };
    void show();
    return () => {
      current = false;
    };
  }, [load]);

  return poster ? (
    <img
      alt=""
      className="absolute inset-0 size-full object-contain group-has-[[data-view=live]]/slot:invisible"
      decoding="async"
      src={poster}
    />
  ) : null;
};

const BuiltSlot = ({ component, Live, poster, to }: Piece) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = hovered || focused;
  // The live piece mounts on the first hover or focus, and stays.
  const [armed, setArmed] = useState(false);
  if (active && !armed) {
    setArmed(true);
  }

  return (
    <Link
      className={cn(
        SLOT,
        "group/slot focus-visible:outline-ring outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid"
      )}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      to={to}
    >
      {/* Inert: the piece only shows its state here; the slot is the link. */}
      {/* The poster stays under the live piece until its scene shows, so the swap never blanks the slot. */}
      <span className="relative min-h-0 flex-1" inert>
        <PosterImage load={poster} />
        {armed && (
          <span className="absolute inset-0 flex justify-center">
            <Suspense fallback={null}>
              <Live active={active} />
            </Suspense>
          </span>
        )}
      </span>
      <span className="text-foreground font-book can-hover:group-hover/slot:decoration-underline group-focus-visible/slot:decoration-underline w-fit text-sm underline decoration-transparent underline-offset-3 transition-colors duration-200 ease-out">
        {component}
      </span>
    </Link>
  );
};

const EMPTY_SLOTS = Array.from(
  { length: Math.max(0, SLOT_COUNT - PIECES.length) },
  (_, index) => `empty-${index}`
);

/** The family's grid: a link to each piece, then empty, unnamed slots for the pieces to come. */
export const PieceGrid = () => (
  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {PIECES.map((piece) => (
      <li key={piece.slug}>
        <BuiltSlot {...piece} />
      </li>
    ))}
    {EMPTY_SLOTS.map((key) => (
      <li aria-hidden className={cn(SLOT, "border-dashed")} key={key} />
    ))}
  </ul>
);
