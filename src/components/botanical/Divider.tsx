/**
 * A small floral sprig divider — a centred buttercup with leaves and
 * tapering stems, for separating sections. Decorative only.
 */

const C = {
  blue: "#5C77B8",
  blueDeep: "#3F578F",
  yellow: "#ECC23F",
  yellowDeep: "#C99A2E",
  pink: "#D49AA0",
  pinkDeep: "#B97B83",
  sage: "#88A06A",
  forest: "#46603F",
} as const;

export function Divider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 44"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {/* tapering stems out to each side */}
      <path d="M16 22 Q 80 22 116 22" fill="none" stroke={C.forest} strokeWidth={1.2} strokeLinecap="round" />
      <path d="M244 22 Q 180 22 144 22" fill="none" stroke={C.forest} strokeWidth={1.2} strokeLinecap="round" />

      {/* leaves */}
      <g transform="translate(96 22) rotate(-122)">
        <path d="M0 0 C 7 -9, 7 -20, 0 -24 C -7 -20, -7 -9, 0 0 Z" fill={C.sage} stroke={C.forest} strokeWidth={0.5} />
      </g>
      <g transform="translate(164 22) rotate(122)">
        <path d="M0 0 C 7 -9, 7 -20, 0 -24 C -7 -20, -7 -9, 0 0 Z" fill={C.sage} stroke={C.forest} strokeWidth={0.5} />
      </g>

      {/* small side blossoms */}
      <g transform="translate(40 22)">
        {Array.from({ length: 5 }).map((_, i) => (
          <path
            key={i}
            transform={`rotate(${72 * i + 36})`}
            d="M0 0 C -3.7 -2.7, -3.7 -6, 0 -6 C 3.7 -6, 3.7 -2.7, 0 0 Z"
            fill={C.pink}
            stroke={C.pinkDeep}
            strokeWidth={0.4}
          />
        ))}
      </g>
      <g transform="translate(220 22)">
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            transform={`rotate(${30 * i})`}
            d="M0 0 L-1 -4 L0 -7 L1 -4 Z"
            fill={C.blue}
            stroke={C.blueDeep}
            strokeWidth={0.3}
          />
        ))}
        <circle r={1.7} fill={C.blueDeep} />
      </g>

      {/* centre buttercup */}
      <g transform="translate(130 22)">
        {Array.from({ length: 5 }).map((_, i) => (
          <path
            key={i}
            transform={`rotate(${72 * i})`}
            d="M0 0 C -7 -3.6, -4.5 -9.5, 0 -9 C 4.5 -9.5, 7 -3.6, 0 0 Z"
            fill={C.yellow}
            stroke={C.yellowDeep}
            strokeWidth={0.5}
            strokeLinejoin="round"
          />
        ))}
        <circle r={2.3} fill={C.yellowDeep} />
      </g>
    </svg>
  );
}
