"use client";

import { useEffect, useState } from "react";

const WORD = ["T", "h", "e", " ", "H", "i", "v", "e"];
const HIVE_FROM = 4; // "Hive" is pink

type Phase = "away" | "out" | "in";

/**
 * The app's top-left mark: the live bee logo with "The Hive" beside it.
 * On opening, the bee buzzes in and the letters spill out of it one by one.
 * Every so often the letters swarm back into the bee, it gives a happy buzz,
 * and they fly out again. Tap the bee to make it happen. Still for reduced motion.
 */
export function HiveMark({ size = 34 }: { size?: number }) {
  const [phase, setPhase] = useState<Phase>("away");
  const [buzz, setBuzz] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setPhase("out"), 0);
      return () => clearTimeout(t);
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (ms: number, f: () => void) => timers.push(setTimeout(f, ms));
    later(650, () => setPhase("out")); // after the bee has landed
    const cycle = () => {
      if (document.visibilityState === "visible") {
        setPhase("in");
        later(700, () => setBuzz((b) => b + 1));
        later(1300, () => setPhase("out"));
      }
      later(16000 + Math.random() * 10000, cycle);
    };
    later(9000, cycle);
    return () => timers.forEach(clearTimeout);
  }, []);

  const replay = () => {
    setPhase("in");
    setTimeout(() => setBuzz((b) => b + 1), 600);
    setTimeout(() => setPhase("out"), 1100);
  };

  const out = phase === "out";
  return (
    <span className="hive-mark group inline-flex items-center gap-2.5" onPointerEnter={(e) => e.pointerType === "mouse" && phase === "out" && replay()}>
      <span
        key={buzz}
        className={`relative shrink-0 ${phase === "away" ? "hive-mark-arrive" : buzz ? "hive-mark-buzz" : ""}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo" alt="" width={size} height={size} className="h-full w-full" />
      </span>
      <span className="relative font-hand text-3xl leading-none whitespace-nowrap" aria-label="The Hive">
        {WORD.map((ch, i) => (
          <span
            key={i}
            aria-hidden
            className={`inline-block ${i >= HIVE_FROM ? "text-honey" : ""}`}
            style={{
              transform: out ? "none" : `translateX(calc(${-(i + 1) * 0.5}em - ${size * 0.4}px)) scale(0.1) rotate(${(i % 2 ? 1 : -1) * 40}deg)`,
              opacity: out ? 1 : 0,
              transition: "transform 0.55s cubic-bezier(.2,1.4,.4,1), opacity 0.35s ease",
              transitionDelay: `${(out ? i : WORD.length - i) * 45}ms`,
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}
