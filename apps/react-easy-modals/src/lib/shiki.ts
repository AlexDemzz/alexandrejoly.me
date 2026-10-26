// The docs' MDX code blocks and the landing snippets share these options: both
// vitesse themes ride on CSS variables, and app.css picks one per scheme.
export const SHIKI_OPTIONS = {
  themes: { light: "vitesse-light", dark: "vitesse-dark" },
  defaultColor: false,
} as const;
