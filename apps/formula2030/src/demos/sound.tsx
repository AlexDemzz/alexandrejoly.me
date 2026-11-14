import { Label } from "@ui-sdk/react/label";

import { useSound } from "@/lib/sound";
import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { Tile, TileGroup, TileLamp } from "@/registry/formula/ui/formula/tile";

const Demo = () => {
  const { on, setOn } = useSound();

  return (
    <TileGroup>
      <Tile render={<Label />}>
        <TileLamp />
        <Switch checked={on} onCheckedChange={(checked) => setOn(checked)}>
          <SwitchThumb />
        </Switch>
        Interaction sounds on this page
      </Tile>
    </TileGroup>
  );
};

export default Demo;
