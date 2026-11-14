import { useSound } from "@/lib/sound";
import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { TileGroup, TileLabel } from "@/registry/formula/ui/formula/tile";

const Demo = () => {
  const { on, setOn } = useSound();

  return (
    <TileGroup>
      <TileLabel lamp>
        <Switch checked={on} onCheckedChange={(checked) => setOn(checked)}>
          <SwitchThumb />
        </Switch>
        Interaction sounds on this page
      </TileLabel>
    </TileGroup>
  );
};

export default Demo;
