"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const W = 1600;
const H = 440;

/** Paints the sign: black board, honey frame, the room name in white neon (clean serif capitals, easy to read). */
async function paintSign(name: string, tagline: string) {
  const css = getComputedStyle(document.body);
  const serif = css.getPropertyValue("--jb-h1").trim() || "Georgia";
  try {
    await Promise.all([document.fonts.load(`500 120px ${serif}`), document.fonts.load(`italic 300 40px ${serif}`)]);
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
  let size = 150;
  const font = () => `500 ${size}px ${serif}`;
  g.font = font();
  try { (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "8px"; } catch {}
  while (g.measureText(text).width > W - 240 && size > 50) {
    size -= 6;
    g.font = font();
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  const cx = W / 2, cy = tagline ? H / 2 - 22 : H / 2;
  g.save();
  g.translate(cx, cy);
  g.rotate(-0.035); // the brand's slight upward tilt
  // neon: several glow passes then a hot core
  for (const [blur, alpha] of [[50, 0.45], [22, 0.55], [8, 0.7]] as const) {
    g.shadowColor = `rgba(255,255,255,${alpha * 0.8})`;
    g.shadowBlur = blur;
    g.fillStyle = "#e6e7e8";
    g.fillText(text, 0, 0);
  }
  g.shadowBlur = 4;
  g.shadowColor = "#ffffff";
  g.fillStyle = "#ffffff";
  g.fillText(text, 0, 0);
  g.restore();

  // optional tagline in cream script
  g.shadowBlur = 0;
  try { (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px"; } catch {}
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
      <pointLight ref={light} color="#ffffff" intensity={2.2} distance={4.5} decay={2} position={[0, -0.1, 0.6]} />
    </group>
  );
}

const PW = 2000;
const PH = 170;

/** The yellow strapline block: black capitals, white dots. Returns where "SLIGHTLY" sits (0–1 across). */
async function paintPlaque(words: string[]) {
  const css = getComputedStyle(document.body);
  const sans = css.getPropertyValue("--jb-body").trim() || "Helvetica, Arial";
  try { await document.fonts.load(`600 80px ${sans}`); } catch {}
  const c = document.createElement("canvas");
  c.width = PW;
  c.height = PH;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e3a21a";
  g.fillRect(0, 0, PW, PH);

  let size = 78;
  const dot = "  ●  ";
  const setFont = () => {
    g.font = `600 ${size}px ${sans}`;
    try { (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${Math.round(size * 0.28)}px`; } catch {}
  };
  const measure = () => {
    setFont();
    return words.map((w) => g.measureText(w.toUpperCase()).width).reduce((a, b) => a + b, 0) + g.measureText(dot).width * (words.length - 1);
  };
  while (measure() > PW - 140 && size > 30) size -= 2;

  g.textBaseline = "middle";
  let x = (PW - measure()) / 2;
  const y = PH / 2 + 4;
  let slightly: [number, number] | null = null;
  words.forEach((w, i) => {
    if (i > 0) {
      g.fillStyle = "#ffffff";
      g.fillText(dot, x, y);
      x += g.measureText(dot).width;
    }
    const text = w.toUpperCase();
    if (text.startsWith("SLIGHTLY")) slightly = [x / PW, (x + g.measureText("SLIGHTLY").width) / PW];
    g.fillStyle = "#000000";
    g.fillText(text, x, y);
    x += g.measureText(text).width;
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, slightly: slightly as [number, number] | null };
}

const VW = 520;
const VH = 220;

/** "VERY", scribbled by hand in honey. */
async function paintVery() {
  const css = getComputedStyle(document.body);
  const hand = css.getPropertyValue("--font-soul-hand").trim() || "cursive";
  try { await document.fonts.load(`170px ${hand}`); } catch {}
  const c = document.createElement("canvas");
  c.width = VW;
  c.height = VH;
  const g = c.getContext("2d")!;
  g.font = `170px ${hand}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.translate(VW / 2, VH / 2 + 10);
  g.rotate(-0.12);
  // honey with a dark edge, so it reads on pale walls and dark walls alike
  g.lineJoin = "round";
  g.lineWidth = 12;
  g.strokeStyle = "rgba(0,0,0,0.85)";
  g.strokeText("Very", 0, 0);
  g.fillStyle = "#e3a21a";
  g.fillText("Very", 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));

/**
 * Hangs under the room sign at a cheeky tilt and gives a little shake every few
 * seconds. Soon after you walk in, SLIGHTLY gets struck through and "VERY" is
 * scribbled in above it.
 */
export function StraplinePlaque({ words, position, width = 4.4 }: { words: string[]; position: [number, number, number]; width?: number }) {
  const [art, setArt] = useState<{ tex: THREE.CanvasTexture; slightly: [number, number] | null; very: THREE.CanvasTexture } | null>(null);
  const group = useRef<THREE.Group>(null);
  const strike = useRef<THREE.Mesh>(null);
  const very = useRef<THREE.Mesh>(null);
  const started = useRef<number | null>(null);
  const key = words.join("|");

  useEffect(() => {
    let alive = true;
    Promise.all([paintPlaque(key.split("|")), paintVery()]).then(([p, v]) => {
      if (!alive) return;
      v.repeat.set(0, 1);
      setArt({ ...p, very: v });
    });
    return () => { alive = false; };
  }, [key]);

  const height = width * (PH / PW);
  const sl = art?.slightly;
  const slLeft = sl ? (sl[0] - 0.5) * width : 0;
  const slWidth = sl ? (sl[1] - sl[0]) * width : 0;
  const strikeW = slWidth * 1.12;
  const veryW = Math.max(slWidth * 1.35, 0.8);
  const veryH = veryW * (VH / VW);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const now = clock.elapsedTime;
    const t = now % 4.5;
    // rest at a slight upward tilt; between 3.7s and 4.3s, a quick wiggle
    const wiggle = t > 3.7 && t < 4.3 ? Math.sin((t - 3.7) * 40) * 0.045 * (1 - (t - 3.7) / 0.6) : 0;
    group.current.rotation.z = 0.04 + wiggle;

    if (!art || !sl) return;
    if (started.current === null) started.current = now;
    const since = now - started.current;
    const s = ease((since - 1.2) / 0.45); // the strike
    const v = ease((since - 1.8) / 0.9); // then VERY, written left to right
    if (strike.current) {
      strike.current.visible = s > 0;
      strike.current.scale.x = Math.max(s, 0.0001);
      strike.current.position.x = slLeft - (strikeW - slWidth) / 2 + (strikeW * s) / 2;
    }
    if (very.current) {
      very.current.visible = v > 0;
      very.current.scale.x = Math.max(v, 0.0001);
      very.current.position.x = slLeft + slWidth / 2 - veryW / 2 + (veryW * v) / 2;
      const map = (very.current.material as THREE.MeshBasicMaterial).map;
      if (map) map.repeat.x = v;
    }
  });

  return (
    <group ref={group} position={position}>
      {art && (
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={art.tex} toneMapped={false} />
        </mesh>
      )}
      {/* soft shadow behind it on the wall */}
      <mesh position={[0.04, -0.04, 0.05]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
      {art && sl && (
        <>
          <mesh ref={strike} visible={false} position={[slLeft, 0.005, 0.075]} rotation-z={-0.05}>
            <planeGeometry args={[strikeW, height * 0.09]} />
            <meshBasicMaterial color="#000000" toneMapped={false} />
          </mesh>
          <mesh ref={very} visible={false} position={[slLeft + slWidth / 2, height / 2 + veryH * 0.32, 0.08]}>
            <planeGeometry args={[veryW, veryH]} />
            <meshBasicMaterial map={art.very} transparent toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}
