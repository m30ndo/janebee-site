"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  floorStyles, frameStyles, wallColours, wallStyles,
  type FloorStyle, type FrameStyle, type WallStyle,
} from "@/lib/painting";
import { setRoomStyle } from "@/app/admin/actions";
import { sfx } from "@/lib/sound";

export type RoomLook = { floorStyle: FloorStyle; wallStyle: WallStyle; wallColour: string; frameStyle: FrameStyle; honeycomb: boolean };

const floorSwatch: Record<FloorStyle, string> = {
  oak: "linear-gradient(90deg,#c49c70 0 30%,#b58c62 30% 60%,#cfa679 60%)",
  herringbone: "repeating-linear-gradient(45deg,#aa7a4e 0 6px,#8f643d 6px 12px)",
  walnut: "linear-gradient(90deg,#603e28 0 35%,#523422 35% 70%,#6b452d 70%)",
  concrete: "radial-gradient(circle at 30% 40%,#9a968f,#7d7a75)",
  marble: "linear-gradient(135deg,#f2efe9 40%,#bdb6ad 45%,#f2efe9 50%)",
  dark: "linear-gradient(135deg,#2a2624,#121011)",
};

const wallSwatch = (style: WallStyle, c: string) => {
  switch (style) {
    case "limewash": return `radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,0,0,.12), transparent 50%), ${c}`;
    case "panelled": return `linear-gradient(to top, rgba(0,0,0,.18) 0 10%, transparent 10% 14%, rgba(255,255,255,.25) 14% 16%, rgba(0,0,0,.12) 16% 44%, rgba(255,255,255,.35) 44% 48%, transparent 48%), ${c}`;
    case "brick": return `repeating-linear-gradient(to bottom, transparent 0 5px, rgba(0,0,0,.25) 5px 6px), repeating-linear-gradient(90deg, transparent 0 10px, rgba(0,0,0,.18) 10px 11px), ${c}`;
    case "concrete": return "radial-gradient(circle at 25% 30%, #3d3a36 0 1.5px, transparent 2px), radial-gradient(circle at 75% 30%, #3d3a36 0 1.5px, transparent 2px), linear-gradient(135deg,#9d9890,#85817b)";
    default: return c;
  }
};

const frameColour: Record<FrameStyle, string> = {
  black: "#141110", white: "#efece6", oak: "#b8895a", walnut: "#4a3122", gold: "linear-gradient(135deg,#e6c46a,#9c7128 60%,#c99a3f)",
  brass: "#b5915a", mounted: "#141110", float: "#141110", canvas: "transparent",
};

function FrameSwatch({ f, size = 20 }: { f: FrameStyle; size?: number }) {
  const pad = f === "brass" ? 1.5 : f === "gold" ? 4 : f === "canvas" ? 0 : 2.5;
  return (
    <span className="relative inline-block shrink-0 rounded-[3px]" style={{ width: size, height: size, background: frameColour[f], padding: pad }}>
      <span className={`block h-full w-full ${f === "mounted" ? "bg-[#f6f3ec] p-[3px]" : f === "float" ? "bg-black p-[2px]" : ""}`}>
        <span className="block h-full w-full bg-[linear-gradient(135deg,#ee3f8c,#e3a21a)]" />
      </span>
    </span>
  );
}

type Tab = "floor" | "walls" | "frames";

/**
 * "Style" item in the gallery's controls bar: floor, walls and frames.
 * Anyone can try a look (just for them); admins can save it for the room.
 */
export function StylePicker({ roomId, saved, current, canSave, onPreview }: {
  roomId: string; saved: RoomLook; current: RoomLook; canSave: boolean; onPreview: (look: Partial<RoomLook>) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [open]);

  return (
    <div className="relative" ref={box}>
      <button onClick={() => { setOpen((o) => !o); sfx.play("click"); }} className="group flex items-center gap-3 text-left" aria-expanded={open}>
        <span className="relative h-7 w-7 overflow-hidden rounded-md border border-honey/70 transition-transform group-hover:scale-110">
          <span className="absolute inset-x-0 top-0 h-[62%]" style={{ background: wallSwatch(current.wallStyle, current.wallColour) }} />
          <span className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: floorSwatch[current.floorStyle] }} />
          <span className="absolute top-[18%] left-1/2 -translate-x-1/2"><FrameSwatch f={current.frameStyle} size={11} /></span>
        </span>
        <span className="leading-tight">
          <span className="block text-[11px] tracking-[0.18em] uppercase opacity-60">Style</span>
          <span className="hidden text-sm transition-colors group-hover:text-honey sm:block">Room ▴</span>
        </span>
      </button>

      {open && (
        <div className="animate-rise absolute bottom-full left-[-4rem] mb-5 w-72 rounded-2xl border border-white/15 bg-black/90 p-2 text-white backdrop-blur-md md:left-1/2 md:-translate-x-1/2">
          <StylePanel roomId={roomId} saved={saved} current={current} canSave={canSave} onPreview={onPreview} />
        </div>
      )}
    </div>
  );
}

/** The floor / walls / frames chooser itself — used in the desktop pop-up and the phone sheet. */
export function StylePanel({ roomId, saved, current, canSave, onPreview, listClass = "max-h-[46dvh]" }: {
  roomId: string; saved: RoomLook; current: RoomLook; canSave: boolean; onPreview: (look: Partial<RoomLook>) => void; listClass?: string;
}) {
  const [tab, setTab] = useState<Tab>("floor");
  const [pending, start] = useTransition();
  const [status, setStatus] = useState("");
  const changed = (Object.keys(saved) as (keyof RoomLook)[]).some((k) => saved[k] !== current[k]);
  const pick = (look: Partial<RoomLook>) => { sfx.play("click"); onPreview(look); setStatus(""); };
  const row = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10 ${active ? "text-honey" : "text-white"}`;
  const tag = (show: boolean) => show && <span className="text-[10px] tracking-[0.15em] text-white/40 uppercase">room</span>;

  return (
    <>
          <div className="mb-2 grid grid-cols-3 gap-1 rounded-xl bg-white/[0.06] p-1 text-xs tracking-[0.12em] uppercase">
            {(["floor", "walls", "frames"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg py-1.5 transition ${tab === t ? "bg-honey text-black" : "text-white/70 hover:text-white"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className={`${listClass} overflow-y-auto`}>
            {tab === "floor" && floorStyles.map((f) => (
              <button key={f.value} onClick={() => pick({ floorStyle: f.value })} className={row(current.floorStyle === f.value)}>
                <span className="h-5 w-5 shrink-0 rounded" style={{ background: floorSwatch[f.value] }} />
                <span className="flex-1">{f.label}</span>
                {tag(saved.floorStyle === f.value)}
              </button>
            ))}

            {tab === "walls" && (
              <>
                {wallStyles.map((w) => (
                  <button key={w.value} onClick={() => pick({ wallStyle: w.value })} className={row(current.wallStyle === w.value)}>
                    <span className="h-5 w-5 shrink-0 rounded" style={{ background: wallSwatch(w.value, current.wallColour) }} />
                    <span className="flex-1">{w.label}</span>
                    {tag(saved.wallStyle === w.value)}
                  </button>
                ))}
                <button onClick={() => pick({ honeycomb: !current.honeycomb })} className={row(false)} role="switch" aria-checked={current.honeycomb}>
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white/10 text-[13px] leading-none">⬡</span>
                  <span className="flex-1">Honeycomb end walls</span>
                  <span className={`relative h-5 w-9 rounded-full transition ${current.honeycomb ? "bg-honey" : "bg-white/20"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-all ${current.honeycomb ? "left-[1.125rem]" : "left-0.5"}`} />
                  </span>
                </button>
                <p className="mt-2 px-3 text-[10px] tracking-[0.18em] text-white/50 uppercase">Colour</p>
                <div className="grid grid-cols-5 gap-2 px-3 py-2">
                  {wallColours.map((c) => (
                    <button
                      key={c.value}
                      title={c.label}
                      aria-label={c.label}
                      onClick={() => pick({ wallColour: c.value })}
                      className={`h-8 w-full rounded-lg border transition hover:scale-110 ${current.wallColour.toLowerCase() === c.value ? "border-honey ring-2 ring-honey/60" : "border-white/20"}`}
                      style={{ background: c.value }}
                    />
                  ))}
                </div>
                <p className="px-3 pb-1 text-xs text-white/50">{wallColours.find((c) => c.value === current.wallColour.toLowerCase())?.label ?? "Custom colour"}</p>
              </>
            )}

            {tab === "frames" && frameStyles.map((f) => (
              <button key={f.value} onClick={() => pick({ frameStyle: f.value })} className={row(current.frameStyle === f.value)}>
                <FrameSwatch f={f.value} />
                <span className="flex-1">{f.label}</span>
                {tag(saved.frameStyle === f.value)}
              </button>
            ))}
          </div>

          {canSave && (
            <>
              <button
                disabled={!changed || pending}
                onClick={() => start(async () => {
                  const r = await setRoomStyle(roomId, { floor: current.floorStyle, wallStyle: current.wallStyle, wallColour: current.wallColour, frame: current.frameStyle, honeycomb: current.honeycomb });
                  setStatus(r.ok ? "Saved — everyone now sees this room like this." : "Couldn't save. Are you signed in?");
                })}
                className="mt-2 w-full rounded-full bg-honey py-2 text-sm font-medium text-black transition hover:bg-white disabled:opacity-40"
              >
                {pending ? "Saving…" : "Save for this room"}
              </button>
              {status && <p className="mt-2 px-2 text-xs text-white/80">{status}</p>}
              {tab === "frames" && <p className="mt-2 px-2 text-[11px] text-white/45">Saving sets the room&apos;s frame. Single works can have their own frame in Studio.</p>}
            </>
          )}
    </>
  );
}
