"use client";

import { useEffect, useId, useRef } from "react";

export const BEE_SRC = "/brand/hive-logo.svg";

type Pt = { x: number; y: number };

export type Flight = {
  from: Pt;
  to: Pt;
  /** bee size in px at the start and end */
  fromSize: number;
  toSize: number;
  /** how far the curve swings sideways (px) */
  swing?: number;
  duration?: number;
  /** how long the trail takes to fade once the bee lands */
  fade?: number;
  /** linear speed instead of ease in/out */
  steady?: boolean;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * A bee that flies head-first along a curve, a thin white dashed line trailing
 * from its tail; the line then fades away. Purely decorative.
 */
export function BeeFlight({ flight, onLanded, onDone, className = "" }: { flight: Flight; onLanded?: () => void; onDone?: () => void; className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const reveal = useRef<SVGPathElement>(null);
  const bee = useRef<HTMLImageElement>(null);
  const cbs = useRef({ onLanded, onDone });
  useEffect(() => { cbs.current = { onLanded, onDone }; });

  useEffect(() => {
    const { from, to, fromSize, toSize, swing = 90, duration = 1300, fade = 1100, steady = false } = flight;
    const curve = steady ? (t: number) => t : ease;
    const p = path.current!, r = reveal.current!, b = bee.current!, s = svg.current!;
    // S-curve: pull out one way, then back the other, landing straight on target
    const dx = to.x - from.x, dy = to.y - from.y;
    const len0 = Math.hypot(dx, dy) || 1;
    const nx = -dy / len0, ny = dx / len0; // normal
    const c1 = { x: from.x + dx * 0.3 + nx * swing, y: from.y + dy * 0.3 + ny * swing };
    const c2 = { x: from.x + dx * 0.7 - nx * swing, y: from.y + dy * 0.7 - ny * swing };
    const d = `M${from.x} ${from.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`;
    p.setAttribute("d", d);
    r.setAttribute("d", d);
    const total = p.getTotalLength();
    r.style.strokeDasharray = `${total} ${total}`;
    r.style.strokeDashoffset = `${total}`;

    let raf = 0;
    let landed = false;
    const start = performance.now();
    // the bee's head is at the top of the logo, so it always points along the path
    // and the dashed line leaves from its tail
    const place = (t: number) => {
      const e = curve(Math.min(1, Math.max(0, t)));
      const at = p.getPointAtLength(total * e);
      const a = p.getPointAtLength(Math.max(0, total * e - 1));
      const b2 = p.getPointAtLength(Math.min(total, total * e + 1));
      const size = fromSize + (toSize - fromSize) * e;
      const heading = (Math.atan2(b2.y - a.y, b2.x - a.x) * 180) / Math.PI + 90;
      b.style.width = b.style.height = `${size}px`;
      b.style.transform = `translate(${at.x - size / 2}px, ${at.y - size / 2}px) rotate(${heading}deg)`;
      // trail runs up to the bee's tail
      r.style.strokeDashoffset = `${total - Math.max(0, total * e - size * 0.42)}`;
    };
    const frame = (now: number) => {
      const el = now - start;
      place(el / duration);
      if (el >= duration) {
        if (!landed) { landed = true; cbs.current.onLanded?.(); }
        s.style.transition = `opacity ${fade}ms ease`;
        s.style.opacity = "0";
        setTimeout(() => cbs.current.onDone?.(), fade);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    place(0);
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [flight]);

  const id = `trail-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className={`pointer-events-none fixed inset-0 ${className}`} aria-hidden>
      <svg ref={svg} className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <mask id={id} maskUnits="userSpaceOnUse">
            <path ref={reveal} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          </mask>
        </defs>
        <path ref={path} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.2" strokeDasharray="5 7" strokeLinecap="round" mask={`url(#${id})`} />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={bee} src={BEE_SRC} alt="" className="absolute top-0 left-0 will-change-transform" style={{ width: 0, height: 0 }} />
    </div>
  );
}
