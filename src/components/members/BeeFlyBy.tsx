"use client";

import { useEffect, useState } from "react";
import { BeeFlight, type Flight } from "@/components/members/BeeFlight";

/** Every now and again the bee drifts across the screen, trailing a fading dashed line. */
export function BeeFlyBy({ first = 5000, min = 18000, max = 34000 }: { first?: number; min?: number; max?: number }) {
  const [flight, setFlight] = useState<{ key: number; f: Flight } | null>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const launch = () => {
      if (document.visibilityState === "visible") {
        const w = innerWidth, h = innerHeight;
        const ltr = Math.random() > 0.5;
        const y1 = h * (0.2 + Math.random() * 0.45), y2 = h * (0.15 + Math.random() * 0.5);
        setFlight({
          key: Date.now(),
          f: {
            from: { x: ltr ? -60 : w + 60, y: y1 },
            to: { x: ltr ? w + 60 : -60, y: y2 },
            fromSize: 34, toSize: 34,
            swing: 60 + Math.random() * 80,
            duration: 3600 + w * 1.5,
            lag: 450, fade: 1600,
            levelOut: false, steady: true,
          },
        });
      }
      timer = setTimeout(launch, min + Math.random() * (max - min));
    };
    timer = setTimeout(launch, first);
    return () => clearTimeout(timer);
  }, [first, min, max]);

  if (!flight) return null;
  return <BeeFlight key={flight.key} flight={flight.f} className="z-20" onDone={() => setFlight(null)} />;
}
