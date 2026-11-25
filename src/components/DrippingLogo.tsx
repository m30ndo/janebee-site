import type { CSSProperties } from "react";

/**
 * The Jane Bee wordmark, freshly painted: pink drips run from the low points of
 * the pink, on a clear background, down over whatever sits below. Long drips
 * bead, hang, slip and then run; once full length their bead gathers and lets
 * drops fall off the page. Pure CSS animation (see .jb-drip in globals.css);
 * reduced-motion visitors get the finished drips, still.
 *
 * Coordinates are in the logo's own units (2688 × 989).
 */
const W = 2688, H = 989;

/** Where paint gathers on the bottom of the pink, how far it runs, how thick. */
const DRIPS = [
  { x: 147, y: 874, l: 420, w: 34 },
  { x: 471, y: 839, l: 1350, w: 44 },
  { x: 628, y: 823, l: 210, w: 28 },
  { x: 800, y: 817, l: 760, w: 38 },
  { x: 1143, y: 811, l: 150, w: 26 },
  { x: 1395, y: 776, l: 980, w: 40 },
  { x: 1456, y: 777, l: 300, w: 30 },
  { x: 1706, y: 919, l: 1700, w: 38 }, // the bowl of the b
  { x: 2085, y: 892, l: 860, w: 42 },
  { x: 2146, y: 892, l: 190, w: 26 },
  { x: 2402, y: 874, l: 1150, w: 38 },
];

type Vars = CSSProperties & Record<`--${string}`, string>;
const f1 = (n: number) => n.toFixed(1);

export function DrippingLogo({ className = "" }: { className?: string }) {
  const drips = DRIPS.map((d, i) => {
    const r = d.w / 2, bulbR = r * 1.5, long = d.l > 600;
    const dur = long ? 7 + d.l / 230 : 2.4 + d.l / 260;
    const wait = 0.3 + ((i * 0.37) % 1.6);
    const vars: Vars = { "--d": `${dur.toFixed(2)}s`, "--w": `${wait.toFixed(2)}s`, "--l": `${d.l}px` };
    const period = 4.5 + (i % 3) * 2;
    const drop: Vars = { "--p": `${period}s`, "--pw": `${(dur + wait + 0.4 + (i % 3) * 0.9).toFixed(1)}s` };
    const top = d.y - 18; // starts inside the pink so it joins the letter
    const k = (((i * 7) % 5) - 2) * 0.08; // per-drip wobble
    const lx = (f: number) => f1(d.x - r * f), rx = (f: number) => f1(d.x + r * f), y = (t: number) => f1(top + d.l * t);
    const L = long ? " is-long" : "";
    return {
      key: i,
      lip: `M${f1(d.x - r * 2.6)} ${top} Q${f1(d.x - r * 0.9)} ${top + 4} ${f1(d.x - r)} ${f1(top + r * 1.8)} L${f1(d.x + r)} ${f1(top + r * 1.8)} Q${f1(d.x + r * 0.9)} ${top + 4} ${f1(d.x + r * 2.6)} ${top} Z`,
      body: `M${lx(1.35)} ${top} C${lx(0.95 + k)} ${y(0.14)} ${lx(0.62)} ${y(0.38)} ${lx(0.66 - k)} ${y(0.7)} C${lx(0.72)} ${y(0.86)} ${lx(0.9)} ${y(0.95)} ${lx(0.85)} ${y(1)} L${rx(0.85)} ${y(1)} C${rx(0.9)} ${y(0.95)} ${rx(0.72 + k)} ${y(0.86)} ${rx(0.68)} ${y(0.7)} C${rx(0.6 - k)} ${y(0.4)} ${rx(0.9)} ${y(0.16)} ${rx(1.35)} ${top} Z`,
      d, r, bulbR, long, top, vars, drop, L,
    };
  });

  return (
    <div className={`jb-drip relative ${className}`} role="img" aria-label="Jane Bee">
      {/* the paint: lips, running columns and beads, softened together so they read as one wet shape */}
      <svg className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <defs>
          <filter id="jb-goo" x="-50%" y="-10%" width="200%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </defs>
        <g filter="url(#jb-goo)" fill="#EE3D8C">
          {drips.map((p) => (
            <g key={p.key}>
              <path d={p.lip} />
              <path className={`jb-drip-body${p.L}`} style={p.vars} d={p.body} />
              <g className={`jb-drip-mv${p.L}`} style={p.vars}>
                <ellipse className={`jb-drip-bead${p.long ? " lets-go" : ""}`} style={p.drop} cx={p.d.x} cy={f1(p.top - p.bulbR * 0.15)} rx={f1(p.bulbR)} ry={f1(p.bulbR * 1.18)} />
              </g>
            </g>
          ))}
        </g>
        {/* drops that let go of the long drips and fall off the page (crisp, outside the softening) */}
        <g fill="#EE3D8C">
          {drips.filter((p) => p.long).map((p) => (
            <ellipse key={p.key} className="jb-drip-drop" style={{ ...p.drop, "--fall": "2600px" } as Vars} cx={p.d.x} cy={f1(p.top + p.d.l + p.bulbR * 1.1)} rx={f1(p.r * 0.9)} ry={f1(p.r * 1.15)} />
          ))}
        </g>
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/jane-bee-wordmark.webp" alt="" width={1600} height={589} className="relative block h-auto w-full" fetchPriority="high" />

      {/* wet highlights over the paint: a thin line down each column and a glint on each bead */}
      <svg className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <g fill="#fff" opacity="0.3">
          {drips.map((p) => (
            <g key={p.key}>
              <rect className={`jb-drip-body${p.L}`} style={p.vars} x={f1(p.d.x - p.r * 0.55)} y={f1(p.top + p.r * 2)} width={f1(Math.max(4, p.d.w * 0.13))} height={f1(p.d.l * 0.55)} rx="3" />
              <g className={`jb-drip-mv${p.L}`} style={p.vars}>
                <circle cx={f1(p.d.x - p.bulbR * 0.38)} cy={f1(p.top - p.bulbR * 0.3)} r={f1(p.bulbR * 0.22)} />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
