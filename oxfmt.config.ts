import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // Hand-wrapped and read by tooling: see pimp-my-shadcn.
  ignorePatterns: [...(ultracite.ignorePatterns ?? []), "DESIGN.md"],
});
