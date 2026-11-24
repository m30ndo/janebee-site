"use client";

import { useEffect } from "react";
import { music } from "@/lib/music";
import { sfx } from "@/lib/sound";

/**
 * Music plays by default in the app. Browsers only allow sound after the first
 * tap, so we try straight away (installed apps often allow it) and otherwise
 * start on the first tap or key press anywhere — usually the opening splash.
 * Pausing the music turns this off on that device until it's played again.
 */
export function MusicAutoStart() {
  useEffect(() => {
    // only try without a tap when this page already has one (otherwise generated ambience would show as playing in silence)
    const active = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
    const t = setTimeout(() => { if (active) music.autoStart(); }, 400);
    const onGesture = (e: Event) => {
      const el = e.target as Element | null;
      // a tap on a music control does its own thing
      if (el?.closest?.('[aria-label="Music"], [aria-label="Play"], [aria-label="Pause"]')) { stop(); return; }
      sfx.unlock(); // wakes generated ambience that was started before the tap
      music.autoStart();
      stop();
    };
    const events = ["click", "touchend", "keydown"] as const;
    const stop = () => events.forEach((n) => window.removeEventListener(n, onGesture, true));
    events.forEach((n) => window.addEventListener(n, onGesture, true));
    return () => { clearTimeout(t); stop(); };
  }, []);
  return null;
}
