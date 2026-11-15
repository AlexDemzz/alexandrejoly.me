import { LockIcon } from "@phosphor-icons/react";
import { Label } from "@ui-sdk/react/label";

import { Button } from "@/registry/formula/ui/formula/button";
import {
  Checkbox,
  CheckboxIndicator,
} from "@/registry/formula/ui/formula/checkbox";
import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { Tile, TileGroup, TileLamp } from "@/registry/formula/ui/formula/tile";

const Demo = () => (
  <TileGroup>
    <Tile>
      <Button aria-label="Lock doors" size="icon">
        <LockIcon aria-hidden size={20} />
      </Button>
      Lock
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      Auto lock
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Checkbox>
        <CheckboxIndicator />
      </Checkbox>
      Walk-away lock
    </Tile>
  </TileGroup>
);

export default Demo;
