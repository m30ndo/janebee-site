"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * The header is pinned, so its drips would hang over the page forever: they
 * show while you're at the top of the page and fade away once you scroll.
 */
export function DripsAtTop({ children }: { children: ReactNode }) {
  const [top, setTop] = useState(true);
  useEffect(() => {
    const on = () => setTop(window.scrollY < 40);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div className={top ? "drips-on" : "drips-off"}>{children}</div>;
}
