---
source:
  sampled: colours # production CSS tokens, confirmed by magick point samples on the renders
  estimated: none # sizes and radii read from the production CSS, not measured
  modes: light, dark # dark follows prefers-color-scheme only, no toggle
colors:
  paper: "#FCFCFC"
  paper-dark: "#101010"
  ink: "#202020"
  ink-dark: "#EEEEEE"
  fog: "#6F6F6F" # gray-1100, muted text
  fog-dark: "#B5B5B5"
  ash: "#838383" # gray-1000, icons and hover arrow
  ash-dark: "#7B7B7B"
  dust: "#8D8D8D" # gray-900, footer
  dust-dark: "#6E6E6E"
  underline: "#D9D9D9" # gray-600, link underline
  underline-dark: "#3A3A3A"
  selection: "#E0E0E0" # gray-500
  selection-dark: "#313131"
  hairline: "#E8E8E8" # gray-400
  hairline-dark: "#252525"
  tint: "#F6F6F6" # gray-200
  tint-dark: "#191919"
  raised: "#F0F0F0" # gray-300
  raised-dark: "#222222"
  preview: "#FFFFFF" # thumbnail cards
  preview-dark: "#0B0B0B"
typography:
  body: { family: system-ui, size: 16px, weight: 400, line-height: 26px }
  name: { family: system-ui, size: 16px, weight: 500, line-height: 22px }
  role: { family: system-ui, size: 16px, weight: 450, line-height: 22px }
  heading: { family: system-ui, size: 16px, weight: 500, line-height: 26px }
  row-title: { family: system-ui, size: 16px, weight: 450, line-height: 26px }
  link: { family: system-ui, size: 16px, weight: 450, line-height: 26px }
  footer: { family: system-ui, size: 14px, weight: 400, line-height: 20px }
rounded: { logo: 9999px, favicon: 5px, focus: 5px }
spacing: { column: 720px, gutter: 24px, margin: 128px, margin-gap: 32px, page-y: 96px, page-y-mobile: 48px, section-y: 40px, row-y: 14px }
components:
  row: { text: "{colors.ink}", rule: "{colors.hairline}", padding-y: 14px, hover: title underline }
  row-description: { text: "{colors.fog}" }
  row-aside: { text: "{colors.fog}", numerals: tabular }
  row-logo: { size: 36px, radius: "{rounded.logo}", shadow: "0 0 0 1px #0000000F, 0 1px 2px -1px #0000000F, 0 2px 4px 0 #0000000A" }
  section-title: { text: "{colors.fog}", position: sticky margin }
  link: { text: "{colors.ink}", underline: "{colors.underline}", underline-hover: "{colors.fog}", offset: 3px }
  link-favicon: { size: 16px, radius: "{rounded.favicon}" }
shadcnMapping:
  "--background": ["#FCFCFC", "#101010"]
  "--foreground": ["#202020", "#EEEEEE"]
  "--card": ["#FFFFFF", "#0B0B0B"]
  "--card-foreground": ["#202020", "#EEEEEE"]
  "--popover": ["#FFFFFF", "#0B0B0B"]
  "--popover-foreground": ["#202020", "#EEEEEE"]
  "--primary": ["#202020", "#EEEEEE"]
  "--primary-foreground": ["#FCFCFC", "#101010"]
  "--secondary": ["#F6F6F6", "#191919"]
  "--secondary-foreground": ["#202020", "#EEEEEE"]
  "--muted": ["#F6F6F6", "#191919"]
  "--muted-foreground": ["#6F6F6F", "#B5B5B5"]
  "--accent": ["#F0F0F0", "#222222"]
  "--accent-foreground": ["#202020", "#EEEEEE"]
  "--destructive": ["#DC3E42", "#FF6369"] # no reference evidence: Radix red 10
  "--border": ["#E8E8E8", "#252525"]
  "--input": ["#E8E8E8", "#252525"]
  "--ring": ["#6F6F6F", "#B5B5B5"]
  "--chart-1": ["#202020", "#EEEEEE"] # charts: no reference evidence, neutral ramp
  "--chart-2": ["#6F6F6F", "#B5B5B5"]
  "--chart-3": ["#8D8D8D", "#6E6E6E"]
  "--chart-4": ["#BBBBBB", "#484848"]
  "--chart-5": ["#D9D9D9", "#3A3A3A"]
  "--radius": "0.5rem"
  "--sidebar": ["#FCFCFC", "#101010"] # no sidebar in the reference: page surfaces
  "--sidebar-foreground": ["#202020", "#EEEEEE"]
  "--sidebar-primary": ["#202020", "#EEEEEE"]
  "--sidebar-primary-foreground": ["#FCFCFC", "#101010"]
  "--sidebar-accent": ["#F0F0F0", "#222222"]
  "--sidebar-accent-foreground": ["#202020", "#EEEEEE"]
  "--sidebar-border": ["#E8E8E8", "#252525"]
  "--sidebar-ring": ["#6F6F6F", "#B5B5B5"]
  "--subtle-foreground": ["#838383", "#7B7B7B"]
  "--faint-foreground": ["#8D8D8D", "#6E6E6E"]
  "--underline": ["#D9D9D9", "#3A3A3A"]
  "--selection": ["#E0E0E0", "#313131"]
---

# DESIGN — alexandrejoly.me

## Overview

Our own layout: an identity line and two paragraphs of prose on top, then sections whose titles sit in a left margin beside ruled rows. A neutral palette, the system font and a single 16px size. One 720px column, no header chrome, no accent colour, no section dividers.

## Colour

- Neutral only, zero chroma. `ink` is every row title and link; `fog` is prose, descriptions, years and section titles. Prose is muted by default and links stand out by switching to ink.
- `hairline` rules the rows of a section. Nothing else draws a line.
- `underline` is the resting link underline, `fog` its hover colour.
- Dark mode follows `prefers-color-scheme`. No toggle.

## Typography

- System UI stack, no webfont. `font-variant-ligatures: none`, antialiased, `text-wrap: pretty` on prose and rows.
- 16px for everything except the 14px footer. Line-height 1.625, 1.375 for the identity lines.
- Weight 500 for the name, 450 (`font-book`) for row titles, links and the role, 400 for body and section titles.
- Years use `tabular-nums`.

## Shape and depth

- Rows have no fill and no radius; a hairline under each row except the last.
- Project logos are 36px circles on the hairline shadow. Favicons inside links are 16px with a 5px radius.
- No borders on surfaces, no cards.

## Layout

- Column `max-w-180` (720px) with `px-6`, `py-12 sm:py-24`.
- Header: identity, then two paragraphs 20px apart, spanning the full column so they end at the same edge as the rows.
- Sections: from `sm`, an 8rem margin holding the sticky title and a 32px gap before the rows; one column below `sm`. 40px above and below each section, no divider between them.
- The first row of a section has no top padding, so its title lines up with the section title.

## Components

- **Section** (`Section`, `SectionTitle`, `SectionContent`): margin title + content column.
- **Row** (`ItemGroup` of `Item`s): optional round logo (`ItemMedia variant="logo"`), title over description, year on the right (`ItemActions`).
- **Text link** (`TextLink`): ink, weight 450, underline in `underline` at 3px; may lead with a favicon `<img>`.
- **Identity**: 44px mark, name over role. The mark is the 2025 arc and bar redrawn as a single 2px round-capped line on a 24px grid, the same weight in the header and the favicon.

## States

- Hover, only on `(hover: hover)` devices: a row underlines its title, a link darkens its underline. 200ms ease-out.
- Focus: 2px `ring` outline, 2px offset; a focused row also underlines its title.
- Selection: `selection` fill.
- Load: the mark draws itself once, the arc over 900ms then the bar over 450ms from 500ms, `cubic-bezier(0.23, 1, 0.32, 1)` (`animate-mark-draw`, `animate-mark-draw-late`).
- `prefers-reduced-motion`: transitions and the draw-on off; the mark shows at rest.

## Do / Don't

- Do keep every size at 16px and build hierarchy with weight and ink.
- Do keep section titles in the margin and rows ruled.
- Don't put dividers between sections; spacing separates them.
- Don't fill rows on hover, or add an accent colour, cards or a theme toggle.
- Don't truncate row titles; let them wrap.
