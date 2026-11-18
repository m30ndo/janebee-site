"use client";

import { useEffect, useState } from "react";
import { BeeFlight, type Flight } from "@/components/members/BeeFlight";
import { splashWillPlay } from "@/components/members/Splash";

let firstMount = true;

/** On every screen change in the app, the bee swoops straight up the screen, trail from its tail. */
export function PageBee() {
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    const skip = firstMount && splashWillPlay(); // the opening sequence already does this
    firstMount = false;
    if (skip || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      const w = innerWidth, h = innerHeight;
      const size = Math.min(72, w * 0.18);
      setFlight({ from: { x: w / 2, y: h + size }, to: { x: w / 2, y: -size }, fromSize: size, toSize: size, swing: 0, duration: 950, fade: 800 });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!flight) return null;
  return <BeeFlight flight={flight} className="z-[45]" onDone={() => setFlight(null)} />;
}
