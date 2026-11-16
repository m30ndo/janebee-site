import * as THREE from "three";
import type { FloorStyle } from "@/lib/painting";

/**
 * Procedural gallery floors — painted to a canvas, so no image files to download.
 * Each texture tile covers TILE metres of floor.
 */
export const TILE = 2;

type Floor = { map: THREE.CanvasTexture; roughness: number; metalness: number; envIntensity: number };

const cache = new Map<FloorStyle, Floor>();

// deterministic pseudo-random so floors look the same every visit
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function canvas(size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return { c, g: c.getContext("2d")! };
}

function grain(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, base: [number, number, number], r: () => number, vertical: boolean) {
  const [R, G, B] = base;
  const shade = (r() - 0.5) * 26;
  g.fillStyle = `rgb(${R + shade},${G + shade * 0.85},${B + shade * 0.7})`;
  g.fillRect(x, y, w, h);
  // fine grain lines
  const lines = 14 + Math.floor(r() * 10);
  for (let i = 0; i < lines; i++) {
    const t = r();
    g.strokeStyle = `rgba(${R * 0.55},${G * 0.5},${B * 0.45},${0.08 + r() * 0.14})`;
    g.lineWidth = 0.6 + r() * 1.6;
    g.beginPath();
    const amp = 2 + r() * 5;
    const freq = 0.004 + r() * 0.01;
    const phase = r() * 10;
    if (vertical) {
      const gx = x + t * w;
      for (let yy = y; yy <= y + h; yy += 6) g.lineTo(gx + Math.sin(yy * freq + phase) * amp, yy);
    } else {
      const gy = y + t * h;
      for (let xx = x; xx <= x + w; xx += 6) g.lineTo(xx, gy + Math.sin(xx * freq + phase) * amp);
    }
    g.stroke();
  }
  // occasional knot
  if (r() < 0.12) {
    const kx = x + r() * w, ky = y + r() * h;
    const grad = g.createRadialGradient(kx, ky, 0, kx, ky, 10 + r() * 8);
    grad.addColorStop(0, `rgba(${R * 0.4},${G * 0.35},${B * 0.3},0.55)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(kx - 20, ky - 20, 40, 40);
  }
  // seam
  g.strokeStyle = "rgba(0,0,0,0.35)";
  g.lineWidth = 2;
  g.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

function boards(base: [number, number, number], seed: number) {
  const { c, g } = canvas();
  const r = rng(seed);
  const plank = 1024 / 10; // 20cm planks across a 2m tile
  for (let col = 0; col < 10; col++) {
    let y = -r() * 600;
    while (y < 1024) {
      const len = 380 + r() * 520;
      grain(g, col * plank, y, plank, len, base, r, true);
      y += len;
    }
  }
  return c;
}

function herringbone(base: [number, number, number], seed: number) {
  const { c, g } = canvas();
  const r = rng(seed);
  // blocks 4:1 (≈50 × 12.5cm). One "staircase" strip of horizontal + vertical
  // blocks, repeated every 8 block-widths; the pattern tiles seamlessly at 1024px.
  const w = 64, l = 256;
  for (let strip = -3; strip <= 3; strip++) {
    const oy = strip * 8 * w;
    for (let k = -20; k <= 20; k++) {
      const x = k * w, y = oy + k * w;
      grain(g, x, y, l, w, base, r, false);
      grain(g, x, y + w, w, l, base, r, true);
    }
  }
  return c;
}

function concrete(seed: number) {
  const { c, g } = canvas();
  const r = rng(seed);
  g.fillStyle = "#8d8a85";
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) {
    const x = r() * 1024, y = r() * 1024, rad = 6 + r() * 70;
    const v = 120 + r() * 40;
    const grad = g.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(${v},${v - 2},${v - 6},${0.05 + r() * 0.08})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // saw-cut joints every metre
  g.strokeStyle = "rgba(40,38,36,0.45)";
  g.lineWidth = 3;
  [0, 512].forEach((p) => { g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 1024); g.moveTo(0, p); g.lineTo(1024, p); g.stroke(); });
  return c;
}

function marble(seed: number) {
  const { c, g } = canvas();
  const r = rng(seed);
  g.fillStyle = "#efece6";
  g.fillRect(0, 0, 1024, 1024);
  g.filter = "blur(1.2px)";
  for (let i = 0; i < 22; i++) {
    g.strokeStyle = `rgba(${110 + r() * 40},${105 + r() * 40},${100 + r() * 40},${0.12 + r() * 0.3})`;
    g.lineWidth = 0.6 + r() * 3;
    g.beginPath();
    let x = r() * 1024, y = -20;
    g.moveTo(x, y);
    while (y < 1050) {
      x += (r() - 0.5) * 60;
      y += 20 + r() * 50;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.filter = "none";
  // tile joints (60cm)
  g.strokeStyle = "rgba(160,150,140,0.5)";
  g.lineWidth = 2;
  for (let p = 0; p <= 1024; p += 1024 / (TILE / 0.6)) {
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 1024); g.moveTo(0, p); g.lineTo(1024, p); g.stroke();
  }
  return c;
}

function dark(seed: number) {
  const { c, g } = canvas(512);
  const r = rng(seed);
  g.fillStyle = "#2a2624";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6000; i++) {
    const v = 34 + r() * 30;
    g.fillStyle = `rgba(${v},${v},${v},0.25)`;
    g.fillRect(r() * 512, r() * 512, 1, 1);
  }
  return c;
}

export function getFloor(style: FloorStyle): Floor {
  const hit = cache.get(style);
  if (hit) return hit;
  const make = (): [HTMLCanvasElement, number, number, number] => {
    switch (style) {
      case "herringbone": return [herringbone([170, 122, 78], 11), 0.55, 0, 0.4];
      case "walnut": return [boards([96, 62, 40], 7), 0.45, 0, 0.5];
      case "concrete": return [concrete(5), 0.7, 0, 0.3];
      case "dark": return [dark(9), 0.28, 0.15, 1];
      case "oak": return [boards([196, 156, 112], 13), 0.6, 0, 0.35];
      default: return [marble(3), 0.18, 0.05, 0.9];
    }
  };
  const [c, roughness, metalness, envIntensity] = make();
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  const floor = { map, roughness, metalness, envIntensity };
  cache.set(style, floor);
  return floor;
}
