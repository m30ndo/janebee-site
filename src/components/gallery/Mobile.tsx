"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import type { Painting, Room } from "@/lib/painting";
import { MusicPanel } from "@/components/MusicPlayer";
import { music } from "@/lib/music";
import { sfx } from "@/lib/sound";

/* ------------------------------------------------------------------ phone detection */

const QUERY = "(max-width: 767px), (pointer: coarse) and (max-width: 1100px)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
/** True on phones (and small touch tablets): the gallery switches to its guided, dock-based mode. */
export function useIsPhone() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

/* ------------------------------------------------------------------ dock */

export type Sheet = "rooms" | "style" | "music" | "info" | null;

export function MobileDock({ bottom, open, onOpen, homeHref }: { bottom: number; open: Sheet; onOpen: (s: Sheet) => void; homeHref: string }) {
  const playing = useSyncExternalStore(music.subscribe, () => music.get().playing, () => false);
  const item = (key: Exclude<Sheet, null>, label: string, icon: ReactNode) => (
    <button
      onClick={() => { sfx.play("click"); onOpen(open === key ? null : key); }}
      className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] tracking-[0.14em] uppercase transition ${open === key ? "text-honey" : "text-white/75 active:text-honey"}`}
      aria-expanded={open === key}
    >
      <span className="grid h-6 place-items-center">{icon}</span>
      {label}
    </button>
  );
  return (
    <nav
      style={{ bottom: bottom + 10 }}
      className="absolute inset-x-3 z-20 flex items-stretch rounded-2xl border border-white/10 bg-black/80 px-1 pb-[max(0px,env(safe-area-inset-bottom)-10px)] backdrop-blur-xl"
      aria-label="Gallery menu"
    >
      <Link href={homeHref} className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] tracking-[0.14em] text-white/75 uppercase active:text-honey">
        <span className="grid h-6 place-items-center"><IconHome /></span>Home
      </Link>
      {item("rooms", "Rooms", <IconRooms />)}
      {item("style", "Style", <IconStyle />)}
      {item("music", "Music", playing ? <IconBars /> : <IconNote />)}
      {item("info", "Help", <IconInfo />)}
    </nav>
  );
}

/* ------------------------------------------------------------------ bottom sheet */

export function BottomSheet({ title, bottom, onClose, children }: { title: string; bottom: number; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 z-20 bg-black/40" />
      <section
        role="dialog"
        aria-label={title}
        style={{ bottom: bottom + 82 }}
        className="animate-panel absolute inset-x-3 z-30 max-h-[64dvh] overflow-hidden rounded-3xl border border-white/10 bg-black/95 text-white shadow-2xl backdrop-blur-xl"
      >
        <header className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-[11px] tracking-[0.22em] text-honey uppercase">{title}</h2>
          <button onClick={onClose} className="rounded-full border border-white/20 px-3 py-1 text-xs">Close ✕</button>
        </header>
        <div className="max-h-[calc(64dvh-3.5rem)] overflow-y-auto px-3 pb-4">{children}</div>
      </section>
    </>
  );
}

export function RoomsList({ rooms, current, onPick }: { rooms: Room[]; current: number; onPick: (i: number) => void }) {
  return (
    <ul className="space-y-2">
      {rooms.map((r, i) => {
        const cover = r.paintings.find((p) => p.image)?.image;
        return (
          <li key={r.id}>
            <button
              onClick={() => onPick(i)}
              className={`flex w-full items-center gap-4 rounded-2xl p-2 text-left transition ${i === current ? "bg-white/[0.08] ring-1 ring-honey/60" : "active:bg-white/[0.06]"}`}
            >
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate font-serif text-xl ${i === current ? "text-honey" : ""}`}>{r.name}</span>
                <span className="text-xs text-white/55">{r.paintings.length} {r.paintings.length === 1 ? "work" : "works"}{i === current ? " · You're here" : ""}</span>
              </span>
              <span className="pr-2 text-white/40">→</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function MusicSheetBody({ isAdmin }: { isAdmin: boolean }) {
  return <MusicPanel isAdmin={isAdmin} className="!w-full !animate-none !rounded-none !border-0 !bg-transparent !p-2 !shadow-none !backdrop-blur-none" />;
}

export function HelpBody() {
  const row = (icon: ReactNode, title: string, text: string) => (
    <li className="flex items-center gap-4 rounded-2xl bg-white/[0.05] p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center text-honey">{icon}</span>
      <span><span className="block text-sm font-medium">{title}</span><span className="text-xs text-white/60">{text}</span></span>
    </li>
  );
  return (
    <div className="space-y-3 p-2">
      <ul className="space-y-2">
        {row(<IconSwipe />, "Swipe left or right", "Glide to the next or previous painting")}
        {row(<IconArrows />, "Or tap ‹ ›", "The arrows either side of the screen do the same")}
        {row(<IconDrag />, "Drag slowly", "Look around the room")}
        {row(<IconTap />, "Tap a painting", "The story, price and buy")}
        {row(<IconFloor />, "Tap the floor", "Walk to that spot")}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ guided tour bar */

export function TourBar({ bottom, painting, index, total, onStep, onOpen }: {
  bottom: number; painting: Painting | null; index: number; total: number; onStep: (d: 1 | -1) => void; onOpen: () => void;
}) {
  if (!total) return null;
  return (
    <>
      {/* side arrows */}
      <button aria-label="Previous painting" onClick={() => onStep(-1)} className="absolute top-1/2 left-2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-2xl text-white backdrop-blur active:scale-95 active:text-honey">‹</button>
      <button aria-label="Next painting" onClick={() => onStep(1)} className="absolute top-1/2 right-2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-2xl text-white backdrop-blur active:scale-95 active:text-honey">›</button>

      {/* caption for the work in view */}
      <div style={{ bottom: bottom + 92 }} className="pointer-events-none absolute inset-x-0 z-10 px-6 text-center">
        {painting ? (
          <button onClick={onOpen} className="pointer-events-auto inline-block max-w-full rounded-2xl bg-black/55 px-4 py-2 backdrop-blur active:bg-black/70">
            <span className="block text-[10px] tracking-[0.2em] text-honey uppercase">{index + 1} of {total}</span>
            <span className="block truncate font-serif text-xl">{painting.title}</span>
            <span className="block text-[11px] text-white/70">Tap for the story ↑</span>
          </button>
        ) : (
          <button onClick={() => onStep(1)} className="pointer-events-auto inline-block rounded-full bg-black/55 px-5 py-2.5 text-sm backdrop-blur">
            Start the tour · <span className="text-honey">{total} works</span> ›
          </button>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ first-visit tip */

const TIP_KEY = "jb-mobile-tip";
export function useTip() {
  const seen = useSyncExternalStore(() => () => {}, () => { try { return localStorage.getItem(TIP_KEY) === "1"; } catch { return true; } }, () => true);
  const [dismissed, setDismissed] = useState(false);
  const dismiss = () => { setDismissed(true); try { localStorage.setItem(TIP_KEY, "1"); } catch {} };
  return { show: !seen && !dismissed, dismiss };
}

export function MobileTip({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button onClick={onDismiss} className="animate-fade absolute inset-0 z-20 grid place-items-center bg-black/55 px-10 text-center text-white">
      <span>
        <span className="mx-auto mb-5 block w-fit animate-[float_2.4s_ease-in-out_infinite] text-honey"><IconSwipe size={56} /></span>
        <span className="block font-serif text-2xl">Swipe to the next painting</span>
        <span className="mt-2 block text-sm text-white/75">Drag slowly to look around · tap a work to see more</span>
        <span className="mt-8 inline-block rounded-full bg-honey px-6 py-2.5 text-sm font-medium text-black">Got it</span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ icons */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const IconHome = () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>;
const IconRooms = () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M12 4v16M3 12h9" /></svg>;
const IconStyle = () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><rect x="4" y="3" width="16" height="12" rx="1" /><rect x="8" y="6" width="8" height="6" /><path d="M2 21h20" /></svg>;
const IconNote = () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>;
const IconInfo = () => <svg width="22" height="22" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg>;
const IconBars = () => (
  <span className="flex h-4 items-end gap-[3px] text-honey">
    {[0, 1, 2].map((i) => <span key={i} className="w-[3px] rounded-sm bg-current" style={{ height: "100%", animation: `eq 0.9s ease-in-out ${i * 0.15}s infinite alternate` }} />)}
    <style>{`@keyframes eq{from{transform:scaleY(.3)}to{transform:scaleY(1)}} span[style*="eq"]{transform-origin:bottom}`}</style>
  </span>
);
function IconSwipe({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" {...S}><path d="M4 9h12M4 9l3-3M4 9l3 3M28 9H18M28 9l-3-3M28 9l-3 3" /><path d="M13 29v-9a2 2 0 014 0v4l5 1a2 2 0 011.6 2.2L23 29" /></svg>;
}
const IconArrows = () => <svg width="28" height="28" viewBox="0 0 32 32" {...S}><circle cx="8" cy="16" r="6" /><path d="M9.5 13L7 16l2.5 3" /><circle cx="24" cy="16" r="6" /><path d="M22.5 13L25 16l-2.5 3" /></svg>;
const IconDrag = () => <svg width="28" height="28" viewBox="0 0 32 32" {...S}><path d="M3 16c4-6 22-6 26 0M3 16l3-2M3 16l3 2M29 16l-3-2M29 16l-3 2" /><circle cx="16" cy="20" r="3" /></svg>;
const IconTap = () => <svg width="28" height="28" viewBox="0 0 32 32" {...S}><rect x="6" y="4" width="20" height="15" rx="1" /><path d="M15 30v-8a2 2 0 014 0v3l4 1a2 2 0 011.5 2.2L24 30" /></svg>;
const IconFloor = () => <svg width="28" height="28" viewBox="0 0 32 32" {...S}><path d="M2 26l8-10h12l8 10z" /><circle cx="16" cy="21" r="2" /></svg>;
