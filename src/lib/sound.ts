"use client";

/**
 * Gallery sound effects, synthesised with Web Audio (no files to download):
 * footsteps on the floor, a soft click on a painting, a hover tick and a door whoosh.
 * Sound starts only after a tap/click (browser rule). Muting is remembered.
 */

type Kind = "step" | "click" | "hover" | "door" | "open";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let stepFlip = false;

const KEY = "jb-sfx-muted";
const listeners = new Set<() => void>();
let muted = (() => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } })();

export const sfx = {
  isMuted: () => muted,
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
  setMuted(m: boolean) {
    muted = m;
    try { localStorage.setItem(KEY, m ? "1" : "0"); } catch {}
    if (master) master.gain.value = m ? 0 : 0.6;
    listeners.forEach((l) => l());
  },
  /** Call from a click/tap handler to unlock audio. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.6;
      master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
  },
  play(kind: Kind, floor: "wood" | "hard" = "wood") {
    if (!ctx || !master || !noise || muted) return;
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.connect(master);

    if (kind === "step") {
      // a short filtered thump; wood is warmer, stone is clickier
      stepFlip = !stepFlip;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = (floor === "wood" ? 420 : 900) * (stepFlip ? 1 : 0.85);
      f.Q.value = 1.2;
      src.connect(f).connect(out);
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(floor === "wood" ? 0.5 : 0.35, t + 0.008);
      out.gain.exponentialRampToValueAtTime(0.001, t + (floor === "wood" ? 0.16 : 0.09));
      src.start(t, Math.random() * 0.3);
      src.stop(t + 0.2);
    } else if (kind === "click" || kind === "hover") {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(kind === "click" ? 880 : 1600, t);
      o.frequency.exponentialRampToValueAtTime(kind === "click" ? 440 : 1200, t + 0.08);
      o.connect(out);
      out.gain.setValueAtTime(kind === "click" ? 0.18 : 0.04, t);
      out.gain.exponentialRampToValueAtTime(0.001, t + (kind === "click" ? 0.18 : 0.06));
      o.start(t);
      o.stop(t + 0.2);
      if (kind === "click") {
        // a second, softer partial: like a cup on a saucer
        const o2 = ctx.createOscillator();
        o2.frequency.value = 1320;
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.06, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o2.connect(g2).connect(master);
        o2.start(t);
        o2.stop(t + 0.3);
      }
    } else if (kind === "door" || kind === "open") {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 0.8;
      f.frequency.setValueAtTime(kind === "door" ? 300 : 500, t);
      f.frequency.exponentialRampToValueAtTime(kind === "door" ? 1400 : 2400, t + 0.6);
      src.connect(f).connect(out);
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(0.25, t + 0.25);
      out.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      src.start(t);
      src.stop(t + 1);
    }
  },
};

/* ------------------------------------------------------------------ ambience */

/**
 * "Gallery ambience": slow, warm chords generated live (used until real tracks
 * are uploaded). Separate from the sound-effects mute.
 */
const CHORDS = [
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [146.83, 220.0, 261.63, 349.23], // Dm7
  [233.08, 293.66, 349.23, 440.0], // Bbmaj7
];
let ambGain: GainNode | null = null;
let ambTimer: ReturnType<typeof setInterval> | null = null;
let chordIndex = 0;
let ambVolume = 0.6;

function ambientChord() {
  if (!ctx || !ambGain) return;
  const t = ctx.currentTime;
  const notes = CHORDS[chordIndex++ % CHORDS.length];
  for (const f of notes) {
    for (const [type, detune, level] of [["triangle", -6, 0.05], ["sine", 7, 0.06]] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + 2.5);
      g.gain.setValueAtTime(level, t + 7);
      g.gain.linearRampToValueAtTime(0, t + 10);
      o.connect(g).connect(ambGain);
      o.start(t);
      o.stop(t + 10.2);
    }
  }
  // a couple of soft high notes, like light catching glass
  for (let i = 0; i < 2; i++) {
    const at = t + 1 + Math.random() * 5;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = notes[Math.floor(Math.random() * notes.length)] * 4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.025, at + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 2.5);
    o.connect(g).connect(ambGain);
    o.start(at);
    o.stop(at + 2.6);
  }
}

export const ambient = {
  isPlaying: () => ambTimer !== null,
  start() {
    sfx.unlock();
    if (!ctx || ambTimer) return;
    ambGain = ctx.createGain();
    ambGain.gain.value = ambVolume * 0.9;
    // warm it up and add a gentle echo
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.42;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    ambGain.connect(lp);
    lp.connect(ctx.destination);
    lp.connect(delay);
    delay.connect(fb).connect(delay);
    delay.connect(ctx.destination);
    ambientChord();
    ambTimer = setInterval(ambientChord, 8000);
  },
  stop() {
    if (ambTimer) clearInterval(ambTimer);
    ambTimer = null;
    if (ambGain && ctx) {
      const g = ambGain;
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setTimeout(() => g.disconnect(), 2000);
    }
    ambGain = null;
  },
  setVolume(v: number) {
    ambVolume = v;
    if (ambGain) ambGain.gain.value = v * 0.9;
  },
};
