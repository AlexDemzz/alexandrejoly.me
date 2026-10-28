# Carbon landing

The landing page of [Carbon](https://carbon.alexandrejoly.me), a macOS menu bar app that transcribes meetings on the Mac. One prerendered page on TanStack Start, deployed as a Cloudflare Worker on every push to `master`.

The page opens on the same header as the library landings (`apps/responsivecn`, `apps/react-easy-modals`): the mark and a GitHub button, a statement that opens with the `h1`, then the download button. The film follows, then a letter from the author modeled on the copper page: the hook, the problem, how it works, why it can be trusted, then the download again. It's written as if Carbon is out, so it can be shared on release day. Every claim comes from Carbon's v1 spec and UI mock. Check them before changing the copy.

The download button links to `/download` (`DOWNLOAD_URL` in `src/lib/site.ts`). Nothing serves it yet: the release pipeline (DMGs in R2) has to answer that path, or the constant has to point at the DMG.

## Development

From the repository root:

```sh
pnpm install
pnpm --filter carbon dev            # http://localhost:3002
pnpm --filter carbon check-types
pnpm --filter carbon build          # prerenders dist/client/index.html
```

## The film

`src/media/carbon-flow*` (MP4, WebM and poster, light and dark) and `public/og.png` are rendered by `apps/carbon-video`. Don't edit them by hand. Re-render them from there.
