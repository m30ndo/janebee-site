"use client";

import { useState } from "react";

/** Black cover strength, 0–100%, with a live preview over the page's photo. */
export function OverlaySlider({ initial, image }: { initial: number; image: string | null }) {
  const [v, setV] = useState(initial);
  return (
    <div className="md:col-span-2">
      <div className="relative aspect-[16/7] overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-xs opacity-50">Preview appears once a photo is saved</span>
        )}
        <div className="absolute inset-0 bg-black" style={{ opacity: v / 100 }} />
        <p className="absolute inset-0 grid place-items-center font-serif text-3xl font-light text-white">Every piece holds a <span className="contents text-honey italic">memory.</span></p>
      </div>
      <label className="mt-4 flex items-center gap-4 text-sm">
        <span className="w-40 shrink-0 font-medium">Black cover</span>
        <input type="range" name="overlay" min={0} max={100} step={1} value={v} onChange={(e) => setV(Number(e.target.value))} className="flex-1 accent-honey" />
        <span className="w-12 text-right tabular-nums">{v}%</span>
      </label>
      <p className="mt-1 text-xs opacity-50">0% shows the photo as it is; 100% is solid black. Around 50–70% keeps text easy to read.</p>
    </div>
  );
}
