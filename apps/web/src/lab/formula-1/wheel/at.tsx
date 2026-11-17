import type { CSSProperties, ReactNode } from "react";

import type { Spot } from "./layout";

/** Places a part on the face; wheel.css turns the unitless grid values into lengths. */
export const At = ({ children, spot }: { children: ReactNode; spot: Spot }) => (
  <div
    data-slot="wheel-at"
    style={
      {
        "--height": spot.height,
        "--size": spot.size,
        "--x": spot.x,
        "--y": spot.y,
      } as CSSProperties
    }
  >
    {children}
  </div>
);
