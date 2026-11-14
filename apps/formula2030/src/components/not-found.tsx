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
    <main className="not-found" id="main">
      <div className="not-found-panel">
        <Glass className="not-found-glass">
          <GlassBrackets />
          <GlassCaption>Route</GlassCaption>
          <p aria-hidden="true" className="not-found-code">
            404
          </p>
          <h1 className="not-found-title">Page not found</h1>
          <p className="not-found-text">
            Nothing lives at this address. The registry and every component are
            on the home page.
          </p>
        </Glass>
        <TileGroup>
          <Tile className="not-found-tile">
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
