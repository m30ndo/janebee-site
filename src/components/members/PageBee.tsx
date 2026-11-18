"use client";

import { useEffect, useState } from "react";
import { BeeFlight, type Flight } from "@/components/members/BeeFlight";
import { splashWillPlay } from "@/components/members/Splash";

let firstMount = true;

/**
 * On every page load / screen change the bee swoops straight up the screen,
 * trail from its tail, and the page's content appears once it has flown off.
 * (Data keeps loading underneath while it flies, so nothing waits on it.)
 * `afterSplash`: in the app, the first load is handled by the opening sequence.
 */
export function PageBee({ afterSplash = false, children }: { afterSplash?: boolean; children: React.ReactNode }) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const skip = (afterSplash && firstMount && splashWillPlay()) || matchMedia("(prefers-reduced-motion: reduce)").matches;
    firstMount = false;
    const t = setTimeout(() => {
      if (skip) { setShown(true); return; }
      const w = innerWidth, h = innerHeight;
      const size = Math.min(72, w * 0.18);
      setFlight({ from: { x: w / 2, y: h + size }, to: { x: w / 2, y: -size }, fromSize: size, toSize: size, swing: 0, duration: 1350, fade: 1000 });
    }, 0);
    return () => clearTimeout(t);
  }, [afterSplash]);

  return (
    <>
      {flight && <BeeFlight flight={flight} className="z-[45]" onLanded={() => setShown(true)} onDone={() => setFlight(null)} />}
      <div className={`page-reveal ${shown ? "is-shown" : ""}`}>{children}</div>
    </>
  );
}
