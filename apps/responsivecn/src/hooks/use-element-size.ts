import * as React from "react";

export interface ElementSize {
  width: number;
  height: number;
}

// The content-box size of an element, kept current by a ResizeObserver.
// Zero until the first measure, which only happens in the browser.
export const useElementSize = <T extends HTMLElement>() => {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState<ElementSize>({ width: 0, height: 0 });

  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
};
