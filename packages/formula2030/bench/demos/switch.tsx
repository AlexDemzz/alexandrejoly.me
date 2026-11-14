import { Label } from "@ui-sdk/react/label";

import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { Tile, TileGroup, TileLamp } from "@/registry/formula/ui/formula/tile";

const Demo = () => (
  <TileGroup>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      One-pedal drive
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch tone="gold">
        <SwitchThumb />
      </Switch>
      Launch control
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      Lane assist
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch disabled>
        <SwitchThumb />
      </Switch>
      Creep
    </Tile>
  </TileGroup>
);

export default Demo;
