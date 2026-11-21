"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bars, MusicPanel, useMusic } from "@/components/MusicPlayer";
import { tabBar, useTabBarHidden } from "@/lib/tabbar";

const icon = (d: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

const tabs = [
  { href: "/members", label: "Home", icon: icon(<><path d="M12 3l1.8 5.6H19l-4.6 3.3 1.8 5.6L12 14.2 7.8 17.5l1.8-5.6L5 8.6h5.2z" /></>) },
  { href: "/members/gallery", label: "Gallery", icon: icon(<><rect x="3" y="4" width="18" height="16" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></>) },
  { href: "/members/shop", label: "Shop", icon: icon(<><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>) },
  { href: "/members/diary", label: "Diary", icon: icon(<><rect x="4" y="5" width="16" height="15" /><path d="M4 10h16M9 3v4M15 3v4" /><path d="M8 14h3v3H8z" /></>) },
  { href: "/members/journal", label: "Journal", icon: icon(<><path d="M5 4h11l3 3v13H5z" /><path d="M8 10h8M8 14h8M8 18h5" /></>) },
];

const youTab = { href: "/members/account", label: "You", icon: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>) };

const itemCls = (on: boolean) =>
  `group relative flex h-full w-full flex-col items-center justify-center gap-1 text-[9px] tracking-[0.08em] uppercase transition-colors sm:text-[10px] sm:tracking-[0.14em] ${on ? "text-honey" : "text-cream/65 hover:text-cream"}`;

const Indicator = ({ on }: { on: boolean }) => (
  <span className={`absolute top-0 h-0.5 bg-honey transition-all duration-500 ${on ? "w-8 opacity-100" : "w-0 opacity-0"}`} />
);

/**
 * App-style bottom menu: everything stays inside the app. Music lives in the
 * menu, and the whole menu slides away (handle or swipe down) for more screen.
 */
export function TabBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const path = usePathname();
  const hidden = useTabBarHidden();
  const m = useMusic();
  const [musicOpen, setMusicOpen] = useState(false);
  const musicRef = useRef<HTMLLIElement>(null);
  const touchY = useRef<number | null>(null);

  // close the music panel on outside tap, on navigation, and when the menu hides
  useEffect(() => {
    if (!musicOpen) return;
    const onDown = (e: PointerEvent) => { if (musicRef.current && !musicRef.current.contains(e.target as Node)) setMusicOpen(false); };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [musicOpen]);
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) { setLastPath(path); setMusicOpen(false); }

  // the gallery is full-screen with its own single menu (Home leads back here)
  if (path.startsWith("/members/gallery")) return null;

  const active = (href: string) =>
    href === "/members"
      ? path === "/members" || path.startsWith("/members/events")
      : path.startsWith(href) || (href === "/members/shop" && (path.startsWith("/members/basket") || path.startsWith("/members/work")));

  const hide = () => { setMusicOpen(false); tabBar.setHidden(true); };
  const onTouchStart = (e: React.TouchEvent) => { touchY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    if (dy > 40 && !hidden) hide();
    if (dy < -30 && hidden) tabBar.setHidden(false);
  };

  return (
    <nav
      aria-label="App menu"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cream/10 bg-black/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      style={{ transform: hidden ? "translateY(100%)" : "none" }}
    >
      {/* slide handle: sits on the menu's top edge, stays on screen when the menu is away */}
      <button
        onClick={() => (hidden ? tabBar.setHidden(false) : hide())}
        aria-label={hidden ? "Show menu" : "Hide menu"}
        aria-expanded={!hidden}
        className="absolute right-3 bottom-full flex h-7 w-12 items-center justify-center border border-b-0 border-cream/15 bg-black/90 text-cream/80 backdrop-blur-xl transition-[transform,color] duration-500 hover:text-honey"
        style={{ transform: hidden ? "translateY(calc(-1 * env(safe-area-inset-bottom)))" : "none" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
          className={`transition-transform duration-500 ${hidden ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
        {hidden && m.playing && <span className="absolute -top-1 -left-1 h-2 w-2 animate-pulse bg-honey" aria-hidden />}
      </button>

      <ul className="mx-auto flex h-16 max-w-2xl items-stretch justify-around">
        {tabs.map((t) => {
          const on = active(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} tabIndex={hidden ? -1 : undefined} className={itemCls(on)}>
                <Indicator on={on} />
                <span className={`transition-transform duration-300 ${on ? "-translate-y-0.5 scale-110" : "group-hover:-translate-y-0.5"}`}>{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}

        <li className="relative flex-1" ref={musicRef}>
          {musicOpen && (
            <MusicPanel isAdmin={isAdmin} className="fixed right-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 max-w-[calc(100vw-1.5rem)] md:absolute md:right-auto md:bottom-full md:left-1/2 md:mb-3 md:-translate-x-1/2" />
          )}
          <button
            data-plain
            onClick={() => setMusicOpen((o) => !o)}
            tabIndex={hidden ? -1 : undefined}
            aria-label="Music"
            aria-expanded={musicOpen}
            className={itemCls(musicOpen || m.playing)}
          >
            <Indicator on={musicOpen} />
            <span className="grid h-[22px] place-items-center transition-transform duration-300 group-hover:-translate-y-0.5">
              {m.playing ? <Bars className="bg-honey" /> : icon(<><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>)}
            </span>
            Music
          </button>
        </li>

        <li className="flex-1">
          <Link href={youTab.href} tabIndex={hidden ? -1 : undefined} className={itemCls(active(youTab.href))}>
            <Indicator on={active(youTab.href)} />
            <span className={`transition-transform duration-300 ${active(youTab.href) ? "-translate-y-0.5 scale-110" : "group-hover:-translate-y-0.5"}`}>{youTab.icon}</span>
            {youTab.label}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
