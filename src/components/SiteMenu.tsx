"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Strapline } from "@/components/Strapline";
import { menuItems } from "@/lib/menu";


/**
 * Phone menu: MENU button → honey, grey and black panels sweep across the
 * screen, then the links rise in one by one. Closing sweeps it away.
 */
export function SiteMenu() {
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const open = state === "open";
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const close = () => {
    setState((s) => (s === "open" ? "closing" : s));
    setTimeout(() => setState("closed"), 650);
  };

  // no page scrolling under the menu
  useEffect(() => {
    if (state === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", k); };
  }, [state]);

  return (
    <>
      <button
        onClick={() => (open ? close() : setState("open"))}
        className="flex items-center gap-3 py-1 text-xs tracking-[0.22em] uppercase md:hidden"
        aria-expanded={open}
        aria-label="Open menu"
      >
        Menu <Burger open={false} />
      </button>

      {mounted && state !== "closed" && createPortal(
        <div className={`fixed inset-0 z-[60] md:hidden ${state === "closing" ? "menu-out" : ""}`} role="dialog" aria-label="Menu">
          <style>{`
            @keyframes menu-sweep { from { transform: translateX(101%) } to { transform: translateX(0) } }
            @keyframes menu-away { from { transform: translateX(0) } to { transform: translateX(-101%) } }
            @keyframes menu-rise { from { transform: translateY(110%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
            .menu-panel { animation: menu-sweep .75s cubic-bezier(.7,0,.2,1) both }
            .menu-out .menu-panel { animation: menu-away .55s cubic-bezier(.7,0,.2,1) both }
            .menu-out .menu-panel:nth-child(1) { animation-delay: .2s } .menu-out .menu-panel:nth-child(2) { animation-delay: .1s }
            .menu-out .menu-content { opacity: 0; transition: opacity .2s }
            .menu-rise { display: inline-block; animation: menu-rise .7s cubic-bezier(.2,.8,.2,1) both }
          `}</style>
          {/* the sweep: honey, then grey, then the black page settles on top */}
          <div className="menu-panel absolute inset-0 bg-honey" style={{ animationDelay: "0s" }} />
          <div className="menu-panel absolute inset-0 bg-grey" style={{ animationDelay: ".12s" }} />
          <div className="menu-panel absolute inset-0 bg-black" style={{ animationDelay: ".24s" }} />

          <div className="menu-content absolute inset-0 flex flex-col px-6 pb-10 text-white">
            <div className="flex items-center justify-between py-4">
              <Link href="/" onClick={close} className="font-serif text-2xl font-light">Jane <span className="text-honey">Bee</span></Link>
              <button onClick={close} className="flex items-center gap-3 py-1 text-xs tracking-[0.22em] uppercase" aria-label="Close menu">
                Close <Burger open={state === "open"} />
              </button>
            </div>
            <div className="h-10" />
            <nav className="flex-1">
              <MenuLinks onPick={close} />
            </nav>
            <div className="overflow-hidden">
              <div className="menu-rise w-full" style={{ animationDelay: `${0.6 + menuItems.length * 0.07}s` }}>
                <div className="flex items-center justify-between border-t border-white/15 pt-5 text-sm">
                  <Link href="/basket" onClick={close} className="active:text-honey">Basket</Link>
                  <a href="https://www.instagram.com/janeybee.art/" target="_blank" rel="noopener" className="active:text-honey">Instagram ↗</a>
                  <Link href="/members" onClick={close} className="text-honey">Hive app →</Link>
                </div>
                <Strapline className="mt-6 text-[10px] text-white/60" />
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/** Three lines that fold into a cross. */
function Burger({ open: target }: { open: boolean }) {
  // start un-crossed and fold on the next frame, so the cross animates in
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  return (
    <span className="relative block h-3.5 w-6">
      <span className={`absolute left-0 h-[1.5px] w-6 bg-current transition-all duration-500 ${open ? "top-1/2 rotate-45" : "top-0"}`} />
      <span className={`absolute top-1/2 left-0 h-[1.5px] bg-honey transition-all duration-300 ${open ? "w-0 opacity-0" : "w-4"}`} />
      <span className={`absolute left-0 h-[1.5px] w-6 bg-current transition-all duration-500 ${open ? "top-1/2 -rotate-45" : "top-full"}`} />
    </span>
  );
}

/** The big numbered links (reads the current page only once the menu is open). */
function MenuLinks({ onPick: close }: { onPick: () => void }) {
  const path = usePathname();
  return (
              <ol className="space-y-1">
                {menuItems.map((m, i) => {
                  const here = path === m.href || path.startsWith(m.href + "/");
                  return (
                    <li key={m.href} className="overflow-hidden">
                      <Link
                        href={m.href}
                        onClick={close}
                        className="menu-rise group flex items-baseline gap-4 py-1"
                        style={{ animationDelay: `${0.55 + i * 0.07}s` }}
                      >
                        <span className="w-7 shrink-0 text-xs text-honey tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                        <span className={`font-serif text-[13vw] leading-[1.05] font-light transition-colors group-active:text-honey ${here ? "text-honey italic" : ""}`}>
                          {m.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
  );
}
