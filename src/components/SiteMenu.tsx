"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StraplineBanner } from "@/components/StraplineBanner";
import { useBasket } from "@/lib/basket";
import { menuItems } from "@/lib/menu";

/**
 * The site menu, on every screen size: MENU + three lines → honey, grey and
 * black panels sweep across, the links rise in one by one, the app card slides
 * up and the strapline banner lands at the bottom. Closing sweeps it away.
 */
export function SiteMenu() {
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const open = state === "open";
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const close = () => {
    setState((s) => (s === "open" ? "closing" : s));
    setTimeout(() => setState("closed"), 650);
  };

  // no page scrolling under the menu; Escape closes
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
        className="group flex items-center gap-3 py-1 text-xs tracking-[0.22em] uppercase transition-colors hover:text-honey"
        aria-expanded={open}
        aria-label="Open menu"
      >
        Menu <Burger open={false} />
      </button>

      {mounted && state !== "closed" && createPortal(
        <div className={`fixed inset-0 z-[60] ${state === "closing" ? "menu-out" : ""}`} role="dialog" aria-modal="true" aria-label="Menu">
          <style>{`
            @keyframes menu-sweep { from { transform: translateX(101%) } to { transform: translateX(0) } }
            @keyframes menu-away { from { transform: translateX(0) } to { transform: translateX(-101%) } }
            @keyframes menu-rise { from { transform: translateY(110%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
            @keyframes menu-card { from { transform: translateY(40px) rotate(2deg); opacity: 0 } to { transform: none; opacity: 1 } }
            @keyframes menu-drop { 0% { transform: translateY(160%) } 70% { transform: translateY(-8%) } 100% { transform: none } }
            .menu-panel { animation: menu-sweep .75s cubic-bezier(.7,0,.2,1) both }
            .menu-out .menu-panel { animation: menu-away .55s cubic-bezier(.7,0,.2,1) both }
            .menu-out .menu-panel:nth-child(1) { animation-delay: .2s } .menu-out .menu-panel:nth-child(2) { animation-delay: .1s }
            .menu-out .menu-content { opacity: 0; transition: opacity .2s }
            .menu-rise { display: block; animation: menu-rise .7s cubic-bezier(.2,.8,.2,1) both }
            .menu-card { animation: menu-card .8s cubic-bezier(.2,.8,.2,1) .75s both }
            .menu-banner { animation: menu-drop .8s cubic-bezier(.3,1.2,.5,1) 1s both }
          `}</style>
          {/* the sweep: honey, then pink, then the black page settles on top */}
          <div className="menu-panel absolute inset-0 bg-honey" style={{ animationDelay: "0s" }} />
          <div className="menu-panel absolute inset-0 bg-pink" style={{ animationDelay: ".12s" }} />
          <div className="menu-panel absolute inset-0 overflow-hidden bg-black" style={{ animationDelay: ".24s" }}>
            {/* the gallery's honeycomb, softly visible, fading towards the edges */}
            <div className="honeycomb-bg absolute inset-0 opacity-[0.32] [mask-image:radial-gradient(ellipse_at_70%_40%,black_10%,rgb(0_0_0/0.35)_70%,transparent_100%)]" aria-hidden />
          </div>

          <div className="menu-content absolute inset-0 flex flex-col overflow-y-auto px-6 pb-8 text-white md:px-12">
            <div className="flex items-center justify-between border-b border-white/10 py-4">
              <Link href="/" onClick={close} className="font-title text-2xl font-light tracking-tight">Jane <span className="text-honey">Bee</span></Link>
              <button onClick={close} className="flex items-center gap-3 py-1 text-xs tracking-[0.22em] uppercase transition-colors hover:text-honey" aria-label="Close menu">
                Close <Burger open={state === "open"} />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 content-center gap-6 py-6 md:py-10 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-16 lg:gap-24">
              <nav><MenuLinks onPick={close} /></nav>
              <AppCard onPick={close} />
            </div>

            <div className="flex flex-col items-center gap-4 md:gap-5">
              <SmallLinks onPick={close} />
              <div className="overflow-hidden pb-1"><div className="menu-banner"><StraplineBanner /></div></div>
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
      <span className={`absolute top-1/2 left-0 h-[1.5px] bg-honey transition-all duration-300 ${open ? "w-0 opacity-0" : "w-4 group-hover:w-6"}`} />
      <span className={`absolute left-0 h-[1.5px] w-6 bg-current transition-all duration-500 ${open ? "top-1/2 -rotate-45" : "top-full"}`} />
    </span>
  );
}

/** The big numbered links (reads the current page only once the menu is open). */
function MenuLinks({ onPick: close }: { onPick: () => void }) {
  const path = usePathname();
  return (
    <ol className="space-y-0.5 md:space-y-2">
      {[{ href: "/", label: "Home" }, ...menuItems].map((m, i) => {
        const here = m.href === "/" ? path === "/" : path === m.href || path.startsWith(m.href + "/");
        return (
          <li key={m.href} className="overflow-hidden">
            <div className="menu-rise" style={{ animationDelay: `${0.5 + i * 0.06}s` }}>
            <Link href={m.href} onClick={close} className="group flex items-baseline gap-4 py-0.5 md:gap-6">
              <span className="w-7 shrink-0 text-xs text-honey tabular-nums transition-transform duration-500 group-hover:-translate-x-1">{String(i + 1).padStart(2, "0")}</span>
              <span
                className={`font-serif text-[9vw] leading-[1.08] font-light transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-3 group-hover:text-honey group-hover:italic md:text-6xl lg:text-7xl ${here ? "text-honey italic" : ""}`}
              >
                {m.label}
              </span>
              <span className="hidden -translate-x-4 text-2xl text-honey opacity-0 transition-all duration-500 group-hover:translate-x-3 group-hover:opacity-100 md:inline">→</span>
            </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Highlighted: get the members app. */
function AppCard({ onPick: close }: { onPick: () => void }) {
  return (
    <Link href="/signin" onClick={close} className="menu-card group relative block overflow-hidden bg-honey p-5 text-black md:p-10">
      <span className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/30 blur-2xl transition-transform duration-700 group-hover:scale-150" />
      <div className="relative flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase">The Hive app</p>
          <p className="mt-2 font-serif text-3xl leading-[0.95] font-light md:mt-3 md:text-5xl">Download<br />the app</p>
        </div>
        <span className="grid h-16 w-16 shrink-0 place-items-center bg-black transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6 md:h-24 md:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hive-logo.svg" alt="" className="h-11 w-11 md:h-16 md:w-16" />
        </span>
      </div>
      <p className="relative mt-3 max-w-xs text-sm leading-relaxed md:mt-4">New paintings, prints and invitations, before anyone else. Free for members.</p>
      <span className="btn-glass relative mt-4 inline-flex md:mt-6 items-center gap-2 bg-black px-6 py-3 text-sm font-medium tracking-[0.15em] text-white uppercase">
        Get the app <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}

function SmallLinks({ onPick: close }: { onPick: () => void }) {
  const { count } = useBasket();
  return (
    <div className="menu-rise flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs tracking-[0.2em] uppercase" style={{ animationDelay: ".9s" }}>
      {count > 0 && <Link href="/basket" onClick={close} className="link-draw">Basket ({count})</Link>}
    </div>
  );
}
