"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MusicPanel, useMusic } from "@/components/MusicPlayer";
import { IconBars, IconClose, IconDiary, IconGallery, IconHome, IconJournal, IconMenu, IconNote, IconShop, IconYou, DOCK, DOCK_CLOSE, FLOAT_PILL, FLOAT_ROUND, dockItem } from "@/components/members/icons";
import { tabBar, useTabBarHidden } from "@/lib/tabbar";

const tabs: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/members", label: "Home", icon: <IconHome /> },
  { href: "/members/gallery", label: "Gallery", icon: <IconGallery /> },
  { href: "/members/shop", label: "Shop", icon: <IconShop /> },
  { href: "/members/diary", label: "Diary", icon: <IconDiary /> },
  { href: "/members/journal", label: "Journal", icon: <IconJournal /> },
];

const youTab = { href: "/members/account", label: "You", icon: <IconYou /> };

/**
 * App-style floating menu, the same as the gallery's: everything stays inside
 * the app, music lives in the menu, and ✕ (or a swipe down) tucks it away,
 * leaving just Home and a menu button floating over the screen.
 */
export function TabBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const path = usePathname();
  const hidden = useTabBarHidden();
  const m = useMusic();
  const [musicOpen, setMusicOpen] = useState(false);
  const musicRef = useRef<HTMLDivElement>(null);
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

  const lift = "calc(14px + env(safe-area-inset-bottom))";

  // tucked away: just Home and the menu button float over the screen
  if (hidden) {
    return (
      <>
        <Link href="/members" style={{ bottom: lift }} className={`${FLOAT_PILL} fixed left-4 z-30`}>
          <span className="flex items-center gap-2"><IconHome size={16} />Home</span>
        </Link>
        <button
          data-plain
          onClick={() => tabBar.setHidden(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ bottom: lift }}
          className={`${FLOAT_ROUND} fixed right-4 z-30`}
          aria-label="Open the menu"
          aria-expanded={false}
        >
          {m.playing ? <IconBars /> : <IconMenu />}
        </button>
      </>
    );
  }

  const item = (t: { href: string; label: string; icon: ReactNode }) => {
    const on = active(t.href);
    return (
      <Link key={t.href} href={t.href} className={dockItem(on)} aria-current={on ? "page" : undefined}>
        <span className={`grid h-6 place-items-center transition-transform duration-300 ${on ? "-translate-y-0.5 scale-110" : ""}`}>{t.icon}</span>
        {t.label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="App menu"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ bottom: lift, position: "fixed" }}
      className={`${DOCK} animate-rise mx-auto max-w-2xl`}
    >
      {tabs.map(item)}
      <div className="relative flex min-w-0 flex-1" ref={musicRef}>
        {musicOpen && (
          <MusicPanel isAdmin={isAdmin} className="fixed right-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 max-w-[calc(100vw-1.5rem)] md:absolute md:right-auto md:bottom-full md:left-1/2 md:mb-4 md:-translate-x-1/2" />
        )}
        <button data-plain onClick={() => setMusicOpen((o) => !o)} aria-label="Music" aria-expanded={musicOpen} className={dockItem(musicOpen || m.playing)}>
          <span className="grid h-6 place-items-center">{m.playing ? <IconBars /> : <IconNote />}</span>
          Music
        </button>
      </div>
      {item(youTab)}
      <button data-plain onClick={hide} className={DOCK_CLOSE} aria-label="Tuck the menu away">
        <IconClose />
      </button>
    </nav>
  );
}
