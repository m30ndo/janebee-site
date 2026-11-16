/** Shared views render on the light website and inside the dark app. */
export type Tone = "light" | "dark";

export const solidBtn = (t: Tone) =>
  `btn-sheen rounded-full py-4 font-medium transition-colors ${t === "dark" ? "bg-honey text-black hover:bg-white" : "bg-espresso text-cream"}`;

export const outlineBtn = (t: Tone) =>
  `rounded-full py-4 font-medium transition-colors ${t === "dark" ? "border border-cream/50 hover:border-honey hover:bg-honey hover:text-black" : "border border-espresso hover:bg-espresso hover:text-cream"}`;

export const panel = (t: Tone) => (t === "dark" ? "bg-cream/[0.06]" : "bg-white");
export const imgBg = (t: Tone) => (t === "dark" ? "bg-white/[0.04]" : "bg-[#efe9df]");
export const rule = (t: Tone) => (t === "dark" ? "border-white/15" : "border-espresso/15");
