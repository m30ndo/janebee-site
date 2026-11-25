"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CARD_SIZES, type Card, type ShopCarouselSettings } from "@/lib/shop-carousel";

/**
 * Arcwave-style 3D carousel: cards stand on a cylinder (curving towards you or
 * away), turn on their own (glide or step), drag with momentum, scroll with a
 * trackpad, loop forever and link through. Side cards fade, darken or blur.
 *
 * Only the cards inside the visible arc are in the page; their positions are
 * written straight to the DOM each frame, so React only re-renders when a card
 * enters or leaves the arc.
 */
export function ArcCarousel({ cards, settings: st }: { cards: Card[]; settings: ShopCarouselSettings }) {
  const wrap = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<number, HTMLElement>());
  const [vw, setVw] = useState(1200);
  const canHover = useMedia("(hover: hover)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);

  useEffect(() => {
    // the observer reports the first size straight away, then every change
    const ro = new ResizeObserver(([e]) => setVw(e.contentRect.width || window.innerWidth));
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  // geometry
  const g = useMemo(() => {
    const base = CARD_SIZES.find((c) => c.key === st.cardSize)?.w ?? 280;
    const W = Math.round(Math.min(base, vw * 0.62));
    const H = Math.round(W * 4 / 3);
    const gap = W * 0.08;
    const R = W * (16 / st.bend); // bend 1 ≈ flat, 10 = tight
    const step = (2 * Math.asin(Math.min(0.95, (W + gap) / (2 * R))) * 180) / Math.PI;
    const towards = st.curve === "towards";
    // show cards out to the edges of the strip (capped so a tight inward curve never passes the camera)
    const reach = vw / 2 + W;
    const maxA = Math.min(towards ? 68 : 85, (Math.asin(Math.min(1, reach / R)) * 180) / Math.PI);
    const half = Math.max(2, Math.ceil(maxA / step) + 1);
    const zMax = towards ? R * (1 - Math.cos((maxA * Math.PI) / 180)) : 0;
    const perspective = Math.max(1200, zMax + 1000);
    return { W, H, gap, R, step, towards, maxA, half, perspective };
  }, [st.cardSize, st.bend, st.curve, vw]);

  // motion state lives in refs; `first` (the leftmost virtual card) drives rendering
  const m = useRef({ rot: 0, vel: 0, target: null as number | null, clock: 0, dragging: false, moved: 0, lastX: 0, lastT: 0, hover: false, visible: true });
  const [first, setFirst] = useState(-g.half);
  const [front, setFront] = useState(0);
  const n = cards.length;
  const dir = st.direction === "left" ? -1 : 1;

  const place = useCallback(() => {
    const { rot } = m.current;
    const centre = Math.round(-rot / g.step);
    const f = centre - g.half;
    setFirst((o) => (o === f ? o : f));
    setFront((o) => (o === centre ? o : centre));
    els.current.forEach((el, vi) => {
      const a = vi * g.step + rot;
      const t = Math.min(1, Math.abs(a) / g.maxA);
      if (Math.abs(a) > g.maxA + g.step) { el.style.visibility = "hidden"; return; }
      const rad = (a * Math.PI) / 180;
      const x = g.R * Math.sin(rad);
      const z = g.towards ? g.R * (1 - Math.cos(rad)) : g.R * (Math.cos(rad) - 1);
      const ry = g.towards ? -a : a;
      el.style.visibility = "visible";
      el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
      el.style.zIndex = String(1000 - Math.round(Math.abs(a) * 10));
      el.style.opacity = st.sides === "fade" ? String(1 - 0.7 * t * t) : "1";
      el.style.filter = st.sides === "darken" ? `brightness(${(1 - 0.65 * t).toFixed(3)})` : st.sides === "blur" ? `blur(${(t * 5).toFixed(2)}px)` : "";
    });
  }, [g, st.sides]);

  // the loop
  useEffect(() => {
    let raf = 0, last = performance.now();
    const auto = !reduced && st.autoplay !== "off";
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = m.current;
      const paused = s.dragging || !s.visible || (st.pauseOnHover && s.hover) || document.hidden;
      if (!s.dragging) {
        if (Math.abs(s.vel) > 0.5) {
          // momentum after a drag or flick
          s.rot += s.vel * dt;
          s.vel *= Math.exp(-3.2 * dt);
          s.clock = 0;
          if (Math.abs(s.vel) <= 0.5) { s.vel = 0; if (st.autoplay !== "continuous") s.target = Math.round(s.rot / g.step) * g.step; }
        } else if (s.target != null) {
          // ease onto a card (spring-ish)
          const d = s.target - s.rot;
          s.rot += d * Math.min(1, dt * 7);
          if (Math.abs(d) < 0.01) { s.rot = s.target; s.target = null; }
        } else if (auto && !paused) {
          if (st.autoplay === "continuous") s.rot += (dir * g.step * dt) / st.speed;
          else {
            s.clock += dt;
            if (s.clock >= st.speed) { s.clock = 0; s.target = Math.round(s.rot / g.step) * g.step + dir * g.step; }
          }
        }
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [place, reduced, st.autoplay, st.speed, st.pauseOnHover, dir, g.step]);

  // only run while on screen
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { m.current.visible = e.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // trackpad sideways swipe (and shift + wheel) turns it; plain vertical scrolling still scrolls the page
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      const s = m.current;
      s.target = null;
      s.rot -= dx * (g.step / (g.W + g.gap));
      s.vel = 0;
      s.clock = 0;
      clearTimeout((s as unknown as { wt: number }).wt);
      (s as unknown as { wt: number }).wt = window.setTimeout(() => { if (st.autoplay !== "continuous") s.target = Math.round(s.rot / g.step) * g.step; }, 160);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [g, st.autoplay]);

  const perPx = g.step / (g.W + g.gap);
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const s = m.current;
    s.dragging = true; s.moved = 0; s.lastX = e.clientX; s.lastT = performance.now(); s.vel = 0; s.target = null; s.clock = 0;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = m.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const now = performance.now();
    s.moved += Math.abs(dx);
    if (s.moved > 6 && !wrap.current?.hasPointerCapture(e.pointerId)) wrap.current?.setPointerCapture(e.pointerId);
    s.rot += dx * perPx;
    const dtm = Math.max(1, now - s.lastT);
    s.vel = 0.8 * s.vel + 0.2 * ((dx * perPx) / dtm) * 1000; // deg/s, smoothed
    s.lastX = e.clientX; s.lastT = now;
  };
  const onUp = (e: React.PointerEvent) => {
    const s = m.current;
    if (!s.dragging) return;
    s.dragging = false;
    if (wrap.current?.hasPointerCapture(e.pointerId)) wrap.current.releasePointerCapture(e.pointerId);
    if (performance.now() - s.lastT > 80) s.vel = 0; // held still before letting go
    if (Math.abs(s.vel) <= 0.5 && st.autoplay !== "continuous") s.target = Math.round(s.rot / g.step) * g.step;
  };
  const nudge = (d: 1 | -1) => {
    const s = m.current;
    s.vel = 0; s.clock = 0;
    s.target = Math.round((s.target ?? s.rot) / g.step) * g.step - d * g.step;
  };

  if (!n) return null;
  const caption = st.captions;
  const slots = Array.from({ length: g.half * 2 + 1 }, (_, j) => first + j);
  const stageH = Math.round(g.H * (g.towards ? 1.18 : 1.04));

  return (
    <div
      className="relative select-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured works"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "ArrowRight") nudge(1); if (e.key === "ArrowLeft") nudge(-1); }}
    >
      <div
        ref={wrap}
        className="relative cursor-grab overflow-hidden active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,black_9%,black_91%,transparent)]"
        style={{ height: stageH, perspective: g.perspective, touchAction: "pan-y" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => { m.current.hover = true; }}
        onPointerLeave={(e) => { m.current.hover = false; onUp(e); }}
        onClickCapture={(e) => { if (m.current.moved > 6) { e.preventDefault(); e.stopPropagation(); } }}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {slots.map((vi) => {
            const c = cards[((vi % n) + n) % n];
            const showCap = caption === "always" || (caption === "hover" && !canHover && vi === front);
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.title} draggable={false} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                {c.badge && <span className="absolute top-3 left-3 bg-black px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-honey uppercase">{c.badge}</span>}
                {caption !== "never" && (c.title || c.description) && (
                  <span
                    className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-14 pb-4 text-left transition-all duration-500 ${
                      showCap ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    }`}
                  >
                    {c.title && <span className="block font-h2 text-xl leading-tight text-white">{c.title}</span>}
                    {c.description && <span className="mt-1 block text-xs text-white/75">{c.description}</span>}
                  </span>
                )}
              </>
            );
            const cls = "group absolute top-1/2 left-1/2 block overflow-hidden bg-white/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] will-change-transform [backface-visibility:hidden]";
            const style = { width: g.W, height: g.H, visibility: "hidden" as const };
            const ref = (el: HTMLElement | null) => { if (el) els.current.set(vi, el); else els.current.delete(vi); };
            if (!c.href) return <div key={vi} ref={ref} className={cls} style={style}>{inner}</div>;
            return c.external
              ? <a key={vi} ref={ref} href={c.href} target="_blank" rel="noopener noreferrer" className={cls} style={style} draggable={false}>{inner}</a>
              : <Link key={vi} ref={ref} href={c.href} className={cls} style={style} draggable={false}>{inner}</Link>;
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button data-plain onClick={() => nudge(-1)} aria-label="Previous" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-lg transition-colors hover:border-honey hover:text-honey">‹</button>
        <span className="min-w-16 text-center text-[10px] tracking-[0.25em] text-white/50 uppercase tabular-nums">
          {String((((front % n) + n) % n) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button data-plain onClick={() => nudge(1)} aria-label="Next" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-lg transition-colors hover:border-honey hover:text-honey">›</button>
      </div>
    </div>
  );
}

function useMedia(q: string, server: boolean) {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(q).matches,
    () => server,
  );
}
