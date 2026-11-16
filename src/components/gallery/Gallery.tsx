"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { Painting, Room } from "@/lib/painting";
import { Scene, createNav } from "./Scene";
import type { Hung } from "./layout";
import { PaintingPanel } from "./PaintingPanel";

export function Gallery({ rooms }: { rooms: Room[] }) {
  const nav = useRef(createNav());
  const [entered, setEntered] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [selected, setSelected] = useState<Painting | null>(null);
  const [hovered, setHovered] = useState<Painting | null>(null);
  const [showHint, setShowHint] = useState(true);

  // Enter: honour deep links like /gallery?room=slug
  const enter = useCallback(() => {
    const i = rooms.findIndex((r) => r.slug === new URLSearchParams(location.search).get("room"));
    if (i >= 0) setRoomIndex(i);
    setEntered(true);
  }, [rooms]);

  const room = rooms[roomIndex];

  const goToRoom = useCallback(
    (i: number) => {
      if (i === roomIndex || i < 0 || i >= rooms.length) return;
      setSelected(null);
      setFading(true);
      setTimeout(() => {
        setRoomIndex(i);
        history.replaceState(null, "", `?room=${rooms[i].slug}`);
        setTimeout(() => setFading(false), 120);
      }, 450);
    },
    [roomIndex, rooms],
  );

  const onSelect = useCallback(
    (p: Painting, hung: Hung) => {
      nav.current.focus = { position: new THREE.Vector3(...hung.viewPosition), yaw: hung.viewYaw };
      nav.current.walkTarget = null;
      setSelected(p);
    },
    [nav],
  );

  const walkTo = useCallback((to: THREE.Vector3) => {
    nav.current.walkTarget = to;
    nav.current.focus = null;
  }, []);

  const closePanel = useCallback(() => {
    nav.current.focus = null;
    setSelected(null);
  }, [nav]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePanel]);

  if (!room) {
    return <div className="grid h-dvh place-items-center bg-ink text-cream">The gallery is being hung. Come back soon.</div>;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink text-cream select-none">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 62, near: 0.05, far: 60, position: [0, 1.65, -2.2] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ touchAction: "none" }}
      >
        <Scene
          room={room}
          prevRoom={rooms[roomIndex - 1] ?? null}
          nextRoom={rooms[roomIndex + 1] ?? null}
          nav={nav}
          paused={!entered}
          selectedSlug={selected?.slug ?? null}
          onSelect={onSelect}
          onHover={setHovered}
          onDoor={(d) => goToRoom(roomIndex + d)}
          onFirstMove={() => setShowHint(false)}
          onWalk={walkTo}
        />
      </Canvas>

      {/* room-change fade */}
      <div className={`pointer-events-none absolute inset-0 bg-ink transition-opacity duration-500 ${fading ? "opacity-100" : "opacity-0"}`} />

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
        <Link href="/" className="pointer-events-auto font-serif text-2xl font-light tracking-tight">
          Jane Bee
        </Link>
        <RoomMap rooms={rooms} current={roomIndex} onPick={goToRoom} />
      </div>

      {/* hover glimpse — "come closer" */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-24 text-center transition-opacity duration-300 ${hovered && !selected ? "opacity-100" : "opacity-0"}`}
      >
        <p className="font-serif text-xl font-light italic md:text-2xl">{hovered?.glimpse ?? ""}</p>
        <p className="mt-1 text-xs tracking-[0.2em] uppercase opacity-70">{hovered?.title ?? ""} · Click to come closer</p>
      </div>

      {/* bottom bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-xs tracking-[0.15em] uppercase md:p-7">
        <span className="opacity-70">
          Room {roomIndex + 1} / {rooms.length} · {room.paintings.length} works
        </span>
        <span className={`hidden transition-opacity duration-700 md:block ${showHint && entered ? "opacity-80" : "opacity-0"}`}>
          W A S D / arrows to walk · drag to look · click a work
        </span>
        <span className={`md:hidden transition-opacity duration-700 ${showHint && entered ? "opacity-80" : "opacity-0"}`}>
          Drag to look · tap floor to walk
        </span>
      </div>

      {selected && <PaintingPanel painting={selected} onClose={closePanel} />}

      {!entered && <EnterScreen onEnter={enter} />}
    </div>
  );
}

function RoomMap({ rooms, current, onPick }: { rooms: Room[]; current: number; onPick: (i: number) => void }) {
  return (
    <nav aria-label="Rooms" className="pointer-events-auto text-right">
      <ol className="space-y-1.5">
        {rooms.map((r, i) => (
          <li key={r.id}>
            <button
              onClick={() => onPick(i)}
              className={`group inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-opacity ${i === current ? "opacity-100" : "opacity-50 hover:opacity-90"}`}
            >
              <span>{r.name}</span>
              <span className={`inline-block h-2 w-2 rounded-full ${i === current ? "bg-honey" : "bg-cream/60"}`} />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function EnterScreen({ onEnter }: { onEnter: () => void }) {
  const { progress, active } = useProgress();
  const ready = !active || progress >= 100;
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (ready) btn.current?.focus(); }, [ready]);

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-ink/95 px-6 text-center">
      <div className="max-w-md">
        <p className="font-punk text-5xl text-pink -rotate-3">Come closer</p>
        <p className="mt-6 font-serif text-lg leading-relaxed font-light text-cream/90">
          Every piece holds a memory. Walk the rooms, lean in, and find the story Bee-hind.
        </p>
        <button
          ref={btn}
          onClick={onEnter}
          disabled={!ready}
          className="mt-10 border-b border-cream pb-1 text-sm tracking-[0.3em] uppercase transition-colors hover:border-honey hover:text-honey disabled:opacity-40"
        >
          {ready ? "Enter" : `Hanging the work… ${Math.round(progress)}%`}
        </button>
        <p className="mt-8 hidden text-xs leading-relaxed text-cream/60 pointer-coarse:block">
          Drag to look around · tap the floor to walk · tap a work to come closer
        </p>
        <p className="mt-8 text-xs leading-relaxed text-cream/60 pointer-coarse:hidden">
          W A S D or arrow keys to walk · drag to look · scroll to move · click a work to come closer
        </p>
      </div>
    </div>
  );
}
