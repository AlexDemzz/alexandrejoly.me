# Carbon film

The 32-second film on the Carbon landing (`apps/carbon`), written in [Remotion](https://www.remotion.dev). It plays like a short demo: title cards between four scenes.

1. A call starts. The menu bar glyph turns into a live mic meter, the "Transcribing" notification shows with Stop, then the call ends. The language menu stays out: Carbon picks the language on its own.
2. The meeting window opens: a Mail-style header (Date, Length, App, Language, then the participants as badges), then the transcript with the speaker's badge and "0:19" above each line.
3. Finder on `~/Carbon/2026`, one Markdown file per meeting; Quick Look opens the one that just ended, frontmatter then a `**Speaker** [0:04]` line per turn, as Carbon 0.5.0 writes it.
4. Copy Path from the meeting's context menu, pasted into an AI agent in a terminal.

The scenes draw Carbon's SwiftUI mock in code, with its sample meetings in `src/data.ts`. Once the real app ships, swap the data for an exported Library or the scenes for screen recordings, then render again.

The window matches macOS 26. `src/ui/symbols.tsx` holds the app's SF Symbols, exported as vectors from SwiftUI's `ImageRenderer` at the size each control draws them. `src/ui/glass.tsx` draws Liquid Glass with values measured from SwiftUI captures in both appearances: a blurred, tinted backdrop, a specular rim and a hairline. Headless Chrome renders it, so `backdrop-filter` and `mask-composite` are safe to use.

## Render

```sh
pnpm --filter carbon-video studio   # preview in the browser
pnpm --filter carbon-video render   # needs ffmpeg and ImageMagick
```

`render` writes both appearances to `apps/carbon/src/media` (`carbon-flow*.mp4`, `-poster.webp`) and the share card to `apps/carbon/public/og.png`. Fonts come from the system, so render on a Mac to get San Francisco.
