import { useState } from "react";

import { useWheel } from "../model/store";
import type { Session, WheelState } from "../model/types";
import { PAGE_SPOKEN } from "./format";
import { multiValue } from "./overlays";
import { selectScreen } from "./screen";
import type { Screen } from "./screen";

interface Events {
  menu: string | null;
  message: string | null;
  popup: string | null;
  screen: Screen;
  session: Session;
}

const SESSION_SPOKEN: Record<Session, string> = {
  garage: "In the garage",
  track: "On track",
};

const selectPopupText = ({ popup }: WheelState): string | null =>
  popup === null ? null : `${popup.label} ${popup.value}`;

const selectMessageText = ({ message }: WheelState): string | null =>
  message?.text ?? null;

const selectMenuText = (state: WheelState): string | null => {
  const menu = state.multiMenu;
  return menu === null
    ? null
    : `${menu.param} ${multiValue(state, menu.rotary, menu.param)}`;
};

/** A page change or a menu step often brings a pop-up saying the same thing. */
const announcementFor = (before: Events, after: Events): string => {
  const parts: string[] = [];
  if (after.session !== before.session) {
    parts.push(SESSION_SPOKEN[after.session]);
  }
  const screenChanged = after.screen !== before.screen;
  const menuChanged = after.menu !== null && after.menu !== before.menu;
  if (screenChanged) {
    parts.push(`${PAGE_SPOKEN[after.screen]} page`);
  }
  if (menuChanged && after.menu !== null) {
    parts.push(after.menu);
  }
  if (after.message !== null && after.message !== before.message) {
    parts.push(after.message);
  }
  const popupNew = after.popup !== null && after.popup !== before.popup;
  if (popupNew && !screenChanged && !menuChanged && after.popup !== null) {
    parts.push(after.popup);
  }
  return parts.join(". ");
};

/** Speaks discrete changes only, never the numbers that move every frame. */
export const Announcer = () => {
  const events: Events = {
    menu: useWheel(selectMenuText),
    message: useWheel(selectMessageText),
    popup: useWheel(selectPopupText),
    screen: useWheel(selectScreen),
    session: useWheel((state) => state.session),
  };
  const [previous, setPrevious] = useState(events);
  const [text, setText] = useState("");
  const changed =
    events.menu !== previous.menu ||
    events.message !== previous.message ||
    events.popup !== previous.popup ||
    events.screen !== previous.screen ||
    events.session !== previous.session;
  if (changed) {
    setPrevious(events);
    const announcement = announcementFor(previous, events);
    if (announcement !== "") {
      setText(announcement);
    }
  }
  return (
    <output aria-live="polite" className="sr-only">
      {text}
    </output>
  );
};
