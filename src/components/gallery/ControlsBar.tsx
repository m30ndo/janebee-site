"use client";

import { useSyncExternalStore, useState } from "react";
import { FLOAT_ROUND, IconClose } from "@/components/members/icons";

const KEY = "jb-controls-open";

/** Tucked away unless the visitor chose to keep it open. */
function readHidden() {
  try { return localStorage.getItem(KEY) !== "1"; } catch { return true; }
}

/** Bottom bar explaining how to move around. Starts tucked away: "?" opens it, ✕ tucks it back. */
export function ControlsBar({ bottomOffset = 0, extra }: { bottomOffset?: number; extra?: React.ReactNode; homeHref?: string }) {
  const stored = useSyncExternalStore(() => () => {}, readHidden, () => true);
  const [override, setOverride] = useState<boolean | null>(null);
  const hidden = override ?? stored;

  const set = (h: boolean) => {
    setOverride(h);
    try { localStorage.setItem(KEY, h ? "0" : "1"); } catch {}
  };

  if (hidden) {
    return (
      <>
      <button
        data-plain
        onClick={() => set(false)}
        style={{ bottom: bottomOffset + 20 }}
        className={`${FLOAT_ROUND} absolute right-5 z-10`}
        aria-label="Show controls, room style and music"
      >
        Menu
      </button>
      </>
    );
  }

  return (
    <div
      style={{ bottom: bottomOffset }}
      className="animate-rise absolute inset-x-0 z-10 flex justify-center px-3 pb-4"
    >
      <div className="relative flex max-w-full items-center gap-4 rounded-2xl border border-cream/15 bg-ink/70 py-3 pr-11 pl-4 text-cream shadow-2xl backdrop-blur-md sm:gap-5 md:gap-8 md:px-7 md:pr-14">
        {/* desktop */}
        <Item icon={<ArrowKeys />} title="Walk" text="Arrow keys or W A S D" className="hidden md:flex" />
        <Item icon={<Mouse drag />} title="Look around" text="Click & drag" className="hidden md:flex" />
        <Item icon={<Mouse wheel />} title="Move" text="Scroll" className="hidden lg:flex" />
        <Item icon={<Frame />} title="Paintings" text="Click to view" className="hidden md:flex" />
        {/* touch */}
        <Item icon={<Swipe />} title="Look" text="Drag" className="hidden sm:flex md:hidden" />
        <Item icon={<Tap />} title="Walk" text="Tap floor" className="md:hidden" />
        <Item icon={<Frame />} title="View" text="Tap a painting" className="hidden sm:flex md:hidden" />
        {extra && <span className="h-8 w-px bg-cream/15" aria-hidden />}
        {extra}
        <button
          onClick={() => set(true)}
          className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-cream/60 transition hover:rotate-90 hover:bg-cream/10 hover:text-cream"
          aria-label="Hide controls"
        >
          <IconClose />
        </button>
      </div>
    </div>
  );
}

function Item({ icon, title, text, className = "" }: { icon: React.ReactNode; title: string; text: string; className?: string }) {
  return (
    <div className={`items-center gap-3 ${className}`}>
      <span className="text-honey">{icon}</span>
      <span className="leading-tight">
        <span className="block text-[11px] tracking-[0.18em] uppercase opacity-60">{title}</span>
        <span className="block text-sm">{text}</span>
      </span>
    </div>
  );
}

const key = (x: number, y: number, label: string) => (
  <g key={label}>
    <rect x={x} y={y} width="13" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d={label} fill="currentColor" />
  </g>
);

function ArrowKeys() {
  return (
    <svg width="44" height="30" viewBox="0 0 44 30" aria-hidden>
      {key(15.5, 1, "M22 4.5l3 4h-6z")}
      {key(1, 16, "M4.5 22.5l4-3v6z")}
      {key(15.5, 16, "M22 26l3-4h-6z")}
      {key(30, 16, "M39.5 22.5l-4-3v6z")}
    </svg>
  );
}

function Mouse({ drag, wheel }: { drag?: boolean; wheel?: boolean }) {
  return (
    <svg width="34" height="30" viewBox="0 0 34 30" aria-hidden>
      <rect x="10" y="3" width="14" height="23" rx="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line x1="17" y1="3" x2="17" y2="11" stroke="currentColor" strokeWidth="1.2" />
      {drag && <path d="M10 8.5V3.5a7 7 0 0 1 7-0.5V11h-7z" fill="currentColor" opacity="0.45" />}
      {wheel && <rect x="15.6" y="6" width="2.8" height="5" rx="1.4" fill="currentColor" />}
      {drag && (
        <>
          <path d="M2 15h5M2 15l2.5-2.5M2 15l2.5 2.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M32 15h-5M32 15l-2.5-2.5M32 15l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </>
      )}
      {wheel && <path d="M29 9v12M29 9l-2 2.5M29 9l2 2.5M29 21l-2-2.5M29 21l2-2.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

function Frame() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
      <rect x="3" y="3" width="20" height="17" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 17l5-6 4 4 3-3 3 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M19 16l8 4-3.5 1.2L22 25z" fill="currentColor" />
    </svg>
  );
}

function Swipe() {
  return (
    <svg width="34" height="30" viewBox="0 0 34 30" aria-hidden>
      <circle cx="17" cy="15" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="17" cy="15" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 15h6M3 15l2.5-2.5M3 15l2.5 2.5M31 15h-6M31 15l-2.5-2.5M31 15l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Tap() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
      <circle cx="15" cy="12" r="3.5" fill="currentColor" />
      <circle cx="15" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <path d="M4 26h22" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 3" />
    </svg>
  );
}
