"use client";

import type { ReactNode } from "react";
import * as THREE from "three";
import type { FrameStyle } from "@/lib/painting";

/**
 * Picture frames built from simple bars around the work. Everything is
 * measured from the wall (z = 0) outwards, in metres.
 */
type Mat = { color: string; roughness: number; metalness?: number };
/** A moulding ring: `offset` is the gap from the opening to the ring's inner edge. */
type Ring = { width: number; depth: number; mat: Mat; offset?: number };

export type FrameSpec = {
  rings: Ring[];
  /** white mount board between frame and work */
  mount?: number;
  /** gap between a float frame and the work */
  gap?: number;
  /** distance of the painted surface from the wall */
  artZ: number;
  /** total border width around the work (for shadows and plaques) */
  border: number;
  /** canvas edge depth when unframed */
  canvasDepth?: number;
};

const black: Mat = { color: "#141110", roughness: 0.45 };

export const frameSpecs: Record<FrameStyle, FrameSpec> = {
  black: { rings: [{ width: 0.045, depth: 0.05, mat: black }], artZ: 0.04, border: 0.045 },
  white: { rings: [{ width: 0.045, depth: 0.05, mat: { color: "#efece6", roughness: 0.55 } }], artZ: 0.04, border: 0.045 },
  oak: { rings: [{ width: 0.065, depth: 0.055, mat: { color: "#b8895a", roughness: 0.7 } }], artZ: 0.04, border: 0.065 },
  walnut: { rings: [{ width: 0.065, depth: 0.055, mat: { color: "#4a3122", roughness: 0.55 } }], artZ: 0.04, border: 0.065 },
  gold: {
    rings: [
      { width: 0.12, depth: 0.05, mat: { color: "#9c7128", roughness: 0.45, metalness: 0.85 } },
      { width: 0.03, depth: 0.085, mat: { color: "#c99a3f", roughness: 0.3, metalness: 0.9 }, offset: 0.09 },
      { width: 0.035, depth: 0.072, mat: { color: "#b8893a", roughness: 0.35, metalness: 0.9 } },
      { width: 0.012, depth: 0.062, mat: { color: "#e6c46a", roughness: 0.22, metalness: 0.95 }, offset: 0.045 },
    ],
    artZ: 0.05,
    border: 0.12,
  },
  brass: { rings: [{ width: 0.016, depth: 0.04, mat: { color: "#b5915a", roughness: 0.28, metalness: 0.92 } }], artZ: 0.03, border: 0.016 },
  mounted: { rings: [{ width: 0.035, depth: 0.045, mat: black }], mount: 0.13, artZ: 0.032, border: 0.165 },
  float: { rings: [{ width: 0.02, depth: 0.075, mat: black }], gap: 0.03, artZ: 0.055, border: 0.05 },
  canvas: { rings: [], artZ: 0.035, border: 0, canvasDepth: 0.035 },
};

/** Four bars around a w × h opening. */
function Bars({ w, h, b, depth, mat, env }: { w: number; h: number; b: number; depth: number; mat: Mat; env: THREE.Texture | null }) {
  const m = <meshStandardMaterial color={mat.color} roughness={mat.roughness} metalness={mat.metalness ?? 0} envMap={mat.metalness ? env : null} envMapIntensity={1.2} />;
  const z = depth / 2;
  return (
    <group>
      <mesh position={[0, h / 2 + b / 2, z]}><boxGeometry args={[w + b * 2, b, depth]} />{m}</mesh>
      <mesh position={[0, -h / 2 - b / 2, z]}><boxGeometry args={[w + b * 2, b, depth]} />{m}</mesh>
      <mesh position={[-w / 2 - b / 2, 0, z]}><boxGeometry args={[b, h, depth]} />{m}</mesh>
      <mesh position={[w / 2 + b / 2, 0, z]}><boxGeometry args={[b, h, depth]} />{m}</mesh>
    </group>
  );
}

/** Frame (and mount / float gap) around a work of `width` × `height`. */
export function Frame({ style, width, height, env, children }: {
  style: FrameStyle; width: number; height: number; env: THREE.Texture | null; children?: ReactNode;
}) {
  const s = frameSpecs[style];
  const inner = (s.mount ?? 0) + (s.gap ?? 0);
  const ow = width + inner * 2, oh = height + inner * 2; // opening the frame wraps

  return (
    <group>
      {/* mouldings */}
      {s.rings.map((r, i) => {
        const o = r.offset ?? 0;
        return <Bars key={i} w={ow + o * 2} h={oh + o * 2} b={r.width} depth={r.depth} mat={r.mat} env={env} />;
      })}

      {/* backing board inside the frame (shows as the dark shadow gap on float frames) */}
      {s.rings.length > 0 && (
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[ow, oh]} />
          <meshStandardMaterial color={s.gap ? "#0b0a09" : "#1a1715"} roughness={1} />
        </mesh>
      )}

      {/* white mount with a bevelled window */}
      {s.mount && (
        <group position={[0, 0, s.artZ - 0.004]}>
          <mesh>
            <planeGeometry args={[ow, oh]} />
            <meshStandardMaterial color="#f6f3ec" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[width + 0.012, height + 0.012]} />
            <meshStandardMaterial color="#fffdf8" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* float frames: the work sits proud on a hidden block */}
      {s.gap && (
        <mesh position={[0, 0, s.artZ / 2]}>
          <boxGeometry args={[width - 0.02, height - 0.02, s.artZ - 0.004]} />
          <meshStandardMaterial color="#0b0a09" />
        </mesh>
      )}

      {/* unframed canvas: wrapped edges */}
      {s.canvasDepth && (
        <mesh position={[0, 0, s.canvasDepth / 2]}>
          <boxGeometry args={[width, height, s.canvasDepth - 0.001]} />
          <meshStandardMaterial color="#d8d2c6" roughness={0.95} />
        </mesh>
      )}

      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ light + shadow textures */

let wash: THREE.CanvasTexture | null = null;
/**
 * The pool of light a ceiling spot throws on the wall: an oval brightest just
 * above the work, feathering to nothing well inside the edges (no hard box).
 */
export function getWashTexture() {
  if (wash) return wash;
  const W = 512, H = 640;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.save();
  g.translate(W / 2, H * 0.44);
  g.scale(1, 1.32);
  const R = W * 0.48;
  const grd = g.createRadialGradient(0, -R * 0.05, 0, 0, 0, R);
  // smoothstep-like falloff
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const v = 1 - t * t * (3 - 2 * t);
    grd.addColorStop(t, `rgba(255,236,205,${(Math.pow(v, 1.6) * 0.8).toFixed(3)})`);
  }
  g.fillStyle = grd;
  g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
  g.restore();
  wash = new THREE.CanvasTexture(c);
  wash.colorSpace = THREE.SRGBColorSpace;
  return wash;
}

let shadow: THREE.CanvasTexture | null = null;
/** Soft drop shadow for a frame: a blurred rectangle on a transparent canvas. */
export function getShadowTexture() {
  if (shadow) return shadow;
  const S = 256, pad = 48;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  // draw the rectangle off-canvas and let only its blurred shadow land inside (works in Safari too)
  g.shadowColor = "rgba(0,0,0,1)";
  g.shadowBlur = 34;
  g.shadowOffsetX = S * 2;
  g.fillStyle = "#000";
  g.fillRect(pad - S * 2, pad, S - pad * 2, S - pad * 2);
  shadow = new THREE.CanvasTexture(c);
  return shadow;
}
/** Fraction of the shadow plane taken up by padding on each side. */
export const SHADOW_PAD = 48 / 256;
