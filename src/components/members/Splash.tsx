"use client";

import { Strapline } from "@/components/Strapline";
import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "hive-splash-seen";
const read = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return true; } };

/**
 * Opening sequence for the app: honey, blush and pink panels sweep across,
 * "The Hive" rises out of espresso, then the whole thing lifts away.
 * Plays once per visit; tap to skip.
 */
export function Splash() {
  const seen = useSyncExternalStore(() => () => {}, read, () => true);
  const [state, setState] = useState<"playing" | "leaving" | "done">("playing");

  useEffect(() => {
    if (seen) return;
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    const t1 = setTimeout(() => setState("leaving"), 2600);
    const t2 = setTimeout(() => setState("done"), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [seen]);

  if (seen || state === "done") return null;

  const skip = () => { setState("leaving"); setTimeout(() => setState("done"), 700); };

  return (
    <div
      onClick={skip}
      className="fixed inset-0 z-[100] cursor-pointer overflow-hidden bg-black"
      style={{ transition: "transform 0.8s cubic-bezier(0.7,0,0.2,1)", transform: state === "leaving" ? "translateY(-100%)" : "none" }}
      aria-hidden
    >
      <style>{`
        @keyframes sweep { 0% { transform: translateX(-101%); } 45%, 55% { transform: translateX(0); } 100% { transform: translateX(101%); } }
        @keyframes letter { from { transform: translateY(110%) rotate(6deg); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes tag { from { opacity: 0; transform: rotate(-8deg) scale(0.6); } to { opacity: 1; transform: rotate(-4deg) scale(1); } }
        @keyframes line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      {[
        { c: "#e3a21a", d: 0 },
        { c: "#f2a7c3", d: 0.14 },
        { c: "#ee3f8c", d: 0.28 },
        { c: "#ffffff", d: 0.42 },
      ].map((p) => (
        <div key={p.c} className="absolute inset-0" style={{ background: p.c, transform: "translateX(-101%)", animation: `sweep 1.25s cubic-bezier(0.7,0,0.2,1) ${p.d}s both` }} />
      ))}

      <div className="absolute inset-0 grid place-items-center text-cream">
        <div className="text-center">
          <p className="font-serif text-[18vw] leading-none font-light tracking-tight md:text-[10rem]">
            {"The Hive".split("").map((ch, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom">
                <span className="inline-block" style={{ animation: `letter 0.8s cubic-bezier(0.2,0.8,0.2,1) ${1.25 + i * 0.05}s both`, color: i >= 4 ? "#e3a21a" : undefined }}>
                  {ch === " " ? " " : ch}
                </span>
              </span>
            ))}
          </p>
          <div className="mx-auto mt-4 h-px w-40 origin-left bg-cream/50" style={{ animation: "line 0.9s ease 1.7s both" }} />
          <p className="mt-5 inline-block font-punk text-3xl text-pink" style={{ animation: "tag 0.6s cubic-bezier(0.3,1.6,0.5,1) 1.95s both" }}>
            Jane Bee
          </p>
          <Strapline className="mt-5 text-[10px] text-white/80 md:text-xs" style={{ animation: "fade 0.8s ease 2.15s both" }} />
        </div>
      </div>
    </div>
  );
}
