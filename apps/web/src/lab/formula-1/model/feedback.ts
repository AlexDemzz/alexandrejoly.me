import type { WheelState } from "./types";

export const POPUP_MS = 1500;
const MESSAGE_MS = 2000;

type MessageTone = NonNullable<WheelState["message"]>["tone"];

export const withPopup = (
  state: WheelState,
  label: string,
  value: string
): WheelState => ({
  ...state,
  popup: { label, until: state.now + POPUP_MS, value },
});

export const withMessage = (
  state: WheelState,
  text: string,
  tone: MessageTone
): WheelState => ({
  ...state,
  message: { text, tone, until: state.now + MESSAGE_MS },
});

/** Drops a pop-up, message or multi-function menu once its time is up. */
export const expireFeedback = (state: WheelState, now: number): WheelState => {
  const popupDone = state.popup !== null && state.popup.until <= now;
  const messageDone = state.message !== null && state.message.until <= now;
  const menuDone = state.multiMenu !== null && state.multiMenu.until <= now;
  if (!popupDone && !messageDone && !menuDone) {
    return state;
  }
  return {
    ...state,
    message: messageDone ? null : state.message,
    multiMenu: menuDone ? null : state.multiMenu,
    popup: popupDone ? null : state.popup,
  };
};

/** RF: acknowledges the dash message. */
export const clearMessage = (state: WheelState): WheelState =>
  state.message === null ? state : { ...state, message: null };
