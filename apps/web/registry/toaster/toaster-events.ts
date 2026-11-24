export type ToasterEvent =
  | { type: "lever-move"; height: number; speed: number }
  | { type: "lever-catch" }
  | { type: "lever-top"; speed: number }
  | { type: "toasting-start"; durationMs: number }
  | { type: "toasting-end"; stopped: boolean }
  | { type: "pop" }
  | { type: "dial-step"; level: number }
  | { type: "stop-down" }
  | { type: "stop-up" }
  | { type: "slice-out" }
  | { type: "slice-in" };

export type ToasterListener = (event: ToasterEvent) => void;

export interface ToasterEvents {
  emit: (event: ToasterEvent) => void;
  subscribe: (listener: ToasterListener) => () => void;
}

export function createToasterEvents(): ToasterEvents {
  const listeners = new Set<ToasterListener>();
  return {
    emit: (event) => {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          reportError(error);
        }
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
