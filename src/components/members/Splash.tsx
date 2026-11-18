"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BeeFlight, type Flight } from "@/components/members/BeeFlight";

const KEY = "hive-splash-seen";
// decided once per page load, so marking it as seen doesn't cut the sequence short
let seenAtLoad: boolean | null = null;
const read = () => {
  if (seenAtLoad === null) {
    try { seenAtLoad = sessionStorage.getItem(KEY) === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { seenAtLoad = true; }
  }
  return seenAtLoad;
};

/**
 * Opening sequence: on black, the bee rises from the bottom centre of the
 * screen and flies straight up and out of the top, a thin white dashed line
 * trailing from its tail. Then the screen opens. Once per visit; tap to skip.
 */
export function Splash() {
  const seen = useSyncExternalStore(() => () => {}, read, () => true);
  const [phase, setPhase] = useState<"fly" | "open" | "done">("fly");
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    if (seen) return;
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    const t = setTimeout(() => {
      const w = innerWidth, h = innerHeight;
      const size = Math.min(110, w * 0.28);
      setFlight({
        from: { x: w / 2, y: h + size },
        to: { x: w / 2, y: -size },
        fromSize: size,
        toSize: size,
        swing: 0,
        duration: 1700,
        fade: 1000,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [seen]);

  if (seen || phase === "done") return null;

  return (
    <div onClick={() => setPhase("done")} className={`fixed inset-0 z-[100] cursor-pointer ${phase === "open" ? "pointer-events-none" : ""}`} aria-hidden>
      {/* the black curtain lifts once the bee has gone */}
      <div className="absolute inset-0 bg-black" style={{ transition: "opacity 0.8s ease", opacity: phase === "open" ? 0 : 1 }} />
      {flight && <BeeFlight flight={flight} className="z-[101]" onLanded={() => setPhase("open")} onDone={() => setPhase("done")} />}
    </div>
  );
}
