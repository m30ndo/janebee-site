"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { Painting, Room } from "@/lib/painting";
import { Scene, createNav } from "./Scene";
import { hangRoom, type Hung } from "./layout";
import { PaintingPanel } from "./PaintingPanel";
import { sfx } from "@/lib/sound";
import { ControlsBar } from "./ControlsBar";
import { StylePicker, StylePanel, type RoomLook } from "./StylePicker";
import {
  BottomSheet, HelpBody, MobileDock, MobileTip, MusicSheetBody, RoomsList, TourBar, useIsPhone, useTip, type Sheet,
} from "./Mobile";
import { MusicBarItem, MusicTracks } from "@/components/MusicPlayer";
import { TAB_BAR_HEIGHT, useTabBarHidden } from "@/lib/tabbar";
import type { Track } from "@/lib/painting";

/**
 * The walk-through gallery. `app` mode runs inside the members app: no site
 * header, HUD lifted above the app's tab bar, links stay inside the app.
 */
const noop = () => {};

export function Gallery({ rooms, app = false, isAdmin = false, tracks }: { rooms: Room[]; app?: boolean; isAdmin?: boolean; tracks?: Track[] }) {
  const base = app ? "/members" : "";
  const menuHidden = useTabBarHidden();
  // the menu's slide handle stays on screen when the menu is tucked away
  const tabBar = app ? (menuHidden ? 28 : TAB_BAR_HEIGHT) : 0;
  const nav = useRef(createNav());
  const [entered, setEntered] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [selected, setSelected] = useState<Painting | null>(null);
  const [hovered, setHovered] = useState<Painting | null>(null);
  const phone = useIsPhone();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tour, setTour] = useState(-1); // which work the phone tour is on (-1 = not started)
  const tip = useTip();

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
      setSheet(null);
      setTour(-1);
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

  // phone: glide painting to painting
  const hung = useMemo(() => (baseRoom ? hangRoom(baseRoom) : []), [baseRoom]);
  const step = useCallback(
    (d: 1 | -1) => {
      if (!hung.length) return;
      const i = tour < 0 ? (d === 1 ? 0 : hung.length - 1) : (tour + d + hung.length) % hung.length;
      const h = hung[i];
      // stand as close as the screen allows, so the work fills a phone screen
      const aspect = window.innerWidth / window.innerHeight;
      const vfov = THREE.MathUtils.degToRad(aspect < 0.8 ? 88 : aspect < 1.2 ? 74 : 62);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      const dist = THREE.MathUtils.clamp((h.width + 0.7) / (2 * Math.tan(hfov / 2)), 1.4, 2.9);
      const wallX = h.position[0];
      const pos = new THREE.Vector3(wallX - Math.sign(wallX) * dist, h.viewPosition[1], h.viewPosition[2]);
      nav.current.focus = { position: pos, yaw: h.viewYaw };
      nav.current.walkTarget = null;
      sfx.play("step", "hard");
      setTour(i);
      setSelected((cur) => (cur ? h.painting : cur)); // swiping with the story open moves the story on too
      tip.dismiss();
    },
    [hung, tour, tip],
  );
  const onFlick = useCallback((d: 1 | -1) => step(d), [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePanel]);

  if (!room) {
    return <div className="grid h-dvh place-items-center bg-ink text-cream">The gallery is being hung. Come back soon.</div>;
  }

  return (
    <div className="hive-app fixed inset-0 overflow-hidden bg-ink text-cream select-none">
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
          onFlick={phone ? onFlick : undefined}
        />
      </Canvas>

      {/* room-change fade */}
      <div className={`pointer-events-none absolute inset-0 bg-ink transition-opacity duration-500 ${fading ? "opacity-100" : "opacity-0"}`} />

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
        <Link href={app ? "/members" : "/"} className="pointer-events-auto font-serif text-2xl font-light tracking-tight transition-colors hover:text-honey">
          {app ? <>The <span className="text-honey">Hive</span></> : "Jane Bee"}
        </Link>
        {phone ? (
          <button onClick={() => setSheet("rooms")} className="pointer-events-auto max-w-[55vw] text-right">
            <span className="block text-[10px] tracking-[0.2em] text-honey uppercase">Room {roomIndex + 1} of {rooms.length}</span>
            <span className="block truncate font-serif text-lg">{room.name} ▾</span>
          </button>
        ) : (
          <RoomMap rooms={rooms} current={roomIndex} onPick={goToRoom} />
        )}
      </div>

      {/* hover glimpse (desktop) */}
      {!phone && <div
        style={{ bottom: tabBar + 110 }}
        className={`pointer-events-none absolute inset-x-0 text-center transition-all duration-500 ${hovered && !selected ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        <p className="font-serif text-xl font-light italic md:text-2xl">{hovered?.glimpse ?? ""}</p>
        <p className="mt-1 text-xs tracking-[0.2em] uppercase opacity-70">{hovered?.title ?? ""}</p>
      </div>}

      {/* room counter */}
      {!phone && <span className="pointer-events-none absolute top-16 left-5 text-[11px] tracking-[0.18em] uppercase opacity-60 md:top-[4.5rem] md:left-7">
        Room {roomIndex + 1} / {rooms.length} · {room.paintings.length} works
      </span>}

      {entered && !selected && phone && (
        <>
          <TourBar
            bottom={tabBar}
            painting={tour >= 0 ? hung[tour]?.painting ?? null : null}
            index={tour}
            total={hung.length}
            onStep={step}
            onOpen={() => { const h = hung[tour]; if (h) onSelect(h.painting, h); }}
          />
          <MobileDock bottom={tabBar} open={sheet} onOpen={setSheet} homeHref={app ? "/members" : "/"} />
          {sheet === "rooms" && (
            <BottomSheet title="Rooms" bottom={tabBar} onClose={() => setSheet(null)}>
              <RoomsList rooms={rooms} current={roomIndex} onPick={(i) => { setSheet(null); goToRoom(i); }} />
            </BottomSheet>
          )}
          {sheet === "style" && (
            <BottomSheet title="Room style" bottom={tabBar} onClose={() => setSheet(null)}>
              <StylePanel
                key={room.id}
                roomId={room.id}
                saved={lookOf(baseRoom)}
                current={lookOf(room)}
                canSave={isAdmin}
                listClass="max-h-[38dvh]"
                onPreview={(l) => setLookOverride((o) => ({ ...o, [room.id]: { ...o[room.id], ...l } }))}
              />
            </BottomSheet>
          )}
          {sheet === "music" && (
            <BottomSheet title="Music" bottom={tabBar} onClose={() => setSheet(null)}>
              <MusicSheetBody isAdmin={isAdmin} />
            </BottomSheet>
          )}
          {sheet === "info" && (
            <BottomSheet title="Getting around" bottom={tabBar} onClose={() => setSheet(null)}>
              <HelpBody />
            </BottomSheet>
          )}
          {tip.show && <MobileTip onDismiss={tip.dismiss} />}
        </>
      )}

      {entered && !selected && !phone && (
        <ControlsBar
          homeHref={app ? "/members" : "/"}
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

const lookOf = (r: Room): RoomLook => ({ floorStyle: r.floorStyle, wallStyle: r.wallStyle, wallColour: r.wallColour, frameStyle: r.frameStyle, honeycomb: r.honeycomb });

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
        <button
          ref={btn}
          onClick={onEnter}
          disabled={!ready}
          className="btn-glass min-w-48 bg-honey px-10 py-4 text-sm font-medium tracking-[0.3em] text-black uppercase transition-opacity disabled:opacity-60"
        >
          {ready ? "Enter" : `${Math.round(progress)}%`}
        </button>
      </div>
    </div>
  );
}
