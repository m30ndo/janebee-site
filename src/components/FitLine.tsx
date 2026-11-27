"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * A headline that stays on one line from `minWidth` up: it starts at its
 * designed size (and the Studio size setting) and only shrinks if the line
 * would overflow. Below `minWidth` it wraps as normal.
 *
 * Belt and braces, because browsers measure differently (Safari on iPad,
 * rotating between portrait and landscape):
 *  - it re-measures after each shrink until the line really fits;
 *  - if it still doesn't fit, it lets the line wrap rather than run off the page;
 *  - it re-fits on resize, on rotation and once the fonts have loaded.
 */
export function FitLine({ children, className = "", minWidth = 768 }: { children: ReactNode; className?: string; minWidth?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const box = (el.closest("[data-fit-box]") as HTMLElement | null) ?? el.parentElement ?? el;
    // what's actually drawn: the words' on-screen width against the box's on-screen width.
    // (Measured this way so browsers that apply the Studio size setting differently — Safari on iPad — can't fool it.)
    const drawn = () => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width; };
    const room = () => box.getBoundingClientRect().width;
    const fit = () => {
      el.style.fontSize = "";
      el.style.whiteSpace = "";
      if (window.innerWidth < minWidth) return;
      el.style.whiteSpace = "nowrap";
      for (let i = 0; i < 6; i++) {
        const w = drawn(), avail = room();
        if (!w || !avail || w <= avail * 0.995) break;
        el.style.fontSize = `${parseFloat(el.style.fontSize || getComputedStyle(el).fontSize) * (avail / w) * 0.98}px`;
      }
      // never off the page: if it still won't fit on one line, wrap instead
      if (drawn() > room() + 1) { el.style.fontSize = ""; el.style.whiteSpace = ""; }
    };
    const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
    fit();
    // watch a box whose size doesn't follow the headline (or it would keep re-fitting itself)
    const ro = new ResizeObserver(later);
    ro.observe(box);
    window.addEventListener("resize", later);
    window.addEventListener("orientationchange", later);
    document.fonts?.ready.then(later); // the handwriting font may arrive after first paint
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", later);
      window.removeEventListener("orientationchange", later);
    };
  }, [minWidth]);
  return <h1 ref={ref} className={className}>{children}</h1>;
}
