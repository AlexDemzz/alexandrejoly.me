#!/usr/bin/env bash
# Renders the landing film into apps/carbon/src/media, once per appearance: a
# muted H.264 MP4 plus the poster (the intro card, before any motion). Then the
# share card into apps/carbon/public/og.png.
set -euo pipefail
cd "$(dirname "$0")/.."

media=../carbon/src/media
mkdir -p out "$media"

# Remotion writes full-range BT.601 YUV with no color tags. Tagged as such,
# Chrome and Safari draw the title cards in exactly the poster's color. VP9 is
# left out: Chrome draws it darker whatever its tags say.
tags=(-color_range pc -colorspace bt470bg -color_primaries bt709 -color_trc iec61966-2-1)

render() {
  local composition=$1 name=$2
  remotion render "$composition" "out/$name.mp4" --muted --crf=12 --concurrency=2 --log=error
  ffmpeg -v error -y -i "out/$name.mp4" -an "${tags[@]}" -c:v libx264 \
    -preset slow -crf 26 -pix_fmt yuvj420p -movflags +faststart "$media/$name.mp4"
  remotion still "$composition" "out/$name-poster.png" --frame=40 --log=error
  magick "out/$name-poster.png" -quality 82 "$media/$name-poster.webp"
}

render CarbonFlow carbon-flow
render CarbonFlowDark carbon-flow-dark
remotion still OgCard ../carbon/public/og.png --log=error

ls -lh "$media"
