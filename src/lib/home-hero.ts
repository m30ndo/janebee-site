/**
 * Home page hero layout, per device: how tall the photo is, where the headline
 * sits, and which part of the photo stays in view. Set by dragging in
 * Studio → Hero editor; stored in `site_settings` (key "home_hero").
 *
 * Phone < 768px · Tablet 768–1279px · Desktop ≥ 1280px.
 */
export const DEVICES = [
  { key: "phone", label: "Phone", width: 390, height: 844 },
  { key: "tablet", label: "Tablet", width: 820, height: 1180 },
  { key: "desktop", label: "Desktop", width: 1440, height: 900 },
] as const;
export type Device = (typeof DEVICES)[number]["key"];

export type HeroLayout = {
  /** photo height, % of the screen height */
  height: number;
  /** headline position inside the hero, 0–100 (0 = left/top edge, 100 = right/bottom edge) */
  textX: number;
  textY: number;
  /** the point of the photo that stays in view when it's cropped, 0–100 */
  focusX: number;
  focusY: number;
};
export type HomeHero = Record<Device, HeroLayout>;

export const HEIGHT_MIN = 30;
export const HEIGHT_MAX = 100;

export const DEFAULT_HERO: HomeHero = {
  phone: { height: 62, textX: 0, textY: 70, focusX: 50, focusY: 50 },
  tablet: { height: 60, textX: 0, textY: 70, focusX: 50, focusY: 50 },
  desktop: { height: 72, textX: 0, textY: 72, focusX: 50, focusY: 50 },
};

const clamp = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n * 10) / 10)) : d;
};

export function normaliseHero(v: unknown): HomeHero {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, Partial<HeroLayout>>;
  return Object.fromEntries(DEVICES.map(({ key }) => {
    const d = DEFAULT_HERO[key], x = o[key] ?? {};
    return [key, {
      height: clamp(x.height, HEIGHT_MIN, HEIGHT_MAX, d.height),
      textX: clamp(x.textX, 0, 100, d.textX),
      textY: clamp(x.textY, 0, 100, d.textY),
      focusX: clamp(x.focusX, 0, 100, d.focusX),
      focusY: clamp(x.focusY, 0, 100, d.focusY),
    }];
  })) as HomeHero;
}

/** The CSS custom properties the hero reads (see .home-hero in globals.css). */
export function heroVars(h: HomeHero): Record<string, string> {
  const out: Record<string, string> = {};
  const short = { phone: "p", tablet: "t", desktop: "d" } as const;
  for (const { key } of DEVICES) {
    const s = short[key], l = h[key];
    out[`--hh-${s}`] = `${l.height}svh`;
    out[`--hx-${s}`] = `${l.textX}%`;
    out[`--hy-${s}`] = `${l.textY}%`;
    out[`--fx-${s}`] = `${l.focusX}%`;
    out[`--fy-${s}`] = `${l.focusY}%`;
  }
  return out;
}
