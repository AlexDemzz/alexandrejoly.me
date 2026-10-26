import { describe, expect, it } from "vitest";

import { parsePreviewSearch } from "./pairs";

describe("parsePreviewSearch", () => {
  it("opens the requested pair when asked to", () => {
    expect(parsePreviewSearch({ pair: "sheet-drawer", open: true })).toEqual({
      pair: "sheet-drawer",
      open: true,
    });
  });

  it("falls back to a closed dialog-drawer for anything else", () => {
    expect(parsePreviewSearch({ pair: "menu-drawer", open: "yes" })).toEqual({
      pair: "dialog-drawer",
      open: false,
    });
  });
});
