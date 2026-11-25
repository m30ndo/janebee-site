/**
 * The site's five type slots and the fonts they can use. Chosen in
 * Studio → Settings → Typography (super admins only); stored in
 * `site_settings` under the key "typography".
 */

export const SLOTS = [
  { key: "title", label: "Title", hint: "The big statements: page openers, the gallery welcome, the Jane Bee wordmark." },
  { key: "h1", label: "Heading 1", hint: "Page and story headlines." },
  { key: "h2", label: "Heading 2", hint: "Section headings, card titles, quotes, prices." },
  { key: "menu", label: "Menu", hint: "The big links in the site menu (Home, Work, Shop…)." },
  { key: "body", label: "Paragraph", hint: "Body copy, buttons, small labels." },
] as const;

export type SlotKey = (typeof SLOTS)[number]["key"];
export type Typography = Record<SlotKey, string>;

export type FontOption = {
  id: string;
  label: string;
  /** CSS font-family stack */
  stack: string;
  /** Google Fonts css2 family spec; absent for fonts bundled with the site */
  google?: string;
  kind: "serif" | "sans" | "display" | "hand";
};

const g = (name: string, axes: string, kind: FontOption["kind"], fallback: string): FontOption => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  label: name,
  stack: `"${name}", ${fallback}`,
  google: axes ? `${name.replace(/\s+/g, "+")}:${axes}` : name.replace(/\s+/g, "+"),
  kind,
});

const SERIF = "Georgia, serif";
const SANS = "system-ui, sans-serif";

export const FONTS: FontOption[] = [
  // bundled with the site (no extra download)
  { id: "fraunces", label: "Fraunces (current)", stack: "var(--font-fraunces), Georgia, serif", kind: "serif" as const },
  { id: "dm-sans", label: "DM Sans (current)", stack: "var(--font-dm-sans), system-ui, sans-serif", kind: "sans" },
  { id: "soul-handwriting", label: "Soul Handwriting (brand scribble)", stack: "var(--font-soul-hand), cursive", kind: "hand" },
  // serif
  g("Playfair Display", "ital,wght@0,400..900;1,400..900", "serif", SERIF),
  g("Cormorant Garamond", "ital,wght@0,300..700;1,300..700", "serif", SERIF),
  g("DM Serif Display", "ital@0;1", "serif", SERIF),
  g("Bodoni Moda", "ital,opsz,wght@0,6..96,400..900;1,6..96,400..900", "serif", SERIF),
  g("Libre Caslon Display", "", "serif", SERIF),
  g("Instrument Serif", "ital@0;1", "serif", SERIF),
  g("Young Serif", "", "serif", SERIF),
  g("Newsreader", "ital,opsz,wght@0,6..72,200..800;1,6..72,200..800", "serif", SERIF),
  // display
  g("Abril Fatface", "", "display", SERIF),
  g("Anton", "", "display", SANS),
  g("Bebas Neue", "", "display", SANS),
  g("Archivo Black", "", "display", SANS),
  g("Syne", "wght@400..800", "display", SANS),
  g("Unbounded", "wght@200..900", "display", SANS),
  g("Bricolage Grotesque", "opsz,wght@12..96,200..800", "display", SANS),
  // sans
  g("Inter", "ital,opsz,wght@0,14..32,100..900;1,14..32,100..900", "sans", SANS),
  g("Manrope", "wght@200..800", "sans", SANS),
  g("Space Grotesk", "wght@300..700", "sans", SANS),
  g("Work Sans", "ital,wght@0,100..900;1,100..900", "sans", SANS),
  g("Karla", "ital,wght@0,200..800;1,200..800", "sans", SANS),
  g("Outfit", "wght@100..900", "sans", SANS),
  g("Jost", "ital,wght@0,100..900;1,100..900", "sans", SANS),
  g("Archivo", "ital,wght@0,100..900;1,100..900", "sans", SANS),
  // hand
  g("Permanent Marker", "", "hand", "cursive"),
  g("Caveat", "wght@400..700", "hand", "cursive"),
  g("Rock Salt", "", "hand", "cursive"),
  g("Gloria Hallelujah", "", "hand", "cursive"),
];

export const DEFAULT_TYPOGRAPHY: Typography = { title: "fraunces", h1: "fraunces", h2: "fraunces", menu: "fraunces", body: "dm-sans" };

export const fontById = (id: string | undefined) => FONTS.find((f) => f.id === id);

/** Clean a stored value: unknown ids fall back to the defaults. */
export function normaliseTypography(v: unknown): Typography {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const out = { ...DEFAULT_TYPOGRAPHY };
  for (const s of SLOTS) {
    const id = typeof o[s.key] === "string" ? (o[s.key] as string) : "";
    if (fontById(id)) out[s.key] = id;
  }
  // saved before the Menu slot existed: the menu used Heading 2, so keep it that way
  if (typeof o.menu !== "string") out.menu = out.h2;
  return out;
}

/** One Google Fonts stylesheet URL for every Google font in use, or null. */
export function googleFontsHref(t: Typography): string | null {
  const families = [...new Set(SLOTS.map((s) => fontById(t[s.key])?.google).filter(Boolean))] as string[];
  if (!families.length) return null;
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}

/** Classes that use each slot (font-serif is the Heading 2 alias). */
const SLOT_CLASSES: Record<SlotKey, string[]> = {
  title: [".font-title"], h1: [".font-h1"], h2: [".font-h2", ".font-serif"], menu: [".font-menu"], body: [],
};

/**
 * The :root rule that points the slots at the chosen fonts, plus "handwritten
 * mode" for any heading slot set to a script font: the layouts were set tight
 * for Fraunces, so scripts get taller lines, room above and below for their
 * loops, no squeezed tracking and no fake italic (a slanted script looks messy).
 * Unlayered, so it wins over the Tailwind utilities on the same elements.
 */
export function typographyCss(t: Typography): string {
  const changed = SLOTS.filter((s) => t[s.key] !== DEFAULT_TYPOGRAPHY[s.key]);
  if (!changed.length) return "";
  let css = `:root{${changed.map((s) => `--jb-${s.key}:${fontById(t[s.key])!.stack};`).join("")}}`;
  for (const s of SLOTS) {
    const sel = SLOT_CLASSES[s.key];
    if (!sel.length || fontById(t[s.key])?.kind !== "hand") continue;
    const all = sel.join(",");
    const inner = sel.flatMap((c) => [`${c} *`, `${c}.italic`]).join(",");
    css += `${all}{line-height:1.2;letter-spacing:normal;font-weight:400;font-style:normal!important}`;
    css += `${inner}{font-style:normal!important}`;
    // headings (not the menu, which handles its own) get breathing room for ascenders and descenders
    if (s.key !== "menu") css += sel.map((c) => `h1${c},h2${c},h3${c},p${c}`).join(",") + `{padding-block:.08em .14em}`;
  }
  return css;
}
