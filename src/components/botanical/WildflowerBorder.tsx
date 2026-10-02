/**
 * Watercolour wildflowers growing in from the edges of the WHOLE page.
 *
 * One border per page, not one per section: a fuller cluster across the very top
 * (above the first section), a fuller cluster across the very bottom (below the
 * footer), and a continuous run of stems down both sides in between. Nothing
 * floats and nothing sits between sections.
 *
 * Every motif is a cut stem with the bloom at the top, so each one is planted by
 * its **root** on an edge or in a corner and grown inward, flower-first, towards
 * the middle of the page — the way a border of real pressed flowers would.
 *
 * The motifs are Katie & Matty's own hand-cut flowers, re-cut at full resolution
 * by `scripts/cut-wildflowers.py`. Eleven of them, each reused at a different
 * length, angle and mirroring — that repetition is what keeps the border from
 * reading as a pattern.
 *
 * ── Why the sides are "modules" ───────────────────────────────────────────
 * A page's height isn't known at render time (it changes with the viewport, and
 * with accordion panels opening). So the side stems aren't placed by percentage
 * of page height — that would stretch them apart on a tall page. Instead the
 * side run is a short, hand-arranged **module** (`RAIL_A` / `RAIL_B`) repeated
 * down the page at a fixed pixel pitch, alternating between the two so the
 * rhythm doesn't read as a stamp. Far more modules are rendered than any page
 * needs; the layer clips (`overflow-hidden`) at the page's real height.
 *
 * ── Editing the layout (EDIT-ME) ──────────────────────────────────────────
 *   • `TOP` and `BOTTOM` are the two end clusters; `RAIL_A` / `RAIL_B` are the
 *     side modules.
 *   • `x` is the **root** of the stem as a percentage of page width; put roots
 *     just off the page (`x: -1`, `x: 101`, `top: -2`, `bottom: -2`) so a stem
 *     enters from outside rather than starting in mid-air.
 *   • `top` / `bottom` are the root's distance in px from the top / bottom edge.
 *   • `grow` is the direction it grows, in degrees clockwise from straight up.
 *     Use the `FROM_*` constants plus a few degrees of lean (`FROM_LEFT + 12`) so
 *     the border doesn't look combed.
 *   • `size` is the stem's length in px at the widest breakpoint, which is also
 *     how far it reaches in. Side stems stay under ~115px so they hug the edge;
 *     bottom-edge stems grow *up*, so keep the middle ones short (under ~72px)
 *     or they reach the footer text; top-edge stems hang down, so keep them out
 *     of `x` 28–72 where the hero type sits.
 *   • `wideOnly` drops a stem below `sm`, where the content fills the width.
 *   • `--wf` on the layer scales every length and gap down on narrower screens.
 *
 * ── Mounting it ───────────────────────────────────────────────────────────
 * Render it ONCE per page, as the first child of the page's outermost wrapper.
 * It's `absolute inset-0 -z-10`, so it paints behind the page's in-flow content
 * without that content needing a `z-index`. It needs an ancestor stacking
 * context or the negative layer escapes behind the body background and
 * disappears — the landing page's `relative z-10` wrapper and the `relative
 * isolate` root of `/rsvp` and `/songs` both provide one.
 *
 * Decorative throughout: `aria-hidden`, `pointer-events-none`, empty `alt`.
 */

/**
 * The motifs, with their intrinsic `[width, height]` in px. Used to reserve the
 * right aspect ratio while the image loads, and to turn a placement's `size`
 * (stem length) into a CSS width. Re-run `scripts/cut-wildflowers.py` — it
 * prints this block ready to paste — if the cut-outs ever change.
 */
const MOTIFS = {
  "bloom-blue-flax": [171, 300],
  "bloom-blue-pair": [159, 300],
  "bloom-flax-pale": [158, 300],
  "bloom-orange": [186, 300],
  "bloom-pink-poppy": [100, 300],
  "bloom-yellow-small": [130, 300],
  "bloom-yellow-trio": [233, 300],
  "spike-lavender": [108, 300],
  "spray-pink-spidery": [199, 300],
  "sprig-grass": [120, 300],
  "sprig-rosemary": [193, 300],
} as const;

type MotifName = keyof typeof MOTIFS;

/**
 * Growth directions, in degrees clockwise from "straight up". Named for the
 * edge the stem is rooted on, so `FROM_LEFT` grows rightwards, into the page.
 */
const FROM_BOTTOM = 0;
const FROM_LEFT = 90;
const FROM_TOP = 180;
const FROM_RIGHT = -90;
const FROM_TOP_LEFT = 135;
const FROM_TOP_RIGHT = -135;
const FROM_BOTTOM_LEFT = 45;
const FROM_BOTTOM_RIGHT = -45;

/** Vertical anchor for the root: px from the top edge, or px up from the bottom. */
type Anchor = { top: number; bottom?: never } | { bottom: number; top?: never };

type Placement = {
  motif: MotifName;
  /** Horizontal position of the **root**, as a percentage of page width. */
  x: number;
  /** Stem length in px at the widest breakpoint — also how far it reaches in. */
  size: number;
  /** Growth direction in degrees — a `FROM_*` constant plus a lean. */
  grow: number;
  /** Mirror the motif, so one cut-out reads as two different stems. */
  flip?: boolean;
  /** Hide below `sm`, where the content fills the width. */
  wideOnly?: boolean;
  /**
   * A side-run stem. These are additionally shortened on phones (`--rail`), so
   * they stay out of the text column; the top and bottom clusters are not.
   */
  rail?: boolean;
} & Anchor;

/**
 * Top of the page — the fullest cluster, above the first section. Read it
 * clockwise from the top-left corner: a sweep of rosemary, stems hanging along
 * the top edge (kept out of the central type column), a sweep in the top-right
 * corner, and the first stems of each side run.
 */
const TOP: Placement[] = [
  { motif: "sprig-rosemary", x: 0, top: -1, size: 186, grow: FROM_TOP_LEFT + 4 },
  { motif: "spike-lavender", x: 11, top: -2, size: 99, grow: FROM_TOP - 20, wideOnly: true },
  { motif: "spray-pink-spidery", x: 23, top: -2, size: 85, grow: FROM_TOP + 11, wideOnly: true },
  { motif: "sprig-grass", x: 77, top: -2, size: 97, grow: FROM_TOP - 14, wideOnly: true },
  { motif: "bloom-yellow-small", x: 89, top: -2, size: 80, grow: FROM_TOP + 17, wideOnly: true },
  { motif: "sprig-rosemary", x: 100, top: -1, size: 160, grow: FROM_TOP_RIGHT - 4, flip: true },
  { motif: "bloom-yellow-small", x: -1, top: 82, size: 83, grow: FROM_LEFT + 32, wideOnly: true },
  { motif: "sprig-grass", x: 101, top: 112, size: 111, grow: FROM_RIGHT - 15, wideOnly: true },
];

/**
 * Bottom of the page — the second fullest cluster, beneath the footer. Stems
 * grow *up*, so the middle ones stay short to clear the footer text.
 */
const BOTTOM: Placement[] = [
  { motif: "sprig-rosemary", x: 0, bottom: -2, size: 170, grow: FROM_BOTTOM_LEFT - 4 },
  { motif: "bloom-yellow-trio", x: 9, bottom: -2, size: 118, grow: FROM_BOTTOM_LEFT - 8 },
  { motif: "sprig-grass", x: 19, bottom: -2, size: 90, grow: FROM_BOTTOM + 17, wideOnly: true },
  { motif: "bloom-yellow-small", x: 32, bottom: -2, size: 66, grow: FROM_BOTTOM - 13, wideOnly: true },
  { motif: "spray-pink-spidery", x: 45, bottom: -2, size: 70, grow: FROM_BOTTOM + 15 },
  { motif: "spike-lavender", x: 58, bottom: -2, size: 64, grow: FROM_BOTTOM - 10 },
  { motif: "bloom-blue-pair", x: 72, bottom: -2, size: 80, grow: FROM_BOTTOM + 19, wideOnly: true },
  { motif: "bloom-orange", x: 85, bottom: -2, size: 74, grow: FROM_BOTTOM - 16, wideOnly: true },
  { motif: "sprig-rosemary", x: 100, bottom: -2, size: 156, grow: FROM_BOTTOM_RIGHT + 5, flip: true },
  { motif: "spray-pink-spidery", x: -1, bottom: 112, size: 97, grow: FROM_LEFT - 22 },
  { motif: "bloom-blue-flax", x: 101, bottom: 104, size: 92, grow: FROM_RIGHT + 13 },
];

/** One stem in a side module: which edge, how far down the module, and its lean. */
type RailStem = {
  side: "left" | "right";
  motif: MotifName;
  /** Distance down from the top of the module, in px at the widest breakpoint. */
  y: number;
  size: number;
  /** Degrees of lean added to the edge's base direction. */
  lean: number;
  flip?: boolean;
  wideOnly?: boolean;
};

/** Height of one side module (px at the widest breakpoint). */
const MODULE_H = 760;
/** Where the first module starts — below the top cluster's corner sweeps. */
const RAIL_START = 230;
/**
 * How many modules to render. Deliberately more than any page needs: the layer
 * clips at the page's real height, and images below that never load.
 */
const MODULE_COUNT = 12;

const RAIL_A: RailStem[] = [
  { side: "left", motif: "sprig-grass", y: 40, size: 100, lean: 16 },
  { side: "left", motif: "bloom-yellow-trio", y: 215, size: 105, lean: -12 },
  { side: "left", motif: "bloom-blue-flax", y: 395, size: 84, lean: 18, wideOnly: true },
  { side: "left", motif: "spray-pink-spidery", y: 560, size: 88, lean: -18 },
  { side: "left", motif: "spike-lavender", y: 690, size: 70, lean: 9, wideOnly: true },
  { side: "right", motif: "bloom-orange", y: 110, size: 80, lean: 16 },
  { side: "right", motif: "sprig-rosemary", y: 300, size: 112, lean: -12, flip: true },
  { side: "right", motif: "bloom-pink-poppy", y: 470, size: 105, lean: 10 },
  { side: "right", motif: "bloom-blue-pair", y: 610, size: 82, lean: -16, wideOnly: true },
  { side: "right", motif: "bloom-yellow-small", y: 725, size: 64, lean: 12, wideOnly: true },
];

/** The same flowers, shuffled and swapped between sides, so the run doesn't repeat. */
const RAIL_B: RailStem[] = [
  { side: "left", motif: "bloom-pink-poppy", y: 70, size: 100, lean: -10 },
  { side: "left", motif: "bloom-blue-pair", y: 250, size: 84, lean: 14, wideOnly: true },
  { side: "left", motif: "sprig-rosemary", y: 420, size: 110, lean: 12 },
  { side: "left", motif: "bloom-orange", y: 590, size: 78, lean: -14 },
  { side: "left", motif: "sprig-grass", y: 700, size: 80, lean: 8, wideOnly: true },
  { side: "right", motif: "bloom-yellow-trio", y: 25, size: 102, lean: -14 },
  { side: "right", motif: "spray-pink-spidery", y: 190, size: 86, lean: 17 },
  { side: "right", motif: "bloom-blue-flax", y: 360, size: 88, lean: -12, wideOnly: true },
  { side: "right", motif: "spike-lavender", y: 520, size: 70, lean: 11 },
  { side: "right", motif: "sprig-grass", y: 640, size: 98, lean: -16 },
];

/** Turn the repeated side modules into ordinary placements down the page. */
function buildRails(): Placement[] {
  const out: Placement[] = [];
  for (let m = 0; m < MODULE_COUNT; m++) {
    const stems = m % 2 === 0 ? RAIL_A : RAIL_B;
    const offset = RAIL_START + m * MODULE_H;
    for (const s of stems) {
      out.push({
        motif: s.motif,
        x: s.side === "left" ? -1 : 101,
        top: offset + s.y,
        size: s.size,
        grow: (s.side === "left" ? FROM_LEFT : FROM_RIGHT) + s.lean,
        flip: s.flip,
        wideOnly: s.wideOnly,
        rail: true,
      });
    }
  }
  return out;
}

const PLACEMENTS: Placement[] = [...TOP, ...buildRails(), ...BOTTOM];

/**
 * The invite's fine confetti of colour flecks — the pressed-seed-paper texture.
 * Kept to the border strips (the two sides, the top band and the bottom band) so
 * nothing is scattered through the middle of the page. Generated once at module
 * load from a fixed seed, so the server and the client render byte-identical
 * markup (no hydration mismatch, no `Math.random`).
 */
const SPECK_COLOURS = [
  "#9E2B22", // botanical-red
  "#5C77B8", // cornflower
  "#8FB4DE", // cornflower-soft
  "#ECC23F", // buttercup
  "#D49AA0", // dusky
  "#88A06A", // sage
];

type Speck = { x: number; y: number; size: number; colour: string; opacity: number };

function makeSpecks(seed: number): Speck[] {
  // A tiny deterministic LCG — enough to look unplanned, stable across renders.
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const speck = (x: number, y: number): Speck => ({
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    size: Number((2.4 + next() * 3.4).toFixed(2)),
    colour: SPECK_COLOURS[Math.floor(next() * SPECK_COLOURS.length)],
    opacity: Number((0.22 + next() * 0.42).toFixed(2)),
  });

  const out: Speck[] = [];
  for (let i = 0; i < 34; i++) out.push(speck(next() * 9, next() * 100)); // left strip
  for (let i = 0; i < 34; i++) out.push(speck(91 + next() * 9, next() * 100)); // right strip
  for (let i = 0; i < 14; i++) out.push(speck(next() * 100, next() * 3)); // top band
  for (let i = 0; i < 14; i++) out.push(speck(next() * 100, 97 + next() * 3)); // bottom band
  return out;
}

const SPECKS = makeSpecks(20270604);

export function WildflowerBorder({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      // `--wf` scales the whole border down on narrower screens, so the stems
      // keep their relationship to each other instead of crowding the content.
      // `-z-10` needs an ancestor stacking context — see "Mounting it" above.
      // `--rail` further shortens the side-run stems below `lg` (0.55 on phones,
      // 0.7 on tablets, 1 from `lg`), so they stay out of the text column: on a
      // tablet the text spans nearly the full width, so full-size stems would sit
      // on top of it. See `Placement.rail`.
      className={`pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden [--wf:0.58] [--rail:0.55] sm:[--wf:0.78] sm:[--rail:0.7] lg:[--wf:1] lg:[--rail:1] ${className}`}
    >
      {SPECKS.map((speck, i) => (
        <span
          key={`speck-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${speck.x}%`,
            top: `${speck.y}%`,
            width: `calc(var(--wf) * ${speck.size}px)`,
            height: `calc(var(--wf) * ${speck.size}px)`,
            backgroundColor: speck.colour,
            opacity: speck.opacity,
          }}
        />
      ))}

      {PLACEMENTS.map((p, i) => {
        const [w, h] = MOTIFS[p.motif];
        // `size` is the stem's length, i.e. its longest edge. CSS needs a width.
        const width = (p.size * w) / Math.max(w, h);
        const bottomAnchored = p.bottom !== undefined;
        // The first screen of stems (the top cluster and the first side stems)
        // is on show immediately; everything further down can wait.
        const eager = p.top !== undefined && p.top < 460;
        return (
          // eslint-disable-next-line @next/next/no-img-element -- decorative, pre-sized static asset
          <img
            key={`${p.motif}-${i}`}
            src={`/wildflowers/scatter/${p.motif}.webp`}
            width={w}
            height={h}
            alt=""
            draggable={false}
            decoding="async"
            loading={eager ? "eager" : "lazy"}
            // Decoration must never outrank the fonts and the map.
            fetchPriority="low"
            className={`absolute h-auto max-w-none ${p.wideOnly ? "hidden sm:block" : ""}`}
            style={{
              left: `${p.x}%`,
              ...(bottomAnchored
                ? { bottom: `calc(var(--wf) * ${p.bottom}px)` }
                : { top: `calc(var(--wf) * ${p.top}px)` }),
              width: p.rail
                ? `calc(var(--wf) * var(--rail) * ${width.toFixed(1)}px)`
                : `calc(var(--wf) * ${width.toFixed(1)}px)`,
              // Pivot about the foot of the stem (bottom-centre of the picture),
              // and shift the picture so that foot lands exactly on the anchor
              // point. The stem then swings out from its root like a real one,
              // instead of orbiting the middle of its own bounding box.
              transformOrigin: "50% 100%",
              transform: `translate(-50%, ${bottomAnchored ? "0" : "-100%"}) rotate(${
                p.grow
              }deg)${p.flip ? " scaleX(-1)" : ""}`,
            }}
          />
        );
      })}
    </div>
  );
}
