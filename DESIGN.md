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
  scrollbar: scroll thumb, 3:1 on the page and on `muted`
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
rounded: { logo: 9999px, favicon: 5px, focus: 5px, card: 16px, outer-card: 24px }
spacing: { column: 624px, docs: 864px, lab: 1152px, sidebar: 192px, sidebar-gap: 48px, gutter: 24px, page-y: "48px, 128px from sm, 64px from md", section-y: 40px, page-break: 64px, section-gap: 48px, row-y: 14px }
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

The mark over a one-sentence 20px statement, then sections whose titles sit above ruled rows. A neutral palette warmed to hue 70, the system font at a 16px reading size, one column. Spacing separates sections; the header is the identity alone.

### Colour

- Neutrals carry hue 70 at chroma ≤ 0.008, too low to read as a colour. `destructive` and `warning` are the only saturated tokens, kept for errors and warning icons.
- Prose is `muted-foreground` by default; row titles and links stand out by switching to `foreground`.
- `border` draws the hairline: row rules, tables and the docs cards.
- `underline` is the resting link underline, `muted-foreground` its hover colour.
- Dark mode follows `prefers-color-scheme`, with no toggle.

### Typography

- System UI stack, no webfont. `font-variant-ligatures: none`, antialiased, `text-wrap: pretty` on prose and rows.
- 16px is the reading size: prose, rows, links and the `heading` level. Display text steps up: 20px for the home statement and the docs page title, 18px for docs section titles. Controls and dense content step down: 14px for buttons, tabs, toggles, tables, panels, code blocks and the footer; compact sizes go smaller, 12.8px for `sm` buttons and toggles, 12px for `xs` buttons and `sm` code blocks.
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
- Sections: the title above its rows with a 16px gap, at every width. On the home, About, Contact and Components, sections sit 48px apart and 64px from the header and the footer, in a `SectionStack` (`apps/web`) of `Section spacing="none"`, so the breaks around them read larger than the gaps between them.
- The first row of a section has no top padding, so its title lines up with the section title, and the last row has no bottom padding, so the gap after it is the visible one.

### Components

- **Section** (`Section`, `SectionTitle`, `SectionContent`): the title always sits above the content, a 16px title in `muted-foreground`; `variant="stacked"` makes it the 18px docs section heading in `foreground`. It carries the 40px above and below; `spacing="none"` drops it for a column that spaces its sections with a gap (see Library landings › Rhythm).
- **Row** (`ItemLight`, styled by `data-slot` in `apps/web/src/index.css`): optional round logo (`ItemLightMedia`), title over description, year on the right (`ItemLightActions`), an inset hairline under each row but the last, no fill. Titles wrap to as many lines as they need.
- **Item** (`Item`, `variant="underline"`): the compact row of the docs sites' link lists, at the 16px reading size, the title in book weight (450) on one line, flush on its description, both at 1.625 line height, and the description on up to two: no horizontal padding, no fill; the title underlines and the media lights to `foreground` while the row is hovered or focused.
- **Text link** (`TextLink`, `link-text`): `foreground`, weight 450, underline in `underline` at 3px; may lead with a favicon.
- **Heading** (`Heading`): 16px at 500 in `foreground`, any level through `render`; `variant="title"` is the 20px docs page title.
- **Button** (`Button`): shadcn's Button, rounded-full at every size; inside a button group the compact sizes (`xs`, `sm`, `icon-xs`, `icon-sm`) turn `rounded-lg`. The `overlay` variant is for a button that sits on content: a translucent `background` fill over a backdrop blur, with a hairline border.
- **Tabs and toggles** (`Tabs`, `ToggleGroup`, `Toggle`): rounded-full like the button, list and items alike. A tab list wider than its column scrolls sideways, its edges faded with `scroll-fade-x`.
- **Code** (`Code`, `CodeBlock`): system mono. Inline code is `foreground` at the surrounding size (`muted-foreground` for secondary code such as types). Blocks are a `muted` card at 16px radius with no border, Shiki's vitesse colours highlighted at build time, and a ghost copy button at the top end, or in the header next to a file title, shown on hover or focus and always on touch devices. Capped blocks fade top and bottom with `scroll-fade-y`.
- **Breadcrumb** (`Breadcrumb`, composed on each page): the way up on every page but home, above the title, never including the page itself. "Home" alone on About, Contact, Privacy, Components and 404; "Home / Components" on docs pages, mirroring their `BreadcrumbList` JSON-LD up to the parent. Text links at body size, separated by a `/` in `subtle-foreground`.
- **Meter** (`Meter`, Base UI's meter): a measured reading, never progress. The label in `foreground` at 450, the value at the end in `muted-foreground` with `tabular-nums`, then a 12px track of 2px ticks on a 5px pitch: lit ticks in `foreground`, the rest in `border`. The fill keeps its first tick lit, so a near-zero reading still reads as running.
- **Identity** (`Identity`, `IdentityMark`, `IdentityStatement`, `IdentityName`): a 40px mark over one balanced 20px sentence in `muted-foreground`, "I'm" then the name as a run-in `h1` in `foreground` at 500, then the role and the intro. The mark is the 2025 arc and bar redrawn as a single 2px round-capped line on a 24px grid, the same weight in the header and the favicon.

### States

- Hover, only on `(hover: hover)` devices, 200ms ease-out: a row underlines its title, a link darkens its underline, a social icon takes a `muted` fill. Rows respond with the title underline and the media alone.
- Focus: 2px `ring` outline, 2px offset; a focused row also underlines its title.
- Row media acts out its project or component on row hover or focus, with `ease-settle`, and eases back to rest on leave: a short move (200–600ms) or a loop. Rows with a photo backdrop fade it in from 115% scale and turn the icon white. Each icon file owns its timings.
- Selection: `selection` fill.
- Load: the mark draws itself once, the arc then the bar (`animate-mark-draw`, `animate-mark-draw-late`).
- `prefers-reduced-motion`: transitions, the draw-on and the media motion off; the mark and logos show at rest.

## Lab

`/lab`: interaction experiments set in glyphs, one card each. The page's own rules, on top of the Site's.

- **Layout:** `max-w-lab` (1152px), the Column's padding. The header (crumb, `h1`, intro) keeps the 576px measure; under it the cards sit in a `gap-6` grid, one column below `md`, two from `md`, every card square. Keep an even count so the last row is full.
- **Card** (`LabCard`): the Preview's hairline at 16px radius, no fill. On top, the name as a `heading` with the gesture to try at the end in 14px `muted-foreground`; then the canvas, inset to the header's 20px (24px from `sm`); then a dashed rule and two 12px mono lines: the formula in `foreground` and a live readout in `muted-foreground` with `tabular-nums`, hidden from screen readers.
- **Canvas:** glyphs in system mono on the page background, at `foreground` with opacity for every tone. One accent, `--lab-hot` with `--lab-hot-ink` on it, scoped to the page by `data-lab` (`apps/web/src/index.css`): the tile or glyph under the hand, a charge, a highlight. No other page uses it.
- **Gestures**, by the `gestures` rules: the track phase follows the pointer 1:1 (rubber-banded where it pulls against a spring), the release hands its velocity to a spring or a momentum decay, a snap lands on the keyframe the velocity projects to, a hold charges linearly and cancels in 200ms ease-out. Every scene is `touch-pan-y`: a touch that starts up or down scrolls the page, and one that starts sideways or rests plays the scene in both dimensions.
- **Loop:** a canvas only draws while it is on screen and its scene still moves, never below 60 frames a second; on a faster display the scene under the pointer takes every frame and the others 60. Readouts update at most every 90ms.
- **Home:** one row in a "Lab" section, after Components.
- `prefers-reduced-motion`: idle drifts, momentum, bounces and bursts are off; what the pointer moves directly still follows it, and every scene settles on its final frame.

## Docs pages

Two engines, one look. alexandrejoly.me draws its component docs (`/components/$name`) with its own layout (Layout, Components below); the docs sites render their MDX with Fumadocs (Fumadocs below).

### Layout

- **Docs** `max-w-docs` (864px, the column plus the sidebar and its gap), same padding as the column. From `md`, a 192px sticky sidebar and a 48px gap, then the content at the column's 576px measure. Below `md`, the content alone in the column.
- Three heading levels: the page title (`Heading variant="title"`), section titles (`Section variant="stacked"`), and example and API part titles at the 16px `heading`.

### Components

- **Docs sidebar** (`Sidebar`, `collapsible="none"`): desktop shows the breadcrumb on top, then one `muted-foreground` link per component; the current one is `foreground`, hover underlines. No border, no fill. On mobile the page header keeps the breadcrumb with a menu icon button at the end, which opens the same list, titled "Components", in a sheet closed by a "Close" text link.
- **Heading anchor** (`HeadingAnchor`, in `@portfolio/ui`): each section, example and API part title links to its own `#id`, keeping its colour, and underlines on hover or focus like a sidebar link. A decorative `#` in `subtle-foreground` sits in the 24px margin before it (in a 24px box after it below `sm`), shown while the title is hovered or focused and always on touch devices. Headings keep 24px of scroll margin.
- **Preview** (`Preview`): a live demo in a card drawn by a single hairline at 16px radius, no fill, so demos keep the page background.
- **Code heights**, after ui.shadcn.com: install commands and Usage show in full, Usage split into an imports card and a markup card; an example's code scrolls within 288px; the full source collapses to 256px behind a centred ghost "Show more" in the footer, then scrolls within 384px.
- **Panel** (`Panel`): the Preview's hairline card around one component part's API (name, description, table), 24px between panels, content at 14px. The table runs edge to edge; its outer cells and the header take the 20px inset (24px from `sm`).
- **API reference** (`Table`): one table per part, labelled by its heading. Prop (row header, description under it in `muted-foreground`) | Type (`muted-foreground` code) | Default (`foreground` code, an em dash when none); the Default column is dropped when no prop has one, and below `sm` the default moves under the description. Type and Default columns share fixed widths so stacked tables line up; their tokens never break mid-word. Hairline rules, 14px row padding, no hover fill.

### Fumadocs

- `@portfolio/docs-theme` wraps stock Fumadocs (`DocsLayout`, its default MDX components, `Steps`, `Tabs`) and restyles it into the /components page: tokens through `theme.css`, layout and type in `docs-layout.css`. No rules and no fills, except the TOC track and the cards Docs pages › Components keeps.
- Shiki's dark colours follow the system like the rest, so the theme switch is off.
- Layout: the sidebar and the content share one centred block like `max-w-docs` (192px sidebar, 48px gap, the 576px measure), and the TOC sits beside them in a 240px column from `xl`. Sidebar, page and TOC start 64px from the top, the first TOC item level with the page title.
- Sidebar: the site name as a text link on top, group labels at the 16px `heading`, then text links like the docs sidebar. It has no footer and does not collapse.
- TOC: titles in `muted-foreground`, the visible ones in `foreground`, beside a 1px `border` track. One 1px `foreground` bar spans the visible titles and glides between them, anchored to the first and last; without anchor positioning the bar drops and the titles keep the state.
- Mobile: the page header of /components, the crumb with a menu icon button at the end, which opens Fumadocs' drawer with a "Close" text link in place of its close icon.
- A page: the 20px title, a 16px description, an optional row of page actions, then the body 40px below. Section titles are `HeadingAnchor` headings in the docs section rhythm: 16px to their content, 80px between sections, 48px above a 16px subheading that sits flush on its text, 12px between paragraphs and 24px around blocks. Prose is `muted-foreground`, links, bold and code `foreground`. 48px under the page, only the way forward: an `underline` Item titled "Next: " and the next page's name, its description under it; the sidebar holds the way back. Then the site's own footer 64px lower, as on its home.
- Demos sit behind Preview and Code tabs, as on /components: the demo in a `Preview`, the code capped at 288px with `scroll-fade-y`. A headless library's demos draw their own backdrop and panel, to show that the library ships no look of its own.

## Library landings

The home pages of the docs sites (`apps/responsivecn`, `apps/react-easy-modals`), built from `@portfolio/ui`.

- Header in the column: the site's 40px mark with an outline GitHub button at the end, a 20px statement that opens with the `h1` library name, then a large "Read the docs" button.
- **Hero card:** the one card a landing allows, wider than the column (`max-w-breakout`, 816px), showing the library live. A card that nests others keeps its radii concentric (outer radius minus the inset).
- Then the sections, in the column.
- **Rhythm**, as on the Site: 64px at each break of the page (header to hero card, hero card to the first section, the last section to the closing call, the closing call to the footer), 48px between two sections, 16px between a section's title and its content. A section is a sibling in a `gap-12` column with no padding of its own (`Section spacing="none"`), so two sections never stack their 40px into 80px and read further apart than the hero.
- **Product landing** (`apps/carbon`): the same header, with the large button reading "Download Carbon for Mac" and the outline GitHub button pointing at the app's repository, then the film in the hero card, in the appearance that matches the page, with its title cards on the theme's `primary` and `primary-foreground` text so it stands out. It plays only when clicked, muted and once, with a Play/Pause/Replay pill at its bottom-start corner.
  - Four feature sections with anchored `stacked` titles, body prose with key phrases in `foreground`. The file section shows a sample Meeting file in a `CodeBlock` titled with its path; the privacy section links to `/privacy`, whose sections take anchored `stacked` titles too.
  - **FAQ**, the last section: disclosure rows (`details`), the question in `foreground` at 450 with a `+` at the end that turns into `×` when open, the answer in body prose under it, a hairline between rows and none after the last. Every answer is checked against Carbon's sources.
  - **Closing call**, aligned to the start: a 20px line in `foreground`, a sentence in `muted-foreground` 8px under it, the large download button 24px lower, then the install notes and requirements at body size, 24px under the button and 20px apart. Then the docs sites' footer with a Privacy link.
