import { createContext, useContext } from "react";
import type { CSSProperties } from "react";

// The film draws a macOS desktop in points, then scales it up so the UI stays
// legible once the video plays at the landing's breakout width.
export const POINTS = { height: 450, width: 800 };
export const SCALE = 2;

export const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif';
export const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

export type Theme = "light" | "dark";

// alexandrejoly.me's palette (packages/ui/src/styles/theme.css) for the title
// cards, macOS system colors for the app, one set per appearance so the film
// matches the page it plays on.
export const PALETTES = {
  dark: {
    accent: "#0a84ff",
    callChrome: "#2b2a29",
    destructive: "#ff453a",
    field: "rgba(255,255,255,0.08)",
    label: "#f5f5f7",
    menuBar: "rgba(28,28,30,0.5)",
    menuShadow:
      "0 0 0 0.5px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.14)",
    menuSurface: "rgba(44, 44, 46, 0.92)",
    page: "oklch(0.166 0.003 70)",
    pageForeground: "oklch(0.955 0.004 70)",
    pageMuted: "oklch(0.785 0.007 70)",
    pressed: "rgba(255,255,255,0.16)",
    secondary: "rgba(235, 235, 245, 0.62)",
    separator: "rgba(255, 255, 255, 0.12)",
    sidebar: "#262524",
    tertiaryFill: "rgba(118, 118, 128, 0.26)",
    toolbar: "rgba(255,255,255,0.08)",
    toolbarBar: "rgba(30,30,30,0.86)",
    wallpaper:
      "radial-gradient(120% 90% at 20% 0%, oklch(0.36 0.02 70), transparent 60%), radial-gradient(90% 80% at 100% 100%, oklch(0.27 0.025 50), transparent 70%), oklch(0.22 0.012 65)",
    window: "#1e1e1e",
    windowShadow:
      "0 0 0 0.5px rgba(0,0,0,0.7), inset 0 0 0 0.5px rgba(255,255,255,0.12), 0 12px 34px rgba(0,0,0,0.45)",
  },
  light: {
    accent: "#0a84ff",
    callChrome: "#f4f3f2",
    destructive: "#d70015",
    field: "rgba(0,0,0,0.06)",
    label: "#1d1d1f",
    menuBar: "rgba(255,255,255,0.42)",
    menuShadow:
      "0 0 0 0.5px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.18), inset 0 0.5px 0 rgba(255,255,255,0.6)",
    menuSurface: "rgba(246, 246, 246, 0.92)",
    page: "oklch(0.988 0.003 70)",
    pageForeground: "oklch(0.238 0.005 70)",
    pageMuted: "oklch(0.532 0.008 70)",
    pressed: "rgba(0,0,0,0.12)",
    secondary: "rgba(60, 60, 67, 0.72)",
    separator: "rgba(60, 60, 67, 0.14)",
    sidebar: "#f2f1f0",
    tertiaryFill: "rgba(118, 118, 128, 0.12)",
    toolbar: "rgba(255,255,255,0.8)",
    toolbarBar: "rgba(255,255,255,0.86)",
    wallpaper:
      "radial-gradient(120% 90% at 20% 0%, oklch(0.95 0.012 75), transparent 60%), radial-gradient(90% 80% at 100% 100%, oklch(0.84 0.02 55), transparent 70%), oklch(0.9 0.014 68)",
    window: "#ffffff",
    windowShadow:
      "0 0 0 0.5px rgba(0,0,0,0.18), 0 10px 30px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08)",
  },
} satisfies Record<Theme, Record<string, string>>;

export type Palette = (typeof PALETTES)[Theme];

export const ThemeContext = createContext<Theme>("light");

export const usePalette = (): Palette => PALETTES[useContext(ThemeContext)];

export const menuSurface = (palette: Palette): CSSProperties => ({
  backdropFilter: "blur(20px)",
  background: palette.menuSurface,
  borderRadius: 10,
  boxShadow: palette.menuShadow,
  padding: 5,
});
