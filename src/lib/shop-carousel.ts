/**
 * The shop's 3D carousel (Arcwave-style): cards around a cylinder that turns
 * on its own, drags with momentum and links through. Kept as one value in
 * `site_settings` (key "shop_carousel"), edited in Studio → Shop carousel.
 * With no slides it shows the shop's originals, then prints.
 */
import type { Painting } from "@/lib/painting";
import { formatPrice } from "@/lib/painting";
import type { ShopProduct } from "@/lib/data";
import { imageUrl } from "@/lib/supabase/public";

export type SlideSource = "original" | "product" | "custom";

export type ShopSlide = {
  id: string;
  source: SlideSource;
  /** painting id (original) or product id (product) */
  refId: string;
  /** optional image that replaces the work's own photo; required for custom slides */
  image_path: string;
  /** empty = the work's title */
  title: string;
  /** empty = price / medium for works */
  description: string;
  /** empty = the work's page; required for custom slides */
  link: string;
  active: boolean;
};

export const AUTOPLAY = [
  { key: "continuous", label: "Glide continuously" },
  { key: "step", label: "Step card by card" },
  { key: "off", label: "Off (drag or scroll only)" },
] as const;
export const CARD_SIZES = [
  { key: "small", label: "Small", w: 220 },
  { key: "medium", label: "Medium", w: 280 },
  { key: "large", label: "Large", w: 340 },
] as const;
export const CURVES = [
  { key: "towards", label: "Curves towards you (wraps around)" },
  { key: "away", label: "Curves away (a drum)" },
] as const;
export const SIDE_EFFECTS = [
  { key: "fade", label: "Fade" },
  { key: "darken", label: "Darken" },
  { key: "blur", label: "Blur" },
  { key: "none", label: "None" },
] as const;
export const CAPTIONS = [
  { key: "hover", label: "On hover" },
  { key: "always", label: "Always" },
  { key: "never", label: "Never" },
] as const;

type Key<T extends readonly { key: string }[]> = T[number]["key"];

export type ShopCarouselSettings = {
  enabled: boolean;
  autoplay: Key<typeof AUTOPLAY>;
  /** seconds per card */
  speed: number;
  direction: "left" | "right";
  cardSize: Key<typeof CARD_SIZES>;
  curve: Key<typeof CURVES>;
  /** 1 (gentle) … 10 (tight) */
  bend: number;
  sides: Key<typeof SIDE_EFFECTS>;
  captions: Key<typeof CAPTIONS>;
  pauseOnHover: boolean;
  /** small label above it, and the line under that */
  kicker: string;
  heading: string;
};

export const DEFAULT_SETTINGS: ShopCarouselSettings = {
  enabled: true, autoplay: "continuous", speed: 5, direction: "left", cardSize: "medium", curve: "towards", bend: 5,
  sides: "fade", captions: "hover", pauseOnHover: true, kicker: "Fresh off the easel", heading: "",
};

export type ShopCarousel = { settings: ShopCarouselSettings; slides: ShopSlide[] };

const pick = <T extends readonly { key: string }[]>(list: T, v: unknown, d: Key<T>): Key<T> =>
  (list.some((x) => x.key === v) ? v : d) as Key<T>;
const num = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function normaliseSettings(v: unknown): ShopCarouselSettings {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : d.enabled,
    autoplay: pick(AUTOPLAY, o.autoplay, d.autoplay),
    speed: num(o.speed, 1, 20, d.speed),
    direction: o.direction === "right" ? "right" : "left",
    cardSize: pick(CARD_SIZES, o.cardSize, d.cardSize),
    curve: pick(CURVES, o.curve, d.curve),
    bend: Math.round(num(o.bend, 1, 10, d.bend)),
    sides: pick(SIDE_EFFECTS, o.sides, d.sides),
    captions: pick(CAPTIONS, o.captions, d.captions),
    pauseOnHover: typeof o.pauseOnHover === "boolean" ? o.pauseOnHover : d.pauseOnHover,
    kicker: typeof o.kicker === "string" ? o.kicker.trim().slice(0, 60) : d.kicker,
    heading: s(o.heading).slice(0, 80),
  };
}

export function normaliseShopCarousel(v: unknown): ShopCarousel {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const slides = Array.isArray(o.slides) ? o.slides : [];
  return {
    settings: normaliseSettings(o.settings),
    slides: slides
      .filter((x) => x && typeof x === "object")
      .map((x: Record<string, unknown>) => ({
        id: s(x.id) || crypto.randomUUID(),
        source: (["original", "product", "custom"].includes(x.source as string) ? x.source : "custom") as SlideSource,
        refId: s(x.refId),
        image_path: s(x.image_path),
        title: s(x.title).slice(0, 80),
        description: s(x.description).slice(0, 200),
        link: s(x.link),
        active: x.active !== false,
      })),
  };
}

/** What the carousel draws. */
export type Card = { key: string; image: string; title: string; description: string; href: string; external: boolean; badge: string | null };

const isExternal = (href: string) => /^https?:\/\//i.test(href);
const tidyLink = (href: string, base: string) => {
  if (!href) return "";
  if (isExternal(href)) return href;
  if (/^[\w-]+\.[\w.-]+/.test(href)) return `https://${href}`; // "example.co.uk"
  const path = href.startsWith("/") ? href : `/${href}`;
  // keep members inside the app for site paths
  return base && !path.startsWith(base) ? `${base}${path}` : path;
};

const originalCard = (p: Painting, base: string): Omit<Card, "key"> | null =>
  p.image ? {
    image: p.image, title: p.title,
    description: [p.pricePence ? formatPrice(p.pricePence) : null, p.medium].filter(Boolean).join(" · "),
    href: `${base}/work/${p.slug}`, external: false, badge: "One of one",
  } : null;

const productCard = (p: ShopProduct, base: string): Omit<Card, "key"> | null => {
  if (!p.image) return null;
  const from = p.variants.length ? Math.min(...p.variants.map((v) => v.price_pence)) : null;
  return {
    image: p.image, title: p.name,
    description: [from != null ? `From ${formatPrice(from)}` : null, p.kind].filter(Boolean).join(" · "),
    href: `${base}/shop/${p.slug}`, external: false, badge: p.membersFirst ? "Hive first" : null,
  };
};

/**
 * Turn the stored slides into cards for this visitor. Works that aren't for sale
 * (or that this visitor can't see yet) drop out. No slides → the shop itself.
 */
export function resolveCards(c: ShopCarousel, originals: Painting[], products: ShopProduct[], base = ""): Card[] {
  const oById = new Map(originals.map((p) => [p.id, p]));
  const pById = new Map(products.map((p) => [p.id, p]));
  const live = c.slides.filter((x) => x.active);
  if (!live.length) {
    return [
      ...originals.map((p) => originalCard(p, base)),
      ...products.map((p) => productCard(p, base)),
    ].flatMap((card, i) => (card ? [{ ...card, key: `auto-${i}` }] : []));
  }
  return live.flatMap((x): Card[] => {
    const own = imageUrl(x.image_path);
    let card: Omit<Card, "key"> | null = null;
    if (x.source === "original") { const p = oById.get(x.refId); card = p ? originalCard(p, base) : null; }
    else if (x.source === "product") { const p = pById.get(x.refId); card = p ? productCard(p, base) : null; }
    if (x.source !== "custom" && !card) return []; // sold, hidden or members-only for this visitor
    const href = x.link ? tidyLink(x.link, base) : card?.href ?? "";
    const image = own ?? card?.image;
    if (!image) return [];
    return [{
      key: x.id, image,
      title: x.title || card?.title || "",
      description: x.description || card?.description || "",
      href, external: isExternal(href), badge: card?.badge ?? null,
    }];
  });
}
