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
  scrollbar: "#8F8B88" # scroll thumb, 3:1 on the page and the tint
  scrollbar-dark: "#6C6865"
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
  statement: { family: system-ui, size: 20px, weight: 400, line-height: 32.5px }
  name: { family: system-ui, size: 20px, weight: 500, line-height: 32.5px }
  heading: { family: system-ui, size: 16px, weight: 500, line-height: 26px }
  docs-title: { family: system-ui, size: 20px, weight: 500, line-height: 27.5px }
  docs-section-title: { family: system-ui, size: 18px, weight: 500, line-height: 24.75px }
  row-title: { family: system-ui, size: 16px, weight: 450, line-height: 26px }
  link: { family: system-ui, size: 16px, weight: 450, line-height: 26px }
  footer: { family: system-ui, size: 14px, weight: 400, line-height: 20px }
rounded: { logo: 9999px, favicon: 5px, focus: 5px }
spacing: { column: 624px, docs: 864px, sidebar: 192px, sidebar-gap: 48px, gutter: 24px, page-y: 96px, page-y-mobile: 48px, section-y: 40px, row-y: 14px }
components:
  row: { text: "{colors.ink}", rule: "{colors.hairline}", padding-y: 14px, hover: title underline }
  row-description: { text: "{colors.fog}" }
  row-aside: { text: "{colors.fog}", numerals: tabular }
  row-logo: { size: 36px, radius: "{rounded.logo}", shadow: "0 0 0 1px #0000000F, 0 1px 2px -1px #0000000F, 0 2px 4px 0 #0000000A" }
  section-title: { text: "{colors.fog}", position: above }
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
  "--destructive": ["#E32729", "#E32729"] # warm red; white on it passes AA (4.6:1)
  "--warning": ["#BB6802", "#F4A437"] # amber, icon only: 4.1:1 and 9.6:1 on card
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
  "--scrollbar": ["#8F8B88", "#6C6865"]
---

# DESIGN — alexandrejoly.me

## Overview

Our own layout: the mark over a one-sentence 20px statement on top, then sections whose titles sit above ruled rows. A neutral palette warmed to hue 70, the system font at 16px, with 20px only for the home statement and 14px for the footer, tables and code blocks. One 624px column (864px with the docs sidebar), no header chrome, no accent colour, no section dividers.

## Colour

- Neutral with a faint warm tint in both modes (hue 70, chroma ≤ 0.008), too low to read as a colour. `ink` is every row title and link; `fog` is prose, descriptions, years and section titles. Prose is muted by default and links stand out by switching to ink.
- `hairline` rules the rows of a section. Nothing else draws a line.
- `underline` is the resting link underline, `fog` its hover colour.
- Dark mode follows `prefers-color-scheme`. No toggle.

## Typography

- System UI stack, no webfont. `font-variant-ligatures: none`, antialiased, `text-wrap: pretty` on prose and rows.
- 16px for everything except the home statement at 20px, and the footer, tables and code blocks at 14px. Line-height 1.625, the statement included.
- Docs pages are the exception that takes a size step, since they nest three heading levels: the page title at 20px and section titles at 18px (line-height 1.375), example and API part titles at the 16px `heading`. All three at 500 in ink.
- Weight 500 for the name, 450 (`font-book`) for row titles and links, 400 for body, the rest of the statement and section titles.
- Years use `tabular-nums`.

## Shape and depth

- Rows have no fill and no radius; a hairline under each row except the last.
- Row logos are 36px circles on the hairline shadow. Their icon sits at `muted-foreground` 80% and lights to `foreground` while the row is hovered or focused. Favicons inside links are 16px with a 5px radius.
- Skill and component glyphs are line icons on a 24px grid at 16px, with a 2px stroke and round caps and joins, the weight of the mark. Only small marks are filled, the badge's dot and the marquee's tiles; the rest is stroke.
- No borders on surfaces, no cards. Exception: component docs pages may hold previews and code blocks in quiet rounded cards (`Preview`, `CodeBlock`, `Panel`), since code and stacked API tables are hard to read without a container.

## Layout

- Two containers, both centred with `px-6`:
  - **Column** `max-w-column` (624px, a 576px measure inside the gutters), `py-12 sm:py-24`: the home page and every page without navigation.
  - **Docs** `max-w-docs` (864px, the column plus the sidebar and its gap): component docs pages. From `md`, a 192px sticky sidebar and a 48px gap, then the content at the column's 576px measure. Below `md`, the content alone in the column.
- Header: the 40px mark, then the statement 24px below it, balanced across the column, and the social icons 20px under the statement (their hit-area padding cancelled so the gap is the visible one). The contribution graph sits 28px under the icons, so both gaps measure about 29px from the statement's baseline and the icons' edges.
- Sections: the title above its rows with a 16px gap, at every width. 40px above and below each section, no divider between them.
- The first row of a section has no top padding, so its title lines up with the section title.

## Components

- **Section** (`Section`, `SectionTitle`, `SectionContent`): the title always sits above the content. By default it is a 16px title in `fog`; `variant="stacked"` makes it an 18px heading in ink, for the docs container.
- **Row** (a plain `ul` of `ItemLight`s from `apps/web/src/components/item-light.tsx`, styled from `apps/web/src/index.css` by `data-slot`; the stock `Item` printed too many classes for the home's text-to-HTML ratio): optional round logo (`ItemLightMedia`), title over description, year on the right (`ItemLightActions`), ruled by an inset hairline drawn as the row's `::after`, the same rule as `ItemInsetSeparator`.
- **Text link** (`TextLink`): ink, weight 450, underline in `underline` at 3px; may lead with a favicon `<img>`.
- **Heading** (`Heading`): 16px at 500 in ink, any level through `render`; `variant="title"` is the 20px docs page title.
- **Heading anchor** (`HeadingAnchor`): on docs pages, each section, example and API part title links to its own `#id`, keeping its colour, and underlines on hover or focus like a sidebar link. A `#` in `ash` sits in the 24px margin before it (in a 24px box after it below `sm`, where the page has no margin), shown while the title is hovered or focused and always on touch devices; it is decorative, so the link's name stays the title. Headings keep 24px of scroll margin.
- **Code** (`Code`, `CodeBlock`): system mono. Inline code is ink at the surrounding size (`muted` for secondary code such as types). Blocks are shadcn's `CodeBlock` at 14px: a `tint` card at 16px radius with no border, Shiki's vitesse colours highlighted at build time, and a ghost copy button that shows on hover or focus at the top end, or in the header next to a file title. Heights follow ui.shadcn.com: install commands and Usage show in full, Usage split into an imports card and a markup card; an example's code scrolls within 288px; the full source collapses to 256px behind a centred ghost "Show more" in the footer, then scrolls within 384px. Capped blocks fade top and bottom with `scroll-fade-y`.
- **Preview** (`Preview`): a live demo in a card drawn by a single `hairline` at 16px radius, no fill, so demos keep the page background.
- **Panel** (`Panel`): the same hairline card around one component part's API (name, description, table), 24px between panels. Its content is 14px, like every table, so dense API tables stay readable. The table runs edge to edge; its outer cells and the header take the 20px inset (24px from `sm`).
- **API reference** (`Table`): one table per part, labelled by its heading. Prop (row header, description under it in `fog`) | Type (`muted` code) | Default (ink code, an em dash when none); the Default column is dropped when no prop has one, and below `sm` the default moves under the description. Type and Default columns share fixed widths so stacked tables line up; their tokens never break mid-word. Hairline rules, 14px row padding, no hover fill.
- **Docs sidebar** (`Sidebar`, `collapsible="none"`): the docs container's navigation. Desktop: the breadcrumb on top, then one muted link per component; the current one is ink, hover underlines. No border, no fill. Mobile: the page header keeps the breadcrumb with a menu icon button at the end, which opens the same list, titled "Components", in a sheet closed by a "Close" button drawn as a text link, with no icon.
- **Breadcrumb** (`Breadcrumb`, composed on each page): the way up on every page but home, above the title, never including the page itself, which the title already names. "Home" alone on About, Contact, Privacy, Components and 404; "Home / Components" on docs pages, which mirrors their `BreadcrumbList` JSON-LD up to the parent. Text links at body size with no icon, separated by a `/` in `ash`.
- **Identity** (`Identity`, `IdentityMark`, `IdentityStatement`, `IdentityName`): a 40px mark over one balanced 20px sentence in `fog`, “I’m” then the name as a run-in `h1` in ink at 500, then the role and the intro, links in ink. The mark is the 2025 arc and bar redrawn as a single 2px round-capped line on a 24px grid, the same weight in the header and the favicon.

## States

- Hover, only on `(hover: hover)` devices: a row underlines its title, a link darkens its underline. 200ms ease-out.
- Focus: 2px `ring` outline, 2px offset; a focused row also underlines its title.
- Project logos move on row hover or focus, `cubic-bezier(0.23, 1, 0.32, 1)` (`ease-settle`): Gymup's plate turns one lobe (72deg, 600ms); the react-easy-modals stack fans out (250ms, layers staggered 30ms); responsivecn's centred dialog slides down and widens into a bottom drawer with its handle (300ms); Kwern's dithered peaks fade in behind it under a 20% black overlay (260ms) while the mark plays Kwern's "thinking" loop (4s), easing back to rest over 400ms on leave. A skill's slash straightens into a caret (200ms) and blinks (1s, step-end). Each component's glyph acts out the component (200ms): the badge dot swells and settles (300ms); the onboarding's second segment fills; the hint's faint bubble opens from its trigger; the infinite list scrolls up one row as the next fades in; the marquee's filled tiles, cut by a scroll fade at both ends, slide one tile per 1.2s, linear, looping, and on leave glide on to the next tile over 400ms; the item inset separator's faint rule draws out from the text start to its full length and opacity.
- Selection: `selection` fill.
- Load: the mark draws itself once, the arc over 900ms then the bar over 450ms from 500ms, `cubic-bezier(0.23, 1, 0.32, 1)` (`animate-mark-draw`, `animate-mark-draw-late`).
- `prefers-reduced-motion`: transitions, the draw-on and the logo motion off; the mark and logos show at rest.

## Do / Don't

- Do keep every size at 16px, except the home statement at 20px and the footer, tables and code blocks at 14px, and build hierarchy with weight and ink.
- Do keep section titles above their rows and rows ruled.
- Don't put dividers between sections; spacing separates them.
- Don't fill rows on hover, or add an accent colour, cards (outside docs previews and code) or a theme toggle.
- Don't truncate row titles; let them wrap.
