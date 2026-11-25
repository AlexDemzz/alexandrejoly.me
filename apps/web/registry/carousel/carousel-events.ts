export type CarouselEvent =
  | { type: "key-down"; key: "forward" | "reverse" }
  | { type: "key-up"; key: "forward" | "reverse" }
  | { type: "shutter"; open: boolean }
  | { type: "slide-lift" }
  | { type: "tray-turn"; slots: number }
  | { type: "tray-click"; speed: number }
  | { type: "tray-stop" }
  | { type: "slide-drop" }
  | { type: "timer"; on: boolean }
  | { type: "focus-turn"; speed: number };

export type CarouselListener = (event: CarouselEvent) => void;

export interface CarouselEvents {
  emit: (event: CarouselEvent) => void;
  subscribe: (listener: CarouselListener) => () => void;
}

export function createCarouselEvents(): CarouselEvents {
  const listeners = new Set<CarouselListener>();
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
