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
      Hill hold
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch tone="gold">
        <SwitchThumb />
      </Switch>
      Track mode
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      Auto wipers
    </Tile>
    <Tile render={<Label />}>
      <TileLamp />
      <Switch disabled>
        <SwitchThumb />
      </Switch>
      Valet mode
    </Tile>
  </TileGroup>
);

export default Demo;
