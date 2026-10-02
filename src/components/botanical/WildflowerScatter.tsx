/**
 * Watercolour wildflowers growing in from the edges of the page.
 *
 * Every motif is a cut stem with the bloom at the top, so each one is planted
 * by its **root** on an edge or in a corner and grown inward, flower-first,
 * towards the middle of the screen. Nothing floats: a stem always comes from
 * somewhere off-page, the way a border of real pressed flowers would.
 *
 * The motifs are Katie & Matty's own hand-cut flowers, re-cut at full
 * resolution by `scripts/cut-wildflowers.py` (see that file for how). Eleven of
 * them, each used two or three times at a different length, angle and
 * mirroring — that repetition is what keeps the border from reading as a
 * pattern.
 *
 * ── Editing the layout (EDIT-ME) ──────────────────────────────────────────
 * Positions live in `LAYOUTS` below, grouped by the edge they grow from.
 *
 *   • `x` / `y` / `fromBottom` are the **root** of the stem — the point it
 *     grows out of — not the centre of the picture. Put the root just off the
 *     page (`x: -1`, `y: -1`, `fromBottom: 0`) so the stem enters from
 *     outside rather than starting in mid-air.
 *   • `grow` is the direction it grows, in degrees. Use the `FROM_*` constants
 *     and add a few degrees of lean: `FROM_LEFT + 12`. Every stem should end
 *     up pointing roughly at the middle of the screen.
 *   • `size` is the stem's length, which is also how far it reaches inward —
 *     so it's the number to watch. Side stems can be long (the type column
 *     doesn't start until 28% across); stems rooted on the bottom edge must
 *     stay under ~72px in the middle third, or they reach the Save the Date
 *     button on a short viewport.
 *   • `wideOnly` drops a stem below `sm`, where the type fills the width.
 *
 * ── Mounting it ───────────────────────────────────────────────────────────
 * Drop it as the first child of a `relative` section. It sits at `-z-10`, so
 * it paints *behind* that section's ordinary in-flow content without any of
 * that content needing a `z-index` of its own.
 *
 * It does need *some* ancestor stacking context, or the negative layer escapes
 * to sit behind the body background and disappears. Two ways in:
 *   • The landing page already wraps its sections in `relative z-10`, which is
 *     that context — so `Hero`, `VenueMap` and `UsefulInfo` just need
 *     `relative`. Deliberately *not* `isolate`: making each section its own
 *     context would trap the Add to Calendar dropdown inside the hero.
 *   • `/rsvp` and `/songs` mount the layer at the page root, which carries
 *     `relative isolate` to provide the context itself.
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
 * Add a lean rather than using them bare — `FROM_LEFT + 14` — so the border
 * doesn't look combed.
 */
const FROM_BOTTOM = 0;
const FROM_LEFT = 90;
const FROM_TOP = 180;
const FROM_RIGHT = -90;
const FROM_TOP_LEFT = 135;
const FROM_TOP_RIGHT = -135;
const FROM_BOTTOM_LEFT = 45;
const FROM_BOTTOM_RIGHT = -45;

/**
 * Vertical anchor for the root. `y` is a percentage of the section height —
 * right for stems rooted on the left and right edges, which should spread down
 * the page as it grows.
 *
 * `fromBottom` is px up from the bottom edge, and is what stems rooted along
 * the bottom use. The hero's content is a roughly fixed *pixel* height inside a
 * viewport-height section, so on a short viewport a percentage-placed stem
 * rides up into the Save the Date button. Anchoring to the bottom edge instead
 * keeps that row clear of the type at every viewport height.
 */
type Anchor = { y: number; fromBottom?: never } | { fromBottom: number; y?: never };

type Placement = {
  motif: MotifName;
  /** Horizontal position of the **root**, as a percentage of section width. */
  x: number;
  /**
   * Length of the stem in px at the widest breakpoint, scaled down below `lg`.
   * This is also how far it reaches in from its edge.
   */
  size: number;
  /** Growth direction in degrees — a `FROM_*` constant plus a lean. */
  grow: number;
  /** 0–1. Defaults to 1. */
  opacity?: number;
  /** Mirror the motif, so one cut-out reads as two different stems. */
  flip?: boolean;
  /** Hide below `sm`, where the type column fills the width. */
  wideOnly?: boolean;
} & Anchor;

/**
 * Hero — the fullest border. Read it clockwise from the top-left corner: a
 * sweep of rosemary in the corner, stems down the left edge, along the bottom,
 * back up the right, and a few hanging down from the top.
 */
const hero: Placement[] = [
  // Top-left corner — the fullest cluster, three stems fanning out of the
  // corner at different lengths. Long stems are safe down the sides: the type
  // column doesn't begin until 28% across.
  { motif: "sprig-rosemary", x: 0, y: -1, size: 186, grow: FROM_TOP_LEFT + 4 },
  { motif: "spike-lavender", x: 11, y: -2, size: 99, grow: FROM_TOP - 20, wideOnly: true },
  { motif: "bloom-yellow-small", x: -1, y: 9, size: 83, grow: FROM_LEFT + 32, wideOnly: true },

  // Left edge — sparser between the corners.
  { motif: "sprig-grass", x: -1, y: 24, size: 113, grow: FROM_LEFT + 9 },
  { motif: "bloom-yellow-trio", x: -1, y: 41, size: 132, grow: FROM_LEFT - 13 },
  { motif: "bloom-blue-flax", x: -1, y: 57, size: 87, grow: FROM_LEFT + 17, wideOnly: true },

  // Bottom-left corner.
  { motif: "spray-pink-spidery", x: -1, y: 76, size: 97, grow: FROM_LEFT - 22 },
  { motif: "bloom-yellow-trio", x: 6, fromBottom: -2, size: 118, grow: FROM_BOTTOM_LEFT - 6 },
  { motif: "sprig-grass", x: 19, fromBottom: -2, size: 90, grow: FROM_BOTTOM + 17, wideOnly: true },

  // Bottom edge — these grow *up*, so the middle third stays short or it
  // reaches the Save the Date button when the viewport is shallow.
  { motif: "bloom-yellow-small", x: 32, fromBottom: -2, size: 66, grow: FROM_BOTTOM - 13, wideOnly: true },
  { motif: "spray-pink-spidery", x: 45, fromBottom: -2, size: 70, grow: FROM_BOTTOM + 15 },
  { motif: "spike-lavender", x: 58, fromBottom: -2, size: 64, grow: FROM_BOTTOM - 10 },

  // Bottom-right corner.
  { motif: "bloom-blue-pair", x: 72, fromBottom: -2, size: 80, grow: FROM_BOTTOM + 19, wideOnly: true },
  { motif: "bloom-orange", x: 85, fromBottom: -2, size: 74, grow: FROM_BOTTOM - 16, wideOnly: true },
  { motif: "sprig-rosemary", x: 100, fromBottom: -2, size: 146, grow: FROM_BOTTOM_RIGHT + 5, flip: true },

  // Right edge.
  { motif: "bloom-flax-pale", x: 101, y: 78, size: 90, grow: FROM_RIGHT - 18, wideOnly: true },
  { motif: "bloom-blue-flax", x: 101, y: 60, size: 92, grow: FROM_RIGHT + 13 },
  { motif: "bloom-pink-poppy", x: 101, y: 42, size: 132, grow: FROM_RIGHT - 11 },

  // Top-right corner.
  { motif: "bloom-orange", x: 101, y: 25, size: 92, grow: FROM_RIGHT + 20 },
  { motif: "sprig-grass", x: 101, y: 12, size: 111, grow: FROM_RIGHT - 15, wideOnly: true },
  { motif: "sprig-rosemary", x: 100, y: -1, size: 160, grow: FROM_TOP_RIGHT - 4, flip: true },
  { motif: "bloom-yellow-small", x: 89, y: -2, size: 80, grow: FROM_TOP + 17, wideOnly: true },

  // Top edge — hanging down, so they stay out of x 28–72 where the eyebrow and
  // the names sit.
  { motif: "sprig-grass", x: 77, y: -2, size: 97, grow: FROM_TOP - 14, wideOnly: true },
  { motif: "spray-pink-spidery", x: 23, y: -2, size: 85, grow: FROM_TOP + 11, wideOnly: true },
];
/** The venue — the same border, thinned to the edges and corners only. */
const section: Placement[] = [
  { motif: "sprig-grass", x: 0, y: 10, size: 92, grow: FROM_LEFT + 18 },
  { motif: "bloom-yellow-trio", x: -1, y: 35, size: 92, grow: FROM_LEFT - 12 },
  { motif: "spike-lavender", x: 0, y: 60, size: 68, grow: FROM_LEFT + 10, wideOnly: true },
  { motif: "spray-pink-spidery", x: -1, y: 84, size: 72, grow: FROM_LEFT - 16 },
  { motif: "bloom-yellow-small", x: 13, fromBottom: 0, size: 66, grow: FROM_BOTTOM + 18, wideOnly: true },
  { motif: "sprig-rosemary", x: 99, fromBottom: 0, size: 110, grow: FROM_BOTTOM_RIGHT + 8, flip: true },
  { motif: "bloom-orange", x: 101, y: 78, size: 66, grow: FROM_RIGHT + 14, wideOnly: true },
  { motif: "bloom-pink-poppy", x: 102, y: 52, size: 90, grow: FROM_RIGHT - 10 },
  { motif: "bloom-blue-pair", x: 101, y: 28, size: 72, grow: FROM_RIGHT + 16 },
  { motif: "sprig-rosemary", x: 100, y: 6, size: 100, grow: FROM_TOP_RIGHT - 8, flip: true },
];

/** Long, text-heavy sections and the inner pages — quietest of the three. */
const quiet: Placement[] = [
  { motif: "sprig-grass", x: 0, y: 8, size: 88, grow: FROM_LEFT + 16 },
  { motif: "bloom-yellow-small", x: -1, y: 40, size: 64, grow: FROM_LEFT - 14, wideOnly: true },
  { motif: "spray-pink-spidery", x: 0, y: 74, size: 70, grow: FROM_LEFT + 10 },
  { motif: "bloom-blue-flax", x: 101, y: 14, size: 68, grow: FROM_RIGHT + 14 },
  { motif: "sprig-rosemary", x: 100, y: 48, size: 94, grow: FROM_RIGHT - 12, flip: true },
  { motif: "bloom-orange", x: 101, y: 82, size: 66, grow: FROM_RIGHT + 18, wideOnly: true },
];

const LAYOUTS = { hero, section, quiet } satisfies Record<string, Placement[]>;

export type ScatterVariant = keyof typeof LAYOUTS;

/**
 * The invite's fine confetti of colour flecks — the pressed-seed-paper texture.
 * Generated once at module load from a fixed seed, so the server and the client
 * render byte-identical markup (no hydration mismatch, no `Math.random`).
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

function makeSpecks(count: number, seed: number): Speck[] {
  // A tiny deterministic LCG — enough to look unplanned, stable across renders.
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: Number((next() * 100).toFixed(2)),
    y: Number((next() * 100).toFixed(2)),
    size: Number((2.4 + next() * 3.4).toFixed(2)),
    colour: SPECK_COLOURS[Math.floor(next() * SPECK_COLOURS.length)],
    opacity: Number((0.22 + next() * 0.42).toFixed(2)),
  }));
}

const SPECKS: Record<ScatterVariant, Speck[]> = {
  hero: makeSpecks(58, 20270604),
  section: makeSpecks(30, 481516),
  quiet: makeSpecks(18, 990011),
};

export function WildflowerScatter({
  variant = "hero",
  className = "",
}: {
  variant?: ScatterVariant;
  /** Extra classes on the absolute layer — e.g. to nudge `z-index`. */
  className?: string;
}) {
  const placements = LAYOUTS[variant];
  const eager = variant === "hero";

  return (
    <div
      aria-hidden="true"
      // `--wf` scales the whole border down on narrower screens, so the stems
      // keep their relationship to each other instead of crowding the type.
      // `-z-10` needs an ancestor stacking context — see "Mounting it" above.
      className={`pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden [--wf:0.58] sm:[--wf:0.78] lg:[--wf:1] ${className}`}
    >
      {SPECKS[variant].map((speck, i) => (
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

      {placements.map((p, i) => {
        const [w, h] = MOTIFS[p.motif];
        // `size` is the stem's length, i.e. its longest edge. CSS needs a width.
        const width = (p.size * w) / Math.max(w, h);
        const bottomAnchored = p.fromBottom !== undefined;
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
                ? { bottom: `calc(var(--wf) * ${p.fromBottom}px)` }
                : { top: `${p.y}%` }),
              width: `calc(var(--wf) * ${width.toFixed(1)}px)`,
              opacity: p.opacity ?? 1,
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
