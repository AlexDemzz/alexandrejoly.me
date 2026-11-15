import {
  CaretLeftIcon,
  CaretRightIcon,
  LightningIcon,
  LockIcon,
  MegaphoneIcon,
} from "@phosphor-icons/react";

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
          <LockIcon aria-hidden size={20} />
        </Button>
        Lock
      </Tile>
      <Tile>
        <Button aria-label="Boost" size="icon" variant="gold">
          <LightningIcon aria-hidden size={20} />
        </Button>
        Boost
      </Tile>
      <Tile>
        <Button aria-label="Sound the horn" size="icon" variant="ink">
          <MegaphoneIcon aria-hidden size={20} />
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
        <Button variant="gold">Arm</Button>
        Launch control
      </Tile>
      <Tile>
        <Button variant="ink">Park</Button>
        Gearbox
      </Tile>
      <Tile>
        <Button disabled>Vent</Button>
        Windows
      </Tile>
    </TileGroup>
    <TileGroup>
      <Button aria-label="Previous track" variant="engraved">
        <CaretLeftIcon aria-hidden size={20} />
      </Button>
      <Button variant="engraved">Trip A</Button>
      <Button disabled variant="engraved">
        Trip B
      </Button>
      <Button aria-label="Next track" variant="engraved">
        <CaretRightIcon aria-hidden size={20} />
      </Button>
    </TileGroup>
  </>
);

export default Demo;
