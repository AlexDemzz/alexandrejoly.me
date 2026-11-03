// PROTOTYPE, throw me away: the "All in" animation for the AGE-18 X post,
// on its own page for screen recording.
import { createFileRoute } from "@tanstack/react-router";

import { AllIn } from "@/prototypes/poker-card/all-in";

import "@/prototypes/poker-card/poker.css";

export const Route = createFileRoute("/poker")({
  component: AllIn,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});
