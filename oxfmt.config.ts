import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // Hand-wrapped and read by tooling: see design-to-shadcn.
  ignorePatterns: [...(ultracite.ignorePatterns ?? []), "DESIGN.md"],
});
