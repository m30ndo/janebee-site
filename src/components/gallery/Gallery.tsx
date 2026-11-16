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
import { sfx } from "@/lib/sound";
import { ControlsBar } from "./ControlsBar";
import { StylePicker, type RoomLook } from "./StylePicker";
import { MusicBarItem, MusicTracks } from "@/components/MusicPlayer";
import type { Track } from "@/lib/painting";

/**
 * The walk-through gallery. `app` mode runs inside the members app: no site
 * header, HUD lifted above the app's tab bar, links stay inside the app.
 */
const noop = () => {};

export function Gallery({ rooms, app = false, isAdmin = false, tracks }: { rooms: Room[]; app?: boolean; isAdmin?: boolean; tracks?: Track[] }) {
  const base = app ? "/members" : "";
  const tabBar = app ? 64 : 0;
  const nav = useRef(createNav());
  const [entered, setEntered] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [selected, setSelected] = useState<Painting | null>(null);
  const [hovered, setHovered] = useState<Painting | null>(null);

  // Enter: honour deep links like /gallery?room=slug
  const enter = useCallback(() => {
    const i = rooms.findIndex((r) => r.slug === new URLSearchParams(location.search).get("room"));
    if (i >= 0) setRoomIndex(i);
    sfx.unlock();
    sfx.play("open");
    setEntered(true);
  }, [rooms]);

  // looks being tried in the Style picker, per room (only for this visitor until an admin saves)
  const [lookOverride, setLookOverride] = useState<Record<string, Partial<RoomLook>>>({});
  const baseRoom = rooms[roomIndex];
  const preview = baseRoom ? lookOverride[baseRoom.id] : undefined;
  const room = baseRoom && preview ? { ...baseRoom, ...preview } : baseRoom;

  const goToRoom = useCallback(
    (i: number) => {
      if (i === roomIndex || i < 0 || i >= rooms.length) return;
      setSelected(null);
      sfx.play("door");
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
      sfx.play("click");
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
          frameOverride={preview?.frameStyle ?? null}
          prevRoom={rooms[roomIndex - 1] ?? null}
          nextRoom={rooms[roomIndex + 1] ?? null}
          nav={nav}
          paused={!entered}
          selectedSlug={selected?.slug ?? null}
          onSelect={onSelect}
          onHover={setHovered}
          onDoor={(d) => goToRoom(roomIndex + d)}
          onFirstMove={noop}
          onWalk={walkTo}
        />
      </Canvas>

      {/* room-change fade */}
      <div className={`pointer-events-none absolute inset-0 bg-ink transition-opacity duration-500 ${fading ? "opacity-100" : "opacity-0"}`} />

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
        <Link href={app ? "/members" : "/"} className="pointer-events-auto font-serif text-2xl font-light tracking-tight transition-colors hover:text-honey">
          {app ? <>The <span className="text-honey">Hive</span></> : "Jane Bee"}
        </Link>
        <RoomMap rooms={rooms} current={roomIndex} onPick={goToRoom} />
      </div>

      {/* hover glimpse — "come closer" */}
      <div
        style={{ bottom: tabBar + 110 }}
        className={`pointer-events-none absolute inset-x-0 text-center transition-all duration-500 ${hovered && !selected ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        <p className="font-serif text-xl font-light italic md:text-2xl">{hovered?.glimpse ?? ""}</p>
        <p className="mt-1 text-xs tracking-[0.2em] uppercase opacity-70">{hovered?.title ?? ""} · Click to come closer</p>
      </div>

      {/* room counter */}
      <span className="pointer-events-none absolute top-16 left-5 text-[11px] tracking-[0.18em] uppercase opacity-60 md:top-[4.5rem] md:left-7">
        Room {roomIndex + 1} / {rooms.length} · {room.paintings.length} works
      </span>

      {entered && !selected && (
        <ControlsBar
          bottomOffset={tabBar}
          extra={
            <>
              <StylePicker
                key={room.id}
                roomId={room.id}
                saved={lookOf(baseRoom)}
                current={lookOf(room)}
                canSave={isAdmin}
                onPreview={(l) => setLookOverride((o) => ({ ...o, [room.id]: { ...o[room.id], ...l } }))}
              />
              <MusicBarItem isAdmin={isAdmin} />
            </>
          }
        />
      )}

      {selected && <PaintingPanel painting={selected} onClose={closePanel} base={base} bottomOffset={tabBar} />}

      {tracks && <MusicTracks tracks={tracks} />}
      {!entered && <EnterScreen onEnter={enter} />}
    </div>
  );
}

const lookOf = (r: Room): RoomLook => ({ floorStyle: r.floorStyle, wallStyle: r.wallStyle, wallColour: r.wallColour, frameStyle: r.frameStyle });

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
