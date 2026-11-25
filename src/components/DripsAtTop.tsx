"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The header wordmark's paint, on a layer at the back of the page: it lines up
 * under the logo in the header (element #jb-wordmark) and runs down behind the
 * page's text and pictures.
 *
 * - Each page gets a fresh coat: rebuilt on every page change, so the drips
 *   start again from the letters.
 * - It belongs to the top of the page: it scrolls away with it, and fades once
 *   you scroll (the header is pinned, the paint isn't).
 * - While it shows, the header bar goes see-through so the paint can be seen
 *   leaving the letters (see .drips-on in globals.css).
 */
export function DripsAtTop({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [top, setTop] = useState(true);
  const [box, setBox] = useState<{ left: number; top: number; width: number } | null>(null);

  useEffect(() => {
    const on = () => setTop(window.scrollY < 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [path]);

  // follow the header logo's position and size (changes at breakpoints)
  useLayoutEffect(() => {
    const logo = document.getElementById("jb-wordmark");
    if (!logo) return;
    const measure = () => {
      const r = logo.getBoundingClientRect();
      setBox({ left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(logo);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [path]);

  return (
    // home: the paint runs over the pictures (hero photo, works carousel); the headline is lifted above it.
    // everywhere else it sits at the back, behind the page's text and pictures.
    <div className={`pointer-events-none absolute inset-x-0 top-0 ${path === "/" ? "z-[5]" : "-z-[1]"} ${top ? "drips-on" : "drips-off"}`} aria-hidden>
      {box && (
        <div key={path} className="absolute" style={{ left: box.left, top: box.top, width: box.width }}>
          {children}
        </div>
      )}
    </div>
  );
}
