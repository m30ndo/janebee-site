import type { ReactNode } from "react";

/**
 * One icon set for the whole app (bottom menu, gallery menu, sheets), so every
 * screen looks the same: 22px, 1.6 line, round ends, currentColor.
 */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const svg = (d: ReactNode, size = 22) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} aria-hidden>{d}</svg>
);

export const IconHome = ({ size }: { size?: number }) => svg(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>, size);
export const IconGallery = ({ size }: { size?: number }) => svg(<><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></>, size);
export const IconShop = ({ size }: { size?: number }) => svg(<><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>, size);
export const IconDiary = ({ size }: { size?: number }) => svg(<><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M4 10h16M9 3v4M15 3v4" /><path d="M8 14h3v3H8z" /></>, size);
export const IconJournal = ({ size }: { size?: number }) => svg(<><path d="M5 4h11l3 3v13H5z" /><path d="M8 10h8M8 14h8M8 18h5" /></>, size);
export const IconYou = ({ size }: { size?: number }) => svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>, size);
export const IconNote = ({ size }: { size?: number }) => svg(<><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>, size);
export const IconRooms = ({ size }: { size?: number }) => svg(<><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M12 4v16M3 12h9" /></>, size);
export const IconStyle = ({ size }: { size?: number }) => svg(<><rect x="4" y="3" width="16" height="12" rx="1" /><rect x="8" y="6" width="8" height="6" /><path d="M2 21h20" /></>, size);
export const IconHelp = ({ size }: { size?: number }) => svg(<><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>, size);
export const IconMenu = ({ size }: { size?: number }) => svg(<><path d="M4 7h16M4 12h16M4 17h10" /></>, size);
export const IconClose = ({ size = 18 }: { size?: number }) => svg(<><path d="M6 6l12 12M18 6L6 18" /></>, size);
export const IconHeart = ({ size }: { size?: number }) => svg(<><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></>, size);
export const IconArrowOut = ({ size = 16 }: { size?: number }) => svg(<><path d="M7 17L17 7M9 7h8v8" /></>, size);

/** Animated equaliser bars for "music playing". */
export const IconBars = ({ className = "text-honey" }: { className?: string }) => (
  <span className={`flex h-4 items-end gap-[3px] ${className}`} aria-hidden>
    {[0, 1, 2].map((i) => <span key={i} className="w-[3px] origin-bottom rounded-sm bg-current" style={{ height: "100%", animation: `eqbar 0.9s ease-in-out ${i * 0.15}s infinite alternate` }} />)}
    <style>{`@keyframes eqbar{from{transform:scaleY(.3)}to{transform:scaleY(1)}}`}</style>
  </span>
);

/* ---------------------------------------------------------------- shared dock styles */

/** The floating menu bar: same shape in the app and in the gallery. */
export const DOCK = "absolute inset-x-3 z-30 flex items-stretch rounded-2xl border border-white/10 bg-black/85 px-1 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl";
/** One item in the dock. */
export const dockItem = (on: boolean) =>
  `relative flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[9px] tracking-[0.06em] uppercase transition-colors sm:text-[10px] sm:tracking-[0.12em] ${on ? "text-honey" : "text-white/75 hover:text-white active:text-honey"}`;
/** The ✕ at the end of the dock that tucks it away. */
export const DOCK_CLOSE = "flex w-11 shrink-0 flex-col items-center justify-center border-l border-white/10 text-white/60 transition-colors hover:text-honey active:text-honey";
/** Tucked away: the round floating buttons left behind. */
export const FLOAT_PILL = "grid h-11 place-items-center rounded-full border border-white/25 bg-black/60 px-4 text-[11px] tracking-[0.2em] text-white uppercase shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur transition-colors hover:text-honey active:text-honey";
export const FLOAT_ROUND = "flex h-11 items-center gap-2 rounded-full border border-honey/70 bg-black/70 px-5 text-[11px] font-semibold tracking-[0.22em] text-honey uppercase shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur transition-colors hover:bg-honey hover:text-black active:bg-honey active:text-black";
