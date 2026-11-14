import { LockGlyph } from "@/components/glyphs";
import { Button } from "@/registry/formula/ui/formula/button";
import {
  Checkbox,
  CheckboxIndicator,
} from "@/registry/formula/ui/formula/checkbox";
import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { Tile, TileGroup, TileLabel } from "@/registry/formula/ui/formula/tile";

const Demo = () => (
  <TileGroup>
    <Tile>
      <Button aria-label="Lock doors" size="icon">
        <LockGlyph />
      </Button>
      Lock
    </Tile>
    <TileLabel lamp>
      <Switch defaultChecked>
        <SwitchThumb />
      </Switch>
      Auto lock
    </TileLabel>
    <TileLabel lamp>
      <Checkbox>
        <CheckboxIndicator />
      </Checkbox>
      Walk-away lock
    </TileLabel>
  </TileGroup>
);

export default Demo;
