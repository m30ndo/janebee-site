"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const W = 1600;
const H = 440;

/** Paints the sign: black board, honey frame, the name in white Punk Kid neon. */
async function paintSign(name: string, tagline: string) {
  const css = getComputedStyle(document.body);
  const punk = css.getPropertyValue("--font-punk-kid").trim() || "Impact";
  const serif = css.getPropertyValue("--font-fraunces").trim() || "Georgia";
  try {
    await Promise.all([document.fonts.load(`120px ${punk}`), document.fonts.load(`italic 300 40px ${serif}`)]);
  } catch {
    // fall back to whatever is available
  }

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  // board
  const r = 46;
  g.fillStyle = "#050505";
  g.beginPath();
  g.roundRect(14, 14, W - 28, H - 28, r);
  g.fill();
  // honey frame, double line
  g.strokeStyle = "#e3a21a";
  g.lineWidth = 5;
  g.beginPath();
  g.roundRect(30, 30, W - 60, H - 60, r - 14);
  g.stroke();
  g.lineWidth = 1.5;
  g.beginPath();
  g.roundRect(44, 44, W - 88, H - 88, r - 24);
  g.stroke();

  // the name, fitted to the board
  const text = name.toUpperCase();
  let size = 190;
  g.font = `${size}px ${punk}`;
  while (g.measureText(text).width > W - 220 && size > 60) {
    size -= 6;
    g.font = `${size}px ${punk}`;
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  const cx = W / 2, cy = tagline ? H / 2 - 22 : H / 2;
  g.save();
  g.translate(cx, cy);
  g.rotate(-0.035); // the brand's slight upward tilt
  // neon: several glow passes then a hot core
  for (const [blur, alpha] of [[60, 0.55], [30, 0.7], [12, 0.9]] as const) {
    g.shadowColor = `rgba(255,255,255,${alpha * 0.8})`;
    g.shadowBlur = blur;
    g.fillStyle = "#e6e7e8";
    g.fillText(text, 0, 0);
  }
  g.shadowBlur = 4;
  g.shadowColor = "#ffffff";
  g.fillStyle = "#ffc2dc";
  g.fillText(text, 0, 0);
  g.restore();

  // optional tagline in cream script
  g.shadowBlur = 0;
  if (tagline) {
    g.font = `italic 300 40px ${serif}`;
    g.fillStyle = "rgba(250,243,232,0.85)";
    g.fillText(tagline, cx, H - 82);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Neon-style room sign mounted above the doorway, with a gentle flicker and a soft white wash on the wall. */
export function NeonSign({ name, tagline = "", position, width = 4.6 }: { name: string; tagline?: string; position: [number, number, number]; width?: number }) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const seed = useMemo(() => [...name].reduce((n, c) => n + c.charCodeAt(0), 0) % 97, [name]);

  useEffect(() => {
    let alive = true;
    paintSign(name, tagline).then((t) => { if (alive) setTex(t); });
    return () => { alive = false; };
  }, [name, tagline]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    // mostly steady, with the odd neon stutter
    const stutter = Math.sin(t * 0.7) > 0.985 ? (Math.sin(t * 90) > 0 ? 0.55 : 1) : 1;
    const hum = 0.96 + Math.sin(t * 8) * 0.02;
    if (mat.current) mat.current.color.setScalar(stutter * hum);
    if (light.current) light.current.intensity = 2.2 * stutter * hum;
  });

  const height = width * (H / W);
  return (
    <group position={position}>
      {tex && (
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial ref={mat} map={tex} transparent toneMapped={false} />
        </mesh>
      )}
      {/* mounting rods */}
      {[-width * 0.38, width * 0.38].map((x) => (
        <mesh key={x} position={[x, height / 2 + 0.25, 0.03]}>
          <cylinderGeometry args={[0.01, 0.01, 0.5, 6]} />
          <meshStandardMaterial color="#7a7a7a" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <pointLight ref={light} color="#ff4fa0" intensity={2.2} distance={4.5} decay={2} position={[0, -0.1, 0.6]} />
    </group>
  );
}
