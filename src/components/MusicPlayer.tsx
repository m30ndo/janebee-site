"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Track } from "@/lib/painting";
import { ambient, sfx } from "@/lib/sound";

const AMBIENT: Track = { id: "ambient", title: "Gallery ambience", artist: "Generated live — upload music in Studio", url: "" };

const VOL_KEY = "jb-music-volume";

/**
 * Floating music player. Lives in the app layout so music keeps playing
 * between screens. Also holds the sound-effects switch.
 */
export function MusicPlayer({ tracks: uploaded, bottom = 88, isAdmin = false }: { tracks: Track[]; bottom?: number; isAdmin?: boolean }) {
  const tracks = uploaded.length ? uploaded : [AMBIENT];
  const isAmbient = !uploaded.length;
  const audio = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    try { return Number(localStorage.getItem(VOL_KEY) ?? 0.6); } catch { return 0.6; }
  });
  const sfxMuted = useSyncExternalStore(sfx.subscribe, sfx.isMuted, () => false);
  const track = tracks[index];

  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
    ambient.setVolume(volume);
    try { localStorage.setItem(VOL_KEY, String(volume)); } catch {}
  }, [volume]);

  // start the next track when the current one changes while playing
  useEffect(() => {
    const a = audio.current;
    if (a && playing && !isAmbient) a.play().catch(() => setPlaying(false));
  }, [index, playing, isAmbient]);

  // stop the generated ambience if the player goes away
  useEffect(() => () => ambient.stop(), []);

  const toggle = () => {
    sfx.unlock();
    if (isAmbient) {
      if (ambient.isPlaying()) { ambient.stop(); setPlaying(false); } else { ambient.start(); setPlaying(true); }
      return;
    }
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else { a.pause(); setPlaying(false); }
  };
  const go = (d: number) => { setIndex((i) => (i + d + tracks.length) % tracks.length); };

  return (
    <div className="fixed left-4 z-40 md:left-6" style={{ bottom }}>
      {!isAmbient && <audio ref={audio} src={track?.url} preload="none" onEnded={() => go(1)} />}

      {open && (
        <div className="animate-rise mb-3 w-72 rounded-3xl border border-cream/15 bg-black/90 p-4 text-cream shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] tracking-[0.25em] uppercase opacity-50">Now playing</p>
          <p className="mt-1 truncate font-serif text-xl">{track?.title}</p>
          {track?.artist && <p className="truncate text-sm opacity-60">{track.artist}</p>}
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-cream/10" aria-label="Previous">⏮</button>
            <button onClick={toggle} className="grid h-14 w-14 place-items-center rounded-full bg-honey text-xl text-espresso transition hover:scale-105" aria-label={playing ? "Pause" : "Play"}>
              {playing ? "❚❚" : "▶"}
            </button>
            <button onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-cream/10" aria-label="Next">⏭</button>
          </div>
          <label className="mt-4 flex items-center gap-3 text-xs opacity-70">
            Vol
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="flex-1 accent-honey" />
          </label>
          {tracks.length > 1 && (
            <ol className="mt-4 max-h-40 space-y-1 overflow-y-auto border-t border-cream/10 pt-3 text-sm">
              {tracks.map((t, i) => (
                <li key={t.id}>
                  <button onClick={() => { setIndex(i); if (!playing) toggle(); }} className={`w-full truncate rounded-lg px-2 py-1 text-left transition hover:bg-cream/10 ${i === index ? "text-honey" : "opacity-80"}`}>
                    {i + 1}. {t.title}
                  </button>
                </li>
              ))}
            </ol>
          )}
          {isAmbient && isAdmin && (
            <a href="/admin/music" className="mt-4 block rounded-xl bg-honey/15 px-3 py-2 text-xs text-honey hover:bg-honey/25">
              + Upload Jane&apos;s music in Studio → Music
            </a>
          )}
          <label className="mt-4 flex cursor-pointer items-center justify-between border-t border-cream/10 pt-3 text-sm">
            Gallery sound effects
            <input type="checkbox" checked={!sfxMuted} onChange={(e) => sfx.setMuted(!e.target.checked)} className="h-4 w-4 accent-honey" />
          </label>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={`group flex h-12 items-center gap-2 rounded-full border border-cream/20 bg-black/80 pr-4 pl-1 text-cream shadow-xl backdrop-blur-md transition hover:border-honey ${open ? "border-honey" : ""}`}
        aria-label="Music"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-honey text-espresso">
          {playing ? <Bars /> : "♪"}
        </span>
        <span className="max-w-[9rem] truncate text-xs tracking-[0.12em] uppercase">{playing ? track?.title : "Music"}</span>
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
