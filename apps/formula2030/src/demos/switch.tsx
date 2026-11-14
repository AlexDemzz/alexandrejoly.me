import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { TileGroup, TileLabel } from "@/registry/formula/ui/formula/tile";

const Demo = () => (
  <TileGroup>
    <TileLabel lamp>
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      Hill hold
    </TileLabel>
    <TileLabel lamp>
      <Switch tone="gold">
        <SwitchThumb />
      </Switch>
      Track mode
    </TileLabel>
    <TileLabel lamp>
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      Auto wipers
    </TileLabel>
    <TileLabel lamp>
      <Switch disabled>
        <SwitchThumb />
      </Switch>
      Valet mode
    </TileLabel>
  </TileGroup>
);

export default Demo;
