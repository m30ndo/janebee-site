"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import { TILE, getFloor } from "./floors";
import * as THREE from "three";
import type { FrameStyle, Painting, Room, WallStyle } from "@/lib/painting";
import { paintingNumber } from "@/lib/painting";
import { EYE_HEIGHT, HANG_HEIGHT, ROOM_HEIGHT, ROOM_WIDTH, hangRoom, roomLength, type Hung } from "./layout";
import { makeTextTexture } from "./textures";
import { Frame, SHADOW_PAD, frameSpecs, getShadowTexture, getWashTexture } from "./frames";
import { HEX, getHoneycomb, getWall, luminance } from "./walls";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { NeonSign } from "./NeonSign";
import { sfx } from "@/lib/sound";

/** Shared navigation state, driven by input and read every frame. */
export type Nav = {
  yaw: number;
  pitch: number;
  keys: Set<string>;
  walkTarget: THREE.Vector3 | null;
  focus: { position: THREE.Vector3; yaw: number } | null;
  moved: boolean; // has the visitor moved yet (hides the hint)
};

export function createNav(): Nav {
  return { yaw: 0, pitch: 0, keys: new Set(), walkTarget: null, focus: null, moved: false };
}

const CLICK_TOLERANCE = 6; // px of pointer travel still counted as a click

type SceneProps = {
  room: Room;
  /** Frame being previewed in the style picker (beats per-painting frames). */
  frameOverride?: FrameStyle | null;
  prevRoom: Room | null;
  nextRoom: Room | null;
  nav: RefObject<Nav>;
  paused: boolean;
  selectedSlug: string | null;
  onSelect: (p: Painting, hung: Hung) => void;
  onHover: (p: Painting | null) => void;
  /** room changes now come from the room list, not doors */
  onDoor: (dir: -1 | 1) => void;
  onFirstMove: () => void;
  onWalk: (to: THREE.Vector3) => void;
};

export function Scene(props: SceneProps) {
  const { room } = props;
  const hung = useMemo(() => hangRoom(room), [room]);
  const length = roomLength(room.paintings.length);
  const env = useEnvMap();
  const wallLum = luminance(room.wallColour);

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 14, 40]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#000000", 0.6]} />
      <directionalLight position={[2, 6, 3]} intensity={0.35} />

      <Shell room={room} length={length} onWalk={props.onWalk} />

      <Suspense fallback={null}>
        {hung.map((h) => (
          <Artwork
            key={h.painting.id}
            hung={h}
            frame={props.frameOverride ?? h.painting.frameStyle ?? room.frameStyle}
            env={env}
            wallLum={wallLum}
            selected={props.selectedSlug === h.painting.slug}
            onSelect={props.onSelect}
            onHover={props.onHover}
          />
        ))}
      </Suspense>

      <Controls {...props} length={length} />
    </>
  );
}

/** A soft studio reflection map so gilt and brass frames catch the light (no downloads). */
function useEnvMap() {
  const gl = useThree((s) => s.gl);
  const tex = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const t = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return t;
  }, [gl]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/* ------------------------------------------------------------------ room shell */

function Shell({ room, length, onWalk }: {
  room: Room; length: number; onWalk: (to: THREE.Vector3) => void;
}) {
  const half = ROOM_WIDTH / 2;
  const wall = room.wallColour;

  const onFloorClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_TOLERANCE) return;
    e.stopPropagation();
    onWalk(new THREE.Vector3(e.point.x, EYE_HEIGHT, e.point.z));
  };

  const intro = useMemo(
    () => (room.intro ? makeTextTexture([{ text: room.intro, size: 22, family: "serif", italic: true, color: "#4a4a4a" }], { width: 900, height: 44, align: "center", padding: 8 }) : null),
    [room.intro],
  );

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -length / 2]} onClick={onFloorClick}>
        <planeGeometry args={[ROOM_WIDTH, length]} />
        <Floor style={room.floorStyle} length={length} />
      </mesh>
      {/* ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM_HEIGHT, -length / 2]}>
        <planeGeometry args={[ROOM_WIDTH, length]} />
        <meshStandardMaterial color="#4f4f4f" roughness={1} />
      </mesh>
      {/* left / right walls */}
      <mesh rotation-y={Math.PI / 2} position={[-half, ROOM_HEIGHT / 2, -length / 2]}>
        <planeGeometry args={[length, ROOM_HEIGHT]} />
        <WallMaterial style={room.wallStyle} colour={wall} width={length} />
      </mesh>
      <mesh rotation-y={-Math.PI / 2} position={[half, ROOM_HEIGHT / 2, -length / 2]}>
        <planeGeometry args={[length, ROOM_HEIGHT]} />
        <WallMaterial style={room.wallStyle} colour={wall} width={length} />
      </mesh>
      {/* far + entrance walls */}
      <mesh position={[0, ROOM_HEIGHT / 2, -length]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <WallMaterial style={room.wallStyle} colour={wall} width={ROOM_WIDTH} />
      </mesh>
      {room.honeycomb && <Honeycomb colour={wall} position={[0, ROOM_HEIGHT / 2, -length + 0.008]} />}
      <mesh rotation-y={Math.PI} position={[0, ROOM_HEIGHT / 2, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <WallMaterial style={room.wallStyle} colour={wall} width={ROOM_WIDTH} />
      </mesh>

      {/* lighting track along each side of the ceiling */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (half - 1.1), ROOM_HEIGHT - 0.03, -length / 2]}>
          <boxGeometry args={[0.035, 0.03, length - 1]} />
          <meshStandardMaterial color="#151312" roughness={0.5} />
        </mesh>
      ))}

      {/* neon room sign over the far doorway */}
      <NeonSign name={room.name} position={[0, 3.5, -length + 0.02]} />
      {intro && (
        <mesh position={[0, 0.35, -length + 0.02]}>
          <planeGeometry args={[6, 0.3]} />
          <meshBasicMaterial map={intro} transparent toneMapped={false} />
        </mesh>
      )}

    </group>
  );
}

/** Honeycomb lines covering the far wall, behind the sign and the door. */
function Honeycomb({ colour, position }: { colour: string; position: [number, number, number] }) {
  const dark = luminance(colour) < 0.45;
  const map = useMemo(() => {
    const t = getHoneycomb(dark).clone();
    const rx = ROOM_WIDTH / (HEX * 1.5);
    t.repeat.set(rx, ROOM_HEIGHT / ((HEX * Math.sqrt(3)) / 2));
    // shift so a whole hexagon (tile middle) sits centred over the doorway
    t.offset.set(0.5 - ((rx / 2) % 1), 0);
    t.needsUpdate = true;
    return t;
  }, [dark]);
  return (
    <mesh position={position}>
      <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
      <meshStandardMaterial map={map} transparent depthWrite={false} roughness={0.9} />
    </mesh>
  );
}

function WallMaterial({ style, colour, width }: { style: WallStyle; colour: string; width: number }) {
  const wall = getWall(style, colour);
  const map = useMemo(() => {
    if (!wall.map) return null;
    const t = wall.map.clone();
    t.repeat.set(width / wall.tile[0], ROOM_HEIGHT / wall.tile[1]);
    t.needsUpdate = true;
    return t;
  }, [wall, width]);
  return <meshStandardMaterial key={`${style}${colour}`} map={map} color={map ? "#ffffff" : colour} roughness={wall.roughness} />;
}

function Floor({ style, length }: { style: Room["floorStyle"]; length: number }) {
  const size = useThree((st) => st.size);
  const floor = getFloor(style);
  const map = useMemo(() => {
    const t = floor.map.clone();
    t.repeat.set(ROOM_WIDTH / TILE, length / TILE);
    t.needsUpdate = true;
    return t;
  }, [floor, length]);
  const glossy = style === "marble" || style === "concrete";
  // real reflections on larger screens; phones get the lighter material
  if (glossy && size.width > 900) {
    return (
      <MeshReflectorMaterial
        map={map}
        roughness={floor.roughness}
        metalness={floor.metalness}
        blur={[300, 80]}
        resolution={512}
        mixBlur={1}
        mixStrength={0.9}
        mirror={0.3}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.2}
      />
    );
  }
  return <meshStandardMaterial map={map} roughness={floor.roughness} metalness={floor.metalness} />;
}

/* ------------------------------------------------------------------ artworks */

function Artwork({ hung, frame, env, wallLum, selected, onSelect, onHover }: {
  hung: Hung; frame: FrameStyle; env: THREE.Texture | null; wallLum: number; selected: boolean;
  onSelect: (p: Painting, h: Hung) => void; onHover: (p: Painting | null) => void;
}) {
  const { painting, position, rotationY, width, height } = hung;
  const [hover, setHover] = useState(false);
  const spec = frameSpecs[frame];
  const border = spec.border;
  const sold = painting.status === "sold";
  const washRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowRef = useRef(0);

  // light pools read more strongly on darker walls, like a real gallery
  const baseWash = 0.1 + 0.5 * (1 - wallLum) * (1 - wallLum) + 0.12 * (1 - wallLum);
  const shadowStrength = 0.38 + 0.3 * (1 - wallLum);

  useFrame((_, dt) => {
    const target = selected || hover ? 1 : 0;
    glowRef.current += (target - glowRef.current) * Math.min(1, dt * 5);
    if (washRef.current) washRef.current.opacity = baseWash * (1 + glowRef.current * 0.45);
  });

  const plaque = useMemo(
    () =>
      makeTextTexture(
        [
          { text: `${paintingNumber(painting.number)}  ${painting.title}`, size: 22, weight: 500 },
          { text: sold ? "Sold — the story stays" : painting.medium ?? "", size: 16, color: sold ? "#b0234f" : "#666666" },
        ],
        { width: 420, height: 72, background: "#ffffff", padding: 12 },
      ),
    [painting.number, painting.title, painting.medium, sold],
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_TOLERANCE) return;
    e.stopPropagation();
    onSelect(painting, hung);
  };

  const fw = width + border * 2, fh = height + border * 2;
  const lightUp = ROOM_HEIGHT - HANG_HEIGHT - 0.08; // ceiling, in the work's local space

  return (
    <group position={position} rotation-y={rotationY}>
      {/* the wash from the ceiling spot */}
      <mesh position={[0, 0.22, 0.002]}>
        <planeGeometry args={[fw + 1.9, fh + 2.3]} />
        <meshBasicMaterial ref={washRef} map={getWashTexture()} transparent opacity={baseWash} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* soft drop shadow, cast slightly downward by the light above */}
      <mesh position={[0, -0.055, 0.003]}>
        <planeGeometry args={[(fw + 0.05) / (1 - SHADOW_PAD * 2), (fh + 0.05) / (1 - SHADOW_PAD * 2)]} />
        <meshBasicMaterial color="#000000" map={getShadowTexture()} transparent opacity={shadowStrength} depthWrite={false} />
      </mesh>

      {/* the spot itself, on the ceiling track */}
      <group position={[0, lightUp, 1.1]} rotation-x={-0.75}>
        <mesh>
          <cylinderGeometry args={[0.045, 0.055, 0.16, 20]} />
          <meshStandardMaterial color="#151312" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.081, 0]} rotation-x={Math.PI / 2}>
          <circleGeometry args={[0.04, 20]} />
          <meshBasicMaterial color="#fff1d6" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh position={[0, lightUp + 0.06, 1.1]}>
        <boxGeometry args={[0.02, 0.06, 0.02]} />
        <meshStandardMaterial color="#151312" />
      </mesh>

      <Frame style={frame} width={width} height={height} env={env}>
        {/* the work */}
        <mesh
          position={[0, 0, spec.artZ]}
          onClick={handleClick}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover(painting); sfx.play("hover"); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHover(false); onHover(null); document.body.style.cursor = ""; }}
        >
          <planeGeometry args={[width, height]} />
          {painting.image ? <ArtMaterial src={painting.image} glow={glowRef} /> : <meshBasicMaterial color="#d9d1c5" />}
        </mesh>
      </Frame>

      {/* sold dot */}
      {sold && (
        <mesh position={[fw / 2 + 0.12, -fh / 2 + 0.05, 0.004]}>
          <circleGeometry args={[0.045, 24]} />
          <meshBasicMaterial color="#d0204f" />
        </mesh>
      )}
      {/* plaque */}
      <mesh position={[fw / 2 + 0.5, -fh / 2 + 0.12, 0.006]}>
        <planeGeometry args={[0.7, 0.12]} />
        <meshBasicMaterial map={plaque} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Unlit so the colours stay true; brightens a touch as the spotlight comes up. */
function ArtMaterial({ src, glow }: { src: string; glow: RefObject<number> }) {
  const tex = useTexture(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.color.setScalar(0.92 + glow.current * 0.08);
  });
  return <meshBasicMaterial ref={mat} map={tex} toneMapped={false} />;
}

/* ------------------------------------------------------------------ controls */

function Controls({ nav: navRef, paused, length, onFirstMove, room }: SceneProps & { length: number }) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const half = ROOM_WIDTH / 2;
  const stride = useRef({ x: 0, z: 0, d: 0 });
  const surface = ["oak", "herringbone", "walnut"].includes(room.floorStyle) ? "wood" : "hard";

  // wider lens on portrait screens so phones still see both walls
  useEffect(() => {
    const cam = get().camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    cam.fov = aspect < 0.8 ? 88 : aspect < 1.2 ? 74 : 62;
    cam.updateProjectionMatrix();
  }, [get, size]);

  // spawn at the entrance whenever the room changes
  useEffect(() => {
    const nav = navRef.current;
    get().camera.position.set(0, EYE_HEIGHT, -2.2);
    nav.yaw = 0;
    nav.pitch = 0;
    nav.walkTarget = null;
    nav.focus = null;
  }, [room.id, get, navRef]);

  // drag to look, wheel to move, keys to walk
  useEffect(() => {
    const { gl } = get();
    const el = gl.domElement;
    const nav = navRef.current;
    const drag = { last: null as { x: number; y: number } | null, travelled: 0 };
    const firstMove = () => { if (!nav.moved) { nav.moved = true; onFirstMove(); } };

    const down = (e: PointerEvent) => { drag.last = { x: e.clientX, y: e.clientY }; drag.travelled = 0; };
    const move = (e: PointerEvent) => {
      if (!drag.last || paused) return;
      const dx = e.clientX - drag.last.x, dy = e.clientY - drag.last.y;
      drag.travelled += Math.abs(dx) + Math.abs(dy);
      drag.last = { x: e.clientX, y: e.clientY };
      if (drag.travelled < CLICK_TOLERANCE) return;
      const speed = e.pointerType === "touch" ? 0.006 : 0.0035;
      nav.yaw += dx * speed;
      nav.pitch = THREE.MathUtils.clamp(nav.pitch + dy * speed * 0.8, -0.6, 0.6);
      nav.focus = null;
      firstMove();
    };
    const up = () => { drag.last = null; };
    const wheel = (e: WheelEvent) => {
      if (paused) return;
      e.preventDefault();
      const step = THREE.MathUtils.clamp(-e.deltaY * 0.004, -0.8, 0.8);
      const fwd = new THREE.Vector3(-Math.sin(nav.yaw), 0, -Math.cos(nav.yaw)).multiplyScalar(step);
      nav.walkTarget = (nav.walkTarget ?? get().camera.position.clone()).add(fwd);
      nav.focus = null;
      firstMove();
    };
    const keyDown = (e: KeyboardEvent) => {
      if (paused || (e.target as HTMLElement)?.closest?.("input,textarea,select")) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
        nav.keys.add(k);
        nav.walkTarget = null;
        nav.focus = null;
        firstMove();
      }
    };
    const keyUp = (e: KeyboardEvent) => nav.keys.delete(e.key.toLowerCase());
    const blur = () => nav.keys.clear();

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", blur);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", blur);
    };
  }, [get, navRef, paused, onFirstMove]);

  useFrame((state, delta) => {
    const nav = navRef.current;
    const dt = Math.min(delta, 0.05);
    const pos = state.camera.position;

    if (nav.focus) {
      pos.lerp(nav.focus.position, 1 - Math.pow(0.02, dt));
      nav.yaw = lerpAngle(nav.yaw, nav.focus.yaw, 1 - Math.pow(0.02, dt));
      nav.pitch = THREE.MathUtils.lerp(nav.pitch, 0, 1 - Math.pow(0.02, dt));
    } else if (!paused) {
      const k = nav.keys;
      const f = (k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0);
      const turn = (k.has("arrowleft") ? 1 : 0) - (k.has("arrowright") ? 1 : 0);
      const strafe = (k.has("d") ? 1 : 0) - (k.has("a") ? 1 : 0);
      nav.yaw += turn * 1.6 * dt;
      if (f || strafe) {
        const speed = 3.2 * dt;
        pos.x += (-Math.sin(nav.yaw) * f + Math.cos(nav.yaw) * strafe) * speed;
        pos.z += (-Math.cos(nav.yaw) * f - Math.sin(nav.yaw) * strafe) * speed;
      } else if (nav.walkTarget) {
        pos.lerp(nav.walkTarget, 1 - Math.pow(0.05, dt));
        if (pos.distanceTo(nav.walkTarget) < 0.05) nav.walkTarget = null;
      }
    }

    // stay inside the room
    pos.x = THREE.MathUtils.clamp(pos.x, -half + 0.7, half - 0.7);
    pos.z = THREE.MathUtils.clamp(pos.z, -length + 0.7, -0.7);
    pos.y = EYE_HEIGHT;

    state.camera.rotation.set(-nav.pitch, nav.yaw, 0, "YXZ");

    // footsteps every ~75cm walked
    const st = stride.current;
    st.d += Math.hypot(pos.x - st.x, pos.z - st.z);
    st.x = pos.x;
    st.z = pos.z;
    if (st.d > 0.75) {
      if (st.d < 3) sfx.play("step", surface);
      st.d = 0;
    }
  });

  return null;
}

function lerpAngle(a: number, b: number, t: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
