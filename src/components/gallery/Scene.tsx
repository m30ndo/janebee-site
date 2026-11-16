"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Painting, Room } from "@/lib/painting";
import { paintingNumber } from "@/lib/painting";
import { EYE_HEIGHT, ROOM_HEIGHT, ROOM_WIDTH, hangRoom, roomLength, type Hung } from "./layout";
import { getPoolTexture, makeTextTexture } from "./textures";

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
  prevRoom: Room | null;
  nextRoom: Room | null;
  nav: RefObject<Nav>;
  paused: boolean;
  selectedSlug: string | null;
  onSelect: (p: Painting, hung: Hung) => void;
  onHover: (p: Painting | null) => void;
  onDoor: (dir: -1 | 1) => void;
  onFirstMove: () => void;
  onWalk: (to: THREE.Vector3) => void;
};

export function Scene(props: SceneProps) {
  const { room } = props;
  const hung = useMemo(() => hangRoom(room), [room]);
  const length = roomLength(room.paintings.length);

  return (
    <>
      <color attach="background" args={["#0d0b0a"]} />
      <fog attach="fog" args={["#0d0b0a", 14, 40]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff6ea", "#2b1a12", 0.6]} />
      <directionalLight position={[2, 6, 3]} intensity={0.35} />

      <Shell room={room} length={length} prevRoom={props.prevRoom} nextRoom={props.nextRoom} onDoor={props.onDoor} onWalk={props.onWalk} />

      <Suspense fallback={null}>
        {hung.map((h) => (
          <Artwork
            key={h.painting.id}
            hung={h}
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

/* ------------------------------------------------------------------ room shell */

function Shell({ room, length, prevRoom, nextRoom, onDoor, onWalk }: {
  room: Room; length: number; prevRoom: Room | null; nextRoom: Room | null; onWalk: (to: THREE.Vector3) => void; onDoor: (d: -1 | 1) => void;
}) {
  const half = ROOM_WIDTH / 2;
  const wall = room.wallColour;

  const onFloorClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_TOLERANCE) return;
    e.stopPropagation();
    onWalk(new THREE.Vector3(e.point.x, EYE_HEIGHT, e.point.z));
  };

  const title = useMemo(
    () =>
      makeTextTexture(
        [
          { text: room.name, size: 64, family: "serif", weight: 300, color: "#2b1a12" },
          ...(room.intro ? [{ text: room.intro, size: 22, color: "#5c4a40" }] : []),
        ],
        { width: 1200, height: 180, align: "center" },
      ),
    [room.name, room.intro],
  );

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -length / 2]} onClick={onFloorClick}>
        <planeGeometry args={[ROOM_WIDTH, length]} />
        <meshStandardMaterial color="#3a332e" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM_HEIGHT, -length / 2]}>
        <planeGeometry args={[ROOM_WIDTH, length]} />
        <meshStandardMaterial color="#5a544e" roughness={1} />
      </mesh>
      {/* left / right walls */}
      <mesh rotation-y={Math.PI / 2} position={[-half, ROOM_HEIGHT / 2, -length / 2]}>
        <planeGeometry args={[length, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <mesh rotation-y={-Math.PI / 2} position={[half, ROOM_HEIGHT / 2, -length / 2]}>
        <planeGeometry args={[length, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      {/* far + entrance walls */}
      <mesh position={[0, ROOM_HEIGHT / 2, -length]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <mesh rotation-y={Math.PI} position={[0, ROOM_HEIGHT / 2, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>

      {/* room title on the far wall */}
      <mesh position={[0, 3.6, -length + 0.02]}>
        <planeGeometry args={[8, 1.2]} />
        <meshBasicMaterial map={title} transparent toneMapped={false} />
      </mesh>

      {nextRoom && <Door label={`Next room  ·  ${nextRoom.name}`} position={[0, 0, -length + 0.03]} rotationY={0} onClick={() => onDoor(1)} />}
      {prevRoom && <Door label={`Back  ·  ${prevRoom.name}`} position={[0, 0, -0.03]} rotationY={Math.PI} onClick={() => onDoor(-1)} />}
    </group>
  );
}

function Door({ label, position, rotationY, onClick }: {
  label: string; position: [number, number, number]; rotationY: number; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const tex = useMemo(
    () => makeTextTexture([{ text: label, size: 30, weight: 500, color: "#2b1a12" }], { width: 600, height: 64, align: "center", padding: 14 }),
    [label],
  );
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh
        position={[0, 1.4, 0]}
        onClick={(e) => { if (e.delta <= CLICK_TOLERANCE) { e.stopPropagation(); onClick(); } }}
        onPointerOver={() => { setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      >
        <planeGeometry args={[1.8, 2.8]} />
        <meshBasicMaterial color={hover ? "#e3a21a" : "#120f0d"} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.05, 0.01]}>
        <planeGeometry args={[3.6, 0.38]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ artworks */

function Artwork({ hung, selected, onSelect, onHover }: {
  hung: Hung; selected: boolean; onSelect: (p: Painting, h: Hung) => void; onHover: (p: Painting | null) => void;
}) {
  const { painting, position, rotationY, width, height } = hung;
  const [hover, setHover] = useState(false);
  const frame = 0.06;
  const sold = painting.status === "sold";

  const plaque = useMemo(
    () =>
      makeTextTexture(
        [
          { text: `${paintingNumber(painting.number)}  ${painting.title}`, size: 22, weight: 500 },
          { text: sold ? "Sold — the story stays" : painting.medium ?? "", size: 16, color: sold ? "#b0234f" : "#6b5a50" },
        ],
        { width: 420, height: 72, background: "#faf3e8", padding: 12 },
      ),
    [painting.number, painting.title, painting.medium, sold],
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_TOLERANCE) return;
    e.stopPropagation();
    onSelect(painting, hung);
  };

  return (
    <group position={position} rotation-y={rotationY}>
      {/* spotlight pool on the wall */}
      <mesh position={[0, 0.35, 0.005]}>
        <planeGeometry args={[Math.max(2.6, width + 1.4), height + 2.2]} />
        <meshBasicMaterial map={getPoolTexture()} transparent opacity={selected || hover ? 0.85 : 0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* frame */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[width + frame * 2, height + frame * 2, 0.05]} />
        <meshStandardMaterial color="#141110" roughness={0.4} />
      </mesh>
      {/* the work */}
      <mesh
        position={[0, 0, 0.058]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); onHover(painting); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); onHover(null); document.body.style.cursor = ""; }}
      >
        <planeGeometry args={[width, height]} />
        {painting.image ? <ArtMaterial src={painting.image} /> : <meshBasicMaterial color="#d9d1c5" />}
      </mesh>
      {/* sold dot */}
      {sold && (
        <mesh position={[width / 2 + 0.16, -height / 2 + 0.05, 0.03]}>
          <circleGeometry args={[0.045, 24]} />
          <meshBasicMaterial color="#d0204f" />
        </mesh>
      )}
      {/* plaque */}
      <mesh position={[width / 2 + 0.55, -height / 2 + 0.12, 0.012]}>
        <planeGeometry args={[0.7, 0.12]} />
        <meshBasicMaterial map={plaque} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ArtMaterial({ src }: { src: string }) {
  const tex = useTexture(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  return <meshBasicMaterial map={tex} toneMapped={false} />;
}

/* ------------------------------------------------------------------ controls */

function Controls({ nav: navRef, paused, length, nextRoom, prevRoom, onDoor, onFirstMove, room }: SceneProps & { length: number }) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const half = ROOM_WIDTH / 2;
  const doorCooldown = useRef(0);

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
    doorCooldown.current = 1.2;
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

    // walk through a doorway
    doorCooldown.current = Math.max(0, doorCooldown.current - dt);
    if (!doorCooldown.current && Math.abs(pos.x) < 1) {
      if (nextRoom && pos.z < -length + 1.0) { doorCooldown.current = 1.5; onDoor(1); }
      else if (prevRoom && pos.z > -1.0 && nav.moved) { doorCooldown.current = 1.5; onDoor(-1); }
    }
  });

  return null;
}

function lerpAngle(a: number, b: number, t: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
