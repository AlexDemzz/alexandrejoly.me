import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { TileGroup, TileLabel } from "@/registry/formula/ui/formula/tile";

const Demo = () => (
  <TileGroup>
    <TileLabel lamp>
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      One-pedal drive
    </TileLabel>
    <TileLabel lamp>
      <Switch tone="gold">
        <SwitchThumb />
      </Switch>
      Launch control
    </TileLabel>
    <TileLabel lamp>
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      Lane assist
    </TileLabel>
    <TileLabel lamp>
      <Switch disabled>
        <SwitchThumb />
      </Switch>
      Creep
    </TileLabel>
  </TileGroup>
);

export default Demo;
