import { createFileRoute } from "@tanstack/react-router";

import { InfoPageView, infoPageHead } from "@/components/info-page";

const AboutPage = () => <InfoPageView slug="about" />;

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => infoPageHead("about"),
});
