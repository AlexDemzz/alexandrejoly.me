import { PIT_LIMIT_KPH } from "../model/ranges";
import { useWheel } from "../model/store";
import { MFL_POSITIONS, MFR_POSITIONS } from "../model/types";
import type { MultiParam, WheelState } from "../model/types";

const selectPopup = (state: WheelState): WheelState["popup"] =>
  state.popup !== null && state.now < state.popup.until ? state.popup : null;

export const Popup = () => {
  const popup = useWheel(selectPopup);
  if (popup === null) {
    return null;
  }
  return (
    <div data-slot="dash-popup">
      <span data-slot="dash-label">{popup.label}</span>
      <span data-slot="dash-popup-value">{popup.value}</span>
    </div>
  );
};

const selectMessage = (state: WheelState): WheelState["message"] =>
  state.message !== null && state.now < state.message.until
    ? state.message
    : null;

export const Message = () => {
  const message = useWheel(selectMessage);
  if (message === null) {
    return null;
  }
  return (
    <div data-slot="dash-message" data-tone={message.tone}>
      <span>{message.text}</span>
      <span aria-hidden data-slot="dash-message-hint">
        RF
      </span>
    </div>
  );
};

const PIT_BLINK_MS = 500;

/** Steps between two fills twice a second; reduced motion keeps the first. */
export const PitLimiter = () => {
  const phase = useWheel((state) => {
    if (!state.pitLimiter) {
      return null;
    }
    return Math.floor(state.now / PIT_BLINK_MS) % 2 === 0 ? "on" : "off";
  });
  if (phase === null) {
    return null;
  }
  return (
    <div data-phase={phase} data-slot="dash-pit">
      <span>PIT LIMITER</span>
      <span>{PIT_LIMIT_KPH}</span>
    </div>
  );
};

export const Radio = () => {
  const radio = useWheel((state) => state.radio);
  if (!radio) {
    return null;
  }
  return (
    <span data-slot="dash-radio">
      <span aria-hidden data-slot="dash-radio-dot" />
      RADIO
    </span>
  );
};

type MenuRotary = "mfl" | "mfr";

export const multiValue = (
  state: WheelState,
  rotary: MenuRotary,
  param: MultiParam
): number | undefined => {
  const values: Partial<Record<MultiParam, number>> = state.multi[rotary];
  return values[param];
};

const PARAMS: Record<MenuRotary, readonly MultiParam[]> = {
  mfl: MFL_POSITIONS,
  mfr: MFR_POSITIONS,
};

const selectMenu = (state: WheelState): string | null =>
  state.multiMenu !== null && state.now < state.multiMenu.until
    ? `${state.multiMenu.rotary}:${state.multiMenu.param}`
    : null;

const MenuRow = ({
  active,
  param,
  rotary,
}: {
  active: boolean;
  param: MultiParam;
  rotary: MenuRotary;
}) => {
  const value = useWheel((state) => multiValue(state, rotary, param));
  return (
    <li aria-current={active ? "true" : undefined} data-slot="dash-menu-row">
      <span>{param}</span>
      <span>{value}</span>
    </li>
  );
};

// A read-out, not a ui-sdk Listbox: focus never enters the screen; the
// MFL/MFR rotaries pick the row and + / − change it through the model.
export const MultiMenu = () => {
  const menu = useWheel(selectMenu);
  if (menu === null) {
    return null;
  }
  const [rotary, param] = menu.split(":") as [MenuRotary, MultiParam];
  const left = rotary === "mfl";
  const params = PARAMS[rotary];
  return (
    <div data-slot="dash-menu">
      <div data-slot="dash-menu-head">
        <span>{left ? "MFL" : "MFR"}</span>
        <span>{param}</span>
      </div>
      <ol
        aria-label={left ? "Left multi-function" : "Right multi-function"}
        data-slot="dash-menu-list"
      >
        {params.map((row) => (
          <MenuRow
            active={row === param}
            key={row}
            param={row}
            rotary={rotary}
          />
        ))}
      </ol>
      <p data-slot="dash-menu-hint">+ / − ADJUST · OK CLOSE</p>
    </div>
  );
};
