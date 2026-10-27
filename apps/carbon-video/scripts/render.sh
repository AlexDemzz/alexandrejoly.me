#!/usr/bin/env bash
# Renders the landing film into apps/carbon/src/media, once per appearance:
# an H.264 MP4 and a VP9 WebM, both muted, plus the poster (the intro card,
# before any motion). Then the share card into apps/carbon/public/og.png.
set -euo pipefail
cd "$(dirname "$0")/.."

media=../carbon/src/media
mkdir -p out "$media"

render() {
  local composition=$1 name=$2
  remotion render "$composition" "out/$name.mp4" --muted --crf=12 --concurrency=2 --log=error
  ffmpeg -v error -y -i "out/$name.mp4" -an -c:v libx264 -preset slow -crf 26 \
    -pix_fmt yuv420p -movflags +faststart "$media/$name.mp4"
  ffmpeg -v error -y -i "out/$name.mp4" -an -c:v libvpx-vp9 -crf 44 -b:v 0 \
    -row-mt 1 -deadline good -cpu-used 2 "$media/$name.webm"
  remotion still "$composition" "out/$name-poster.png" --frame=40 --log=error
  magick "out/$name-poster.png" -quality 82 "$media/$name-poster.webp"
}

render CarbonFlow carbon-flow
render CarbonFlowDark carbon-flow-dark
remotion still OgCard ../carbon/public/og.png --log=error

ls -lh "$media"
