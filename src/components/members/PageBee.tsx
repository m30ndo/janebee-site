"use client";

import { useEffect, useState } from "react";
import { BeeFlight, type Flight } from "@/components/members/BeeFlight";
import { splashWillPlay } from "@/components/members/Splash";

let firstMount = true;

/**
 * On every page load / screen change, the bee swoops straight up the screen,
 * trail from its tail. `afterSplash`: in the app, sit out the first load because
 * the opening sequence already does this.
 */
export function PageBee({ afterSplash = false }: { afterSplash?: boolean }) {
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    const skip = afterSplash && firstMount && splashWillPlay();
    firstMount = false;
    if (skip || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      const w = innerWidth, h = innerHeight;
      const size = Math.min(72, w * 0.18);
      setFlight({ from: { x: w / 2, y: h + size }, to: { x: w / 2, y: -size }, fromSize: size, toSize: size, swing: 0, duration: 1350, fade: 1000 });
    }, 0);
    return () => clearTimeout(t);
  }, [afterSplash]);

  if (!flight) return null;
  return <BeeFlight flight={flight} className="z-[45]" onDone={() => setFlight(null)} />;
}
