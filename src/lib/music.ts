"use client";

import type { Track } from "@/lib/painting";
import { ambient, sfx } from "@/lib/sound";

/**
 * One music player for the whole visit. The audio lives here (not in a component),
 * so it keeps playing while you move between the gallery and other app screens,
 * and any number of controls can show the same state.
 */

export const AMBIENT: Track = { id: "ambient", title: "Gallery ambience", artist: "Generated live", url: "" };

type State = { tracks: Track[]; index: number; playing: boolean; volume: number };

const VOL_KEY = "jb-music-volume";
let state: State = { tracks: [AMBIENT], index: 0, playing: false, volume: 0.6 };
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();
const SERVER: State = state;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function el() {
  if (!audio && typeof window !== "undefined") {
    audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("ended", () => music.next());
    try { state.volume = Number(localStorage.getItem(VOL_KEY) ?? 0.6); } catch {}
    audio.volume = state.volume;
  }
  return audio;
}

const current = () => state.tracks[state.index];
const isAmbient = () => current()?.id === AMBIENT.id;

function startCurrent() {
  if (isAmbient()) {
    ambient.start();
    set({ playing: true });
    return;
  }
  ambient.stop();
  const a = el();
  if (!a) return;
  if (a.src !== current().url) a.src = current().url;
  a.play().then(() => set({ playing: true })).catch(() => set({ playing: false }));
}

function stopAll() {
  ambient.stop();
  audio?.pause();
  set({ playing: false });
}

export const music = {
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  get: () => state,
  getServer: () => SERVER,
  isAmbient,
  /** Uploaded tracks, or the generated ambience when there are none. */
  setTracks(tracks: Track[]) {
    const list = tracks.length ? tracks : [AMBIENT];
    if (list.map((t) => t.id).join() === state.tracks.map((t) => t.id).join()) return;
    const wasPlaying = state.playing;
    stopAll();
    set({ tracks: list, index: 0 });
    if (wasPlaying) startCurrent();
  },
  toggle() {
    sfx.unlock();
    if (state.playing) stopAll();
    else startCurrent();
  },
  select(i: number) {
    sfx.unlock();
    stopAll();
    set({ index: (i + state.tracks.length) % state.tracks.length });
    startCurrent();
  },
  next() { music.select(state.index + 1); },
  prev() { music.select(state.index - 1); },
  setVolume(v: number) {
    set({ volume: v });
    if (audio) audio.volume = v;
    ambient.setVolume(v);
    try { localStorage.setItem(VOL_KEY, String(v)); } catch {}
  },
};
