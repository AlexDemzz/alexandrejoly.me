import { createFileRoute } from "@tanstack/react-router";

import { InfoPageView, infoPageHead } from "@/components/info-page";

const PrivacyPage = () => <InfoPageView slug="privacy" />;

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => infoPageHead("privacy"),
});
