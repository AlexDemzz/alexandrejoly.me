import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/home/page";
import { SoundProvider } from "@/lib/sound";

const Home = () => (
  <SoundProvider>
    <HomePage />
  </SoundProvider>
);

export const Route = createFileRoute("/")({
  component: Home,
});
