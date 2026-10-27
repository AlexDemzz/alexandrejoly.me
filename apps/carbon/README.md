# Carbon landing

The landing page of [Carbon](https://carbon.alexandrejoly.me), a macOS menu bar app that transcribes meetings on the Mac. One prerendered page on TanStack Start, deployed as a Cloudflare Worker on every push to `master`.

The page reads as a letter from the author, modeled on the copper page: the hook, the problem, the film, what Carbon is, how it works, why it can be trusted, then the call to action. The app isn't available yet and its repository is private, so that call is to follow the build on X. Every claim comes from Carbon's v1 product design and UI mock. Check them before changing the copy.

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
