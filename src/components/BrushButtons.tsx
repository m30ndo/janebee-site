"use client";

import { useEffect } from "react";

/** Must match the selector in globals.css ("brush-stroke buttons"). */
export const BRUSH_SELECTOR =
  '.hive-app :is(a, button)[class~="bg-honey"]:is([class*="px-"], [class~="w-full"]):not([data-plain])';

/** Still hidden behind the page bee's entrance (see <PageBee>)? */
const behindBee = (el: Element) => !!el.closest(".page-reveal:not(.is-shown)");

/**
 * Paints each yellow button's brush stroke the first time it's actually on
 * screen (adds .is-painted): scrolled into view, and after the page bee has
 * flown off. Watches for new buttons as pages change. Renders nothing.
 */
export function BrushButtons() {
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window)) return;
    root.classList.add("brush-js");
    const inView = new Set<Element>();

    const paint = (el: Element) => {
      if (behindBee(el)) return;
      el.classList.add("is-painted");
      inView.delete(el);
      io.unobserve(el);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { inView.add(e.target); paint(e.target); } else inView.delete(e.target);
      }),
      { rootMargin: "0px 0px -6% 0px" },
    );
    const scan = () => {
      document.querySelectorAll(BRUSH_SELECTOR).forEach((el) => {
        const h = el as HTMLElement;
        if (!h.classList.contains("is-painted") && !h.dataset.brushSeen) { h.dataset.brushSeen = "1"; io.observe(h); }
      });
      inView.forEach(paint); // the bee may have just left
    };
    scan();

    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; scan(); });
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => { io.disconnect(); mo.disconnect(); root.classList.remove("brush-js"); };
  }, []);
  return null;
}
