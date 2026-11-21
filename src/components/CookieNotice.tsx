"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

const KEY = "jb-cookies-ok";
const read = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return true; } };

/**
 * The site only uses essential cookies (sign-in, checkout), which don't need
 * consent under UK rules, so this is a notice rather than a consent wall.
 */
export function CookieNotice() {
  const seen = useSyncExternalStore(() => () => {}, read, () => true);
  const [gone, setGone] = useState(false);
  if (seen || gone) return null;
  const ok = () => { setGone(true); try { localStorage.setItem(KEY, "1"); } catch {} };
  return (
    <div role="region" aria-label="Cookies" className="animate-rise fixed inset-x-3 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+4rem))] z-40 mx-auto max-w-md border border-white/15 bg-black/95 p-4 text-sm text-white shadow-2xl backdrop-blur-md md:right-auto md:bottom-5 md:left-5 md:mx-0">
      <p className="leading-relaxed">
        <span className="font-hand text-lg text-honey">Cookies?</span> Only the ones the site needs to work: signing in and checkout. No tracking.{" "}
        <Link href="/legal/cookies" className="link-draw text-honey">More</Link>
      </p>
      <button onClick={ok} className="btn-glass mt-3 bg-honey px-5 py-2 text-xs font-semibold tracking-[0.2em] text-black uppercase">Fine by me</button>
    </div>
  );
}
