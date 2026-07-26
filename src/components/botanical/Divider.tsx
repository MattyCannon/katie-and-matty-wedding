/**
 * Section divider — a single watercolour bloom flanked by sage hairlines.
 *
 * The bloom is cut from the same licensed Adobe Stock illustration as the corner
 * stems (`imgs/AdobeStock_1554878676.jpeg`), with the white paper keyed out so it
 * sits on the ivory page. Kept deliberately small and quiet: the flower scales to
 * the height passed in (`h-7` / `h-8` at the call sites) and the rules fill the
 * remaining width. Decorative only → aria-hidden.
 *
 * Call sites pass the same `h-* w-*` classes the previous SVG divider used, so
 * sizing is unchanged.
 */
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <span className="hairline min-w-0 flex-1" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative, pre-optimised static asset */}
      <img
        src="/wildflowers/divider-bloom.webp"
        width={160}
        height={140}
        alt=""
        draggable={false}
        className="h-full w-auto shrink-0"
      />
      <span className="hairline min-w-0 flex-1" />
    </div>
  );
}
