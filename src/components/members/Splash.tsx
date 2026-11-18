"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BEE_SRC, BeeFlight, type Flight } from "@/components/members/BeeFlight";

const KEY = "hive-splash-seen";
// decided once per page load, so marking it as seen doesn't cut the sequence short
let seenAtLoad: boolean | null = null;
const read = () => {
  if (seenAtLoad === null) {
    try { seenAtLoad = sessionStorage.getItem(KEY) === "1"; } catch { seenAtLoad = true; }
  }
  return seenAtLoad;
};
const reducedMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Where the bee lands: the small bee at the top of the screen ([data-hive-bee]). */
function target(): { x: number; y: number; size: number } | null {
  const el = document.querySelector<HTMLElement>("[data-hive-bee]");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, size: r.width };
}

/**
 * Opening sequence: the bee hovers on black, then flies up to its spot at the
 * top of the screen, leaving a thin white dashed trail that slowly fades while
 * the screen opens up behind it. Plays once per visit; tap to skip.
 */
export function Splash() {
  const seen = useSyncExternalStore(() => () => {}, read, () => true);
  const [phase, setPhase] = useState<"hover" | "fly" | "open" | "done">("hover");
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    if (seen) return;
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    if (reducedMotion()) { setPhase("done"); return; }
    // hover briefly, then fly as soon as the landing spot is on screen (or give up and fly to the top)
    let tries = 0;
    let timer = setTimeout(function look() {
      const t = target();
      if (!t && tries++ < 15) { timer = setTimeout(look, 100); return; }
      const w = innerWidth, h = innerHeight;
      setFlight({
        from: { x: w / 2, y: h * 0.55 },
        to: t ? { x: t.x, y: t.y } : { x: w / 2, y: 34 },
        fromSize: Math.min(140, w * 0.34),
        toSize: t?.size ?? 28,
        swing: Math.min(110, w * 0.22),
        duration: 1400,
        lag: 260,
        fade: 1400,
      });
      setPhase("fly");
    }, 650);
    return () => clearTimeout(timer);
  }, [seen]);

  if (seen || phase === "done") return null;

  return (
    <div onClick={() => setPhase("done")} className={`fixed inset-0 z-[100] cursor-pointer ${phase === "open" ? "pointer-events-none" : ""}`} aria-hidden>
      {/* the black curtain lifts once the bee has landed */}
      <div className="absolute inset-0 bg-black" style={{ transition: "opacity 0.9s ease", opacity: phase === "open" ? 0 : 1 }} />
      {phase === "hover" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={BEE_SRC}
          alt=""
          className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "min(140px, 34vw)", height: "min(140px, 34vw)", animation: "bee-in 0.6s cubic-bezier(0.3,1.5,0.5,1) both, bee-hover 0.9s ease-in-out 0.6s infinite alternate" }}
        />
      )}
      {flight && (
        <BeeFlight flight={flight} className="z-[101]" onLanded={() => setPhase("open")} onDone={() => setPhase("done")} />
      )}
      <style>{`
        @keyframes bee-in { from { opacity: 0; transform: translate(-50%, -30%) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%); } }
        @keyframes bee-hover { from { transform: translate(-50%, -50%) rotate(-3deg); } to { transform: translate(-50%, -56%) rotate(3deg); } }
      `}</style>
    </div>
  );
}
