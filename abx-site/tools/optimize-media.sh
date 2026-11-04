#!/usr/bin/env bash
# Converts client originals into the files the page expects. Needs: ffmpeg, cwebp, avifenc (libavif).
# Usage: tools/optimize-media.sh path/to/originals   (hero.jpg, hero-mobile.jpg, commodities.jpg, forex.jpg, cockpit.jpg, spot.mp4)
set -euo pipefail
SRC=${1:?folder with originals}; OUT="$(dirname "$0")/../assets/img/v2"; MEDIA="$(dirname "$0")/../assets/media"
mkdir -p "$OUT" "$MEDIA"
resize() { ffmpeg -loglevel error -y -i "$1" -vf "scale=$2:-2" -q:v 3 "$3"; }
for name in hero commodities forex cockpit; do
  [ -f "$SRC/$name.jpg" ] || continue
  for w in 960 1600 2400; do
    resize "$SRC/$name.jpg" $w "$OUT/$name-$w.jpg"
    cwebp -quiet -q 78 "$OUT/$name-$w.jpg" -o "$OUT/$name-$w.webp"
    avifenc -q 55 -s 6 "$OUT/$name-$w.jpg" "$OUT/$name-$w.avif" >/dev/null
  done
done
if [ -f "$SRC/hero-mobile.jpg" ]; then
  for w in 750 1200; do resize "$SRC/hero-mobile.jpg" $w "$OUT/hero-mobile-$w.jpg"; cwebp -quiet -q 78 "$OUT/hero-mobile-$w.jpg" -o "$OUT/hero-mobile-$w.webp"; done
fi
if [ -f "$SRC/spot.mp4" ]; then   # 11 MB -> target < 3 MB, muted, 1080p, faststart + poster
  ffmpeg -loglevel error -y -i "$SRC/spot.mp4" -an -vf "scale=-2:1080" -c:v libx264 -crf 28 -preset slow -movflags +faststart "$MEDIA/spot.mp4"
  ffmpeg -loglevel error -y -i "$SRC/spot.mp4" -an -vf "scale=-2:1080" -c:v libvpx-vp9 -crf 38 -b:v 0 "$MEDIA/spot.webm"
  ffmpeg -loglevel error -y -i "$SRC/spot.mp4" -frames:v 1 -q:v 3 "$MEDIA/spot-poster.jpg"
  ls -lh "$MEDIA"
fi
