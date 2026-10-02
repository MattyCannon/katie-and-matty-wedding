#!/usr/bin/env python3
"""
Build the scattered wildflower motifs used across the site.

    python3 scripts/cut-wildflowers.py

── Where the artwork comes from ───────────────────────────────────────────────
Two local, git-ignored inputs, both derived from the same licensed Adobe Stock
sheet. The licence covers using the artwork in the finished site but not
redistributing the original files, so only the small .webp cut-outs below are
committed.

1. `imgs/AdobeStock_1554878676.jpeg` — the original sheet, six wildflower stems
   on white at 8736x4896. All the *detail* comes from here.
2. `imgs/wildflowers-source/*.png` — Katie & Matty's own hand-cut motifs: one
   flower each, neatly framed on white, with neighbouring stems erased. These
   define *which* flower and *how much of it* each motif is, and they're the
   authority on framing. They're small (30-90px), though, so they can't be used
   directly at retina sizes.

── What the script does ──────────────────────────────────────────────────────
It gets the framing from (2) and the resolution from (1):

  a. Trim each hand-cut PNG to its ink.
  b. Locate it in the full sheet by multi-scale template matching. All eleven
     match at ~0.068 scale, which is how we know they're the same source.
  c. Crop the sheet at full resolution at that location. That rectangle also
     catches whatever neighbouring artwork happened to sit inside it — so
  d. use the hand-cut PNG's own silhouette as a stencil over the full-res crop.
     The result is the hand-cut framing at sheet resolution.
  e. Key the white paper to transparency with a soft alpha ramp, un-blend it so
     pale petals keep their real colour, trim, downscale, save as .webp.

Output: `public/wildflowers/scatter/*.webp`, placed by `WildflowerScatter.tsx`.

Requires: pillow, numpy, opencv-python.
"""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / "imgs" / "AdobeStock_1554878676.jpeg"
HANDCUT = ROOT / "imgs" / "wildflowers-source"
OUT = ROOT / "public" / "wildflowers" / "scatter"

# Longest edge of each exported motif, in px. They render at 20-90 CSS px, so
# this leaves comfortable retina headroom.
TARGET_LONG_EDGE = 300

# Alpha ramp, measured on "distance from white" = 255 - min(R, G, B). Below LO
# is paper (and the sheet's JPEG noise in the white areas) → fully transparent;
# above HI is ink → fully opaque; a linear feather between the two.
ALPHA_LO = 18
ALPHA_HI = 50

# How far outside the matched rectangle the stencil may reach, as a fraction of
# the motif's size. A little slack absorbs the ~1% scale error in the match, so
# a petal on the very edge of the hand-cut PNG doesn't get shaved off.
STENCIL_PAD = 0.04


def ink_distance(rgb: np.ndarray) -> np.ndarray:
    """How far each pixel is from white. Uses the minimum channel, so a pale
    yellow wash (low blue, high red/green) still registers as ink."""
    return 255.0 - rgb.min(axis=2)


def trim_box(mask: np.ndarray, floor: float) -> tuple[int, int, int, int]:
    rows = np.where(mask.max(axis=1) > floor)[0]
    cols = np.where(mask.max(axis=0) > floor)[0]
    return int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1


def locate(sheet_grey: np.ndarray, template: np.ndarray) -> tuple[float, float, int, int]:
    """Find `template` in `sheet_grey`. Returns (score, scale, x, y) in sheet px."""
    SH, SW = sheet_grey.shape
    th, tw = template.shape
    best = (-2.0, 0.0, 0, 0)

    def sweep(scales):
        nonlocal best
        for s in scales:
            w, h = int(SW * s), int(SH * s)
            if w < tw + 4 or h < th + 4:
                continue
            small = cv2.resize(sheet_grey, (w, h), interpolation=cv2.INTER_AREA)
            result = cv2.matchTemplate(small, template, cv2.TM_CCOEFF_NORMED)
            _, score, _, loc = cv2.minMaxLoc(result)
            if score > best[0]:
                best = (float(score), float(s), int(loc[0]), int(loc[1]))

    sweep(np.arange(0.03, 0.20, 0.005))
    sweep(np.arange(max(0.02, best[1] - 0.006), best[1] + 0.006, 0.0008))
    return best


def build(sheet: Image.Image, sheet_grey: np.ndarray, src: Path):
    handcut = Image.open(src).convert("RGB")
    hc = np.asarray(handcut, dtype=np.float32)
    x0, y0, x1, y1 = trim_box(ink_distance(hc), 8)
    handcut = handcut.crop((x0, y0, x1, y1))

    template = cv2.cvtColor(np.asarray(handcut), cv2.COLOR_RGB2GRAY)
    score, scale, mx, my = locate(sheet_grey, template)

    # The matched rectangle in full-sheet pixels, with a little slack.
    tw, th = handcut.size
    bx0, by0 = mx / scale, my / scale
    bw, bh = tw / scale, th / scale
    pad_x, pad_y = bw * STENCIL_PAD, bh * STENCIL_PAD
    box = (
        max(0, round(bx0 - pad_x)),
        max(0, round(by0 - pad_y)),
        min(sheet.width, round(bx0 + bw + pad_x)),
        min(sheet.height, round(by0 + bh + pad_y)),
    )
    crop = sheet.crop(box)

    # The hand-cut silhouette, upscaled to the full-res crop. Anything the
    # couple erased stays erased, however much detail sits there on the sheet.
    # Upscale first, then pad — the slack is measured in sheet pixels, not in
    # the hand-cut PNG's own much smaller coordinate space.
    scaled = handcut.resize((max(1, round(bw)), max(1, round(bh))), Image.LANCZOS)
    stencil = Image.new("RGB", (round(bw + 2 * pad_x), round(bh + 2 * pad_y)), (255, 255, 255))
    stencil.paste(scaled, (round(pad_x), round(pad_y)))
    stencil = stencil.resize(crop.size, Image.LANCZOS)
    stencil_alpha = np.clip(ink_distance(np.asarray(stencil, dtype=np.float32)) / 12.0, 0.0, 1.0)

    # The sheet's own paper key, which is what feathers the watercolour edges.
    rgb = np.asarray(crop, dtype=np.float32)
    paper_alpha = np.clip((ink_distance(rgb) - ALPHA_LO) / (ALPHA_HI - ALPHA_LO), 0.0, 1.0)

    alpha = paper_alpha * stencil_alpha

    # Un-blend the white paper the watercolour was scanned on, so a 40%-opaque
    # petal carries the petal's real colour rather than a washed-out version.
    a = alpha[..., None]
    rgb = np.where(a > 0.25, np.divide(rgb - 255.0 * (1.0 - a), np.maximum(a, 1e-3)), rgb)
    out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255.0]).astype(np.uint8), "RGBA")

    # Trim the transparent margin the slack left behind.
    out = out.crop(trim_box(np.asarray(out)[..., 3].astype(np.float32), 6))

    factor = TARGET_LONG_EDGE / max(out.size)
    if factor < 1:
        out = out.resize(
            (max(1, round(out.width * factor)), max(1, round(out.height * factor))), Image.LANCZOS
        )
    return out, score, scale


def main() -> int:
    missing = [p for p in (SHEET, HANDCUT) if not p.exists()]
    if missing:
        print(
            "error: missing local source artwork —\n  "
            + "\n  ".join(str(p.relative_to(ROOT)) for p in missing)
            + "\nBoth are git-ignored; restore them locally before re-running.",
            file=sys.stderr,
        )
        return 1

    sources = sorted(HANDCUT.glob("*.png"))
    if not sources:
        print(f"error: no PNGs in {HANDCUT.relative_to(ROOT)}", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SHEET).convert("RGB")
    sheet_grey = cv2.cvtColor(np.asarray(sheet), cv2.COLOR_RGB2GRAY)

    rows, weak = [], []
    for src in sources:
        motif, score, scale = build(sheet, sheet_grey, src)
        dest = OUT / f"{src.stem}.webp"
        motif.save(dest, "WEBP", quality=82, method=6)
        rows.append((src.stem, motif.size, dest.stat().st_size, score))
        if score < 0.75:
            weak.append((src.stem, score))

    width = max(len(n) for n, _, _, _ in rows)
    print(f"  {'motif':<{width}}  {'size':>9}  {'file':>9}   match")
    for name, (w, h), size, score in rows:
        print(f"  {name:<{width}}  {w:>4}x{h:<4}  {size / 1024:6.1f} KB   {score:.3f}")
    total = sum(s for _, _, s, _ in rows)
    print(f"\n{len(rows)} motifs → {OUT.relative_to(ROOT)}  ({total / 1024:.0f} KB total)")

    if weak:
        print(
            "\nnote: a weaker template match just means the stencil may sit a pixel or two "
            "off the sheet detail — check these by eye:\n  "
            + "\n  ".join(f"{n} ({s:.3f})" for n, s in weak)
        )

    print("\nMotif keys for WildflowerScatter.tsx:")
    for name, (w, h), _, _ in rows:
        print(f'  "{name}": [{w}, {h}],')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
