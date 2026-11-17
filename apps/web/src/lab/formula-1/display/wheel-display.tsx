import "./wheel-display.css";
import { useWheel } from "../model/store";
import { Announcer } from "./announcer";
import { GridPage } from "./grid-page";
import {
  LightsOut,
  Message,
  MultiMenu,
  PitLimiter,
  Popup,
  Radio,
} from "./overlays";
import { EnergyPage, LapsPage, SetupPage, TempsPage } from "./pages";
import { RacePage } from "./race-page";
import { selectScreen } from "./screen";
import type { Screen } from "./screen";

const Page = ({ screen }: { screen: Screen }) => {
  switch (screen) {
    case "grid": {
      return <GridPage />;
    }
    case "temps": {
      return <TempsPage />;
    }
    case "laps": {
      return <LapsPage />;
    }
    case "energy": {
      return <EnergyPage />;
    }
    case "setup": {
      return <SetupPage />;
    }
    default: {
      return <RacePage />;
    }
  }
};

export const WheelDisplay = () => {
  const screen = useWheel(selectScreen);
  return (
    <section aria-label="Wheel display" data-slot="dash">
      <Page screen={screen} />
      <LightsOut />
      <PitLimiter />
      <Message />
      <MultiMenu />
      <Popup />
      <Radio />
      <Announcer />
    </section>
  );
};
