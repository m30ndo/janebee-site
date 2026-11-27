"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_HERO, DEVICES, HEIGHT_MAX, HEIGHT_MIN, heroVars, type Device, type HeroLayout, type HomeHero } from "@/lib/home-hero";

type Box = { l: number; t: number; w: number; h: number };
type Rects = { hero: Box; area: Box; text: Box } | null;
type Drag =
  | { kind: "text"; startX: number; startY: number; left: number; top: number }
  | { kind: "height" }
  | { kind: "focus" }
  | null;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number) => Math.round(n * 10) / 10;
const box = (r: DOMRect): Box => ({ l: r.left, t: r.top, w: r.width, h: r.height });
const same = (a: Rects, b: Rects) => JSON.stringify(a) === JSON.stringify(b);
/** Hide anything pinned over the page (cookie notice, music button) except the header. */
const hideFloating = (d: Document) => d.querySelectorAll<HTMLElement>("body *").forEach((el) => {
  if (el.style.display !== "none" && getComputedStyle(el).position === "fixed" && !el.closest("header")) el.style.display = "none";
});

/**
 * Visual editor for the home page hero. The real home page runs in a frame at
 * the chosen device's width (so what you see is what visitors get), with drag
 * handles drawn over it:
 *  - drag the headline to place it
 *  - drag the bar at the bottom of the photo to set its height
 *  - in Photo focus mode, drag the dot to the part of the photo that must stay in view
 * Changes show live; nothing is public until Save.
 */
export function HeroEditor({ initial, save }: { initial: HomeHero; save: (d: FormData) => Promise<void> }) {
  const [hero, setHero] = useState<HomeHero>(initial);
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<"text" | "focus">("text");
  const [rects, setRects] = useState<Rects>(null);
  const [cw, setCw] = useState(900);
  const [loaded, setLoaded] = useState(false);
  const outer = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const drag = useRef<Drag>(null);
  const dirty = JSON.stringify(hero) !== JSON.stringify(initial);

  const dev = DEVICES.find((d) => d.key === device)!;
  const scale = Math.min(1, cw / dev.width);
  const layout = hero[device];
  const set = useCallback((patch: Partial<HeroLayout>) => setHero((h) => ({ ...h, [device]: { ...h[device], ...patch } })), [device]);

  // available width for the preview
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    if (outer.current) ro.observe(outer.current);
    return () => ro.disconnect();
  }, []);

  const doc = () => frame.current?.contentDocument ?? null;

  // push the current settings into the live page
  useEffect(() => {
    const d = doc();
    const hero_ = d?.querySelector<HTMLElement>("[data-home-hero]");
    if (!hero_) return;
    for (const [k, v] of Object.entries(heroVars(hero))) hero_.style.setProperty(k, v);
  }, [hero, loaded, device]);

  // keep the handles on top of the page's real boxes (and keep late-arriving floating bits, like the cookie notice, out of the way)
  useEffect(() => {
    let raf = 0, n = 0;
    const tick = () => {
      const d = doc();
      if (d && ++n % 30 === 0) hideFloating(d);
      const h = d?.querySelector("[data-home-hero]"), a = d?.querySelector("[data-hero-area]"), t = d?.querySelector("[data-hero-text]");
      const next: Rects = h && a && t ? { hero: box(h.getBoundingClientRect()), area: box(a.getBoundingClientRect()), text: box(t.getBoundingClientRect()) } : null;
      setRects((o) => (same(o, next) ? o : next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // the page in the frame: top of the page, nothing floating over the hero (cookie notice, music button)
  const onLoad = () => {
    const d = doc();
    if (!d) return;
    d.defaultView?.scrollTo(0, 0);
    hideFloating(d);
    setLoaded(true);
  };

  // pointer position inside the frame's page
  const at = (e: React.PointerEvent) => {
    const r = wrap.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  const onMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g || !rects) return;
    const p = at(e);
    if (g.kind === "text") {
      const { area, text } = rects;
      const left = g.left + (p.x - g.startX), top = g.top + (p.y - g.startY);
      const freeX = area.w - text.w, freeY = area.h - text.h;
      set({
        textX: freeX > 0 ? round(clamp(((left - area.l) / freeX) * 100, 0, 100)) : 0,
        textY: freeY > 0 ? round(clamp(((top - area.t) / freeY) * 100, 0, 100)) : 0,
      });
    } else if (g.kind === "height") {
      set({ height: round(clamp(((p.y - rects.hero.t) / dev.height) * 100, HEIGHT_MIN, HEIGHT_MAX)) });
    } else {
      set({
        focusX: round(clamp(((p.x - rects.hero.l) / rects.hero.w) * 100, 0, 100)),
        focusY: round(clamp(((p.y - rects.hero.t) / rects.hero.h) * 100, 0, 100)),
      });
    }
  };
  // one handler for every handle: which one was grabbed comes from its data-handle
  const onDown = (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const kind = e.currentTarget.dataset.handle;
    if (kind === "text" && rects) {
      const p = at(e);
      drag.current = { kind: "text", startX: p.x, startY: p.y, left: rects.text.l, top: rects.text.t };
    } else if (kind === "height") drag.current = { kind: "height" };
    else if (kind === "focus") drag.current = { kind: "focus" };
  };
  const end = () => { drag.current = null; };

  const s = (b: Box) => ({ left: b.l * scale, top: b.t * scale, width: b.w * scale, height: b.h * scale });

  return (
    <div className="space-y-5">
      {/* device and mode */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-full border border-white/15">
          {DEVICES.map((d) => (
            <button key={d.key} type="button" onClick={() => { setDevice(d.key); setLoaded(false); }}
              className={`px-5 py-2 text-sm transition-colors ${device === d.key ? "bg-honey text-black" : "text-white/75 hover:text-white"}`}>
              {d.label} <span className="opacity-60">{d.width}px</span>
            </button>
          ))}
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-white/15">
          <button type="button" onClick={() => setMode("text")} className={`px-4 py-2 text-sm ${mode === "text" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}>Move headline</button>
          <button type="button" onClick={() => setMode("focus")} className={`px-4 py-2 text-sm ${mode === "focus" ? "bg-white text-black" : "text-white/75 hover:text-white"}`}>Photo focus</button>
        </div>
        <span className="text-xs text-white/50">
          {mode === "text" ? "Drag the headline to place it. Drag the pink bar to change the photo's height." : "Drag the dot onto the part of the photo that must stay in view."}
        </span>
      </div>

      {/* the live page with handles over it */}
      <div ref={outer} className="w-full">
      <div ref={wrap} className="relative mx-auto overflow-hidden rounded-xl border border-white/10 bg-black" style={{ width: dev.width * scale, height: dev.height * scale }}>
        <iframe
          key={device}
          ref={frame}
          src="/"
          title="Home page preview"
          onLoad={onLoad}
          className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
          style={{ width: dev.width, height: dev.height, transform: `scale(${scale})` }}
        />
        {!loaded && <div className="absolute inset-0 grid place-items-center text-sm text-white/60">Loading the home page…</div>}
        {rects && loaded && (
          <div className="absolute inset-0 select-none" onPointerMove={onMove} onPointerUp={end} onPointerCancel={end}>
            {/* the photo */}
            <div className="pointer-events-none absolute outline-1 outline-dashed outline-white/40" style={s(rects.hero)} />
            {/* the headline */}
            <div
              data-handle="text"
              onPointerDown={mode === "text" ? onDown : undefined}
              className={`absolute rounded outline-2 ${mode === "text" ? "cursor-grab outline-honey active:cursor-grabbing hover:bg-honey/10" : "pointer-events-none outline-white/20"}`}
              style={s(rects.text)}
              title="Drag to move the headline"
            />
            {/* height bar */}
            <div
              data-handle="height"
              onPointerDown={onDown}
              className="group absolute flex cursor-ns-resize items-center justify-center"
              style={{ left: rects.hero.l * scale, width: rects.hero.w * scale, top: (rects.hero.t + rects.hero.h) * scale - 10, height: 20 }}
              title="Drag to change the photo's height"
            >
              <span className="h-1.5 w-full bg-honey/70 group-hover:bg-honey" />
              <span className="absolute rounded-full bg-honey px-3 py-1 text-[11px] font-semibold text-black tabular-nums">{layout.height}% of the screen</span>
            </div>
            {/* photo focus */}
            {mode === "focus" && (
              <div
                data-handle="focus"
                onPointerDown={onDown}
                className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full border-2 border-white bg-honey shadow-[0_0_0_4px_rgba(0,0,0,0.4)]"
                style={{ left: (rects.hero.l + (rects.hero.w * layout.focusX) / 100) * scale, top: (rects.hero.t + (rects.hero.h * layout.focusY) / 100) * scale }}
                title="Drag to the part of the photo that must stay in view"
              />
            )}
          </div>
        )}
      </div>
      </div>

      {/* exact values for this device */}
      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2 lg:grid-cols-5">
        {([
          ["height", `Photo height (${dev.label})`, HEIGHT_MIN, HEIGHT_MAX, "% of screen"],
          ["textX", "Headline across", 0, 100, "%"],
          ["textY", "Headline down", 0, 100, "%"],
          ["focusX", "Photo focus across", 0, 100, "%"],
          ["focusY", "Photo focus down", 0, 100, "%"],
        ] as const).map(([k, label, lo, hi, unit]) => (
          <label key={k} className="block">
            <span className="flex justify-between text-xs text-white/60"><span>{label}</span><span className="text-white tabular-nums">{layout[k]}{unit === "%" ? "%" : ""}</span></span>
            <input type="range" min={lo} max={hi} step={1} value={layout[k]} onChange={(e) => set({ [k]: Number(e.target.value) })} className="mt-1 w-full accent-honey" />
          </label>
        ))}
      </div>

      <form action={save} className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur">
        <input type="hidden" name="hero" value={JSON.stringify(hero)} />
        <button className="rounded-full bg-honey px-8 py-3 font-medium text-black hover:bg-white disabled:opacity-40" disabled={!dirty}>Save all three</button>
        {device !== "desktop" && (
          <button type="button" onClick={() => set({ ...hero.desktop, height: hero[device].height })} className="text-sm text-white/70 underline underline-offset-4 hover:text-white">
            Copy positions from desktop
          </button>
        )}
        <button type="button" onClick={() => set(DEFAULT_HERO[device])} className="text-sm text-white/70 underline underline-offset-4 hover:text-white">Reset {dev.label.toLowerCase()}</button>
        {dirty && <span className="text-sm text-honey">Unsaved changes</span>}
      </form>
    </div>
  );
}
