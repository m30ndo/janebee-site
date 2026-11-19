"use client";

import { useState } from "react";

/** Speed: seconds each work takes to drift past, with a plain-English label. */
export function SpeedSlider({ initial }: { initial: number }) {
  const [v, setV] = useState(initial);
  const feel = v <= 3 ? "Brisk" : v <= 6 ? "Easy stroll" : v <= 12 ? "Slow and dreamy" : "Barely moving";
  return (
    <div className="md:col-span-2">
      <label className="flex items-center gap-4 text-sm">
        <span className="w-40 shrink-0 font-medium">Speed</span>
        <span className="text-xs opacity-60">Fast</span>
        <input type="range" name="seconds_per_slide" min={1} max={30} step={0.5} value={v} onChange={(e) => setV(Number(e.target.value))} className="flex-1 accent-honey" />
        <span className="text-xs opacity-60">Slow</span>
        <span className="w-40 text-right tabular-nums">{v}s per work · {feel}</span>
      </label>
      <p className="mt-1 text-xs opacity-50">How long each work takes to drift past. 5–8 seconds feels calm.</p>
    </div>
  );
}

const GRID = ["top left", "top", "top right", "left", "center", "right", "bottom left", "bottom", "bottom right"];

/** Pick which part of the photo stays in view when it's cropped to a shape. */
export function FocusPicker({ initial, image }: { initial: string; image: string | null }) {
  const [focus, setFocus] = useState(initial || "center");
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-white/90">Position in frame</span>
      <input type="hidden" name="focus" value={focus} />
      <div className="relative aspect-square w-40 overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: focus }} />
        )}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {GRID.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setFocus(g)}
              aria-label={`Focus ${g}`}
              aria-pressed={focus === g}
              className="grid place-items-center border border-white/10 transition-colors hover:bg-honey/20"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${focus === g ? "bg-honey ring-2 ring-black" : "bg-white/40"}`} />
            </button>
          ))}
        </div>
      </div>
      <span className="mt-1 block text-xs text-white/50">Used when the shape crops the photo. Now: {focus}.</span>
    </div>
  );
}
