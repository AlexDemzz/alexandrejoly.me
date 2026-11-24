// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Experiment } from "./experiments";
import { LabCard } from "./lab-card";

/** What content extractors remove before they read a page. */
const DROPPED_BY_EXTRACTORS = "header, footer, nav";

const TORUS: Experiment = {
  formula: "L = n · ℓ",
  hint: "Drag to turn it",
  name: "Torus",
  slug: "torus",
};

describe("LabCard", () => {
  it("keeps its name, gesture and formula in the text extractors read without JavaScript", () => {
    const { body } = new DOMParser().parseFromString(
      renderToStaticMarkup(<LabCard experiment={TORUS} />),
      "text/html"
    );
    for (const dropped of body.querySelectorAll(DROPPED_BY_EXTRACTORS)) {
      dropped.remove();
    }

    expect(body.textContent).toContain(TORUS.name);
    expect(body.textContent).toContain(TORUS.hint);
    expect(body.textContent).toContain(TORUS.formula);
  });
});
