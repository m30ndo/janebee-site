import type { Painting, Room } from "@/lib/painting";

/** Room geometry (metres). One collection = one room. */
export const ROOM_WIDTH = 10;
export const ROOM_HEIGHT = 4.4;
export const EYE_HEIGHT = 1.65;
export const HANG_HEIGHT = 1.75; // centre line of the works
const SPACING = 4.2;
const START = 3.2;

export type Hung = {
  painting: Painting;
  position: [number, number, number];
  rotationY: number;
  width: number;
  height: number;
  /** Where to stand, and which way to face, to view this work. */
  viewPosition: [number, number, number];
  viewYaw: number;
};

export function roomLength(count: number) {
  return Math.max(12, START + Math.ceil(count / 2) * SPACING + 2.5);
}

/** Size a work on the wall: true proportions, scaled so it reads well in VR-ish space. */
function sizeFor(p: Painting): { width: number; height: number } {
  const aspect =
    p.imageWidth && p.imageHeight ? p.imageWidth / p.imageHeight :
    p.widthCm && p.heightCm ? p.widthCm / p.heightCm : 0.75;
  const longestCm = Math.max(p.widthCm ?? 70, p.heightCm ?? 90);
  const longest = Math.min(2.3, Math.max(1.3, (longestCm / 100) * 1.6));
  return aspect >= 1 ? { width: longest, height: longest / aspect } : { width: longest * aspect, height: longest };
}

/** Hang works alternately on the left and right walls, front to back. */
export function hangRoom(room: Room): Hung[] {
  const half = ROOM_WIDTH / 2;
  return room.paintings.map((painting, i) => {
    const left = i % 2 === 0;
    const z = -(START + Math.floor(i / 2) * SPACING);
    const { width, height } = sizeFor(painting);
    const x = left ? -half + 0.004 : half - 0.004; // frames are built out from the wall surface
    return {
      painting,
      position: [x, HANG_HEIGHT, z],
      rotationY: left ? Math.PI / 2 : -Math.PI / 2,
      width,
      height,
      viewPosition: [left ? -half + 2.9 : half - 2.9, EYE_HEIGHT, z],
      viewYaw: left ? Math.PI / 2 : -Math.PI / 2,
    };
  });
}
