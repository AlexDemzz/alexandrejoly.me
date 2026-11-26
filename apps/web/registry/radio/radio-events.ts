export type RadioEvent =
  | { type: "key-down"; key: number }
  | { type: "key-up"; key: number }
  | { type: "key-bottom"; key: number; speed: number }
  | { type: "key-stop"; key: number; speed: number }
  | { type: "latch"; key: number }
  | { type: "release"; key: number }
  | { type: "band"; band: number | null }
  | { type: "stations" }
  | { type: "volume"; value: number }
  | { type: "tuning"; value: number }
  | { type: "volume-turn"; speed: number }
  | { type: "tuning-turn"; speed: number };

export interface RadioStation {
  position: number;
  src: string | null;
}

export interface RadioState {
  band: number | null;
  stations: readonly RadioStation[];
  tuning: number;
  volume: number;
}

export type RadioListener = (event: RadioEvent) => void;

export interface RadioEvents {
  emit: (event: RadioEvent) => void;
  setStations: (stations: readonly RadioStation[]) => void;
  state: () => RadioState;
  subscribe: (listener: RadioListener) => () => void;
}

export function createRadioEvents(): RadioEvents {
  const listeners = new Set<RadioListener>();
  const state: RadioState = { band: null, stations: [], tuning: 0, volume: 0 };
  const emit = (event: RadioEvent) => {
    if (event.type === "band") {
      state.band = event.band;
    } else if (event.type === "volume" || event.type === "tuning") {
      state[event.type] = event.value;
    }
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        reportError(error);
      }
    }
  };
  return {
    emit,
    setStations: (stations) => {
      state.stations = stations;
      emit({ type: "stations" });
    },
    state: () => ({ ...state }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
