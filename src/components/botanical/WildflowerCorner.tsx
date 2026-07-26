/**
 * Watercolour wildflower corner decorations, cut from a licensed Adobe Stock
 * botanical illustration (`imgs/AdobeStock_1554878676.jpeg`). Each stem has had
 * the white paper keyed to transparency with a soft alpha ramp, so the
 * watercolour edges stay feathered and the stems sit on the ivory page rather
 * than in a white box.
 *
 * One stem is mirrored across the four page corners with the same
 * `-scale-x-100` / `-scale-y-100` utilities the previous SVG cluster used.
 * Purely decorative → always aria-hidden and non-interactive.
 */

const stems = {
  /** Blue flax — open five-petalled blooms on a tall green stem. */
  flax: {
    src: "/wildflowers/corner-blue-flax.webp",
    width: 520,
    height: 1300,
  },
  /** Mixed meadow sprig — fine grasses with small yellow and pink flowers. */
  sprig: {
    src: "/wildflowers/corner-meadow-sprig.webp",
    width: 520,
    height: 1325,
  },
} as const;

export function WildflowerCorner({
  stem,
  className = "",
}: {
  stem: keyof typeof stems;
  className?: string;
}) {
  const { src, width, height } = stems[stem];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- decorative, pre-optimised static asset
    <img
      src={src}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={className}
    />
  );
}
