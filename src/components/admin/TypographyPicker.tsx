"use client";

import { useEffect, useMemo, useState } from "react";
import { FONTS, SLOTS, fontById, googleFontsHref, type SlotKey, type Typography } from "@/lib/typography";

const GROUPS: { kind: string; label: string }[] = [
  { kind: "serif", label: "Serif" },
  { kind: "display", label: "Display" },
  { kind: "sans", label: "Sans serif" },
  { kind: "hand", label: "Handwritten" },
];

const SAMPLE: Record<SlotKey, { text: string; cls: string }> = {
  title: { text: "Every piece holds a memory.", cls: "text-5xl leading-[0.9] md:text-6xl" },
  h1: { text: "The night the honey ran", cls: "text-4xl leading-tight" },
  h2: { text: "Keep reading", cls: "text-2xl" },
  menu: { text: "Shop", cls: "text-5xl leading-[1.08] font-light md:text-6xl" },
  body: { text: "New work before it hits Instagram, first dibs on originals, and invitations to the good parties.", cls: "text-base leading-relaxed" },
};

/** Five slots, each with a font list and a live preview. Google fonts load as you pick them. */
export function TypographyPicker({ initial }: { initial: Typography }) {
  const [t, setT] = useState(initial);
  const href = useMemo(() => {
    // load every option once so the previews in the list are real
    const all = Object.fromEntries(SLOTS.map((s) => [s.key, t[s.key]])) as Typography;
    return googleFontsHref(all);
  }, [t]);

  useEffect(() => {
    if (!href) return;
    const id = "jb-font-preview";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) { link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; document.head.appendChild(link); }
    link.href = href;
  }, [href]);

  return (
    <div className="space-y-5">
      {SLOTS.map((s) => {
        const f = fontById(t[s.key]);
        return (
          <div key={s.key} className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[240px_1fr] md:p-6">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-honey uppercase">{s.label}</p>
              <p className="mt-1 text-xs text-white/50">{s.hint}</p>
              <select
                name={s.key}
                value={t[s.key]}
                onChange={(e) => setT((o) => ({ ...o, [s.key]: e.target.value }))}
                className="mt-4 w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 text-[15px] text-white [&>optgroup]:bg-neutral-900 [&_option]:bg-neutral-900"
              >
                <optgroup label="On the site now">
                  {FONTS.filter((x) => !x.google).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </optgroup>
                {GROUPS.map((gr) => (
                  <optgroup key={gr.kind} label={`Google · ${gr.label}`}>
                    {FONTS.filter((x) => x.google && x.kind === gr.kind).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="min-w-0 self-center overflow-hidden rounded-xl bg-black p-5" style={{ fontFamily: f?.stack }}>
              <p className={`${SAMPLE[s.key].cls} ${s.key === "title" ? "font-light" : ""}`}>
                {s.key === "title" ? <>Every piece holds a <span className="text-honey italic">memory.</span></> : SAMPLE[s.key].text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
