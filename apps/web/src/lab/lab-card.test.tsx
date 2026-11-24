// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { extractableText } from "@/lib/extractable-text";

import type { Experiment } from "./experiments";
import { LabCard } from "./lab-card";

const TORUS: Experiment = {
  formula: "L = n · ℓ",
  hint: "Drag to turn it",
  name: "Torus",
  slug: "torus",
};

describe("LabCard", () => {
  it("keeps its name, gesture and formula in the text extractors read without JavaScript", () => {
    const text = extractableText(
      renderToStaticMarkup(<LabCard experiment={TORUS} />)
    );

    expect(text).toContain(TORUS.name);
    expect(text).toContain(TORUS.hint);
    expect(text).toContain(TORUS.formula);
  });
});
