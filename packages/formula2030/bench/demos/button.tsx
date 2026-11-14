import type { ReactNode } from "react";

import { Button } from "@/registry/formula/ui/formula/button";
import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";

const PRECONDITION_MS = 1500;

const precondition = () => {
  const { promise, resolve } = Promise.withResolvers<unknown>();
  setTimeout(resolve, PRECONDITION_MS);
  return promise;
};

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 20 20"
    width="20"
  >
    {children}
  </svg>
);

const LockGlyph = () => (
  <Glyph>
    <rect height="8" rx="1.5" width="11" x="4.5" y="9" />
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
  </Glyph>
);

const BoostGlyph = () => (
  <Glyph>
    <path d="M11 2.5 5 11h4.5L9 17.5l6-8.5h-4.5z" />
  </Glyph>
);

const HornGlyph = () => (
  <Glyph>
    <path d="M3.5 8v4h2.75L10 15V5L6.25 8z" />
    <path d="M12.75 7.5a3.5 3.5 0 0 1 0 5" />
    <path d="M15 5.25a6.5 6.5 0 0 1 0 9.5" />
  </Glyph>
);

const BeamGlyph = () => (
  <Glyph>
    <path d="M9 4.5a5.5 5.5 0 0 0 0 11c1.4-1.4 2-3.3 2-5.5s-.6-4.1-2-5.5z" />
    <path d="M13.5 6.5h3M13.75 10h3M13.5 13.5h3" />
  </Glyph>
);

const PreviousGlyph = () => (
  <Glyph>
    <path d="M12.5 5.5 8 10l4.5 4.5" />
  </Glyph>
);

const NextGlyph = () => (
  <Glyph>
    <path d="M7.5 5.5 12 10l-4.5 4.5" />
  </Glyph>
);

const Demo = () => (
  <>
    <TileGroup>
      <Tile>
        <Button aria-label="Lock doors" size="icon">
          <LockGlyph />
        </Button>
        Lock
      </Tile>
      <Tile>
        <Button aria-label="Boost" size="icon" tone="gold">
          <BoostGlyph />
        </Button>
        Boost
      </Tile>
      <Tile>
        <Button aria-label="Horn" size="icon" tone="ink">
          <HornGlyph />
        </Button>
        Horn
      </Tile>
      <Tile>
        <Button aria-label="Flash headlamps" disabled size="icon">
          <BeamGlyph />
        </Button>
        Flash
      </Tile>
      <Tile>
        <Button>Reset</Button>
        Trip meter
      </Tile>
      <Tile>
        <Button tone="gold">Arm</Button>
        Launch control
      </Tile>
      <Tile>
        <Button tone="ink">Park</Button>
        Gearbox
      </Tile>
      <Tile>
        <Button onClick={precondition} pendingAnnouncement="Preconditioning">
          Warm
        </Button>
        Precondition
      </Tile>
      <Tile>
        <Button disabled>Vent</Button>
        Windows
      </Tile>
      <Tile>
        <Button disabled tone="gold">
          Summon
        </Button>
        Valet
      </Tile>
      <Tile>
        <Button disabled tone="ink">
          Tow
        </Button>
        Transport
      </Tile>
      <Tile>
        <Button aria-label="Sound horn twice" disabled size="icon" tone="ink">
          <HornGlyph />
        </Button>
        Locate
      </Tile>
    </TileGroup>
    <TileGroup>
      <Button aria-label="Previous track" variant="engraved">
        <PreviousGlyph />
      </Button>
      <Button variant="engraved">Trip A</Button>
      <Button disabled variant="engraved">
        Trip B
      </Button>
      <Button aria-label="Next track" variant="engraved">
        <NextGlyph />
      </Button>
    </TileGroup>
  </>
);

export default Demo;
