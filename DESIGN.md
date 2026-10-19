---
source:
  sampled: colours # production CSS tokens, confirmed by magick point samples on the renders
  estimated: none # sizes and radii read from the production CSS, not measured
  modes: light, dark # dark follows prefers-color-scheme only, no toggle; both modes warmed to hue 70
colors:
  paper: "#FCFBF9"
  paper-dark: "#0F0E0D"
  ink: "#201E1C"
  ink-dark: "#F2F0ED"
  fog: "#6F6C67" # gray-1100, muted text
  fog-dark: "#BCB8B4"
  ash: "#7F7B77" # gray-1000, icons and hover arrow
  ash-dark: "#928E8A"
  dust: "#706C68" # gray-900, footer
  dust-dark: "#8E8A85"
  underline: "#DAD7D3" # gray-600, link underline
  underline-dark: "#3A3735"
  selection: "#E1DEDA" # gray-500
  selection-dark: "#312F2C"
  hairline: "#E9E6E3" # gray-400
  hairline-dark: "#242220"
  tint: "#F6F4F2" # gray-200
  tint-dark: "#191715"
  raised: "#F1EEEB" # gray-300
  raised-dark: "#22201D"
  preview: "#FFFEFD" # thumbnail cards
  preview-dark: "#0A0A09"
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
  "--background": ["#FCFBF9", "#0F0E0D"]
  "--foreground": ["#201E1C", "#F2F0ED"]
  "--card": ["#FFFEFD", "#0A0A09"]
  "--card-foreground": ["#201E1C", "#F2F0ED"]
  "--popover": ["#FFFEFD", "#0A0A09"]
  "--popover-foreground": ["#201E1C", "#F2F0ED"]
  "--primary": ["#201E1C", "#F2F0ED"]
  "--primary-foreground": ["#FCFBF9", "#0F0E0D"]
  "--secondary": ["#F6F4F2", "#191715"]
  "--secondary-foreground": ["#201E1C", "#F2F0ED"]
  "--muted": ["#F6F4F2", "#191715"]
  "--muted-foreground": ["#6F6C67", "#BCB8B4"]
  "--accent": ["#F1EEEB", "#22201D"]
  "--accent-foreground": ["#201E1C", "#F2F0ED"]
  "--destructive": ["#DC3E42", "#FF6369"] # no reference evidence: Radix red 10
  "--border": ["#E9E6E3", "#242220"]
  "--input": ["#E9E6E3", "#242220"]
  "--ring": ["#6F6C67", "#BCB8B4"]
  "--chart-1": ["#201E1C", "#F2F0ED"] # charts: no reference evidence, neutral ramp
  "--chart-2": ["#6F6C67", "#BCB8B4"]
  "--chart-3": ["#8D8D8D", "#6E6E6E"]
  "--chart-4": ["#BBBBBB", "#484848"]
  "--chart-5": ["#D9D9D9", "#3A3A3A"]
  "--radius": "0.5rem"
  "--sidebar": ["#FCFBF9", "#0F0E0D"] # no sidebar in the reference: page surfaces
  "--sidebar-foreground": ["#201E1C", "#F2F0ED"]
  "--sidebar-primary": ["#201E1C", "#F2F0ED"]
  "--sidebar-primary-foreground": ["#FCFBF9", "#0F0E0D"]
  "--sidebar-accent": ["#F1EEEB", "#22201D"]
  "--sidebar-accent-foreground": ["#201E1C", "#F2F0ED"]
  "--sidebar-border": ["#E9E6E3", "#242220"]
  "--sidebar-ring": ["#6F6C67", "#BCB8B4"]
  "--subtle-foreground": ["#7F7B77", "#928E8A"]
  "--faint-foreground": ["#706C68", "#8E8A85"]
  "--underline": ["#DAD7D3", "#3A3735"]
  "--selection": ["#E1DEDA", "#312F2C"]
---

# DESIGN — alexandrejoly.me

## Overview

Our own layout: an identity line and two paragraphs of prose on top, then sections whose titles sit in a left margin beside ruled rows. A neutral palette warmed to hue 70, the system font and a single 16px size. One 720px column, no header chrome, no accent colour, no section dividers.

## Colour

- Neutral with a faint warm tint in both modes (hue 70, chroma ≤ 0.008), too low to read as a colour. `ink` is every row title and link; `fog` is prose, descriptions, years and section titles. Prose is muted by default and links stand out by switching to ink.
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
- Row logos are 36px circles on the hairline shadow. Their icon sits at `muted-foreground` 80% and lights to `foreground` while the row is hovered or focused. Favicons inside links are 16px with a 5px radius.
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
- Project logos move on row hover or focus, `cubic-bezier(0.23, 1, 0.32, 1)` (`ease-settle`): Gymup's plate turns one lobe (72deg, 600ms); the react-easy-modals stack fans out (250ms, layers staggered 30ms); Kwern's dithered peaks fade in behind it under a 20% black overlay (260ms) while the mark plays Kwern's "thinking" loop (4s), easing back to rest over 400ms on leave. A skill's slash straightens into a caret (200ms) and blinks (1s, step-end).
- Selection: `selection` fill.
- Load: the mark draws itself once, the arc over 900ms then the bar over 450ms from 500ms, `cubic-bezier(0.23, 1, 0.32, 1)` (`animate-mark-draw`, `animate-mark-draw-late`).
- `prefers-reduced-motion`: transitions, the draw-on and the logo motion off; the mark and logos show at rest.

## Do / Don't

- Do keep every size at 16px and build hierarchy with weight and ink.
- Do keep section titles in the margin and rows ruled.
- Don't put dividers between sections; spacing separates them.
- Don't fill rows on hover, or add an accent colour, cards or a theme toggle.
- Don't truncate row titles; let them wrap.
