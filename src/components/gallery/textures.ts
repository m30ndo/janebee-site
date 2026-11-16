import * as THREE from "three";

/** Text rendered to a texture (no font downloads needed inside WebGL). */
export function makeTextTexture(
  lines: { text: string; size: number; weight?: number; italic?: boolean; family?: "sans" | "serif"; color?: string }[],
  opts: { width: number; height: number; align?: CanvasTextAlign; background?: string; padding?: number },
) {
  const scale = 2;
  const c = document.createElement("canvas");
  c.width = opts.width * scale;
  c.height = opts.height * scale;
  const g = c.getContext("2d")!;
  g.scale(scale, scale);
  if (opts.background) {
    g.fillStyle = opts.background;
    g.fillRect(0, 0, opts.width, opts.height);
  }
  const css = getComputedStyle(document.body);
  const sans = css.getPropertyValue("--font-dm-sans") || "system-ui";
  const serif = css.getPropertyValue("--font-fraunces") || "Georgia";
  const pad = opts.padding ?? 16;
  const align = opts.align ?? "left";
  g.textAlign = align;
  g.textBaseline = "top";
  const x = align === "center" ? opts.width / 2 : align === "right" ? opts.width - pad : pad;
  let y = pad;
  for (const l of lines) {
    g.font = `${l.italic ? "italic " : ""}${l.weight ?? 400} ${l.size}px ${l.family === "serif" ? serif : sans}, sans-serif`;
    g.fillStyle = l.color ?? "#2b1a12";
    g.fillText(l.text, x, y, opts.width - pad * 2);
    y += l.size * 1.35;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
