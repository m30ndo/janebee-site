"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The header is pinned, so its drips would hang over the page forever: they
 * show while you're at the top of the page and fade away once you scroll.
 * Each page gets a fresh coat: the logo is rebuilt on every page change, so
 * the drips start again from the letters.
 */
export function DripsAtTop({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [top, setTop] = useState(true);
  useEffect(() => {
    const on = () => setTop(window.scrollY < 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [path]);
  return <div key={path} className={top ? "drips-on" : "drips-off"}>{children}</div>;
}
