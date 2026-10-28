import { useId } from "react";

// SF Symbols as macOS 26 draws them in Carbon's window, each at the size, weight
// and scale its control uses, exported to PDF through SwiftUI's ImageRenderer.
// Each viewBox is the rendered image, padding included, so a symbol centers in
// its control the way the app centers it.
interface SymbolShape {
  height: number;
  paths: readonly string[];
  width: number;
  /** A shape the paths cut through with a gap, the way the pencil crosses the square. */
  knockout?: { gap: number; shape: string };
}

const SYMBOLS = {
  // menu indicator: 10 pt bold, small scale
  "chevron.down": {
    height: 7,
    paths: [
      "M4.56 5.23C4.77 5.23 4.93 5.16 5.1 4.99L7.93 2.12C8.05 1.99 8.11 1.84 8.11 1.66C8.11 1.3 7.82 1 7.46 1C7.28 1 7.11 1.07 6.98 1.21L4.4 3.85L4.72 3.85L2.14 1.21C2 1.08 1.84 1 1.66 1C1.3 1 1 1.3 1 1.66C1 1.84 1.06 1.99 1.19 2.12L4.02 4.99C4.19 5.16 4.36 5.23 4.56 5.23Z",
    ],
    width: 10,
  },
  // Menu label in the toolbar: 13 pt
  ellipsis: {
    height: 5,
    paths: [
      "M11.63 3.41C12.3 3.41 12.84 2.87 12.84 2.2C12.84 1.54 12.3 1 11.63 1C10.97 1 10.43 1.54 10.43 2.2C10.43 2.87 10.97 3.41 11.63 3.41Z",
      "M6.92 3.41C7.59 3.41 8.12 2.87 8.12 2.2C8.12 1.54 7.59 1 6.92 1C6.25 1 5.71 1.54 5.71 2.2C5.71 2.87 6.25 3.41 6.92 3.41Z",
      "M2.2 3.41C2.87 3.41 3.41 2.87 3.41 2.2C3.41 1.54 2.87 1 2.2 1C1.54 1 1 1.54 1 2.2C1 2.87 1.54 3.41 2.2 3.41Z",
    ],
    width: 14,
  },
  // search field: 13 pt
  magnifyingglass: {
    height: 15,
    paths: [
      "M1 6.07C1 8.86 3.27 11.12 6.06 11.12C7.16 11.12 8.18 10.77 9.01 10.17L12.14 13.31C12.28 13.45 12.47 13.52 12.67 13.52C13.11 13.52 13.4 13.2 13.4 12.77C13.4 12.57 13.33 12.39 13.2 12.25L10.09 9.13C10.74 8.28 11.13 7.22 11.13 6.07C11.13 3.27 8.86 1 6.06 1C3.27 1 1 3.27 1 6.07ZM2.09 6.07C2.09 3.87 3.86 2.09 6.06 2.09C8.26 2.09 10.05 3.87 10.05 6.07C10.05 8.26 8.26 10.05 6.06 10.05C3.86 10.05 2.09 8.26 2.09 6.07Z",
    ],
    width: 15,
  },
  // toolbar Button: 13 pt, large scale
  "sidebar.left": {
    height: 17,
    paths: [
      "M8.15 15.03L9.25 15.03L9.25 1.9L8.15 1.9ZM5.3 15.93L18.09 15.93C20.07 15.93 21.23 14.71 21.23 12.62L21.23 4.31C21.23 2.21 20.07 1 18.09 1L5.3 1C3.21 1 2 2.21 2 4.31L2 12.62C2 14.71 3.21 15.93 5.3 15.93ZM5.31 14.8C3.94 14.8 3.12 13.99 3.12 12.61L3.12 4.32C3.12 2.94 3.94 2.13 5.31 2.13L17.92 2.13C19.3 2.13 20.11 2.94 20.11 4.32L20.11 12.61C20.11 13.99 19.3 14.8 17.92 14.8ZM6.57 5.18C6.8 5.18 6.99 4.99 6.99 4.77C6.99 4.55 6.8 4.37 6.57 4.37L4.71 4.37C4.49 4.37 4.3 4.55 4.3 4.77C4.3 4.99 4.49 5.18 4.71 5.18ZM6.57 7.33C6.8 7.33 6.99 7.14 6.99 6.92C6.99 6.7 6.8 6.52 6.57 6.52L4.71 6.52C4.49 6.52 4.3 6.7 4.3 6.92C4.3 7.14 4.49 7.33 4.71 7.33ZM6.57 9.48C6.8 9.48 6.99 9.29 6.99 9.07C6.99 8.86 6.8 8.68 6.57 8.68L4.71 8.68C4.49 8.68 4.3 8.86 4.3 9.07C4.3 9.29 4.49 9.48 4.71 9.48Z",
    ],
    width: 24,
  },
  // toolbar Button: 13 pt, large scale
  "square.and.pencil": {
    height: 20,
    knockout: {
      gap: 1,
      shape:
        "M7.44 18.2L12.89 18.2C14.34 18.2 15.45 17.79 16.18 17.07C16.93 16.32 17.33 15.21 17.33 13.77L17.33 8.31C17.33 6.88 16.92 5.76 16.19 5.02C15.44 4.27 14.34 3.88 12.89 3.88L7.44 3.88C6 3.88 4.88 4.27 4.14 5.02C3.41 5.75 3 6.88 3 8.31L3 13.77C3 15.21 3.39 16.32 4.15 17.07C4.89 17.81 6 18.2 7.44 18.2ZM7.44 17.07C6.36 17.07 5.53 16.79 4.98 16.24C4.42 15.69 4.13 14.86 4.13 13.77L4.13 8.31C4.13 7.23 4.43 6.4 4.97 5.85C5.53 5.29 6.35 5.01 7.44 5.01L12.89 5.01C13.98 5.01 14.8 5.29 15.36 5.85C15.91 6.4 16.2 7.23 16.2 8.31L16.2 13.77C16.2 14.86 15.91 15.69 15.36 16.24C14.8 16.79 13.97 17.07 12.89 17.07Z",
    },
    paths: [
      "M8.61 12.82L10.07 12.16L17.71 4.53L16.7 3.53L9.07 11.16L8.38 12.59C8.32 12.71 8.46 12.88 8.61 12.82ZM18.29 3.96L18.84 3.4C19.1 3.12 19.11 2.77 18.85 2.51L18.7 2.36C18.45 2.11 18.08 2.14 17.84 2.4L17.27 2.95Z",
    ],
    width: 21,
  },
} satisfies Record<string, SymbolShape>;

export type SymbolName = keyof typeof SYMBOLS;

/** An SF Symbol in `currentColor`. */
export const SFSymbol = ({ name }: { name: SymbolName }) => {
  const mask = useId();
  const symbol: SymbolShape = SYMBOLS[name];
  const { height, knockout, paths, width } = symbol;
  return (
    <svg
      fill="currentColor"
      height={height}
      style={{ display: "block", flexShrink: 0 }}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {knockout ? (
        <>
          <mask id={mask} maskUnits="userSpaceOnUse">
            <rect fill="#fff" height={height} width={width} />
            {paths.map((path) => (
              <path
                d={path}
                key={path}
                stroke="#000"
                strokeLinejoin="round"
                strokeWidth={knockout.gap * 2}
              />
            ))}
          </mask>
          <path d={knockout.shape} fillRule="evenodd" mask={`url(#${mask})`} />
        </>
      ) : null}
      {paths.map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
};
