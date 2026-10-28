// The mark's geometry, shared by the <Mark /> component and the favicon and
// Open Graph images generated at build time. It lives on a 24-unit grid: a
// modal filling the middle 18 units, and a drawer inset 1 unit at its bottom.

const round = (value: number) => Number(value.toFixed(3));

// iOS continuous corners (the app icon squircle): each corner is three cubics
// spanning 1.528 radii of the edge instead of one circular arc.
export const continuousRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string => {
  const [a, b, c, d, e] = [
    1.52866483, 1.08849323, 0.86840689, 0.63149399, 0.37282392,
  ].map((value) => value * r);
  const [f, g, i] = [0.02065, 0.074911, 0.168726].map((value) => value * r);
  const right = x + w;
  const bottom = y + h;
  return [
    `M${round(x + a)} ${y}H${round(right - a)}`,
    `C${round(right - b)} ${y} ${round(right - c)} ${round(y + f)} ${round(right - d)} ${round(y + g)}`,
    `C${round(right - e)} ${round(y + i)} ${round(right - i)} ${round(y + e)} ${round(right - g)} ${round(y + d)}`,
    `C${round(right - f)} ${round(y + c)} ${right} ${round(y + b)} ${right} ${round(y + a)}`,
    `V${round(bottom - a)}`,
    `C${right} ${round(bottom - b)} ${round(right - f)} ${round(bottom - c)} ${round(right - g)} ${round(bottom - d)}`,
    `C${round(right - i)} ${round(bottom - e)} ${round(right - e)} ${round(bottom - i)} ${round(right - d)} ${round(bottom - g)}`,
    `C${round(right - c)} ${round(bottom - f)} ${round(right - b)} ${bottom} ${round(right - a)} ${bottom}`,
    `H${round(x + a)}`,
    `C${round(x + b)} ${bottom} ${round(x + c)} ${round(bottom - f)} ${round(x + d)} ${round(bottom - g)}`,
    `C${round(x + e)} ${round(bottom - i)} ${round(x + i)} ${round(bottom - e)} ${round(x + g)} ${round(bottom - d)}`,
    `C${round(x + f)} ${round(bottom - c)} ${x} ${round(bottom - b)} ${x} ${round(bottom - a)}`,
    `V${round(y + a)}`,
    `C${x} ${round(y + b)} ${round(x + f)} ${round(y + c)} ${round(x + g)} ${round(y + d)}`,
    `C${round(x + i)} ${round(y + e)} ${round(x + e)} ${round(y + i)} ${round(x + d)} ${round(y + g)}`,
    `C${round(x + c)} ${round(y + f)} ${round(x + b)} ${y} ${round(x + a)} ${y}Z`,
  ].join("");
};

// Apple's app icon template: a 180 radius on 1024.
const MODAL_SIZE = 18;
const MODAL_RADIUS = (MODAL_SIZE * 180) / 1024;

export const MODAL_PATH = continuousRect(
  3,
  3,
  MODAL_SIZE,
  MODAL_SIZE,
  MODAL_RADIUS
);
// Inset 1 from the modal, so its radius is the modal's minus 1.
export const DRAWER_PATH = continuousRect(4, 11, 16, 9, MODAL_RADIUS - 1);
export const HANDLE_PATH = "M10.5 12.75h3";

// The drawer leads and the modal recedes, in the component and the images.
export const MODAL_OPACITY = 0.25;
export const DRAWER_OPACITY = 0.85;

/**
 * The mark as a standalone SVG. `fullBleed` replaces the modal's
 * squircle with a square for app icons, which the platform rounds itself.
 * `padded` shrinks the mark to 60% of a square `background`, inside the safe
 * zone of a maskable icon. `style` may restyle the `.mark` shapes, as the
 * favicon does for dark mode.
 */
export const markSvg = ({
  color,
  background,
  fullBleed = false,
  padded = false,
  style = "",
}: {
  color: string;
  background?: string;
  fullBleed?: boolean;
  padded?: boolean;
  style?: string;
}): string => {
  const [origin, size] = padded ? [-3, 30] : [3, 18];
  const modal = fullBleed
    ? `<rect x="3" y="3" width="18" height="18" class="mark" fill="${color}" opacity="${MODAL_OPACITY}"/>`
    : `<path d="${MODAL_PATH}" class="mark" fill="${color}" opacity="${MODAL_OPACITY}"/>`;
  const backdrop = background
    ? `<rect x="${origin}" y="${origin}" width="${size}" height="${size}" fill="${background}"/>`
    : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${origin} ${origin} ${size} ${size}">`,
    style,
    `<defs><mask id="handle" maskUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fff"/><path d="${HANDLE_PATH}" stroke="#000" stroke-width="1" stroke-linecap="round"/></mask></defs>`,
    backdrop,
    modal,
    `<path d="${DRAWER_PATH}" class="mark" fill="${color}" opacity="${DRAWER_OPACITY}" mask="url(#handle)"/>`,
    `</svg>`,
  ].join("");
};
