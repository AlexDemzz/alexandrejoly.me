// Reads palette colours from the shared design system as sRGB hex, for the
// image renderers, which take neither CSS variables nor oklch.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DARK_PALETTE = /@media \(prefers-color-scheme: dark\) \{\s*:root \{/u;
const OKLCH = /^oklch\((?<l>[\d.]+) (?<c>[\d.]+) (?<h>[\d.]+)\)$/u;

const themeCss = await readFile(
  fileURLToPath(import.meta.resolve("@portfolio/ui/theme.css")),
  "utf-8"
);

const toSrgbChannel = (linear: number): number => {
  const gamma =
    linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, gamma)) * 255);
};

// Björn Ottosson's OKLab to linear sRGB matrices.
const oklchToHex = (oklch: string): string => {
  const match = OKLCH.exec(oklch);
  if (!match?.groups) {
    throw new Error(`Expected a plain oklch() colour, got "${oklch}".`);
  }
  const lightness = Number(match.groups.l);
  const chroma = Number(match.groups.c);
  const hue = (Number(match.groups.h) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return `#${rgb.map((channel) => toSrgbChannel(channel).toString(16).padStart(2, "0")).join("")}`;
};

const themeColor = (name: string, scheme: "light" | "dark"): string => {
  const darkStart = themeCss.search(DARK_PALETTE);
  const css =
    scheme === "dark"
      ? themeCss.slice(darkStart)
      : themeCss.slice(0, darkStart);
  const declaration = new RegExp(`--${name}:\\s*([^;]+);`, "u").exec(css);
  if (!declaration?.[1]) {
    throw new Error(`theme.css has no ${scheme} --${name}.`);
  }
  return oklchToHex(declaration[1].trim());
};

export { themeColor };
