/**
 * Vintage botanical illustrations — "wildflower summer", tuned to the paper invite.
 *
 * Hand-drawn SVG primitives composed into a corner spray: a layered red dahlia,
 * pale forget-me-not clusters, buttercups, dusky-pink blossoms, feathery pink
 * sprays and sage foliage. All decorative → callers mark them aria-hidden.
 */

const C = {
  red: "#9E2B22",
  redDeep: "#781E17",
  blue: "#5C77B8",
  blueSoft: "#8FB4DE",
  blueDeep: "#3F578F",
  yellow: "#ECC23F",
  yellowDeep: "#C99A2E",
  pink: "#D49AA0",
  pinkDeep: "#B97B83",
  pinkPale: "#E7C2C6",
  sage: "#88A06A",
  forest: "#46603F",
  ink: "#2A303C",
} as const;

/* ---- flower & foliage primitives (centred on the origin) ---------------- */

/** The signature deep-red bloom — two layered rings of pointed petals. */
function Dahlia({ r = 20 }: { r?: number }) {
  const outer = 12;
  const inner = 9;
  return (
    <g>
      {Array.from({ length: outer }).map((_, i) => (
        <path
          key={`o${i}`}
          transform={`rotate(${(360 / outer) * i})`}
          d={`M0 0 Q ${-r * 0.22} ${-r * 0.6} 0 ${-r} Q ${r * 0.22} ${-r * 0.6} 0 0 Z`}
          fill={C.red}
          stroke={C.redDeep}
          strokeWidth={0.5}
          strokeLinejoin="round"
        />
      ))}
      {Array.from({ length: inner }).map((_, i) => (
        <path
          key={`i${i}`}
          transform={`rotate(${(360 / inner) * i + 20})`}
          d={`M0 0 Q ${-r * 0.16} ${-r * 0.38} 0 ${-r * 0.62} Q ${r * 0.16} ${-r * 0.38} 0 0 Z`}
          fill={C.redDeep}
          strokeWidth={0}
        />
      ))}
      <circle r={r * 0.16} fill={C.ink} opacity={0.85} />
    </g>
  );
}

/** Ragged-petalled cornflower. */
function Cornflower({ r = 15 }: { r?: number }) {
  const petals = 12;
  return (
    <g>
      {Array.from({ length: petals }).map((_, i) => (
        <path
          key={i}
          transform={`rotate(${(360 / petals) * i})`}
          d={`M0 0 L${-r * 0.16} ${-r * 0.55} L${-r * 0.07} ${-r} L0 ${-r * 0.8} L${r * 0.07} ${-r} L${r * 0.16} ${-r * 0.55} Z`}
          fill={C.blue}
          stroke={C.blueDeep}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      ))}
      <circle r={r * 0.27} fill={C.blueDeep} />
    </g>
  );
}

/** A single pale forget-me-not — five round petals, yellow eye. */
function ForgetMeNot({ r = 5 }: { r?: number }) {
  return (
    <g>
      {Array.from({ length: 5 }).map((_, i) => (
        <circle
          key={i}
          transform={`rotate(${72 * i})`}
          cy={-r * 0.62}
          r={r * 0.44}
          fill={C.blueSoft}
          stroke={C.blueDeep}
          strokeWidth={0.3}
        />
      ))}
      <circle r={r * 0.26} fill={C.yellow} />
    </g>
  );
}

/** A loose posy of forget-me-nots. */
function ForgetMeNotCluster() {
  const pos: [number, number][] = [
    [0, 0],
    [10, -6],
    [-9, -5],
    [5, 9],
    [-7, 9],
    [13, 5],
    [-14, 2],
  ];
  return (
    <g>
      {pos.map((p, i) => (
        <g key={i} transform={`translate(${p[0]} ${p[1]})`}>
          <ForgetMeNot r={5} />
        </g>
      ))}
    </g>
  );
}

function Buttercup({ r = 12 }: { r?: number }) {
  return (
    <g>
      {Array.from({ length: 5 }).map((_, i) => (
        <path
          key={i}
          transform={`rotate(${72 * i})`}
          d={`M0 0 C ${-r * 0.78} ${-r * 0.4}, ${-r * 0.5} ${-r * 1.05}, 0 ${-r} C ${r * 0.5} ${-r * 1.05}, ${r * 0.78} ${-r * 0.4}, 0 0 Z`}
          fill={C.yellow}
          stroke={C.yellowDeep}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      ))}
      <circle r={r * 0.24} fill={C.yellowDeep} />
    </g>
  );
}

function Blossom({ r = 11, color = C.pink }: { r?: number; color?: string }) {
  return (
    <g>
      {Array.from({ length: 5 }).map((_, i) => (
        <path
          key={i}
          transform={`rotate(${72 * i + 36})`}
          d={`M0 0 C ${-r * 0.62} ${-r * 0.45}, ${-r * 0.62} ${-r}, 0 ${-r} C ${r * 0.62} ${-r}, ${r * 0.62} ${-r * 0.45}, 0 0 Z`}
          fill={color}
          stroke={C.pinkDeep}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      ))}
      <circle r={r * 0.2} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={0.5} />
    </g>
  );
}

/** Feathery dusky-pink spray (astilbe-like). */
function Feather({ h = 44 }: { h?: number }) {
  const n = 16;
  const dots = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const y = -h * t;
    const spread = (1 - t) * 7;
    const x = (i % 2 ? 1 : -1) * spread * 0.8;
    dots.push(
      <circle key={i} cx={x} cy={y} r={1.6 + (1 - t) * 1.1} fill={C.pinkPale} stroke={C.pinkDeep} strokeWidth={0.3} />
    );
  }
  return (
    <g>
      <path d={`M0 0 Q 2 ${-h * 0.5} 0 ${-h}`} stroke={C.forest} strokeWidth={1} fill="none" />
      {dots}
    </g>
  );
}

function Leaf({ len = 26, w = 9 }: { len?: number; w?: number }) {
  return (
    <g>
      <path
        d={`M0 0 C ${w} ${-len * 0.35}, ${w} ${-len * 0.82}, 0 ${-len} C ${-w} ${-len * 0.82}, ${-w} ${-len * 0.35}, 0 0 Z`}
        fill={C.sage}
        stroke={C.forest}
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
      <path d={`M0 ${-len * 0.06} L0 ${-len * 0.92}`} stroke={C.forest} strokeWidth={0.6} fill="none" />
    </g>
  );
}

function Bud({ color = C.red }: { color?: string }) {
  return (
    <g>
      <path d="M0 -3 C -5 -6, -5 -15, 0 -17 C 5 -15, 5 -6, 0 -3 Z" fill={color} stroke={C.redDeep} strokeWidth={0.5} />
      <path d="M0 1 C -3.5 -2, -3.5 -9, 0 -10 C 3.5 -9, 3.5 -2, 0 1 Z" fill={C.forest} />
    </g>
  );
}

function Stem({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={C.forest} strokeWidth={1.4} strokeLinecap="round" />;
}

/* ---- corner spray ------------------------------------------------------- */

/**
 * A floral spray that hugs the top-left corner and trails down the left edge
 * (echoing the invite's side framing). Flip with CSS (`-scale-x-100`,
 * `-scale-y-100`) to frame the other three corners.
 */
export function CornerCluster({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 360"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {/* stems first, so flowers sit on top */}
      <Stem d="M4 70 Q 60 52 110 70" />
      <Stem d="M64 4 Q 92 70 84 150" />
      <Stem d="M8 12 Q 96 80 150 150" />
      <Stem d="M128 26 Q 188 30 244 16" />
      <Stem d="M26 150 Q 14 240 34 330" />
      <Stem d="M150 150 Q 120 250 60 320" />

      {/* foliage */}
      <g transform="translate(48 64) rotate(-58)"><Leaf len={32} w={11} /></g>
      <g transform="translate(74 44) rotate(28)"><Leaf len={26} w={9} /></g>
      <g transform="translate(120 110) rotate(40)"><Leaf len={34} w={12} /></g>
      <g transform="translate(186 34) rotate(66)"><Leaf len={26} w={9} /></g>
      <g transform="translate(22 240) rotate(-16)"><Leaf len={32} w={11} /></g>
      <g transform="translate(96 250) rotate(20)"><Leaf len={28} w={10} /></g>
      <g transform="translate(58 300) rotate(-30)"><Leaf len={26} w={9} /></g>

      {/* buds */}
      <g transform="translate(244 14) rotate(70)"><Bud color={C.red} /></g>
      <g transform="translate(150 60) rotate(46)"><Bud color={C.pink} /></g>

      {/* feathery pink spray */}
      <g transform="translate(40 80) rotate(-22)"><Feather h={50} /></g>
      <g transform="translate(36 300) rotate(8)"><Feather h={40} /></g>

      {/* flowers — the red dahlia anchors the spray */}
      <g transform="translate(150 150) rotate(4)"><Dahlia r={22} /></g>
      <g transform="translate(60 320)"><Dahlia r={15} /></g>
      <g transform="translate(96 64)"><ForgetMeNotCluster /></g>
      <g transform="translate(36 200)"><ForgetMeNotCluster /></g>
      <g transform="translate(110 70) rotate(-8)"><Buttercup r={13} /></g>
      <g transform="translate(214 18)"><Buttercup r={11} /></g>
      <g transform="translate(84 150)"><Blossom r={12} /></g>
      <g transform="translate(44 44)"><Blossom r={10} color={C.pinkPale} /></g>
      <g transform="translate(244 90)"><Cornflower r={13} /></g>
      <g transform="translate(120 230)"><Buttercup r={9} /></g>
    </svg>
  );
}
