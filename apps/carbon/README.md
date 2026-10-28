# Carbon landing

The landing page of [Carbon](https://carbon.alexandrejoly.me), a macOS menu bar app that transcribes meetings on the Mac. One prerendered page on TanStack Start, deployed as a Cloudflare Worker on every push to `master`.

The page reads as a letter from the author, modeled on the copper page: the hook, the problem, the film, what Carbon is, how it works, why it can be trusted, then the download. It's written as if Carbon is out, so it can be shared on release day. Every claim comes from Carbon's v1 product design and UI mock. Check them before changing the copy.

The download button links to `/download` (`DOWNLOAD_URL` in `src/lib/site.ts`).

## Releases

The Worker also serves Carbon's releases from the private R2 bucket `carbon-releases` (binding `RELEASES`). `src/server.ts` answers these routes ahead of the site (`src/lib/releases.ts`):

- `GET /download`: 302 to `/releases/<file>` from `latest.json`, `no-store`. 404 until the first release.
- `GET /appcast.xml`: Sparkle's feed, `application/rss+xml`, `max-age=300`.
- `GET /releases/<name>.dmg`: the DMG streamed as an immutable attachment, `Range` supported, 404 for unknown names.

The release Action in the Carbon repository uploads the DMG, then `appcast.xml`, then `latest.json`. A release never redeploys this Worker. Create the bucket once with `pnpm exec wrangler r2 bucket create carbon-releases`.

## Development

From the repository root:

```sh
pnpm install
pnpm --filter carbon dev            # http://localhost:3002
pnpm --filter carbon check-types
pnpm --filter carbon test           # release routes against a local R2
pnpm --filter carbon build          # prerenders dist/client/index.html
```

## The film

`src/media/carbon-flow*` (MP4, WebM and poster, light and dark) and `public/og.png` are rendered by `apps/carbon-video`. Don't edit them by hand. Re-render them from there.
