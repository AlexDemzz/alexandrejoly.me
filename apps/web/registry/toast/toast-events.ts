export type ToastEvent =
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

export type ToastListener = (event: ToastEvent) => void;

export interface ToastEvents {
  emit: (event: ToastEvent) => void;
  subscribe: (listener: ToastListener) => () => void;
}

export function createToastEvents(): ToastEvents {
  const listeners = new Set<ToastListener>();
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
