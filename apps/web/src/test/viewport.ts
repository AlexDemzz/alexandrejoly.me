const MAX_WIDTH_QUERY = /\(max-width:\s*(?<maxWidth>\d+)px\)/u;
const changeListeners = new Set<() => void>();

const matchesWidth = (query: string) => {
  const maxWidth = MAX_WIDTH_QUERY.exec(query)?.groups?.maxWidth;
  return maxWidth !== undefined && window.innerWidth <= Number(maxWidth);
};

export const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  window.matchMedia = (query: string) =>
    ({
      addEventListener: (_type: string, listener: () => void) => {
        changeListeners.add(listener);
      },
      addListener: () => null,
      dispatchEvent: () => false,
      matches: matchesWidth(query),
      media: query,
      onchange: null,
      removeEventListener: (_type: string, listener: () => void) => {
        changeListeners.delete(listener);
      },
      removeListener: () => null,
    }) as unknown as MediaQueryList;
};

export const resizeViewport = (width: number) => {
  setViewportWidth(width);
  for (const listener of changeListeners) {
    listener();
  }
};

export const MOBILE_WIDTH = 375;
export const DESKTOP_WIDTH = 1024;
