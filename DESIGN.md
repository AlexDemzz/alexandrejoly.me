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
rounded: { thumb: 5px, frame: 8px, row: 16px, pill: 9999px }
spacing:
  {
    column: 692px,
    gutter: 24px,
    page-y: 96px,
    page-y-mobile: 48px,
    section: 96px,
    section-mobile: 64px,
    heading-gap: 12px,
    row-gap: 8px,
    row-pad: 8px,
  }
components:
  row:
    {
      text: "{colors.ink}",
      radius: "{rounded.row}",
      padding: 8px,
      hover: arrow only,
    }
  row-description: { text: "{colors.fog}" }
  row-aside: { text: "{colors.fog}", numerals: tabular }
  row-arrow:
    {
      text: "{colors.ash}",
      from: "opacity 0, scale .75, x -2px",
      to: "opacity 1, scale 1, x 0",
      duration: 200ms,
    }
  thumb-frame:
    {
      fill: "{colors.paper}",
      radius: "{rounded.frame}",
      padding: 3px,
      shadow: "0 0 0 1px #0000000F, 0 1px 2px -1px #0000000F, 0 2px 4px 0 #0000000A",
    }
  thumb:
    {
      fill: "{colors.preview}",
      radius: "{rounded.thumb}",
      width: 40px,
      height: 48px,
    }
  link:
    {
      text: "{colors.ink}",
      underline: "{colors.underline}",
      underline-hover: "{colors.fog}",
      offset: 3px,
    }
  button-primary:
    { fill: "{colors.ink}", text: "{colors.paper}", radius: "{rounded.pill}" }
  divider: { fill: "{colors.ink}", height: 32px, pattern: 4 dithered steps }
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

A single text column, 692px wide with 24px gutters, on an off-white page that turns near-black with the system theme. Everything is 16px: hierarchy comes from weight (400, 450, 500) and from two inks, never from size. No accent colour, no header chrome, no cards on the page: an identity line, a two-paragraph bio with underlined links, then sections of stacked rows. Interaction is quiet: a ↗ arrow fades in beside a row title on hover, buttons press to 97%.

## Colour

- Neutral only, twelve greys with zero chroma. `ink` is every title, heading and link; `fog` is every paragraph, description and year. Body copy is muted by default and links stand out by switching to ink.
- `ash` is reserved for icons and the hover arrow. `dust` is the footer.
- `underline` is the resting link underline, `fog` its hover colour.
- `preview` (pure white / near black) is only used inside thumbnail frames, one step off the page so a thumbnail reads as an object.
- Dark mode follows `prefers-color-scheme`. No `.dark` toggle.

## Typography

- System UI stack (SF Pro on Apple), no webfont. `font-variant-ligatures: none`, antialiased, `text-wrap: pretty` on prose and row text.
- 16px for everything except the 14px footer. Line-height 1.625, 1.375 for the identity lines.
- Weight 500 for the name and section headings, 450 (`font-book`) for row titles and inline links, 400 for body.
- Counts and years use `tabular-nums`.

## Shape and depth

- Rows: 16px radius, but no fill at rest or on hover: the radius only shows on the focus ring.
- Thumbnail: a 3px frame (8px radius, paper fill) around a 40×48 card (5px radius, preview fill). Both carry the hairline shadow, no borders.
- Shadow `0 0 0 1px #0000000F, 0 1px 2px -1px #0000000F, 0 2px 4px 0 #0000000A` in light, `0 0 0 1px #FFFFFF14` in dark.
- The only button is a full pill.

## Layout

- Column `max-w-173` (692px), `px-6`, `py-12 sm:py-24`.
- Identity block → bio 24px; paragraph → paragraph 16px.
- First section `mt-12 sm:mt-16`, following ones `mt-16 sm:mt-24`. Heading → list 12px. Rows 8px apart.
- Rows sit at `-mx-2 p-2`, so their text aligns with the column while the hit area grows; a `::before` extends it 4px up and down so there are no dead gaps.
- Footer: a 32px dithered band, then the footer line.

## Components

- **Row** (`Item`): optional thumbnail, title over description, optional aside on the right (year, count). Link rows get the hover arrow after the title.
- **Section**: a 500-weight heading with an optional muted count (`Projects 3`), then the row list.
- **Text link**: ink, weight 450, underline in `underline` at 3px offset; hover moves the underline to `fog` in 200ms.
- **Divider**: four dithered segments getting denser left to right, last one solid ink.
- **Button**: ink pill, paper text, presses to `scale(.97)`.

## States

- Hover: only on `(hover: hover)` devices. Row: arrow fades/scales/slides in, 200ms ease-out. Link: underline darkens.
- Focus: `outline: 2px solid ring`, 2px offset, 4px radius on links, row radius on rows.
- Active: buttons `scale(.97)`.
- Selection: `selection` fill.
- `prefers-reduced-motion`: transitions off.

## Do / Don't

- Do keep every size at 16px and build hierarchy with weight and ink.
- Do keep the hover signal to the arrow; no background fill on rows.
- Do keep thumbnails inside the frame + card pair.
- Don't add an accent colour, a header, or a theme toggle.
- Don't use borders where the hairline shadow does the job.
- Don't animate on touch devices or under reduced motion.
