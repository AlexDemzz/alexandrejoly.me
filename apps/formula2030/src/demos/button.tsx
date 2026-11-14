import {
  BoostGlyph,
  HornGlyph,
  LockGlyph,
  NextGlyph,
  PreviousGlyph,
} from "@/components/glyphs";
import { Button } from "@/registry/formula/ui/formula/button";
import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";

const PRECONDITION_MS = 1500;

const precondition = () => {
  const { promise, resolve } = Promise.withResolvers<unknown>();
  setTimeout(resolve, PRECONDITION_MS);
  return promise;
};

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
        <Button aria-label="Sound the horn" size="icon" tone="ink">
          <HornGlyph />
        </Button>
        Horn
      </Tile>
      <Tile>
        <Button onClick={precondition} pendingAnnouncement="Preconditioning">
          Warm
        </Button>
        Precondition
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
        <Button disabled>Vent</Button>
        Windows
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
