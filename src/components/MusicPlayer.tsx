"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Track } from "@/lib/painting";
import { music } from "@/lib/music";
import { sfx } from "@/lib/sound";

function useMusic() {
  return useSyncExternalStore(music.subscribe, music.get, music.getServer);
}

/** Registers the playlist with the shared player (renders nothing). */
export function MusicTracks({ tracks }: { tracks: Track[] }) {
  useEffect(() => { music.setTracks(tracks); }, [tracks]);
  return null;
}

/** The pop-up: now playing, transport, volume, playlist, sound-effects switch. */
export function MusicPanel({ isAdmin, className = "" }: { isAdmin: boolean; className?: string }) {
  const m = useMusic();
  const sfxMuted = useSyncExternalStore(sfx.subscribe, sfx.isMuted, () => false);
  const track = m.tracks[m.index];
  const ambientOnly = music.isAmbient() && m.tracks.length === 1;

  return (
    <div className={`animate-rise w-72 rounded-3xl border border-cream/15 bg-black/90 p-4 text-cream shadow-2xl backdrop-blur-xl ${className}`}>
      <p className="text-[10px] tracking-[0.25em] uppercase opacity-50">Now playing</p>
      <p className="mt-1 truncate font-serif text-xl">{track?.title}</p>
      {track?.artist && <p className="truncate text-sm opacity-60">{track.artist}</p>}
      <div className="mt-4 flex items-center justify-between">
        <button onClick={music.prev} disabled={m.tracks.length < 2} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-cream/10 disabled:opacity-30" aria-label="Previous">⏮</button>
        <button onClick={music.toggle} className="grid h-14 w-14 place-items-center rounded-full bg-honey text-xl text-espresso transition hover:scale-105" aria-label={m.playing ? "Pause" : "Play"}>
          {m.playing ? "❚❚" : "▶"}
        </button>
        <button onClick={music.next} disabled={m.tracks.length < 2} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-cream/10 disabled:opacity-30" aria-label="Next">⏭</button>
      </div>
      <label className="mt-4 flex items-center gap-3 text-xs opacity-70">
        Vol
        <input type="range" min={0} max={1} step={0.05} value={m.volume} onChange={(e) => music.setVolume(Number(e.target.value))} className="flex-1 accent-honey" />
      </label>
      {m.tracks.length > 1 && (
        <ol className="mt-4 max-h-40 space-y-1 overflow-y-auto border-t border-cream/10 pt-3 text-sm">
          {m.tracks.map((t, i) => (
            <li key={t.id}>
              <button onClick={() => music.select(i)} className={`w-full truncate rounded-lg px-2 py-1 text-left transition hover:bg-cream/10 ${i === m.index ? "text-honey" : "opacity-80"}`}>
                {i + 1}. {t.title}
              </button>
            </li>
          ))}
        </ol>
      )}
      {ambientOnly && isAdmin && (
        <a href="/admin/music" className="mt-4 block rounded-xl bg-honey/15 px-3 py-2 text-xs text-honey hover:bg-honey/25">
          + Upload Jane&apos;s music in Studio → Music
        </a>
      )}
      <label className="mt-4 flex cursor-pointer items-center justify-between border-t border-cream/10 pt-3 text-sm">
        Gallery sound effects
        <input type="checkbox" checked={!sfxMuted} onChange={(e) => sfx.setMuted(!e.target.checked)} className="h-4 w-4 accent-honey" />
      </label>
    </div>
  );
}

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open, close]);
  return ref;
}

/** Item for the gallery's bottom controls bar; the player pops up above it. */
export function MusicBarItem({ isAdmin = false }: { isAdmin?: boolean }) {
  const m = useMusic();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const track = m.tracks[m.index];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="group flex items-center gap-3 text-left" aria-expanded={open} aria-label="Music">
        <span className={`grid h-8 w-8 place-items-center rounded-full transition-transform group-hover:scale-110 ${m.playing ? "bg-honey text-espresso" : "border border-honey/70 text-honey"}`}>
          {m.playing ? <Bars /> : "♪"}
        </span>
        <span className="leading-tight">
          <span className="block text-[11px] tracking-[0.18em] uppercase opacity-60">Music</span>
          <span className="hidden max-w-[9rem] truncate text-sm transition-colors group-hover:text-honey sm:block">{m.playing ? track?.title : "Play"} ▴</span>
        </span>
      </button>
      {open && <MusicPanel isAdmin={isAdmin} className="absolute right-[-2.5rem] bottom-full mb-5 md:right-auto md:left-1/2 md:-translate-x-1/2" />}
    </div>
  );
}

/** Small floating button for app screens outside the gallery. */
export function MusicFloating({ isAdmin = false, bottom = 84 }: { isAdmin?: boolean; bottom?: number }) {
  const m = useMusic();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const track = m.tracks[m.index];
  return (
    <div className="fixed left-4 z-40 md:left-6" style={{ bottom }} ref={ref}>
      {open && <MusicPanel isAdmin={isAdmin} className="mb-3" />}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex h-12 items-center gap-2 rounded-full border bg-black/80 pr-4 pl-1 text-cream shadow-xl backdrop-blur-md transition hover:border-honey ${open ? "border-honey" : "border-cream/20"}`}
        aria-label="Music"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-honey text-espresso">{m.playing ? <Bars /> : "♪"}</span>
        <span className="max-w-[9rem] truncate text-xs tracking-[0.12em] uppercase">{m.playing ? track?.title : "Music"}</span>
      </button>
    </div>
  );
}

function Bars() {
  return (
    <span className="flex h-4 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="w-[3px] rounded-full bg-espresso" style={{ animation: `eq 0.9s ${i * 0.15}s ease-in-out infinite alternate`, height: "40%" }} />
      ))}
      <style>{`@keyframes eq { from { height: 25% } to { height: 100% } }`}</style>
    </span>
  );
}
