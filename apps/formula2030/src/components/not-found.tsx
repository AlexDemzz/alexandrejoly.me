import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/registry/formula/ui/formula/button";
import {
  Glass,
  GlassCaption,
  GlassBrackets,
} from "@/registry/formula/ui/formula/glass";
import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";

export const NotFound = () => (
  <>
    <main
      className="px-gutter grid flex-1 place-items-center py-10 sm:py-16 lg:py-24"
      id="main"
    >
      <div className="max-w-panel rounded-panel shadow-panel grid w-full overflow-clip">
        <Glass className="grid gap-3">
          <GlassBrackets />
          <GlassCaption>Route</GlassCaption>
          <p
            aria-hidden="true"
            className="mt-1 text-7xl leading-none font-light tracking-tight tabular-nums"
          >
            404
          </p>
          <h1 className="text-xl font-medium wrap-break-word">
            Page not found
          </h1>
          <p className="text-glass-dim wrap-break-word">
            Nothing lives at this address. The registry and every component are
            on the home page.
          </p>
        </Glass>
        <TileGroup>
          <Tile data-not-found-tile>
            <Button
              render={<a aria-label="Back to Formula 2030" href="/" />}
              variant="ink"
            >
              Back to Formula 2030
            </Button>
          </Tile>
        </TileGroup>
      </div>
    </main>
    <SiteFooter />
  </>
);
