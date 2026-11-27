"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * A headline that stays on one line from `minWidth` up: it starts at its
 * designed size (and the Studio size setting) and only shrinks if the line
 * would overflow. Below `minWidth` it wraps as normal.
 */
export function FitLine({ children, className = "", minWidth = 768 }: { children: ReactNode; className?: string; minWidth?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = "";
      el.style.whiteSpace = "";
      if (window.innerWidth < minWidth) return;
      el.style.whiteSpace = "nowrap";
      const ratio = el.clientWidth / el.scrollWidth;
      if (ratio < 1) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * ratio * 0.98}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    // watch a box whose size doesn't follow the headline (or it would keep re-fitting itself)
    ro.observe(el.closest("[data-fit-box]") ?? el.parentElement ?? el);
    document.fonts?.ready.then(fit); // the handwriting font may arrive after first paint
    return () => ro.disconnect();
  }, [minWidth]);
  return <h1 ref={ref} className={className}>{children}</h1>;
}
