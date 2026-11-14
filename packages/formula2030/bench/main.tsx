import "@fontsource-variable/geist";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";

import { FormulaSound } from "@/registry/formula/ui/formula/sound";

import "@/registry/formula/ui/formula/tokens.css";
import "./bench.css";

const modules = import.meta.glob<{ default: ComponentType }>("./demos/*.tsx", {
  eager: true,
});

const demos = Object.entries(modules)
  .map(([path, module]) => ({
    Demo: module.default,
    name: path.replace("./demos/", "").replace(".tsx", ""),
  }))
  .toSorted((a, b) => a.name.localeCompare(b.name));

const only = new URLSearchParams(location.search).get("demo");
const shown = only ? demos.filter((demo) => demo.name === only) : demos;

const Bench = () => (
  <main data-bench>
    <FormulaSound />
    {shown.map(({ Demo, name }) => (
      <section data-bench-demo={name} key={name}>
        <h2 data-bench-name>{name}</h2>
        <Demo />
      </section>
    ))}
  </main>
);

const root = document.querySelector("#root");
if (root) {
  createRoot(root).render(<Bench />);
}
