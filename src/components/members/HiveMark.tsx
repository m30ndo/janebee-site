"use client";

import { useEffect, useState } from "react";

const WORD = ["T", "h", "e", " ", "H", "i", "v", "e"];
const HIVE_FROM = 4; // "Hive" is pink

/**
 * The app's top-left mark: "The Hive" in Jane's handwriting. On opening, the
 * letters pop in one by one. The line box is tall enough for the script's
 * loops, so nothing gets clipped.
 */
export function HiveMark() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <span className="hive-mark relative inline-block py-1 font-hand text-3xl leading-[1.35] whitespace-nowrap" aria-label="The Hive">
      {WORD.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className={`hive-mark-letter inline-block ${i >= HIVE_FROM ? "text-honey" : ""}`}
          style={{
            transform: shown ? "none" : "translateY(0.35em) rotate(-8deg)",
            opacity: shown ? 1 : 0,
            transition: "transform 0.5s cubic-bezier(.2,1.4,.4,1), opacity 0.3s ease",
            transitionDelay: `${i * 55}ms`,
            whiteSpace: "pre",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
