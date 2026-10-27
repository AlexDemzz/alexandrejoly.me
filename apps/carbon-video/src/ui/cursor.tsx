import { mix, travel } from "../motion";

export interface Waypoint {
  /** Frame at which the cursor arrives. */
  at: number;
  x: number;
  y: number;
}

/** Glides between waypoints; each leg starts where the previous one ended. */
export const cursorAt = (frame: number, path: Waypoint[], legFrames = 22) => {
  const [start, ...rest] = path;
  let { x, y } = start;
  for (const point of rest) {
    const progress = travel(frame, point.at - legFrames, point.at);
    x = mix(x, point.x, progress);
    y = mix(y, point.y, progress);
  }
  return { x, y };
};

/** The macOS arrow, its tip on (x, y); `down` squeezes it for a click. */
export const Cursor = ({
  x,
  y,
  down = false,
}: {
  x: number;
  y: number;
  down?: boolean;
}) => (
  <svg
    height={22}
    style={{
      filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))",
      left: x - 5,
      position: "absolute",
      top: y - 3,
      transform: `scale(${down ? 0.86 : 1})`,
      transformOrigin: "5px 3px",
    }}
    viewBox="0 0 17 24"
    width={16}
  >
    <path
      d="M5 3v15.6l3.7-3.6 2.4 5.6 2.6-1.1-2.4-5.5h5.2z"
      fill="#000"
      stroke="#fff"
      strokeLinejoin="round"
      strokeWidth={1.4}
    />
  </svg>
);
