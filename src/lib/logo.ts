import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient, imageUrl } from "@/lib/supabase/public";

/**
 * The site logo, set in Studio → Logo. Every bee on the site and in the app
 * loads /logo, which serves whichever logo is live today:
 *   1. a seasonal logo whose dates include today (latest start wins), else
 *   2. the default logo, else
 *   3. the built-in bee.
 * With "buzz" on, an acid-pink copy jitters behind it (still for reduced motion).
 */
export type LogoRow = {
  id: string;
  name: string;
  image_path: string;
  mime: string | null;
  buzz: boolean;
  is_default: boolean;
  starts_on: string | null;
  ends_on: string | null;
};

export const FALLBACK: Pick<LogoRow, "image_path" | "mime" | "buzz"> = { image_path: "/brand/hive-logo-plain.svg", mime: "image/svg+xml", buzz: true };

/** Today in London, as YYYY-MM-DD. */
export function londonToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now);
}

export function pickLive(rows: LogoRow[], today: string): LogoRow | null {
  const seasonal = rows
    .filter((r) => (r.starts_on || r.ends_on) && (!r.starts_on || r.starts_on <= today) && (!r.ends_on || r.ends_on >= today))
    .sort((a, b) => (b.starts_on ?? "").localeCompare(a.starts_on ?? ""));
  return seasonal[0] ?? rows.find((r) => r.is_default) ?? null;
}

async function allLogos(): Promise<LogoRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const { data } = await publicClient().from("site_logos").select("id, name, image_path, mime, buzz, is_default, starts_on, ends_on");
  return (data ?? []) as LogoRow[];
}

/* 12 jitter positions (in % of the logo), 12 a second: stop-motion buzz */
const JITTER = [[5, 5], [-4, 5], [-5, -4], [4, -5], [6, 2], [5, 5], [-5, 3], [3, -5], [5, 5], [-3, -4], [6, 4], [4, 6]];

function sniffMime(bytes: Uint8Array, hint: string | null) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return "image/gif";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[8] === 0x57 && bytes[9] === 0x45) return "image/webp";
  const head = new TextDecoder().decode(bytes.slice(0, 512));
  if (head.includes("<svg")) return "image/svg+xml";
  return hint || "image/png";
}

/**
 * The logo wrapped in our own SVG. The uploaded file is embedded as a data URI
 * inside an <image>, so even an SVG upload is shown as a picture only: any
 * script or external link inside it never runs (and /logo also sends a strict CSP).
 */
async function render(origin: string, row: Pick<LogoRow, "image_path" | "mime" | "buzz">, still: boolean) {
  const src = imageUrl(row.image_path)!;
  const res = await fetch(src.startsWith("/") ? origin + src : src);
  if (!res.ok) throw new Error(`logo fetch ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const mime = sniffMime(bytes, row.mime);
  const data = `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
  const img = `<image href="${data}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>`;
  if (!row.buzz) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">${img}</svg>`;
  }
  const kf = JITTER.map(([x, y], i) => `${((i * 100) / JITTER.length).toFixed(2)}%{transform:translate(${x}px,${y}px)}`).join("");
  const style = still
    ? ""
    : `<style>.o{animation:b 1s steps(1,end) infinite}.h{animation:h 3.2s ease-in-out infinite;transform-origin:50px 50px}@keyframes b{${kf}}@keyframes h{0%,82%,100%{transform:translateY(0)}88%{transform:translateY(-4px) rotate(-3deg)}94%{transform:translateY(0) rotate(2deg)}}@media (prefers-reduced-motion:reduce){.o,.h{animation:none}}</style>`;
  const pink = still ? `<g transform="translate(5 5)" filter="url(#p)">${img}</g>` : `<g class="o" filter="url(#p)">${img}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 112" width="512" height="512">${style}<defs><filter id="p"><feFlood flood-color="#ee3f8c"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs><g class="h">${pink}<g>${img}</g></g></svg>`;
}

/** The live logo as SVG text. Cached; Studio → Logo clears it on save. */
export async function liveLogoSvg(origin: string, still: boolean): Promise<string> {
  "use cache";
  cacheTag("logo");
  cacheLife("hours");
  const row = pickLive(await allLogos(), londonToday()) ?? FALLBACK;
  try {
    return await render(origin, row, still);
  } catch {
    return render(origin, FALLBACK, still);
  }
}

/** One specific logo (Studio previews). */
export async function logoSvgById(origin: string, id: string, still: boolean): Promise<string | null> {
  "use cache";
  cacheTag("logo");
  cacheLife("hours");
  const row = (await allLogos()).find((r) => r.id === id);
  return row ? render(origin, row, still) : null;
}
