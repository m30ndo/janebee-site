"use client";

import { useState, useTransition } from "react";
import { floorStyles, type FloorStyle } from "@/lib/painting";
import { setRoomFloor } from "@/app/admin/actions";

const swatch: Record<FloorStyle, string> = {
  oak: "linear-gradient(90deg,#c49c70 0 30%,#b58c62 30% 60%,#cfa679 60%)",
  herringbone: "repeating-linear-gradient(45deg,#aa7a4e 0 6px,#8f643d 6px 12px)",
  walnut: "linear-gradient(90deg,#603e28 0 35%,#523422 35% 70%,#6b452d 70%)",
  concrete: "radial-gradient(circle at 30% 40%,#9a968f,#7d7a75)",
  marble: "linear-gradient(135deg,#f2efe9 40%,#bdb6ad 45%,#f2efe9 50%)",
  dark: "linear-gradient(135deg,#2a2624,#121011)",
};

/**
 * Floor chooser in the gallery's controls bar. Anyone can try a floor (just for
 * them); admins can save it for the room.
 */
export function FloorPicker({ roomId, saved, current, canSave, onPreview }: {
  roomId: string; saved: FloorStyle; current: FloorStyle; canSave: boolean; onPreview: (f: FloorStyle) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState("");
  const label = floorStyles.find((f) => f.value === current)?.label ?? "Oak";

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="group flex items-center gap-3 text-left" aria-expanded={open}>
        <span className="h-7 w-7 rounded-md border border-honey/70 transition-transform group-hover:scale-110" style={{ background: swatch[current] }} />
        <span className="leading-tight">
          <span className="block text-[11px] tracking-[0.18em] uppercase opacity-60">Floor</span>
          <span className="block text-sm transition-colors group-hover:text-honey">{label} ▴</span>
        </span>
      </button>

      {open && (
        <div className="animate-rise absolute bottom-full left-1/2 mb-5 w-60 -translate-x-1/2 rounded-2xl border border-cream/15 bg-ink/90 p-2 backdrop-blur-md">
          {floorStyles.map((f) => (
            <button
              key={f.value}
              onClick={() => { onPreview(f.value); setStatus(""); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-cream/10 ${current === f.value ? "text-honey" : ""}`}
            >
              <span className="h-5 w-5 shrink-0 rounded" style={{ background: swatch[f.value] }} />
              <span className="flex-1">{f.label}</span>
              {saved === f.value && <span className="text-[10px] tracking-[0.15em] uppercase opacity-50">room</span>}
            </button>
          ))}
          {canSave && (
            <>
              <button
                disabled={current === saved || pending}
                onClick={() => start(async () => {
                  const r = await setRoomFloor(roomId, current);
                  setStatus(r.ok ? "Saved — everyone now sees this floor." : "Couldn't save. Are you signed in?");
                })}
                className="mt-2 w-full rounded-full bg-honey py-2 text-sm font-medium text-espresso disabled:opacity-40"
              >
                {pending ? "Saving…" : "Save for this room"}
              </button>
              {status && <p className="mt-2 px-2 text-xs opacity-80">{status}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
