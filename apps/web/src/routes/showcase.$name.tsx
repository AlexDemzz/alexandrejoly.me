import { createFileRoute, notFound } from "@tanstack/react-router";

import { SHOWCASES } from "@/showcases/showcases";

/**
 * A showcase scene alone on the page, for the posts repo to screen-record.
 * Dev server only: the cursor script rides along as JSON for the recorder.
 */
const ShowcasePage = () => {
  const { name } = Route.useParams();
  const { Scene, start, steps, viewport } = SHOWCASES[name];

  return (
    <main className="grid min-h-dvh place-items-center">
      <Scene />
      <script id="showcase-script" type="application/json">
        {JSON.stringify({ start, steps, viewport })}
      </script>
    </main>
  );
};

export const Route = createFileRoute("/showcase/$name")({
  beforeLoad: ({ params: { name } }) => {
    if (!(import.meta.env.DEV && Object.hasOwn(SHOWCASES, name))) {
      throw notFound();
    }
  },
  component: ShowcasePage,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});
