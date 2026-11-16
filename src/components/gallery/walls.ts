import * as THREE from "three";
import type { WallStyle } from "@/lib/painting";
import { ROOM_HEIGHT } from "./layout";

/**
 * Procedural wall finishes, painted to a canvas in the room's wall colour.
 * `tile` is how many metres one texture repeat covers (x, y).
 */
export type Wall = { map: THREE.CanvasTexture | null; tile: [number, number]; roughness: number };

const cache = new Map<string, Wall>();

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const css = ([r, g, b]: number[], a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
const shade = (c: number[], k: number) => c.map((v) => Math.max(0, Math.min(255, k >= 0 ? v + (255 - v) * k : v * (1 + k))));
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

/** Perceived lightness 0..1 — used to tune lighting for dark walls. */
export function luminance(hex: string) {
  const [r, g, b] = rgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

/** Fine per-pixel noise so flat paint doesn't look computer-flat. */
function speckle(g: CanvasRenderingContext2D, w: number, h: number, amount: number, r: () => number) {
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

/** Soft blob drawn so it wraps around the tile edges (seamless). */
function wrapBlob(g: CanvasRenderingContext2D, w: number, h: number, x: number, y: number, rad: number, colour: string) {
  for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
    const grd = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
    grd.addColorStop(0, colour);
    grd.addColorStop(1, colour.replace(/[\d.]+\)$/, "0)"));
    g.fillStyle = grd;
    g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
  }
}

function plaster(base: number[]) {
  const S = 256, { c, g } = canvas(S, S), r = rng(11);
  g.fillStyle = css(base); g.fillRect(0, 0, S, S);
  for (let i = 0; i < 14; i++) wrapBlob(g, S, S, r() * S, r() * S, 40 + r() * 70, css(shade(base, r() > 0.5 ? 0.05 : -0.04), 0.35));
  speckle(g, S, S, 6, r);
  return { c, tile: [2, 2] as [number, number], roughness: 0.95 };
}

function limewash(base: number[]) {
  const S = 512, { c, g } = canvas(S, S), r = rng(23);
  g.fillStyle = css(base); g.fillRect(0, 0, S, S);
  // cloudy, uneven coats
  for (let i = 0; i < 70; i++) {
    const light = r() > 0.45;
    wrapBlob(g, S, S, r() * S, r() * S, 30 + r() * 120, css(shade(base, light ? 0.1 + r() * 0.08 : -(0.06 + r() * 0.08)), 0.28));
  }
  // criss-cross brush marks
  for (let i = 0; i < 260; i++) {
    const x = r() * S, y = r() * S, a = (r() - 0.5) * 1.6, len = 20 + r() * 70;
    g.strokeStyle = css(shade(base, r() > 0.5 ? 0.12 : -0.1), 0.08);
    g.lineWidth = 3 + r() * 9;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5 + (r() - 0.5) * 14, x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  speckle(g, S, S, 8, r);
  return { c, tile: [3, 3] as [number, number], roughness: 1 };
}

/** Lower wainscot panels, a dado rail and a skirting board; plain paint above. */
function panelled(base: number[]) {
  const W = 256, H = 1024, { c, g } = canvas(W, H), r = rng(37);
  const pxPerM = H / ROOM_HEIGHT;
  const y = (m: number) => H - m * pxPerM; // metres from floor → canvas y
  g.fillStyle = css(base); g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) wrapBlob(g, W, H, r() * W, r() * H, 60 + r() * 60, css(shade(base, 0.04), 0.3));

  const light = css(shade(base, 0.35), 0.9), dark = css(shade(base, -0.3), 0.75);
  const panelTop = y(0.82), panelBottom = y(0.2), inset = 26;
  // raised panel: slightly lighter field with bevelled edges
  g.fillStyle = css(shade(base, 0.03)); g.fillRect(inset, panelTop, W - inset * 2, panelBottom - panelTop);
  g.lineWidth = 3;
  g.strokeStyle = dark; g.beginPath(); g.moveTo(inset, panelBottom); g.lineTo(inset, panelTop); g.lineTo(W - inset, panelTop); g.stroke();
  g.strokeStyle = light; g.beginPath(); g.moveTo(W - inset, panelTop); g.lineTo(W - inset, panelBottom); g.lineTo(inset, panelBottom); g.stroke();
  g.lineWidth = 1.5;
  g.strokeStyle = light; g.strokeRect(inset + 8, panelTop + 8, W - inset * 2 - 16, panelBottom - panelTop - 16);
  // dado rail
  const railTop = y(0.94), railBottom = y(0.88);
  const rail = g.createLinearGradient(0, railTop, 0, railBottom);
  rail.addColorStop(0, css(shade(base, 0.3))); rail.addColorStop(0.5, css(shade(base, 0.05))); rail.addColorStop(1, css(shade(base, -0.28)));
  g.fillStyle = rail; g.fillRect(0, railTop, W, railBottom - railTop);
  g.fillStyle = css(shade(base, -0.18), 0.5); g.fillRect(0, railBottom, W, 4); // shadow under the rail
  // skirting
  const sk = g.createLinearGradient(0, y(0.16), 0, H);
  sk.addColorStop(0, css(shade(base, 0.25))); sk.addColorStop(0.15, css(shade(base, -0.05))); sk.addColorStop(1, css(shade(base, -0.2)));
  g.fillStyle = sk; g.fillRect(0, y(0.16), W, H - y(0.16));
  speckle(g, W, H, 5, r);
  return { c, tile: [1, ROOM_HEIGHT] as [number, number], roughness: 0.85 };
}

/** Painted brick: the wall colour over a lightly textured stretcher bond. */
function brick(base: number[]) {
  const S = 512, { c, g } = canvas(S, S), r = rng(53);
  const cols = 5, rows = 14;
  const bw = S / cols, bh = S / rows, mortar = 4;
  g.fillStyle = css(shade(base, -0.22)); g.fillRect(0, 0, S, S);
  for (let row = 0; row < rows; row++) {
    const off = row % 2 ? bw / 2 : 0;
    for (let col = -1; col <= cols; col++) {
      const x = col * bw + off, yy = row * bh;
      const tone = shade(base, (r() - 0.5) * 0.16);
      g.fillStyle = css(tone);
      g.fillRect(x + mortar / 2, yy + mortar / 2, bw - mortar, bh - mortar);
      // bevel: light top edge, dark bottom edge
      g.fillStyle = css(shade(tone, 0.25), 0.6); g.fillRect(x + mortar / 2, yy + mortar / 2, bw - mortar, 2);
      g.fillStyle = css(shade(tone, -0.25), 0.6); g.fillRect(x + mortar / 2, yy + bh - mortar / 2 - 2, bw - mortar, 2);
      // pitted surface
      for (let k = 0; k < 18; k++) {
        g.fillStyle = css(shade(tone, -0.18), 0.35);
        g.fillRect(x + mortar + r() * (bw - mortar * 2), yy + mortar + r() * (bh - mortar * 2), 1 + r() * 2.5, 1 + r() * 2);
      }
    }
  }
  speckle(g, S, S, 10, r);
  return { c, tile: [1.15, 0.93] as [number, number], roughness: 0.95 };
}

/** Board-formed concrete: panel seams and tie holes, tinted slightly by the colour. */
function concrete(base: number[]) {
  const W = 512, H = 256, { c, g } = canvas(W, H), r = rng(71);
  const grey = mix([150, 146, 140], base, 0.3);
  g.fillStyle = css(grey); g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) wrapBlob(g, W, H, r() * W, r() * H, 20 + r() * 80, css(shade(grey, r() > 0.5 ? 0.12 : -0.12), 0.3));
  for (let i = 0; i < 500; i++) {
    g.fillStyle = css(shade(grey, -0.35), 0.4 * r());
    g.beginPath(); g.arc(r() * W, r() * H, 0.5 + r() * 1.6, 0, Math.PI * 2); g.fill();
  }
  // seams at the tile edges
  g.fillStyle = css(shade(grey, -0.3), 0.6); g.fillRect(0, 0, W, 2); g.fillRect(0, 0, 2, H);
  // tie holes
  for (const [x, y] of [[W * 0.15, H * 0.25], [W * 0.85, H * 0.25], [W * 0.15, H * 0.75], [W * 0.85, H * 0.75]]) {
    const grd = g.createRadialGradient(x, y, 1, x, y, 9);
    grd.addColorStop(0, css(shade(grey, -0.55))); grd.addColorStop(0.6, css(shade(grey, -0.3))); grd.addColorStop(1, css(grey, 0));
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
  }
  speckle(g, W, H, 14, r);
  return { c, tile: [2.4, 1.2] as [number, number], roughness: 0.9 };
}

const makers: Record<WallStyle, (b: number[]) => { c: HTMLCanvasElement; tile: [number, number]; roughness: number }> = {
  plaster, limewash, panelled, brick, concrete,
};

export function getWall(style: WallStyle, colour: string): Wall {
  const key = `${style}|${colour}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { c, tile, roughness } = (makers[style] ?? plaster)(rgb(colour));
  const map = new THREE.CanvasTexture(c);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = style === "panelled" ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const wall = { map, tile, roughness };
  cache.set(key, wall);
  return wall;
}
