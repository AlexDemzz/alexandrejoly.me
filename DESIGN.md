---
colors: # role of each token; values (oklch, light and dark) live in packages/ui/src/styles/theme.css
  background: page
  foreground: row titles, links, headings, the name
  muted-foreground: prose, descriptions, years, section titles, link underline on hover
  subtle-foreground: decorative marks (heading `#`, breadcrumb `/`)
  faint-foreground: footer
  border: hairline rules
  underline: resting link underline
  muted: code block fill, social icon hover
  accent: raised fills in stock components
  card: alerts, popovers and dialogs
  selection: text selection
  scrollbar: scroll thumb, 3:1 on the page and the tint
  destructive: errors
  warning: warning icons only
typography:
  body: { family: system-ui, size: 16px, weight: 400, line-height: 1.625 }
  statement: { family: system-ui, size: 20px, weight: 400, line-height: 1.625 }
  name: { family: system-ui, size: 20px, weight: 500, line-height: 1.625 }
  heading: { family: system-ui, size: 16px, weight: 500, line-height: 1.625 }
  docs-title: { family: system-ui, size: 20px, weight: 500, line-height: 1.375 }
  docs-section-title: { family: system-ui, size: 18px, weight: 500, line-height: 1.375 }
  row-title: { family: system-ui, size: 16px, weight: 450, line-height: 1.625 }
  link: { family: system-ui, size: 16px, weight: 450, line-height: 1.625 }
  control: { family: system-ui, size: 14px, weight: 500, line-height: 20px }
  dense: { family: system-ui, size: 14px, weight: 400, line-height: 20px }
rounded: { logo: 9999px, favicon: 5px, focus: 5px, card: 16px, hero-card: 24px }
spacing: { column: 624px, docs: 864px, sidebar: 192px, sidebar-gap: 48px, gutter: 24px, page-y: "48px, 128px from sm, 64px from md", section-y: 40px, row-y: 14px }
components:
  row: { text: "{colors.foreground}", rule: "{colors.border}", padding-y: 14px, hover: title underline }
  row-description: { text: "{colors.muted-foreground}" }
  row-aside: { text: "{colors.muted-foreground}", numerals: tabular }
  row-logo: { size: 36px, radius: "{rounded.logo}", shadow: hairline }
  section-title: { text: "{colors.muted-foreground}", position: above }
  link: { text: "{colors.foreground}", underline: "{colors.underline}", underline-hover: "{colors.muted-foreground}", offset: 3px }
  link-favicon: { size: 16px, radius: "{rounded.favicon}" }
---

# DESIGN — alexandrejoly.me

The one design system of the monorepo (`@portfolio/ui`), for alexandrejoly.me and the docs sites (`apps/responsivecn`, `apps/react-easy-modals`). **Site** holds the rules for every page; docs pages add **Docs pages**, and the docs sites' home pages add **Library landings**.

## Site

### Overview

The mark over a one-sentence 20px statement, then sections whose titles sit above ruled rows. A neutral palette warmed to hue 70, the system font at a 16px reading size, one 624px column. Spacing separates sections; the header is the identity alone.

### Colour

- Neutrals carry hue 70 at chroma ≤ 0.008, too low to read as a colour. `destructive` and `warning` are the only saturated tokens, kept for errors and warning icons.
- Prose is `muted-foreground` by default; row titles and links stand out by switching to `foreground`.
- `border` draws the hairline: row rules, tables and the docs cards.
- `underline` is the resting link underline, `muted-foreground` its hover colour.
- Dark mode follows `prefers-color-scheme`, with no toggle.

### Typography

- System UI stack, no webfont. `font-variant-ligatures: none`, antialiased, `text-wrap: pretty` on prose and rows.
- 16px is the reading size: prose, rows, links and the `heading` level. Display text steps up: 20px for the home statement and the docs page title, 18px for docs section titles. Controls and dense content step down: 14px for buttons, tabs, toggles, tables, panels, code blocks and the footer, 12px for the compact sizes of buttons and code blocks.
- Line-height 1.625 for reading text and the statement, 1.375 for docs titles.
- Weight carries the hierarchy within a size: 500 for headings and the name, 450 (`font-book`) for row titles and links, 400 for body, the rest of the statement and section titles. Build hierarchy with weight and colour first, and step the size only along this scale.
- Years use `tabular-nums`.

### Shape

- Surfaces sit flat on the page. Cards appear only where content needs a container: code blocks, the docs cards (see Docs pages) and a library landing's hero card (see Library landings).
- Row logos are 36px circles on the hairline shadow. Their icon sits at `muted-foreground` 80% and lights to `foreground` while the row is hovered or focused. Favicons inside links are 16px with a 5px radius.
- Skill and component glyphs are line icons on a 24px grid at 16px, with a 2px stroke and round caps and joins, the weight of the mark. Only small marks are filled, the badge's dot and the marquee's tiles.

### Layout

- **Column** `max-w-column` (624px, a 576px measure inside the `px-6` gutters), `py-12 sm:py-32 md:py-16`: the home and every page without navigation.
- Header: the 40px mark, the statement 24px below it, then the 18px social icons 20px under the statement (their hit-area padding cancelled so the gap is the visible one), and the contribution graph 28px under the icons.
- Sections: the title above its rows with a 16px gap, at every width, and 40px above and below each section.
- The first row of a section has no top padding, so its title lines up with the section title.

### Components

- **Section** (`Section`, `SectionTitle`, `SectionContent`): the title always sits above the content, a 16px title in `muted-foreground`; `variant="stacked"` makes it the 18px docs section heading in `foreground`.
- **Row** (`ItemLight`, styled by `data-slot` in `apps/web/src/index.css`): optional round logo (`ItemLightMedia`), title over description, year on the right (`ItemLightActions`), an inset hairline under each row but the last, no fill. Titles wrap to as many lines as they need.
- **Item** (`Item`, `variant="underline"`): the compact row of the docs sites' link lists, at control size on one line: no horizontal padding, no fill; the title underlines and the media lights to `foreground` while the row is hovered or focused.
- **Text link** (`TextLink`, `link-text`): `foreground`, weight 450, underline in `underline` at 3px; may lead with a favicon.
- **Heading** (`Heading`): 16px at 500 in `foreground`, any level through `render`; `variant="title"` is the 20px docs page title.
- **Button** (`Button`): shadcn's Button, rounded-full at every size; inside a button group it keeps `rounded-lg`.
- **Tabs and toggles** (`Tabs`, `ToggleGroup`, `Toggle`): rounded-full like the button, list and items alike. A tab list wider than its column scrolls sideways, its edges faded with `scroll-fade-x`.
- **Code** (`Code`, `CodeBlock`): system mono. Inline code is `foreground` at the surrounding size (`muted-foreground` for secondary code such as types). Blocks are a `muted` card at 16px radius with no border, Shiki's vitesse colours highlighted at build time, and a ghost copy button at the top end, or in the header next to a file title, shown on hover or focus and always on touch devices. Capped blocks fade top and bottom with `scroll-fade-y`.
- **Breadcrumb** (`Breadcrumb`, composed on each page): the way up on every page but home, above the title, never including the page itself. "Home" alone on About, Contact, Privacy, Components and 404; "Home / Components" on docs pages, mirroring their `BreadcrumbList` JSON-LD up to the parent. Text links at body size, separated by a `/` in `subtle-foreground`.
- **Identity** (`Identity`, `IdentityMark`, `IdentityStatement`, `IdentityName`): a 40px mark over one balanced 20px sentence in `muted-foreground`, "I'm" then the name as a run-in `h1` in `foreground` at 500, then the role and the intro. The mark is the 2025 arc and bar redrawn as a single 2px round-capped line on a 24px grid, the same weight in the header and the favicon.

### States

- Hover, only on `(hover: hover)` devices, 200ms ease-out: a row underlines its title, a link darkens its underline, a social icon takes a `muted` fill. Rows respond with the title underline and the media alone.
- Focus: 2px `ring` outline, 2px offset; a focused row also underlines its title.
- Row media acts out its project or component on row hover or focus, with `ease-settle`, and eases back to rest on leave: a short move (200–600ms) or a loop. Rows with a photo backdrop fade it in from 115% scale and turn the icon white. Each icon file owns its timings.
- Selection: `selection` fill.
- Load: the mark draws itself once, the arc then the bar (`animate-mark-draw`, `animate-mark-draw-late`).
- `prefers-reduced-motion`: transitions, the draw-on and the media motion off; the mark and logos show at rest.

## Docs pages

Two engines, one look. alexandrejoly.me draws its component docs (`/components/$name`) with its own layout (Layout, Components below); the docs sites render their MDX with Fumadocs (Fumadocs below).

### Layout

- **Docs** `max-w-docs` (864px, the column plus the sidebar and its gap), same padding as the column. From `md`, a 192px sticky sidebar and a 48px gap, then the content at the column's 576px measure. Below `md`, the content alone in the column.
- Three heading levels: the page title (`Heading variant="title"`), section titles (`Section variant="stacked"`), and example and API part titles at the 16px `heading`.

### Components

- **Docs sidebar** (`Sidebar`, `collapsible="none"`): desktop shows the breadcrumb on top, then one `muted-foreground` link per component; the current one is `foreground`, hover underlines. No border, no fill. On mobile the page header keeps the breadcrumb with a menu icon button at the end, which opens the same list, titled "Components", in a sheet closed by a "Close" text link.
- **Heading anchor** (`HeadingAnchor`): each section, example and API part title links to its own `#id`, keeping its colour, and underlines on hover or focus like a sidebar link. A decorative `#` in `subtle-foreground` sits in the 24px margin before it (in a 24px box after it below `sm`), shown while the title is hovered or focused and always on touch devices. Headings keep 24px of scroll margin.
- **Preview** (`Preview`): a live demo in a card drawn by a single hairline at 16px radius, no fill, so demos keep the page background.
- **Code heights**, after ui.shadcn.com: install commands and Usage show in full, Usage split into an imports card and a markup card; an example's code scrolls within 288px; the full source collapses to 256px behind a centred ghost "Show more" in the footer, then scrolls within 384px.
- **Panel** (`Panel`): the Preview's hairline card around one component part's API (name, description, table), 24px between panels, content at 14px. The table runs edge to edge; its outer cells and the header take the 20px inset (24px from `sm`).
- **API reference** (`Table`): one table per part, labelled by its heading. Prop (row header, description under it in `muted-foreground`) | Type (`muted-foreground` code) | Default (`foreground` code, an em dash when none); the Default column is dropped when no prop has one, and below `sm` the default moves under the description. Type and Default columns share fixed widths so stacked tables line up; their tokens never break mid-word. Hairline rules, 14px row padding, no hover fill.

### Fumadocs

- `@portfolio/docs-theme` wraps stock Fumadocs (`DocsLayout`, its default MDX components, `Steps`, `Tabs`) and recolours it through `theme.css`: the docs sites style Fumadocs through the tokens alone.
- Dark follows `prefers-color-scheme`, Shiki's dark colours included; the theme switch is off.
- The nav title is the site name as a text link to the landing. The sidebar does not collapse; its footer lists GitHub first, then the site's own links.
- A page: title, a 14px description, an optional row of page actions above a hairline, then the body, at `max-w-3xl`.

## Library landings

The home pages of the docs sites (`apps/responsivecn`, `apps/react-easy-modals`), built from `@portfolio/ui` in the column.

- Header: the site's 40px mark with an outline GitHub button at the end, a 20px statement that opens with the `h1` library name, then a large "Read the docs" button.
- **Hero card:** the one card a landing allows, wider than the column (`max-w-breakout`, 816px), showing the library live. Nested radii stay concentric (outer radius minus the inset).
- Tabbed demos keep fixed heights, so switching tabs never moves the page. What a demo reports stays readable once its overlay closes.
- The sections end on a **Docs** list: one underline `Item` per page (title and description, no media), separated by `ItemSeparator`, flush with the section title.
- Code cards are `CodeBlock`s that share the site's Shiki config with its MDX pages; diff cards mark lines with the `removed` and `added` variants and their screen-reader labels.
