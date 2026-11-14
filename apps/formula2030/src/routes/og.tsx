import { createFileRoute, notFound } from "@tanstack/react-router";

import { HeroPanel } from "@/components/hero-panel";
import { RegisterMark } from "@/components/register-mark";
import { REGISTERS, REGISTER_INFO } from "@/lib/registry";
import { SITE_NAME } from "@/lib/site";

// The composition scripts/og.mjs screenshots into public/og.png. Dev only.
const OgImage = () => (
  <main className="og">
    <div className="og-text">
      <h1 className="og-title">{SITE_NAME}</h1>
      <p className="og-lede">
        Themed components for UI SDK, from a shadcn registry.
      </p>
      <ul className="og-rules">
        {REGISTERS.map((register) => (
          <li key={register}>
            <span className="rule-verb">{REGISTER_INFO[register].verb}</span>
            <span aria-hidden="true" className="rule-arrow">
              →
            </span>
            <RegisterMark register={register} />
            {REGISTER_INFO[register].title}
          </li>
        ))}
      </ul>
      <p className="og-url">formula2030.alexandrejoly.me</p>
    </div>
    <HeroPanel />
  </main>
);

export const Route = createFileRoute("/og")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: OgImage,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});
