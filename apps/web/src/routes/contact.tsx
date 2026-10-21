import { createFileRoute } from "@tanstack/react-router";

import { InfoPageView, infoPageHead } from "@/components/info-page";

const ContactPage = () => <InfoPageView slug="contact" />;

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => infoPageHead("contact"),
});
